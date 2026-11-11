/*==============================================
  firstvisit.js（firstvisit.html 専用）
  ※jQueryなし（素のJavaScript）で動きます
  ※ページタイトル（ヘッダー下の画像＋文字）はJSを使っていないので、
    コピーして使う人はこのファイルをコピーしなくてOK
==============================================*/

document.addEventListener('DOMContentLoaded', function () {

  /*== よくあるご質問（Q&A） ==*/
  var buttons = document.querySelectorAll('.firstvisit-qa-pict button');
  var items = document.querySelectorAll('.firstvisit-qa-list details');
  var moreItems = document.querySelectorAll('.firstvisit-qa-list details[data-more]');
  var moreButton = document.querySelector('.firstvisit-qa-more');
  var moreOpen = false; // 「more...」で残りを開いているか

  // ふわっと表示するアニメーション（毎回やり直せるようにclassを付け直す）
  function fadeIn(item) {
    item.classList.remove('is-show');
    void item.offsetWidth;
    item.classList.add('is-show');
  }

  // 何も選んでいないときの表示：最初の６問だけ（more...で残りを開閉）
  function showDefault() {
    items.forEach(function (item) {
      item.hidden = item.hasAttribute('data-more') && !moreOpen;
      item.open = false;
    });
    moreButton.hidden = false;
    moreButton.classList.toggle('is-open', moreOpen);
    moreButton.querySelector('span').textContent = moreOpen ? '質問をとじる' : 'ほかの質問も見てみる';
  }

  // 「more...」を押す → 残りの質問を下に表示／もう一度押すと閉じる
  moreButton.addEventListener('click', function () {
    moreOpen = !moreOpen;
    showDefault();
    if (moreOpen) {
      moreItems.forEach(fadeIn);
    }
  });

  // アイコンを押す → その項目のQ&Aだけを表示して、回答を開く
  // 選んでいるアイコンをもう一度押す → 最初の表示に戻す
  buttons.forEach(function (button) {
    button.addEventListener('click', function () {
      var category = button.dataset.qa;
      var isActive = button.classList.contains('is-active');

      buttons.forEach(function (b) {
        b.classList.remove('is-active');
        b.setAttribute('aria-pressed', 'false');
      });

      if (isActive) {
        showDefault();
        return;
      }

      button.classList.add('is-active');
      button.setAttribute('aria-pressed', 'true');
      moreButton.hidden = true; // 絞り込み中は more... を隠す

      items.forEach(function (item) {
        if (item.dataset.qa === category) {
          item.hidden = false;
          item.open = true;
          fadeIn(item);
        } else {
          item.hidden = true;
        }
      });
    });
  });

  // 絞り込み中に、アイコンとQ&A以外の場所をクリック → 最初の表示（6問・折りたたみ）に戻す
  document.addEventListener('click', function (e) {
    var isFiltering = document.querySelector('.firstvisit-qa-pict .is-active');
    if (!isFiltering) return;
    if (e.target.closest('.firstvisit-qa-pict, .firstvisit-qa-list')) return;
    buttons.forEach(function (b) {
      b.classList.remove('is-active');
      b.setAttribute('aria-pressed', 'false');
    });
    moreOpen = false;
    showDefault();
  });

  showDefault(); // 最初の表示（JSが動かない環境では、８問すべてが表示される）


  /*== ページトップへ戻るボタン ==*/
  var pagetop = document.querySelector('.firstvisit-pagetop');

  // 押すと、ゆっくり始まってゆっくり止まる動きで一番上まで戻る（約1秒）
  pagetop.addEventListener('click', function (e) {
    e.preventDefault();
    var start = window.scrollY;
    var duration = 1000;
    var startTime = null;
    function easeInOut(t) { // 0〜1 の進み具合を、なめらかなカーブに変える
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }
    function step(now) {
      if (startTime === null) startTime = now;
      var progress = Math.min((now - startTime) / duration, 1);
      window.scrollTo(0, start * (1 - easeInOut(progress)));
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  });

});
