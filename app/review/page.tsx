"use client"
import { useRouter } from "next/navigation";
import FlowNav from "../../components/FlowNav";
import FormLayout from "../../components/FormLayout";
import { useFormFlow } from "../../context/FormFlowContext";
import React from "react";

export default function Page() {
  const router = useRouter();
  const { lead, applicant, application, updateApplication } = useFormFlow();

  async function handleSubmit() {
    // mark submitted and trigger AI audit (mocked)
    updateApplication({ app_status: 'submitted', is_ai_audited: true, submitted_at: new Date().toISOString() });

    // Optionally call backend to persist and trigger kyc-analyze.
    /*
    try {
      const functionsBase = process.env.NEXT_PUBLIC_FUNCTIONS_BASE_URL;
      await fetch(`${functionsBase}/api/kyc-analyze`, { method: 'POST', body: JSON.stringify({ application }) });
    } catch (err) {
      console.error('kyc trigger failed', err);
    }
    */

    router.push('/status');
  }

  const [consent, setConsent] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);

  async function onSubmit() {
    if (!consent) return;
    setSubmitting(true);
    await handleSubmit();
    setSubmitting(false);
  }

  function SummaryRow({ label, value }: { label: string; value: any }) {
    if (value === undefined || value === null || value === '') return null;
    return (
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f0f0f0' }}>
        <div style={{ color: '#444' }}>{label}</div>
        <div style={{ color: '#111', fontWeight: 600 }}>{String(value)}</div>
      </div>
    );
  }

  return (
    <FormLayout title="Review Application">
      <p>Final review of entered data. Final Consent & Submit is mandatory.</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 12 }}>
        <section style={{ background: '#fff', padding: 12, borderRadius: 8 }}>
          <h4>Lead</h4>
          <SummaryRow label="Lead ID" value={lead.lead_id} />
          <SummaryRow label="Name" value={lead.lead_name} />
          <SummaryRow label="Phone" value={lead.lead_ph_no} />
          <SummaryRow label="Email" value={lead.lead_email} />
          <div style={{ marginTop: 8 }}><a href="/lead">Edit</a></div>
        </section>

        <section style={{ background: '#fff', padding: 12, borderRadius: 8 }}>
          <h4>Applicant</h4>
          <SummaryRow label="Applicant ID" value={applicant.applicant_id} />
          <SummaryRow label="Name" value={`${applicant.applicant_fname || ''} ${applicant.applicant_lname || ''}`.trim()} />
          <SummaryRow label="DOB" value={applicant.dob} />
          <SummaryRow label="Primary Email" value={applicant.prim_email} />
          <div style={{ marginTop: 8 }}><a href="/applicant">Edit</a></div>
        </section>

        <section style={{ background: '#fff', padding: 12, borderRadius: 8 }}>
          <h4>Application</h4>
          <SummaryRow label="Application ID" value={application.application_id} />
          <SummaryRow label="Product" value={application.product} />
          <SummaryRow label="Loan Amount" value={application.loan_amount} />
          <SummaryRow label="Tenure (months)" value={application.loan_tenure} />
          <div style={{ marginTop: 8 }}><a href="/application">Edit</a></div>
        </section>

        <section style={{ background: '#fff', padding: 12, borderRadius: 8 }}>
          <h4>Address</h4>
          <SummaryRow label="Current" value={application.current_address?.address} />
          <SummaryRow label="City" value={application.current_address?.city} />
          <SummaryRow label="Pincode" value={application.current_address?.pincode} />
          <div style={{ marginTop: 8 }}><a href="/address">Edit</a></div>
        </section>

        <section style={{ background: '#fff', padding: 12, borderRadius: 8 }}>
          <h4>Employment / Business</h4>
          <SummaryRow label="Type" value={application.employment_type} />
          <SummaryRow label="Employer / Business" value={application.employment_details?.employer_name || application.business_details?.business_company_name} />
          <div style={{ marginTop: 8 }}><a href="/employment-type">Edit</a></div>
        </section>

        <section style={{ background: '#fff', padding: 12, borderRadius: 8 }}>
          <h4>Bank</h4>
          <SummaryRow label="Account Holder" value={application.bank_details?.account_holder_name} />
          <SummaryRow label="Account Number" value={application.bank_details?.account_number ? '••••' + String(application.bank_details.account_number).slice(-4) : ''} />
          <div style={{ marginTop: 8 }}><a href="/banking">Edit</a></div>
        </section>
      </div>

      <div style={{ marginTop: 16 }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
          <span>I give final consent to submit this application and trigger AI audit.</span>
        </label>
      </div>

      <div style={{ marginTop: 20 }}>
        <button onClick={onSubmit} disabled={!consent || submitting}>{submitting ? 'Submitting...' : 'Final Consent & Submit'}</button>
      </div>

      <FlowNav prev="/banking" next="/status" />
    </FormLayout>
  );
}
