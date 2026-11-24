// Mode Mencocokkan: Soal dan poin dinilai di sisi server (FR-07, FR-08)
// Umpan balik singkat dan tenang sesuai aturan visual E.3
(function () {
  var g = document.getElementById('game');
  if (!g) return;

  var csrf = document.querySelector('meta[name=csrf]') ? document.querySelector('meta[name=csrf]').content : '';
  var el = function (id) { return document.getElementById(id); };
  var soal = [], token = '', i = 0, terkunci = false;

  function kirim(url, data) {
    return fetch(url, {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrf
      },
      body: JSON.stringify(data || {})
    }).then(function (r) {
      return r.json();
    });
  }

  function galat(p) {
    el('muat').style.display = 'none';
    el('area').style.display = 'none';
    var b = el('pesan-game');
    b.textContent = p;
    b.style.display = 'block';
  }

  function tampil() {
    var s = soal[i];
    terkunci = false;
    el('no').textContent = 'Soal ' + (i + 1) + ' / ' + soal.length;
    el('gambar').src = s.gambar;
    el('umpan').textContent = '';
    el('umpan').className = 'umpan-balik-box';
    el('lanjut').style.display = 'none';

    var o = el('opsi');
    o.innerHTML = '';
    var huruf = ['A', 'B', 'C', 'D'];
    s.opsi.forEach(function (t, idxOpsi) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'btn-opsi-kuis';
      var badge = (huruf[idxOpsi] ? '<span style="display:inline-block; width:26px; height:26px; border-radius:50%; background:#EFF6FF; border:2px solid var(--border-komik); font-size:14px; line-height:22px; text-align:center; margin-right:8px; font-weight:900;">' + huruf[idxOpsi] + '</span>' : '');
      b.innerHTML = badge + '<span>' + t + '</span>';
      b.onclick = function () { jawab(b, t); };
      o.appendChild(b);
    });
  }

  function jawab(btn, teks) {
    if (terkunci) return;
    terkunci = true;

    kirim(g.dataset.poin, {
      aksi: 'jawab',
      token: token,
      idx: soal[i].idx,
      jawaban: teks
    }).then(function (r) {
      if (!r.ok) {
        galat(r.pesan || 'Terjadi kesalahan.');
        return;
      }

      el('skor').textContent = r.poin;

      Array.prototype.forEach.call(el('opsi').children, function (b) {
        b.disabled = true;
        var txt = b.querySelector('span:last-child') ? b.querySelector('span:last-child').textContent.toLowerCase() : b.textContent.toLowerCase();
        if (txt === r.kunci) {
          b.classList.add('benar');
          b.innerHTML = '&#10003; ' + r.kunci.toUpperCase();
        }
      });

      if (r.benar) {
        if (window.KuisEfek) window.KuisEfek.suara.benar();
        el('umpan').className = 'umpan-balik-box umpan-benar';
        el('umpan').innerHTML = '🎉 Yey! Jawabanmu Benar Sekali! (+10 Poin ⭐)';
      } else {
        btn.classList.add('salah');
        btn.innerHTML = '&#10007; ' + teks.toUpperCase();
        if (window.KuisEfek) window.KuisEfek.suara.salah();
        el('umpan').className = 'umpan-balik-box umpan-salah';
        el('umpan').innerHTML = '💡 Belum tepat. Jawabannya: <strong>' + r.kunci.toUpperCase() + '</strong>';
      }

      var l = el('lanjut');
      l.style.display = 'block';
      l.innerHTML = (i === soal.length - 1) ? 'Lihat Hasil Akhir &rarr;' : 'Lanjut ke Soal Berikutnya &rarr;';
    }).catch(function () {
      terkunci = false;
      galat('Koneksi terputus. Periksa jaringan lalu muat ulang halaman.');
    });
  }

  el('lanjut').onclick = function () {
    if (i < soal.length - 1) {
      i++;
      tampil();
      return;
    }

    el('lanjut').disabled = true;
    kirim(g.dataset.poin, { aksi: 'selesai', token: token }).then(function (r) {
      if (r.ok) {
        location.href = g.dataset.hasil;
      } else {
        galat(r.pesan || 'Poin gagal disimpan.');
      }
    }).catch(function () {
      galat('Koneksi terputus. Poin belum tersimpan, silakan coba lagi.');
      el('lanjut').disabled = false;
    });
  };

  // Mulai sesi kuis
  kirim(g.dataset.api, {}).then(function (r) {
    if (!r.ok) {
      if (r.habis) {
        location.href = g.dataset.hasil.replace('siswa/hasil.php', 'index.php?habis=1');
        return;
      }
      return galat(r.pesan || 'Soal tidak dapat dimuat.');
    }
    soal = r.soal;
    token = r.token;
    el('muat').style.display = 'none';
    el('area').style.display = 'block';
    tampil();
  }).catch(function () {
    galat('Koneksi terputus. Periksa jaringan lalu muat ulang halaman.');
  });
})();
