(function () {
  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function bindMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var panel = document.querySelector('[data-nav-panel]');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function () {
      panel.classList.toggle('open');
    });
  }

  function bindSiteSearch() {
    document.querySelectorAll('[data-site-search]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var input = form.querySelector('input[name="q"]');
        var query = input ? input.value.trim() : '';
        if (query) {
          window.location.href = './search.html?q=' + encodeURIComponent(query);
        }
      });
    });
  }

  function bindHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }

    function start() {
      if (slides.length < 2) {
        return;
      }
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        stop();
        start();
      });
    });
    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function bindCardFilter() {
    var wrap = document.querySelector('[data-card-filter]');
    var grid = document.querySelector('[data-card-grid]');
    if (!wrap || !grid) {
      return;
    }
    var searchInput = wrap.querySelector('[data-card-search]');
    var sortSelect = wrap.querySelector('[data-card-sort]');
    var typeButtons = Array.prototype.slice.call(wrap.querySelectorAll('[data-type]'));
    var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));
    var currentType = '全部';

    function textOf(card) {
      return normalize([
        card.dataset.title,
        card.dataset.year,
        card.dataset.region,
        card.dataset.type,
        card.dataset.genre,
        card.textContent
      ].join(' '));
    }

    function apply() {
      var query = normalize(searchInput ? searchInput.value : '');
      cards.forEach(function (card) {
        var matchText = !query || textOf(card).indexOf(query) !== -1;
        var type = card.dataset.type || '';
        var matchType = currentType === '全部' || type.indexOf(currentType) !== -1;
        card.classList.toggle('is-hidden', !(matchText && matchType));
      });
      sortCards();
    }

    function sortCards() {
      var mode = sortSelect ? sortSelect.value : 'default';
      var sorted = cards.slice();
      if (mode === 'rating') {
        sorted.sort(function (a, b) {
          return Number(b.dataset.rating || 0) - Number(a.dataset.rating || 0);
        });
      } else if (mode === 'views') {
        sorted.sort(function (a, b) {
          return Number(b.dataset.views || 0) - Number(a.dataset.views || 0);
        });
      } else if (mode === 'year') {
        sorted.sort(function (a, b) {
          return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
        });
      } else {
        sorted.sort(function (a, b) {
          return cards.indexOf(a) - cards.indexOf(b);
        });
      }
      sorted.forEach(function (card) {
        grid.appendChild(card);
      });
    }

    if (searchInput) {
      searchInput.addEventListener('input', apply);
    }
    if (sortSelect) {
      sortSelect.addEventListener('change', apply);
    }
    typeButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        currentType = button.dataset.type || '全部';
        typeButtons.forEach(function (item) {
          item.classList.toggle('active', item === button);
        });
        apply();
      });
    });
  }

  function cardTemplate(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span class="tag">' + escapeHtml(tag) + '</span>';
    }).join('');
    return [
      '<article class="movie-card">',
      '<a class="poster-link" href="./' + movie.file + '" aria-label="观看' + escapeHtml(movie.title) + '">',
      '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '<span class="poster-shade"></span>',
      '<span class="score-badge">' + escapeHtml(movie.rating) + '</span>',
      '<span class="play-badge">播放</span>',
      '</a>',
      '<div class="movie-info">',
      '<div class="movie-kicker">' + escapeHtml(movie.category) + ' · ' + escapeHtml(movie.year) + '</div>',
      '<h3><a href="./' + movie.file + '">' + escapeHtml(movie.title) + '</a></h3>',
      '<p>' + escapeHtml(movie.oneLine) + '</p>',
      '<div class="movie-meta"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></div>',
      '<div class="tag-row">' + tags + '</div>',
      '</div>',
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

  function bindSearchPage() {
    var form = document.querySelector('[data-search-page-form]');
    var results = document.querySelector('[data-search-results]');
    var summary = document.querySelector('[data-search-summary]');
    if (!form || !results || !summary || !window.SEARCH_MOVIES) {
      return;
    }
    var input = form.querySelector('input[name="q"]');
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    if (input) {
      input.value = initial;
    }

    function render(query) {
      var key = normalize(query);
      if (!key) {
        summary.textContent = '输入关键词，快速找到感兴趣的剧集。';
        results.innerHTML = '';
        return;
      }
      var items = window.SEARCH_MOVIES.filter(function (movie) {
        return normalize([
          movie.title,
          movie.oneLine,
          movie.region,
          movie.type,
          movie.genre,
          (movie.tags || []).join(' ')
        ].join(' ')).indexOf(key) !== -1;
      }).slice(0, 80);
      summary.textContent = '搜索“' + query + '”的相关结果';
      results.innerHTML = items.map(cardTemplate).join('') || '<div class="content-card"><p>没有找到相关内容。</p></div>';
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var query = input ? input.value.trim() : '';
      render(query);
      if (query) {
        history.replaceState(null, '', './search.html?q=' + encodeURIComponent(query));
      }
    });
    render(initial);
  }

  ready(function () {
    bindMenu();
    bindSiteSearch();
    bindHero();
    bindCardFilter();
    bindSearchPage();
  });
}());
