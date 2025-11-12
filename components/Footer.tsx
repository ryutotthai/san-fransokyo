import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-emerald-100 bg-white/70">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 py-8 text-sm text-emerald-800 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12">
        <div className="space-y-1">
          <p className="font-semibold text-emerald-900">SoraSolar（空ソラー）</p>
          <p>Tokyo-based solar intelligence for rooftops, partners, and grid innovators.</p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <Link href="/contact" className="hover:text-emerald-900">
            Contact
          </Link>
          <Link href="/partners" className="hover:text-emerald-900">
            Partner network
          </Link>
          <a href="mailto:hello@sorasolar.com" className="hover:text-emerald-900">
            hello@sorasolar.com
          </a>
        </div>
        <p className="text-xs text-emerald-600">
          © {new Date().getFullYear()} SoraSolar. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

