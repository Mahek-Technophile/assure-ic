-- Migration: create kyc_state_transitions table to record lifecycle events
CREATE TABLE kyc_state_transitions (
  id NVARCHAR(100) PRIMARY KEY,
  kycId NVARCHAR(100) NOT NULL,
  fromState NVARCHAR(50) NULL,
  toState NVARCHAR(50) NOT NULL,
  actor NVARCHAR(200) NULL,
  reason NVARCHAR(MAX) NULL,
  createdAt DATETIMEOFFSET NOT NULL
);

-- Optional index
CREATE INDEX IDX_kyc_state_transitions_kycId ON kyc_state_transitions(kycId);
