(function () {
    const $ = (s, r = document) => r.querySelector(s);
    const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  
    /* ---------- SINGLE SOURCE OF TRUTH FOR ALL DEFINITIONS ----------
       The first sentence of each "def" is what shows in the tooltip.
       Add new terms here and they appear in the glossary and tooltips. */
    const GLOSSARY = [
      { key: "compounding", term: "Compounding",
        def: "Earning returns on your earlier returns. Reinvested dividends buy more shares, which pay more dividends, so growth builds on itself over time." },
      { key: "diversification", term: "Diversification",
        def: "Spreading your money across different companies and sectors so one bad result doesn't sink your whole portfolio." },
      { key: "dividend", term: "Dividend",
        def: "A portion of a company's profits paid out to its shareholders, usually in cash and often every quarter. Companies aren't required to pay one, and they can reduce or stop it." },
      { key: "dividend-aristocrat", term: "Dividend Aristocrat",
        def: "A company in the S&P 500 that has raised its dividend for at least 25 years in a row. It's an impressive track record, but past increases don't guarantee future ones." },
      { key: "dividend-yield", term: "Dividend yield",
        def: "The yearly dividend per share divided by the share price, shown as a percentage. A $100 stock paying $4 a year has a 4% yield. Yield rises when the price falls, so a very high yield can be a warning sign rather than a bargain." },
      { key: "drip", term: "DRIP",
        def: "A dividend reinvestment plan automatically uses your dividends to buy more shares instead of paying you cash. Many brokerages offer it, often at no extra cost." },
      { key: "emergency-fund", term: "Emergency fund",
        def: "Cash set aside for surprises like job loss or repairs, kept separate from your investments. Many people aim for three to six months of expenses." },
      { key: "etf", term: "ETF",
        def: "An exchange-traded fund is a basket of many investments that trades like a single stock. A dividend ETF holds lots of dividend-paying companies, so one company cutting its payout matters less." },
      { key: "ex-dividend-date", term: "Ex-dividend date",
        def: "The cutoff for receiving the next dividend. You need to own the stock before this date. If you buy on or after it, the payment goes to the previous owner." },
      { key: "expense-ratio", term: "Expense ratio",
        def: "The yearly fee a fund charges, shown as a percentage of the money you have in it. A 0.10% expense ratio costs about $1 a year for every $1,000 invested." },
      { key: "free-cash-flow", term: "Free cash flow",
        def: "The cash a company has left after paying to run and maintain its business. It's what ultimately funds dividends, which is why many investors watch it as closely as earnings." },
      { key: "payout-ratio", term: "Payout ratio",
        def: "The share of a company's earnings paid out as dividends. A $1 dividend on $2 of earnings per share is a 50% payout ratio. A lower ratio usually leaves more room to keep paying in a slow year, though what's normal differs by industry." },
      { key: "qualified-dividend", term: "Qualified dividend",
        def: "In the US, a dividend that may be taxed at lower long-term capital gains rates instead of ordinary income rates, if certain holding-period rules are met. Tax rules change, so check IRS guidance or ask a tax professional." },
      { key: "reit", term: "REIT",
        def: "A real estate investment trust is a company that owns income-producing property. In the US, REITs generally must pay out at least 90% of their taxable income to shareholders, so they tend to have high yields and high payout ratios." }
    ];
  
    const byKey = {};
    GLOSSARY.forEach((g) => (byKey[g.key] = g));
  
    function shortDef(key) {
      const g = byKey[key];
      if (!g) return null;
      const m = g.def.match(/^.*?[.!?](\s|$)/);
      return m ? m[0].trim() : g.def;
    }
  
    /* ---------- render glossary list (learn.html) ---------- */
    function renderList() {
      const list = $("#glossaryList");
      if (!list) return;
  
      list.innerHTML = GLOSSARY.map(
        (g) => `<div class="gl-item" id="gl-${g.key}"><dt>${g.term}</dt><dd>${g.def}</dd></div>`
      ).join("");
  
      function markTarget() {
        $$(".gl-item.is-target").forEach((el) => el.classList.remove("is-target"));
        const id = location.hash.slice(1);
        const el = id && document.getElementById(id);
        if (el && el.classList.contains("gl-item")) {
          el.classList.add("is-target");
          el.scrollIntoView({ block: "center" });
        }
      }
      markTarget();
      window.addEventListener("hashchange", markTarget);
  
      const input = $("#glSearch");
      const empty = $("#glEmpty");
      if (!input) return;
  
      const items = $$(".gl-item", list);
      input.addEventListener("input", () => {
        const q = input.value.trim().toLowerCase();
        let shown = 0;
        items.forEach((item) => {
          const match = !q || item.textContent.toLowerCase().includes(q);
          item.hidden = !match;
          if (match) shown++;
        });
        empty.hidden = shown !== 0;
      });
    }
  
    /* ---------- tooltip ---------- */
    const tip = document.createElement("div");
    tip.className = "gl-tip";
    tip.id = "glTip";
    tip.setAttribute("role", "tooltip");
    tip.hidden = true;
    document.body.appendChild(tip);
  
    const canHover = window.matchMedia("(hover: hover)").matches;
    let active = null;
    let hideTimer = null;
  
    function place(el) {
      tip.style.left = "0px";
      tip.style.top = "0px";
      tip.hidden = false;
      const r = el.getBoundingClientRect();
      const w = tip.offsetWidth;
      const h = tip.offsetHeight;
      const gap = 10;
      let left = r.left + r.width / 2 - w / 2;
      left = Math.max(12, Math.min(left, window.innerWidth - w - 12));
      let top = r.bottom + gap;
      if (top + h > window.innerHeight - 12 && r.top - gap - h > 12) top = r.top - gap - h;
      tip.style.left = left + "px";
      tip.style.top = top + "px";
    }
  
    function show(el) {
      const key = el.dataset.gl;
      const def = shortDef(key);
      if (!def) return;
  
      tip.textContent = "";
      const title = document.createElement("strong");
      title.textContent = byKey[key].term;
      const body = document.createElement("span");
      body.textContent = def;
      const link = document.createElement("a");
      link.href = (document.getElementById("glossaryList") ? "" : "learn.html") + "#gl-" + key;
      link.textContent = "Full definition →";
      link.addEventListener("click", hide);
      tip.append(title, body, link);
  
      active = el;
      el.setAttribute("aria-describedby", "glTip");
      place(el);
    }
  
    function hide() {
      tip.hidden = true;
      if (active) active.removeAttribute("aria-describedby");
      active = null;
    }
  
    function scheduleHide() {
      clearTimeout(hideTimer);
      hideTimer = setTimeout(hide, 160);
    }
  
    document.addEventListener("mouseover", (e) => {
      if (!canHover) return;
      const t = e.target.closest(".gl-term");
      if (t) { clearTimeout(hideTimer); show(t); }
      else if (e.target.closest(".gl-tip")) clearTimeout(hideTimer);
    });
  
    document.addEventListener("mouseout", (e) => {
      if (!canHover) return;
      if (e.target.closest(".gl-term") || e.target.closest(".gl-tip")) scheduleHide();
    });
  
    document.addEventListener("click", (e) => {
      const t = e.target.closest(".gl-term");
      if (t) {
        e.preventDefault();
        if (active === t && !tip.hidden) hide();
        else show(t);
        return;
      }
      if (!e.target.closest(".gl-tip")) hide();
    });
  
    document.addEventListener("focusin", (e) => {
      const t = e.target.closest(".gl-term");
      if (t) show(t);
    });
  
    document.addEventListener("focusout", (e) => {
      if (e.target.closest(".gl-term")) scheduleHide();
    });
  
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") hide(); });
    window.addEventListener("scroll", hide, { passive: true });
    window.addEventListener("resize", hide);
  
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", renderList);
    } else {
      renderList();
    }
  })();