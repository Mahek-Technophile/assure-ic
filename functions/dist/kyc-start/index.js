"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const identity_1 = require("@azure/identity");
const storage_blob_1 = require("@azure/storage-blob");
const uuid_1 = require("uuid");
const sql_1 = require("../services/sql");
// NOTE: This function runs using the Function App's Managed Identity.
// Environment variables that must be set (in Function App configuration):
// - BLOB_ACCOUNT_URL (e.g. https://<account>.blob.core.windows.net)
// - BLOB_CONTAINER (e.g. kyc-documents)
// - SQL_CONNECTION_STRING (connection string for Azure SQL)
const credential = new identity_1.DefaultAzureCredential();
const storageAccountUrl = process.env.BLOB_ACCOUNT_URL || "";
const containerName = process.env.BLOB_CONTAINER || "kyc-documents";
// use `SQL_CONNECTION_STRING` in Function App configuration to connect to Azure SQL
const httpTrigger = async function (context, req) {
    context.log("/api/kyc/start invoked");
    if (req.method !== "POST") {
        context.res = { status: 405, body: { error: "Method not allowed" } };
        return;
    }
    const body = req.body || {};
    const userId = body.userId || req.headers["x-user-id"] || null;
    const idType = body.idType || "passport";
    const fullName = body.fullName || null;
    const dob = body.dob || null; // expected ISO date YYYY-MM-DD
    // Basic validation
    if (!userId) {
        context.res = { status: 400, body: { error: "userId is required" } };
        return;
    }
    if (!fullName || typeof fullName !== "string" || fullName.trim().length === 0) {
        context.res = { status: 400, body: { error: "fullName is required" } };
        return;
    }
    if (!dob || isNaN(new Date(dob).getTime())) {
        context.res = { status: 400, body: { error: "dob is required and must be a valid date (YYYY-MM-DD)" } };
        return;
    }
    const kycId = (0, uuid_1.v4)();
    const createdAt = new Date().toISOString();
    const kycRequest = {
        kycId,
        userId,
        fullName: fullName ? fullName.trim() : null,
        dob: dob,
        idType,
        status: "CREATED",
        riskLevel: "LOW",
        createdAt
    };
    // Persist initial KYC request to Azure SQL (best-effort; do not block upload URL)
    try {
        await (0, sql_1.createKycRequest)({ id: kycId, ...kycRequest });
        // record lifecycle transition: null -> CREATED
        try {
            await (0, sql_1.recordStateTransition)(kycId, null, "CREATED", userId);
        }
        catch (e) {
            context.log.warn("failed to record state transition:", e);
        }
        context.log("KYC request persisted to Azure SQL", kycId);
    }
    catch (err) {
        context.log.error("Error persisting to Azure SQL:", err);
        // non-fatal — continue to return upload URL
    }
    // Generate a user-delegation SAS for direct browser upload (short lived)
    try {
        if (!storageAccountUrl) {
            throw new Error("BLOB_ACCOUNT_URL not configured");
        }
        const blobService = new storage_blob_1.BlobServiceClient(storageAccountUrl, credential);
        const now = new Date();
        const expiresOn = new Date(now.getTime() + 15 * 60 * 1000); // 15 minutes
        // user delegation key
        const userDelegationKey = await blobService.getUserDelegationKey(now, expiresOn);
        // blob path: <kycId>/document-<timestamp>.jpg
        const blobName = `${kycId}/document-${Date.now()}.jpg`;
        // build SAS token
        const accountUrlParts = new URL(storageAccountUrl);
        const accountName = accountUrlParts.hostname.split(".")[0];
        const sasToken = (0, storage_blob_1.generateBlobSASQueryParameters)({
            containerName,
            blobName,
            permissions: storage_blob_1.BlobSASPermissions.parse("cw"), // create + write
            startsOn: now,
            expiresOn,
            protocol: storage_blob_1.SASProtocol.Https
        }, userDelegationKey, accountName).toString();
        const uploadUrl = `${storageAccountUrl}/${containerName}/${blobName}?${sasToken}`;
        context.res = {
            status: 200,
            body: {
                kycId,
                uploadUrl,
                expiresIn: 15 * 60,
                message: "Upload URL (user-delegation SAS, 15m)"
            }
        };
        return;
    }
    catch (err) {
        context.log.error("Error generating upload URL:", err);
        context.res = { status: 500, body: { error: "failed to create upload URL" } };
        return;
    }
};
exports.default = httpTrigger;
