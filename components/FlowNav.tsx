"use client"
import { useRouter } from "next/navigation";
import React from "react";

export default function FlowNav({ prev, next }: { prev?: string | null; next?: string | null }) {
  const router = useRouter();
  return (
    <div style={{ marginTop: 24, display: 'flex', gap: 8 }}>
      <button onClick={() => prev ? router.push(prev) : router.back()} disabled={!prev}>
        ← Previous
      </button>
      {next && <button onClick={() => router.push(next)}>Next →</button>}
    </div>
  );
}
