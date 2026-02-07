import { Suspense } from "react";
import PDFGenerator from "@/components/pdf/PDFGenerator";

export default async function Page() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading PDF Generator...</div>}>
      <PDFGenerator />
    </Suspense>
  );
}