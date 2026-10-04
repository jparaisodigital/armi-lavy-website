
const FEEDS = [
  {
    name: "CNBC Finance",
    category: "FINANCE",
    url: "https://www.cnbc.com/id/10000664/device/rss/rss.html",
  },
  {
    name: "CNBC Investing",
    category: "INVESTING",
    url: "https://www.cnbc.com/id/15839069/device/rss/rss.html",
  },
  {
    name: "CNBC Personal Finance",
    category: "PERSONAL FINANCE",
    url: "https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=21324812",
  },
];

const MAX_ARTICLES = 18;
const CACHE_SECONDS = 900;
const MAX_IMAGE_LOOKUPS = 18;
const IMAGE_LOOKUP_CONCURRENCY = 4;

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Accept",
};

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: CORS_HEADERS,
      });
    }

    if (url.pathname !== "/api/news") {
      return new Response("Armi Finance News Worker is running.", {
        status: 200,
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          ...CORS_HEADERS,
        },
      });
    }

    if (request.method !== "GET") {
      return jsonResponse(
        {
          status: "error",
          message: "Method not allowed.",
        },
        405,
        { Allow: "GET, OPTIONS" }
      );
    }

    const cacheKey = new Request(
      new URL("/api/news", url.origin).toString(),
      { method: "GET" }
    );

    try {
      const cached = await caches.default.match(cacheKey);

      if (cached) {
        return cached;
      }
    } catch (error) {
      console.warn("News cache read failed:", error.message);
    }

    try {
      const feedResults = await Promise.allSettled(
        FEEDS.map((feed) => fetchFeed(feed))
      );

      const allArticles = [];

      for (const result of feedResults) {
        if (result.status === "fulfilled") {
          allArticles.push(...result.value);
        } else {
          console.warn("A news feed failed:", result.reason?.message);
        }
      }

      const uniqueArticles = dedupeArticles(allArticles)
        .filter((article) => article.title && article.link)
        .sort((a, b) => {
          const dateA = Date.parse(a.publishedAt);
          const dateB = Date.parse(b.publishedAt);

          return (
            (Number.isFinite(dateB) ? dateB : 0) -
            (Number.isFinite(dateA) ? dateA : 0)
          );
        })
        .slice(0, MAX_ARTICLES);

      if (!uniqueArticles.length) {
        throw new Error("All news feeds failed or returned no usable stories.");
      }

      // RSS images are preferred. Only attempt page lookups when needed.
      const articles = await mapWithConcurrency(
        uniqueArticles,
        IMAGE_LOOKUP_CONCURRENCY,
        async (article, index) => {
          if (article.image || index >= MAX_IMAGE_LOOKUPS) {
            return article;
          }

          const image = await getArticleImage(article.link);

          return {
            ...article,
            image,
          };
        }
      );

      const payload = {
        status: "success",
        updatedAt: new Date().toISOString(),
        articles,
      };

      const response = jsonResponse(payload, 200, {
        "Cache-Control": `public, max-age=${CACHE_SECONDS}, s-maxage=${CACHE_SECONDS}`,
      });

      try {
        ctx.waitUntil(
          caches.default.put(cacheKey, response.clone())
        );
      } catch (error) {
        console.warn("News cache write failed:", error.message);
      }

      return response;
    } catch (error) {
      console.error("Unable to load financial news:", error);

      return jsonResponse(
        {
          status: "error",
          message: "Unable to load financial news.",
        },
        500,
        { "Cache-Control": "no-store" }
      );
    }
  },
};

function jsonResponse(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...CORS_HEADERS,
      ...extraHeaders,
    },
  });
}

async function fetchFeed(feed) {
  const response = await fetch(feed.url, {
    headers: {
      "User-Agent": "Mozilla/5.0 ArmiFinanceNews/1.0",
      Accept:
        "application/rss+xml, application/xml, text/xml;q=0.9, */*;q=0.8",
    },
  });

  if (!response.ok) {
    throw new Error(`${feed.name} returned HTTP ${response.status}`);
  }

  const xml = await response.text();
  const articles = parseRSS(xml, feed);

  if (!articles.length) {
    throw new Error(`${feed.name} returned no RSS items`);
  }

  return articles;
}

function parseRSS(xml, feed) {
  const items = [
    ...xml.matchAll(/<item\b[^>]*>([\s\S]*?)<\/item>/gi),
  ];

  // Some feeds use Atom <entry> elements instead of RSS <item>.
  const entries = items.length
    ? items.map((match) => match[1])
    : [
        ...xml.matchAll(/<entry\b[^>]*>([\s\S]*?)<\/entry>/gi),
      ].map((match) => match[1]);

  return entries.map((item) => {
    const title = clean(getTag(item, "title"));
    const link = normalizeURL(
      getTag(item, "link") || getAttribute(item, "link", "href")
    );

    const description = clean(
      getTag(item, "description") ||
      getTag(item, "content:encoded") ||
      getTag(item, "summary") ||
      getTag(item, "content")
    );

    const publishedAt =
      getTag(item, "pubDate") ||
      getTag(item, "dc:date") ||
      getTag(item, "published") ||
      getTag(item, "updated") ||
      "";

    return {
      title,
      link,
      description,
      publishedAt,
      source: feed.name,
      category: feed.category,
      image: extractRSSImage(item, link),
    };
  });
}

function getTag(xml, tag) {
  const safeTag = escapeRegExp(tag);
  const pattern = new RegExp(
    `<${safeTag}\\b[^>]*>([\\s\\S]*?)<\\/${safeTag}\\s*>`,
    "i"
  );

  const match = xml.match(pattern);
  return match ? decodeEntities(match[1].trim()) : "";
}

function getAttribute(xml, tag, attribute) {
  const safeTag = escapeRegExp(tag);
  const safeAttribute = escapeRegExp(attribute);

  const tagPattern = new RegExp(
    `<${safeTag}\\b([^>]*)>`,
    "i"
  );
  const tagMatch = xml.match(tagPattern);

  if (!tagMatch) {
    return "";
  }

  const attributePattern = new RegExp(
    `\\b${safeAttribute}\\s*=\\s*["']([^"']+)["']`,
    "i"
  );
  const attributeMatch = tagMatch[1].match(attributePattern);

  return attributeMatch
    ? decodeEntities(attributeMatch[1].trim())
    : "";
}

function extractRSSImage(item, articleLink = "") {
  const candidates = [
    getAttribute(item, "media:content", "url"),
    getAttribute(item, "media:thumbnail", "url"),
    getAttribute(item, "enclosure", "url"),
    getAttribute(item, "image", "href"),
    getTag(item, "media:content"),
    getTag(item, "media:thumbnail"),
    getTag(item, "image"),
  ];

  for (const candidate of candidates) {
    const normalized = normalizeURL(candidate, articleLink);

    if (normalized && looksLikeImage(normalized)) {
      return normalized;
    }
  }

  // Some feeds embed their image inside description or content HTML.
  const content =
    getTag(item, "content:encoded") ||
    getTag(item, "description") ||
    getTag(item, "summary") ||
    "";

  const htmlImage = content.match(
    /<img\b[^>]*?\bsrc\s*=\s*["']([^"']+)["']/i
  );

  if (htmlImage) {
    const image = normalizeURL(
      decodeEntities(htmlImage[1]),
      articleLink
    );

    if (image) {
      return image;
    }
  }

  return "";
}

async function getArticleImage(articleURL) {
  if (!articleURL) {
    return "";
  }

  try {
    const response = await fetch(articleURL, {
      headers: {
        "User-Agent": "Mozilla/5.0 ArmiFinanceNews/1.0",
        Accept: "text/html,application/xhtml+xml",
      },
      signal: AbortSignal.timeout(7000),
    });

    if (!response.ok) {
      return "";
    }

    const html = await response.text();

    const candidates = [
      extractMetaContent(html, "property", "og:image"),
      extractMetaContent(html, "property", "og:image:url"),
      extractMetaContent(html, "name", "twitter:image"),
      extractMetaContent(html, "name", "twitter:image:src"),
      extractMetaContent(html, "itemprop", "image"),
    ];

    for (const candidate of candidates) {
      const image = normalizeURL(candidate, articleURL);

      if (image) {
        return image;
      }
    }

    // Last resort: look for an image in the article HTML.
    const imageMatch = html.match(
      /<img\b[^>]*?\b(?:data-src|data-lazy-src|src)\s*=\s*["']([^"']+)["']/i
    );

    if (imageMatch) {
      const image = normalizeURL(
        decodeEntities(imageMatch[1]),
        articleURL
      );

      if (image && looksLikeImage(image)) {
        return image;
      }
    }
  } catch (error) {
    console.warn("Article image lookup failed:", error.message);
  }

  return "";
}

function extractMetaContent(html, attribute, value) {
  const safeAttribute = escapeRegExp(attribute);
  const safeValue = escapeRegExp(value);

  // Supports either attribute order in the meta tag.
  const patterns = [
    new RegExp(
      `<meta\\b[^>]*\\b${safeAttribute}\\s*=\\s*["']${safeValue}["'][^>]*\\bcontent\\s*=\\s*["']([^"']+)["'][^>]*>`,
      "i"
    ),
    new RegExp(
      `<meta\\b[^>]*\\bcontent\\s*=\\s*["']([^"']+)["'][^>]*\\b${safeAttribute}\\s*=\\s*["']${safeValue}["'][^>]*>`,
      "i"
    ),
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);

    if (match) {
      return decodeEntities(match[1].trim());
    }
  }

  return "";
}

function normalizeURL(value, baseURL = "") {
  if (!value) {
    return "";
  }

  try {
    const url = new URL(
      decodeEntities(String(value).trim()),
      baseURL || undefined
    );

    if (!["http:", "https:"].includes(url.protocol)) {
      return "";
    }

    return url.href;
  } catch {
    return "";
  }
}

function looksLikeImage(value) {
  try {
    const url = new URL(value);
    const path = url.pathname.toLowerCase();

    return (
      /\.(jpe?g|png|webp|gif|avif|svg)$/i.test(path) ||
      /\/image(?:s)?\//i.test(path) ||
      /[?&](?:format|fm)=(?:jpg|jpeg|png|webp|avif)/i.test(url.search)
    );
  } catch {
    return false;
  }
}

function dedupeArticles(articles) {
  const seen = new Set();
  const result = [];

  for (const article of articles) {
    const key =
      normalizeArticleKey(article.link) ||
      article.title.toLowerCase().trim();

    if (!key || seen.has(key)) {
      continue;
    }

    seen.add(key);
    result.push(article);
  }

  return result;
}

function normalizeArticleKey(value) {
  try {
    const url = new URL(value);

    [
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_term",
      "utm_content",
      "cid",
      "source",
    ].forEach((param) => {
      url.searchParams.delete(param);
    });

    url.hash = "";
    return url.href.toLowerCase();
  } catch {
    return "";
  }
}

async function mapWithConcurrency(items, concurrency, callback) {
  const results = new Array(items.length);
  let nextIndex = 0;

  async function worker() {
    while (true) {
      const index = nextIndex++;

      if (index >= items.length) {
        return;
      }

      try {
        results[index] = await callback(items[index], index);
      } catch (error) {
        console.warn("Article processing failed:", error.message);
        results[index] = items[index];
      }
    }
  }

  const workers = Array.from(
    { length: Math.min(concurrency, items.length) },
    () => worker()
  );

  await Promise.all(workers);
  return results;
}

function clean(value) {
  return decodeEntities(String(value || ""))
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/gi, "$1")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function decodeEntities(value) {
  return String(value || "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&apos;/gi, "'")
    .replace(/&#39;/gi, "'")
    .replace(/&#x27;/gi, "'")
    .replace(/&#x2F;/gi, "/")
    .replace(/&#(\d+);/g, (match, code) => {
      try {
        return String.fromCodePoint(Number(code));
      } catch {
        return match;
      }
    })
    .replace(/&#x([0-9a-f]+);/gi, (match, code) => {
      try {
        return String.fromCodePoint(parseInt(code, 16));
      } catch {
        return match;
      }
    });
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}