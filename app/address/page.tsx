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
  const [error, setError] = React.useState("");

  const current = application.current_address || {};
  const permanent = application.permanent_address || {};

  function updateCurrent(patch: Record<string, any>) {
    updateApplication({ current_address: { ...(application.current_address || {}), ...patch } });
  }

  function updatePermanent(patch: Record<string, any>) {
    updateApplication({ permanent_address: { ...(application.permanent_address || {}), ...patch } });
  }

  function handleNext() {
    setError("");
    const cur = application.current_address || {};
    const required = ['address','city','state_name','pincode'];
    const missing = required.filter((k) => !cur[k]);
    if (missing.length) { setError('Please fill current address: ' + missing.join(', ')); return; }
    if (cur.pincode && !/^[0-9]{5,6}$/.test(String(cur.pincode))) { setError('Pincode looks invalid'); return; }
    if (!application.same_as_permanent) {
      const perm = application.permanent_address || {};
      const missingPerm = required.filter((k) => !perm[k]);
      if (missingPerm.length) { setError('Please fill permanent address: ' + missingPerm.join(', ')); return; }
      if (perm.pincode && !/^[0-9]{5,6}$/.test(String(perm.pincode))) { setError('Permanent pincode looks invalid'); return; }
    }
    router.push('/employment-type');
  }

  return (
    <FormLayout title="Address Details">
      <p>Risk + residence verification</p>

      <h3>Section A: Current Address (Document-first)</h3>
      <FileUpload label="Upload Address Proof" onFileChange={(f) => updateCurrent({ address_proof_file: f })} />

      <TextInput label="Address Line" name="address" value={current.address || ''} onChange={(v) => updateCurrent({ address: v })} />
      <TextInput label="Street" name="street" value={current.street || ''} onChange={(v) => updateCurrent({ street: v })} />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <TextInput label="City" name="city" value={current.city || ''} onChange={(v) => updateCurrent({ city: v })} />
        <TextInput label="State" name="state_name" value={current.state_name || ''} onChange={(v) => updateCurrent({ state_name: v })} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <TextInput label="Pincode" name="pincode" value={current.pincode || ''} onChange={(v) => updateCurrent({ pincode: v })} />
        <SelectInput label="Address Type" name="address_proof_type" value={current.address_proof_type || ''} options={[{ value: 'rental', label: 'Rental' }, { value: 'owned', label: 'Owned' }, { value: 'others', label: 'Others' }]} onChange={(v) => updateCurrent({ address_proof_type: v })} />
      </div>

      <SelectInput label="Ownership Status" name="ownership_status" value={current.ownership_status || ''} options={[{ value: 'self', label: 'Self' }, { value: 'family', label: 'Family' }, { value: 'rented', label: 'Rented' }]} onChange={(v) => updateCurrent({ ownership_status: v })} />

      <h3 style={{ marginTop: 16 }}>Section B: Permanent Address</h3>
      <div style={{ marginBottom: 12 }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input type="checkbox" checked={!!application.same_as_permanent} onChange={(e) => updateApplication({ same_as_permanent: e.target.checked })} />
          <span>Is permanent address same as current?</span>
        </label>
      </div>

      {!application.same_as_permanent && (
        <div>
          <TextInput label="Permanent Address Line" name="perm_address" value={permanent.address || ''} onChange={(v) => updatePermanent({ address: v })} />
          <TextInput label="Permanent Street" name="perm_street" value={permanent.street || ''} onChange={(v) => updatePermanent({ street: v })} />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <TextInput label="Permanent City" name="perm_city" value={permanent.city || ''} onChange={(v) => updatePermanent({ city: v })} />
            <TextInput label="Permanent State" name="perm_state_name" value={permanent.state_name || ''} onChange={(v) => updatePermanent({ state_name: v })} />
          </div>

          <TextInput label="Permanent Pincode" name="perm_pincode" value={permanent.pincode || ''} onChange={(v) => updatePermanent({ pincode: v })} />
        </div>
      )}

      {error && <div style={{ marginBottom: 12, color: 'red' }}>{error}</div>}
      <div style={{ marginTop: 20 }}>
        <button onClick={handleNext}>Next: Employment Type →</button>
      </div>

      <FlowNav prev="/application" next="/employment-type" />
    </FormLayout>
  );
}
