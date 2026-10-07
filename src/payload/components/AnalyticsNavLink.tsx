import Link from "next/link";

/** Panel menüsünün başında "Ziyaretçi Analizi" bağlantısı */
export function AnalyticsNavLink() {
  return (
    <Link href="/admin/analiz" className="guru-nav-analiz">
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.9">
        <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" strokeLinecap="round" />
      </svg>
      Ziyaretçi Analizi
    </Link>
  );
}
