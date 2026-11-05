(() => {
  const amountInput = document.getElementById("backtestAmount");
  const runButton = document.getElementById("backtestRun");
  const contributionInput = document.getElementById("backtestContribution");
  const dateRange = document.getElementById("backtestDateRange");
  const range = document.getElementById("backtestRange");
  const chart = document.getElementById("backtestChart");
  const rows = document.getElementById("backtestRows");
  if (!amountInput || !runButton || !range || !chart || !rows) return;

  const funds = ["SCHD", "JEPI", "VYMI", "VOO"];
  let data = {};

  const money = value => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
  const pct = value => `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;

  function calculate() {
    const amount = Math.max(1, Number(amountInput.value) || 10000);
    const contribution = Math.max(0, Number(contributionInput.value) || 0);
    const monthly = Object.fromEntries(funds.map(fund => [fund, Object.fromEntries(
      data[fund].series.map(point => [point.date.slice(0, 7), point])
    )]));
    const monthSets = funds.map(fund => Object.keys(monthly[fund]));
    const commonMonths = monthSets.reduce((common, current) => common.filter(month => current.includes(month)));
    const requestedMonths = dateRange.value === "all" ? commonMonths.length : Number(dateRange.value);
    const selectedMonths = commonMonths.slice(-requestedMonths);
    const startDate = selectedMonths[0];
    const endDate = selectedMonths[selectedMonths.length - 1];
    const results = funds.map(fund => {
      const series = selectedMonths.map(month => monthly[fund][month]);
      let ending = amount;
      for (let index = 1; index < series.length; index += 1) {
        ending = ending * (series[index].value / series[index - 1].value) + contribution;
      }
      const contributed = amount + contribution * Math.max(0, series.length - 1);
      return { fund, ending, totalReturn: (ending / contributed - 1) * 100, points: series.length };
    });

    range.textContent = `${startDate} → ${endDate} · ${selectedMonths.length} shared monthly points · contributions: ${money(contribution)}/month`;
    rows.innerHTML = results.map(result => `<tr><td><strong>${result.fund}</strong></td><td>${money(result.ending)}</td><td>${pct(result.totalReturn)}</td><td>${result.points}</td></tr>`).join("");
    const max = Math.max(...results.map(result => result.ending));
    chart.innerHTML = results.map(result => `<div class="backtest-bar-row"><span>${result.fund}</span><div class="backtest-bar-track"><div class="backtest-bar" style="width:${Math.max(4, result.ending / max * 100)}%"></div></div><strong>${money(result.ending)}</strong></div>`).join("");
  }

  Promise.all(funds.map(fund => fetch(`data/prices/${fund.toLowerCase()}.json`).then(response => response.json()).then(value => { data[fund] = value; })))
    .then(calculate)
    .catch(() => {
      range.textContent = "Backtester data is unavailable.";
      rows.innerHTML = '<tr><td colspan="4">Historical data could not be loaded.</td></tr>';
    });

  runButton.addEventListener("click", calculate);
})();
