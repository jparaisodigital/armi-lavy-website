(function () {
  "use strict";

  const reduce = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  const footer = document.querySelector(".site-footer");

  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "to-top";
  btn.setAttribute("aria-label", "Back to top");

  btn.innerHTML = `
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none"
      stroke="currentColor" stroke-width="1.8"
      stroke-linecap="round" stroke-linejoin="round"
      aria-hidden="true">
      <path d="M12 19V5M5 12l7-7 7 7"/>
    </svg>`;

  document.body.appendChild(btn);

  function footerIsVisible() {
    if (!footer) return false;

    const rect = footer.getBoundingClientRect();

    return (
      rect.top < window.innerHeight &&
      rect.bottom > 0
    );
  }

  function update() {
    btn.classList.toggle(
      "is-visible",
      footerIsVisible()
    );
  }

  window.addEventListener("scroll", update, {
    passive: true
  });

  window.addEventListener("resize", update);

  btn.addEventListener("click", () => {
    btn.classList.remove("is-visible");

    window.scrollTo({
      top: 0,
      behavior: reduce ? "auto" : "smooth"
    });
  });

  update();
})();
