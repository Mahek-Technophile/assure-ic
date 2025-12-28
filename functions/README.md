Azure Functions - KYC (starter)

Overview
- This folder contains starter Azure Functions for the KYC flow. The `kyc-start` HTTP function creates a KYC request and returns a user-delegation SAS upload URL for clients to upload documents directly to Blob Storage.

Required Function App settings (set these in Azure Portal or with `az`):
- `BLOB_ACCOUNT_URL` (e.g. https://<account>.blob.core.windows.net)
- `BLOB_CONTAINER` (e.g. kyc-documents)
- `SQL_CONNECTION_STRING` (e.g. Server=tcp:<server>.database.windows.net,1433;Initial Catalog=<db>;Persist Security Info=False;User ID=<user>;Password=<password>;MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;)

Notes:
- If you prefer Azure AD authentication for Azure SQL, set `SQL_CONNECTION_STRING` accordingly (or use a connection string from Key Vault). This starter expects a valid connection string in the Function App configuration.

Security
- Functions use DefaultAzureCredential which allows the Function App Managed Identity to authenticate to Azure services.
- Grant the Function App Managed Identity RBAC roles for Blob Storage (Storage Blob Data Contributor). For Azure SQL, provide a connection string via `SQL_CONNECTION_STRING` or configure Managed Identity + Azure AD authentication for the database.

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
