(function () {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function initMenu() {
    const toggle = $("[data-menu-toggle]");
    const panel = $("[data-mobile-panel]");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      panel.classList.toggle("open");
    });
  }

  function getCards() {
    return $$("[data-search-text]").filter(function (card) {
      return card.classList.contains("movie-card") || card.classList.contains("rank-list-item") || card.classList.contains("mini-movie");
    });
  }

  function setSearchStatus(text) {
    const status = $("[data-search-status]");
    if (status) {
      status.textContent = text;
    }
  }

  function filterCards(query) {
    const cards = getCards();
    if (!cards.length) {
      return false;
    }
    const term = normalize(query);
    let visible = 0;
    cards.forEach(function (card) {
      const matched = !term || normalize(card.getAttribute("data-search-text")).includes(term);
      card.classList.toggle("hidden-card", !matched);
      if (matched && card.classList.contains("movie-card")) {
        visible += 1;
      }
    });
    if (term) {
      setSearchStatus("匹配结果：" + visible + " 部影片");
    } else {
      setSearchStatus("");
    }
    return true;
  }

  function initSearch() {
    const params = new URLSearchParams(window.location.search);
    const q = params.get("q") || "";
    const cards = getCards();
    if (q && cards.length) {
      $$('[data-search-form] input[name="q"]').forEach(function (input) {
        input.value = q;
      });
      filterCards(q);
    }
    $$('[data-search-form]').forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        const input = $('input[name="q"]', form);
        const value = input ? input.value.trim() : "";
        if (cards.length && document.body.getAttribute("data-searchable") === "true") {
          filterCards(value);
        } else if (value) {
          window.location.href = "./search.html?q=" + encodeURIComponent(value);
        } else {
          window.location.href = "./search.html";
        }
      });
    });
  }

  function initFilters() {
    const chips = $$('[data-filter]');
    if (!chips.length) {
      return;
    }
    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        chips.forEach(function (item) {
          item.classList.remove("active");
        });
        chip.classList.add("active");
        const value = chip.getAttribute("data-filter");
        let visible = 0;
        $$(".movie-card").forEach(function (card) {
          const group = card.getAttribute("data-group") || "";
          const text = card.getAttribute("data-search-text") || "";
          const matched = value === "all" || group === value || text.indexOf(value) !== -1;
          card.classList.toggle("hidden-card", !matched);
          if (matched) {
            visible += 1;
          }
        });
        if (value === "all") {
          setSearchStatus("");
        } else {
          setSearchStatus("当前筛选：" + value + " · " + visible + " 部影片");
        }
      });
    });
  }

  function initHero() {
    const hero = $("[data-hero]");
    if (!hero) {
      return;
    }
    const slides = $$("[data-hero-slide]", hero);
    const dots = $$("[data-hero-dot]", hero);
    if (slides.length < 2) {
      return;
    }
    let index = 0;
    let timer = null;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, idx) {
        slide.classList.toggle("active", idx === index);
      });
      dots.forEach(function (dot, idx) {
        dot.classList.toggle("active", idx === index);
      });
    }
    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }
    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }
    dots.forEach(function (dot, idx) {
      dot.addEventListener("click", function () {
        show(idx);
        start();
      });
    });
    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function initPlayer(streamUrl) {
    const player = $("[data-player]");
    if (!player || !streamUrl) {
      return;
    }
    const video = $("video", player);
    const cover = $("[data-player-cover]", player);
    const button = $("[data-play-button]", player);
    let loaded = false;
    let hlsInstance = null;

    function attach() {
      if (loaded || !video) {
        return;
      }
      loaded = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
    }

    function play() {
      attach();
      if (cover) {
        cover.classList.add("is-hidden");
      }
      video.controls = true;
      const action = video.play();
      if (action && typeof action.catch === "function") {
        action.catch(function () {});
      }
    }

    if (button) {
      button.addEventListener("click", play);
    }
    if (cover) {
      cover.addEventListener("click", play);
    }
    if (video) {
      video.addEventListener("click", function () {
        if (video.paused) {
          play();
        }
      });
    }
    window.addEventListener("pagehide", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  window.initMoviePlayer = initPlayer;

  document.addEventListener("DOMContentLoaded", function () {
    initMenu();
    initHero();
    initSearch();
    initFilters();
  });
})();
