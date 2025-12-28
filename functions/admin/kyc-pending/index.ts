import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { validateBearerToken, isAdmin } from "../../services/auth";
import { getRequestsByStatus } from "../../services/sql";

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
  try {
    const auth = req.headers["authorization"] as string | undefined;
    const decoded = await validateBearerToken(auth).catch((e) => { throw { status: 401, message: e.message }; });
    if (!isAdmin(decoded)) throw { status: 403, message: "admin role required" };

    const pending = await getRequestsByStatus("PENDING_REVIEW");
    context.res = { status: 200, body: { items: pending } };
  } catch (err: any) {
    context.log.error(err);
    context.res = { status: err?.status || 500, body: { error: err?.message || String(err) } };
  }
};

export default httpTrigger;
