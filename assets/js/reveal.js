/* ==========================================================================
   reveal.js — 스크롤 등장 애니메이션 (.reveal → .is-in)
   렌더링으로 새 요소가 생길 때마다 refresh() 를 호출해 다시 관찰합니다.
   ========================================================================== */
window.SEN = window.SEN || {};

(function (SEN) {
  'use strict';

  var observer = null;

  function init() {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('is-in'); });
      return;
    }

    observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add('is-in');
        observer.unobserve(en.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });

    refresh();

    // 안전장치: IntersectionObserver 가 어떤 이유로든 동작하지 않아도
    // 화면 안에 들어와 있는 요소는 반드시 보이도록 한 번 훑어 줍니다.
    setTimeout(sweep, 2500);
    window.addEventListener('load', function () { setTimeout(sweep, 300); });
  }

  /** 현재 뷰포트 안에 있는데 아직 안 보이는 .reveal 을 강제로 표시 */
  function sweep() {
    var h = window.innerHeight || document.documentElement.clientHeight;
    document.querySelectorAll('.reveal:not(.is-in)').forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < h && r.bottom > 0) el.classList.add('is-in');
    });
  }

  function refresh() {
    if (!observer) {
      document.querySelectorAll('.reveal:not(.is-in)').forEach(function (el) { el.classList.add('is-in'); });
      return;
    }
    document.querySelectorAll('.reveal:not(.is-in)').forEach(function (el) { observer.observe(el); });
  }

  SEN.reveal = { init: init, refresh: refresh, sweep: sweep };
})(window.SEN);
