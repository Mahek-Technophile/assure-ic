"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createKycRequest = createKycRequest;
exports.updateKycRequest = updateKycRequest;
exports.createExtractionRecord = createExtractionRecord;
exports.createUser = createUser;
exports.getUserByEmail = getUserByEmail;
exports.getRequestsByStatus = getRequestsByStatus;
exports.getKycRequestById = getKycRequestById;
exports.createDecisionRecord = createDecisionRecord;
exports.getExtractionByKycId = getExtractionByKycId;
exports.createRiskAssessment = createRiskAssessment;
exports.recordStateTransition = recordStateTransition;
const mssql_1 = __importDefault(require("mssql"));
const uuid_1 = require("uuid");
const connectionString = process.env.SQL_CONNECTION_STRING || process.env.AZURE_SQL_CONNECTION_STRING || "";
if (!connectionString) {
    // don't throw on import time; allow functions to run in dev where persistence may be optional
    console.warn("SQL_CONNECTION_STRING not configured; SQL operations will fail until configured.");
}
let pool = null;
async function getPool() {
    if (pool && pool.connected)
        return pool;
    pool = await new mssql_1.default.ConnectionPool(connectionString).connect();
    return pool;
}
function parseRow(row) {
    try {
        const parsed = JSON.parse(row.data);
        return parsed;
    }
    catch (e) {
        return row;
    }
}
async function createKycRequest(item) {
    const p = await getPool();
    const data = JSON.stringify(item);
    const status = item.status || "pending";
    const createdAt = item.createdAt || new Date().toISOString();
    // accept either item.id or item.kycId for compatibility
    const idVal = item.id || item.kycId || null;
    // Prepare dob as Date if provided (store into DATE column)
    let dobVal = null;
    if (item.dob) {
        const d = new Date(item.dob);
        if (!isNaN(d.getTime()))
            dobVal = d;
    }
    await p.request()
        .input("id", mssql_1.default.NVarChar(100), idVal)
        .input("status", mssql_1.default.NVarChar(50), status)
        .input("createdAt", mssql_1.default.DateTimeOffset, createdAt)
        .input("fullName", mssql_1.default.NVarChar(200), item.fullName || null)
        .input("dob", mssql_1.default.Date, dobVal)
        .input("idType", mssql_1.default.NVarChar(50), item.idType || null)
        .input("data", mssql_1.default.NVarChar(mssql_1.default.MAX), data)
        .query("INSERT INTO kyc_requests (id, status, createdAt, fullName, dob, idType, data) VALUES (@id, @status, @createdAt, @fullName, @dob, @idType, @data)");
    return { id: idVal };
}
async function updateKycRequest(kycId, partial) {
    const p = await getPool();
    const res = await p.request().input("id", mssql_1.default.NVarChar(100), kycId).query("SELECT TOP 1 data FROM kyc_requests WHERE id = @id");
    const existing = res.recordset[0] ? JSON.parse(res.recordset[0].data) : {};
    const merged = { ...existing, ...partial };
    const data = JSON.stringify(merged);
    const status = merged.status || null;
    // also update personal columns if present in merged
    const fullName = merged.fullName || null;
    let dobVal = null;
    if (merged.dob) {
        const d = new Date(merged.dob);
        if (!isNaN(d.getTime()))
            dobVal = d;
    }
    const idType = merged.idType || null;
    await p.request()
        .input("id", mssql_1.default.NVarChar(100), kycId)
        .input("data", mssql_1.default.NVarChar(mssql_1.default.MAX), data)
        .input("status", mssql_1.default.NVarChar(50), status)
        .input("fullName", mssql_1.default.NVarChar(200), fullName)
        .input("dob", mssql_1.default.Date, dobVal)
        .input("idType", mssql_1.default.NVarChar(50), idType)
        .query("UPDATE kyc_requests SET data = @data, status = ISNULL(@status, status), fullName = ISNULL(@fullName, fullName), dob = ISNULL(@dob, dob), idType = ISNULL(@idType, idType) WHERE id = @id");
    return { id: kycId };
}
async function createExtractionRecord(rec) {
    const p = await getPool();
    const data = JSON.stringify(rec);
    const extractedAt = rec.extractedAt || new Date().toISOString();
    await p.request()
        .input("id", mssql_1.default.NVarChar(100), rec.id)
        .input("kycId", mssql_1.default.NVarChar(100), rec.kycId)
        .input("extractedAt", mssql_1.default.DateTimeOffset, extractedAt)
        .input("data", mssql_1.default.NVarChar(mssql_1.default.MAX), data)
        .query("INSERT INTO kyc_extractions (id, kycId, extractedAt, data) VALUES (@id, @kycId, @extractedAt, @data)");
    return { id: rec.id };
}
async function createUser(user) {
    const p = await getPool();
    const roles = JSON.stringify(user.roles || []);
    await p.request()
        .input("id", mssql_1.default.NVarChar(100), user.id)
        .input("email", mssql_1.default.NVarChar(200), user.email)
        .input("name", mssql_1.default.NVarChar(200), user.name)
        .input("passwordHash", mssql_1.default.NVarChar(200), user.passwordHash)
        .input("roles", mssql_1.default.NVarChar(mssql_1.default.MAX), roles)
        .query("INSERT INTO users (id, email, name, passwordHash, roles) VALUES (@id, @email, @name, @passwordHash, @roles)");
    return { id: user.id };
}
async function getUserByEmail(email) {
    const p = await getPool();
    const res = await p.request().input("email", mssql_1.default.NVarChar(200), email).query("SELECT TOP 1 id, email, name, passwordHash, roles FROM users WHERE email = @email");
    const row = res.recordset[0];
    if (!row)
        return null;
    try {
        row.roles = JSON.parse(row.roles);
    }
    catch { }
    return row;
}
async function getRequestsByStatus(status, limit = 50) {
    const p = await getPool();
    const res = await p.request().input("status", mssql_1.default.NVarChar(50), status).input("limit", mssql_1.default.Int, limit)
        .query("SELECT TOP (@limit) id, data FROM kyc_requests WHERE status = @status ORDER BY createdAt DESC");
    return res.recordset.map((r) => parseRow(r));
}
async function getKycRequestById(kycId) {
    const p = await getPool();
    const res = await p.request().input("id", mssql_1.default.NVarChar(100), kycId).query("SELECT TOP 1 data FROM kyc_requests WHERE id = @id");
    const row = res.recordset[0];
    if (!row)
        return null;
    return parseRow(row);
}
async function createDecisionRecord(rec) {
    const p = await getPool();
    const data = JSON.stringify(rec);
    const decidedAt = rec.decidedAt || new Date().toISOString();
    await p.request()
        .input("id", mssql_1.default.NVarChar(100), rec.id)
        .input("kycId", mssql_1.default.NVarChar(100), rec.kycId)
        .input("decidedAt", mssql_1.default.DateTimeOffset, decidedAt)
        .input("data", mssql_1.default.NVarChar(mssql_1.default.MAX), data)
        .query("INSERT INTO kyc_decisions (id, kycId, decidedAt, data) VALUES (@id, @kycId, @decidedAt, @data)");
    return { id: rec.id };
}
async function getExtractionByKycId(kycId) {
    const p = await getPool();
    const res = await p.request().input("kycId", mssql_1.default.NVarChar(100), kycId).query("SELECT TOP 1 data FROM kyc_extractions WHERE kycId = @kycId ORDER BY extractedAt DESC");
    const row = res.recordset[0];
    if (!row)
        return null;
    return parseRow(row);
}
async function createRiskAssessment(rec) {
    const p = await getPool();
    const data = JSON.stringify(rec);
    const assessedAt = rec.assessedAt || new Date().toISOString();
    await p.request()
        .input("id", mssql_1.default.NVarChar(100), rec.id)
        .input("kycId", mssql_1.default.NVarChar(100), rec.kycId)
        .input("assessedAt", mssql_1.default.DateTimeOffset, assessedAt)
        .input("data", mssql_1.default.NVarChar(mssql_1.default.MAX), data)
        .query("INSERT INTO kyc_risk_assessments (id, kycId, assessedAt, data) VALUES (@id, @kycId, @assessedAt, @data)");
    return { id: rec.id };
}
async function recordStateTransition(kycId, fromState, toState, actor, reason) {
    const p = await getPool();
    const id = (reason && reason.length > 0) ? `${kycId}-${Date.now()}` : (0, uuid_1.v4)();
    const createdAt = new Date().toISOString();
    await p.request()
        .input("id", mssql_1.default.NVarChar(100), id)
        .input("kycId", mssql_1.default.NVarChar(100), kycId)
        .input("fromState", mssql_1.default.NVarChar(50), fromState)
        .input("toState", mssql_1.default.NVarChar(50), toState)
        .input("actor", mssql_1.default.NVarChar(200), actor || null)
        .input("reason", mssql_1.default.NVarChar(mssql_1.default.MAX), reason || null)
        .input("createdAt", mssql_1.default.DateTimeOffset, createdAt)
        .query("INSERT INTO kyc_state_transitions (id, kycId, fromState, toState, actor, reason, createdAt) VALUES (@id, @kycId, @fromState, @toState, @actor, @reason, @createdAt)");
    return { id };
}
exports.default = {};
