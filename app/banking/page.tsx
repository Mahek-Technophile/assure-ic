"use client"
import { useRouter } from "next/navigation";
import FlowNav from "../../components/FlowNav";
import FormLayout from "../../components/FormLayout";
import TextInput from "../../components/TextInput";
import SelectInput from "../../components/SelectInput";
import FileUpload from "../../components/FileUpload";
import { useFormFlow } from "../../context/FormFlowContext";
import React from "react";

export default function Page() {
  const router = useRouter();
  const { application, updateApplication } = useFormFlow();

  const bank = application.bank_details || {};

  function updateBank(patch: Record<string, any>) {
    updateApplication({ bank_details: { ...(application.bank_details || {}), ...patch } });
  }

  function handleNext() {
    // basic validation: account numbers should match
    if (bank.account_number && bank.confirm_account_number && bank.account_number !== bank.confirm_account_number) {
      alert('Account numbers do not match');
      return;
    }
    router.push('/review');
  }

  return (
    <FormLayout title="Bank Account Details">
      <p>Upload cancelled cheque / passbook (auto-extract fields)</p>

      <FileUpload label="Upload Cancelled Cheque / Passbook" onFileChange={(f) => updateBank({ bank_doc: f })} />

      <TextInput label="Account Holder Name" name="account_holder_name" value={bank.account_holder_name || ''} onChange={(v) => updateBank({ account_holder_name: v })} />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <TextInput label="Account Number" name="account_number" value={bank.account_number || ''} onChange={(v) => updateBank({ account_number: v })} />
        <TextInput label="Confirm Account Number" name="confirm_account_number" value={bank.confirm_account_number || ''} onChange={(v) => updateBank({ confirm_account_number: v })} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <TextInput label="IFSC Code" name="ifsc_code" value={bank.ifsc_code || ''} onChange={(v) => updateBank({ ifsc_code: v })} />
        <TextInput label="Bank Name" name="bank_name" value={bank.bank_name || ''} onChange={(v) => updateBank({ bank_name: v })} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <TextInput label="Branch Name" name="branch_name" value={bank.branch_name || ''} onChange={(v) => updateBank({ branch_name: v })} />
        <SelectInput label="Account Type" name="account_type" value={bank.account_type || ''} options={[{ value: 'savings', label: 'Savings' }, { value: 'current', label: 'Current' }]} onChange={(v) => updateBank({ account_type: v })} />
      </div>

      <TextInput label="Account Linked Mobile" name="acc_linked_mobile" value={bank.acc_linked_mobile || ''} onChange={(v) => updateBank({ acc_linked_mobile: v })} />

      <div style={{ marginTop: 20 }}>
        <button onClick={handleNext}>Next: Review & Submit →</button>
      </div>

      <FlowNav prev="/charges" next="/review" />
    </FormLayout>
  );
}
