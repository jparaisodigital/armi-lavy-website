(function () {
    const SHOW_AFTER = 0.5;  
    const IDLE_MS = 250;     
  
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "to-top";
    btn.setAttribute("aria-label", "Back to top");
    btn.innerHTML = `
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none"
        stroke="currentColor" stroke-width="1.8" stroke-linecap="round"
        stroke-linejoin="round" aria-hidden="true">
        <path d="M12 19V5M5 12l7-7 7 7"/>
      </svg>`;
    document.body.appendChild(btn);
  
    let timer = null;
  
    function pastHalf() {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      return max > 0 && window.scrollY > max * SHOW_AFTER;
    }
  
    function show() { btn.classList.add("is-visible"); }
    function hide() { btn.classList.remove("is-visible"); }
  
    function onScroll() {
      hide();                      
      clearTimeout(timer);
      timer = setTimeout(() => {  
        if (pastHalf()) show();
      }, IDLE_MS);
    }
  
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
  
    btn.addEventListener("click", () => {
      hide();
      window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
    });
  
    // kung nag-reload ka sa gitna ng page
    if (pastHalf()) show();
  })();