(() => {
  const search = document.getElementById("screenerSearch");
  const issuer = document.getElementById("screenerIssuer");
  const meta = document.getElementById("screenerMeta");
  const rows = document.getElementById("screenerRows");
  if (!search || !issuer || !meta || !rows) return;

  let etfs = [];

  const text = value => value == null || value === "" ? "N/A" : value;
  const escape = value => String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[char]));

  function render() {
    const query = search.value.trim().toLowerCase();
    const selectedIssuer = issuer.value;
    const filtered = etfs.filter(item => {
      const haystack = `${item.ticker} ${item.name}`.toLowerCase();
      return (!query || haystack.includes(query)) &&
        (!selectedIssuer || item.issuer === selectedIssuer);
    });

    rows.innerHTML = filtered.map(item => `
      <tr>
        <td><strong>${escape(item.ticker)}</strong></td>
        <td>${escape(text(item.name))}</td>
        <td>${escape(text(item.issuer))}</td>
        <td>${escape(text(item.category))}</td>
        <td>${item.expenseRatio == null ? "N/A" : `${escape(item.expenseRatio)}%`}</td>
        <td>${item.dividendYield == null ? "N/A" : `${escape(item.dividendYield)}%`}</td>
      </tr>
    `).join("") || '<tr><td colspan="6" class="screener-empty">No ETFs match those filters.</td></tr>';

    meta.textContent = `${filtered.length} of ${etfs.length} ETFs shown · static snapshot`;
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
      render();
    })
    .catch(error => {
      meta.textContent = error.message;
      rows.innerHTML = '<tr><td colspan="6" class="screener-empty">ETF data is unavailable.</td></tr>';
    });

  search.addEventListener("input", render);
  issuer.addEventListener("change", render);
})();
