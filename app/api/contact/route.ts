import { NextResponse } from "next/server";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  company: z.string().optional(),
  phone: z.string().optional(),
  message: z.string().min(10),
});

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const parsed = contactSchema.parse(payload);

    console.log("[SoraSolar Contact]", parsed);

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          status: "error",
          issues: error.issues,
        },
        { status: 400 }
      );
    }

    console.error("[SoraSolar Contact] Unexpected error", error);
    return NextResponse.json({ status: "error" }, { status: 500 });
  }
}

export function GET() {
  return NextResponse.json({ status: "error", message: "Method not allowed" }, { status: 405 });
}

