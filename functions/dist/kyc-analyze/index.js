"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sql_1 = require("../services/sql");
const openai_1 = require("../services/openai");
const storage_1 = require("../services/storage");
const crypto_1 = __importDefault(require("crypto"));
// Helpers: recursively search object for candidate keys
function findFirst(obj, candidates) {
    if (!obj)
        return null;
    if (typeof obj !== "object")
        return null;
    for (const k of Object.keys(obj)) {
        const lk = k.toLowerCase();
        if (candidates.includes(lk))
            return obj[k];
        // sometimes Document Intelligence nests fields under 'fields' or 'documents'
        const val = obj[k];
        if (val && typeof val === "object") {
            const sub = findFirst(val, candidates);
            if (sub)
                return sub;
        }
    }
    return null;
}
function maskDocumentNumber(num) {
    if (!num)
        return null;
    const s = String(num).replace(/\s+/g, "");
    if (s.length <= 4)
        return "****";
    return "****" + s.slice(-4);
}
function hashValue(val) {
    if (!val)
        return null;
    return crypto_1.default.createHash("sha256").update(String(val)).digest("hex");
}
function computeAge(dobRaw) {
    if (!dobRaw)
        return null;
    const d = new Date(dobRaw);
    if (isNaN(d.getTime()))
        return null;
    const diff = Date.now() - d.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
}
const httpTrigger = async function (context, req) {
    context.log("/api/kyc/analyze invoked");
    if (req.method !== "POST") {
        context.res = { status: 405, body: { error: "Method not allowed" } };
        return;
    }
    const body = req.body || {};
    const kycId = body.kycId;
    if (!kycId) {
        context.res = { status: 400, body: { error: "kycId is required" } };
        return;
    }
    try {
        // Load extraction metadata from SQL
        const extraction = await (0, sql_1.getExtractionByKycId)(kycId);
        if (!extraction) {
            context.res = { status: 404, body: { error: "extraction not found" } };
            return;
        }
        // Ensure we fetch the authoritative raw extraction from Blob Storage (audit copy)
        const blobPath = extraction.blobPath || extraction?.blobPath || null;
        if (!blobPath) {
            context.log.warn("Extraction record missing blobPath; cannot fetch authoritative extraction from Blob Storage");
            context.res = { status: 500, body: { error: "extraction blobPath missing" } };
            return;
        }
        const service = (0, storage_1.getBlobServiceClient)();
        const accountUrl = process.env.BLOB_ACCOUNT_URL || "";
        const extractionsContainer = process.env.BLOB_EXTRACTIONS_CONTAINER || "kyc-extractions";
        // derive blobName by stripping account/container prefix
        let blobName = blobPath;
        const prefix = `${accountUrl}/${extractionsContainer}/`;
        if (blobPath.startsWith(prefix))
            blobName = blobPath.substring(prefix.length);
        const containerClient = service.getContainerClient(extractionsContainer);
        const block = containerClient.getBlockBlobClient(blobName);
        const buffer = await block.downloadToBuffer();
        const rawExtraction = JSON.parse(buffer.toString());
        // Normalize fields (derive de-identified structured fields for OpenAI)
        const candidatesName = ["fullname", "full_name", "name", "firstName".toLowerCase(), "lastname".toLowerCase()];
        const candidatesDob = ["dob", "dateofbirth", "birthdate", "birth_date"];
        const candidatesDocNum = ["documentnumber", "document_number", "idnumber", "id_number", "passportnumber", "passport_number", "passportno"];
        const candidatesDocType = ["documenttype", "document_type", "docType", "type"];
        const candidatesCountry = ["country", "issuingcountry", "issuer_country"];
        const fullNameRaw = findFirst(rawExtraction, candidatesName) || null;
        const dobRaw = findFirst(rawExtraction, candidatesDob) || null;
        const docNumRaw = findFirst(rawExtraction, candidatesDocNum) || null;
        const docTypeRaw = findFirst(rawExtraction, candidatesDocType) || rawExtraction.documentType || null;
        const issuerCountry = findFirst(rawExtraction, candidatesCountry) || null;
        const age = computeAge(dobRaw);
        const documentNumberMasked = maskDocumentNumber(docNumRaw);
        const documentNumberHash = hashValue(docNumRaw);
        // Build the structured, non-PII payload to send to OpenAI
        const structuredPayload = {
            age: age,
            documentType: docTypeRaw || null,
            documentNumberMasked: documentNumberMasked,
            documentNumberHash: documentNumberHash,
            issuerCountry: issuerCountry || null,
            // include any non-PII derived signals here (e.g., confidence metrics if available)
        };
        // Record transition: EXTRACTED -> ANALYZED (we are about to analyze)
        try {
            await (0, sql_1.recordStateTransition)(kycId, "EXTRACTED", "ANALYZED");
        }
        catch (e) {
            context.log.warn("failed to record ANALYZED transition:", e);
        }
        // Call OpenAI with ONLY the structured payload (JSON)
        const aiResult = await (0, openai_1.analyzeRiskWithOpenAI)(JSON.stringify(structuredPayload));
        const assessedAt = new Date().toISOString();
        const riskRec = {
            kycId,
            riskLevel: (aiResult.riskLevel || "MEDIUM").toUpperCase(),
            confidenceScore: Number(aiResult.confidenceScore) || 0,
            reasoning: aiResult.reasoning || (aiResult.explanation || JSON.stringify(aiResult)),
            modelVersion: aiResult.modelVersion || process.env.OPENAI_DEPLOYMENT || "unknown",
            assessedAt
        };
        await (0, sql_1.createRiskAssessment)(riskRec);
        // After analysis, update to ANALYZED and then to next state (APPROVED or PENDING_REVIEW)
        try {
            await (0, sql_1.updateKycRequest)(kycId, { riskLevel: riskRec.riskLevel, status: "ANALYZED" });
        }
        catch (e) {
            context.log.warn("failed to set ANALYZED status:", e);
        }
        const nextStatus = (riskRec.riskLevel === "LOW") ? "APPROVED" : "PENDING_REVIEW";
        try {
            await (0, sql_1.updateKycRequest)(kycId, { riskLevel: riskRec.riskLevel, status: nextStatus });
            await (0, sql_1.recordStateTransition)(kycId, "ANALYZED", nextStatus, null, `auto:${riskRec.riskLevel}`);
        }
        catch (e) {
            context.log.warn("failed to advance to final status:", e);
        }
        context.res = { status: 200, body: { message: "Risk assessment stored", kycId, riskRec } };
    }
    catch (err) {
        context.log.error(err);
        context.res = { status: 500, body: { error: err?.message || String(err) } };
    }
};
exports.default = httpTrigger;
