
  'use client'

import Image from "next/image";
import { useEffect, useState } from "react";

export default function Home() {
  const [backendStatus, setBackendStatus] = useState("Checking backend connection...");

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/health`)
      .then((res) => {
        if (!res.ok) throw new Error("Not OK");
        return res.text();
      })
      .then(() => {
        setBackendStatus("✅ Backend connected successfully");
      })
      .catch((err) => {
        console.error(err);
        setBackendStatus("❌ Backend NOT reachable (check CORS / URL)");
      });
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={100}
          height={20}
          priority
        />

        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            Assure Frontend Status
          </h1>

          <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            {backendStatus}
          </p>
        </div>
      </main>
    </div>
  );
}


