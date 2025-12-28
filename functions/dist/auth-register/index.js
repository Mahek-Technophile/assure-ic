"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const uuid_1 = require("uuid");
const sql_1 = require("../services/sql");
const httpTrigger = async function (context, req) {
    try {
        if (req.method !== "POST") {
            context.res = { status: 405, body: { error: "Method not allowed" } };
            return;
        }
        const body = req.body || {};
        const email = body.email;
        const name = body.name || "";
        const password = body.password;
        if (!email || !password) {
            context.res = { status: 400, body: { error: "email and password required" } };
            return;
        }
        const existing = await (0, sql_1.getUserByEmail)(email);
        if (existing) {
            context.res = { status: 409, body: { error: "user already exists" } };
            return;
        }
        const hash = await bcryptjs_1.default.hash(password, 10);
        const id = (0, uuid_1.v4)();
        await (0, sql_1.createUser)({ id, email, name, passwordHash: hash, roles: ["user"] });
        context.res = { status: 201, body: { message: "user created" } };
    }
    catch (err) {
        context.log.error(err);
        context.res = { status: 500, body: { error: err?.message || String(err) } };
    }
};
exports.default = httpTrigger;
