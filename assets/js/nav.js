/* ==========================================================================
   nav.js — 스무스 스크롤 · 스크롤 스파이 · 헤더 상태 · 모바일 드로어
            · 언어 드롭다운 · 채용 아코디언 · 프로젝트 모달 · 필터/더보기
   ========================================================================== */
window.SEN = window.SEN || {};

(function (SEN) {
  'use strict';

  var header, drawer, burger;

  /* ---------- 1. 헤더: 스크롤 상태 + 진행 바 ---------- */
  function initHeaderState() {
    header = document.querySelector('[data-header]');
    var bar = document.querySelector('[data-scroll-bar]');
    var hero = document.getElementById('hero');

    function onScroll() {
      // 히어로를 벗어나면 흰 배경 + 어두운 글씨로 전환
      var threshold = hero ? hero.offsetHeight - 90 : 60;
      header.classList.toggle('is-stuck', window.scrollY > threshold);

      if (bar) {
        var max = document.documentElement.scrollHeight - window.innerHeight;
        bar.style.width = (max > 0 ? (window.scrollY / max) * 100 : 0) + '%';
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    onScroll();
  }

  /* ---------- 2. 앵커 스무스 스크롤 ---------- */
  function initAnchors() {
    document.addEventListener('click', function (e) {
      var a = e.target.closest('a[data-anchor]');
      if (!a) return;
      var id = a.getAttribute('href');
      if (!id || id.charAt(0) !== '#') return;

      var target = id === '#top' ? document.body : document.querySelector(id);
      if (!target) return;

      e.preventDefault();
      closeDrawer();

      var top = id === '#top' ? 0
              : target.getBoundingClientRect().top + window.scrollY - (header.offsetHeight - 1);

      window.scrollTo({
        top: top,
        behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
      });

      history.pushState(null, '', id === '#top' ? location.pathname + location.search : id);
    });
  }

  /* ---------- 3. 스크롤 스파이 (현재 섹션 메뉴 강조) ---------- */
  function initSpy() {
    var sections = Array.prototype.slice.call(document.querySelectorAll('[data-section]'));
    var items = Array.prototype.slice.call(document.querySelectorAll('.nav__item'));
    if (!sections.length || !items.length) return;

    function setActive(id) {
      items.forEach(function (li) {
        var link = li.querySelector('a[href]');
        li.classList.toggle('is-active', !!link && link.getAttribute('href') === '#' + id);
      });
    }

    var observer = new IntersectionObserver(function (entries) {
      // 화면에 보이는 섹션 중 가장 위쪽에 있는 것을 선택
      var visible = entries.filter(function (en) { return en.isIntersecting; });
      if (!visible.length) return;
      visible.sort(function (a, b) { return a.boundingClientRect.top - b.boundingClientRect.top; });
      setActive(visible[0].target.id);
    }, {
      rootMargin: '-45% 0px -45% 0px',
      threshold: 0
    });

    sections.forEach(function (s) { observer.observe(s); });
  }

  /* ---------- 4. 모바일 드로어 ---------- */
  function openDrawer() {
    drawer.hidden = false;
    burger.setAttribute('aria-expanded', 'true');
    burger.setAttribute('aria-label', '메뉴 닫기');
    document.body.classList.add('is-locked');
    header.classList.add('is-stuck');
  }
  function closeDrawer() {
    if (!drawer || drawer.hidden) return;
    drawer.hidden = true;
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', '메뉴 열기');
    document.body.classList.remove('is-locked');
  }
  function initDrawer() {
    drawer = document.querySelector('[data-drawer]');
    burger = document.querySelector('[data-burger]');
    if (!drawer || !burger) return;

    burger.addEventListener('click', function () {
      if (drawer.hidden) openDrawer(); else closeDrawer();
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 900) closeDrawer();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeDrawer();
    });
  }

  /* ---------- 5. 언어 드롭다운 ---------- */
  function initLangSwitch() {
    var wrap = document.querySelector('[data-langswitch]');
    if (!wrap) return;
    var toggle = wrap.querySelector('[data-lang-toggle]');
    var current = wrap.querySelector('[data-lang-current]');

    function sync() {
      var lang = SEN.i18n.get();
      current.textContent = lang.toUpperCase();
      wrap.querySelectorAll('[data-lang]').forEach(function (b) {
        b.setAttribute('aria-current', String(b.getAttribute('data-lang') === lang));
      });
    }
    function close() { wrap.classList.remove('is-open'); toggle.setAttribute('aria-expanded', 'false'); }

    toggle.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = wrap.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
    });
    wrap.querySelectorAll('[data-lang]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        SEN.i18n.set(btn.getAttribute('data-lang'));
        close();
      });
    });
    document.addEventListener('click', close);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });

    SEN.i18n.onChange(sync);
    sync();
  }

  /* ---------- 6. 채용 공고 아코디언 (렌더 후 재바인딩 필요 없음: 위임) ---------- */
  function initJobs() {
    document.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-job-toggle]');
      if (!btn) return;
      var job = btn.closest('[data-job]');
      var open = job.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', String(open));
    });
  }

  /* ---------- 7. 프로젝트 모달 ---------- */
  function initModal() {
    var modal = document.querySelector('[data-modal]');
    var body = modal && modal.querySelector('[data-modal-body]');
    if (!modal) return;

    function open(html) {
      body.innerHTML = html;
      modal.hidden = false;
      document.body.classList.add('is-locked');
    }
    function close() {
      modal.hidden = true;
      body.innerHTML = '';
      document.body.classList.remove('is-locked');
    }

    document.addEventListener('click', function (e) {
      if (e.target.closest('[data-modal-close]')) { close(); return; }

      var card = e.target.closest('[data-project]');
      if (!card) return;
      var id = card.getAttribute('data-project');
      var list = (SEN.data.projects && SEN.data.projects.items) || [];
      var p = list.filter(function (x, i) { return String(x.id || i) === id; })[0];
      if (p) open(SEN.util.projectModalHTML(p, SEN.data));
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !modal.hidden) close();
    });
  }

  /* ---------- 8. 필터 칩 + 더보기 ---------- */
  function initListControls() {
    document.addEventListener('click', function (e) {
      var chip = e.target.closest('[data-chip]');
      if (chip) {
        var kind = chip.getAttribute('data-chip');
        SEN.state.filter[kind] = chip.getAttribute('data-value') || null;
        SEN.state.limit[kind] = SEN.state.PAGE;
        SEN.render(SEN.data);
        SEN.reveal.refresh();
        return;
      }
      var more = e.target.closest('[data-more]');
      if (more) {
        var k = more.getAttribute('data-more');
        SEN.state.limit[k] += SEN.state.PAGE;
        SEN.render(SEN.data);
        SEN.reveal.refresh();
      }
    });
  }

  function init() {
    initHeaderState();
    initAnchors();
    initDrawer();
    initLangSwitch();
    initJobs();
    initModal();
    initListControls();
    initSpy();
  }

  SEN.nav = { init: init };
})(window.SEN);
