(() => {
    "use strict";
  
    const $ = (s, r = document) => r.querySelector(s);
    const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  
    // Brand name & initials (from config if available)
    const config = window.SITE_CONFIG;
    if (config?.brand) {
      $$(".brand-name").forEach((el) => {
        el.textContent = config.brand.name.toUpperCase();
      });
      $$(".brand-mark").forEach((el) => {
        el.textContent = config.brand.initials;
      });
    }
  
    // Current year
    const yearEl = $("#currentYear");
    if (yearEl) yearEl.textContent = new Date().getFullYear();
  
    // Mobile navigation
    const menuToggle = $("#menuToggle");
    const mainNav = $("#mainNav");
  
    if (menuToggle && mainNav) {
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
    }
  
    // Footer email (shows only if set in config.js)
    const email = config?.brand?.email;
    if (email && /^\S+@\S+\.\S+$/.test(email)) {
      const item = $("#footerEmailItem");
      const link = $("#footerEmail");
      if (item && link) {
        link.href = "mailto:" + email;
        const textEl = $("#footerEmailText");
        if (textEl) textEl.textContent = email;
        else link.textContent = email;
        item.hidden = false;
      }
    }
  
    // FAQ smooth open/close (shared)
    const items = $$(".faq-list details");
    if (items.length) {
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
      const DURATION = 350;
      const EASING = "ease";
  
      items.forEach((details) => {
        const summary = details.querySelector("summary");
        let animation = null;
  
        const finish = (open) => {
          details.open = open;
          details.classList.toggle("is-open", open);
          details.style.height = "";
          details.style.overflow = "";
          animation = null;
        };
  
        const animate = (from, to, open) => {
          if (animation) animation.cancel();
          details.style.overflow = "hidden";
          animation = details.animate(
            { height: [from + "px", to + "px"] },
            { duration: DURATION, easing: EASING }
          );
          animation.onfinish = () => finish(open);
          animation.oncancel = () => { animation = null; };
        };
  
        summary.addEventListener("click", (event) => {
          event.preventDefault();
  
          if (reduceMotion.matches) {
            details.open = !details.open;
            details.classList.toggle("is-open", details.open);
            return;
          }
  
          const closedHeight = summary.offsetHeight;
  
          if (details.open && details.classList.contains("is-open")) {
            details.classList.remove("is-open");
            details.style.overflow = "hidden";
            animate(details.offsetHeight, closedHeight, false);
          } else {
            const startHeight = details.offsetHeight;
            details.style.overflow = "hidden";
            details.open = true;
            details.classList.add("is-open");
            const p = details.querySelector("p");
            const endHeight = summary.offsetHeight +
              (p ? p.offsetHeight + parseFloat(getComputedStyle(p).marginBottom || 0) : 0);
            animate(startHeight, endHeight, true);
          }
        });
  
        if (details.open) details.classList.add("is-open");
      });
    }
  })();