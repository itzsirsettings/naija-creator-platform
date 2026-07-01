// Native fetch is available globally in Node.js 18+

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tehilla.work"
const SITEMAP_URL = `${BASE_URL}/sitemap.xml`
const INDEXNOW_API_URL = "https://api.indexnow.org/indexnow"
const INDEXNOW_KEY = "57f0f63a8a3a4b6da38e8cb50a8b92b6"

async function submitSeo() {
  console.log(`Starting SEO direct submission for ${BASE_URL}...`)
  
  try {
    // 1. Fetch the sitemap XML
    console.log(`Fetching sitemap from ${SITEMAP_URL}...`)
    const sitemapRes = await fetch(SITEMAP_URL)
    if (!sitemapRes.ok) {
      throw new Error(`Failed to fetch sitemap: ${sitemapRes.status} ${sitemapRes.statusText}`)
    }
    const sitemapXml = await sitemapRes.text()

    // 2. Parse URLs from sitemap xml (simple regex matching <loc> tags)
    const urlRegex = /<loc>(https?:\/\/[^<]+)<\/loc>/g
    const urls = []
    let match
    while ((match = urlRegex.exec(sitemapXml)) !== null) {
      urls.push(match[1])
    }

    if (urls.length === 0) {
      console.warn("No URLs found in sitemap.xml. Aborting submission.")
      return
    }

    console.log(`Found ${urls.length} URLs in sitemap:`, urls)

    // 3. Submit URLs to IndexNow
    const host = new URL(BASE_URL).hostname
    const payload = {
      host,
      key: INDEXNOW_KEY,
      keyLocation: `${BASE_URL}/${INDEXNOW_KEY}.txt`,
      urlList: urls,
    }

    console.log(`Submitting to IndexNow API (${INDEXNOW_API_URL})...`)
    const indexNowRes = await fetch(INDEXNOW_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
      body: JSON.stringify(payload),
    })

    if (indexNowRes.ok) {
      console.log(`✅ IndexNow submission successful! Status: ${indexNowRes.status}`)
    } else {
      const errorText = await indexNowRes.text()
      console.error(`❌ IndexNow submission failed. Status: ${indexNowRes.status}. Error: ${errorText}`)
    }

    // 4. Ping Google sitemap
    console.log("Pinging Google with sitemap...")
    const googlePingUrl = `https://www.google.com/ping?sitemap=${SITEMAP_URL}`
    const googleRes = await fetch(googlePingUrl)
    if (googleRes.ok) {
      console.log("✅ Google ping successful!")
    } else {
      console.warn(`⚠️ Google ping status: ${googleRes.status}`)
    }

    // 5. Ping Bing sitemap
    console.log("Pinging Bing with sitemap...")
    const bingPingUrl = `https://www.bing.com/ping?sitemap=${SITEMAP_URL}`
    const bingRes = await fetch(bingPingUrl)
    if (bingRes.ok) {
      console.log("✅ Bing ping successful!")
    } else {
      console.warn(`⚠️ Bing ping status: ${bingRes.status}`)
    }

    console.log("SEO direct submission process completed.")
  } catch (error) {
    console.error("❌ Direct submission process encountered an error:", error)
  }
}

submitSeo()
