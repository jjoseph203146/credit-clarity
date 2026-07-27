import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DocPageLoader } from "@/components/pdf-report/doc-page-loader";
import { reportMono, reportSans, sansFontFamily } from "@/components/pdf-report/fonts";
import { buildPdfReportData } from "@/components/pdf-report/report-data";
import { Page01Cover } from "@/components/pdf-report/pages/Page01Cover";
import { Page02ExecutiveSummary } from "@/components/pdf-report/pages/Page02ExecutiveSummary";
import { Page03Snapshot } from "@/components/pdf-report/pages/Page03Snapshot";
import { Page04Understanding } from "@/components/pdf-report/pages/Page04Understanding";
import { Page05Accounts1 } from "@/components/pdf-report/pages/Page05Accounts1";
import { Page06Accounts2 } from "@/components/pdf-report/pages/Page06Accounts2";
import { Page07Collections } from "@/components/pdf-report/pages/Page07Collections";
import { Page08Inquiries } from "@/components/pdf-report/pages/Page08Inquiries";
import { Page09Errors } from "@/components/pdf-report/pages/Page09Errors";
import { Page10ActionPlan } from "@/components/pdf-report/pages/Page10ActionPlan";
import { Page11Toolkit1 } from "@/components/pdf-report/pages/Page11Toolkit1";
import { Page12Toolkit2 } from "@/components/pdf-report/pages/Page12Toolkit2";
import { Page13NextReview } from "@/components/pdf-report/pages/Page13NextReview";
import type {
  ActionPlan,
  Report,
  ReportAccount,
  ReportCollection,
  ReportInquiry,
  User,
} from "@/lib/supabase/types";

/**
 * The 13-page PDF report (`Credit Clarity PDF Report.dc.html`), rendered
 * from the real, signed-in user's `reports/:id` data — fetched with the
 * same RLS-scoped-client + ownership pattern as `reports/[id]/page.tsx`.
 */
export default async function PdfReportPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser) redirect("/login");

  const { data: report } = await supabase
    .from("reports")
    .select("*")
    .eq("id", params.id)
    .eq("user_id", authUser.id)
    .is("deleted_at", null)
    .returns<Report[]>()
    .maybeSingle();

  if (!report) notFound();

  const [{ data: accounts }, { data: collections }, { data: inquiries }, { data: actionPlan }, { data: profile }] =
    await Promise.all([
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
      supabase
        .from("action_plans")
        .select("*")
        .eq("report_id", report.id)
        .returns<ActionPlan[]>()
        .maybeSingle(),
      supabase
        .from("users")
        .select("*")
        .eq("id", authUser.id)
        .returns<User[]>()
        .maybeSingle(),
    ]);

  const data = buildPdfReportData(
    report,
    profile ?? null,
    accounts ?? [],
    collections ?? [],
    inquiries ?? [],
    actionPlan ?? null,
  );

  return (
    <div className={`${reportSans.variable} ${reportMono.variable}`}>
      {/* Per doc-page.js's own usage docs: hide the custom element until
          the browser has upgraded it, to avoid a flash of unstyled content. */}
      <style>{`doc-page:not(:defined){visibility:hidden}`}</style>
      <DocPageLoader />
      <div style={{ fontFamily: sansFontFamily, color: "#16283e" }}>
        <doc-page size="letter">
          <Page01Cover data={data} />
          <Page02ExecutiveSummary data={data} />
          <Page03Snapshot data={data} />
          <Page04Understanding data={data} />
          <Page05Accounts1 data={data} />
          <Page06Accounts2 data={data} />
          <Page07Collections data={data} />
          <Page08Inquiries data={data} />
          <Page09Errors data={data} />
          <Page10ActionPlan data={data} />
          <Page11Toolkit1 data={data} />
          <Page12Toolkit2 data={data} />
          <Page13NextReview data={data} />
        </doc-page>
      </div>
    </div>
  );
}
