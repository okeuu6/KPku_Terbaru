/**
 * Efek Suara & Animasi Ceria (Web Audio API Synthesizer + Native Canvas Confetti)
 * Dibuat khusus ramah anak SD - Tanpa library eksternal, 100% offline, ringan & responsif
 */
window.KuisEfek = (function () {
  var audioCtx = null;
  var mute = localStorage.getItem('kpku_audio_mute') === '1';

  function getAudioContext() {
    if (!audioCtx && (window.AudioContext || window.webkitAudioContext)) {
      var AudioContextClass = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContextClass();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function playTone(freq, type, duration, startTime, gainLevel) {
    if (mute) return;
    try {
      var ctx = getAudioContext();
      if (!ctx) return;
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      osc.type = type || 'sine';
      var t = startTime || ctx.currentTime;
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(gainLevel || 0.15, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + duration);
    } catch (e) {}
  }

  var suara = {
    // Bunyi Melodi Ceria saat Jawaban Benar (C5 - E5 - G5 Chime)
    benar: function () {
      if (mute) return;
      try {
        var ctx = getAudioContext();
        if (!ctx) return;
        var now = ctx.currentTime;
        playTone(523.25, 'triangle', 0.14, now, 0.22);        // C5
        playTone(659.25, 'triangle', 0.16, now + 0.08, 0.24); // E5
        playTone(783.99, 'sine', 0.25, now + 0.16, 0.28);     // G5
      } catch (e) {}
    },

    // Bunyi Kartun "Boing" Ramah saat Jawaban Belum Tepat
    salah: function () {
      if (mute) return;
      try {
        var ctx = getAudioContext();
        if (!ctx) return;
        var now = ctx.currentTime;
        var osc = ctx.createOscillator();
        var gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(260, now);
        osc.frequency.exponentialRampToValueAtTime(140, now + 0.26);
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.26);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.26);
      } catch (e) {}
    },

    // Bunyi "Pop" Gelembung Empuk saat Menekan Tombol
    klik: function () {
      if (mute) return;
      try {
        var ctx = getAudioContext();
        if (!ctx) return;
        var now = ctx.currentTime;
        var osc = ctx.createOscillator();
        var gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(450, now);
        osc.frequency.exponentialRampToValueAtTime(750, now + 0.05);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.05);
      } catch (e) {}
    },

    // Fanfare Kemenangan saat Kuis Selesai
    selesai: function () {
      if (mute) return;
      try {
        var ctx = getAudioContext();
        if (!ctx) return;
        var now = ctx.currentTime;
        playTone(523.25, 'triangle', 0.18, now, 0.22);        // C5
        playTone(659.25, 'triangle', 0.18, now + 0.12, 0.24); // E5
        playTone(783.99, 'triangle', 0.20, now + 0.24, 0.26); // G5
        playTone(1046.50, 'sine', 0.50, now + 0.38, 0.32);    // C6
      } catch (e) {}
    },

    isMute: function () { return mute; },
    toggleMute: function () {
      mute = !mute;
      localStorage.setItem('kpku_audio_mute', mute ? '1' : '0');
      return mute;
    }
  };

  /**
   * Kembang Api Konfeti Kertas Ceria (Native Canvas, 0 Library)
   */
  function konfeti() {
    try {
      var canvas = document.createElement('canvas');
      canvas.id = 'kpku-canvas-konfeti';
      canvas.style.position = 'fixed';
      canvas.style.top = '0';
      canvas.style.left = '0';
      canvas.style.width = '100vw';
      canvas.style.height = '100vh';
      canvas.style.pointerEvents = 'none';
      canvas.style.zIndex = '9999';
      document.body.appendChild(canvas);

      var ctx = canvas.getContext('2d');
      var w = canvas.width = window.innerWidth;
      var h = canvas.height = window.innerHeight;

      var colors = ['#F59E0B', '#EF4444', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#FBBF24'];
      var partikel = [];
      var jumlah = Math.min(100, Math.floor(w / 10));

      for (var i = 0; i < jumlah; i++) {
        partikel.push({
          x: w / 2 + (Math.random() - 0.5) * 200,
          y: h * 0.4 + (Math.random() - 0.5) * 100,
          vx: (Math.random() - 0.5) * 14,
          vy: (Math.random() * -12) - 4,
          size: Math.random() * 8 + 6,
          color: colors[Math.floor(Math.random() * colors.length)],
          rotation: Math.random() * 360,
          rotSpeed: (Math.random() - 0.5) * 12,
          shape: Math.random() > 0.4 ? 'kotak' : 'lingkaran'
        });
      }

      var durasi = 180; // ~3 detik pada 60fps
      var frame = 0;

      function render() {
        ctx.clearRect(0, 0, w, h);
        for (var j = 0; j < partikel.length; j++) {
          var p = partikel[j];
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.28; // gravitasi
          p.vx *= 0.98; // gesekan udara
          p.rotation += p.rotSpeed;

          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.fillStyle = p.color;

          if (p.shape === 'kotak') {
            ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 1.4);
          } else {
            ctx.beginPath();
            ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
        }

        frame++;
        if (frame < durasi) {
          requestAnimationFrame(render);
        } else {
          if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
        }
      }

      requestAnimationFrame(render);
    } catch (e) {}
  }

  // Tambahkan suara pop otomatis ke tombol siswa jika diinginkan
  document.addEventListener('DOMContentLoaded', function () {
    document.addEventListener('click', function (e) {
      var t = e.target.closest('.btn-siswa, .btn-opsi-kuis, .btn-pin-angka, .btn-lp');
      if (t && window.KuisEfek) {
        window.KuisEfek.suara.klik();
      }
    });
  });

  return {
    suara: suara,
    konfeti: konfeti
  };
})();
