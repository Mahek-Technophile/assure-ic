export type KYCStatus = "IN_PROGRESS" | "PENDING_REVIEW" | "APPROVED" | "REJECTED";
export type RiskLevel = "LOW" | "MEDIUM" | "HIGH";

export interface KYC_Request {
  kycId: string;
  userId: string;
  status: KYCStatus;
  riskLevel: RiskLevel;
  createdAt: string;
}

export interface KYC_Document_Extraction {
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
