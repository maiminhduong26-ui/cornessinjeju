(() => {
  document.documentElement.lang = "en";
  window.CORNESS_LANGUAGE = "en";
  window.dispatchEvent(new CustomEvent("corness:languagechange", {detail: {lang: "en"}}));
})();
