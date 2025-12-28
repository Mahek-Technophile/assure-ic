import sql from "mssql";
import { v4 as uuidv4 } from "uuid";
import type { KYC_Request, KYC_Document_Extraction } from "../models/kyc";

const connectionString = process.env.SQL_CONNECTION_STRING || process.env.AZURE_SQL_CONNECTION_STRING || "";

if (!connectionString) {
  // don't throw on import time; allow functions to run in dev where persistence may be optional
  console.warn("SQL_CONNECTION_STRING not configured; SQL operations will fail until configured.");
}

let pool: any = null;
async function getPool() {
  if (pool && pool.connected) return pool;
  pool = await new sql.ConnectionPool(connectionString).connect();
  return pool;
}

function parseRow(row: any) {
  try {
    const parsed = JSON.parse(row.data);
    return parsed;
  } catch (e) {
    return row;
  }
}

export async function createKycRequest(item: KYC_Request) {
  const p = await getPool();
  const data = JSON.stringify(item);
  const status = (item.status as any) || "pending";
  const createdAt = item.createdAt || new Date().toISOString();
  // accept either item.id or item.kycId for compatibility
  const idVal = (item as any).id || (item as any).kycId || null;
  // Prepare dob as Date if provided (store into DATE column)
  let dobVal: Date | null = null;
  if ((item as any).dob) {
    const d = new Date((item as any).dob);
    if (!isNaN(d.getTime())) dobVal = d;
  }

  await p.request()
    .input("id", sql.NVarChar(100), idVal)
    .input("status", sql.NVarChar(50), status)
    .input("createdAt", sql.DateTimeOffset, createdAt)
    .input("fullName", sql.NVarChar(200), (item as any).fullName || null)
    .input("dob", sql.Date, dobVal)
    .input("idType", sql.NVarChar(50), (item as any).idType || null)
    .input("data", sql.NVarChar(sql.MAX), data)
    .query(
      "INSERT INTO kyc_requests (id, status, createdAt, fullName, dob, idType, data) VALUES (@id, @status, @createdAt, @fullName, @dob, @idType, @data)"
    );
  return { id: idVal };
}

export async function updateKycRequest(kycId: string, partial: Partial<KYC_Request>) {
  const p = await getPool();
  const res = await p.request().input("id", sql.NVarChar(100), kycId).query("SELECT TOP 1 data FROM kyc_requests WHERE id = @id");
  const existing = res.recordset[0] ? JSON.parse(res.recordset[0].data) : {};
  const merged = { ...existing, ...partial };
  const data = JSON.stringify(merged);
  const status = (merged as any).status || null;
  // also update personal columns if present in merged
  const fullName = (merged as any).fullName || null;
  let dobVal: Date | null = null;
  if ((merged as any).dob) {
    const d = new Date((merged as any).dob);
    if (!isNaN(d.getTime())) dobVal = d;
  }
  const idType = (merged as any).idType || null;

  await p.request()
    .input("id", sql.NVarChar(100), kycId)
    .input("data", sql.NVarChar(sql.MAX), data)
    .input("status", sql.NVarChar(50), status)
    .input("fullName", sql.NVarChar(200), fullName)
    .input("dob", sql.Date, dobVal)
    .input("idType", sql.NVarChar(50), idType)
    .query(
      "UPDATE kyc_requests SET data = @data, status = ISNULL(@status, status), fullName = ISNULL(@fullName, fullName), dob = ISNULL(@dob, dob), idType = ISNULL(@idType, idType) WHERE id = @id"
    );
  return { id: kycId };
}

export async function createExtractionRecord(rec: KYC_Document_Extraction) {
  const p = await getPool();
  const data = JSON.stringify(rec);
  const extractedAt = rec.extractedAt || new Date().toISOString();
  await p.request()
    .input("id", sql.NVarChar(100), rec.id)
    .input("kycId", sql.NVarChar(100), rec.kycId)
    .input("extractedAt", sql.DateTimeOffset, extractedAt)
    .input("data", sql.NVarChar(sql.MAX), data)
    .query("INSERT INTO kyc_extractions (id, kycId, extractedAt, data) VALUES (@id, @kycId, @extractedAt, @data)");
  return { id: rec.id };
}

export async function createUser(user: { id: string; email: string; name: string; passwordHash: string; roles?: string[] }) {
  const p = await getPool();
  const roles = JSON.stringify(user.roles || []);
  await p.request()
    .input("id", sql.NVarChar(100), user.id)
    .input("email", sql.NVarChar(200), user.email)
    .input("name", sql.NVarChar(200), user.name)
    .input("passwordHash", sql.NVarChar(200), user.passwordHash)
    .input("roles", sql.NVarChar(sql.MAX), roles)
    .query("INSERT INTO users (id, email, name, passwordHash, roles) VALUES (@id, @email, @name, @passwordHash, @roles)");
  return { id: user.id };
}

export async function getUserByEmail(email: string) {
  const p = await getPool();
  const res = await p.request().input("email", sql.NVarChar(200), email).query("SELECT TOP 1 id, email, name, passwordHash, roles FROM users WHERE email = @email");
  const row = res.recordset[0];
  if (!row) return null;
  try { row.roles = JSON.parse(row.roles); } catch {}
  return row;
}

export async function getRequestsByStatus(status: string, limit = 50) {
  const p = await getPool();
  const res = await p.request().input("status", sql.NVarChar(50), status).input("limit", sql.Int, limit)
    .query("SELECT TOP (@limit) id, data FROM kyc_requests WHERE status = @status ORDER BY createdAt DESC");
  return res.recordset.map((r: any) => parseRow(r));
}

export async function getKycRequestById(kycId: string) {
  const p = await getPool();
  const res = await p.request().input("id", sql.NVarChar(100), kycId).query("SELECT TOP 1 data FROM kyc_requests WHERE id = @id");
  const row = res.recordset[0];
  if (!row) return null;
  return parseRow(row);
}

export async function createDecisionRecord(rec: any) {
  const p = await getPool();
  const data = JSON.stringify(rec);
  const decidedAt = rec.decidedAt || new Date().toISOString();
  await p.request()
    .input("id", sql.NVarChar(100), rec.id)
    .input("kycId", sql.NVarChar(100), rec.kycId)
    .input("decidedAt", sql.DateTimeOffset, decidedAt)
    .input("data", sql.NVarChar(sql.MAX), data)
    .query("INSERT INTO kyc_decisions (id, kycId, decidedAt, data) VALUES (@id, @kycId, @decidedAt, @data)");
  return { id: rec.id };
}

export async function getExtractionByKycId(kycId: string) {
  const p = await getPool();
  const res = await p.request().input("kycId", sql.NVarChar(100), kycId).query("SELECT TOP 1 data FROM kyc_extractions WHERE kycId = @kycId ORDER BY extractedAt DESC");
  const row = res.recordset[0];
  if (!row) return null;
  return parseRow(row);
}

export async function createRiskAssessment(rec: any) {
  const p = await getPool();
  const data = JSON.stringify(rec);
  const assessedAt = rec.assessedAt || new Date().toISOString();
  await p.request()
    .input("id", sql.NVarChar(100), rec.id)
    .input("kycId", sql.NVarChar(100), rec.kycId)
    .input("assessedAt", sql.DateTimeOffset, assessedAt)
    .input("data", sql.NVarChar(sql.MAX), data)
    .query("INSERT INTO kyc_risk_assessments (id, kycId, assessedAt, data) VALUES (@id, @kycId, @assessedAt, @data)");
  return { id: rec.id };
}

export async function recordStateTransition(kycId: string, fromState: string | null, toState: string, actor?: string | null, reason?: string | null) {
  const p = await getPool();
  const id = (reason && reason.length > 0) ? `${kycId}-${Date.now()}` : uuidv4();
  const createdAt = new Date().toISOString();
  await p.request()
    .input("id", sql.NVarChar(100), id)
    .input("kycId", sql.NVarChar(100), kycId)
    .input("fromState", sql.NVarChar(50), fromState)
    .input("toState", sql.NVarChar(50), toState)
    .input("actor", sql.NVarChar(200), actor || null)
    .input("reason", sql.NVarChar(sql.MAX), reason || null)
    .input("createdAt", sql.DateTimeOffset, createdAt)
    .query("INSERT INTO kyc_state_transitions (id, kycId, fromState, toState, actor, reason, createdAt) VALUES (@id, @kycId, @fromState, @toState, @actor, @reason, @createdAt)");
  return { id };
}

export default {};
