import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BeforeImage from "@/photos/before.png";
import AfterImage from "@/photos/after.png";

const highlights = [
  {
    title: "Satellite-ready insights",
    description:
      "See Tokyo rooftops primed for solar potential with tilt, azimuth, and shading snapshots.",
  },
  {
    title: "Trusted partner network",
    description:
      "Match with vetted installation partners delivering grid-tied systems across the Kanto region.",
  },
  {
    title: "Local expertise",
    description:
      "Navigate Japanese incentives, utility approvals, and maintenance plans with bilingual support.",
  },
];

export default function Home() {
  const comparison = [
    {
      heading: "Before AI enhancement",
      subheading: "Original aerial capture",
      image: BeforeImage,
      notes:
        "Raw roof imagery without irradiance modelling. Shadows and obstructions reduce clarity for panel layout planning.",
    },
    {
      heading: "After AI enhancement",
      subheading: "SoraSolar（空ソラー） model output",
      image: AfterImage,
      notes:
        "Panel-ready overlay with irradiance heatmap, shading clusters, and recommended stringing strategy for installers.",
    },
  ];

  return (
    <div className="min-h-screen bg-linear-to-b from-emerald-50 via-white to-amber-50 text-emerald-950">
      <Navbar />
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-20 px-6 pb-16 pt-16 sm:px-8 lg:px-12 lg:pt-24">
        <section className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-8">
            <span className="inline-flex items-center rounded-full bg-lime-100 px-3 py-1 text-sm font-medium text-lime-700">
              SoraSolar（空ソラー）
            </span>
            <div className="space-y-5">
              <h1 className="text-3xl font-semibold leading-tight text-emerald-950 sm:text-4xl lg:text-5xl">
                Solar partners, rooftops, and insights aligned for Tokyo&apos;s energy transition.
              </h1>
              <p className="text-lg text-emerald-700 sm:text-xl">
                Discover rooftops ready for photovoltaic deployment, connect with trusted EPC
                partners, and coordinate installs with confidence. Built for property owners,
                partners, and city planners in Japan.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/map"
                className="rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow hover:bg-emerald-500 focus-visible:outline-none focus-visible:ring focus-visible:ring-emerald-400"
              >
                See rooftops on the map
              </Link>
              <Link
                href="/partners"
                className="rounded-full border border-emerald-300 px-6 py-3 text-sm font-semibold text-emerald-800 hover:border-emerald-400 hover:text-emerald-950 focus-visible:outline-none focus-visible:ring focus-visible:ring-emerald-300"
              >
                Meet our partners
              </Link>
            </div>
            <dl className="grid gap-6 sm:grid-cols-3">
              <div>
                <dt className="text-xs uppercase tracking-wide text-emerald-700">Rooftops indexed</dt>
                <dd className="mt-1 text-2xl font-semibold text-emerald-900">10,000+</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-emerald-700">Partner response SLA</dt>
                <dd className="mt-1 text-2xl font-semibold text-emerald-900">48 hours</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-emerald-700">Energy offset target</dt>
                <dd className="mt-1 text-2xl font-semibold text-emerald-900">60% of Tokyo rooftops</dd>
              </div>
            </dl>
          </div>
          <div className="rounded-3xl border border-emerald-100 bg-white p-8 shadow-sm sm:p-10">
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-emerald-900">Tokyo solar snapshot</h2>
              <ul className="space-y-4 text-sm text-emerald-700">
                <li className="flex items-start gap-3">
                  <span className="mt-1 inline-flex h-2.5 w-2.5 rounded-full bg-lime-500" />
                  <span>
                    Rooftop demand peaks along the Marunouchi and Shibuya business corridors with
                    excellent south-facing exposure.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 inline-flex h-2.5 w-2.5 rounded-full bg-lime-500" />
                  <span>
                    Residential neighborhoods in Setagaya and Nerima show steady adoption with
                    15–25° tilt profiles.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 inline-flex h-2.5 w-2.5 rounded-full bg-lime-500" />
                  <span>
                    Tokyo Metropolitan Government incentives for BCP-ready storage systems are live
                    through FY2026.
                  </span>
                </li>
              </ul>
              <Link
                href="/contact"
                className="inline-flex w-full justify-center rounded-xl bg-amber-400 px-3 py-3 text-sm font-semibold text-emerald-900 shadow hover:bg-amber-300 focus-visible:outline-none focus-visible:ring focus-visible:ring-amber-400"
              >
                Talk to SoraSolar（空ソラー）
              </Link>
            </div>
          </div>
        </section>

        <section className="space-y-10">
          <div className="space-y-3 text-center">
            <h2 className="text-2xl font-semibold text-emerald-950 sm:text-3xl">
              Why teams choose SoraSolar（空ソラー）
            </h2>
            <p className="mx-auto max-w-3xl text-base text-emerald-700 sm:text-lg">
              From feasibility to commissioning, we help you evaluate rooftops, coordinate partners,
              and deliver resilient installations across Tokyo.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {highlights.map((item) => (
              <article
                key={item.title}
                className="rounded-2xl border border-emerald-100 bg-white p-6 text-left shadow-sm transition hover:border-emerald-200 hover:shadow-md"
              >
                <h3 className="text-lg font-semibold text-emerald-900">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-emerald-700">{item.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-emerald-100 bg-white p-10 shadow-sm">
          <div className="grid gap-10 lg:grid-cols-[1fr_max-content] lg:items-center">
            <div className="space-y-5">
              <h2 className="text-2xl font-semibold text-emerald-950 sm:text-3xl">Rooftop readiness</h2>
              <p className="text-base text-emerald-700 sm:text-lg">
                We assess tilt, azimuth, area, structural integrity, and interconnection viability so
                your next solar project starts with the best data. Sync the map with your portfolio
                and share curated shortlists with installers instantly.
              </p>
              <Link
                href="/map"
                className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:text-emerald-600 focus-visible:outline-none focus-visible:ring focus-visible:ring-emerald-400"
              >
                Explore the rooftop map →
              </Link>
            </div>
            <div className="rounded-2xl border border-dashed border-lime-400 bg-lime-100/70 p-6 text-sm text-emerald-800">
              <p className="font-semibold uppercase tracking-wide text-emerald-900">
                Data coverage highlights
              </p>
              <ul className="mt-4 space-y-3">
                <li>• 23 wards of Tokyo with monthly updates</li>
                <li>• Rooftop polygons with slope clustering</li>
                <li>• Contact-ready rooftops flagged by owners</li>
                <li>• API access for enterprise asset teams</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-emerald-100 bg-white p-10 shadow-sm">
          <div className="space-y-6 text-center">
            <h2 className="text-2xl font-semibold text-emerald-950 sm:text-3xl">
              AI-powered rooftop clarity
            </h2>
            <p className="mx-auto max-w-3xl text-base text-emerald-700 sm:text-lg">
              Compare raw aerial imagery with the SoraSolar（空ソラー） enhancement pipeline. We align,
              denoise, and model irradiance so partners can move from survey to layout in hours.
            </p>
          </div>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {comparison.map((item) => (
              <figure
                key={item.heading}
                className="flex flex-col gap-4 rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4 text-left"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-emerald-100">
                  <Image
                    src={item.image}
                    alt={`${item.heading} - ${item.subheading}`}
                    fill
                    className="object-cover"
                    sizes="(min-width: 768px) 50vw, 100vw"
                    priority
                  />
                </div>
                <figcaption className="space-y-2">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">
                      {item.subheading}
                    </p>
                    <p className="text-lg font-semibold text-emerald-900">{item.heading}</p>
                  </div>
                  <p className="text-sm text-emerald-700">{item.notes}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}