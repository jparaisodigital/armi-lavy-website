(function () {
    const $ = (s, r = document) => r.querySelector(s);
    const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  
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
  
    function shortDef(key) {
      const dd = $(`#gl-${key} dd`);
      if (!dd) return null;
      const text = dd.textContent.trim();
      const m = text.match(/^.*?[.!?](\s|$)/);
      return m ? m[0].trim() : text;
    }
  
    function termName(key) {
      const dt = $(`#gl-${key} dt`);
      return dt ? dt.textContent.trim() : key;
    }
  
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
      if (top + h > window.innerHeight - 12 && r.top - gap - h > 12) {
        top = r.top - gap - h;
      }
      tip.style.left = left + "px";
      tip.style.top = top + "px";
    }
  
    function show(el) {
      const key = el.dataset.gl;
      const def = shortDef(key);
      if (!def) return;
  
      tip.textContent = "";
      const title = document.createElement("strong");
      title.textContent = termName(key);
      const body = document.createElement("span");
      body.textContent = def;
      const link = document.createElement("a");
      link.href = "#gl-" + key;
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
  
    /* ---------- glossary search ---------- */
    document.addEventListener("DOMContentLoaded", () => {
      const input = $("#glSearch");
      if (!input) return;
      const items = $$(".gl-item");
      const empty = $("#glEmpty");
  
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
    });
  })();