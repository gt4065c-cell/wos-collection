// WOS 컬렉션 화면: PIN 로그인 · 홈 · 모든 앱 · 앱 관리
(function () {
  var W = window.WOS, root = document.getElementById('app');
  var state = { q: '', cat: 'all', view: 'home', loaded: false, loadError: '' };
  var pin = '';

  // 관리자가 넣은 주소는 http(s) 로 시작할 때만 링크로 씀
  function safeUrl(u) { return /^https?:\/\//i.test(u || '') ? u : ''; }
  function canOpen(a) { return !!safeUrl(a.url) && a.status !== 'soon'; }
  function byId(id) { return W.APPS.filter(function (x) { return x.id === id; })[0]; }

  var tt;
  function toast(msg, ms) {
    var el = document.querySelector('.toast');
    if (!el) { el = document.createElement('div'); el.className = 'toast'; el.setAttribute('role', 'status'); document.body.appendChild(el); }
    el.textContent = msg; el.hidden = false;
    clearTimeout(tt); tt = setTimeout(function () { el.hidden = true; }, ms || 2600);
  }

  /* ---------- 로그인 ---------- */
  function renderLogin(msg) {
    root.innerHTML =
      '<div class="lock">' +
        '<div class="lock-logo">WOS</div>' +
        '<div><h1>WOS 컬렉션</h1><p>관리자 PIN 4자리를 눌러 주세요</p></div>' +
        '<div class="dots' + (msg ? ' shake' : '') + '" aria-label="입력한 자리수 ' + pin.length + '">' +
          [0, 1, 2, 3].map(function (i) { return '<i class="' + (i < pin.length ? 'on' : '') + '"></i>'; }).join('') + '</div>' +
        '<div class="msg" role="alert">' + (msg || '') + '</div>' +
        '<div class="pad">' + ['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(function (n) { return '<button type="button" data-k="' + n + '">' + n + '</button>'; }).join('') +
          '<button type="button" class="fn" data-k="clr">지우기</button><button type="button" data-k="0">0</button><button type="button" class="fn" data-k="del">←</button></div>' +
        '<p class="hint">키보드 숫자로도 입력할 수 있습니다</p>' +
      '</div>';
  }

  function press(k) {
    if (k === 'del') pin = pin.slice(0, -1);
    else if (k === 'clr') pin = '';
    else if (pin.length < 4) pin += k;
    if (pin.length === 4) {
      var ok = W.login(pin); pin = '';
      if (ok) return render();
      return renderLogin('PIN이 맞지 않습니다');
    }
    renderLogin();
  }

  /* ---------- 홈 · 모든 앱 ---------- */
  function appIcon(a) {
    return '<button type="button" class="app ' + a.status + '" data-id="' + W.esc(a.id) + '">' +
      '<span class="squircle c-' + W.esc(a.cat) + '">' + W.icon(a.icon, 30) +
      (a.status !== 'live' ? '<span class="badge">' + (a.status === 'beta' ? 'β 시범' : '준비 중') + '</span>' : '') + '</span>' +
      '<span class="nm">' + W.esc(a.name) + '</span></button>';
  }

  function drawer() {
    var list = W.filter(state.q, state.cat);
    if (!W.APPS.length) return '<div class="empty">아직 등록된 앱이 없습니다. 아래 \'관리\'에서 첫 앱을 추가해 주세요.</div>';
    return list.length ? list.map(appIcon).join('') : '<div class="empty">찾는 앱이 없어요. 다른 단어로 검색해 보세요.</div>';
  }

  function hoursText(h) { return h >= 1000 ? Math.round(h / 100) / 10 + '천' : String(h); }

  function bento() {
    var t = W.totals(), f = W.featured();
    var feat = f
      ? '<div class="tile feature"><div><div class="tag">이번 주 추천 · ' + W.esc(f.id) + '</div><h2>' + W.esc(f.name) + '</h2><p>' + W.esc(f.desc) + '</p></div>' +
          (canOpen(f) ? '<a href="' + W.esc(f.url) + '" target="_blank" rel="noopener">열어 보기</a>' : '<button type="button" data-id="' + W.esc(f.id) + '" class="app-open">자세히 보기</button>') + '</div>'
      : '<div class="tile feature"><div><div class="tag">추천 앱</div><h2>첫 앱을 등록해 주세요</h2><p>관리 화면에서 앱 주소를 추가하면 여기에 보입니다.</p></div><button type="button" data-view="manage">앱 추가하기</button></div>';
    return '<section class="bento">' + feat +
      '<div class="tile num"><b>' + t.apps + '</b><span>등록된 앱</span></div>' +
      '<div class="tile num"><b>' + t.live + '</b><span>운영 중</span></div>' +
      '<div class="tile num"><b>' + t.users.toLocaleString() + '</b><span>이번 학기 사용자</span></div>' +
      '<div class="tile num"><b>' + hoursText(t.hours) + '</b><span>연간 절감 시간</span></div>' +
    '</section>';
  }

  function dock() {
    return '<nav class="dock" aria-label="화면">' + [['home', '홈'], ['all', '모든 앱'], ['manage', '관리']].map(function (v) {
      return '<button type="button" data-view="' + v[0] + '" class="' + (state.view === v[0] ? 'on' : '') + '">' + v[1] + '</button>';
    }).join('') + '</nav>';
  }

  function renderHub() {
    if (!state.loaded) {
      root.innerHTML = '<div class="empty">' + (state.loadError ? W.esc(state.loadError) + ' 잠시 뒤 새로고침해 주세요.' : '앱 목록을 불러오는 중…') + '</div>';
      return;
    }
    var top = '<div class="top"><div><div class="hello">우송대학교 AX 업무지원</div><h1>WOS 컬렉션</h1></div><button class="me" id="logout" type="button" title="로그아웃">나가기</button></div>';
    if (state.view === 'manage') { root.innerHTML = top + manageView() + dock(); bindCommon(); bindManage(); return; }

    root.innerHTML = top + (state.view === 'home' ? bento() : '') +
      '<label class="search">' + W.icon('search', 20) + '<input id="q" type="search" placeholder="앱 검색" value="' + W.esc(state.q) + '" aria-label="앱 검색"></label>' +
      '<div class="tabs">' + W.CATS.map(function (c) {
        return '<button type="button" data-cat="' + c.id + '" aria-pressed="' + (state.cat === c.id) + '">' + c.name + '</button>';
      }).join('') + '</div>' +
      '<section class="drawer" id="drawer">' + drawer() + '</section>' + dock();

    var q = document.getElementById('q');
    q.addEventListener('input', function () { state.q = q.value; document.getElementById('drawer').innerHTML = drawer(); });
    root.querySelectorAll('[data-cat]').forEach(function (b) { b.addEventListener('click', function () { state.cat = b.dataset.cat; renderHub(); }); });
    bindCommon();
  }

  function bindCommon() {
    root.querySelectorAll('[data-view]').forEach(function (b) {
      b.addEventListener('click', function () { state.view = b.dataset.view; renderHub(); window.scrollTo(0, 0); });
    });
    document.getElementById('logout').addEventListener('click', function () { W.logout(); renderLogin(); });
  }

  function openSheet(a) {
    var bg = document.createElement('div');
    bg.className = 'sheet-bg';
    bg.innerHTML = '<div class="sheet" role="dialog" aria-label="' + W.esc(a.name) + '"><div class="grab"></div>' +
      '<div class="sheet-head"><span class="squircle c-' + W.esc(a.cat) + '">' + W.icon(a.icon, 30) + '</span><div><h2>' + W.esc(a.name) + '</h2><div class="sub">' + W.esc(a.id) + ' · ' + W.esc(a.dept || '담당 미정') + ' · ' + W.STATUS[a.status] + '</div></div></div>' +
      '<p>' + W.esc(a.desc) + '</p>' +
      '<div class="facts"><div><b>' + W.catName(a.cat) + '</b><span>분류</span></div><div><b>' + (a.users ? (+a.users).toLocaleString() : '—') + '</b><span>사용자</span></div><div><b>' + (a.hours ? (+a.hours).toLocaleString() + 'h' : '—') + '</b><span>연간 절감</span></div></div>' +
      (canOpen(a) ? '<a class="cta" href="' + W.esc(a.url) + '" target="_blank" rel="noopener">앱 열기</a>' : '<button class="cta off" type="button" disabled>' + (a.status === 'soon' ? '개발 중인 앱입니다' : '주소 연결 전입니다') + '</button>') +
      '</div>';
    bg.addEventListener('click', function (e) { if (e.target === bg) bg.remove(); });
    document.body.appendChild(bg);
  }

  /* ---------- 관리 ---------- */
  function sourceNotice() {
    var token = !!W.token();
    if (W.source === 'local') {
      return '<div class="notice"><p><b>이 브라우저에만 저장된 목록입니다.</b> 다른 사람에게는 아직 보이지 않습니다. 아래에서 GitHub를 연결한 뒤 \'사이트에 올리기\'를 누르세요.</p>' +
        (token ? '<button class="btn small" type="button" id="publish">사이트에 올리기</button>' : '') +
        '<button class="btn small light" type="button" id="discard">변경 취소</button></div>';
    }
    if (W.source === 'recent') {
      return '<div class="notice ok"><p><b>저장했습니다.</b> 사이트에 반영되기까지 1~2분 걸립니다. 그동안 이 브라우저에는 새 목록이 먼저 보입니다.</p></div>';
    }
    return token ? '' : '<div class="notice"><p>GitHub가 연결되지 않아 지금 고치는 내용은 <b>이 브라우저에만</b> 저장됩니다. 모두에게 보이게 하려면 아래에서 GitHub를 연결하세요.</p></div>';
  }

  function manageView() {
    var token = W.token();
    var r = W.CONFIG.repo;
    var rows = W.APPS.map(function (a, i) {
      return '<div class="mrow">' +
        '<span class="squircle c-' + W.esc(a.cat) + '">' + W.icon(a.icon, 22) + '</span>' +
        '<div style="min-width:0"><b>' + W.esc(a.name) + (a.featured ? '<span class="feat-tag">추천</span>' : '') + '</b>' +
          '<div class="sub">' + W.esc(a.id) + ' · ' + W.STATUS[a.status] + ' · ' + (safeUrl(a.url) ? W.esc(a.url) : '주소 없음') + '</div></div>' +
        '<div class="acts"><button class="btn small light" type="button" data-edit="' + i + '">수정</button>' +
          '<button class="btn small light" type="button" data-del="' + i + '">삭제</button></div>' +
      '</div>';
    }).join('');
    return '<section class="manage">' +
      '<div class="m-head"><h2>앱 관리</h2><button class="btn" type="button" id="add">' + W.icon('plus', 18) + '앱 추가</button></div>' +
      sourceNotice() +
      '<div class="rows">' + (rows || '<div class="empty">등록된 앱이 없습니다. \'앱 추가\'를 눌러 첫 앱을 등록하세요.</div>') + '</div>' +
      '<div class="gh"><h3>GitHub 연결 ' + (token ? '<span class="state on">· 연결됨</span>' : '<span class="state">· 연결 안 됨</span>') + '</h3>' +
        '<p>앱 목록은 GitHub 저장소 <b>' + r.owner + '/' + r.name + '</b>의 apps.json 파일에 저장됩니다. 연결은 관리자 한 사람이 한 번만 하면 되고, 토큰은 이 브라우저에만 보관됩니다.</p>' +
        (token
          ? '<div class="line"><button class="btn small light" type="button" id="tok-check">연결 확인</button><button class="btn small light" type="button" id="tok-clear">연결 해제</button><span class="state" id="tok-state"></span></div>'
          : '<ol><li>GitHub → Settings → Developer settings → Fine-grained tokens → Generate new token</li>' +
              '<li>Repository access에서 <b>' + r.name + '</b>만 고르기</li>' +
              '<li>Permissions → Contents를 <b>Read and write</b>로 바꾸고 만들기</li>' +
              '<li>만들어진 토큰(github_pat_…)을 아래에 붙여 넣기</li></ol>' +
            '<div class="line"><input class="in" id="tok" type="password" placeholder="github_pat_…" autocomplete="off" aria-label="GitHub 토큰"><button class="btn small" type="button" id="tok-save">연결</button></div>' +
            '<span class="state" id="tok-state"></span>') +
      '</div>' +
    '</section>';
  }

  function persist(list, message, okMsg) {
    return W.save(list, message).then(function (res) {
      toast(res.where === 'github' ? okMsg + ' 1~2분 뒤 사이트에 반영됩니다.' : okMsg + ' (이 브라우저에만 저장)', 3200);
      renderHub();
    }).catch(function (e) { toast(e.message, 5000); throw e; });
  }

  function bindManage() {
    document.getElementById('add').addEventListener('click', function () { openForm(null); });
    root.querySelectorAll('[data-edit]').forEach(function (b) {
      b.addEventListener('click', function () { openForm(+b.dataset.edit); });
    });
    root.querySelectorAll('[data-del]').forEach(function (b) {
      b.addEventListener('click', function () {
        var i = +b.dataset.del, a = W.APPS[i];
        if (!b.classList.contains('danger')) {   // 한 번 더 눌러야 삭제
          b.classList.remove('light'); b.classList.add('danger'); b.textContent = '정말 삭제';
          setTimeout(function () { if (b.isConnected) { b.classList.add('light'); b.classList.remove('danger'); b.textContent = '삭제'; } }, 4000);
          return;
        }
        b.disabled = true;
        var list = W.APPS.slice(); list.splice(i, 1);
        persist(list, 'Remove ' + a.id + ' ' + a.name, a.name + '을(를) 삭제했습니다.').catch(function () { b.disabled = false; });
      });
    });

    var pub = document.getElementById('publish');
    if (pub) pub.addEventListener('click', function () {
      pub.disabled = true;
      persist(W.APPS.slice(), 'Update app list', '사이트에 올렸습니다.').catch(function () { pub.disabled = false; });
    });
    var dis = document.getElementById('discard');
    if (dis) dis.addEventListener('click', function () {
      W.discardLocal();
      W.load().then(function () { toast('이 브라우저의 변경을 취소했습니다.'); renderHub(); });
    });

    var st = document.getElementById('tok-state');
    function check() {
      st.className = 'state'; st.textContent = '확인 중…';
      return W.checkToken().then(function () { st.className = 'state on'; st.textContent = '쓰기 권한 확인됨'; })
        .catch(function (e) { st.className = 'state err'; st.textContent = e.message; throw e; });
    }
    var save = document.getElementById('tok-save');
    if (save) save.addEventListener('click', function () {
      var v = document.getElementById('tok').value.trim();
      if (!v) { st.className = 'state err'; st.textContent = '토큰을 붙여 넣어 주세요.'; return; }
      W.token(v);
      check().then(function () { toast('GitHub를 연결했습니다.'); renderHub(); }).catch(function () { W.token(''); });
    });
    var c = document.getElementById('tok-check');
    if (c) c.addEventListener('click', function () { check().catch(function () {}); });
    var clr = document.getElementById('tok-clear');
    if (clr) clr.addEventListener('click', function () { W.token(''); toast('GitHub 연결을 해제했습니다.'); renderHub(); });
  }

  function openForm(index) {
    var editing = index !== null;
    var a = editing ? W.APPS[index] : { id: W.nextId(), name: '', url: '', desc: '', cat: 'admin', status: 'live', icon: 'spark', dept: '', users: 0, hours: 0, featured: false };
    function opts(pairs, cur) {
      return pairs.map(function (p) { return '<option value="' + p[0] + '"' + (p[0] === cur ? ' selected' : '') + '>' + p[1] + '</option>'; }).join('');
    }
    var bg = document.createElement('div');
    bg.className = 'sheet-bg';
    bg.innerHTML = '<form class="sheet form" role="dialog" aria-label="' + (editing ? '앱 수정' : '앱 추가') + '" novalidate><div class="grab"></div>' +
      '<div class="sheet-head"><div><h2>' + (editing ? '앱 수정' : '새 앱 추가') + '</h2><div class="sub">' + W.esc(a.id) + '</div></div></div>' +
      '<div class="field"><label for="f-name">앱 이름</label><input class="in" id="f-name" maxlength="30" value="' + W.esc(a.name) + '" placeholder="예: 회의록 자동 요약"></div>' +
      '<div class="field"><label for="f-url">앱 주소</label><input class="in" id="f-url" type="url" inputmode="url" value="' + W.esc(safeUrl(a.url)) + '" placeholder="https://"><small>비워 두면 \'주소 연결 전\'으로 표시됩니다.</small></div>' +
      '<div class="field"><label for="f-desc">한 줄 설명</label><textarea class="in" id="f-desc" maxlength="80" placeholder="이 앱으로 무엇을 할 수 있는지 한 문장으로">' + W.esc(a.desc) + '</textarea></div>' +
      '<div class="two">' +
        '<div class="field"><label for="f-cat">분류</label><select class="in" id="f-cat">' + opts(W.CATS.slice(1).map(function (c) { return [c.id, c.name]; }), a.cat) + '</select></div>' +
        '<div class="field"><label for="f-status">상태</label><select class="in" id="f-status">' + opts([['live', '운영 중'], ['beta', '시범 운영'], ['soon', '개발 중']], a.status) + '</select></div>' +
      '</div>' +
      '<div class="field"><label for="f-dept">담당 부서</label><input class="in" id="f-dept" maxlength="20" value="' + W.esc(a.dept) + '" placeholder="예: 기획처"></div>' +
      '<div class="field"><span class="lbl" id="f-icon-l">아이콘</span><div class="icons" role="radiogroup" aria-labelledby="f-icon-l">' +
        W.APP_ICONS.map(function (n) {
          return '<label title="' + n + '"><input type="radio" name="f-icon" value="' + n + '"' + (n === a.icon ? ' checked' : '') + '><span>' + W.icon(n, 22) + '</span></label>';
        }).join('') + '</div></div>' +
      '<div class="two">' +
        '<div class="field"><label for="f-users">사용자 수</label><input class="in" id="f-users" type="number" min="0" inputmode="numeric" value="' + (+a.users || 0) + '"></div>' +
        '<div class="field"><label for="f-hours">연간 절감 시간</label><input class="in" id="f-hours" type="number" min="0" inputmode="numeric" value="' + (+a.hours || 0) + '"></div>' +
      '</div>' +
      '<label class="check"><input type="checkbox" id="f-feat"' + (a.featured ? ' checked' : '') + '> 홈 화면 \'이번 주 추천\'에 보이기</label>' +
      '<p class="form-err" id="f-err" role="alert"></p>' +
      '<div class="form-acts"><button class="btn light" type="button" id="f-cancel">취소</button><button class="btn" type="submit" id="f-save">' + (editing ? '수정 저장' : '추가하기') + '</button></div>' +
    '</form>';
    document.body.appendChild(bg);
    var form = bg.querySelector('form');
    function close() { bg.remove(); }
    bg.addEventListener('click', function (e) { if (e.target === bg) close(); });
    form.querySelector('#f-cancel').addEventListener('click', close);
    form.querySelector('#f-name').focus();

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var v = function (id) { return form.querySelector('#' + id).value.trim(); };
      var err = form.querySelector('#f-err');
      var url = v('f-url');
      if (!v('f-name')) { err.textContent = '앱 이름을 입력해 주세요.'; return form.querySelector('#f-name').focus(); }
      if (url && !/^https?:\/\/[^\s.]+\.[^\s]+$/i.test(url)) { err.textContent = '주소는 https:// 로 시작하는 전체 주소로 입력해 주세요.'; return form.querySelector('#f-url').focus(); }
      if (!v('f-desc')) { err.textContent = '한 줄 설명을 입력해 주세요.'; return form.querySelector('#f-desc').focus(); }
      var icon = form.querySelector('input[name="f-icon"]:checked');
      var app = {
        id: a.id, name: v('f-name'), cat: v('f-cat'), status: v('f-status'), icon: icon ? icon.value : 'spark',
        dept: v('f-dept'), hours: Math.max(0, parseInt(v('f-hours'), 10) || 0), users: Math.max(0, parseInt(v('f-users'), 10) || 0),
        url: url || '#', desc: v('f-desc')
      };
      if (form.querySelector('#f-feat').checked) app.featured = true;
      var list = W.APPS.map(function (x) {
        if (!app.featured || !x.featured) return x;
        var c = Object.assign({}, x); delete c.featured; return c;   // 추천은 한 앱만
      });
      if (editing) list[index] = app; else list.push(app);
      var btn = form.querySelector('#f-save');
      btn.disabled = true; btn.textContent = '저장 중…'; err.textContent = '';
      persist(list, (editing ? 'Update ' : 'Add ') + app.id + ' ' + app.name, app.name + (editing ? '을(를) 수정했습니다.' : '을(를) 추가했습니다.'))
        .then(close)
        .catch(function (e2) { err.textContent = e2.message; btn.disabled = false; btn.textContent = editing ? '수정 저장' : '추가하기'; });
    });
  }

  /* ---------- 공통 ---------- */
  root.addEventListener('click', function (e) {
    var k = e.target.closest('[data-k]'); if (k) return press(k.dataset.k);
    var b = e.target.closest('.app, .app-open'); if (!b) return;
    var a = byId(b.dataset.id); if (a) openSheet(a);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { var s = document.querySelectorAll('.sheet-bg'); if (s.length) s[s.length - 1].remove(); }
    if (W.isAuthed()) return;
    if (/^[0-9]$/.test(e.key)) press(e.key);
    else if (e.key === 'Backspace') press('del');
  });

  function render() { W.isAuthed() ? renderHub() : renderLogin(); }

  W.load().then(function () { state.loaded = true; }).catch(function (e) { state.loadError = e.message; })
    .then(function () { if (W.isAuthed()) renderHub(); });
  render();
})();
