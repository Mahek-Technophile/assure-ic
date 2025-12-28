-- Migration: add personal detail columns to kyc_requests
ALTER TABLE kyc_requests
  ADD fullName NVARCHAR(200) NULL,
      dob DATE NULL,
      idType NVARCHAR(50) NULL;

-- Consider adding indexes or encryption on these columns depending on policy.
