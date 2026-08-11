/* ==========================================================================
   projects.js — 실적 데이터 만들기

   1) uploads/data/projects.xlsx 를 브라우저에서 직접 읽습니다 (SheetJS).
      · A열 = 건물위치(주소), C열 = 팀명. 1~2행은 머리글이라 건너뜁니다.
   2) 주소 문자열을 assets/data/geo.json 의 좌표 사전과 대조해 시/군/구를 찾습니다.
   3) 같은 지역끼리 묶어 지구본이 쓸 형태로 돌려줍니다.

   엑셀이 없으면 content/projects.json 의 주소 목록만으로 동작합니다
   (Pages CMS 에서 한 건씩 추가하는 경로).

   ※ 매칭 규칙은 scratchpad/build_geo.py 와 짝을 이룹니다.
     규칙을 바꾸면 그쪽으로 매칭률을 다시 재보세요. 현재 4,708건 중 97.2% 배치.
   ========================================================================== */
window.SEN = window.SEN || {};

(function (SEN) {
  'use strict';

  var XLSX_URL = 'uploads/data/projects.xlsx';
  var GEO_URL = 'assets/data/geo.json';
  var SHEETJS = 'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js';

  var TOKEN = /[가-힣]+[시군구]/g;
  var geo = null;

  /* ---------- 주소 정규화 ---------- */
  function norm(s) {
    return String(s).replace(/[(),·\-–—/]/g, ' ').replace(/\s+/g, ' ').trim();
  }

  function tokens(s) {
    TOKEN.lastIndex = 0;
    return s.match(TOKEN) || [];
  }

  /** 시도 이름이 겹치는 후보들 중 물량이 많은 시도를 먼저 고릅니다 */
  function byPriority(a, b) {
    var pa = geo.sidoPriority.indexOf(a.split(' ')[0]);
    var pb = geo.sidoPriority.indexOf(b.split(' ')[0]);
    if (pa < 0) pa = 99;
    if (pb < 0) pb = 99;
    return pa - pb || a.length - b.length;
  }

  /**
   * 주소 한 줄 → { key, lat, lng, acc }
   * acc: exact(시군구) | city(시 이름) | sido(시도 중심) | oversea | none
   */
  function matchAddress(addr) {
    var a = norm(addr), low = a.toLowerCase(), i, n, key, m;

    for (i = 0; i < geo.overseas.length; i++) {
      var o = geo.overseas[i];
      if (low.indexOf(o.kw) > -1) return { key: o.name, lat: o.lat, lng: o.lng, acc: 'oversea' };
    }

    /* 시도 찾기 — 앞에서 시작하는 경우가 우선, 없으면 문자열 어디든 */
    var sido = null, rest = a;
    for (i = 0; i < geo.sidoAlias.length; i++) {
      if (a.indexOf(geo.sidoAlias[i][0]) === 0) {
        sido = geo.sidoAlias[i][1];
        rest = a.slice(geo.sidoAlias[i][0].length);
        break;
      }
    }
    if (sido === null) {
      for (i = 0; i < geo.sidoAlias.length; i++) {
        var at = a.indexOf(geo.sidoAlias[i][0]);
        if (at > -1) {
          sido = geo.sidoAlias[i][1];
          rest = a.slice(at + geo.sidoAlias[i][0].length);
          break;
        }
      }
    }

    var toks = tokens(rest);

    if (sido) {
      for (n = 2; n >= 1; n--) {
        if (toks.length >= n) {
          key = sido + ' ' + toks.slice(0, n).join('');
          if (geo.regions[key]) {
            return { key: key, lat: geo.regions[key][0], lng: geo.regions[key][1], acc: 'exact' };
          }
        }
      }
      /* "경북 포항 남구" 처럼 시 이름에 접미사가 없는 표기 */
      m = rest.match(/^\s*([가-힣]{2,4})/);
      if (m && geo.city[m[1]]) {
        return { key: sido + ' ' + m[1], lat: geo.city[m[1]][0], lng: geo.city[m[1]][1], acc: 'city' };
      }
      if (geo.sido[sido]) {
        return { key: sido, lat: geo.sido[sido][0], lng: geo.sido[sido][1], acc: 'sido' };
      }
    }

    /* 시도 없이 시군구만 적힌 주소.
       앞에서부터 자르지 않고 모든 토큰을 후보로 봅니다 —
       "서율특별시 광진구" 처럼 앞이 오타여도 뒤의 '광진구'로 찾아내기 위함입니다. */
    var cands = [];
    for (i = 0; i < toks.length; i++) {
      if (i + 1 < toks.length) cands.push(toks[i] + toks[i + 1]);
      cands.push(toks[i]);
    }
    for (i = 0; i < cands.length; i++) {
      var c = cands[i], hits = [];
      for (key in geo.regions) {
        if (tail(key) === c) hits.push(key);
      }
      if (!hits.length && c.length >= 3) {
        /* '분당구' → '경기 성남시분당구' 처럼 시+구가 붙은 키의 끝부분 매칭 */
        for (key in geo.regions) {
          if (tail(key).slice(-c.length) === c) hits.push(key);
        }
      }
      if (hits.length) {
        hits.sort(byPriority);
        return { key: hits[0], lat: geo.regions[hits[0]][0], lng: geo.regions[hits[0]][1], acc: 'exact' };
      }
    }

    /* 시 이름만 적힌 경우 — "전주 만성지구", "이천 호법면" */
    m = a.match(/^([가-힣]{2,4})/);
    if (m && geo.city[m[1]]) {
      return { key: m[1], lat: geo.city[m[1]][0], lng: geo.city[m[1]][1], acc: 'city' };
    }
    return { key: null, lat: null, lng: null, acc: 'none' };
  }

  function tail(key) {
    var i = key.indexOf(' ');
    return i < 0 ? key : key.slice(i + 1);
  }

  /* ---------- 외부 스크립트 로더 ---------- */
  function loadScript(src) {
    return new Promise(function (res, rej) {
      var s = document.createElement('script');
      s.src = src;
      s.onload = res;
      s.onerror = function () { rej(new Error('스크립트를 불러오지 못했습니다: ' + src)); };
      document.head.appendChild(s);
    });
  }

  /* ---------- 엑셀에서 주소 뽑기 ---------- */
  function readXlsx(buf) {
    var wb = XLSX.read(buf, { type: 'array' });
    var ws = wb.Sheets[wb.SheetNames[0]];
    var rows = XLSX.utils.sheet_to_json(ws, { header: 1, blankrows: false });
    var out = [];
    /* 1행 공백 + 2행 머리글이라 3행부터. 혹시 머리글이 없어도 주소 판별로 걸러집니다. */
    for (var i = 0; i < rows.length; i++) {
      var a = rows[i][0], team = rows[i][2];
      if (!a) continue;
      a = String(a).trim();
      if (!a || a === '건물위치') continue;
      out.push([a, team ? String(team).trim() : '']);
    }
    return out;
  }

  /* ---------- 지역별 집계 ---------- */
  function aggregate(pairs) {
    var map = {}, stat = { exact: 0, city: 0, sido: 0, oversea: 0, none: 0 }, total = 0;

    pairs.forEach(function (p) {
      var r = matchAddress(p[0]);
      stat[r.acc]++;
      total++;
      if (!r.key) return;
      if (!map[r.key]) map[r.key] = { name: r.key, lat: r.lat, lng: r.lng, n: 0, items: [] };
      map[r.key].n++;
      if (map[r.key].items.length < 40) map[r.key].items.push([p[0], p[1]]);
    });

    var regions = Object.keys(map).map(function (k) { return map[k]; });
    regions.sort(function (a, b) { return b.n - a.n; });

    /* 시도별 합계 — 지구본 위 라벨에 씁니다 */
    var byProv = {};
    regions.forEach(function (r) {
      var p = r.name.split(' ')[0];
      byProv[p] = (byProv[p] || 0) + r.n;
    });

    return { regions: regions, byProv: byProv, stat: stat, total: total, placed: total - stat.none };
  }

  /* ---------- 진입점 ---------- */
  /**
   * 실적 데이터를 준비합니다.
   * 엑셀이 있으면 엑셀을, 없으면 content/projects.json 의 주소 목록을 씁니다.
   * @returns {Promise<{regions,byProv,stat,total,placed,source}>}
   */
  function load(fallbackAddresses) {
    return fetch(GEO_URL, { cache: 'no-cache' })
      .then(function (r) {
        if (!r.ok) throw new Error('geo.json (' + r.status + ')');
        return r.json();
      })
      .then(function (g) {
        geo = g;
        return fetch(XLSX_URL, { cache: 'no-cache' });
      })
      .then(function (r) {
        if (!r.ok) throw new Error('no-xlsx');
        return r.arrayBuffer();
      })
      .then(function (buf) {
        return loadScript(SHEETJS).then(function () {
          var out = aggregate(readXlsx(buf));
          out.source = 'xlsx';
          return out;
        });
      })
      .catch(function (err) {
        /* 엑셀이 없거나 읽기에 실패하면 CMS 로 넣은 주소만으로 그립니다 */
        if (!geo) throw err;
        var pairs = (fallbackAddresses || []).map(function (a) {
          return typeof a === 'string' ? [a, ''] : [a.address || '', a.team || ''];
        }).filter(function (p) { return p[0]; });
        var out = aggregate(pairs);
        out.source = pairs.length ? 'json' : 'empty';
        if (err && err.message !== 'no-xlsx') console.warn('[SEN] 엑셀 읽기 실패:', err.message);
        return out;
      });
  }

  SEN.projects = { load: load, matchAddress: matchAddress };
})(window.SEN);
