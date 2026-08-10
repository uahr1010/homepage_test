# SEN Engineering Group 홈페이지

원페이지 스크롤 방식의 정적 사이트입니다. 빌드 과정이 없어 **GitHub에 push하면 그대로 배포**됩니다.
콘텐츠는 [Pages CMS](https://pagescms.org)로 편집합니다.

---

## 목차

1. [로컬에서 미리보기](#1-로컬에서-미리보기)
2. [GitHub 저장소 만들기](#2-github-저장소-만들기)
3. [GitHub Pages로 배포](#3-github-pages로-배포)
4. [Pages CMS 연결](#4-pages-cms-연결)
5. [콘텐츠 수정 방법](#5-콘텐츠-수정-방법)
6. [디자인 수정 방법](#6-디자인-수정-방법)
7. [자주 겪는 문제](#7-자주-겪는-문제)
8. [다음 단계 (선택)](#8-다음-단계-선택)

---

## 1. 로컬에서 미리보기

> ⚠️ **`index.html`을 더블클릭해서 열면 내용이 안 나옵니다.**
> 브라우저 보안 정책상 `file://` 로 열린 페이지는 JSON 파일을 읽을 수 없습니다.
> 반드시 아래처럼 간단한 웹서버를 띄우고 `http://localhost:8000` 으로 접속하세요.

이 폴더에서 터미널(PowerShell)을 열고:

```bash
python -m http.server 8000
```

그다음 브라우저에서 `http://localhost:8000` 접속.
Node.js를 쓰신다면 이것도 됩니다:

```bash
npx serve .
```

---

## 2. GitHub 저장소 만들기

1. GitHub에서 새 저장소 생성 (예: `senkuzo-homepage`). **Public** 으로 만드세요.
   - Private으로 하려면 GitHub Pro/Team 이상이 필요합니다.
2. 이 폴더(`senkuzo-site`)의 **내용물**을 저장소 루트에 올립니다.
   `senkuzo-site` 폴더째 올리면 안 됩니다 — `index.html`이 저장소 최상단에 있어야 합니다.

터미널에서:

```bash
git init
```

```bash
git add . && git commit -m "홈페이지 초기 구성"
```

```bash
git branch -M main && git remote add origin https://github.com/사용자명/senkuzo-homepage.git && git push -u origin main
```

---

## 3. GitHub Pages로 배포

1. 저장소 → **Settings** → 왼쪽 메뉴 **Pages**
2. **Source**: `Deploy from a branch`
3. **Branch**: `main` / 폴더는 `/ (root)` → **Save**
4. 1~2분 뒤 `https://사용자명.github.io/senkuzo-homepage/` 에서 확인

### 도메인 연결 (senkuzo.com 등)

1. 저장소 루트에 `CNAME` 이라는 파일을 만들고 안에 도메인만 한 줄 적습니다:
   ```
   www.senkuzo.com
   ```
2. 도메인 등록 기관(가비아 등) DNS 설정에서:
   - `www` → CNAME → `사용자명.github.io`
   - 루트 도메인(`senkuzo.com`)도 쓰려면 A 레코드 4개:
     `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
3. Settings → Pages → Custom domain에 도메인 입력 후 **Enforce HTTPS** 체크

---

## 4. Pages CMS 연결

1. https://app.pagescms.org 접속 → **Sign in with GitHub**
2. 권한 요청 시 위에서 만든 저장소를 선택해 접근 허용
3. 저장소 목록에서 `senkuzo-homepage` 선택
4. 루트의 `.pages.yml` 을 자동으로 읽어 **① 사이트 공통 ~ ⑤ 채용** 5개 편집 메뉴가 나타납니다

편집 후 **Save**를 누르면 Pages CMS가 GitHub에 커밋하고,
GitHub Pages가 자동으로 다시 배포합니다. **약 1분 뒤 사이트에 반영**됩니다.

### 다른 직원에게 편집 권한 주기

저장소 → Settings → Collaborators에서 GitHub 계정을 추가하면,
그 사람도 Pages CMS에 로그인해 편집할 수 있습니다.

---

## 5. 콘텐츠 수정 방법

Pages CMS 왼쪽 메뉴가 곧 편집 대상입니다.

| 메뉴 | 편집 내용 | 파일 |
|---|---|---|
| ① 사이트 공통 | 회사명, 첫 화면 문구·숫자지표, 메뉴 이름, 버튼 문구, 푸터, SEO | `content/site.json` |
| ② 회사소개 | CEO 인사말, 회사연혁, 주요공법(+PDF), CONTACT·사업장 | `content/about.json` |
| ③ 뉴스 | 뉴스 목록 | `content/news.json` |
| ④ 프로젝트 | 프로젝트 목록 | `content/projects.json` |
| ⑤ 채용 | 인재상, 채용공고, 전형절차 | `content/careers.json` |

### 다국어 입력

모든 텍스트 항목에 **한국어 / English / 中文 / 日本語** 4칸이 있습니다.
**한국어만 채워도 됩니다** — 번역이 비어 있으면 자동으로 한국어가 표시됩니다.
나중에 번역을 채우면 그때부터 해당 언어로 보입니다.

### 뉴스 추가하기

③ 뉴스 → `뉴스 목록` 에서 **Add item** →

- **고유 ID**: 영문·숫자·하이픈 (예: `news-2026-09-award`) — 중복만 안 되면 됩니다
- **날짜**: 목록은 이 날짜 기준 최신순으로 자동 정렬됩니다
- **분류**: 여기 입력한 한국어 값이 **필터 버튼**이 됩니다.
  기존 분류(`언론보도` / `행사` / `논문` / `기술자료`)와 **똑같이 적어야** 같은 버튼으로 묶입니다
- **썸네일**: 업로드하면 `uploads/images/` 에 저장됩니다. 비워 두면 블루 그라디언트가 표시됩니다
- **원문 링크**: 입력하면 카드 전체가 새 탭 링크가 됩니다. 비우면 링크 없는 카드

### 공법 PDF 올리기

② 회사소개 → `주요공법` → 해당 공법 → **기술자료 PDF** 에서 업로드.
`uploads/docs/` 에 저장되고, 카드에 "PDF 다운로드" 버튼이 생깁니다.
비워 두면 "자료 준비중"으로 표시됩니다.

### 채용공고 추가 / "지원하기" 메일 주소 변경

⑤ 채용 →

- `지원 접수 이메일` : 전체 공고의 기본 접수 주소
- 각 공고의 `이 공고 전용 접수 메일` : 비워 두면 위 기본값 사용
- `지원 메일 제목` 의 `{job}` 자리에 공고명이 자동으로 들어갑니다
- `마감일`을 비우면 마감 배지가 표시되지 않습니다 (상시채용)

지원자가 "지원하기"를 누르면 **받는사람·제목·본문 양식이 채워진 메일 창**이 열립니다.

### 프로젝트 추가

④ 프로젝트 → `프로젝트 목록` → **Add item**.
`적용 공법` 에 입력한 값(`PSRC`, `TSC` 등)이 **필터 버튼**이 됩니다.
`상세 설명` 은 빈 줄 하나로 문단이 나뉩니다.

---

## 6. 디자인 수정 방법

### 색상 바꾸기

`assets/css/base.css` 맨 위 `:root` 블록만 고치면 사이트 전체에 반영됩니다.

```css
--c-navy:      #0A2540;   /* 가장 진한 남색 — 다크 섹션 배경 */
--c-blue:      #0B5FCE;   /* 메인 블루 — 버튼·링크·강조 */
--c-blue-dark: #084BA3;   /* 버튼 hover */
--c-blue-soft: #7FB2F0;   /* 밝은 포인트 */
--c-tint:      #EFF5FD;   /* 아주 연한 블루 배경 */
```

### 폰트 바꾸기

같은 파일의 `--font-sans`(본문), `--font-display`(큰 제목).
현재 제목은 Playfair Display(구글 폰트), 본문은 시스템 한글 폰트입니다.
웹폰트가 필요 없으면 `index.html` 상단의 `fonts.googleapis.com` 링크 2줄을 지우세요.

### 로고 바꾸기

- 헤더 로고: `index.html` 의 `<span class="logo__mark">` 안 SVG 교체
  (이미지 파일을 쓰려면 `<img src="assets/img/logo.svg" alt="">` 로 바꿔도 됩니다)
- 파비콘: `assets/img/favicon.svg` 교체

### 섹션 순서 바꾸기 / 추가

`index.html` 의 `<section data-section="...">` 블록 순서를 바꾸면 됩니다.
메뉴는 `data-anchor` + `href="#섹션id"` 조합이므로 자동으로 따라갑니다.

---

## 7. 자주 겪는 문제

**Q. 화면에 빨간 오류 박스가 뜨고 내용이 안 보여요**
→ `index.html`을 더블클릭해서 열었을 때 발생합니다. [1번 항목](#1-로컬에서-미리보기)대로 웹서버를 띄우세요.

**Q. CMS에서 저장했는데 사이트가 그대로예요**
→ ① 배포에 1~2분 걸립니다. ② 저장소 → Actions 탭에서 배포 성공 여부를 확인하세요.
③ 브라우저 캐시일 수 있으니 `Ctrl+Shift+R` 로 강력 새로고침.

**Q. 이미지가 안 보여요**
→ 반드시 Pages CMS의 업로드 기능을 쓰세요. 직접 경로를 적을 때는
`/uploads/images/파일명.jpg` 형식이어야 합니다.

**Q. 특정 언어로만 글자가 안 나와요**
→ 정상입니다. 해당 언어 칸이 비어 있으면 한국어로 대체 표시됩니다.

**Q. 메뉴를 눌렀는데 제목이 헤더에 가려져요**
→ `assets/css/base.css` 의 `--header-h` 값(현재 76px)이 실제 헤더 높이와 맞는지 확인하세요.

---

## 8. 다음 단계 (선택)

### 검색엔진 최적화(SEO) 보강

현재는 본문을 JavaScript로 그리기 때문에 네이버·다음 검색 노출이 약합니다.
필요해지면 **GitHub Actions에서 언어별 HTML을 미리 생성**하는 단계를 추가할 수 있습니다.
`content/*.json` 구조는 그대로 두고 빌드 스크립트만 얹으면 되므로,
CMS 사용법이나 편집 방식은 전혀 바뀌지 않습니다.

### 문의 폼

현재 CONTACT는 `mailto:` 링크 방식입니다(서버 불필요).
웹 폼으로 받으려면 [Formspree](https://formspree.io) 같은 외부 서비스를 붙이면
정적 사이트 그대로 폼 제출을 받을 수 있습니다.

### 사이트맵 / robots.txt

검색엔진 등록 시 필요합니다. 도메인이 확정되면 추가하겠습니다.

---

## 기술 메모

- 빌드 도구·프레임워크 없음. 순수 HTML/CSS/JS (ES5 문법 + IntersectionObserver)
- 외부 의존성: Google Fonts(Playfair Display) 1건 — 제거 가능
- 지원 브라우저: Chrome / Edge / Safari / Firefox 최신 2개 버전, iOS·Android
- 접근성: 키보드 네비게이션, `aria-expanded`, `prefers-reduced-motion` 대응
