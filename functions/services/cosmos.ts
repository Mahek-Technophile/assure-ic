import { DefaultAzureCredential } from "@azure/identity";
import { CosmosClient } from "@azure/cosmos";
import type { KYC_Request, KYC_Document_Extraction } from "../models/kyc";

const credential = new DefaultAzureCredential();
const endpoint = process.env.COSMOS_ENDPOINT || "";
const databaseId = process.env.COSMOS_DATABASE || "kyc-db";
const requestContainerId = process.env.COSMOS_CONTAINER || "kyc-requests";
const extractionContainerId = process.env.COSMOS_EXTRACTIONS_CONTAINER || "kyc-extractions";

function getClient() {
  if (!endpoint) throw new Error("COSMOS_ENDPOINT not configured");
  return new CosmosClient({ endpoint, aadCredentials: credential as any });
}

export async function createKycRequest(item: KYC_Request) {
  const client = getClient();
  const container = client.database(databaseId).container(requestContainerId);
  return container.items.create(item);
}

export async function updateKycRequest(kycId: string, partial: Partial<KYC_Request>) {
  const client = getClient();
  const container = client.database(databaseId).container(requestContainerId);
  // Upsert using kycId as id
  const doc = { id: kycId, ...partial } as any;
  return container.items.upsert(doc);
}

export async function createExtractionRecord(rec: KYC_Document_Extraction) {
  const client = getClient();
  const container = client.database(databaseId).container(extractionContainerId);
  return container.items.create(rec);
}

// ----- Users helpers (for simple auth demo) -----
export async function createUser(user: { id: string; email: string; name: string; passwordHash: string; roles?: string[] }) {
  const client = getClient();
  const container = client.database(databaseId).container(process.env.COSMOS_USERS_CONTAINER || "users");
  return container.items.create(user);
}

export async function getUserByEmail(email: string) {
  const client = getClient();
  const container = client.database(databaseId).container(process.env.COSMOS_USERS_CONTAINER || "users");
  const query = { query: "SELECT * FROM c WHERE c.email = @email", parameters: [{ name: "@email", value: email }] };
  const { resources } = await container.items.query(query).fetchAll();
  return resources[0] || null;
}

export async function getRequestsByStatus(status: string, limit = 50) {
  const client = getClient();
  const container = client.database(databaseId).container(requestContainerId);
  const querySpec = {
    query: "SELECT * FROM c WHERE c.status = @status ORDER BY c.createdAt DESC",
    parameters: [{ name: "@status", value: status }]
  };
  const { resources } = await container.items.query(querySpec, { maxItemCount: limit }).fetchAll();
  return resources;
}

export async function getKycRequestById(kycId: string) {
  const client = getClient();
  const container = client.database(databaseId).container(requestContainerId);
  const { resource } = await container.item(kycId, kycId).read().catch(() => ({ resource: null }));
  return resource || null;
}

export async function createDecisionRecord(rec: any) {
  const client = getClient();
  const container = client.database(databaseId).container(process.env.COSMOS_DECISIONS_CONTAINER || "kyc-decisions");
  return container.items.create(rec);
}

export async function getExtractionByKycId(kycId: string) {
  const client = getClient();
  const container = client.database(databaseId).container(extractionContainerId);
  const query = {
    query: "SELECT * FROM c WHERE c.kycId = @kycId ORDER BY c.extractedAt DESC",
    parameters: [{ name: "@kycId", value: kycId }]
  };
  const { resources } = await container.items.query(query).fetchAll();
  return resources[0] || null;
}

export async function createRiskAssessment(rec: any) {
  const client = getClient();
  const container = client.database(databaseId).container(process.env.COSMOS_RISK_CONTAINER || "kyc-risk-assessments");
  return container.items.create(rec);
}
