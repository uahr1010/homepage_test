/* ==========================================================================
   reveal.js — 스크롤 등장 애니메이션 (.reveal → .is-in)
   렌더링으로 새 요소가 생길 때마다 refresh() 를 호출해 다시 관찰합니다.

   설계 원칙: 애니메이션은 장식이고, 글이 보이는 것이 우선입니다.
   조금이라도 어긋날 낌새가 보이면 애니메이션을 버리고 전부 보여 줍니다.
   ========================================================================== */
window.SEN = window.SEN || {};

(function (SEN) {
  'use strict';

  var GATE = 'js-anim';               // index.html 인라인 스크립트가 <html> 에 붙이는 플래그
  var root = document.documentElement;
  var observer = null;
  var ticking = false;

  function enabled() { return root.className.indexOf(GATE) > -1; }

  /** 애니메이션을 포기하고 전부 또렷하게 보이도록 되돌립니다 (되돌리지 않음) */
  function showAll() {
    if (!enabled()) return;
    root.className = root.className.replace(GATE, '').replace(/\s+/g, ' ').trim();
    if (observer) { observer.disconnect(); observer = null; }
  }

  function init() {
    // 플래그가 없으면 CSS 가 애초에 숨기지 않으므로 할 일이 없습니다.
    if (!enabled()) return;

    observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add('is-in');
        if (observer) observer.unobserve(en.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });

    refresh();

    /* 안전장치 ① — IntersectionObserver 가 어떤 이유로든 놓친 요소를
       스크롤·리사이즈·로드 완료 때마다 훑어서 보여 줍니다. */
    window.addEventListener('scroll', onIdle, { passive: true });
    window.addEventListener('resize', onIdle);
    window.addEventListener('load', function () { setTimeout(sweep, 200); });
    setTimeout(sweep, 2500);

    /* 안전장치 ② — 화면에 보이지 않는 탭에서는 CSS 트랜지션이 진행되지 않습니다.
       그 사이에 .is-in 이 붙으면 요소가 opacity:0 에 그대로 멈춰
       탭으로 돌아왔을 때 페이지가 뿌옇게 보입니다.
       다시 보이는 순간 애니메이션을 통째로 포기해 확실히 보이게 합니다. */
    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'visible') showAll();
    });

    /* 안전장치 ③ — 위 어느 것도 듣지 않는 상황을 대비한 최후의 방어선.
       10초가 지나도록 화면 안에 안 나타난 요소가 남아 있으면 전부 보여 줍니다. */
    setTimeout(function () {
      if (stuck()) showAll();
    }, 10000);
  }

  /** 뷰포트 안에 있는데 아직 안 나타난 .reveal 이 남아 있는가 */
  function stuck() {
    var h = window.innerHeight || root.clientHeight;
    var list = document.querySelectorAll('.reveal:not(.is-in)');
    for (var i = 0; i < list.length; i++) {
      var r = list[i].getBoundingClientRect();
      if (r.top < h && r.bottom > 0) return true;
    }
    return false;
  }

  function onIdle() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () { ticking = false; sweep(); });
  }

  /** 현재 뷰포트 안에 있는데 아직 안 보이는 .reveal 을 강제로 표시 */
  function sweep() {
    var h = window.innerHeight || root.clientHeight;
    document.querySelectorAll('.reveal:not(.is-in)').forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < h && r.bottom > 0) el.classList.add('is-in');
    });
  }

  function refresh() {
    if (!enabled()) return;
    if (!observer) {
      document.querySelectorAll('.reveal:not(.is-in)').forEach(function (el) { el.classList.add('is-in'); });
      return;
    }
    document.querySelectorAll('.reveal:not(.is-in)').forEach(function (el) { observer.observe(el); });
  }

  SEN.reveal = { init: init, refresh: refresh, sweep: sweep, showAll: showAll };
})(window.SEN);
