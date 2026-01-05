"use client"
import { useRouter } from "next/navigation";
import FlowNav from "../../components/FlowNav";
import FormLayout from "../../components/FormLayout";
import TextInput from "../../components/TextInput";
import FileUpload from "../../components/FileUpload";
import SelectInput from "../../components/SelectInput";
import { useFormFlow } from "../../context/FormFlowContext";
import React from "react";

export default function Page() {
  const router = useRouter();
  const { application, updateApplication } = useFormFlow();

  const biz = application.business_details || {};

  function updateBiz(patch: Record<string, any>) {
    updateApplication({ employment_type: 'business', business_details: { ...(application.business_details || {}), ...patch } });
  }

  function handleNext() {
    router.push('/charges');
  }

  return (
    <FormLayout title="Business Details (Self-Employed)">
      <FileUpload label="Upload GST / Registration / ITR" onFileChange={(f) => updateBiz({ business_doc: f })} />

      <TextInput label="Business Company Name" name="business_company_name" value={biz.business_company_name || ''} onChange={(v) => updateBiz({ business_company_name: v })} />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <SelectInput label="Business Type" name="business_type" value={biz.business_type || ''} options={[{ value: 'proprietorship', label: 'Proprietorship' }, { value: 'private', label: 'Private Limited' }, { value: 'llp', label: 'LLP' }]} onChange={(v) => updateBiz({ business_type: v })} />
        <TextInput label="Incorporation Date" name="incorporation_date" type="date" value={biz.incorporation_date || ''} onChange={(v) => updateBiz({ incorporation_date: v })} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <TextInput label="Years in Operation" name="years_in_operation" type="number" value={biz.years_in_operation || ''} onChange={(v) => updateBiz({ years_in_operation: v })} />
        <TextInput label="Annual Turnover" name="annual_turnover" type="number" value={biz.annual_turnover || ''} onChange={(v) => updateBiz({ annual_turnover: v })} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <TextInput label="GSTIN" name="gstin" value={biz.gstin || ''} onChange={(v) => updateBiz({ gstin: v })} />
        <TextInput label="Number of Branches" name="number_of_branches" type="number" value={biz.number_of_branches || ''} onChange={(v) => updateBiz({ number_of_branches: v })} />
      </div>

      <TextInput label="Business Address" name="business_address" value={biz.business_address || ''} onChange={(v) => updateBiz({ business_address: v })} />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <TextInput label="Business Contact Number" name="business_contact_number" value={biz.business_contact_number || ''} onChange={(v) => updateBiz({ business_contact_number: v })} />
        <TextInput label="Existing EMI Amount" name="existing_emi_amount" type="number" value={biz.existing_emi_amount || ''} onChange={(v) => updateBiz({ existing_emi_amount: v })} />
      </div>

      <TextInput label="Business Credit Score" name="business_credit_score" type="number" value={biz.business_credit_score || ''} onChange={(v) => updateBiz({ business_credit_score: v })} />

      <div style={{ marginTop: 20 }}>
        <button onClick={handleNext}>Next: Charges →</button>
      </div>

      <FlowNav prev="/employment-type" next="/charges" />
    </FormLayout>
  );
}
