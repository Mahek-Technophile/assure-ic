"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateBearerToken = validateBearerToken;
exports.isAdmin = isAdmin;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const jwks_rsa_1 = __importDefault(require("jwks-rsa"));
// This auth helper validates incoming Bearer tokens. It supports JWKS (OIDC)
// Configure with environment variables in the Function App:
// - AUTH_JWKS_URI : JWKS endpoint (e.g. https://<tenant>/.well-known/jwks.json)
// - AUTH_AUDIENCE : expected audience (optional)
// - AUTH_ISSUER : expected issuer (optional)
const jwksUri = process.env.AUTH_JWKS_URI || "";
const audience = process.env.AUTH_AUDIENCE || "";
const issuer = process.env.AUTH_ISSUER || "";
let client = null;
if (jwksUri) {
    client = (0, jwks_rsa_1.default)({ jwksUri, timeout: 30000 });
}
function getKey(header, callback) {
    if (!client)
        return callback(new Error("JWKS not configured"));
    client.getSigningKey(header.kid, function (err, key) {
        if (err)
            return callback(err);
        const signingKey = key.getPublicKey();
        callback(null, signingKey);
    });
}
async function validateBearerToken(authHeader) {
    if (!authHeader)
        throw new Error("Missing Authorization header");
    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer")
        throw new Error("Invalid Authorization header");
    const token = parts[1];
    // If no JWKS configured and no secret provided, throw
    if (!client && !process.env.AUTH_SHARED_SECRET) {
        throw new Error("No auth verification configured (set AUTH_JWKS_URI or AUTH_SHARED_SECRET)");
    }
    return new Promise((resolve, reject) => {
        const verifyOptions = {};
        if (audience)
            verifyOptions.audience = audience;
        if (issuer)
            verifyOptions.issuer = issuer;
        if (client) {
            jsonwebtoken_1.default.verify(token, getKey, verifyOptions, (err, decoded) => {
                if (err)
                    return reject(err);
                resolve(decoded);
            });
        }
        else {
            // fallback to HMAC shared secret for local dev
            const secret = process.env.AUTH_SHARED_SECRET;
            jsonwebtoken_1.default.verify(token, secret, verifyOptions, (err, decoded) => {
                if (err)
                    return reject(err);
                resolve(decoded);
            });
        }
    });
}
function isAdmin(decodedToken) {
    if (!decodedToken)
        return false;
    // common claims: roles, role, app_roles, permissions, groups
    const roles = decodedToken.roles || decodedToken.role || decodedToken.app_roles || [];
    if (Array.isArray(roles) && roles.includes("admin"))
        return true;
    if (typeof roles === "string" && roles === "admin")
        return true;
    // fallback: custom claim
    if (decodedToken["is_admin"] === true)
        return true;
    return false;
}
