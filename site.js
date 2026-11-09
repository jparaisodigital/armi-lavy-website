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
        if (!el.querySelector("img")) {
          const img = document.createElement("img");
          img.src = "/assets/logo.png?v=3";
          img.alt = "";
          el.appendChild(img);
        }
      });
    }

    // Current year
    const yearEl = $("#currentYear");
    if (yearEl) yearEl.textContent = new Date().getFullYear();
  
    // Mobile navigation
    const menuToggle = document.getElementById("menuToggle");
    const mainNav = document.getElementById("mainNav");

    if (menuToggle && mainNav) {
      menuToggle.onclick = function (event) {
        event.preventDefault();
        const isOpen = mainNav.classList.toggle("is-open");
        menuToggle.setAttribute("aria-expanded", String(isOpen));
      };

      mainNav.querySelectorAll("a").forEach((link) => {
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
        if (textEl) textEl.textContent = "Email us";
        else link.textContent = "Email us";
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

// Keep tool-page CTAs aligned to the visible tool heading, not the padded
// section boundary. The data-driven sections can change height after load,
// so repeat the correction after the layout settles.
(() => {
  "use strict";

  const toolTargets = new Set(["overlapTool", "screenerTool", "backtesterTool"]);

  function alignToolHash() {
    if (!toolTargets.has(window.location.hash.slice(1))) return;

    const target = document.getElementById(window.location.hash.slice(1));
    if (!target) return;

    const heading = target.querySelector(".tools-head") || target;
    const header = document.querySelector(".site-header");
    const offset = (header?.getBoundingClientRect().height || 0) + 18;
    const top = window.scrollY + heading.getBoundingClientRect().top - offset;

    window.scrollTo({ top: Math.max(0, top), behavior: "auto" });
  }

  function scheduleAlignment() {
    requestAnimationFrame(() => {
      alignToolHash();
      setTimeout(alignToolHash, 250);
      setTimeout(alignToolHash, 700);
      setTimeout(alignToolHash, 1200);
    });
  }

  window.addEventListener("hashchange", scheduleAlignment);
  document.addEventListener("DOMContentLoaded", scheduleAlignment);
    window.addEventListener("load", scheduleAlignment);
})();

(() => {
  "use strict";

  const chatHead = document.querySelector(".facebook-chat-head");
  if (!chatHead) return;

  if (chatHead.parentElement !== document.body) {
    document.body.appendChild(chatHead);
  }

  const isCoarsePointer = window.matchMedia(
    "(hover: none), (pointer: coarse)"
  ).matches;

  let startX = 0;
  let startY = 0;
  let originLeft = 0;
  let originTop = 0;

  let dragging = false;
  let moved = false;
  let armed = false;

  let armTimer = 0;
  let showTimer = 0;

  const DRAG_THRESHOLD = 6;
  const ARM_TIMEOUT = 2200;
  const CLOSE_HIT_SIZE = 26;

  chatHead.classList.remove("is-scrolling");

  // Prevent the browser's native link/image drag from stealing pointer movement.
  chatHead.setAttribute("draggable", "false");

  chatHead.addEventListener("dragstart", (event) => {
    event.preventDefault();
  });

  function clearArmTimer() {
    window.clearTimeout(armTimer);
    armTimer = 0;
  }

  function disarm() {
    armed = false;
    chatHead.classList.remove("is-armed");
    clearArmTimer();
  }

  function arm() {
    armed = true;
    chatHead.classList.add("is-armed");

    clearArmTimer();
    armTimer = window.setTimeout(disarm, ARM_TIMEOUT);
  }

  function isCloseHit(event) {
    const rect = chatHead.getBoundingClientRect();

    return (
      event.clientX >= rect.right - CLOSE_HIT_SIZE &&
      event.clientX <= rect.right + 10 &&
      event.clientY >= rect.top - 10 &&
      event.clientY <= rect.top + CLOSE_HIT_SIZE
    );
  }

  function dismissChatHead() {
    disarm();
    chatHead.classList.add("is-dismissed");
  }

  chatHead.addEventListener("pointerdown", (event) => {
    if (event.button !== undefined && event.button !== 0) return;

    const rect = chatHead.getBoundingClientRect();

    startX = event.clientX;
    startY = event.clientY;
    originLeft = rect.left;
    originTop = rect.top;

    dragging = true;
    moved = false;

    chatHead.setPointerCapture?.(event.pointerId);
  });

  chatHead.addEventListener("pointermove", (event) => {
    if (!dragging) return;

    const dx = event.clientX - startX;
    const dy = event.clientY - startY;

    if (
      !moved &&
      Math.hypot(dx, dy) < DRAG_THRESHOLD
    ) {
      return;
    }

    moved = true;
    chatHead.classList.add("is-dragging");
    disarm();

    const width = chatHead.offsetWidth;
    const height = chatHead.offsetHeight;

    const nextLeft = Math.min(
      window.innerWidth - width - 8,
      Math.max(8, originLeft + dx)
    );

    const nextTop = Math.min(
      window.innerHeight - height - 8,
      Math.max(8, originTop + dy)
    );

    chatHead.style.setProperty("left", `${nextLeft}px`, "important");
    chatHead.style.setProperty("top", `${nextTop}px`, "important");
    chatHead.style.setProperty("right", "auto", "important");
    chatHead.style.setProperty("bottom", "auto", "important");

    event.preventDefault();
  });

  chatHead.addEventListener("pointerup", (event) => {
    if (!dragging) return;

    dragging = false;

    try {
      chatHead.releasePointerCapture?.(event.pointerId);
    } catch {}

    window.setTimeout(() => {
      chatHead.classList.remove("is-dragging");
    }, 0);
  });

  chatHead.addEventListener("pointercancel", () => {
    dragging = false;
    moved = false;
    chatHead.classList.remove("is-dragging");
  });

  chatHead.addEventListener("click", (event) => {
    /*
      A drag should never activate the Facebook link.
    */
    if (moved) {
      event.preventDefault();
      event.stopPropagation();
      moved = false;
      return;
    }

    /*
      The visual × is a pseudo-element, so detect its
      top-right hit area from pointer coordinates.
    */
    if (isCloseHit(event)) {
      event.preventDefault();
      event.stopPropagation();
      dismissChatHead();
      return;
    }

    /*
      Mobile / touch:
      first tap = reveal ×
      second tap = follow Facebook link
    */
    if (isCoarsePointer) {
      if (!armed) {
        event.preventDefault();
        event.stopPropagation();
        arm();
        return;
      }

      disarm();
      return;
    }

    /*
      Desktop normal click continues to Facebook.
    */
  });

  /*
    Preserve existing behavior: briefly fade the chat head
    while the page is actively scrolling.
  */
  const hideWhileScrolling = () => {
    if (dragging) return;

    chatHead.classList.add("is-scrolling");

    window.clearTimeout(showTimer);

    showTimer = window.setTimeout(() => {
      window.requestAnimationFrame(() => {
        chatHead.classList.remove("is-scrolling");

  // Prevent the browser's native link/image drag from stealing pointer movement.
  chatHead.setAttribute("draggable", "false");

  chatHead.addEventListener("dragstart", (event) => {
    event.preventDefault();
  });
      });
    }, 420);
  };

  window.addEventListener(
    "scroll",
    hideWhileScrolling,
    { passive: true }
  );

  window.addEventListener(
    "pagehide",
    () => {
      clearArmTimer();
      window.clearTimeout(showTimer);
    },
    { once: true }
  );
})();

/* Chat-head scroll visibility and footer positioning */
(() => {
  "use strict";

  const chatHead = document.querySelector(".facebook-chat-head");
  const footer = document.querySelector(".site-footer");

  if (!chatHead) return;

  function updateChatHeadPosition() {
    const maxScroll =
      document.documentElement.scrollHeight -
      window.innerHeight;

    const pastHalf =
      maxScroll > 0 &&
      window.scrollY >= maxScroll * 0.5;

    let footerVisible = false;

    if (footer) {
      const rect = footer.getBoundingClientRect();

      footerVisible =
        rect.top < window.innerHeight &&
        rect.bottom > 0;
    }

    chatHead.classList.toggle(
      "is-halfway",
      pastHalf
    );

    chatHead.classList.toggle(
      "is-footer-zone",
      pastHalf && footerVisible
    );
  }

  window.addEventListener(
    "scroll",
    updateChatHeadPosition,
    { passive: true }
  );

  window.addEventListener(
    "resize",
    updateChatHeadPosition
  );

  updateChatHeadPosition();
})();

/* Web3Forms contact form */
const contactForm = document.getElementById("contactForm");
const contactStatus = document.getElementById("contactStatus");

if (contactForm && contactStatus) {
  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const submitButton = contactForm.querySelector(
      'button[type="submit"]'
    );

    const formData = new FormData(contactForm);
    const payload = Object.fromEntries(formData.entries());

    contactStatus.classList.remove("is-error");
    contactStatus.textContent = "";

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.dataset.originalText = submitButton.textContent;
      submitButton.textContent = "Sending...";
    }

    try {
      const response = await fetch(
        "https://api.web3forms.com/submit",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json"
          },
          body: JSON.stringify(payload)
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Unable to send message."
        );
      }

      contactStatus.textContent = "";
      contactForm.reset();
      openContactModal();
    }
    catch (error) {
      console.error("Contact form error:", error);

      contactStatus.classList.add("is-error");
      contactStatus.textContent =
        "Something went wrong. Please try again.";
    }
    finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent =
          submitButton.dataset.originalText || "Send message";
      }
    }
  });
}

/* Contact success modal controls */
const contactModal = document.getElementById("contactModal");
let contactModalPreviousFocus = null;

function openContactModal() {
  if (!contactModal) return;

  contactModalPreviousFocus = document.activeElement;

  contactModal.classList.add("is-open");
  contactModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");

  const closeButton = contactModal.querySelector(
    ".contact-modal-close"
  );

  closeButton?.focus();
}

function closeContactModal() {
  if (!contactModal) return;

  const activeElement = document.activeElement;

  if (
    activeElement &&
    contactModal.contains(activeElement) &&
    typeof activeElement.blur === "function"
  ) {
    activeElement.blur();
  }

  contactModal.classList.remove("is-open");
  contactModal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");

  if (
    contactModalPreviousFocus &&
    typeof contactModalPreviousFocus.focus === "function"
  ) {
    contactModalPreviousFocus.focus();
  }
}

document.querySelectorAll("[data-contact-close]").forEach(
  (element) => {
    element.addEventListener("click", closeContactModal);
  }
);

document.addEventListener("keydown", (event) => {
  if (
    event.key === "Escape" &&
    contactModal?.classList.contains("is-open")
  ) {
    closeContactModal();
  }
});
