'use client';

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const contactSchema = z.object({
  name: z.string().min(2, "Please enter at least 2 characters."),
  email: z.string().email("Please enter a valid email address."),
  company: z.string().optional(),
  phone: z.string().optional(),
  message: z.string().min(10, "Tell us a little more about your project (10+ characters)."),
});

type ContactFormValues = z.infer<typeof contactSchema>;

export default function ContactPage() {
  const [submissionStatus, setSubmissionStatus] = useState<"idle" | "success" | "error">("idle");
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      company: "",
      phone: "",
      message: "",
    },
  });

  const onSubmit = async (values: ContactFormValues) => {
    try {
      setSubmissionStatus("idle");
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error("Failed to submit contact form");
      }

      setSubmissionStatus("success");
      reset();
      window.alert("Thanks! A SoraSolar（空ソラー） specialist will reach out shortly.");
    } catch (error) {
      console.error(error);
      setSubmissionStatus("error");
      window.alert("We couldn't submit your request. Please retry in a moment.");
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-emerald-50 via-white to-amber-50 text-emerald-950">
      <Navbar />
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-12 px-6 pb-16 pt-16 sm:px-8 lg:px-12">
        <header className="space-y-4">
          <span className="inline-flex items-center rounded-full bg-lime-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-lime-700">
            Contact
          </span>
          <h1 className="text-3xl font-semibold text-emerald-950 sm:text-4xl">
            Start your rooftop solar project with SoraSolar（空ソラー）
          </h1>
          <p className="max-w-2xl text-base text-emerald-700 sm:text-lg">
            Share a few details about your site and project goals. Our bilingual project managers
            will respond within two business days with a tailored next step.
          </p>
        </header>

        <section className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm sm:p-8">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-emerald-900" htmlFor="name">
                  Name<span className="text-lime-600">*</span>
                </label>
                <input
                  id="name"
                  type="text"
                  {...register("name")}
                  className="rounded-xl border border-emerald-200 bg-white px-4 py-3 text-sm text-emerald-900 shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                  placeholder="山田 太郎 / Taro Yamada"
                />
                {errors.name && <p className="text-xs text-red-600">{errors.name.message}</p>}
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-emerald-900" htmlFor="email">
                  Email<span className="text-lime-600">*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  {...register("email")}
                  className="rounded-xl border border-emerald-200 bg-white px-4 py-3 text-sm text-emerald-900 shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                  placeholder="you@example.co.jp"
                />
                {errors.email && <p className="text-xs text-red-600">{errors.email.message}</p>}
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-emerald-900" htmlFor="company">
                  Company / Organization
                </label>
                <input
                  id="company"
                  type="text"
                  {...register("company")}
                  className="rounded-xl border border-emerald-200 bg-white px-4 py-3 text-sm text-emerald-900 shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                  placeholder="Example Holdings"
                />
                {errors.company && <p className="text-xs text-red-600">{errors.company.message}</p>}
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-emerald-900" htmlFor="phone">
                  Phone
                </label>
                <input
                  id="phone"
                  type="tel"
                  {...register("phone")}
                  className="rounded-xl border border-emerald-200 bg-white px-4 py-3 text-sm text-emerald-900 shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                  placeholder="+81 3-1234-5678"
                />
                {errors.phone && <p className="text-xs text-red-600">{errors.phone.message}</p>}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-emerald-900" htmlFor="message">
                Project details<span className="text-lime-600">*</span>
              </label>
              <textarea
                id="message"
                rows={6}
                {...register("message")}
                className="rounded-xl border border-emerald-200 bg-white px-4 py-3 text-sm text-emerald-900 shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                placeholder="Tell us about your rooftop, timeline, and project goals…"
              />
              {errors.message && <p className="text-xs text-red-600">{errors.message.message}</p>}
            </div>

            <div className="flex items-center justify-between gap-4">
              <p className="text-xs text-emerald-700">
                By submitting, you agree to receive updates about your inquiry. We respect your
                privacy.
              </p>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-500 focus-visible:outline-none focus-visible:ring focus-visible:ring-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "Sending…" : "Submit request"}
              </button>
            </div>

            {submissionStatus === "success" && (
              <p className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-700">
                Submission received. Our team will reply soon.
              </p>
            )}
            {submissionStatus === "error" && (
              <p className="rounded-xl bg-red-50 p-4 text-sm text-red-600">
                Something went wrong. Please try again or contact us at hello@sorasolar.com.
              </p>
            )}
          </form>
        </section>
      </main>
      <Footer />
    </div>
  );
}

