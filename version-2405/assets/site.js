(function () {
  const menuButton = document.querySelector('[data-menu-toggle]');
  const mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  const hero = document.querySelector('[data-hero]');
  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    let active = 0;

    const showSlide = function (index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === active);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === active);
      });
    };

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.dataset.heroDot));
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(active + 1);
      }, 5200);
    }
  }

  const panels = document.querySelectorAll('[data-filter-panel]');
  panels.forEach(function (panel) {
    const section = panel.closest('section') || document;
    const input = panel.querySelector('[data-search-input]');
    const year = panel.querySelector('[data-filter-year]');
    const region = panel.querySelector('[data-filter-region]');
    const type = panel.querySelector('[data-filter-type]');
    const cards = Array.from(section.querySelectorAll('.movie-card'));

    const normalize = function (value) {
      return (value || '').toString().trim().toLowerCase();
    };

    const apply = function () {
      const keyword = normalize(input && input.value);
      const yearValue = normalize(year && year.value);
      const regionValue = normalize(region && region.value);
      const typeValue = normalize(type && type.value);

      cards.forEach(function (card) {
        const haystack = normalize([
          card.dataset.title,
          card.dataset.year,
          card.dataset.region,
          card.dataset.type,
          card.dataset.genre,
          card.textContent
        ].join(' '));
        const matchedKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        const matchedYear = !yearValue || normalize(card.dataset.year) === yearValue;
        const matchedRegion = !regionValue || normalize(card.dataset.region) === regionValue;
        const matchedType = !typeValue || normalize(card.dataset.type) === typeValue;
        card.classList.toggle('is-hidden', !(matchedKeyword && matchedYear && matchedRegion && matchedType));
      });
    };

    [input, year, region, type].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });
  });
})();
