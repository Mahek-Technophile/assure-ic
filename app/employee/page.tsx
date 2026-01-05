"use client"
import { useRouter } from "next/navigation";
import FlowNav from "../../components/FlowNav";
import FormLayout from "../../components/FormLayout";
import TextInput from "../../components/TextInput";
import FileUpload from "../../components/FileUpload";
import { useFormFlow } from "../../context/FormFlowContext";
import React from "react";

export default function Page() {
  const router = useRouter();
  const { application, updateApplication } = useFormFlow();

  const emp = application.employment_details || {};

  function updateEmp(patch: Record<string, any>) {
    updateApplication({ employment_type: 'salaried', employment_details: { ...(application.employment_details || {}), ...patch } });
  }

  function handleNext() {
    router.push('/charges');
  }

  return (
    <FormLayout title="Employment Details (Salaried)">
      <FileUpload label="Upload Salary Slip / Offer Letter / Bank Statement" onFileChange={(f) => updateEmp({ salary_doc: f })} />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <TextInput label="Employer Name" name="employer_name" value={emp.employer_name || ''} onChange={(v) => updateEmp({ employer_name: v })} />
        <TextInput label="Designation" name="designation" value={emp.designation || ''} onChange={(v) => updateEmp({ designation: v })} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <TextInput label="Monthly Income" name="monthly_income" type="number" value={emp.monthly_income || ''} onChange={(v) => updateEmp({ monthly_income: v })} />
        <TextInput label="Employment Start Date" name="start_date" type="date" value={emp.start_date || ''} onChange={(v) => updateEmp({ start_date: v })} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <TextInput label="Employment Tenure (Years)" name="employment_tenure_years" type="number" value={emp.employment_tenure_years || ''} onChange={(v) => updateEmp({ employment_tenure_years: v })} />
        <TextInput label="Employment Tenure (Months)" name="employment_tenure_months" type="number" value={emp.employment_tenure_months || ''} onChange={(v) => updateEmp({ employment_tenure_months: v })} />
      </div>

      <TextInput label="Employer Address" name="employer_address" value={emp.employer_address || ''} onChange={(v) => updateEmp({ employer_address: v })} />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <TextInput label="Employer Phone Number" name="employer_ph_no" value={emp.employer_ph_no || ''} onChange={(v) => updateEmp({ employer_ph_no: v })} />
        <TextInput label="Employer Email" name="employer_emailid" type="email" value={emp.employer_emailid || ''} onChange={(v) => updateEmp({ employer_emailid: v })} />
      </div>

      <TextInput label="Department" name="department" value={emp.department || ''} onChange={(v) => updateEmp({ department: v })} />

      <div style={{ marginTop: 20 }}>
        <button onClick={handleNext}>Next: Charges →</button>
      </div>

      <FlowNav prev="/employment-type" next="/charges" />
    </FormLayout>
  );
}
