"use client"
import { useRouter } from "next/navigation";
import FlowNav from "../../components/FlowNav";
import FormLayout from "../../components/FormLayout";
import { useFormFlow } from "../../context/FormFlowContext";
import React from "react";

export default function Page() {
  const router = useRouter();
  const { application, updateApplication } = useFormFlow();

  function handleNext() {
    // Require processing fees ack and T&C
    if (!application.processing_fees_acknowledged || !application.terms_accepted) {
      alert('Please acknowledge processing fees and accept Terms & Conditions to proceed.');
      return;
    }
    router.push('/banking');
  }

  return (
    <FormLayout title="Charges & Confirmation">
      <p>Processing Fees Acknowledgement and Terms & Conditions Consent are mandatory.</p>

      <div style={{ marginTop: 12 }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input type="checkbox" checked={!!application.processing_fees_acknowledged} onChange={(e) => updateApplication({ processing_fees_acknowledged: e.target.checked })} />
          <span>Processing Fees Acknowledgement</span>
        </label>
      </div>

      <div style={{ marginTop: 8 }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input type="checkbox" checked={!!application.terms_accepted} onChange={(e) => updateApplication({ terms_accepted: e.target.checked })} />
          <span>Terms & Conditions Consent</span>
        </label>
      </div>

      <div style={{ marginTop: 20 }}>
        <button onClick={handleNext}>Next: Banking Details →</button>
      </div>

      <FlowNav prev="/employment-type" next="/banking" />
    </FormLayout>
  );
}
