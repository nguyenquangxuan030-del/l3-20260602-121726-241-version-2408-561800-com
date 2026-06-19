(function () {
  var toggle = document.querySelector('[data-menu-toggle]');
  var panel = document.querySelector('[data-menu-panel]');

  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  var carousel = document.querySelector('[data-hero-carousel]');

  if (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    var showSlide = function (index) {
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
    };

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }
  }

  var filterPanel = document.querySelector('[data-filter-panel]');

  if (filterPanel) {
    var cardList = document.querySelector('[data-card-list]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
    var localSearch = filterPanel.querySelector('[data-local-search]');
    var regionFilter = filterPanel.querySelector('[data-region-filter]');
    var yearFilter = filterPanel.querySelector('[data-year-filter]');
    var sortFilter = filterPanel.querySelector('[data-sort-filter]');
    var empty = document.querySelector('[data-filter-empty]');

    var applyFilters = function () {
      var keyword = localSearch ? localSearch.value.trim().toLowerCase() : '';
      var region = regionFilter ? regionFilter.value : 'all';
      var year = yearFilter ? yearFilter.value : 'all';
      var visible = 0;

      cards.forEach(function (card) {
        var text = (card.getAttribute('data-search') || '').toLowerCase();
        var cardRegion = card.getAttribute('data-region') || '';
        var cardYear = card.getAttribute('data-year') || '';
        var matchedKeyword = !keyword || text.indexOf(keyword) !== -1;
        var matchedRegion = region === 'all' || cardRegion.indexOf(region) !== -1;
        var matchedYear = year === 'all' || cardYear === year;
        var matched = matchedKeyword && matchedRegion && matchedYear;

        card.hidden = !matched;

        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.hidden = visible !== 0;
      }
    };

    var applySort = function () {
      if (!cardList || !sortFilter) {
        return;
      }

      var mode = sortFilter.value;
      var sorted = cards.slice().sort(function (a, b) {
        if (mode === 'score') {
          return Number(b.getAttribute('data-score') || 0) - Number(a.getAttribute('data-score') || 0);
        }

        if (mode === 'title') {
          return (a.getAttribute('data-search') || '').localeCompare(b.getAttribute('data-search') || '', 'zh-Hans-CN');
        }

        return Number(b.getAttribute('data-year') || 0) - Number(a.getAttribute('data-year') || 0);
      });

      sorted.forEach(function (card) {
        cardList.appendChild(card);
      });

      applyFilters();
    };

    [localSearch, regionFilter, yearFilter].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilters);
        control.addEventListener('change', applyFilters);
      }
    });

    if (sortFilter) {
      sortFilter.addEventListener('change', applySort);
    }
  }

  var searchForm = document.querySelector('[data-search-form]');
  var searchInput = document.querySelector('[data-search-input]');
  var searchList = document.querySelector('[data-search-list]');

  if (searchForm && searchInput && searchList) {
    var searchCards = Array.prototype.slice.call(searchList.querySelectorAll('[data-movie-card]'));
    var searchEmpty = document.querySelector('[data-filter-empty]');
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';

    searchInput.value = initial;

    var runSearch = function () {
      var keyword = searchInput.value.trim().toLowerCase();
      var visible = 0;

      searchCards.forEach(function (card) {
        var text = (card.getAttribute('data-search') || '').toLowerCase();
        var matched = !keyword || text.indexOf(keyword) !== -1;
        card.hidden = !matched;

        if (matched) {
          visible += 1;
        }
      });

      if (searchEmpty) {
        searchEmpty.hidden = visible !== 0;
      }
    };

    searchInput.addEventListener('input', runSearch);
    runSearch();
  }
})();

function initMoviePlayer(streamUrl) {
  var video = document.querySelector('[data-player-video]');
  var cover = document.querySelector('[data-player-cover]');
  var button = document.querySelector('[data-player-button]');
  var hlsInstance = null;
  var loaded = false;

  if (!video || !streamUrl) {
    return;
  }

  var loadStream = function () {
    if (loaded) {
      return;
    }

    loaded = true;

    if (cover) {
      cover.classList.add('is-hidden');
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(streamUrl);
      hlsInstance.attachMedia(video);
      return;
    }

    video.src = streamUrl;
  };

  var play = function () {
    loadStream();

    var request = video.play();

    if (request && typeof request.catch === 'function') {
      request.catch(function () {});
    }
  };

  if (button) {
    button.addEventListener('click', play);
  }

  if (cover) {
    cover.addEventListener('click', play);
  }

  video.addEventListener('click', function () {
    if (!loaded || video.paused) {
      play();
    }
  });

  window.addEventListener('beforeunload', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
