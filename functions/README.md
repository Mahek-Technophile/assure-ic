Azure Functions - KYC (starter)

Overview
- This folder contains starter Azure Functions for the KYC flow. The `kyc-start` HTTP function creates a KYC request and returns a user-delegation SAS upload URL for clients to upload documents directly to Blob Storage.

Required Function App settings (set these in Azure Portal or with `az`):
- `BLOB_ACCOUNT_URL` (e.g. https://<account>.blob.core.windows.net)
- `BLOB_CONTAINER` (e.g. kyc-documents)
- `COSMOS_ENDPOINT` (e.g. https://<cosmos-account>.documents.azure.com:443/)
- `COSMOS_DATABASE`
- `COSMOS_CONTAINER`

Security
- Functions use DefaultAzureCredential which allows the Function App Managed Identity to authenticate to Azure services.
- Grant the Function App Managed Identity RBAC roles for Blob Storage (Storage Blob Data Contributor) and Cosmos DB (Cosmos DB Built-in Data Contributor or role with write permission).

Example request (frontend -> Function):
POST /api/kyc/start
{
  "userId": "user-123",
  "idType": "passport",
  "personalData": { "firstName":"Jane", "lastName":"Doe" }
}

Example response:
{
  "kycId": "...",
  "uploadUrl": "https://<account>.blob.core.windows.net/kyc-documents/...?...",
  "expiresIn": 900,
  "message": "Upload URL (user-delegation SAS, 15m)"
}

Next steps
- Implement `kyc-upload` endpoint to validate the upload, call Document Intelligence, and store raw extraction JSON in an immutable store.
- Implement `/api/kyc/analyze` to normalize fields and call Azure OpenAI for risk reasoning.
