import { NextResponse } from "next/server";
import partners from "@/data/partners.json";

export async function GET() {
  return NextResponse.json(partners);
}

