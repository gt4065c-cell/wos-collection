// WOS 컬렉션 공통 모듈: 설정 · 앱 목록 불러오기/저장 · 로그인
// 앱 목록은 apps.json 에 있고, 관리 화면에서 저장하면 GitHub 저장소의 apps.json 을 직접 고칩니다.
window.WOS = (function () {
  var CONFIG = {
    adminPin: '9660',
    // 관리 화면에서 저장할 GitHub 저장소 (GitHub Pages가 배포하는 브랜치)
    repo: { owner: 'gt4065c-cell', name: 'wos-collection', branch: 'main', path: 'apps.json' }
  };
  var AUTH_KEY = 'wos-collection-auth';
  var TOKEN_KEY = 'wos-collection-gh-token';
  var RECENT_KEY = 'wos-collection-recent';   // 방금 저장한 목록(사이트 반영 전까지 이 브라우저에서 먼저 보여 줌)
  var LOCAL_KEY = 'wos-collection-local';     // GitHub 연결 없이 이 브라우저에만 저장한 목록
  var RECENT_MS = 10 * 60 * 1000;

  var CATS = [
    { id: 'all', name: '전체' },
    { id: 'teach', name: '교수학습' },
    { id: 'student', name: '학생지원' },
    { id: 'admin', name: '행정업무' },
    { id: 'research', name: '연구지원' },
    { id: 'idea', name: '혁신·소통' }
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
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><path d="M15.5 4.6a3.5 3.5 0 0 1 0 6.8M21 20c0-2.7-1.6-5-4-5.7"/>',
    search: '<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M12 2.5v3M12 18.5v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2.5 12h3M18.5 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/>'
  };
  // 관리 화면의 아이콘 선택지 (plus·gear·search 는 화면용이라 제외)
  var APP_ICONS = ['bulb', 'doc', 'book', 'pen', 'globe', 'chat', 'coin', 'spark', 'chart', 'calendar', 'check', 'users'];

  var api = {
    CONFIG: CONFIG, CATS: CATS, STATUS: STATUS, APP_ICONS: APP_ICONS,
    APPS: [],
    source: 'site'   // site · recent · local
  };

  function store(kind, key, val) {
    try {
      var s = kind === 'session' ? sessionStorage : localStorage;
      if (val === undefined) return s.getItem(key);
      if (val === null) s.removeItem(key); else s.setItem(key, val);
    } catch (e) { return null; }
  }

  api.icon = function (name, size) {
    return '<svg viewBox="0 0 24 24" width="' + (size || 24) + '" height="' + (size || 24) +
      '" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      (ICONS[name] || ICONS.spark) + '</svg>';
  };

  api.isAuthed = function () { return store('session', AUTH_KEY) === 'ok' || !!window.__wosAuthed; };
  api.login = function (pin) {
    if (String(pin).trim() !== CONFIG.adminPin) return false;
    window.__wosAuthed = true;
    store('session', AUTH_KEY, 'ok');
    return true;
  };
  api.logout = function () { window.__wosAuthed = false; store('session', AUTH_KEY, null); };

  api.esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };

  api.filter = function (q, cat) {
    q = (q || '').trim().toLowerCase();
    return api.APPS.filter(function (a) {
      if (cat && cat !== 'all' && a.cat !== cat) return false;
      if (!q) return true;
      return (a.name + a.desc + a.dept + a.id).toLowerCase().indexOf(q) > -1;
    });
  };

  api.catName = function (id) {
    for (var i = 0; i < CATS.length; i++) if (CATS[i].id === id) return CATS[i].name;
    return id;
  };

  api.totals = function () {
    var t = { apps: api.APPS.length, live: 0, hours: 0, users: 0 };
    api.APPS.forEach(function (a) {
      if (a.status === 'live') t.live++;
      t.hours += +a.hours || 0; t.users += +a.users || 0;
    });
    return t;
  };

  api.featured = function () {
    return api.APPS.filter(function (a) { return a.featured; })[0] || api.APPS[0];
  };

  api.hasUrl = function (a) { return !!a.url && a.url !== '#'; };

  api.nextId = function () {
    var max = 0;
    api.APPS.forEach(function (a) { var m = /(\d+)$/.exec(a.id || ''); if (m) max = Math.max(max, +m[1]); });
    return 'WOS-' + String(max + 1).padStart(3, '0');
  };

  // 사이트의 apps.json 을 읽되, 이 브라우저에서 방금 저장한 목록이 있으면 그것을 먼저 보여 줌
  api.load = function () {
    function parse(raw) { try { return JSON.parse(raw); } catch (e) { return null; } }
    var local = parse(store('local', LOCAL_KEY));
    var recent = parse(store('local', RECENT_KEY));
    return fetch(CONFIG.repo.path + '?t=' + Date.now(), { cache: 'no-store' })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (site) {
        if (local && local.apps) { api.source = 'local'; return local.apps; }
        if (recent && Date.now() - recent.at < RECENT_MS && JSON.stringify(site) !== JSON.stringify(recent.apps)) {
          api.source = 'recent'; return recent.apps;
        }
        store('local', RECENT_KEY, null);
        api.source = 'site'; return site;
      })
      .catch(function () {
        if (local && local.apps) { api.source = 'local'; return local.apps; }
        if (recent && recent.apps) { api.source = 'recent'; return recent.apps; }
        throw new Error('앱 목록(apps.json)을 불러오지 못했습니다.');
      })
      .then(function (list) { api.APPS = Array.isArray(list) ? list : []; return api.APPS; });
  };

  // GitHub 연결(토큰)
  api.token = function (v) {
    if (v === undefined) return store('local', TOKEN_KEY) || '';
    store('local', TOKEN_KEY, v ? String(v).trim() : null);
  };

  function gh(method, body) {
    var r = CONFIG.repo;
    var url = 'https://api.github.com/repos/' + r.owner + '/' + r.name + '/contents/' + r.path +
      (method === 'GET' ? '?ref=' + encodeURIComponent(r.branch) + '&t=' + Date.now() : '');
    return fetch(url, {
      method: method,
      cache: 'no-store',
      headers: {
        'Accept': 'application/vnd.github+json',
        'Authorization': 'Bearer ' + api.token(),
        'X-GitHub-Api-Version': '2022-11-28'
      },
      body: body ? JSON.stringify(body) : undefined
    }).then(function (res) {
      return res.json().catch(function () { return {}; }).then(function (data) {
        if (res.ok || (method === 'GET' && res.status === 404)) return { status: res.status, data: data };
        var msg = {
          401: 'GitHub 토큰이 맞지 않거나 기한이 지났습니다. 관리 화면에서 토큰을 다시 넣어 주세요.',
          403: '이 토큰에는 저장소에 쓸 권한이 없습니다. 토큰의 Contents 권한을 Read and write 로 바꿔 주세요.',
          404: '저장소를 찾지 못했습니다. 토큰이 ' + r.owner + '/' + r.name + ' 저장소에 접근할 수 있는지 확인해 주세요.',
          409: '다른 관리자가 먼저 저장했습니다. 새로고침한 뒤 다시 저장해 주세요.',
          422: '다른 관리자가 먼저 저장했습니다. 새로고침한 뒤 다시 저장해 주세요.'
        }[res.status] || ('GitHub 저장에 실패했습니다 (' + res.status + '): ' + (data.message || ''));
        throw new Error(msg);
      });
    });
  }

  function toBase64(text) {
    var bytes = new TextEncoder().encode(text), bin = '';
    for (var i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    return btoa(bin);
  }

  // 목록 저장: 토큰이 있으면 GitHub apps.json 에 커밋, 없으면 이 브라우저에만 저장
  api.save = function (list, message) {
    var text = JSON.stringify(list, null, 2) + '\n';
    if (!api.token()) {
      store('local', LOCAL_KEY, JSON.stringify({ at: Date.now(), apps: list }));
      api.APPS = list; api.source = 'local';
      return Promise.resolve({ where: 'local' });
    }
    return gh('GET').then(function (cur) {
      return gh('PUT', {
        message: message || 'Update apps.json',
        content: toBase64(text),
        branch: CONFIG.repo.branch,
        sha: cur.status === 200 ? cur.data.sha : undefined
      });
    }).then(function () {
      store('local', RECENT_KEY, JSON.stringify({ at: Date.now(), apps: list }));
      store('local', LOCAL_KEY, null);
      api.APPS = list; api.source = 'recent';
      return { where: 'github' };
    });
  };

  // 이 브라우저에만 있던 목록을 버리고 사이트 목록으로 되돌림
  api.discardLocal = function () { store('local', LOCAL_KEY, null); store('local', RECENT_KEY, null); };

  // 토큰 확인: 저장소 쓰기 권한이 있는지
  api.checkToken = function () {
    var r = CONFIG.repo;
    return fetch('https://api.github.com/repos/' + r.owner + '/' + r.name, {
      headers: { 'Accept': 'application/vnd.github+json', 'Authorization': 'Bearer ' + api.token() }
    }).then(function (res) {
      if (res.status === 401) throw new Error('토큰이 맞지 않습니다.');
      if (!res.ok) throw new Error('저장소에 접근할 수 없습니다 (' + res.status + ').');
      return res.json();
    }).then(function (repo) {
      if (repo.permissions && !repo.permissions.push) throw new Error('이 토큰은 읽기만 가능합니다. 쓰기 권한이 필요합니다.');
      return true;
    });
  };

  return api;
})();
