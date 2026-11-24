// Mode Belajar: kartu kosa kata + pelafalan (Web Speech API)
(function () {
  var dataElem = document.getElementById('data-kartu');
  if (!dataElem) return;

  var kartu = JSON.parse(dataElem.textContent);
  if (!kartu || kartu.length === 0) return;

  var i = 0;
  var el = function (id) { return document.getElementById(id); };
  var suaraInggris = null;

  function pilihSuara() {
    if (!('speechSynthesis' in window)) return;
    var v = speechSynthesis.getVoices();
    suaraInggris = v.find(function (x) { return /^en[-_]US/i.test(x.lang); }) ||
                   v.find(function (x) { return /^en/i.test(x.lang); }) || null;
  }

  if ('speechSynthesis' in window) {
    pilihSuara();
    speechSynthesis.onvoiceschanged = pilihSuara;
  } else {
    if (el('dengar')) el('dengar').disabled = true;
    if (el('tts-info')) el('tts-info').textContent = 'Browser ini belum mendukung suara pelafalan.';
  }

  function tampil() {
    var k = kartu[i];
    el('gambar').src = k.gambar;
    el('kata').textContent = k.kata;
    el('arti').textContent = k.arti;
    el('hitung').textContent = (i + 1) + ' / ' + kartu.length;

    el('sebelum').disabled = (i === 0);
    el('berikut').disabled = (i === kartu.length - 1);
  }

  el('sebelum').onclick = function () {
    if (i > 0) {
      i--;
      tampil();
    }
  };

  el('berikut').onclick = function () {
    if (i < kartu.length - 1) {
      i++;
      tampil();
    }
  };

  el('dengar').onclick = function () {
    if (!('speechSynthesis' in window)) return;
    speechSynthesis.cancel();
    var u = new SpeechSynthesisUtterance(kartu[i].kata);
    u.lang = 'en-US';
    u.rate = 0.85;
    if (suaraInggris) u.voice = suaraInggris;
    speechSynthesis.speak(u);
  };

  tampil();
})();
