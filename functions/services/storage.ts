import { BlobServiceClient, BlobSASPermissions, SASProtocol, generateBlobSASQueryParameters } from "@azure/storage-blob";
import { DefaultAzureCredential } from "@azure/identity";

const credential = new DefaultAzureCredential();
const accountUrl = process.env.BLOB_ACCOUNT_URL || "";
const containerName = process.env.BLOB_CONTAINER || "kyc-documents";
const extractionsContainer = process.env.BLOB_EXTRACTIONS_CONTAINER || "kyc-extractions";

if (!accountUrl) {
  // leave for runtime errors; functions will check
}

export function getBlobServiceClient() {
  if (!accountUrl) throw new Error("BLOB_ACCOUNT_URL not configured");
  return new BlobServiceClient(accountUrl, credential);
}

export async function generateUserDelegationSAS(blobName: string, permissions = "r", expiresInMinutes = 60) {
  const service = getBlobServiceClient();
  const now = new Date();
  const expiresOn = new Date(now.getTime() + expiresInMinutes * 60 * 1000);
  const userKey = await service.getUserDelegationKey(now, expiresOn);
  const accountName = new URL(accountUrl).hostname.split(".")[0];

  const sas = generateBlobSASQueryParameters(
    {
      containerName,
      blobName,
      permissions: BlobSASPermissions.parse(permissions),
      startsOn: now,
      expiresOn,
      protocol: SASProtocol.Https
    },
    userKey,
    accountName
  ).toString();

  return `${accountUrl}/${containerName}/${blobName}?${sas}`;
}

export async function uploadExtractionJson(kycId: string, json: any) {
  const service = getBlobServiceClient();
  const containerClient = service.getContainerClient(extractionsContainer);
  const jsonStr = JSON.stringify(json);

  // Primary audit path: deterministic, single file per KYC ID.
  // We must NOT overwrite this file once written — treat as append-only audit-grade data.
  const primaryBlobName = `${kycId}/document-intel.json`;
  const primaryBlock = containerClient.getBlockBlobClient(primaryBlobName);

  try {
    // Attempt to create the primary audit file only if it does NOT already exist.
    // Use conditional upload with If-None-Match="*" so the operation will fail if the blob exists.
    await primaryBlock.upload(jsonStr, Buffer.byteLength(jsonStr), {
      blobHTTPHeaders: { blobContentType: "application/json" },
      conditions: { ifNoneMatch: "*" }
    } as any);
    return `${accountUrl}/${extractionsContainer}/${primaryBlobName}`;
  } catch (err: any) {
    // If the primary path already exists (or conditional upload not supported in environment),
    // fall back to a timestamped, immutable file name to guarantee append-only behavior.
    const fallbackBlobName = `${kycId}/document-intel-${Date.now()}.json`;
    const fallbackBlock = containerClient.getBlockBlobClient(fallbackBlobName);
    await fallbackBlock.upload(jsonStr, Buffer.byteLength(jsonStr), {
      blobHTTPHeaders: { blobContentType: "application/json" }
    });
    return `${accountUrl}/${extractionsContainer}/${fallbackBlobName}`;
  }
}
