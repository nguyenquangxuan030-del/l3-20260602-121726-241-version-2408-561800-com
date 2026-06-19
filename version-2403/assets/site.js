(function () {
  const root = document.body.dataset.root || "";

  function qs(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function qsa(selector, scope) {
    return Array.from((scope || document).querySelectorAll(selector));
  }

  function escapeHtml(value) {
    return String(value || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  const menuButton = qs("[data-menu-button]");
  const mobilePanel = qs("[data-mobile-panel]");

  if (menuButton && mobilePanel) {
    menuButton.addEventListener("click", function () {
      mobilePanel.classList.toggle("open");
    });
  }

  qsa("[data-global-search-form]").forEach(function (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      const input = form.querySelector('input[name="q"]');
      const keyword = input ? input.value.trim() : "";
      if (keyword) {
        window.location.href = root + "search.html?q=" + encodeURIComponent(keyword);
      }
    });
  });

  const heroSlides = qsa("[data-hero-slide]");
  const heroMiniLinks = qsa("[data-hero-target]");
  let activeHero = 0;

  function showHeroSlide(index) {
    if (!heroSlides.length) {
      return;
    }
    activeHero = (index + heroSlides.length) % heroSlides.length;
    heroSlides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("active", slideIndex === activeHero);
    });
    heroMiniLinks.forEach(function (link, linkIndex) {
      link.classList.toggle("active", linkIndex === activeHero);
    });
  }

  if (heroSlides.length) {
    showHeroSlide(0);
    heroMiniLinks.forEach(function (link, index) {
      link.addEventListener("mouseenter", function () {
        showHeroSlide(index);
      });
      link.addEventListener("focus", function () {
        showHeroSlide(index);
      });
    });
    window.setInterval(function () {
      showHeroSlide(activeHero + 1);
    }, 5200);
  }

  qsa("[data-page-filter]").forEach(function (input) {
    const section = input.closest("main") || document;
    const cards = qsa("[data-movie-card]", section);
    const count = qs("[data-filter-count]", section);

    function updateFilter() {
      const keyword = input.value.trim().toLowerCase();
      let visibleCount = 0;
      cards.forEach(function (card) {
        const haystack = [
          card.dataset.title,
          card.dataset.year,
          card.dataset.region,
          card.dataset.type,
          card.dataset.genre
        ].join(" ").toLowerCase();
        const visible = !keyword || haystack.includes(keyword);
        card.hidden = !visible;
        if (visible) {
          visibleCount += 1;
        }
      });
      if (count) {
        count.textContent = visibleCount + " 部";
      }
    }

    input.addEventListener("input", updateFilter);
    updateFilter();
  });

  qsa("[data-sort-button]").forEach(function (button) {
    button.addEventListener("click", function () {
      const sortKey = button.dataset.sortButton;
      const main = button.closest("main") || document;
      const grid = qs("[data-card-grid]", main);
      if (!grid) {
        return;
      }
      qsa("[data-sort-button]", main).forEach(function (item) {
        item.classList.toggle("active", item === button);
      });
      const cards = qsa("[data-movie-card]", grid);
      cards.sort(function (a, b) {
        if (sortKey === "views") {
          return Number(b.dataset.views || 0) - Number(a.dataset.views || 0);
        }
        if (sortKey === "rating") {
          return Number(b.dataset.rating || 0) - Number(a.dataset.rating || 0);
        }
        return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
      });
      cards.forEach(function (card) {
        grid.appendChild(card);
      });
    });
  });

  const searchInput = qs("[data-search-input]");
  const searchResultGrid = qs("[data-search-results]");
  const searchCount = qs("[data-search-count]");

  function renderSearchResults(keyword) {
    if (!searchResultGrid || !window.SEARCH_MOVIES) {
      return;
    }
    const query = (keyword || "").trim().toLowerCase();
    const source = window.SEARCH_MOVIES;
    const matches = query
      ? source.filter(function (movie) {
          return [
            movie.title,
            movie.region,
            movie.type,
            movie.year,
            movie.genre,
            movie.tags
          ].join(" ").toLowerCase().includes(query);
        })
      : source.slice(0, 60);

    const limited = matches.slice(0, 120);
    if (searchCount) {
      searchCount.textContent = matches.length + " 个结果";
    }

    if (!limited.length) {
      searchResultGrid.innerHTML = '<div class="search-results-empty glass-effect">没有找到相关影片，请换一个关键词再试。</div>';
      return;
    }

    searchResultGrid.innerHTML = limited.map(function (movie) {
      const title = escapeHtml(movie.title);
      const tags = String(movie.tags || "")
        .split(",")
        .filter(Boolean)
        .slice(0, 3)
        .map(function (tag) {
          return "<span>" + escapeHtml(tag) + "</span>";
        })
        .join("");

      return [
        '<article class="movie-card" data-movie-card>',
        '  <a class="poster-link" href="movies/' + escapeHtml(movie.file) + '" aria-label="查看《' + title + '》详情">',
        '    <img src="' + escapeHtml(movie.cover) + '" alt="' + title + '封面" loading="lazy">',
        '    <span class="duration-badge">' + escapeHtml(movie.duration) + '</span>',
        '    <span class="rating-badge">★ ' + escapeHtml(movie.rating) + '</span>',
        '  </a>',
        '  <div class="movie-card-body">',
        '    <a class="movie-title" href="movies/' + escapeHtml(movie.file) + '">' + title + '</a>',
        '    <p class="movie-desc">' + escapeHtml(movie.one_line) + '</p>',
        '    <div class="movie-meta">',
        '      <span>' + escapeHtml(movie.year) + '</span>',
        '      <span>' + escapeHtml(movie.region) + '</span>',
        '      <span>' + escapeHtml(movie.type) + '</span>',
        '    </div>',
        '    <div class="movie-tags">' + tags + '</div>',
        '  </div>',
        '</article>'
      ].join("");
    }).join("");
  }

  if (searchInput && searchResultGrid) {
    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get("q") || "";
    searchInput.value = initialQuery;
    renderSearchResults(initialQuery);
    searchInput.addEventListener("input", function () {
      renderSearchResults(searchInput.value);
    });
  }
})();
