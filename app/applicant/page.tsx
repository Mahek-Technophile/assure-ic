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
  const { applicant, updateApplicant } = useFormFlow();
  const [error, setError] = React.useState("");

  return (
    <FormLayout title="Personal Details">
      <p>Convert lead → verified applicant (applicant_id)</p>

      <h3>Section A: Basic Identity (Document-first)</h3>
      <FileUpload label="Upload ID Proof (Aadhaar / PAN / Passport)" onFileChange={(f) => updateApplicant({ id_proof_file: f })} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <TextInput label="First Name" name="applicant_fname" value={applicant.applicant_fname || ''} onChange={(v) => updateApplicant({ applicant_fname: v })} />
        <TextInput label="Last Name" name="applicant_lname" value={applicant.applicant_lname || ''} onChange={(v) => updateApplicant({ applicant_lname: v })} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <SelectInput label="Gender" name="gender" value={applicant.gender || ''} options={[{ value: 'male', label: 'Male' }, { value: 'female', label: 'Female' }, { value: 'other', label: 'Other' }]} onChange={(v) => updateApplicant({ gender: v })} />
        <TextInput label="Date of Birth" name="dob" type="date" value={applicant.dob || ''} onChange={(v) => updateApplicant({ dob: v })} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <TextInput label="Nationality" name="nationality" value={applicant.nationality || ''} onChange={(v) => updateApplicant({ nationality: v })} />
        <TextInput label="Citizenship" name="citizenship" value={applicant.citizenship || ''} onChange={(v) => updateApplicant({ citizenship: v })} />
      </div>

      <TextInput label="Residential Status" name="residential_status" value={applicant.residential_status || ''} onChange={(v) => updateApplicant({ residential_status: v })} />

      <h3>Section B: Contact Details</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <TextInput label="Primary Contact Number" name="prim_contact_number" value={applicant.prim_contact_number || ''} onChange={(v) => updateApplicant({ prim_contact_number: v })} />
        <TextInput label="Primary Email" name="prim_email" type="email" value={applicant.prim_email || ''} onChange={(v) => updateApplicant({ prim_email: v })} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <TextInput label="Secondary Contact Number" name="sec_contact_number" value={applicant.sec_contact_number || ''} onChange={(v) => updateApplicant({ sec_contact_number: v })} />
        <TextInput label="Secondary Email" name="sec_email" type="email" value={applicant.sec_email || ''} onChange={(v) => updateApplicant({ sec_email: v })} />
      </div>

      <h3>Section C: Family Details</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <SelectInput label="Marital Status" name="marital_status" value={applicant.marital_status || ''} options={[{ value: 'single', label: 'Single' }, { value: 'married', label: 'Married' }, { value: 'other', label: 'Other' }]} onChange={(v) => updateApplicant({ marital_status: v })} />
        <TextInput label="Spouse Name" name="spouse_name" value={applicant.spouse_name || ''} onChange={(v) => updateApplicant({ spouse_name: v })} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <TextInput label="Father Name" name="father_name" value={applicant.father_name || ''} onChange={(v) => updateApplicant({ father_name: v })} />
        <TextInput label="Mother Name" name="mother_name" value={applicant.mother_name || ''} onChange={(v) => updateApplicant({ mother_name: v })} />
      </div>

      <h3>Section D: Other Details</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <TextInput label="Education Qualification" name="education_qualification" value={applicant.education_qualification || ''} onChange={(v) => updateApplicant({ education_qualification: v })} />
        <TextInput label="Social Category" name="social_category" value={applicant.social_category || ''} onChange={(v) => updateApplicant({ social_category: v })} />
      </div>

      <div style={{ marginTop: 16 }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input type="checkbox" checked={!!applicant.cibil_consent} onChange={(e) => updateApplicant({ cibil_consent: e.target.checked })} />
          <span>CIBIL Consent</span>
        </label>
      </div>

      {error && <div style={{ marginBottom: 12, color: 'red' }}>{error}</div>}
      <div style={{ marginTop: 20, display: 'flex', gap: 8 }}>
        <button onClick={() => {
          setError("");
          const required = ['applicant_fname','applicant_lname','dob','prim_contact_number','prim_email'];
          const missing = required.filter((k) => !applicant[k]);
          if (missing.length) { setError('Please fill: ' + missing.join(', ')); return; }
          if (!applicant.applicant_id) updateApplicant({ applicant_id: `applicant_${Date.now()}` });
          router.push('/application');
        }}>Proceed to Application →</button>
      </div>

      <FlowNav prev="/lead" next="/application" />
    </FormLayout>
  );
}
