(function () {
    // Respect "reduce motion" settings: no animation at all
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  
    // [selector, animation type]. The first match wins if an element appears twice.
    const MAP = [
      [".marquee", "fade"],

      [".page-hero .section-kicker", "up"],
      [".page-hero h1", "mask"],
      [".page-hero p", "up"],
      [".teasers-head", "up"],
      [".teaser-card", "zoom"],
  
      [".intro .section-kicker", "up"],
      [".intro h2", "mask"],
      [".intro-copy", "right"],
      [".principle", "up"],
  
      [".section-heading .section-kicker", "up"],
      [".section-heading h2", "mask"],
      [".section-heading .section-description", "up"],
      [".section-heading > a, .section-heading > span", "fade"],
  
      ["#featuredProduct", "zoom"],
      ["#productGrid", "up"],
  
      [".calculator-intro", "left"],
      [".calculator-card", "right"],
  
      [".tools-head .section-kicker", "up"],
      [".tools-head h2", "mask"],
      [".tools-head p", "up"],
      [".tool-card", "zoom"],
  
      [".quote-band blockquote", "blur"],
      [".quote-meta", "up"],
  
      ["#newsStatus", "fade"],
      ["#newsGrid", "up"],
  
      [".faq-list details", "up"],
  
      [".glossary-side", "left"],
      [".glossary-main", "up"],
  
      [".closing-cta h2", "mask"],
      [".closing-cta > *:not(h2)", "up"],
  
      [".footer-top > *", "up"]
    ];
  
    try {
      const pending = [];
  
      MAP.forEach(([selector, type]) => {
        document.querySelectorAll(selector).forEach((el) => {
          if (el.hasAttribute("data-reveal")) return;
          el.setAttribute("data-reveal", type);
          pending.push(el);
        });
      });
  
      // keep document order so the stagger runs top to bottom
      pending.sort((a, b) =>
        a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1
      );
  
      document.documentElement.classList.add("reveal");
  
      function finish(el) {
        // hand the element back to its normal CSS (hover effects, etc.)
        el.removeAttribute("data-reveal");
        el.classList.remove("is-in");
        el.style.transitionDelay = "";
      }
  
      function check() {
        const limit = window.innerHeight * 0.9;
        const ready = [];
  
        for (let i = pending.length - 1; i >= 0; i--) {
          if (pending[i].getBoundingClientRect().top < limit) {
            ready.unshift(pending[i]);
            pending.splice(i, 1);
          }
        }
  
        ready.forEach((el, i) => {
          const delay = Math.min(i, 4) * 110;
          el.style.transitionDelay = delay + "ms";
          el.classList.add("is-in");
          setTimeout(() => finish(el), 1700 + delay);
        });
  
        if (!pending.length) {
          window.removeEventListener("scroll", onScroll);
          window.removeEventListener("resize", onScroll);
        }
      }
  
      let ticking = false;
      function onScroll() {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
          ticking = false;
          check();
        });
      }
  
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll);
      window.addEventListener("load", check);
      check();
    } catch (err) {
      // if anything goes wrong, never leave the page hidden
      document.documentElement.classList.remove("reveal");
    }
  })();