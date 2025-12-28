"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const storage_1 = require("../services/storage");
const documentIntelligence_1 = require("../services/documentIntelligence");
const sql_1 = require("../services/sql");
const httpTrigger = async function (context, req) {
    context.log("/api/kyc/upload-document invoked");
    if (req.method !== "POST") {
        context.res = { status: 405, body: { error: "Method not allowed" } };
        return;
    }
    const body = req.body || {};
    const kycId = body.kycId;
    const blobUrl = body.blobUrl; // optional full URL including SAS or public URL
    const blobName = body.blobName; // optional blob path (container/blob)
    if (!kycId || (!blobUrl && !blobName)) {
        context.res = { status: 400, body: { error: "kycId and blobUrl or blobName are required" } };
        return;
    }
    try {
        // If caller provided a blobName (path within container), generate a read SAS URL
        let documentUrl = blobUrl;
        if (!documentUrl && blobName) {
            documentUrl = await (0, storage_1.generateUserDelegationSAS)(blobName, "r", 60);
        }
        if (!documentUrl)
            throw new Error("failed to determine document URL");
        context.log("Analyzing document at", documentUrl);
        // record transition: CREATED/DOCUMENT_UPLOADED
        try {
            await (0, sql_1.updateKycRequest)(kycId, { status: "DOCUMENT_UPLOADED" });
            await (0, sql_1.recordStateTransition)(kycId, "CREATED", "DOCUMENT_UPLOADED");
        }
        catch (e) {
            context.log.warn("failed to mark DOCUMENT_UPLOADED:", e);
        }
        const analysis = await (0, documentIntelligence_1.analyzeDocumentFromUrl)(documentUrl);
        // Save raw extraction JSON to Blob for immutability/audit.
        // Primary audit path will be: kyc-extractions/{kycId}/document-intel.json
        // The implementation deliberately avoids overwriting existing audit files; if the
        // primary path already exists the function will write to a timestamped file
        // (e.g. document-intel-<timestamp>.json). This ensures append-only, audit-grade storage.
        const extractionBlobUrl = await (0, storage_1.uploadExtractionJson)(kycId, analysis);
        // Persist extraction record to Azure SQL (immutable record)
        const rec = {
            kycId,
            rawDocumentJson: analysis,
            documentType: (analysis?.documentType || "unknown"),
            extractedAt: new Date().toISOString(),
            blobPath: extractionBlobUrl
        };
        await (0, sql_1.createExtractionRecord)(rec);
        // Mark as EXTRACTED (append-only extraction saved)
        try {
            await (0, sql_1.updateKycRequest)(kycId, { status: "EXTRACTED" });
            await (0, sql_1.recordStateTransition)(kycId, "DOCUMENT_UPLOADED", "EXTRACTED");
        }
        catch (e) {
            context.log.warn("failed to mark EXTRACTED:", e);
        }
        context.res = {
            status: 200,
            body: {
                message: "Document analyzed and stored",
                extractionBlobUrl,
                kycId
            }
        };
    }
    catch (err) {
        context.log.error(err);
        context.res = { status: 500, body: { error: err?.message || String(err) } };
    }
};
exports.default = httpTrigger;
