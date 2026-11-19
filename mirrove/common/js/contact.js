/*==============================================
  contact.js（contact.html 専用）
  ※jQueryなし（素のJavaScript）で動きます
==============================================*/

document.addEventListener('DOMContentLoaded', function () {

  /*== メールアドレス（確認用）が一致しているかチェック ==*/
  const mail = document.getElementById('contact-mail');
  const mailCheck = document.getElementById('contact-mail-check');

  function checkMail() {
    if (mailCheck.value && mail.value !== mailCheck.value) {
      mailCheck.setCustomValidity('メールアドレスが一致しません。');
    } else {
      mailCheck.setCustomValidity('');
    }
  }
  mail.addEventListener('input', checkMail);
  mailCheck.addEventListener('input', checkMail);

  /*== お問い合わせ内容の文字数カウント（200文字まで） ==*/
  const message = document.getElementById('contact-message');
  const count = document.querySelector('.contact-form-count');

  // 1桁の数字は全角、2桁以上は半角で表示する（サイトの表記ルール）
  function toDisplay(n) {
    return n < 10 ? String.fromCharCode(0xFF10 + n) : String(n);
  }
  function updateCount() {
    const len = message.value.length;
    count.querySelector('span').textContent = toDisplay(len);
    count.classList.toggle('is-max', len >= 200);
  }
  message.addEventListener('input', updateCount);
  updateCount();

});
