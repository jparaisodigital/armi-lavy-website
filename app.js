
(() => {
    "use strict";
  
    const config = window.SITE_CONFIG;
  
    if (!config) {
      console.error("SITE_CONFIG was not loaded. Check config.js.");
      return;
    }
  
    const $ = (selector, root = document) => root.querySelector(selector);
    const $$ = (selector, root = document) =>
      [...root.querySelectorAll(selector)];
  
    const escapeHTML = (value) =>
      String(value ?? "").replace(/[&<>"']/g, (char) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      })[char]);
  
    const safeURL = (value, fallback = "#resources") => {
      try {
        const url = new URL(value, window.location.href);
        if (["https:", "http:"].includes(url.protocol)) {
          return url.href;
        }
      } catch (_) {}
      return fallback;
    };
  
    const formatMoney = (value, currency = "USD") => {
      try {
        return new Intl.NumberFormat("en-US", {
          style: "currency",
          currency,
          maximumFractionDigits: 2
        }).format(Number.isFinite(value) ? value : 0);
      } catch (_) {
        return `${currency} ${Number(value || 0).toFixed(2)}`;
      }
    };
  
    // BRAND
    document.title = `${config.brand.name} | Personal Finance & Investing`;
  
    $$(".brand-name").forEach((el) => {
      el.textContent = config.brand.name.toUpperCase();
    });
  
    $$(".brand-mark").forEach((el) => {
      el.textContent = config.brand.initials;
    });
  
    $("#currentYear").textContent = new Date().getFullYear();
  
    // MOBILE NAVIGATION
    const menuToggle = $("#menuToggle");
    const mainNav = $("#mainNav");
  
    menuToggle.addEventListener("click", () => {
      const isOpen = mainNav.classList.toggle("is-open");
      menuToggle.setAttribute("aria-expanded", String(isOpen));
    });
  
    $$("#mainNav a").forEach((link) => {
      link.addEventListener("click", () => {
        mainNav.classList.remove("is-open");
        menuToggle.setAttribute("aria-expanded", "false");
      });
    });
  
    // HERO SLIDER
    const slides = $$(".hero-slide");
    const dots = $$(".slide-dot");
    const heroCaption = $("#heroCaption");
    const slideCount = $("#slideCount");
    const heroConfig = config.hero;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );
  
    let currentSlide = 0;
    let sliderTimer = null;
  
    function showSlide(index) {
      if (!slides.length) return;
  
      currentSlide = (index + slides.length) % slides.length;
  
      slides.forEach((slide, i) => {
        slide.classList.toggle("is-active", i === currentSlide);
        slide.setAttribute(
          "aria-hidden",
          String(i !== currentSlide)
        );
      });
  
      dots.forEach((dot, i) => {
        dot.classList.toggle("is-active", i === currentSlide);
        dot.setAttribute("aria-pressed", String(i === currentSlide));
      });
  
      if (heroCaption) {
        heroCaption.textContent =
          heroConfig.slides[currentSlide]?.caption || "";
      }
  
      if (slideCount) {
        slideCount.textContent =
          `${String(currentSlide + 1).padStart(2, "0")} / ` +
          `${String(slides.length).padStart(2, "0")}`;
      }
    }
  
    function stopSlider() {
      if (sliderTimer) {
        clearInterval(sliderTimer);
        sliderTimer = null;
      }
    }
  
    function startSlider() {
      stopSlider();
  
      if (slides.length < 2 || reduceMotion.matches) return;
  
      sliderTimer = setInterval(() => {
        showSlide(currentSlide + 1);
      }, Math.max(3000, Number(heroConfig.interval) || 6500));
    }
  
    dots.forEach((dot) => {
      dot.addEventListener("click", () => {
        showSlide(Number(dot.dataset.slide));
        startSlider();
      });
    });
  
    const heroSection = $(".hero");
  
    heroSection.addEventListener("mouseenter", stopSlider);
    heroSection.addEventListener("mouseleave", startSlider);
    heroSection.addEventListener("focusin", stopSlider);
    heroSection.addEventListener("focusout", startSlider);
  
    reduceMotion.addEventListener?.("change", startSlider);
  
    showSlide(0);
    startSlider();
  
    // PRODUCT RENDERING
    function renderProduct(product, featured = false) {
      const title = escapeHTML(product.title);
      const image = escapeHTML(safeURL(product.image));
      const description = escapeHTML(product.description);
      const eyebrow = escapeHTML(product.eyebrow || "DIGITAL RESOURCE");
      const format = escapeHTML(product.format || "Digital guide");
      const level = escapeHTML(product.level || "All levels");
      const price = formatMoney(product.price, product.currency || "USD");
      const link = escapeHTML(safeURL(product.gumroadUrl));
      const buttonLabel = escapeHTML(
        product.buttonLabel || "View the Guide"
      );
  
      const imageHTML = `
        <div class="product-image-wrap">
          <img
            src="${image}"
            alt="${title} cover"
            loading="lazy"
            ${featured ? 'class="product-cover"' : ""}
          />
        </div>
      `;
  
      const infoHTML = `
        <div class="product-info">
          <span class="product-eyebrow">${eyebrow}</span>
          <h3>${title}</h3>
          <p>${description}</p>
          <div class="product-meta">
            <span>${format}</span>
            <span>${level}</span>
          </div>
          <div class="product-price">${escapeHTML(price)}</div>
          <a class="button button-dark"
            href="${link}"
            target="_blank"
            rel="noopener noreferrer">
            ${buttonLabel}
          </a>
        </div>
      `;
  
      return featured
        ? imageHTML + infoHTML
        : `<article class="product-card">${imageHTML}${infoHTML}</article>`;
    }
  
    function renderProducts() {
      const products = Array.isArray(config.products)
        ? config.products
        : [];
  
      const featured = products.find((product) => product.featured);
      const others = products.filter((product) => product !== featured);
  
      const featuredContainer = $("#featuredProduct");
      const productGrid = $("#productGrid");
  
      if (featured) {
        featuredContainer.innerHTML = renderProduct(featured, true);
      } else {
        featuredContainer.hidden = true;
      }
  
      productGrid.innerHTML = others
        .map((product) => renderProduct(product))
        .join("");
  
      if (!others.length) {
        productGrid.hidden = true;
      }
    }
  
    renderProducts();
  
    // DIVIDEND CALCULATOR
    const currencySelect = $("#currency");
    const initialInput = $("#initialInvestment");
    const monthlyInput = $("#monthlyContribution");
    const yieldInput = $("#dividendYield");
    const yearsInput = $("#years");
    const reinvestInput = $("#reinvest");
    const yieldValue = $("#yieldValue");
  
    const annualResult = $("#annualResult");
    const monthlyResult = $("#monthlyResult");
    const portfolioResult = $("#portfolioResult");
    const contributionsResult = $("#contributionsResult");
    const resultDisclaimer = $("#resultDisclaimer");
  
    function syncCurrency() {
      const currency = currencySelect.value;
      const prefix = currency === "PHP" ? "₱" : "$";
  
      $("#currencyPrefix").textContent = prefix;
      $("#monthlyPrefix").textContent = prefix;
      calculateDividend();
    }
  
    function calculateDividend(event) {
      if (event) event.preventDefault();
  
      const initial = Math.max(0, Number(initialInput.value) || 0);
      const monthly = Math.max(0, Number(monthlyInput.value) || 0);
      const yieldRate = Math.max(
        0,
        Math.min(15, Number(yieldInput.value) || 0)
      ) / 100;
  
      const years = Math.max(1, Math.min(30, Number(yearsInput.value) || 1));
      const reinvest = reinvestInput.checked;
      const currency = currencySelect.value;
      const months = years * 12;
  
      yieldValue.textContent = `${(yieldRate * 100).toFixed(2)}%`;
  
      /*
        Simplified monthly model:
        - Dividends are approximated monthly.
        - Contributions are added at month-end.
        - Reinvestment, if selected, is assumed to occur monthly.
        - Yield is held constant throughout the illustration.
        - Share-price changes, taxes, fees, inflation, and dividend
          cuts or increases are excluded.
      */
      const monthlyRate = yieldRate / 12;
      let balance = initial;
      let cumulativeDividends = 0;
  
      for (let month = 0; month < months; month++) {
        const dividend = balance * monthlyRate;
        cumulativeDividends += dividend;
  
        if (reinvest) {
          balance += dividend;
        }
  
        balance += monthly;
      }
  
      const totalContributions = initial + monthly * months;
      const estimatedPortfolio = balance;
  
      // If dividends are not reinvested, estimate annual income from
      // contributed principal rather than adding dividends to the balance.
      const incomeBase = reinvest
        ? estimatedPortfolio
        : totalContributions;
  
      const annualIncome = incomeBase * yieldRate;
      const monthlyIncome = annualIncome / 12;
  
      annualResult.textContent = formatMoney(annualIncome, currency);
      monthlyResult.textContent = formatMoney(monthlyIncome, currency);
      portfolioResult.textContent = formatMoney(estimatedPortfolio, currency);
      contributionsResult.textContent = formatMoney(
        totalContributions, currency
      );
  
      resultDisclaimer.textContent = reinvest
        ? `Illustration over ${years} year(s), assuming a constant ${(yieldRate * 100).toFixed(2)}% annual yield and monthly reinvestment. Actual results may differ substantially.`
        : `Illustration over ${years} year(s), assuming a constant ${(yieldRate * 100).toFixed(2)}% annual yield without reinvesting dividends. Actual results may differ substantially.`;
    }
  
    $("#dividendForm").addEventListener("submit", calculateDividend);
  
    currencySelect.addEventListener("change", syncCurrency);
    initialInput.addEventListener("input", calculateDividend);
    monthlyInput.addEventListener("input", calculateDividend);
    yieldInput.addEventListener("input", calculateDividend);
    yearsInput.addEventListener("change", calculateDividend);
    reinvestInput.addEventListener("change", calculateDividend);
  
    syncCurrency();
  
    
  
/* ARMI FINANCIAL JOURNAL — WORKER API */

const newsConfig = config.news;
const newsGrid = document.querySelector("#newsGrid");
const newsStatus = document.querySelector("#newsStatus");

function escapeNewsHTML(value = "") {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

function safeNewsLink(value) {
  try {
    const url = new URL(value, window.location.href);

    return ["https:", "http:"].includes(url.protocol)
      ? url.href
      : "";
  } catch {
    return "";
  }
}

function formatNewsDate(value) {
  if (!value) return "Date not provided";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date not provided";
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

function renderNewsImage(article) {
  const image = safeNewsLink(article.image);

  if (!image) {
    return `
      <div class="journal-art journal-art-empty"
           aria-label="Financial Journal article">
        <span>ARMI L. LAVY</span>
        <strong>FINANCIAL<br>JOURNAL</strong>
        <small>${escapeNewsHTML(article.source || "FINANCE")}</small>
      </div>
    `;
  }

  return `
    <div class="journal-art">
      <img
        src="${escapeNewsHTML(image)}"
        alt=""
        loading="lazy"
        referrerpolicy="no-referrer"
        onerror="this.parentElement.classList.add('journal-image-missing');this.remove()"
      >
    </div>
  `;
}

function renderNewsCard(article, featured = false) {
  const title = escapeNewsHTML(article.title);
  const link = safeNewsLink(article.link);

  if (!link || !article.title) return "";

  const publisher = escapeNewsHTML(
    article.source || "Financial News"
  );

  const category = escapeNewsHTML(
    article.category || "FINANCIAL NEWS"
  );

  const date = escapeNewsHTML(
    formatNewsDate(article.publishedAt)
  );

  const excerpt = article.description
    ? escapeNewsHTML(article.description)
    : "";

  return `
    <article class="journal-card ${featured ? "journal-featured" : ""}">
      <a class="journal-image-link"
         href="${escapeNewsHTML(link)}"
         target="_blank"
         rel="noopener noreferrer"
         aria-label="Read ${title}">
        ${renderNewsImage(article)}
      </a>

      <div class="journal-card-body">
        <div class="journal-meta">
          <span>${publisher}</span>
          <span class="journal-dot"></span>
          <time>${date}</time>
        </div>

        <p class="journal-category">${category}</p>

        <h3>
          <a href="${escapeNewsHTML(link)}"
             target="_blank"
             rel="noopener noreferrer">
            ${title}
          </a>
        </h3>

        ${
          excerpt
            ? `<p class="journal-excerpt">${excerpt}</p>`
            : `<p class="journal-excerpt journal-no-excerpt">
                 Read the full story from the publisher.
               </p>`
        }

        <a class="journal-read-link"
           href="${escapeNewsHTML(link)}"
           target="_blank"
           rel="noopener noreferrer">
          Read at ${publisher}
        </a>
      </div>
    </article>
  `;
}

function renderNews(articles) {
  const limit = Math.max(
    1,
    Math.min(12, Number(newsConfig.limit) || 7)
  );

  const stories = articles
    .filter(article =>
      article &&
      article.title &&
      safeNewsLink(article.link)
    )
    .slice(0, limit);

  if (!stories.length) {
    throw new Error("The news endpoint returned no usable stories.");
  }

  newsGrid.classList.add("journal-layout");

  newsGrid.innerHTML = `
    <div class="journal-feature-column">
      <div class="journal-section-heading">
        <span>EDITOR'S SELECTION</span>
        <span>01 / FEATURED</span>
      </div>

      ${renderNewsCard(stories[0], true)}
    </div>

    <div class="journal-latest-column">
      <div class="journal-section-heading">
        <span>THE LATEST</span>
        <span>${String(stories.length - 1).padStart(2, "0")} STORIES</span>
      </div>

      ${
        stories
          .slice(1)
          .map(article => renderNewsCard(article))
          .join("")
      }
    </div>
  `;
}

async function loadNews() {
  if (!newsConfig.enabled || !newsConfig.apiUrl) {
    newsStatus.textContent =
      "Financial news is currently unavailable.";
    return;
  }

  newsStatus.textContent =
    "Loading financial coverage…";

  try {
    const response = await fetch(newsConfig.apiUrl, {
      headers: {
        Accept: "application/json"
      }
    });

    if (!response.ok) {
      throw new Error(
        `News API returned ${response.status}`
      );
    }

    const data = await response.json();

    if (
      !Array.isArray(data.articles) ||
      !data.articles.length
    ) {
      throw new Error(
        "No live stories are available."
      );
    }

    renderNews(data.articles);

    const now = new Date();

    newsStatus.textContent =
      `Live financial coverage · Updated ${formatNewsDate(now)}. ` +
      "Articles are published by their respective sources.";

  } catch (error) {
    console.error("Financial news:", error);

    newsStatus.textContent =
      "Live financial coverage is temporarily unavailable. Please try again later.";
  }
}

loadNews();
  })();


  /* ===== Email signup ===== */
(() => {
  "use strict";

  const cfg = window.SITE_CONFIG && window.SITE_CONFIG.newsletter;
  const section = document.getElementById("newsletter");
  if (!section || !cfg || !cfg.enabled || !cfg.formAction) return;

  section.hidden = false;

  const form = document.getElementById("newsletterForm");
  const emailInput = document.getElementById("newsletterEmail");
  const status = document.getElementById("newsletterStatus");
  const button = form.querySelector("button[type='submit']");

  const setStatus = (message, type) => {
    status.textContent = message;
    status.dataset.state = type || "";
  };

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (form.elements.website.value) return; // honeypot: bot

    const email = emailInput.value.trim();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setStatus("Please enter a valid email address.", "error");
      emailInput.focus();
      return;
    }

    button.disabled = true;
    setStatus("Subscribing…", "");

    try {
      const body = new FormData();
      body.append(cfg.emailField || "email", email);

      await fetch(cfg.formAction, { method: "POST", mode: "no-cors", body });

      form.reset();
      setStatus("Thank you! Please check your inbox to confirm your subscription.", "success");

      if (cfg.leadMagnetUrl && /^(https:\/\/|\/)/.test(cfg.leadMagnetUrl)) {
        const link = document.createElement("a");
        link.href = cfg.leadMagnetUrl;
        link.target = "_blank";
        link.rel = "noopener";
        link.className = "text-link dark-link";
        link.textContent = cfg.leadMagnetLabel || "Download your free resource";
        status.append(" ", link);
      }
    } catch (error) {
      console.error("Newsletter signup:", error);
      setStatus("Something went wrong. Please try again in a moment.", "error");
    } finally {
      button.disabled = false;
    }
  });
})();

/* ===== Footer contact email (shows only if set in config.js) ===== */
(() => {
  const email = window.SITE_CONFIG && window.SITE_CONFIG.brand && window.SITE_CONFIG.brand.email;
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) return;
  const item = document.getElementById("footerEmailItem");
  const link = document.getElementById("footerEmail");
  if (!item || !link) return;
  link.href = "mailto:" + email;
  link.textContent = email;
  item.hidden = false;
})();