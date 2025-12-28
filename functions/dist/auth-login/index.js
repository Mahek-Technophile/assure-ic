"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const sql_1 = require("../services/sql");
const SECRET = process.env.AUTH_SHARED_SECRET || "dev-secret"; // in production store in Key Vault and never check into code
const TOKEN_EXPIRY = process.env.AUTH_TOKEN_EXPIRY || "1h";
const httpTrigger = async function (context, req) {
    try {
        if (req.method !== "POST") {
            context.res = { status: 405, body: { error: "Method not allowed" } };
            return;
        }
        const body = req.body || {};
        const email = body.email;
        const password = body.password;
        if (!email || !password) {
            context.res = { status: 400, body: { error: "email and password required" } };
            return;
        }
        const user = await (0, sql_1.getUserByEmail)(email);
        if (!user) {
            context.res = { status: 401, body: { error: "invalid credentials" } };
            return;
        }
        const match = await bcryptjs_1.default.compare(password, user.passwordHash);
        if (!match) {
            context.res = { status: 401, body: { error: "invalid credentials" } };
            return;
        }
        const token = jsonwebtoken_1.default.sign({ sub: user.id, email: user.email, name: user.name, roles: user.roles || [] }, SECRET, { expiresIn: TOKEN_EXPIRY });
        context.res = {
            status: 200,
            body: { token, user: { id: user.id, email: user.email, name: user.name, roles: user.roles || [] } }
        };
    }
    catch (err) {
        context.log.error(err);
        context.res = { status: 500, body: { error: err?.message || String(err) } };
    }
};
exports.default = httpTrigger;
