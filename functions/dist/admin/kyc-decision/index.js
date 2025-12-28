"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const auth_1 = require("../../services/auth");
const sql_1 = require("../../services/sql");
const httpTrigger = async function (context, req) {
    try {
        const auth = req.headers["authorization"];
        const decoded = await (0, auth_1.validateBearerToken)(auth).catch((e) => { throw { status: 401, message: e.message }; });
        if (!(0, auth_1.isAdmin)(decoded))
            throw { status: 403, message: "admin role required" };
        const kycId = context.bindingData.id;
        if (!kycId)
            throw { status: 400, message: "id is required" };
        const body = req.body || {};
        const decision = (body.decision || "REJECT").toUpperCase(); // ACCEPT/REJECT
        const note = body.note || null;
        const actor = decoded?.sub || decoded?.oid || decoded?.preferred_username || "admin";
        const valid = ["APPROVE", "REJECT", "APPROVED", "REJECTED"].includes(decision);
        if (!valid)
            throw { status: 400, message: "decision must be APPROVE or REJECT" };
        const status = (decision.startsWith("APPROV")) ? "APPROVED" : "REJECTED";
        // Ensure this request is in PENDING_REVIEW state
        const reqDoc = await (0, sql_1.getKycRequestById)(kycId);
        if (!reqDoc)
            throw { status: 404, message: "request not found" };
        if ((reqDoc.status || reqDoc?.status?.toUpperCase?.()) !== "PENDING_REVIEW")
            throw { status: 400, message: "request not in PENDING_REVIEW" };
        // Update request to final decision
        await (0, sql_1.updateKycRequest)(kycId, { status });
        try {
            await (0, sql_1.recordStateTransition)(kycId, "PENDING_REVIEW", status, actor, note);
        }
        catch (e) {
            context.log.warn("failed to record state transition:", e);
        }
        // Create audit record for decision
        const rec = {
            kycId,
            decision: status,
            note,
            actor,
            decidedAt: new Date().toISOString()
        };
        await (0, sql_1.createDecisionRecord)(rec);
        context.res = { status: 200, body: { message: "Decision recorded", rec } };
    }
    catch (err) {
        context.log.error(err);
        context.res = { status: err?.status || 500, body: { error: err?.message || String(err) } };
    }
};
exports.default = httpTrigger;
