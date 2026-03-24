import LegalPageHeader, {
  LEGAL_PAGE_HEADER_OFFSET_CLASS,
  LEGAL_PAGE_HEADLINE_TOP_CLASS,
} from "@/components/legal/LegalPageHeader";
import { cn } from "@/lib/utils";

type LegalPageLayoutProps = {
  title: string;
  children: React.ReactNode;
};

export default function LegalPageLayout({
  title,
  children,
}: LegalPageLayoutProps) {
  return (
    <div className="min-h-screen bg-background font-sans text-foreground antialiased">
      <LegalPageHeader />

      <main
        className={cn(
          "mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:py-14",
          LEGAL_PAGE_HEADER_OFFSET_CLASS,
        )}
      >
        <h1
          className={cn(
            LEGAL_PAGE_HEADLINE_TOP_CLASS,
            "text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl",
          )}
        >
          {title}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Last updated:{" "}
          {new Date().toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
        <div
          className={cn(
            "mt-10 max-w-none font-sans text-base",
            "prose prose-lg prose-slate",
            "prose-headings:font-semibold prose-headings:tracking-tight prose-headings:text-slate-900",
            "prose-h2:text-lg sm:prose-h2:text-xl",
            "prose-h3:font-semibold prose-h3:text-slate-800",
            "prose-p:leading-relaxed prose-p:text-slate-600",
            "prose-a:font-medium prose-a:text-primary prose-a:no-underline hover:prose-a:underline",
            "prose-strong:font-semibold prose-strong:text-slate-900",
            "prose-li:text-slate-600 prose-li:marker:text-slate-400",
          )}
        >
          {children}
        </div>
      </main>
    </div>
  );
}
