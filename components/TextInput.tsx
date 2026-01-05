"use client"
import React from "react";

type Props = {
  label: string;
  name: string;
  value?: string;
  type?: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export default function TextInput({ label, name, value = "", type = "text", onChange, placeholder }: Props) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{ display: "block", fontWeight: 600 }}>{label}</label>
      <input
        name={name}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        style={{ padding: 8, width: "100%", boxSizing: "border-box" }}
      />
    </div>
  );
}
