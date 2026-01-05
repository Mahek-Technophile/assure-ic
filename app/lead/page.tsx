"use client"
import { useRouter } from "next/navigation";
import FlowNav from "../../components/FlowNav";
import FormLayout from "../../components/FormLayout";
import TextInput from "../../components/TextInput";
import { useFormFlow, FormFlowProvider } from "../../context/FormFlowContext";
import React from "react";

function LeadFormInner() {
  const router = useRouter();
  const { lead, updateLead } = useFormFlow();
  const [error, setError] = React.useState("");

  function handleStart() {
    setError("");
    const required = ['lead_name','lead_ph_no','lead_email','lead_city','lead_product','lead_source'];
    const missing = required.filter((k) => !lead[k]);
    if (missing.length) {
      setError('Please fill: ' + missing.join(', '));
      return;
    }
    if (!lead.lead_id) updateLead({ lead_id: `lead_${Date.now()}` });
    router.push('/applicant');
  }

  return (
    <FormLayout title="Check Eligibility">
      <p>Minimal lead capture to create <strong>lead_id</strong>.</p>

      {error && <div style={{ marginBottom: 12, color: 'red' }}>{error}</div>}

      <TextInput label="Full Name" name="lead_name" value={lead.lead_name || ""} onChange={(v) => updateLead({ lead_name: v })} />
      <TextInput label="Mobile Number" name="lead_ph_no" value={lead.lead_ph_no || ""} onChange={(v) => updateLead({ lead_ph_no: v })} />
      <TextInput label="Email ID" name="lead_email" type="email" value={lead.lead_email || ""} onChange={(v) => updateLead({ lead_email: v })} />
      <TextInput label="City" name="lead_city" value={lead.lead_city || ""} onChange={(v) => updateLead({ lead_city: v })} />
      <TextInput label="Product Type" name="lead_product" value={lead.lead_product || ""} onChange={(v) => updateLead({ lead_product: v })} />
      <TextInput label="Lead Source" name="lead_source" value={lead.lead_source || ""} onChange={(v) => updateLead({ lead_source: v })} />

      <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
        <button onClick={handleStart}>Start Applicant Details →</button>
      </div>

      <FlowNav prev={null} next="/applicant" />
    </FormLayout>
  );
}

export default function Page() {
  return (
    <FormFlowProvider>
      <LeadFormInner />
    </FormFlowProvider>
  );
}
