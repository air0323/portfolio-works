/* =========================================================
   common.js  ―  全ページ共通
   ・SPメニュー：リンクをタップしたらメニューを閉じる
     （同じページ内へ移動するリンク［例：index.html#access］で、
       メニューが開いたまま残ってしまうのを防ぐ）
   ※ jQuery不要
========================================================= */
document.addEventListener('DOMContentLoaded', function () {
	var toggle = document.getElementById('sp-menu-toggle');
	if (!toggle) { return; }

	Array.prototype.forEach.call(document.querySelectorAll('.sp-menu a'), function (a) {
		a.addEventListener('click', function () { toggle.checked = false; });
	});
});
