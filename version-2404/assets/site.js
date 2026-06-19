(function () {
  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $$(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return (value || '').toString().trim().toLowerCase();
  }

  function initNavigation() {
    var searchToggle = $('.search-toggle');
    var searchForm = $('.header-search');
    var menuToggle = $('.menu-toggle');
    var mobileNav = $('.mobile-nav');

    if (searchToggle && searchForm) {
      searchToggle.addEventListener('click', function () {
        searchForm.classList.toggle('is-open');
        var input = searchForm.querySelector('input');
        if (searchForm.classList.contains('is-open') && input) {
          input.focus();
        }
      });
    }

    if (menuToggle && mobileNav) {
      menuToggle.addEventListener('click', function () {
        mobileNav.classList.toggle('is-open');
      });
    }
  }

  function initHero() {
    var root = $('[data-hero-carousel]');
    if (!root) {
      return;
    }

    var slides = $$('.hero-slide', root);
    var dots = $$('.hero-dot', root);
    var current = 0;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    var prev = $('[data-hero-prev]', root);
    var next = $('[data-hero-next]', root);

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(parseInt(dot.getAttribute('data-slide-target'), 10) || 0);
      });
    });

    window.setInterval(function () {
      show(current + 1);
    }, 5000);
  }

  function initFilters() {
    var panel = $('[data-filter-panel]');
    var list = $('[data-card-list]');
    if (!panel || !list) {
      return;
    }

    var cards = $$('.movie-card', list);
    var input = $('.filter-input', panel);
    var selects = $$('.filter-select', panel);
    var empty = $('[data-empty-state]');
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';

    if (input && query) {
      input.value = query;
    }

    function apply() {
      var keyword = normalize(input ? input.value : '');
      var activeType = '';
      var activeYear = '';

      selects.forEach(function (select) {
        if (select.getAttribute('data-filter') === 'type') {
          activeType = normalize(select.value);
        }
        if (select.getAttribute('data-filter') === 'year') {
          activeYear = normalize(select.value);
        }
      });

      var visible = 0;
      cards.forEach(function (card) {
        var searchText = normalize(card.getAttribute('data-search'));
        var typeText = normalize(card.getAttribute('data-type'));
        var yearText = normalize(card.getAttribute('data-year'));
        var matchKeyword = !keyword || searchText.indexOf(keyword) !== -1;
        var matchType = !activeType || typeText.indexOf(activeType) !== -1;
        var matchYear = !activeYear || yearText.indexOf(activeYear) !== -1;
        var show = matchKeyword && matchType && matchYear;
        card.style.display = show ? '' : 'none';
        if (show) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }

    if (input) {
      input.addEventListener('input', apply);
    }

    selects.forEach(function (select) {
      select.addEventListener('change', apply);
    });

    apply();
  }

  function bindNative(video, source) {
    video.src = source;
    return video.play();
  }

  function bindHls(video, source, onReady) {
    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({ enableWorker: true });
      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        onReady();
      });
      hls.on(window.Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal) {
          hls.destroy();
          bindNative(video, source).catch(function () {});
        }
      });
      video._hlsInstance = hls;
      return;
    }

    bindNative(video, source).catch(function () {});
  }

  function initPlayers() {
    $$('.player-shell').forEach(function (shell) {
      var video = $('.movie-video', shell);
      var overlay = $('.play-overlay', shell);
      var source = shell.getAttribute('data-video-source');
      var initialized = false;

      if (!video || !source) {
        return;
      }

      function start() {
        if (overlay) {
          overlay.classList.add('is-hidden');
        }
        video.controls = true;

        if (initialized) {
          video.play().catch(function () {});
          return;
        }

        initialized = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          bindNative(video, source).catch(function () {});
        } else {
          bindHls(video, source, function () {
            video.play().catch(function () {});
          });
        }
      }

      if (overlay) {
        overlay.addEventListener('click', start);
      }

      video.addEventListener('click', function () {
        if (!initialized || video.paused) {
          start();
        } else {
          video.pause();
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initNavigation();
    initHero();
    initFilters();
    initPlayers();
  });
})();
