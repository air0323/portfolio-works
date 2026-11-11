/* =========================================================
   facility.js  ―  設備案内ページ専用
   ・各設備の説明文（.article-text p）を、画面に入ったら下からふわっと表示
   ・<html> に .js を付けるのは、JSが動かない環境でも文章が消えたままにならないようにするため
     （facility.css の「.js .article-text p」と対）
========================================================= */
(function () {
  document.documentElement.classList.add('js');

  function init() {
    var texts = document.querySelectorAll('.article-text p');
    if (!texts.length) return;

    // 古いブラウザ：アニメーションなしで全部表示
    if (!('IntersectionObserver' in window)) {
      for (var i = 0; i < texts.length; i++) texts[i].classList.add('is-show');
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-show');
        observer.unobserve(entry.target); // 1回表示したら監視をやめる
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });

    for (var j = 0; j < texts.length; j++) observer.observe(texts[j]);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
