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
        const pending = await (0, sql_1.getRequestsByStatus)("PENDING_REVIEW");
        context.res = { status: 200, body: { items: pending } };
    }
    catch (err) {
        context.log.error(err);
        context.res = { status: err?.status || 500, body: { error: err?.message || String(err) } };
    }
};
exports.default = httpTrigger;
