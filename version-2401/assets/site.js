(function () {
  const menuButton = document.querySelector('[data-menu-button]');
  const mainNav = document.querySelector('[data-main-nav]');

  if (menuButton && mainNav) {
    menuButton.addEventListener('click', function () {
      mainNav.classList.toggle('open');
    });
  }

  const slides = Array.from(document.querySelectorAll('[data-hero-slide]'));
  const dots = Array.from(document.querySelectorAll('[data-hero-dot]'));
  let activeSlide = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    activeSlide = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === activeSlide);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('active', dotIndex === activeSlide);
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      showSlide(index);
    });
  });

  if (slides.length > 1) {
    window.setInterval(function () {
      showSlide(activeSlide + 1);
    }, 6200);
  }

  const filterRoot = document.querySelector('[data-filter-root]');

  if (filterRoot) {
    const cards = Array.from(filterRoot.querySelectorAll('[data-title]'));
    const queryInput = document.querySelector('[data-filter-query]');
    const yearSelect = document.querySelector('[data-filter-year]');
    const typeSelect = document.querySelector('[data-filter-type]');
    const regionSelect = document.querySelector('[data-filter-region]');
    const resetButton = document.querySelector('[data-filter-reset]');
    const noResults = document.querySelector('[data-no-results]');
    const urlParams = new URLSearchParams(window.location.search);
    const initialQuery = urlParams.get('q') || '';

    if (queryInput && initialQuery) {
      queryInput.value = initialQuery;
    }

    function matches(card) {
      const query = queryInput ? queryInput.value.trim().toLowerCase() : '';
      const year = yearSelect ? yearSelect.value : '';
      const type = typeSelect ? typeSelect.value : '';
      const region = regionSelect ? regionSelect.value : '';
      const text = [
        card.dataset.title,
        card.dataset.region,
        card.dataset.type,
        card.dataset.year,
        card.dataset.genre
      ].join(' ').toLowerCase();

      return (!query || text.includes(query)) &&
        (!year || card.dataset.year === year) &&
        (!type || card.dataset.type === type) &&
        (!region || card.dataset.region === region);
    }

    function applyFilters() {
      let visibleCount = 0;

      cards.forEach(function (card) {
        const visible = matches(card);
        card.style.display = visible ? '' : 'none';
        if (visible) {
          visibleCount += 1;
        }
      });

      if (noResults) {
        noResults.style.display = visibleCount === 0 ? 'block' : 'none';
      }
    }

    [queryInput, yearSelect, typeSelect, regionSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilters);
        control.addEventListener('change', applyFilters);
      }
    });

    if (resetButton) {
      resetButton.addEventListener('click', function () {
        if (queryInput) {
          queryInput.value = '';
        }
        if (yearSelect) {
          yearSelect.value = '';
        }
        if (typeSelect) {
          typeSelect.value = '';
        }
        if (regionSelect) {
          regionSelect.value = '';
        }
        applyFilters();
      });
    }

    applyFilters();
  }

  const player = document.querySelector('[data-player]');

  if (player) {
    const video = player.querySelector('video');
    const overlay = player.querySelector('[data-player-overlay]');
    const button = player.querySelector('[data-player-button]');
    const status = player.querySelector('[data-player-status]');
    const streamUrl = player.getAttribute('data-stream-url');
    let loaded = false;

    function setStatus(text) {
      if (status) {
        status.textContent = text;
      }
    }

    function startPlayback() {
      if (!video || !streamUrl) {
        setStatus('播放内容暂不可用');
        return;
      }

      if (!loaded) {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = streamUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
          const hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(streamUrl);
          hls.attachMedia(video);
        } else {
          setStatus('当前设备暂不支持此播放方式');
          return;
        }
        loaded = true;
      }

      if (overlay) {
        overlay.classList.add('hidden');
      }

      const promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          setStatus('请再次点击播放按钮');
          if (overlay) {
            overlay.classList.remove('hidden');
          }
        });
      }
    }

    if (button) {
      button.addEventListener('click', startPlayback);
    }

    if (overlay) {
      overlay.addEventListener('click', function (event) {
        if (event.target === overlay) {
          startPlayback();
        }
      });
    }
  }
})();
