# WOS 컬렉션

우송대학교 AX(AI 전환)를 위한 업무지원 앱을 한곳에 모은 허브 사이트입니다.

- 사이트 주소: https://gt4065c-cell.github.io/wos-collection/
- 로그인: 관리자 PIN 4자리

## 파일

| 파일 | 하는 일 |
|---|---|
| `index.html` | 화면(로그인 키패드, 추천 앱, 앱 서랍, 앱 정보 창) |
| `apps.js` | 앱 목록, 분류, 관리자 PIN |

## 앱 추가·수정

`apps.js`의 `APPS` 배열에 한 줄을 추가하거나 고칩니다.

```js
{ id: 'WOS-013', name: '앱 이름', cat: 'admin', status: 'live', icon: 'doc', dept: '담당 부서', hours: 0, users: 0, url: 'https://...', desc: '한 줄 설명' }
```

- `cat`: `teach`(교수학습) · `student`(학생지원) · `admin`(행정업무) · `research`(연구지원) · `idea`(혁신·소통)
- `status`: `live`(운영 중) · `beta`(시범 운영) · `soon`(개발 중)
- `icon`: `bulb` `doc` `book` `pen` `globe` `chat` `coin` `spark` `chart` `calendar` `check` `users` `search`
- `url`이 `'#'`이면 "주소 연결 전"으로 표시됩니다.
- 목록의 첫 번째 앱이 홈 화면 "이번 주 추천"에 나옵니다.

## 주의

GitHub Pages는 공개 사이트라서 `apps.js` 안의 PIN이 누구에게나 보입니다.
PIN은 화면을 가리는 용도이며, 민감한 정보는 이 사이트에 올리지 마세요.

## GitHub Pages 설정

저장소 Settings → Pages → Source: `Deploy from a branch`, Branch: `main` / `(root)` 선택 후 Save.
