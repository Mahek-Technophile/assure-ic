import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { DefaultAzureCredential } from "@azure/identity";
import { BlobServiceClient, BlobSASPermissions, generateBlobSASQueryParameters, SASProtocol } from "@azure/storage-blob";
import { v4 as uuidv4 } from "uuid";
import { CosmosClient } from "@azure/cosmos";

// NOTE: This function runs using the Function App's Managed Identity.
// Environment variables that must be set (in Function App configuration):
// - BLOB_ACCOUNT_URL (e.g. https://<account>.blob.core.windows.net)
// - BLOB_CONTAINER (e.g. kyc-documents)
// - COSMOS_ENDPOINT
// - COSMOS_DATABASE
// - COSMOS_CONTAINER

const credential = new DefaultAzureCredential();
const storageAccountUrl = process.env.BLOB_ACCOUNT_URL || "";
const containerName = process.env.BLOB_CONTAINER || "kyc-documents";
const cosmosEndpoint = process.env.COSMOS_ENDPOINT || "";
const cosmosDatabase = process.env.COSMOS_DATABASE || "kyc-db";
const cosmosContainer = process.env.COSMOS_CONTAINER || "kyc-requests";

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
  context.log("/api/kyc/start invoked");

  if (req.method !== "POST") {
    context.res = { status: 405, body: { error: "Method not allowed" } };
    return;
  }

  const body = req.body || {};
  const userId = (body.userId as string) || (req.headers["x-user-id"] as string) || null;
  const idType = (body.idType as string) || "passport";

  if (!userId) {
    context.res = { status: 400, body: { error: "userId is required" } };
    return;
  }

  const kycId = uuidv4();
  const createdAt = new Date().toISOString();

  const kycRequest = {
    kycId,
    userId,
    status: "IN_PROGRESS",
    riskLevel: "LOW",
    createdAt
  };

  // Persist initial KYC request to Cosmos DB (uses AAD via Managed Identity)
  try {
    if (!cosmosEndpoint) {
      context.log.warn("COSMOS_ENDPOINT not configured; skipping persistence (dev mode). If running in production, set COSMOS_ENDPOINT and grant Function Managed Identity access to Cosmos DB with RBAC.");
    } else {
      const cosmos = new CosmosClient({ endpoint: cosmosEndpoint, aadCredentials: credential as any });
      const database = cosmos.database(cosmosDatabase);
      const container = database.container(cosmosContainer);
      await container.items.create(kycRequest);
      context.log("KYC request persisted to Cosmos DB", kycId);
    }
  } catch (err) {
    context.log.error("Error persisting to Cosmos:", err);
    // Do not fail the request; we still return an upload URL so the client can proceed.
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
