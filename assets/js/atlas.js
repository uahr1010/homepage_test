/* ==========================================================================
   atlas.js — 시네마틱 껍데기의 동작

   · 스크롤 위치를 0~1 로 환산해 장면을 교차 전환합니다.
   · 상단 메뉴 / 오른쪽 점 = 해당 장면의 스크롤 위치로 이동.

   장면을 추가·삭제하면 atlas.css 의 #scroll-space 높이도 같이 손봐야
   장면당 스크롤 양이 비슷하게 유지됩니다. (현재 5장면 / 700vh)
   ========================================================================== */
window.SEN = window.SEN || {};

(function (SEN) {
  'use strict';

  var scenes = [], dots = [], navBtns = [], stage, topbar;
  var N = 0, cur = -1, ticking = false;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  function init() {
    stage = document.getElementById('stage');
    topbar = document.querySelector('.topbar');
    if (!stage) return;

    scenes = [].slice.call(stage.querySelectorAll('.scene'));
    N = scenes.length;
    if (!N) return;

    buildProgress();
    initNav();
    initLang();
    initAboutTabs();

    if (reduce) {                       /* 모션 최소화 — 장면을 그냥 이어 붙입니다 */
      scenes.forEach(function (s) { s.style.opacity = 1; s.hidden = false; });
      setActive(0);
      return;
    }

    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', onScroll);
    /* 첫 배치는 rAF 를 거치지 않고 바로 그립니다.
       숨겨진 탭에서 열리면 rAF 가 아예 돌지 않아, 여기서 안 그리면
       장면 5개가 겹친 상태로 남습니다. */
    paint(progress());
  }

  /* ---------- 스크롤 → 장면 ---------- */
  function progress() {
    var max = document.documentElement.scrollHeight - innerHeight;
    return max > 0 ? Math.min(1, Math.max(0, scrollY / max)) : 0;
  }

  /** 장면 i 가 화면 한가운데 오는 스크롤 위치 (0~1)
      첫 장면은 맨 위(0), 마지막 장면은 맨 아래(1) 에 놓입니다.
      (i+0.5)/N 으로 잡으면 p=0 일 때 첫 장면이 구간 경계에 걸려 사라집니다) */
  function centerOf(i) { return N > 1 ? i / (N - 1) : 0; }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      paint(progress());
    });
  }

  function paint(p) {
    var nearest = 0, best = 9;

    var span = Math.max(1, N - 1);
    scenes.forEach(function (el, i) {
      /* d = 이웃 장면까지의 거리를 1 로 본 상대 위치. 0 이면 정중앙 */
      var d = (p - centerOf(i)) * span;
      var ad = Math.abs(d);
      if (ad < best) { best = ad; nearest = i; }

      /* 0.25 까지는 또렷하게, 0.75 에서 완전히 사라지도록.
         두 장면 사이 한가운데(0.5)에서는 둘 다 50% 로 겹칩니다. */
      var vis = ad >= 0.75 ? 0 : ad <= 0.25 ? 1 : 1 - (ad - 0.25) / 0.5;

      if (vis <= 0) {
        if (!el.hidden) { el.hidden = true; el.style.opacity = 0; }
        return;
      }
      if (el.hidden) el.hidden = false;
      el.style.opacity = vis.toFixed(3);
      /* 다음 장면은 살짝 확대되며 들어오고, 지나간 장면은 축소되며 물러납니다 */
      el.style.transform = 'scale(' + (1 - 0.05 * ad).toFixed(4) + ') translateY(' +
        (d * -26).toFixed(1) + 'px)';
      el.style.zIndex = Math.round(100 - ad * 100);
    });

    setActive(nearest);
  }

  function setActive(i) {
    if (i === cur) return;
    cur = i;
    dots.forEach(function (d, k) { d.classList.toggle('is-on', k === i); });
    navBtns.forEach(function (b) {
      b.classList.toggle('is-on', +b.getAttribute('data-scene') === i);
    });
    /* 인트로(어두운 영상) 위에서는 투명 헤더, 나머지 밝은 장면에서는 흰 헤더 */
    if (topbar) topbar.classList.toggle('is-light', !scenes[i].classList.contains('scene--dark'));
  }

  function goTo(i) {
    var max = document.documentElement.scrollHeight - innerHeight;
    scrollTo({ top: centerOf(i) * max, behavior: reduce ? 'auto' : 'smooth' });
  }

  /* ---------- 오른쪽 진행 점 ---------- */
  function buildProgress() {
    var host = document.getElementById('prog');
    if (!host) return;
    dots = scenes.map(function (s, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('aria-label', (s.getAttribute('data-label') || '') + ' 장면으로 이동');
      b.addEventListener('click', function () { goTo(i); });
      host.appendChild(b);
      return b;
    });
  }

  /* ---------- 상단 메뉴 ---------- */
  function initNav() {
    navBtns = [].slice.call(document.querySelectorAll('[data-scene]'));
    navBtns.forEach(function (b) {
      b.addEventListener('click', function () { goTo(+b.getAttribute('data-scene')); });
    });
  }

  /* ---------- 언어 토글 ---------- */
  function initLang() {
    var wrap = document.querySelector('[data-langswitch]');
    if (!wrap) return;
    var btn = wrap.querySelector('[data-lang-toggle]');
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      wrap.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', wrap.classList.contains('is-open'));
    });
    wrap.querySelectorAll('[data-lang]').forEach(function (b) {
      b.addEventListener('click', function () {
        SEN.i18n.set(b.getAttribute('data-lang'));
        wrap.classList.remove('is-open');
      });
    });
    document.addEventListener('click', function () { wrap.classList.remove('is-open'); });
  }

  /* ---------- 회사소개 탭 (CEO / 연혁 / 공법 / CONTACT) ---------- */
  function initAboutTabs() {
    var tabs = document.querySelector('[data-about-tabs]');
    if (!tabs) return;
    tabs.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-panel]');
      if (!b) return;
      var name = b.getAttribute('data-panel');
      tabs.querySelectorAll('button').forEach(function (x) {
        x.classList.toggle('is-on', x === b);
      });
      document.querySelectorAll('[data-about-panel]').forEach(function (p) {
        p.hidden = p.getAttribute('data-about-panel') !== name;
      });
    });
  }

  SEN.atlas = { init: init, goTo: goTo };
})(window.SEN);
