(() => {
  const search = document.getElementById("screenerSearch");
  const issuer = document.getElementById("screenerIssuer");
  const category = document.getElementById("screenerCategory");
  const sort = document.getElementById("screenerSort");
  const reset = document.getElementById("screenerReset");
  const meta = document.getElementById("screenerMeta");
  const rows = document.getElementById("screenerRows");
  if (!search || !issuer || !meta || !rows) return;

  let etfs = [];

  const text = value => value == null || value === "" ? "N/A" : value;
  const aum = item => {
    if (item.assetsUnderManagement == null || item.assetsUnderManagement === "") return "N/A";
    const value = Number(item.assetsUnderManagement);
    if (!Number.isFinite(value)) return "N/A";
    if (item.aumUnit === "USD billions") return `$${value.toFixed(2)}B`;
    if (item.aumUnit === "USD millions") {
      return value >= 1000 ? `$${(value / 1000).toFixed(2)}B` : `$${value.toFixed(2)}M`;
    }
    if (item.aumUnit === "USD") {
      if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
      if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    }
    return `$${value.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
  };
  const statusLabel = status => ({
    closed: "Closed / legacy",
    excluded: "Excluded ETN",
    unverified: "Unverified",
    renamed: "Legacy ticker"
  }[status] || "");
  const statusDescription = status => ({
    closed: "This fund is closed or liquidated; current issuer metrics are not populated.",
    excluded: "This client-list entry is an ETN and is excluded from the core ETF metrics.",
    unverified: "The ticker could not be matched to a current official issuer page.",
    renamed: "This legacy ticker was retained for reference after a ticker change."
  }[status] || "");
  const naTitle = (item, metric) => {
    const statusNote = statusDescription(item.status);
    if (statusNote) return statusNote;
    if (metric === "yield") return "The issuer did not publish a 30-day SEC yield in the captured source snapshot.";
    if (metric === "expense") return "The issuer did not publish an expense ratio in the captured source snapshot.";
    return "The issuer did not publish this metric in the captured source snapshot.";
  };
  const metric = (value, suffix, item, metricName) => value == null
    ? `<span class="screener-na" title="${escape(naTitle(item, metricName))}">N/A</span>`
    : `${escape(value)}${suffix}`;
  const escape = value => String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[char]));

  function render() {
    const query = search.value.trim().toLowerCase();
    const selectedIssuer = issuer.value;
    const filtered = etfs.filter(item => {
      const haystack = `${item.ticker} ${item.name}`.toLowerCase();
      return (!query || haystack.includes(query)) &&
      (!selectedIssuer || item.issuer === selectedIssuer) &&
      (!category.value || (item.category || "Unclassified") === category.value);
    });

    filtered.sort((a, b) => {
      if (sort.value === "name") return String(a.name).localeCompare(String(b.name));
      if (sort.value === "expenseAsc" || sort.value === "expenseDesc") {
        const av = a.expenseRatio == null ? Number.POSITIVE_INFINITY : Number(a.expenseRatio);
        const bv = b.expenseRatio == null ? Number.POSITIVE_INFINITY : Number(b.expenseRatio);
        return sort.value === "expenseAsc" ? av - bv : bv - av;
      }
      return String(a.ticker).localeCompare(String(b.ticker));
    });

    rows.innerHTML = filtered.map(item => `
      <tr>
        <td><strong>${escape(item.ticker)}</strong></td>
        <td>
          ${escape(text(item.name))}
          ${statusLabel(item.status) ? `<span class="screener-status" data-status="${escape(item.status)}">${escape(statusLabel(item.status))}</span>` : ""}
        </td>
        <td>${escape(text(item.issuer))}</td>
        <td>${escape(text(item.category))}</td>
        <td>${metric(item.expenseRatio, "%", item, "expense")}</td>
        <td>${metric(item.dividendYield, "%", item, "yield")}</td>
        <td>${escape(aum(item))}</td>
        <td>${escape(text(item.dataAsOf))}</td>
      </tr>
    `).join("") || '<tr><td colspan="8" class="screener-empty">No ETFs match those filters.</td></tr>';

      const reviewableCount = etfs.filter(item => !["closed", "excluded", "unverified"].includes(item.status)).length;
      meta.textContent = `${filtered.length} of ${etfs.length} ETFs shown · ${reviewableCount} current/reviewable records · static snapshot`;
  }

  fetch("data/etfs.json")
    .then(response => {
      if (!response.ok) throw new Error("ETF data could not be loaded");
      return response.json();
    })
    .then(data => {
      etfs = Array.isArray(data.etfs) ? data.etfs : [];
      [...new Set(etfs.map(item => item.issuer).filter(Boolean))].sort().forEach(value => {
        const option = document.createElement("option");
        option.value = value;
        option.textContent = value;
        issuer.appendChild(option);
      });
      [...new Set(etfs.map(item => item.category || "Unclassified"))].sort().forEach(value => {
        const option = document.createElement("option");
        option.value = value;
        option.textContent = value;
        category.appendChild(option);
      });
      render();
    })
    .catch(error => {
      meta.textContent = error.message;
      rows.innerHTML = '<tr><td colspan="8" class="screener-empty">ETF data is unavailable.</td></tr>';
    });

  search.addEventListener("input", render);
  issuer.addEventListener("change", render);
  category.addEventListener("change", render);
  sort.addEventListener("change", render);
  reset.addEventListener("click", () => {
    search.value = "";
    issuer.value = "";
    category.value = "";
    sort.value = "ticker";
    render();
  });
})();
