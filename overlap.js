(() => {
  "use strict";

  const $ = (selector, root = document) => root.querySelector(selector);

  const escapeHTML = (value) =>
    String(value ?? "").replace(/[&<>"']/g, (char) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    }[char]));

  const formatPercent = (value) =>
    `${Number(value || 0).toFixed(2)}%`;

  const formatDate = (value) => {
    if (!value) return "Unknown";
    const date = new Date(`${value}T00:00:00`);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  async function loadJSON(path) {
    const response = await fetch(path);
    if (!response.ok) {
      throw new Error(`Unable to load ${path}`);
    }
    return response.json();
  }

  async function initOverlap() {
    const root = $("#overlapTool");
    if (!root) return;

    const status = $("#overlapStatus");
    const summary = $("#overlapSummary");
    const tableBody = $("#overlapTableBody");
    const sourceLinks = $("#overlapSources");

    try {
      const [report, schd, vymi] = await Promise.all([
        loadJSON("data/overlap/schd-vymi.json"),
        loadJSON("data/holdings/schd.json"),
        loadJSON("data/holdings/vymi.json")
      ]);

      summary.innerHTML = `
        <div class="overlap-stat">
          <span>VALIDATED SHARED HOLDINGS</span>
          <strong>${report.validatedMatches}</strong>
        </div>
        <div class="overlap-stat">
          <span>SCHD WEIGHT IN OVERLAP</span>
          <strong>${formatPercent(report.directOverlapWeightSCHD)}</strong>
        </div>
        <div class="overlap-stat">
          <span>VYMI WEIGHT IN OVERLAP</span>
          <strong>${formatPercent(report.directOverlapWeightVYMI)}</strong>
        </div>
      `;

      tableBody.innerHTML = `
        <tr>
          <td colspan="5" class="overlap-empty">
            No direct shared company holdings were found in these snapshots.
          </td>
        </tr>
      `;

      sourceLinks.innerHTML = `
        <span>Data as of ${escapeHTML(formatDate(report.schdDataAsOf))}</span>
        <a href="${escapeHTML(schd.source)}" target="_blank" rel="noopener">SCHD source</a>
        <a href="${escapeHTML(vymi.source)}" target="_blank" rel="noopener">VYMI source</a>
      `;

      status.textContent =
        "Validated using country-aware ticker matching and company-name cross-checking.";
      status.dataset.state = "success";
    } catch (error) {
      console.error("ETF overlap:", error);
      status.textContent =
        "This comparison is temporarily unavailable. Please try again later.";
      status.dataset.state = "error";
    }
  }

  initOverlap();
})();
