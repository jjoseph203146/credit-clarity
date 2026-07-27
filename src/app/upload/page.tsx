"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { MarketingNav } from "@/components/marketing/MarketingNav";
import { createClient } from "@/lib/supabase/client";

const MONO = "font-[family-name:var(--font-jetbrains-mono)]";

const MAX_BYTES = 15 * 1024 * 1024; // 15MB

type UploadPhase = "empty" | "uploading" | "processing" | "error";

function isPdf(file: File) {
  return (
    file.type === "application/pdf" ||
    file.name.toLowerCase().endsWith(".pdf")
  );
}

function formatBytes(bytes: number) {
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function UploadPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<UploadPhase>("empty");
  const [pct, setPct] = useState(0);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  function openFilePicker() {
    inputRef.current?.click();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file after an error
    if (!file) return;

    if (!isPdf(file)) {
      setErrorMessage("This doesn't look like a PDF. Please upload your credit report as a PDF file.");
      setPhase("error");
      return;
    }

    if (file.size > MAX_BYTES) {
      setErrorMessage("That file is larger than 15MB. Please upload a smaller PDF.");
      setPhase("error");
      return;
    }

    void runUpload(file);
  }

  async function runUpload(file: File) {
    setFileName(file.name);
    setFileSize(file.size);
    setErrorMessage(null);
    setPhase("uploading");
    setPct(0);

    try {
      // Step 1 of the core flow (BUILD.md): create the report row + signed
      // Storage upload URL.
      const uploadRes = await fetch("/api/upload", { method: "POST" });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) {
        throw new Error(uploadData.error ?? "Couldn't start the upload. Please try again.");
      }
      const { reportId, path, token } = uploadData as {
        reportId: string;
        path: string;
        token: string;
      };

      setPct(35);

      const supabase = createClient();
      const { error: storageError } = await supabase.storage
        .from("reports")
        .uploadToSignedUrl(path, token, file);

      if (storageError) {
        throw new Error(storageError.message ?? "Couldn't upload your file. Please try again.");
      }

      setPct(100);
      setPhase("processing");

      // Step 2 of the core flow (BUILD.md): server-side parse job.
      const parseRes = await fetch("/api/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId }),
      });
      const parseData = await parseRes.json();
      if (!parseRes.ok) {
        throw new Error(parseData.error ?? "Couldn't process your report. Please try again.");
      }

      router.push(`/preview?reportId=${reportId}`);
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Something went wrong. Please try again.",
      );
      setPhase("error");
    }
  }

  function resetUpload() {
    setPhase("empty");
    setPct(0);
    setFileName(null);
    setFileSize(null);
    setErrorMessage(null);
  }

  return (
    <div>
      <MarketingNav />
      <div className="mx-auto max-w-[680px] px-8 pb-24 pt-16">
        <div className="mb-9 text-center">
          <h1 className="mb-2.5 text-[32px] tracking-[-.025em]">
            Upload your credit report securely.
          </h1>
          <p className="text-[15.5px] text-muted">
            No account needed to get your free preview. Your file is encrypted the
            moment it arrives.
          </p>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,.pdf"
          className="hidden"
          onChange={handleFileChange}
        />

        {phase === "empty" && (
          <div
            onClick={openFilePicker}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") openFilePicker();
            }}
            className="cursor-pointer rounded-[20px] border-2 border-dashed border-[#b9c8da] bg-white px-8 py-14 text-center transition-colors hover:border-teal"
          >
            <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e6f5ef] text-2xl font-bold text-teal">
              ↑
            </div>
            <div className="mb-1.5 text-[17px] font-bold">
              Drag &amp; drop your credit report
            </div>
            <div className="mb-[18px] text-sm text-muted">
              or click to browse your files
            </div>
            <div className="mb-2.5 text-[11px] font-bold tracking-[.08em] text-[#8fa3ba]">
              SUPPORTED REPORTS · PDF
            </div>
            <div className="inline-flex gap-2.5">
              <div className="flex h-11 items-center rounded-[10px] border border-border bg-white px-3.5 text-sm font-semibold text-[#3d5068]">
                Experian
              </div>
              <div className="flex h-11 items-center rounded-[10px] border border-border bg-white px-3.5 text-sm font-semibold text-[#3d5068]">
                Equifax
              </div>
              <div className="flex h-11 items-center rounded-[10px] border border-border bg-white px-3.5 text-sm font-semibold text-[#3d5068]">
                TransUnion
              </div>
            </div>
          </div>
        )}

        {phase === "uploading" && (
          <div className="rounded-[20px] border border-border bg-white p-9">
            <div className="mb-5 flex items-center gap-3.5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#eef2f7] text-[11px] font-bold text-muted">
                PDF
              </div>
              <div className="flex-1">
                <div className="text-[15px] font-semibold">{fileName}</div>
                <div className="text-[12.5px] text-[#8fa3ba]">
                  {fileSize != null ? `${formatBytes(fileSize)} · ` : ""}Uploading…
                </div>
              </div>
              <div className={`text-[15px] font-semibold text-teal ${MONO}`}>
                {Math.round(pct)}%
              </div>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-[#eef2f7]">
              <div
                className="h-full rounded-full bg-[linear-gradient(90deg,#0e9f77,#2ee6a8)] transition-[width] duration-150"
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="mt-3.5 text-[12.5px] text-[#8fa3ba]">
              🔐 Encrypted in transit with TLS 1.3 · Encrypted at rest with AES-256
            </div>
          </div>
        )}

        {phase === "processing" && (
          <div className="rounded-[20px] border border-border bg-white p-11 text-center">
            <div className="mx-auto mb-4 h-11 w-11 animate-spin rounded-full border-[3px] border-border border-t-teal" />
            <div className="mb-1.5 text-[17px] font-bold">Validating your report…</div>
            <div className="text-sm text-muted">
              Checking format, bureau, and report date. This takes a few seconds.
            </div>
          </div>
        )}

        {phase === "error" && (
          <div className="rounded-[20px] border border-[#f0d4d4] bg-white p-9 text-center">
            <div className="mb-3.5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fbecec] text-xl font-bold text-[#c23e3e]">
              ✕
            </div>
            <div className="mb-1.5 text-[17px] font-bold">
              We couldn&apos;t read that file
            </div>
            <div className="mx-auto mb-5 max-w-[400px] text-sm text-muted">
              {errorMessage ??
                "This doesn't look like a credit report PDF from Experian, Equifax, or TransUnion. Screenshots and scanned images aren't supported yet."}
            </div>
            <button
              onClick={resetUpload}
              className="rounded-[11px] bg-navy px-[22px] py-3 text-[14.5px] font-semibold text-white transition-colors hover:bg-[#123152]"
            >
              Try Another File
            </button>
          </div>
        )}

        <div className="mt-7 grid grid-cols-3 gap-3 text-center max-sm:grid-cols-1">
          <div className="text-[12.5px] text-muted">
            <div className="mb-0.5 font-bold text-ink">Where to get your report</div>
            annualcreditreport.com — free weekly
          </div>
          <div className="text-[12.5px] text-muted">
            <div className="mb-0.5 font-bold text-ink">We never pull your credit</div>
            No inquiry, no SSN required
          </div>
          <div className="text-[12.5px] text-muted">
            <div className="mb-0.5 font-bold text-ink">Delete anytime</div>
            One click removes your data
          </div>
        </div>
      </div>
    </div>
  );
}
