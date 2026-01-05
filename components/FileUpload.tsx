"use client"
import React from "react";

type Props = {
  label: string;
  onFileChange: (file: File | null) => void;
};

export default function FileUpload({ label, onFileChange }: Props) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{ display: "block", fontWeight: 600 }}>{label}</label>
      <input type="file" onChange={(e) => onFileChange(e.target.files ? e.target.files[0] : null)} />
    </div>
  );
}
