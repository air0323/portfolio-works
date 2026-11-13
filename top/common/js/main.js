// スクロールでふわっと表示
(function () {
  var items = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.classList.add('is-in'); });
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.12 });
  items.forEach(function (el) { io.observe(el); });
})();

// トップ：As Is を通過したらヘッダーを表示
(function () {
  var header = document.getElementById('siteHeader');
  var asis = document.getElementById('asis');
  if (!header || !asis) return;
  function update() {
    var passed = asis.getBoundingClientRect().top <= 56;
    header.classList.toggle('is-shown', passed);
  }
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
})();

// ページ内リンク（#付き）で開いたとき、フォントや画像の読み込みで位置がずれないよう合わせ続ける
(function () {
  if (!location.hash) return;
  var target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
  if (!target) return;
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  var done = false;
  function go() { if (!done) target.scrollIntoView({ block: 'start', behavior: 'instant' }); }
  function stop() { done = true; if (ro) ro.disconnect(); }
  // ユーザーが自分でスクロールし始めたら止める
  ['wheel', 'touchstart', 'keydown', 'mousedown'].forEach(function (ev) {
    window.addEventListener(ev, stop, { once: true, passive: true });
  });
  // ページの高さが変わるたびに合わせ直す（最大4秒）
  var ro = 'ResizeObserver' in window ? new ResizeObserver(go) : null;
  if (ro) ro.observe(document.body);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(go);
  window.addEventListener('load', go);
  go();
  setTimeout(stop, 4000);
})();

// 04 PHOTOGRAPH：MOREでゆっくり開閉／クリックでモーダル（フェード）
(function () {
  var grid = document.getElementById('photoGrid');
  var more = document.getElementById('photoMore');
  var modal = document.getElementById('photoModal');
  if (!grid || !modal) return;
  var section = document.getElementById('photo');
  var DUR = 600;

  // MORE / CLOSE：高さをアニメーションさせて開閉
  if (more) more.addEventListener('click', function () {
    var opening = !grid.classList.contains('is-open');
    var from = grid.offsetHeight;
    grid.classList.toggle('is-open', opening);
    var to = grid.offsetHeight;
    grid.style.height = from + 'px';
    grid.style.overflow = 'hidden';
    grid.offsetHeight; // reflow
    grid.style.transition = 'height ' + DUR + 'ms ease';
    grid.style.height = to + 'px';
    if (!opening) {
      // 閉じるとき：一覧が画面の上に消えないよう、PHOTOGRAPHの位置にとどまる
      grid.classList.add('is-open'); // アニメ中は中身を残す
      var top = section.getBoundingClientRect().top + window.pageYOffset - 56;
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
  var img = modal.querySelector('.photo-modal__img');
  var closeBtn = modal.querySelector('.photo-modal__close');
  var last = null, timer = null;
  var prevBtn = modal.querySelector('.photo-modal__nav--prev');
  var nextBtn = modal.querySelector('.photo-modal__nav--next');
  var countEl = modal.querySelector('.photo-modal__count');
  var group = [], idx = 0;
  function show(i) {
    idx = (i + group.length) % group.length;
    var b = group[idx];
    img.style.opacity = 0;
    setTimeout(function () {
      img.src = b.getAttribute('data-src'); img.alt = b.querySelector('img').alt;
      img.style.opacity = 1;
    }, last ? 200 : 0);
    var head = b.closest('ul').previousElementSibling;
    while (head && !head.classList.contains('gallery__head')) head = head.previousElementSibling;
    var label = head ? head.childNodes[0].textContent.trim() : '';
    countEl.textContent = label + '  ' + (idx + 1) + ' / ' + group.length;
    last = b;
  }
  function openModal(btn) {
    clearTimeout(timer);
    group = Array.prototype.slice.call(btn.closest('ul').querySelectorAll('.photo__btn'));
    last = null; show(group.indexOf(btn)); last = btn;
    modal.hidden = false; document.body.classList.add('is-modal-open');
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
  var sx = null;
  modal.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
  modal.addEventListener('touchend', function (e) {
    if (sx === null) return; var dx = e.changedTouches[0].clientX - sx; sx = null;
    if (Math.abs(dx) > 50) show(idx + (dx < 0 ? 1 : -1));
  });
  function closeModal() {
    modal.classList.remove('is-open');
    timer = setTimeout(function () {
      modal.hidden = true; img.src = ''; document.body.classList.remove('is-modal-open');
      if (last) last.focus({ preventScroll: true }); // 写真の位置からスクロールさせない
    }, 500);
  }
  grid.addEventListener('click', function (e) {
    var btn = e.target.closest('.photo__btn'); if (btn) openModal(btn);
  });
  modal.addEventListener('click', function (e) { if (e.target !== img && !e.target.closest('.photo-modal__nav')) closeModal(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !modal.hidden) closeModal(); });
})();

// トップ → 下層ページ → ブラウザの「戻る」で、元のセクションの同じ位置に戻す
(function () {
  if (!document.getElementById('business')) return; // トップページのみ
  var KEY = 'pf-return';
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="works/"]');
    if (!a) return;
    var sec = a.closest('section[id]');
    if (!sec) return;
    try {
      sessionStorage.setItem(KEY, JSON.stringify({ id: sec.id, off: window.pageYOffset - (sec.getBoundingClientRect().top + window.pageYOffset) }));
    } catch (err) {}
  });
  var nav = performance.getEntriesByType && performance.getEntriesByType('navigation')[0];
  if (!nav || nav.type !== 'back_forward') return;
  var data; try { data = JSON.parse(sessionStorage.getItem(KEY) || 'null'); } catch (err) {}
  if (!data) return;
  var sec = document.getElementById(data.id); if (!sec) return;
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  var done = false;
  function go() { if (!done) window.scrollTo({ top: sec.getBoundingClientRect().top + window.pageYOffset + data.off, behavior: 'instant' }); }
  function stop() { done = true; if (ro) ro.disconnect(); }
  ['wheel', 'touchstart', 'keydown', 'mousedown'].forEach(function (ev) { window.addEventListener(ev, stop, { once: true, passive: true }); });
  var ro = 'ResizeObserver' in window ? new ResizeObserver(go) : null;
  if (ro) ro.observe(document.body);
  window.addEventListener('load', go); go();
  setTimeout(stop, 4000);
})();
