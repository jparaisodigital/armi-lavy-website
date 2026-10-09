(() => {
    "use strict";
  
    const $ = (selector, root = document) => root.querySelector(selector);
  
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
  
    const form = $("#dividendForm");
    if (!form) return;
  
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
      const yieldRate = Math.max(0, Math.min(15, Number(yieldInput.value) || 0)) / 100;
      const years = Math.max(1, Math.min(30, Number(yearsInput.value) || 1));
      const reinvest = reinvestInput.checked;
      const currency = currencySelect.value;
      const months = years * 12;
  
      yieldValue.textContent = `${(yieldRate * 100).toFixed(2)}%`;
  
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
  
      const incomeBase = reinvest ? estimatedPortfolio : totalContributions;
      const annualIncome = incomeBase * yieldRate;
      const monthlyIncome = annualIncome / 12;
  
      annualResult.textContent = formatMoney(annualIncome, currency);
      monthlyResult.textContent = formatMoney(monthlyIncome, currency);
      portfolioResult.textContent = formatMoney(estimatedPortfolio, currency);
      contributionsResult.textContent = formatMoney(totalContributions, currency);
  
      resultDisclaimer.textContent = reinvest
        ? `Illustration over ${years} year(s), assuming a constant ${(yieldRate * 100).toFixed(2)}% annual yield and monthly reinvestment. Actual results may differ substantially.`
        : `Illustration over ${years} year(s), assuming a constant ${(yieldRate * 100).toFixed(2)}% annual yield without reinvesting dividends. Actual results may differ substantially.`;
    }
  
    form.addEventListener("submit", calculateDividend);
    currencySelect.addEventListener("change", syncCurrency);
    initialInput.addEventListener("input", calculateDividend);
    monthlyInput.addEventListener("input", calculateDividend);
    yieldInput.addEventListener("input", calculateDividend);
    yearsInput.addEventListener("change", calculateDividend);
    reinvestInput.addEventListener("change", calculateDividend);
  
    syncCurrency();
  })();