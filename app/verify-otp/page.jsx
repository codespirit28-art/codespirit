"use client";

import { Suspense } from "react";
import VerifyOtpContent from "./VerifyOtpContent";

export default function VerifyOtpPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#020617] text-white flex items-center justify-center">
          Loading...
        </main>
      }
    >
      <VerifyOtpContent />
    </Suspense>
  );
}