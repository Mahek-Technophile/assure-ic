"use client"
import { useRouter } from "next/navigation";
import FlowNav from "../../components/FlowNav";

export default function Page() {
  const router = useRouter();
  return (
    <div style={{ padding: 24 }}>
      <h1>Work Details</h1>
      <p>Select Employment Type to branch the flow</p>

      <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
        <button onClick={() => router.push('/employee')}>Salaried → Employee Details</button>
        <button onClick={() => router.push('/business')}>Business → Business Details</button>
      </div>

      <FlowNav prev="/address" next={null} />
    </div>
  );
}
