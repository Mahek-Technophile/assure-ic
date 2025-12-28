import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { createUser, getUserByEmail } from "../services/sql";

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
  try {
    if (req.method !== "POST") {
      context.res = { status: 405, body: { error: "Method not allowed" } };
      return;
    }

    const body = req.body || {};
    const email = body.email as string;
    const name = body.name as string || "";
    const password = body.password as string;

    if (!email || !password) {
      context.res = { status: 400, body: { error: "email and password required" } };
      return;
    }

    const existing = await getUserByEmail(email);
    if (existing) {
      context.res = { status: 409, body: { error: "user already exists" } };
      return;
    }

    const hash = await bcrypt.hash(password, 10);
    const id = uuidv4();
    await createUser({ id, email, name, passwordHash: hash, roles: ["user"] });

    context.res = { status: 201, body: { message: "user created" } };
  } catch (err: any) {
    context.log.error(err);
    context.res = { status: 500, body: { error: err?.message || String(err) } };
  }
};

export default httpTrigger;
