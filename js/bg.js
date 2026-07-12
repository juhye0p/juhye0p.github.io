/* ============================================================
   juhye0p theme — animated node-mesh background (option 1c)
   Self-injecting: creates its own fixed <canvas> behind content.
   Drop this file at themes/juhye0p/source/js/bg.js and load it
   in layout.ejs BEFORE main.js:
     <script src="<%- url_for('/js/bg.js') %>"></script>
   No other markup needed. Respects prefers-reduced-motion.
   ============================================================ */
(function () {
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var BG = '#0a0a0b';          // site base
  var LINK_DIST = 132;         // px: nodes closer than this get connected
  var MOUSE_DIST = 220;        // px: cursor influence radius
  var DENSITY = 26000;         // 1 node per this many px² of viewport

  var canvas = document.createElement('canvas');
  canvas.id = 'bg-mesh';
  canvas.style.cssText =
    'position:fixed;inset:0;width:100%;height:100%;z-index:-1;' +
    'pointer-events:none;display:block;';
  function attach() {
    var host = document.body || document.documentElement;
    host.prepend(canvas);
    // body must be transparent so the z-index:-1 canvas is visible;
    // the base color stays on <html>.
    document.documentElement.style.background = BG;
    document.body.style.background = 'transparent';
  }
  if (document.body) attach();
  else document.addEventListener('DOMContentLoaded', attach);

  var ctx = canvas.getContext('2d');
  var w = 0, h = 0, dpr = 1, pts = [];
  var lastW = -1;
  var mouse = { x: -9999, y: -9999 };

  function build() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var target = Math.max(24, Math.min(140, Math.round((w * h) / DENSITY)));
    if (pts.length > target) pts.length = target;
    while (pts.length < target) {
      pts.push({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35
      });
    }
    // keep existing points inside the new bounds
    for (var i = 0; i < pts.length; i++) {
      if (pts[i].x > w) pts[i].x = Math.random() * w;
      if (pts[i].y > h) pts[i].y = Math.random() * h;
    }
    lastW = w;
  }

  // On mobile the URL bar shows/hides, firing resize with a height-only
  // change. Rebuilding then repositions points and looks jumpy — so when
  // the width is unchanged, just resize the canvas and keep the points.
  function onResize() {
    if (window.innerWidth === lastW) {
      h = window.innerHeight;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      return;
    }
    build();
  }

  function frame() {
    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, w, h);

    var N = pts.length, i, j;
    for (i = 0; i < N; i++) {
      var p = pts[i];
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;
    }

    // per-node cursor proximity (0 = far, 1 = right under the cursor)
    var pull = new Array(N);
    for (i = 0; i < N; i++) {
      var dmm = Math.hypot(pts[i].x - mouse.x, pts[i].y - mouse.y);
      pull[i] = dmm < MOUSE_DIST ? (1 - dmm / MOUSE_DIST) : 0;
    }

    // links: only woven around the cursor, brightest at the pointer
    for (i = 0; i < N; i++) {
      if (pull[i] <= 0) continue;
      for (j = i + 1; j < N; j++) {
        var dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
        var d = Math.sqrt(dx * dx + dy * dy);
        if (d < LINK_DIST) {
          var strength = Math.max(pull[i], pull[j]) * (1 - d / LINK_DIST);
          if (strength <= 0.02) continue;
          ctx.strokeStyle = 'rgba(255,32,32,' + strength * 0.6 + ')';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(pts[i].x, pts[i].y);
          ctx.lineTo(pts[j].x, pts[j].y);
          ctx.stroke();
        }
      }
    }
    // nodes + cursor glow
    for (i = 0; i < N; i++) {
      var q = pts[i];
      var pl = pull[i];
      var near = pl > 0;
      ctx.fillStyle = near
        ? 'rgba(255,53,53,' + (0.35 + pl * 0.6) + ')'
        : 'rgba(160,156,164,0.24)';
      ctx.beginPath();
      ctx.arc(q.x, q.y, near ? 1.6 + pl * 2 : 1.2, 0, 6.2832);
      ctx.fill();
      if (near) {
        ctx.strokeStyle = 'rgba(255,32,32,' + pl * 0.75 + ')';
        ctx.beginPath();
        ctx.moveTo(q.x, q.y);
        ctx.lineTo(mouse.x, mouse.y);
        ctx.stroke();
      }
    }
    requestAnimationFrame(frame);
  }

  window.addEventListener('resize', onResize, { passive: true });
  window.addEventListener('mousemove', function (e) {
    mouse.x = e.clientX; mouse.y = e.clientY;
  }, { passive: true });
  window.addEventListener('mouseout', function () {
    mouse.x = -9999; mouse.y = -9999;
  }, { passive: true });

  // touch: weave the mesh under the finger (tap / drag) on mobile
  function fromTouch(e) {
    if (e.touches && e.touches.length) {
      mouse.x = e.touches[0].clientX;
      mouse.y = e.touches[0].clientY;
    }
  }
  window.addEventListener('touchstart', fromTouch, { passive: true });
  window.addEventListener('touchmove', fromTouch, { passive: true });
  window.addEventListener('touchend', function () {
    mouse.x = -9999; mouse.y = -9999;
  }, { passive: true });

  build();
  requestAnimationFrame(frame);
})();
