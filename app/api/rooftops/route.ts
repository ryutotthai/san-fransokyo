import { NextResponse } from "next/server";
import rooftops from "@/data/rooftops.json";

export async function GET() {
  return NextResponse.json(rooftops);
}

