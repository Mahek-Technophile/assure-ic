import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { DefaultAzureCredential } from "@azure/identity";
import { BlobServiceClient, BlobSASPermissions, generateBlobSASQueryParameters, SASProtocol } from "@azure/storage-blob";
import { v4 as uuidv4 } from "uuid";
import { createKycRequest, recordStateTransition } from "../services/sql";

// NOTE: This function runs using the Function App's Managed Identity.
// Environment variables that must be set (in Function App configuration):
// - BLOB_ACCOUNT_URL (e.g. https://<account>.blob.core.windows.net)
// - BLOB_CONTAINER (e.g. kyc-documents)
// - SQL_CONNECTION_STRING (connection string for Azure SQL)

const credential = new DefaultAzureCredential();
const storageAccountUrl = process.env.BLOB_ACCOUNT_URL || "";
const containerName = process.env.BLOB_CONTAINER || "kyc-documents";
// use `SQL_CONNECTION_STRING` in Function App configuration to connect to Azure SQL

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
  context.log("/api/kyc/start invoked");

  if (req.method !== "POST") {
    context.res = { status: 405, body: { error: "Method not allowed" } };
    return;
  }

  const body = req.body || {};
  const userId = (body.userId as string) || (req.headers["x-user-id"] as string) || null;
  const idType = (body.idType as string) || "passport";
  const fullName = (body.fullName as string) || null;
  const dob = (body.dob as string) || null; // expected ISO date YYYY-MM-DD

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

  const kycId = uuidv4();
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
    await createKycRequest({ id: kycId, ...kycRequest } as any);
    // record lifecycle transition: null -> CREATED
    try { await recordStateTransition(kycId, null, "CREATED", userId); } catch (e) { context.log.warn("failed to record state transition:", e); }
    context.log("KYC request persisted to Azure SQL", kycId);
  } catch (err) {
    context.log.error("Error persisting to Azure SQL:", err);
    // non-fatal — continue to return upload URL
  }

  // Generate a user-delegation SAS for direct browser upload (short lived)
  try {
    if (!storageAccountUrl) {
      throw new Error("BLOB_ACCOUNT_URL not configured");
    }

    const blobService = new BlobServiceClient(storageAccountUrl, credential);

    const now = new Date();
    const expiresOn = new Date(now.getTime() + 15 * 60 * 1000); // 15 minutes

    // user delegation key
    const userDelegationKey = await blobService.getUserDelegationKey(now, expiresOn);

    // blob path: <kycId>/document-<timestamp>.jpg
    const blobName = `${kycId}/document-${Date.now()}.jpg`;

    // build SAS token
    const accountUrlParts = new URL(storageAccountUrl);
    const accountName = accountUrlParts.hostname.split(".")[0];

    const sasToken = generateBlobSASQueryParameters(
      {
        containerName,
        blobName,
        permissions: BlobSASPermissions.parse("cw"), // create + write
        startsOn: now,
        expiresOn,
        protocol: SASProtocol.Https
      },
      userDelegationKey,
      accountName
    ).toString();

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
  } catch (err) {
    context.log.error("Error generating upload URL:", err);
    context.res = { status: 500, body: { error: "failed to create upload URL" } };
    return;
  }
};

export default httpTrigger;
