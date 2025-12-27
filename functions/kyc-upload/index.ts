import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { generateUserDelegationSAS, uploadExtractionJson } from "../services/storage";
import { analyzeDocumentFromUrl } from "../services/documentIntelligence";
import { createExtractionRecord, updateKycRequest } from "../services/cosmos";
import type { KYC_Document_Extraction } from "../models/kyc";

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
  context.log("/api/kyc/upload-document invoked");

  if (req.method !== "POST") {
    context.res = { status: 405, body: { error: "Method not allowed" } };
    return;
  }

  const body = req.body || {};
  const kycId = body.kycId as string;
  const blobUrl = body.blobUrl as string; // optional full URL including SAS or public URL
  const blobName = body.blobName as string; // optional blob path (container/blob)

  if (!kycId || (!blobUrl && !blobName)) {
    context.res = { status: 400, body: { error: "kycId and blobUrl or blobName are required" } };
    return;
  }

  try {
    // If caller provided a blobName (path within container), generate a read SAS URL
    let documentUrl = blobUrl;
    if (!documentUrl && blobName) {
      documentUrl = await generateUserDelegationSAS(blobName, "r", 60);
    }

    if (!documentUrl) throw new Error("failed to determine document URL");

    context.log("Analyzing document at", documentUrl);

    const analysis = await analyzeDocumentFromUrl(documentUrl);

    // Save raw extraction JSON to Blob for immutability/audit
    const extractionBlobUrl = await uploadExtractionJson(kycId, analysis);

    // Persist extraction record to Cosmos (immutable record)
    const rec: KYC_Document_Extraction = {
      kycId,
      rawDocumentJson: analysis,
      documentType: (analysis?.documentType || "unknown") as string,
      extractedAt: new Date().toISOString(),
      blobPath: extractionBlobUrl
    };

    await createExtractionRecord(rec);

    // Update KYC request status to PENDING_REVIEW
    await updateKycRequest(kycId, { status: "PENDING_REVIEW" as any });

    context.res = {
      status: 200,
      body: {
        message: "Document analyzed and stored",
        extractionBlobUrl,
        kycId
      }
    };
  } catch (err: any) {
    context.log.error(err);
    context.res = { status: 500, body: { error: err?.message || String(err) } };
  }
};

export default httpTrigger;
