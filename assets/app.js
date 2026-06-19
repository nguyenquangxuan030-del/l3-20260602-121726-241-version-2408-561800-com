(function () {
  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function setupMobileMenu() {
    var button = document.querySelector('[data-menu-button]');
    var nav = document.querySelector('[data-main-nav]');

    if (!button || !nav) {
      return;
    }

    button.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function setupHeroSlider() {
    var slider = document.querySelector('[data-hero-slider]');

    if (!slider) {
      return;
    }

    var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
    var activeIndex = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      activeIndex = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === activeIndex);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === activeIndex);
      });
    }

    function startTimer() {
      timer = window.setInterval(function () {
        showSlide(activeIndex + 1);
      }, 5200);
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        window.clearInterval(timer);
        showSlide(dotIndex);
        startTimer();
      });
    });

    startTimer();
  }

  function setupFilters() {
    var grids = Array.prototype.slice.call(document.querySelectorAll('[data-filter-grid]'));

    grids.forEach(function (grid) {
      var section = grid.closest('.content-section') || document;
      var input = section.querySelector('[data-filter-input]');
      var year = section.querySelector('[data-filter-year]');
      var type = section.querySelector('[data-filter-type]');
      var count = section.querySelector('[data-filter-count]');
      var items = Array.prototype.slice.call(grid.querySelectorAll('.movie-card, tbody tr'));

      if (!items.length) {
        return;
      }

      function applyFilter() {
        var keyword = normalize(input && input.value);
        var selectedYear = normalize(year && year.value);
        var selectedType = normalize(type && type.value);
        var visible = 0;

        items.forEach(function (item) {
          var haystack = normalize([
            item.getAttribute('data-title'),
            item.getAttribute('data-year'),
            item.getAttribute('data-type'),
            item.getAttribute('data-region'),
            item.getAttribute('data-genre')
          ].join(' '));
          var yearValue = normalize(item.getAttribute('data-year'));
          var typeValue = normalize(item.getAttribute('data-type'));
          var matched = true;

          if (keyword && haystack.indexOf(keyword) === -1) {
            matched = false;
          }

          if (selectedYear && yearValue !== selectedYear) {
            matched = false;
          }

          if (selectedType && typeValue !== selectedType) {
            matched = false;
          }

          item.classList.toggle('is-hidden', !matched);

          if (matched) {
            visible += 1;
          }
        });

        if (count) {
          count.textContent = '显示 ' + visible + ' / ' + items.length;
        }
      }

      [input, year, type].forEach(function (control) {
        if (control) {
          control.addEventListener('input', applyFilter);
          control.addEventListener('change', applyFilter);
        }
      });

      applyFilter();
    });
  }

  function cardTemplate(movie) {
    var tags = movie.tags.slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');

    return [
      '<article class="movie-card" data-title="' + escapeHtml(movie.title) + '" data-year="' + escapeHtml(movie.year) + '" data-type="' + escapeHtml(movie.type) + '" data-region="' + escapeHtml(movie.region) + '" data-genre="' + escapeHtml(movie.genre) + '">',
      '  <a class="movie-card-cover" href="' + escapeHtml(movie.url) + '" aria-label="查看 ' + escapeHtml(movie.title) + '">',
      '    <div class="poster poster-card">',
      '      <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy" onerror="this.closest(\'.poster\').classList.add(\'is-missing\'); this.remove();">',
      '      <div class="poster-fallback">',
      '        <span>' + escapeHtml(movie.year) + '</span>',
      '        <strong>' + escapeHtml(movie.title) + '</strong>',
      '      </div>',
      '    </div>',
      '    <span class="play-chip">播放</span>',
      '  </a>',
      '  <div class="movie-card-body">',
      '    <div class="movie-card-meta">',
      '      <span>' + escapeHtml(movie.year) + '</span>',
      '      <span>' + escapeHtml(movie.region) + '</span>',
      '      <span>' + escapeHtml(movie.type) + '</span>',
      '    </div>',
      '    <h3><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>',
      '    <p>' + escapeHtml(movie.oneLine) + '</p>',
      '    <div class="tag-row">' + tags + '</div>',
      '  </div>',
      '</article>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function setupSearchPage() {
    var input = document.querySelector('[data-search-page-input]');
    var button = document.querySelector('[data-search-page-button]');
    var results = document.querySelector('[data-search-page-results]');
    var info = document.querySelector('[data-search-page-info]');

    if (!input || !results || !window.MOVIE_INDEX) {
      return;
    }

    function search() {
      var keyword = normalize(input.value);
      var pool = window.MOVIE_INDEX;
      var matched = keyword
        ? pool.filter(function (movie) {
            var haystack = normalize([
              movie.title,
              movie.year,
              movie.region,
              movie.type,
              movie.genre,
              movie.tags.join(' '),
              movie.oneLine
            ].join(' '));
            return haystack.indexOf(keyword) !== -1;
          })
        : pool.slice(0, 30);

      var limited = matched.slice(0, 120);
      results.innerHTML = limited.map(cardTemplate).join('');

      if (info) {
        info.textContent = keyword
          ? '找到 ' + matched.length + ' 条结果，当前显示前 ' + limited.length + ' 条。'
          : '先展示热门内容，可输入关键词筛选。';
      }
    }

    input.addEventListener('input', search);

    if (button) {
      button.addEventListener('click', search);
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMobileMenu();
    setupHeroSlider();
    setupFilters();
    setupSearchPage();
  });
})();
