"use client"
import { useRouter } from "next/navigation";
import FlowNav from "../../components/FlowNav";
import FormLayout from "../../components/FormLayout";
import TextInput from "../../components/TextInput";
import SelectInput from "../../components/SelectInput";
import { useFormFlow } from "../../context/FormFlowContext";
import React from "react";

export default function Page() {
  const router = useRouter();
  const { application, updateApplication } = useFormFlow();
  const [error, setError] = React.useState("");

  function handleNext() {
    setError("");
    const prod = application.product;
    const loanAmount = Number(application.loan_amount || 0);
    const loanTenure = Number(application.loan_tenure || 0);
    if (!prod || !loanAmount || loanAmount <= 0 || !loanTenure || loanTenure <= 0) {
      setError('Please provide Product, Loan Amount (>0), and Loan Tenure (>0)');
      return;
    }
    // Set minimal backend-like fields for the application
    if (!application.application_id) {
      updateApplication({ application_id: `app_${Date.now()}` });
    }
    updateApplication({ app_status: 'initiated', is_ai_audited: false });
    router.push('/address');
  }

  return (
    <FormLayout title="Loan Application Details">
      <p>Create <strong>application_id</strong></p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <TextInput label="Product" name="product" value={application.product || ''} onChange={(v) => updateApplication({ product: v })} />
        <TextInput label="Loan Amount" name="loan_amount" type="number" value={application.loan_amount || ''} onChange={(v) => updateApplication({ loan_amount: v })} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <TextInput label="Loan Tenure (months)" name="loan_tenure" type="number" value={application.loan_tenure || ''} onChange={(v) => updateApplication({ loan_tenure: v })} />
        <TextInput label="Loan ROI" name="loan_roi" type="number" value={application.loan_roi || ''} onChange={(v) => updateApplication({ loan_roi: v })} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <SelectInput label="Loan Type" name="loan_type" value={application.loan_type || ''} options={[{ value: 'home', label: 'Home' }, { value: 'personal', label: 'Personal' }, { value: 'business', label: 'Business' }]} onChange={(v) => updateApplication({ loan_type: v })} />
        <TextInput label="Branch ID" name="branch_id" value={application.branch_id || ''} onChange={(v) => updateApplication({ branch_id: v })} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <TextInput label="Servicing LA" name="servicing_la" value={application.servicing_la || ''} onChange={(v) => updateApplication({ servicing_la: v })} />
        <TextInput label="Application Date" name="application_date" type="date" value={application.application_date || ''} onChange={(v) => updateApplication({ application_date: v })} />
      </div>

      {error && <div style={{ marginBottom: 12, color: 'red' }}>{error}</div>}
      <div style={{ marginTop: 20 }}>
        <button onClick={handleNext}>Next: Address Details →</button>
      </div>

      <FlowNav prev="/applicant" next="/address" />
    </FormLayout>
  );
}
