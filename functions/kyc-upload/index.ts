import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { generateUserDelegationSAS, uploadExtractionJson } from "../services/storage";
import { analyzeDocumentFromUrl } from "../services/documentIntelligence";
import { createExtractionRecord, updateKycRequest, recordStateTransition } from "../services/sql";
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

    // record transition: CREATED/DOCUMENT_UPLOADED
    try { await updateKycRequest(kycId, { status: "DOCUMENT_UPLOADED" as any }); await recordStateTransition(kycId, "CREATED", "DOCUMENT_UPLOADED"); } catch (e) { context.log.warn("failed to mark DOCUMENT_UPLOADED:", e); }

    const analysis = await analyzeDocumentFromUrl(documentUrl);

    // Save raw extraction JSON to Blob for immutability/audit.
    // Primary audit path will be: kyc-extractions/{kycId}/document-intel.json
    // The implementation deliberately avoids overwriting existing audit files; if the
    // primary path already exists the function will write to a timestamped file
    // (e.g. document-intel-<timestamp>.json). This ensures append-only, audit-grade storage.
    const extractionBlobUrl = await uploadExtractionJson(kycId, analysis);

    // Persist extraction record to Azure SQL (immutable record)
    const rec: KYC_Document_Extraction = {
      kycId,
      rawDocumentJson: analysis,
      documentType: (analysis?.documentType || "unknown") as string,
      extractedAt: new Date().toISOString(),
      blobPath: extractionBlobUrl
    };

    await createExtractionRecord(rec);

    // Mark as EXTRACTED (append-only extraction saved)
    try { await updateKycRequest(kycId, { status: "EXTRACTED" as any }); await recordStateTransition(kycId, "DOCUMENT_UPLOADED", "EXTRACTED"); } catch (e) { context.log.warn("failed to mark EXTRACTED:", e); }

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
