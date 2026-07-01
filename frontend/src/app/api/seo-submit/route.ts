import { NextRequest, NextResponse } from "next/server"
import sitemap from "@/app/sitemap"

const INDEXNOW_API_URL = "https://api.indexnow.org/indexnow"
const INDEXNOW_KEY = "57f0f63a8a3a4b6da38e8cb50a8b92b6"
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tehilla.work"

export async function GET(request: NextRequest) {
  return handleSubmission(request)
}

export async function POST(request: NextRequest) {
  return handleSubmission(request)
}

async function handleSubmission(request: NextRequest) {
  try {
    // Basic authorization to prevent spamming
    const { searchParams } = new URL(request.url)
    const secret = searchParams.get("secret")
    const expectedSecret = process.env.SEO_SUBMISSION_SECRET ?? "tehilla-seo-direct-submit"

    if (secret !== expectedSecret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // 1. Get sitemap URLs dynamically from sitemap.ts
    const sitemapEntries = sitemap()
    const urls = sitemapEntries.map((entry) => entry.url)

    // 2. Submit to IndexNow (Bing, Yandex, etc.)
    const indexNowPayload = {
      host: new URL(BASE_URL).hostname,
      key: INDEXNOW_KEY,
      keyLocation: `${BASE_URL}/${INDEXNOW_KEY}.txt`,
      urlList: urls,
    }

    const indexNowResponse = await fetch(INDEXNOW_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
      body: JSON.stringify(indexNowPayload),
    })

    const indexNowOk = indexNowResponse.ok
    const indexNowStatus = indexNowResponse.status
    let indexNowText = ""
    try {
      indexNowText = await indexNowResponse.text()
    } catch {
      // Ignore text extraction error
    }

    // 3. Ping Google and Bing with Sitemap (deprecated but still partially active legacy fallback)
    const pings = [
      { name: "Google", url: `https://www.google.com/ping?sitemap=${BASE_URL}/sitemap.xml` },
      { name: "Bing", url: `https://www.bing.com/ping?sitemap=${BASE_URL}/sitemap.xml` },
    ]

    const pingResults = await Promise.all(
      pings.map(async (ping) => {
        try {
          const res = await fetch(ping.url, { method: "GET" })
          return { name: ping.name, ok: res.ok, status: res.status }
        } catch (err) {
          return { name: ping.name, ok: false, error: err instanceof Error ? err.message : String(err) }
        }
      })
    )

    return NextResponse.json({
      success: true,
      indexNow: {
        ok: indexNowOk,
        status: indexNowStatus,
        response: indexNowText || "No response body",
      },
      pings: pingResults,
      submittedUrls: urls,
    })
  } catch (err) {
    console.error("SEO direct submission error:", err)
    return NextResponse.json(
      { error: "SEO submission failed", details: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    )
  }
}
