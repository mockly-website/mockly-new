// Il fiordaliso sboccia con lo scroll, petalo dopo petalo. Senza JavaScript resta già aperto.
(function () {
  var root = document.documentElement;
  var stage = document.querySelector(".bloom");
  if (!stage) return;
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var count = document.querySelector("[data-petals]");
  var text = document.querySelector(".bloom__text");
  var steps = Array.prototype.slice.call(document.querySelectorAll(".gesture"));
  var petals = Array.prototype.slice.call(stage.querySelectorAll(".petal")).map(function (el, i, all) {
    return { el: el, a: +el.dataset.a, s: +el.dataset.s, at: order(i, all.length) / all.length };
  });
  // Prima il centro, poi i lati si allargano
  function order(i, n) {
    var seq = (i * 13) % n;
    return Math.min(seq, n - 1);
  }
  var total = petals.length;

  function back(t) {
    var c = 1.55;
    return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2);
  }
  var last = -1;
  function draw(p) {
    p = Math.max(0, Math.min(1, p));
    if (Math.abs(p - last) < .0015) return;
    last = p;
    var open = 0;
    petals.forEach(function (f) {
      var t = Math.max(0, Math.min(1, (p * 1.22 - f.at * .92) / .3));
      if (t >= 1) open++;
      var e = t ? back(t) : 0;
      f.el.setAttribute("transform", "rotate(" + (f.a * (.1 + .9 * e)).toFixed(2) + ") scale(" + (Math.max(.02, f.s * e)).toFixed(3) + ")");
      f.el.setAttribute("opacity", t > 0 ? Math.min(1, t * 4) : 0);
    });
    if (count) count.textContent = open;
    var i = Math.min(steps.length - 1, Math.floor(p * steps.length * .999));
    steps.forEach(function (s, k) { s.classList.toggle("is-on", k === i); });
    if (text) text.classList.toggle("is-started", p > .04);
  }
  window.fiordalisoBloom = draw;
  if (reduce) return;

  function scrolly() {
    var want = !root.classList.contains("book-on");
    root.classList.toggle("scrolly", want);
    return want;
  }
  var tick = false;
  function frame() {
    tick = false;
    if (root.classList.contains("book-on")) return;
    var r = stage.getBoundingClientRect();
    draw(-r.top / Math.max(1, r.height - innerHeight) * 1.05);
  }
  function ask() { if (!tick) { tick = true; requestAnimationFrame(frame); } }
  addEventListener("scroll", ask, { passive: true });
  addEventListener("resize", function () { scrolly(); ask(); });
  addEventListener("book:change", function () { scrolly(); last = -1; ask(); });
  scrolly();
  draw(0);
  ask();
})();
