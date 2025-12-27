import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { validateBearerToken, isAdmin } from "../../services/auth";
import { getKycRequestById, getExtractionByKycId } from "../../services/cosmos";

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
  try {
    const auth = req.headers["authorization"] as string | undefined;
    const decoded = await validateBearerToken(auth).catch((e) => { throw { status: 401, message: e.message }; });
    if (!isAdmin(decoded)) throw { status: 403, message: "admin role required" };

    const kycId = context.bindingData.id as string;
    if (!kycId) throw { status: 400, message: "id is required" };

    const reqDoc = await getKycRequestById(kycId);
    const extraction = await getExtractionByKycId(kycId);

    context.res = { status: 200, body: { request: reqDoc, extraction } };
  } catch (err: any) {
    context.log.error(err);
    context.res = { status: err?.status || 500, body: { error: err?.message || String(err) } };
  }
};

export default httpTrigger;
