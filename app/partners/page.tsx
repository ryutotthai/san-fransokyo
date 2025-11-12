'use client';

import { useEffect, useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

type Partner = {
  id: string;
  name: string;
  specialty: string;
  coverage: string;
  phone: string;
  email: string;
  languages: string[];
};

export default function PartnersPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");

  useEffect(() => {
    const fetchPartners = async () => {
      try {
        setStatus("loading");
        const response = await fetch("/api/partners");
        if (!response.ok) {
          throw new Error("Failed to load partners");
        }
        const data = (await response.json()) as Partner[];
        setPartners(data);
        setStatus("idle");
      } catch (error) {
        console.error(error);
        setStatus("error");
      }
    };

    fetchPartners();
  }, []);

  const filteredPartners = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return partners;
    }
    return partners.filter((partner) => {
      const haystack = [partner.name, partner.specialty, partner.coverage, ...partner.languages].join(
        " "
      );
      return haystack.toLowerCase().includes(normalized);
    });
  }, [query, partners]);

  return (
    <div className="min-h-screen bg-linear-to-b from-emerald-50 via-white to-amber-50 text-emerald-950">
      <Navbar />
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-12 px-6 pb-16 pt-16 sm:px-8 lg:px-12">
        <header className="space-y-4">
          <span className="inline-flex items-center rounded-full bg-lime-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-lime-700">
            Partner network
          </span>
          <h1 className="text-3xl font-semibold text-emerald-950 sm:text-4xl">
            Partners powering SoraSolar（空ソラー） projects
          </h1>
          <p className="max-w-3xl text-base text-emerald-700 sm:text-lg">
            Browse EPC teams, O&amp;M specialists, and storage integrators we trust across the Tokyo
            metro. Filter by expertise, coverage, or language to plan your next deployment.
          </p>
        </header>

        <section className="space-y-6 rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-emerald-900">Partner directory</h2>
              <p className="text-sm text-emerald-700">
                Filter by specialty, coverage area, or language support.
              </p>
            </div>
            <label className="flex w-full items-center gap-3 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-700 focus-within:border-emerald-300 focus-within:bg-white sm:w-auto sm:min-w-[260px]">
              <span className="text-emerald-400">🔍</span>
              <input
                type="search"
                placeholder="Search partners…"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="w-full bg-transparent outline-none"
              />
            </label>
          </div>

          {status === "loading" && (
            <p className="rounded-2xl border border-dashed border-emerald-200 p-6 text-sm text-emerald-600">
              Loading partner profiles…
            </p>
          )}

          {status === "error" && (
            <p className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-600">
              We couldn&apos;t load partners right now. Please refresh the page.
            </p>
          )}

          <div className="grid gap-6 md:grid-cols-2">
            {filteredPartners.map((partner) => (
              <article
                key={partner.id}
                className="flex h-full flex-col justify-between rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm transition hover:border-emerald-200 hover:shadow-md"
              >
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-semibold text-emerald-900">{partner.name}</h3>
                    <p className="text-sm text-lime-600">{partner.specialty}</p>
                  </div>
                  <ul className="space-y-2 text-sm text-emerald-700">
                    <li>
                      <span className="font-medium text-emerald-900">Coverage:</span>{" "}
                      {partner.coverage}
                    </li>
                    <li>
                      <span className="font-medium text-emerald-900">Languages:</span>{" "}
                      {partner.languages.join(", ")}
                    </li>
                  </ul>
                </div>
                <div className="mt-6 space-y-2 text-sm">
                  <a
                    href={`tel:${partner.phone}`}
                    className="block rounded-full border border-emerald-200 px-4 py-2 text-center font-medium text-emerald-800 hover:border-emerald-300 hover:text-emerald-900"
                  >
                    {partner.phone}
                  </a>
                  <a
                    href={`mailto:${partner.email}`}
                    className="block rounded-full bg-emerald-600 px-4 py-2 text-center font-medium text-white hover:bg-emerald-500"
                  >
                    {partner.email}
                  </a>
                </div>
              </article>
            ))}
          </div>

          {!filteredPartners.length && status === "idle" && (
            <p className="rounded-2xl border border-dashed border-emerald-200 p-6 text-sm text-emerald-600">
              No partners match your search. Try another keyword or clear the filter.
            </p>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}

