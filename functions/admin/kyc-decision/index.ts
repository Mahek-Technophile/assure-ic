import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { validateBearerToken, isAdmin } from "../../services/auth";
import { getKycRequestById, updateKycRequest, createDecisionRecord } from "../../services/cosmos";

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
  try {
    const auth = req.headers["authorization"] as string | undefined;
    const decoded = await validateBearerToken(auth).catch((e) => { throw { status: 401, message: e.message }; });
    if (!isAdmin(decoded)) throw { status: 403, message: "admin role required" };

    const kycId = context.bindingData.id as string;
    if (!kycId) throw { status: 400, message: "id is required" };

    const body = req.body || {};
    const decision = (body.decision || "REJECT").toUpperCase(); // ACCEPT/REJECT
    const note = body.note || null;
    const actor = decoded?.sub || decoded?.oid || decoded?.preferred_username || "admin";

    const valid = ["APPROVE", "REJECT", "APPROVED", "REJECTED"].includes(decision);
    if (!valid) throw { status: 400, message: "decision must be APPROVE or REJECT" };

    const status = (decision.startsWith("APPROV")) ? "APPROVED" : "REJECTED";

    // Update request
    await updateKycRequest(kycId, { status } as any);

    // Create audit record
    const rec = {
      kycId,
      decision: status,
      note,
      actor,
      decidedAt: new Date().toISOString()
    };
    await createDecisionRecord(rec);

    context.res = { status: 200, body: { message: "Decision recorded", rec } };
  } catch (err: any) {
    context.log.error(err);
    context.res = { status: err?.status || 500, body: { error: err?.message || String(err) } };
  }
};

export default httpTrigger;
