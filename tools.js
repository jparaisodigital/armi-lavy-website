(function () {
    const $ = (s, r = document) => r.querySelector(s);
    const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  
    function money(value, currency) {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
        maximumFractionDigits: 0
      }).format(Number.isFinite(value) ? value : 0);
    }
  
    /* ---------- TOOL 1: DIVIDEND GOAL ---------- */
    function initGoal() {
      const cur = $("#goalCurrency");
      if (!cur) return;
  
      const income = $("#goalIncome");
      const yieldEl = $("#goalYield");
      const start = $("#goalStart");
      const monthly = $("#goalMonthly");
  
      function run() {
        const c = cur.value;
        $$(".goalPrefix").forEach((p) => (p.textContent = c === "PHP" ? "₱" : "$"));
  
        const target = Math.max(0, Number(income.value) || 0);
        const y = Number(yieldEl.value) / 100;
        const s = Math.max(0, Number(start.value) || 0);
        const m = Math.max(0, Number(monthly.value) || 0);
  
        $("#goalYieldValue").textContent = (y * 100).toFixed(1) + "%";
  
        const needed = (target * 12) / y;
        $("#goalNeeded").textContent = money(needed, c);
  
        const out = $("#goalTime");
        if (target === 0) { out.textContent = "Enter the monthly income you'd like to reach."; return; }
        if (s >= needed) { out.textContent = "You're already at this goal with what you have today."; return; }
  
        let balance = s;
        let months = 0;
        while (balance < needed && months < 1200) {
          balance = balance * (1 + y / 12) + m;
          months++;
        }
  
        if (balance < needed) {
          out.textContent = "At this pace it would take more than 100 years. Try adding a bit more each month or a different goal.";
          return;
        }
  
        const yrs = Math.floor(months / 12);
        const mos = months % 12;
        const parts = [];
        if (yrs) parts.push(yrs + (yrs === 1 ? " year" : " years"));
        if (mos) parts.push(mos + (mos === 1 ? " month" : " months"));
        out.textContent =
          "Adding " + money(m, c) + " a month and reinvesting dividends, you could get there in about " +
          parts.join(" and ") + ".";
      }
  
      [cur, income, yieldEl, start, monthly].forEach((el) => {
        el.addEventListener("input", run);
        el.addEventListener("change", run);
      });
      run();
    }
  
    /* ---------- TOOL 2: DIVIDEND SAFETY ---------- */
    const T = (key, label) =>
        `<button type="button" class="gl-term" data-gl="${key}">${label}</button>`;
    
      const QUESTIONS = [
        `Has the company paid its ${T("dividend", "dividend")} for at least 5 years in a row?`,
        `Is its ${T("payout-ratio", "payout ratio")} below about 70%? (Some industries, like ${T("reit", "REITs")} and utilities, normally run higher.)`,
        "Have its sales or earnings been stable or growing over the past 5 years?",
        "Are its debts manageable, with earnings comfortably covering interest?",
        `Does it generate enough ${T("free-cash-flow", "free cash flow")} to cover the dividend?`,
        `Is its ${T("dividend-yield", "yield")} close to similar companies, not unusually high?`
      ];
  
    function initSafety() {
      const box = $("#safetyQuestions");
      if (!box) return;
  
      box.innerHTML = QUESTIONS.map((q, i) => `
        <fieldset class="check-item">
          <legend>${i + 1}. ${q}</legend>
          <div class="check-options">
            <label><input type="radio" name="q${i}" value="yes" /><span>Yes</span></label>
            <label><input type="radio" name="q${i}" value="no" /><span>No</span></label>
            <label><input type="radio" name="q${i}" value="unsure" /><span>Not sure</span></label>
          </div>
        </fieldset>`).join("");
  
      const result = $("#safetyResult");
  
      function evaluate() {
        const answers = QUESTIONS.map((_, i) => {
          const el = $(`input[name="q${i}"]:checked`, box);
          return el ? el.value : null;
        });
        const answered = answers.filter(Boolean).length;
        $("#safetyProgress").textContent = answered + " of " + QUESTIONS.length + " answered";
  
        if (answered < QUESTIONS.length) { result.hidden = true; return; }
  
        const yes = answers.filter((a) => a === "yes").length;
        const unsure = answers.filter((a) => a === "unsure").length;
  
        let title, text;
        if (yes >= 5) {
          title = "Looks fairly sturdy";
          text = "Most of the signs point to a dividend that is well supported. It's still worth confirming each answer with the company's latest reports.";
        } else if (yes >= 3) {
          title = "Mixed signals. Dig deeper";
          text = "Some things look good and some don't. That's common, and it's a sign to look closer before deciding anything.";
        } else {
          title = "Handle with care";
          text = "Several signs suggest the dividend may be less secure. A high payout is not the same as a safe one.";
        }
        if (unsure > 0) {
          text += " You weren't sure about " + unsure + (unsure === 1 ? " item" : " items") +
            ". Those are the best places to research next.";
        }
  
        $("#safetyScore").textContent = yes + " OF " + QUESTIONS.length + " POSITIVE SIGNS";
        $("#safetyTitle").textContent = title;
        $("#safetyText").textContent = text;
  
        let pips = $("#safetyPips");
        if (!pips) {
          pips = document.createElement("div");
          pips.id = "safetyPips";
          pips.className = "pips";
          result.insertBefore(pips, result.firstChild);
        }
        pips.innerHTML = answers
          .map((a, idx) =>
            `<span class="pip ${a === "yes" ? "is-yes" : a === "unsure" ? "is-unsure" : ""}" style="--i:${idx}"></span>`
          )
          .join("");
  
        const wasHidden = result.hidden;
        result.hidden = false;
  
        result.classList.remove("is-revealed");
        void result.offsetWidth;
        result.classList.add("is-revealed");
  
        if (wasHidden) {
          setTimeout(() => result.scrollIntoView({ behavior: "smooth", block: "nearest" }), 120);
        }
      }
  
      box.addEventListener("change", evaluate);
      $("#safetyReset").addEventListener("click", () => {
        $$("input[type=radio]", box).forEach((r) => (r.checked = false));
        result.classList.remove("is-revealed");
        evaluate();
      });
      evaluate();
    }
  
    document.addEventListener("DOMContentLoaded", () => {
      initGoal();
      initSafety();
    });
  })();