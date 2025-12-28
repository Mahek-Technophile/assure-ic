import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { getUserByEmail } from "../services/sql";

const SECRET = process.env.AUTH_SHARED_SECRET || "dev-secret"; // in production store in Key Vault and never check into code
const TOKEN_EXPIRY = process.env.AUTH_TOKEN_EXPIRY || "1h";

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
  try {
    if (req.method !== "POST") {
      context.res = { status: 405, body: { error: "Method not allowed" } };
      return;
    }

    const body = req.body || {};
    const email = body.email as string;
    const password = body.password as string;

    if (!email || !password) {
      context.res = { status: 400, body: { error: "email and password required" } };
      return;
    }

    const user = await getUserByEmail(email);
    if (!user) {
      context.res = { status: 401, body: { error: "invalid credentials" } };
      return;
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      context.res = { status: 401, body: { error: "invalid credentials" } };
      return;
    }

    const token = jwt.sign({ sub: user.id, email: user.email, name: user.name, roles: user.roles || [] }, SECRET, { expiresIn: TOKEN_EXPIRY });

    context.res = {
      status: 200,
      body: { token, user: { id: user.id, email: user.email, name: user.name, roles: user.roles || [] } }
    };
  } catch (err: any) {
    context.log.error(err);
    context.res = { status: 500, body: { error: err?.message || String(err) } };
  }
};

export default httpTrigger;
