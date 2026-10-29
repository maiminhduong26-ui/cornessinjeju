(() => {
  "use strict";
  const media = document.getElementById("cora-audio-media");
  if (!media) return;
  const root = document.getElementById("cora-audio-tour");
  const time = document.getElementById("cora-audio-time");
  const seek = document.getElementById("cora-audio-seek");
  const toggle = document.getElementById("cora-audio-toggle");
  const icon = document.getElementById("cora-audio-icon");
  const status = document.getElementById("cora-audio-status");
  const excerpt = document.getElementById("cora-audio-excerpt");
  const transcript = document.getElementById("cora-audio-transcript");
  const download = document.getElementById("cora-audio-download");
  const languageButtons = [...root.querySelectorAll("[data-cora-lang]")];

  // Tracks are locally bundled MP3 files: no API key, sign-in or network needed.
  const tracks = {
    en: {
      src: "audio/cora-story-en.mp3", name: "English",
      excerpt: "“Hear how Jeju's corn harvest is transformed into handmade memories, one creation at a time.”",
      transcript: `Welcome to CORNESS, a place where the harvest becomes a story. In Jeju Island, South Korea, every corn harvest leaves behind a material that is often overlooked: the corn cob. What seems like the end of its journey can become the beginning of something beautiful.

In the workshop, local artisans collect, clean, dry, and carefully process these natural fibers. Under skilled hands, they are transformed into a small, lasting keepsake. A coaster may look simple, but its texture holds the warmth of the fields, the patience of the makers, and the memory of a place.

Today, Minh's handmade coaster carries a pattern inspired by Jeju agricultural identity. Each line recalls the colors of traditional craft, while the engraved identity connects the piece to Jeju and its creator. Its value is not only in what you can see, but also in the time and care behind it.

Thank you for being part of this story. By choosing to give agricultural materials a second life, we celebrate local creativity and a more thoughtful way to make and enjoy beautiful objects. Take this memory home, and let it accompany your next quiet cup of tea.`
    },
    vi: {
      src: "audio/cora-story-vi.mp3", name: "Jeju-inspired",
      excerpt: "“Listen to the story of Jeju's corn harvest and the heritage memories created by local artisans.”",
      transcript: `Chào mừng bạn đến với ý tưởng trải nghiệm nông nghiệp CORNESS tại Jeju. Dự án đang tìm hiểu khả năng sử dụng lõi ngô và phụ phẩm chế biến quýt để tạo vật liệu lót ly. Nguồn cung, cách xử lý, công thức và độ an toàn cần được xác minh với nông hộ và cơ sở chế biến địa phương. Mẫu thử cần được kiểm tra về độ bền, khả năng chịu nước và nhiệt trước khi tổ chức hoạt động cho khách. Trải nghiệm dự kiến sẽ kết nối câu chuyện nông nghiệp Jeju, hoạt động làm sản phẩm với vật liệu đã chuẩn bị và QR Product Passport. CORA có thể hỗ trợ giải đáp thông tin và hướng dẫn khách; AI không thay thế quy trình tái chế vật lý. Kết quả thử nghiệm sẽ được báo cáo riêng với các mục tiêu và giả định.`
    }
  };
  let selectedLang = "en";
  let errorPresent = false;
  const formatTime = (seconds) => {
    if (!Number.isFinite(seconds) || seconds < 0) return "--:--";
    const totalSeconds = Math.floor(seconds);
    const minutes = Math.floor(totalSeconds / 60);
    const secs = String(totalSeconds % 60).padStart(2, "0");
    return `${String(minutes).padStart(2, "0")}:${secs}`;
  };
  const hasDuration = () => Number.isFinite(media.duration) && media.duration > 0;
  const setStatus = (label) => { status.textContent = label; };
  const refresh = () => {
    time.textContent = `${formatTime(media.currentTime || 0)} / ${hasDuration() ? formatTime(media.duration) : "--:--"}`;
    const fraction = hasDuration() ? Math.max(0, Math.min(1, media.currentTime / media.duration)) : 0;
    const value = Math.round(fraction * 1000);
    seek.value = String(value);
    seek.style.setProperty("--cora-progress", `${fraction * 100}%`);
    const playing = !media.paused && !media.ended;
    icon.textContent = playing ? "pause" : "play_arrow";
    toggle.setAttribute("aria-label", playing ? "Pause audio" : "Play audio");
    toggle.title = playing ? "Pause audio" : "Play audio";
  };
  const play = () => {
    const trackAtStart = selectedLang;
    const result = media.play();
    if (result && typeof result.catch === "function") {
      result.catch((err) => {
        // Switching tracks interrupts an in-flight play() Promise by design.
        if (err?.name === "AbortError" || trackAtStart !== selectedLang) return;
        setStatus("Unable to play. Check your browser's audio settings or the MP3 files.");
      });
    }
  };
  toggle.addEventListener("click", () => {
    if (media.paused || media.ended) play();
    else media.pause();
  });
  document.getElementById("cora-audio-back").addEventListener("click", () => {
    if (hasDuration()) media.currentTime = Math.max(0, media.currentTime - 10);
    refresh();
  });
  document.getElementById("cora-audio-forward").addEventListener("click", () => {
    if (hasDuration()) media.currentTime = Math.min(media.duration, media.currentTime + 10);
    refresh();
  });
  seek.addEventListener("input", () => {
    if (hasDuration()) media.currentTime = (Number(seek.value) / 1000) * media.duration;
    refresh();
  });
  function chooseLanguage(lang) {
    if (!tracks[lang] || lang === selectedLang) return;

    // A language change always stops playback and restarts at the beginning.
    // Never preserve the old position or automatically play the new track.
    media.pause();
    media.currentTime = 0;
    selectedLang = lang;
    errorPresent = false;
    media.src = tracks[lang].src;
    media.load();

    excerpt.textContent = tracks[lang].excerpt;
    transcript.textContent = tracks[lang].transcript;
    transcript.setAttribute("lang", lang);
    download.href = tracks[lang].src;
    download.download = tracks[lang].src.split("/").pop();
    languageButtons.forEach(button => {
      const selected = button.dataset.coraLang === lang;
      button.classList.toggle("is-selected", selected);
      button.setAttribute("aria-pressed", String(selected));
    });
    setStatus(`Loading ${tracks[lang].name} narration… Press Play to listen.`);
    refresh();
  }
  languageButtons.forEach(button => button.addEventListener("click", () => chooseLanguage(button.dataset.coraLang)));
  media.addEventListener("loadedmetadata", () => {
    errorPresent = false;
    setStatus(`${tracks[selectedLang].name} narration ready · Press Play to listen`);
    refresh();
  });
  media.addEventListener("timeupdate", refresh);
  media.addEventListener("durationchange", refresh);
  media.addEventListener("play", () => { setStatus(`Playing · ${tracks[selectedLang].name} narration`); refresh(); });
  media.addEventListener("pause", () => { if (!media.ended && !errorPresent) setStatus(`Paused · ${tracks[selectedLang].name} narration`); refresh(); });
  media.addEventListener("ended", () => { setStatus(`${tracks[selectedLang].name} narration finished`); refresh(); });
  media.addEventListener("error", () => {
    errorPresent = true;
    setStatus(`Audio unavailable. Keep the “audio” folder next to my-product.html.`);
    refresh();
  });
  // The initial transcript must match the entire spoken English recording.
  transcript.textContent = tracks.en.transcript;
  window.CornessCoraAudio = { play, chooseLanguage };
  refresh();
})();
