import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { getExtractionByKycId, createRiskAssessment, updateKycRequest } from "../services/cosmos";
import { analyzeRiskWithOpenAI } from "../services/openai";

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
  context.log("/api/kyc/analyze invoked");

  if (req.method !== "POST") {
    context.res = { status: 405, body: { error: "Method not allowed" } };
    return;
  }

  const body = req.body || {};
  const kycId = body.kycId as string;

  if (!kycId) {
    context.res = { status: 400, body: { error: "kycId is required" } };
    return;
  }

  try {
    const extraction = await getExtractionByKycId(kycId);
    if (!extraction) {
      context.res = { status: 404, body: { error: "extraction not found" } };
      return;
    }

    // Normalize extracted fields (simple flatten for now)
    const raw = extraction.rawDocumentJson || extraction?.document || extraction;
    const flattened = JSON.stringify(raw, null, 2);

    // Call OpenAI to perform risk reasoning
    const aiResult = await analyzeRiskWithOpenAI(flattened);

    const assessedAt = new Date().toISOString();
    const riskRec = {
      kycId,
      riskLevel: (aiResult.riskLevel || "MEDIUM").toUpperCase(),
      confidenceScore: Number(aiResult.confidenceScore) || 0,
      reasoning: aiResult.reasoning || (aiResult.explanation || JSON.stringify(aiResult)),
      modelVersion: aiResult.modelVersion || process.env.OPENAI_DEPLOYMENT || "unknown",
      assessedAt
    };

    await createRiskAssessment(riskRec as any);

    // Update the KYC request with result and status
    const newStatus = (riskRec.riskLevel === "LOW") ? "APPROVED" : "PENDING_REVIEW";
    await updateKycRequest(kycId, { riskLevel: riskRec.riskLevel, status: newStatus } as any);

    context.res = { status: 200, body: { message: "Risk assessment stored", kycId, riskRec } };
  } catch (err: any) {
    context.log.error(err);
    context.res = { status: 500, body: { error: err?.message || String(err) } };
  }
};

export default httpTrigger;
