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
      excerpt: "“Hear how Xuan Phu's corn harvest is transformed into handmade memories, one creation at a time.”",
      transcript: `Welcome to CORNESS, a place where the harvest becomes a story. In Xuan Phu, Dong Nai, every corn harvest leaves behind a material that is often overlooked: the corn cob. What seems like the end of its journey can become the beginning of something beautiful.

In the workshop, local artisans collect, clean, dry, and carefully process these natural fibers. Under skilled hands, they are transformed into a small, lasting keepsake. A coaster may look simple, but its texture holds the warmth of the fields, the patience of the makers, and the memory of a place.

Today, Minh's handmade coaster carries a pattern inspired by Vietnamese heritage. Each line recalls the colors of traditional craft, while the engraved identity connects the piece to Xuan Phu and its creator. Its value is not only in what you can see, but also in the time and care behind it.

Thank you for being part of this story. By choosing to give agricultural materials a second life, we celebrate local creativity and a more thoughtful way to make and enjoy beautiful objects. Take this memory home, and let it accompany your next quiet cup of tea.`
    },
    vi: {
      src: "audio/cora-story-vi.mp3", name: "Vietnamese",
      excerpt: "“Listen to the story of Xuan Phu's corn harvest and the heritage memories created by local artisans.”",
      transcript: `Chào mừng bạn đến với CORNESS, nơi mùa thu hoạch trở thành một câu chuyện. Tại Xuân Phú, Đồng Nai, sau mỗi vụ ngô, người nông dân còn lại những chiếc lõi thường bị xem là phế phẩm. Nhưng điều tưởng như đã kết thúc lại có thể mở ra một hành trình mới.

Trong xưởng thủ công, những người thợ địa phương thu gom, làm sạch, phơi khô và xử lý xơ lõi ngô một cách cẩn thận. Qua đôi bàn tay khéo léo, vật liệu mộc mạc ấy trở thành một món quà lưu niệm bền đẹp. Chiếc đế lót ly tuy nhỏ, nhưng lưu giữ hơi ấm đồng ruộng, sự kiên nhẫn của người thợ và ký ức về quê hương.

Hôm nay, chiếc lót ly do Minh tự tay làm mang hoa văn lấy cảm hứng từ di sản Việt Nam. Mỗi đường nét gợi lại màu sắc của nghề thủ công truyền thống. Dấu khắc trên sản phẩm còn kể về vùng đất Xuân Phú và người tạo ra nó. Giá trị của món đồ không chỉ nằm ở vẻ ngoài, mà còn ở thời gian và sự chăm chút phía sau.

Cảm ơn bạn đã cùng CORNESS viết tiếp câu chuyện này. Khi trao cho phế phẩm nông nghiệp một cuộc đời mới, chúng ta đang trân trọng sức sáng tạo bản địa và lựa chọn cách tiêu dùng có trách nhiệm hơn. Hãy mang ký ức ấy về nhà, để nó đồng hành cùng những phút giây bình yên bên tách trà của bạn.`
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
