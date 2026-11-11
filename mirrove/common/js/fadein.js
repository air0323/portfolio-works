/* =========================================================
   fadein.js
   .fade が付いた要素を、画面に入ったタイミングでフェードインさせる

   ★ このファイルが読み込まれた時だけ <html> に .js を付ける
     → ファイルが無い・パスが違う場合は、要素は隠れず普通に表示される
   - REPLAY = true の時は、上にスクロールして戻ると再度アニメーションする
   - 遅延は HTML 側の style="--fade-delay:.2s" で指定
   - <head> 内で defer なしで読み込むこと（表示のちらつき防止）
========================================================= */
(function () {
	'use strict';

	// 発火ライン：画面の上から何%の位置に要素の上端が来たら始めるか
	var TRIGGER_LINE = 70;

	// 上にスクロールして戻った時に、もう一度アニメーションさせるか（true / false）
	var REPLAY = true;

	var supportsIO = 'IntersectionObserver' in window;
	var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	// 非対応ブラウザ・「動きを減らす」設定のときは何もしない（=最初から全部表示）
	if (!supportsIO || reduce) { return; }

	// ここで初めて「隠す」状態にする
	document.documentElement.classList.add('js');

	function init() {
		var targets = document.querySelectorAll('.fade');
		if (!targets.length) { return; }

		var observer = new IntersectionObserver(function (entries) {
			entries.forEach(function (entry) {
				if (entry.isIntersecting) {
					entry.target.classList.add('is-visible');
					if (!REPLAY) { observer.unobserve(entry.target); }
				} else if (REPLAY && entry.rootBounds &&
				          entry.boundingClientRect.top > entry.rootBounds.bottom) {
					// 発火ラインより「下」に戻った時だけ非表示に戻す
					// （下へ通り過ぎて画面の上に消えた要素は、表示したまま）
					entry.target.classList.remove('is-visible');
				}
			});
		}, {
			// 要素の上端が「画面の上から60%の位置」に届いた時点で発火
			// （=そのセクション／要素に到達してから動き出す）
			// 動き出しを遅くしたい → 数値を小さく（例: 50%）、早くしたい → 大きく
			threshold: 0,
			rootMargin: '0px 0px -' + (100 - TRIGGER_LINE) + '% 0px'
		});

		Array.prototype.forEach.call(targets, function (el) {
			observer.observe(el);
		});
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', init);
	} else {
		init();
	}
})();
