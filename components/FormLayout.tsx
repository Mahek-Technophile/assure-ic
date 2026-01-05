"use client"
import React from "react";

export default function FormLayout({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div style={{ padding: 24, maxWidth: 800, margin: '0 auto' }}>
      {title && <h1>{title}</h1>}
      <div style={{ background: '#fff', padding: 16, borderRadius: 8 }}>{children}</div>
    </div>
  );
}
