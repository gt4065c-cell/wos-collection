# WOS 컬렉션

우송대학교 AX(AI 전환)를 위한 업무지원 앱을 한곳에 모은 허브 사이트입니다.

- 사이트 주소: https://gt4065c-cell.github.io/wos-collection/
- 누구나 비밀번호 없이 앱을 둘러보고 열 수 있습니다.
- 관리 화면: 화면 오른쪽 아래의 흐린 톱니 아이콘 → 관리자 PIN 4자리

## 파일

| 파일 | 하는 일 |
|---|---|
| `index.html` | 화면 모양(디자인) |
| `hub.js` | 화면 동작(홈, 모든 앱, 관리자 PIN 키패드, 앱 관리) |
| `apps.js` | 설정(관리자 PIN, 저장할 저장소), 앱 목록 불러오기·저장 |
| `apps.json` | 앱 목록 데이터 |
| `drafts/` | 처음 화면 시안 3가지(A 캠퍼스 런처 · B 커맨드 콘솔 · C 앱 서랍). 보관용 |

## 앱 추가·수정·삭제 (관리 화면)

오른쪽 아래 톱니 아이콘을 누르고 관리자 PIN을 넣으면 나오는 관리 화면에서 앱을 추가·수정·삭제합니다.
저장하면 이 저장소의 `apps.json`이 바로 고쳐지고, 1~2분 뒤 모두에게 보입니다.

처음 한 번만 GitHub 연결이 필요합니다.

1. GitHub → Settings → Developer settings → Fine-grained tokens → Generate new token
2. Repository access에서 `wos-collection`만 고르기
3. Permissions → Contents를 **Read and write**로 바꾸고 만들기
4. 만들어진 토큰(`github_pat_…`)을 관리 화면의 'GitHub 연결' 칸에 붙여 넣기

토큰은 그 브라우저에만 보관됩니다. 다른 컴퓨터에서 관리하려면 그 컴퓨터에서도 한 번 연결하세요.
GitHub를 연결하지 않고 고친 내용은 그 브라우저에만 저장되며, 나중에 연결한 뒤 '사이트에 올리기'로 올릴 수 있습니다.

`apps.json`을 GitHub에서 직접 고쳐도 됩니다. 항목 형식:

```json
{ "id": "WOS-013", "name": "앱 이름", "cat": "admin", "status": "live", "icon": "doc", "dept": "담당 부서", "hours": 0, "users": 0, "url": "https://...", "desc": "한 줄 설명", "featured": true }
```

- `cat`: `teach`(교수학습) · `student`(학생지원) · `admin`(행정업무) · `research`(연구지원) · `idea`(혁신·소통)
- `status`: `live`(운영 중) · `beta`(시범 운영) · `soon`(개발 중)
- `featured: true`인 앱이 홈 화면 "이번 주 추천"에 나옵니다(없으면 첫 번째 앱).

## 주의

GitHub Pages는 공개 사이트라서 `apps.js` 안의 PIN이 누구에게나 보입니다.
PIN은 화면을 가리는 용도이며, 민감한 정보는 이 사이트에 올리지 마세요.
앱 목록을 실제로 바꿀 수 있는 사람은 GitHub 토큰을 가진 관리자뿐입니다.

## GitHub Pages 설정

저장소 Settings → Pages → Source: `Deploy from a branch`, Branch: `main` / `(root)` 선택 후 Save.
