export type KYCStatus =
  | "CREATED"
  | "DOCUMENT_UPLOADED"
  | "EXTRACTED"
  | "ANALYZED"
  | "PENDING_REVIEW"
  | "APPROVED"
  | "REJECTED";
export type RiskLevel = "LOW" | "MEDIUM" | "HIGH";

export interface KYC_Request {
  // persisted primary key (some code uses `id`, others use `kycId`)
  id?: string;
  kycId: string;
  userId: string;
  // Personal details captured at start
  fullName?: string | null;
  dob?: string | null; // ISO date string YYYY-MM-DD
  idType?: string | null;
  status: KYCStatus;
  riskLevel: RiskLevel;
  createdAt: string;
}

export interface KYC_Document_Extraction {
  id?: string;
  kycId: string;
  rawDocumentJson: any;
  documentType: string;
  extractedAt: string;
  blobPath?: string;
}

export interface KYC_Risk_Assessment {
  kycId: string;
  riskLevel: RiskLevel;
  confidenceScore: number;
  reasoning: string;
  modelVersion: string;
  assessedAt: string;
}
