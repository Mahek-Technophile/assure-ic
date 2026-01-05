"use client"
import React from "react";

type Option = { value: string; label: string };

type Props = {
  label: string;
  name: string;
  value?: string;
  options: Option[];
  onChange: (value: string) => void;
};

export default function SelectInput({ label, name, value = "", options, onChange }: Props) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{ display: "block", fontWeight: 600 }}>{label}</label>
      <select name={name} value={value} onChange={(e) => onChange(e.target.value)} style={{ padding: 8, width: "100%" }}>
        <option value="">Select</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}
