/* =========================================================
   facility-slider.js
   設備案内セクションの画像を、横にエンドレスで流し続ける

   - 外部ライブラリ不要（jQuery / Swiper なし）
   - 対象：.facility-slider の中の .swiper-wrapper（HTMLは既存のまま）
   - 画像を自動で複製して、つなぎ目なしでループさせる
   - 画面外にある時・タブが裏にある時は止めて、負荷を減らす
   - 「動きを減らす」設定のユーザーには動かさない
========================================================= */
(function () {
	'use strict';

	// ===== 設定 =====
	const SPEED = 50;          // 流れる速さ（px/秒）。大きいほど速い
	const PAUSE_ON_HOVER = false; // true にするとマウスを乗せている間は止まる
	// ================

	const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	if (reduce) { return; }

	// ※ <head> で読み込まれても動くよう、要素の取得は init()（DOM読み込み後）で行う
	let slider = null;
	let track = null;
	let originals = [];

	let loopWidth = 0;   // 元の画像1セット分の長さ（スタート位置から複製の先頭までの距離）
	let pos = 0;         // 現在の移動量（px）
	let last = null;     // 前フレームの時刻
	let running = false; // 動かす条件を満たしているか
	let hovering = false;
	let rafId = null;

	// ---------- 複製して必要な長さまで並べる ----------
	function clearClones() {
		Array.prototype.forEach.call(track.querySelectorAll('[data-clone]'), function (el) {
			track.removeChild(el);
		});
	}

	function build() {
		clearClones();

		// 1セット分の長さ ＝ 複製1つ目の左端 − 元の1つ目の左端（gap込みで正確に測る）
		const probe = originals[0].cloneNode(true);
		probe.setAttribute('data-clone', '');
		track.appendChild(probe);
		loopWidth = probe.offsetLeft - originals[0].offsetLeft;
		track.removeChild(probe);

		if (loopWidth <= 0) { return false; }

		// 画面幅 + 1セット分を満たすまで、元の画像セットを複製して並べる
		const sets = Math.ceil(slider.clientWidth / loopWidth) + 1;
		for (let s = 0; s < sets; s++) {
			originals.forEach(function (el) {
				const c = el.cloneNode(true);
				c.setAttribute('data-clone', '');
				c.setAttribute('aria-hidden', 'true');
				const img = c.querySelector('img');
				if (img) { img.setAttribute('alt', ''); }
				track.appendChild(c);
			});
		}
		pos = pos % loopWidth;
		return true;
	}

	// ---------- アニメーション ----------
	function frame(now) {
		if (last === null) { last = now; }
		const dt = (now - last) / 1000;
		last = now;

		if (!(PAUSE_ON_HOVER && hovering)) {
			pos += SPEED * dt;
			if (pos >= loopWidth) { pos -= loopWidth; }   // 1セット流れたら頭に戻す（見た目は同じ）
			track.style.transform = 'translate3d(' + (-pos) + 'px, 0, 0)';
		}
		rafId = window.requestAnimationFrame(frame);
	}

	function start() {
		if (rafId !== null || !loopWidth) { return; }
		last = null;
		rafId = window.requestAnimationFrame(frame);
	}

	function stop() {
		if (rafId !== null) {
			window.cancelAnimationFrame(rafId);
			rafId = null;
		}
	}

	function update() {
		if (running && !document.hidden) { start(); } else { stop(); }
	}

	// ---------- 初期化 ----------
	function init() {
		slider = document.querySelector('.facility-slider');
		if (!slider) { return; }
		track = slider.querySelector('.swiper-wrapper');
		if (!track || !track.children.length) { return; }
		originals = Array.prototype.slice.call(track.children);

		// トラックの設定（CSS側を変更しなくて済むようにJSで指定）
		track.style.width = 'max-content';
		track.style.willChange = 'transform';

		if (!build()) { return; }

		// 画面に入っている間だけ動かす
		if ('IntersectionObserver' in window) {
			new IntersectionObserver(function (entries) {
				running = entries[0].isIntersecting;
				update();
			}).observe(slider);
		} else {
			running = true;
		}

		document.addEventListener('visibilitychange', update);

		if (PAUSE_ON_HOVER) {
			slider.addEventListener('mouseenter', function () { hovering = true; });
			slider.addEventListener('mouseleave', function () { hovering = false; });
		}

		// 画像の読み込み完了・画面幅の変更で長さが変わるので作り直す
		let resizeTimer = null;
		window.addEventListener('resize', function () {
			clearTimeout(resizeTimer);
			resizeTimer = setTimeout(build, 200);
		});
		window.addEventListener('load', build);
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', init);
	} else {
		init();
	}
})();
