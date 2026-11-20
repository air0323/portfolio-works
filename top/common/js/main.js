// モーダル表示中は後ろのページを固定する（iPhoneのSafariでも背景がスクロールしないよう、bodyを固定してスクロール位置を保持）
let lockedY = 0, locked = false;
function lockScroll() {
  if (locked) return; locked = true;
  lockedY = window.scrollY || window.pageYOffset;
  const b = document.body.style;
  const sbw = window.innerWidth - document.documentElement.clientWidth; // スクロールバーの幅（消えたぶん横にずれないよう補う）
  b.position = 'fixed'; b.top = -lockedY + 'px'; b.left = '0'; b.right = '0'; b.width = 'auto'; b.paddingRight = sbw ? sbw + 'px' : '';
  const hd = document.getElementById('siteHeader'); if (hd && sbw && getComputedStyle(hd).position === 'fixed') hd.style.paddingRight = sbw + 'px'; // 固定ヘッダーのみ補正
  document.body.classList.add('is-modal-open');
}
function unlockScroll() {
  if (!locked) return; locked = false;
  const b = document.body.style, html = document.documentElement;
  b.position = b.top = b.left = b.right = b.width = b.paddingRight = '';
  const hd = document.getElementById('siteHeader'); if (hd) hd.style.paddingRight = '';
  document.body.classList.remove('is-modal-open');
  const sb = html.style.scrollBehavior; html.style.scrollBehavior = 'auto'; // 元の位置へ一瞬で戻す（スムーススクロールで動いて見えないように）
  window.scrollTo(0, lockedY);
  html.style.scrollBehavior = sb;
}

// 写真モーダル共通：前へ／次への矢印を、写真（またはパネル）のすぐ横に置く
function placeModalNav(modal, target, prev, next) {
  if (modal.hidden || !target) return;
  if (window.matchMedia('(max-width: 760px)').matches) { // SPは写真の下に並べる（左右位置はCSS）
    prev.style.left = next.style.right = '';
    const fig = target.closest('figure');
    if (fig) { const f = fig.getBoundingClientRect(), mm = modal.getBoundingClientRect(); const top = (f.top + f.height / 2 + fig.offsetHeight / 2) - mm.top + 14 + 'px'; prev.style.top = next.style.top = top; }
    return;
  }
  prev.style.top = next.style.top = '';
  const r = target.getBoundingClientRect(), m = modal.getBoundingClientRect(), w = prev.offsetWidth || 52, gap = 16; // 左右ともモーダル自身の端から測って均等に
  const cx = r.left + r.width / 2, half = (target.offsetWidth || r.width) / 2; // 開くときの拡大アニメーション中でも、最終的な幅で計算
  if (!half) return;
  prev.style.left = Math.max(6, cx - half - w - gap - m.left) + 'px';
  next.style.right = Math.max(6, m.right - (cx + half) - w - gap) + 'px';
}

// スクロール表示：画像だけフェード（横並びの画像は左右から）。文章は最初から表示
(function () {
  const all = document.querySelectorAll('.reveal');
  const wide = window.innerWidth >= 760;
  const items = [];
  Array.prototype.forEach.call(all, function (el) {
    if (el.classList.contains('flow')) return; // フロー図は別の動き
    const hasImg = el.matches('img, figure') || el.querySelector('img');
    if (!hasImg) { el.classList.remove('reveal'); return; } // 文章・カード・リストは動かさない
    el.classList.add('rv-fade');
    if (wide) {
      const r = el.getBoundingClientRect(), vw = document.documentElement.clientWidth;
      if (r.width < vw * 0.55) el.classList.add((r.left + r.width / 2) < vw / 2 ? 'rv-left' : 'rv-right');
    }
    items.push(el);
  });
  if (!('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.classList.add('is-in'); });
    return;
  }
  const io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.12 });
  items.forEach(function (el) { io.observe(el); });
})();

// トップ：As Is を通過したらヘッダーを表示
(function () {
  const header = document.getElementById('siteHeader');
  const asis = document.getElementById('asis');
  if (!header || !asis) return;
  function update() {
    const passed = asis.getBoundingClientRect().top <= 56;
    header.classList.toggle('is-shown', passed);
  }
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
})();

// ページ内リンク（#付き）で開いたとき、フォントや画像の読み込みで位置がずれないよう合わせ続ける
(function () {
  if (!location.hash) return;
  const target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
  if (!target) return;
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  let done = false;
  function go() { if (!done) target.scrollIntoView({ block: 'start', behavior: 'instant' }); }
  const ro = 'ResizeObserver' in window ? new ResizeObserver(go) : null;
  function stop() { done = true; if (ro) ro.disconnect(); }
  // ユーザーが自分でスクロールし始めたら止める
  ['wheel', 'touchstart', 'keydown', 'mousedown'].forEach(function (ev) {
    window.addEventListener(ev, stop, { once: true, passive: true });
  });
  // ページの高さが変わるたびに合わせ直す（最大4秒）
  if (ro) ro.observe(document.body);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(go);
  window.addEventListener('load', go);
  go();
  setTimeout(stop, 4000);
})();

// 04 PHOTOGRAPH：MOREでゆっくり開閉／クリックでモーダル（フェード）
(function () {
  const grid = document.getElementById('photoGrid');
  const more = document.getElementById('photoMore');
  const modal = document.getElementById('photoModal');
  if (!grid || !modal) return;
  const section = document.getElementById('photo');
  const DUR = 600;

  // MORE / CLOSE：高さをアニメーションさせて開閉
  if (more) more.addEventListener('click', function () {
    const opening = !grid.classList.contains('is-open');
    const from = grid.offsetHeight;
    grid.classList.toggle('is-open', opening);
    const to = grid.offsetHeight;
    grid.style.height = from + 'px';
    grid.style.overflow = 'hidden';
    grid.offsetHeight; // reflow
    grid.style.transition = 'height ' + DUR + 'ms ease';
    grid.style.height = to + 'px';
    if (!opening) {
      // 閉じるとき：一覧が画面の上に消えないよう、PHOTOGRAPHの位置にとどまる
      grid.classList.add('is-open'); // アニメ中は中身を残す
      const top = section.getBoundingClientRect().top + window.pageYOffset - 56;
      if (window.pageYOffset > top) window.scrollTo({ top: top, behavior: 'smooth' });
    }
    setTimeout(function () {
      grid.classList.toggle('is-open', opening);
      grid.style.transition = grid.style.height = grid.style.overflow = '';
    }, DUR);
    more.textContent = opening ? 'CLOSE' : 'MORE';
    more.setAttribute('aria-expanded', opening);
  });

  // モーダル：ゆっくりフェードイン・アウト
  const img = modal.querySelector('.photo-modal__img');
  const closeBtn = modal.querySelector('.photo-modal__close');
  let last = null, timer = null;
  const prevBtn = modal.querySelector('.photo-modal__nav--prev');
  const nextBtn = modal.querySelector('.photo-modal__nav--next');
  const countEl = modal.querySelector('.photo-modal__count');
  let group = [], idx = 0;
  function show(i) {
    idx = (i + group.length) % group.length;
    const b = group[idx];
    img.style.opacity = 0;
    setTimeout(function () {
      img.src = b.getAttribute('data-src'); img.alt = b.querySelector('img').alt;
      img.style.opacity = 1;
      if (img.complete) placeModalNav(modal, img, prevBtn, nextBtn); else img.onload = function () { placeModalNav(modal, img, prevBtn, nextBtn); };
    }, last ? 200 : 0);
    let head = b.closest('ul').previousElementSibling;
    while (head && !head.classList.contains('gallery__head')) head = head.previousElementSibling;
    const label = head ? head.childNodes[0].textContent.trim() : '';
    const cap = b.getAttribute('data-caption'); // SOBAは店名も表示
    countEl.textContent = label + '  ' + (idx + 1) + ' / ' + group.length + (cap ? '\n' + cap : '');
    last = b;
  }
  function openModal(btn) {
    clearTimeout(timer);
    group = Array.prototype.slice.call(btn.closest('ul').querySelectorAll('.photo__btn'));
    last = null; show(group.indexOf(btn)); last = btn;
    modal.hidden = false; lockScroll();
    requestAnimationFrame(function () { requestAnimationFrame(function () { modal.classList.add('is-open'); }); });
    closeBtn.focus({ preventScroll: true });
  }
  prevBtn.addEventListener('click', function (e) { e.stopPropagation(); show(idx - 1); });
  nextBtn.addEventListener('click', function (e) { e.stopPropagation(); show(idx + 1); });
  document.addEventListener('keydown', function (e) {
    if (modal.hidden) return;
    if (e.key === 'ArrowLeft') show(idx - 1);
    if (e.key === 'ArrowRight') show(idx + 1);
  });
  // スワイプ（スマホ）
  let sx = null;
  modal.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
  modal.addEventListener('touchend', function (e) {
    if (sx === null) return; const dx = e.changedTouches[0].clientX - sx; sx = null;
    if (Math.abs(dx) > 50) show(idx + (dx < 0 ? 1 : -1));
  });
  function closeModal() {
    modal.classList.remove('is-open');
    timer = setTimeout(function () {
      modal.hidden = true; img.removeAttribute('src'); unlockScroll();
      if (last) last.focus({ preventScroll: true }); // 写真の位置からスクロールさせない
    }, 500);
  }
  window.addEventListener('resize', function () { placeModalNav(modal, img, prevBtn, nextBtn); });
  grid.addEventListener('click', function (e) {
    const btn = e.target.closest('.photo__btn'); if (btn) openModal(btn);
  });
  modal.addEventListener('click', function (e) { if (e.target !== img && !e.target.closest('.photo-modal__nav')) closeModal(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !modal.hidden) closeModal(); });
})();

// 04 PHOTOGRAPH：SOBA。写真にマウスを乗せるとMORE、クリックで紹介文をモーダル表示
(function () {
  const modal = document.getElementById('sobaModal');
  if (!modal) return;
  const items = Array.prototype.slice.call(document.querySelectorAll('.soba__item'));
  const img = modal.querySelector('.soba-modal__img');
  const body = modal.querySelector('.soba-modal__body');
  const noEl = modal.querySelector('.soba-modal__no');
  const nameEl = modal.querySelector('.soba-modal__name');
  const catchEl = modal.querySelector('.soba-modal__catch');
  const detailEl = modal.querySelector('.soba-modal__detail');
  const closeBtn = modal.querySelector('.soba-modal__close');
  let idx = 0, opener = null, timer = null, isOpen = false;
  function fill(i) {
    idx = (i + items.length) % items.length;
    const li = items[idx], pic = li.querySelector('.soba__btn img');
    img.src = pic.getAttribute('src'); img.alt = pic.alt;
    noEl.textContent = li.querySelector('.soba__no').textContent + ' / ' + String(items.length).padStart(2, '0');
    nameEl.innerHTML = li.querySelector('.soba__name').innerHTML;
    catchEl.innerHTML = li.querySelector('.soba__catch').innerHTML; // 改行（<br>）も反映
    detailEl.innerHTML = li.querySelector('.soba__detail').innerHTML;
    body.scrollTop = 0; modal.querySelector('.soba-modal__panel').scrollTop = 0;
    requestAnimationFrame(placeNav);
  }
  const panel = modal.querySelector('.soba-modal__panel'), sPrev = modal.querySelector('.soba-modal__nav--prev'), sNext = modal.querySelector('.soba-modal__nav--next');
  function placeNav() { placeModalNav(modal, panel, sPrev, sNext); }
  img.addEventListener('load', placeNav);
  window.addEventListener('resize', placeNav);
  function show(i) {
    if (!isOpen) { fill(i); return; }
    img.style.opacity = 0; body.style.opacity = 0;
    setTimeout(function () { fill(i); img.style.opacity = 1; body.style.opacity = 1; }, 200);
  }
  function open(i, btn) {
    clearTimeout(timer); opener = btn; fill(i); isOpen = true;
    modal.hidden = false; lockScroll(); placeNav();
    requestAnimationFrame(function () { requestAnimationFrame(function () { modal.classList.add('is-open'); }); });
    closeBtn.focus({ preventScroll: true });
  }
  function close() {
    isOpen = false; modal.classList.remove('is-open');
    timer = setTimeout(function () {
      modal.hidden = true; img.removeAttribute('src'); unlockScroll();
      if (opener) opener.focus({ preventScroll: true });
    }, 500);
  }
  items.forEach(function (li, i) {
    const btn = li.querySelector('.soba__btn');
    btn.addEventListener('click', function () { open(i, btn); });
  });
  closeBtn.addEventListener('click', close);
  modal.querySelector('.soba-modal__nav--prev').addEventListener('click', function () { show(idx - 1); });
  modal.querySelector('.soba-modal__nav--next').addEventListener('click', function () { show(idx + 1); });
  modal.addEventListener('click', function (e) { if (e.target === modal) close(); });
  document.addEventListener('keydown', function (e) {
    if (modal.hidden) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') show(idx - 1);
    if (e.key === 'ArrowRight') show(idx + 1);
  });
  // スワイプ（スマホ）
  let sx = null, sy = null;
  modal.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
  modal.addEventListener('touchend', function (e) {
    if (sx === null) return; const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy; sx = null;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) show(idx + (dx < 0 ? 1 : -1));
  });
})();

// トップ → 下層ページ → ブラウザの「戻る」で、元のセクションの同じ位置に戻す
(function () {
  if (!document.getElementById('business')) return; // トップページのみ
  const KEY = 'pf-return';
  document.addEventListener('click', function (e) {
    const a = e.target.closest('a[href^="works/"]');
    if (!a) return;
    const sec = a.closest('section[id]');
    if (!sec) return;
    try {
      sessionStorage.setItem(KEY, JSON.stringify({ id: sec.id, off: window.pageYOffset - (sec.getBoundingClientRect().top + window.pageYOffset) }));
    } catch (err) {}
  });
  const nav = performance.getEntriesByType && performance.getEntriesByType('navigation')[0];
  if (!nav || nav.type !== 'back_forward') return;
  let data; try { data = JSON.parse(sessionStorage.getItem(KEY) || 'null'); } catch (err) {}
  if (!data) return;
  const sec = document.getElementById(data.id); if (!sec) return;
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  let done = false;
  function go() { if (!done) window.scrollTo({ top: sec.getBoundingClientRect().top + window.pageYOffset + data.off, behavior: 'instant' }); }
  const ro = 'ResizeObserver' in window ? new ResizeObserver(go) : null;
  function stop() { done = true; if (ro) ro.disconnect(); }
  ['wheel', 'touchstart', 'keydown', 'mousedown'].forEach(function (ev) { window.addEventListener(ev, stop, { once: true, passive: true }); });
  if (ro) ro.observe(document.body);
  window.addEventListener('load', go); go();
  setTimeout(stop, 4000);
})();

// 見出しのふわっと表示 ＋ Before／After フローを左から順に表示
(function () {
  // BUSINESSの4事例は高さが少ないため、見出し・フロー図は動かさず最初から表示（画像のフェードのみ）
  if (document.body.classList.contains('page-biz')) {
    document.querySelectorAll('.flow.reveal').forEach(function (f) { f.classList.remove('reveal'); });
    return;
  }
  if (!window.matchMedia || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.2 });

  // 見出し：下からふわっと表示（元の動き）
  const heads = document.querySelectorAll('.asis__en, .tobe__en, .chapter__copy, .profile__lead, .case-hero__catch, .cw__catch, .section__head');
  heads.forEach(function (h) {
    h.classList.remove('reveal', 'is-in');
    h.classList.add('rv-up');
    io.observe(h);
  });

  // フロー図：Before → After の順に、左から1つずつ
  document.querySelectorAll('.flow').forEach(function (f) {
    let d = 0;
    Array.prototype.forEach.call(f.children, function (c) {
      if (c.classList.contains('chev')) {
        Array.prototype.forEach.call(c.children, function (s) { s.classList.add('fl-item'); s.style.setProperty('--d', d + 's'); d += 0.12; });
        d += 0.15;
      } else {
        c.classList.add('fl-item', c.classList.contains('flow__row') ? 'fl-row' : 'fl-fade');
        c.style.setProperty('--d', d + 's'); d += 0.1;
      }
    });
    f.classList.add('flow--seq');
    io.observe(f);
  });
})();
