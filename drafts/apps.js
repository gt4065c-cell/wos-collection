// WOS 컬렉션 공통 데이터 · 로그인 도우미 (세 가지 디자인 시안이 함께 씁니다)
// 앱을 추가하려면 아래 APPS 배열에 한 줄을 더 넣으면 됩니다.
window.WOS = (function () {
  var ADMIN_PIN = '9660';
  var KEY = 'wos-collection-auth';

  var CATS = [
    { id: 'all', name: '전체' },
    { id: 'teach', name: '교수학습' },
    { id: 'student', name: '학생지원' },
    { id: 'admin', name: '행정업무' },
    { id: 'research', name: '연구지원' },
    { id: 'idea', name: '혁신·소통' }
  ];

  // status: live(운영 중) · beta(시범 운영) · soon(개발 중)
  // hours: 연간 절감 예상 시간(교직원 전체 기준)
  var APPS = [
    { id: 'WOS-001', name: 'WOS 아이디어 뱅크', cat: 'idea', status: 'live', icon: 'bulb', dept: 'AI혁신추진위원회', hours: 0, users: 412, url: 'https://gt4065b.github.io/wos-idea-bank/', desc: '업무 개선 아이디어를 등록하고 격주 심의로 정규 WOS 리스트에 올립니다.' },
    { id: 'WOS-002', name: '회의록 자동 요약', cat: 'admin', status: 'live', icon: 'doc', dept: '기획처', hours: 1840, users: 236, url: '#', desc: '녹음 파일을 올리면 안건·결정사항·담당자별 할 일로 정리합니다.' },
    { id: 'WOS-003', name: '강의계획서 도우미', cat: 'teach', status: 'live', icon: 'book', dept: '교수학습혁신센터', hours: 2600, users: 318, url: '#', desc: '교과목 개요와 학습성과를 넣으면 15주 강의계획서 초안을 만듭니다.' },
    { id: 'WOS-004', name: '공문 작성 도우미', cat: 'admin', status: 'live', icon: 'pen', dept: '총무팀', hours: 1320, users: 190, url: '#', desc: '대학 공문 서식과 문체에 맞춰 시행문·내부결재 초안을 씁니다.' },
    { id: 'WOS-005', name: '외국인 유학생 다국어 안내', cat: 'student', status: 'beta', icon: 'globe', dept: '국제교류처', hours: 960, users: 84, url: '#', desc: '학사 공지를 영어·중국어·베트남어·우즈베크어로 바로 번역해 보냅니다.' },
    { id: 'WOS-006', name: '학생 상담 기록 정리', cat: 'student', status: 'beta', icon: 'chat', dept: '학생상담센터', hours: 1100, users: 57, url: '#', desc: '상담 메모를 표준 상담일지 양식으로 바꾸고 후속 조치를 알려 줍니다.' },
    { id: 'WOS-007', name: '연구비 집행 점검', cat: 'research', status: 'beta', icon: 'coin', dept: '산학협력단', hours: 740, users: 41, url: '#', desc: '영수증을 올리면 과제별 집행 기준 위반 여부를 먼저 확인합니다.' },
    { id: 'WOS-008', name: '수업 퀴즈 생성기', cat: 'teach', status: 'live', icon: 'spark', dept: '교수학습혁신센터', hours: 1580, users: 274, url: '#', desc: '강의자료 PDF에서 난이도별 퀴즈와 해설을 자동으로 뽑습니다.' },
    { id: 'WOS-009', name: '설문 결과 분석', cat: 'research', status: 'live', icon: 'chart', dept: 'IR센터', hours: 680, users: 96, url: '#', desc: '만족도 조사 응답을 받아 문항별 그래프와 서술형 응답 요약을 만듭니다.' },
    { id: 'WOS-010', name: '학사일정 챗봇', cat: 'student', status: 'soon', icon: 'calendar', dept: '학사지원팀', hours: 0, users: 0, url: '#', desc: '수강신청·휴복학·성적 정정 기간을 학생 질문에 맞춰 안내합니다.' },
    { id: 'WOS-011', name: '출결 이의신청 처리', cat: 'teach', status: 'soon', icon: 'check', dept: '학사지원팀', hours: 0, users: 0, url: '#', desc: '공결 서류를 확인하고 담당 교수에게 승인 요청을 자동으로 보냅니다.' },
    { id: 'WOS-012', name: '학생 성향 진단(MBTI)', cat: 'student', status: 'beta', icon: 'users', dept: '학생성공센터', hours: 300, users: 128, url: '#', desc: '신입생 성향 진단 결과로 팀 프로젝트 조 편성을 돕습니다.' }
  ];

  var STATUS = { live: '운영 중', beta: '시범 운영', soon: '개발 중' };

  // 24×24 선 아이콘
  var ICONS = {
    bulb: '<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2V16h5v-.1c0-.8.4-1.5 1-2A6 6 0 0 0 12 3z"/>',
    doc: '<path d="M14 3H6v18h12V7z"/><path d="M14 3v4h4M9 12h6M9 16h6"/>',
    book: '<path d="M4 4h6a2 2 0 0 1 2 2v14a2 2 0 0 0-2-2H4z"/><path d="M20 4h-6a2 2 0 0 0-2 2v14a2 2 0 0 1 2-2h6z"/>',
    pen: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13 7l4 4"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.7 3.8 5.7 3.8 9s-1.3 6.3-3.8 9c-2.5-2.7-3.8-5.7-3.8-9S9.5 5.7 12 3z"/>',
    chat: '<path d="M4 5h16v11H9l-5 4z"/><path d="M8 9h8M8 12h5"/>',
    coin: '<circle cx="12" cy="12" r="9"/><path d="M15 9.5c-.5-1-1.6-1.5-3-1.5-1.7 0-3 .8-3 2s1.3 1.7 3 2 3 .8 3 2-1.3 2-3 2c-1.4 0-2.5-.5-3-1.5M12 6v2M12 16v2"/>',
    spark: '<path d="M12 3l2 5.5L19.5 10 14 12l-2 5.5L10 12 4.5 10 10 8.5z"/><path d="M19 16v4M17 18h4"/>',
    chart: '<path d="M4 20V4M4 20h16"/><path d="M8 16v-4M12 16V8M16 16v-6"/>',
    calendar: '<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M9 3v4M15 3v4"/>',
    check: '<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M8.5 12.5l2.5 2.5 5-5.5"/>',
    search: '<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><path d="M15.5 4.6a3.5 3.5 0 0 1 0 6.8M21 20c0-2.7-1.6-5-4-5.7"/>'
  };

  function icon(name, size) {
    return '<svg viewBox="0 0 24 24" width="' + (size || 24) + '" height="' + (size || 24) +
      '" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      (ICONS[name] || ICONS.spark) + '</svg>';
  }

  function isAuthed() {
    try { return sessionStorage.getItem(KEY) === 'ok'; } catch (e) { return !!window.__wosAuthed; }
  }
  function login(pin) {
    if (String(pin).trim() !== ADMIN_PIN) return false;
    window.__wosAuthed = true;
    try { sessionStorage.setItem(KEY, 'ok'); } catch (e) {}
    return true;
  }
  function logout() {
    window.__wosAuthed = false;
    try { sessionStorage.removeItem(KEY); } catch (e) {}
  }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function filter(q, cat) {
    q = (q || '').trim().toLowerCase();
    return APPS.filter(function (a) {
      if (cat && cat !== 'all' && a.cat !== cat) return false;
      if (!q) return true;
      return (a.name + a.desc + a.dept + a.id).toLowerCase().indexOf(q) > -1;
    });
  }

  function catName(id) {
    for (var i = 0; i < CATS.length; i++) if (CATS[i].id === id) return CATS[i].name;
    return id;
  }

  function totals() {
    var t = { apps: APPS.length, live: 0, hours: 0, users: 0 };
    APPS.forEach(function (a) {
      if (a.status === 'live') t.live++;
      t.hours += a.hours; t.users += a.users;
    });
    return t;
  }

  return { CATS: CATS, APPS: APPS, STATUS: STATUS, icon: icon, isAuthed: isAuthed, login: login, logout: logout, esc: esc, filter: filter, catName: catName, totals: totals };
})();
