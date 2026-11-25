/* =========================================================
   common.js  ―  全ページ共通
   ・SPメニュー：リンクをタップしたらメニューを閉じる
     （同じページ内へ移動するリンク［例：index.html#access］で、
       メニューが開いたまま残ってしまうのを防ぐ）
   ※ jQuery不要
========================================================= */
document.addEventListener('DOMContentLoaded', function () {
	const toggle = document.getElementById('sp-menu-toggle');
	if (!toggle) { return; }

	Array.prototype.forEach.call(document.querySelectorAll('.sp-menu a'), function (a) {
		a.addEventListener('click', function () { toggle.checked = false; });
	});
});

// フッターの年を今年に自動で更新
document.querySelectorAll('.js-year').forEach(function (el) { el.textContent = new Date().getFullYear(); });
