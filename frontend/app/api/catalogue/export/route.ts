import { NextRequest, NextResponse } from "next/server";
import serverlessChromium from "@sparticuz/chromium";
import { chromium as playwrightChromium } from "playwright-core";
import { existsSync } from "node:fs";

export const runtime = "nodejs";
export const maxDuration = 120;
const browserCandidates = [
  process.env.CHROME_PATH,
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
  "/usr/bin/google-chrome",
].filter((value): value is string => Boolean(value));

export async function POST(request: NextRequest) {
  let browser;
  try {
    const settings = await request.json();
    const systemBrowser = browserCandidates.find(existsSync);
    const executablePath = systemBrowser ?? (process.platform === "linux" ? await serverlessChromium.executablePath() : undefined);
    if (!executablePath) throw new Error("PDF browser is not installed on the hosting server.");
    const args = systemBrowser
      ? ["--no-sandbox", "--disable-dev-shm-usage"]
      : [...serverlessChromium.args, "--disable-dev-shm-usage"];
    browser = await playwrightChromium.launch({ headless: true, executablePath, args });
    const page = await browser.newPage({ viewport: { width: 1240, height: 1754 } });
    await page.addInitScript((value: unknown) => {
      (window as typeof window & { __CATALOGUE_EXPORT__?: unknown }).__CATALOGUE_EXPORT__ = value as never;
    }, settings);
    await page.goto(new URL("/catalogue/print", request.url).toString(), { waitUntil: "networkidle", timeout: 60000 });
    await page.waitForSelector("#catalogue-ready", { timeout: 15000 });
    await page.evaluate(async () => {
      await Promise.all(Array.from(document.images).map((image) => image.complete ? Promise.resolve() : new Promise<void>((resolve) => {
        image.addEventListener("load", () => resolve(), { once: true });
        image.addEventListener("error", () => resolve(), { once: true });
      })));
      await document.fonts.ready;
    });
    await page.emulateMedia({ media: "print" });
    const pdf = await page.pdf({ format: "A4", printBackground: true, preferCSSPageSize: true, margin: { top: "0", right: "0", bottom: "0", left: "0" } });
    return new NextResponse(new Uint8Array(pdf), { headers: { "Content-Type": "application/pdf", "Content-Disposition": "attachment; filename=\"TFS-Living-Catalogue-2026.pdf\"", "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Catalogue export failed", error);
    const message = error instanceof Error && error.message.includes("not installed")
      ? "PDF generation is temporarily unavailable on this server."
      : "The catalogue PDF could not be generated.";
    return NextResponse.json({ error: message }, { status: 500 });
  } finally {
    await browser?.close();
  }
}
