import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Kept temporarily so browsers with an obsolete cached bundle receive a clear
// response instead of loading the unsupported server-side browser renderer.
export async function POST() {
  return NextResponse.json(
    { error: "This PDF exporter was replaced. Refresh the page and use Print / Save PDF." },
    { status: 410, headers: { "Cache-Control": "no-store" } },
  );
}
