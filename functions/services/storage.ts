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
  const blobName = `${kycId}/extraction-${Date.now()}.json`;
  const block = containerClient.getBlockBlobClient(blobName);
  await block.upload(JSON.stringify(json), Buffer.byteLength(JSON.stringify(json)), {
    blobHTTPHeaders: { blobContentType: "application/json" }
  });
  return `${accountUrl}/${extractionsContainer}/${blobName}`;
}
