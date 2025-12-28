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
        const reqDoc = await (0, sql_1.getKycRequestById)(kycId);
        if (!reqDoc)
            throw { status: 404, message: "request not found" };
        // Only allow admin to view requests that are pending review
        if ((reqDoc.status || reqDoc?.status?.toUpperCase?.()) !== "PENDING_REVIEW") {
            throw { status: 404, message: "request not available for review" };
        }
        const extraction = await (0, sql_1.getExtractionByKycId)(kycId);
        context.res = { status: 200, body: { request: reqDoc, extraction } };
    }
    catch (err) {
        context.log.error(err);
        context.res = { status: err?.status || 500, body: { error: err?.message || String(err) } };
    }
};
exports.default = httpTrigger;
