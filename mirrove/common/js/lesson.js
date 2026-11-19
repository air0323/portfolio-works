/* =========================================================
   lesson.js  ―  レッスン内容ページ専用（jQuery不要）
   ・パーソナルレッスン／食事指導の画像を、画面に入ったら下からふわっと表示
     （表示前の状態と動きは lesson.css の .frPersonal img / .flFood img）
   ※ 画像ホバー時の透明度・明るさの変化は CSS（:hover）で指定
========================================================= */
(function () {
	const imgs = document.querySelectorAll('.frPersonal img, .flFood img');
	if (!imgs.length) { return; }

	// 古いブラウザ：アニメーションなしで全部表示
	if (!('IntersectionObserver' in window)) {
		imgs.forEach(function (img) { img.classList.add('is-in'); });
		return;
	}

	// 画像の上端が、画面の下から100pxの位置まで来たら表示（旧：jQueryのスクロール判定と同じ位置）
	const observer = new IntersectionObserver(function (entries) {
		entries.forEach(function (entry) {
			if (!entry.isIntersecting) { return; }
			entry.target.classList.add('is-in');
			observer.unobserve(entry.target);
		});
	}, { rootMargin: '0px 0px -100px 0px' });

	imgs.forEach(function (img) { observer.observe(img); });
})();
