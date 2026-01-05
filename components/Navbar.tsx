"use client"
import Link from "next/link";
import React from "react";

export default function Navbar() {
  return (
    <header style={{ borderBottom: '1px solid #e6e6e6', padding: 12, background: '#fff' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <Link href="/" style={{ fontWeight: 700, fontSize: 18, color: '#111' }}>Assure</Link>
        </div>

        <nav style={{ display: 'flex', gap: 12 }}>
          <Link href="/lead">Start Flow</Link>
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/login">Login</Link>
        </nav>
      </div>
    </header>
  );
}
