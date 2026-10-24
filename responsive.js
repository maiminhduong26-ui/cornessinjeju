(() => {
  function initResponsiveNav() {
    const menu = document.getElementById("corness-mobile-menu");
    const toggle = document.querySelector(".corness-mobile-toggle");
    if (!menu || !toggle) return;

    const closeButtons = menu.querySelectorAll("[data-mobile-close]");
    const links = menu.querySelectorAll("a[href]");
    const current = (
      location.pathname.split("/").pop() || "index.html"
    ).toLowerCase();

    document
      .querySelectorAll("header nav a[href], .corness-mobile-nav a[href]")
      .forEach((a) => {
        const href = (a.getAttribute("href") || "").split("#")[0].toLowerCase();
        if (href === current) a.setAttribute("aria-current", "page");
      });

    const setOpen = (open) => {
      menu.dataset.open = String(open);
      menu.setAttribute("aria-hidden", String(!open));
      toggle.setAttribute("aria-expanded", String(open));
      document.body.classList.toggle("corness-menu-open", open);
      const icon = toggle.querySelector(".material-symbols-outlined");
      if (icon) icon.textContent = open ? "close" : "menu";
      if (open) {
        const first = menu.querySelector(".corness-mobile-nav a");
        window.setTimeout(() => first?.focus({ preventScroll: true }), 120);
      } else {
        toggle.focus({ preventScroll: true });
      }
    };

    toggle.addEventListener("click", () =>
      setOpen(menu.dataset.open !== "true"),
    );
    closeButtons.forEach((btn) =>
      btn.addEventListener("click", () => setOpen(false)),
    );
    links.forEach((link) =>
      link.addEventListener("click", () => setOpen(false)),
    );
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && menu.dataset.open === "true")
        setOpen(false);
    });
    window.addEventListener(
      "resize",
      () => {
        if (window.innerWidth >= 1536 && menu.dataset.open === "true") {
          setOpen(false);
        }
      },
      { passive: true },
    );
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initResponsiveNav);
  } else {
    initResponsiveNav();
  }
})();
