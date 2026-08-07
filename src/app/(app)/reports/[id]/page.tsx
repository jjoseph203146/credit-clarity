import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ReportViewer } from "@/components/app/report-viewer";
import { bureauLabel, formatDate, statusLabel } from "@/lib/report-derivations";
import type { Report, ReportAccount, ReportCollection, ReportInquiry } from "@/lib/supabase/types";

export default async function ReportViewerPage({ params }: { params: Promise<{ id: string }> }) {
  // Next 16: route params are async.
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: report } = await supabase
    .from("reports")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .returns<Report[]>()
    .maybeSingle();

  if (!report) notFound();

  const [{ data: accounts }, { data: collections }, { data: inquiries }] = await Promise.all([
    supabase
      .from("report_accounts")
      .select("*")
      .eq("report_id", report.id)
      .order("impact", { ascending: false })
      .returns<ReportAccount[]>(),
    supabase
      .from("report_collections")
      .select("*")
      .eq("report_id", report.id)
      .returns<ReportCollection[]>(),
    supabase
      .from("report_inquiries")
      .select("*")
      .eq("report_id", report.id)
      .order("inquiry_date", { ascending: false })
      .returns<ReportInquiry[]>(),
  ]);

  return (
    <ReportViewer
      report={report}
      accounts={accounts ?? []}
      collections={collections ?? []}
      inquiries={inquiries ?? []}
      reportLabel={`${formatDate(report.report_date, { month: "short", year: "numeric" })} Report`}
      reportSub={`${bureauLabel(report.bureau)} · ${statusLabel(report.status)}`}
    />
  );
}
