// Da computer le pagine diventano un libro: scorrendo, i fogli girano da destra a sinistra.
(function () {
  var root = document.documentElement;
  var main = document.querySelector("[data-book]");
  if (!main) return;
  var wide = matchMedia("(min-width: 1024px) and (min-height: 640px) and (prefers-reduced-motion: no-preference)");
  var flipNav = document.querySelector(".flip");
  var pages = [], pairs = [], homes = [], stageEl, bookEl, marks = [], active = false, target = 0, shown = 0, raf = 0;

  function build() {
    pages = Array.prototype.slice.call(main.querySelectorAll("[data-page]"));
    pairs = [];
    for (var i = 0; i + 1 < pages.length; i += 2) pairs.push({ l: pages[i], r: pages[i + 1], dwell: +(pages[i].dataset.dwell || .2) });
    homes = pages.map(function (p) { return { p: p, parent: p.parentNode, next: p.nextSibling }; });
    stageEl = document.createElement("div"); stageEl.className = "book-stage";
    bookEl = document.createElement("div"); bookEl.className = "book";
    stageEl.appendChild(bookEl);
    main.insertBefore(stageEl, main.firstChild);
    pages.forEach(function (p, i) { p.classList.add(i % 2 ? "is-right" : "is-left"); bookEl.appendChild(p); });
    var flip = .9, h = innerHeight, y = 0;
    marks = pairs.map(function (s, i) {
      var from = y; y += s.dwell * h; var to = y;
      if (i < pairs.length - 1) y += flip * h;
      return { from: from, to: to };
    });
    main.style.height = y + h + "px";
  }
  function unbuild() {
    homes.reverse().forEach(function (h) {
      h.p.classList.remove("is-left", "is-right");
      h.p.style.cssText = "";
      h.parent.insertBefore(h.p, h.next);
    });
    if (stageEl) stageEl.remove();
    main.style.height = "";
    homes = [];
  }
  function position(y) {
    for (var i = 0; i < marks.length; i++) {
      if (y <= marks[i].to) return { p: i, d: marks[i].to > marks[i].from ? Math.max(0, (y - marks[i].from) / (marks[i].to - marks[i].from)) : 1 };
      if (marks[i + 1] && y < marks[i + 1].from) return { p: i + (y - marks[i].to) / (marks[i + 1].from - marks[i].to), d: 1 };
    }
    return { p: marks.length - 1, d: 1 };
  }
  function paint() {
    raf = 0;
    shown += (target - shown) * .2;
    if (Math.abs(target - shown) < .4) shown = target;
    var at = position(shown), i = Math.floor(at.p), t = at.p - i;
    pairs.forEach(function (s, k) {
      var cur = k === i, nxt = k === i + 1;
      var l = s.l.style, r = s.r.style;
      if (cur) {
        l.visibility = "visible"; l.zIndex = 1; l.transform = "none"; l.setProperty("--shade", t ? (t * .3).toFixed(3) : 0);
        r.visibility = t < .5 ? "visible" : "hidden"; r.zIndex = 3; r.transform = t ? "rotateY(" + (-180 * t).toFixed(2) + "deg)" : "none"; r.setProperty("--shade", (t * .5).toFixed(3));
      } else if (nxt && t > 0) {
        r.visibility = "visible"; r.zIndex = 1; r.transform = "none"; r.setProperty("--shade", ((1 - t) * .3).toFixed(3));
        l.visibility = t >= .5 ? "visible" : "hidden"; l.zIndex = 3; l.transform = "rotateY(" + (180 * (1 - t)).toFixed(2) + "deg)"; l.setProperty("--shade", ((1 - t) * .5).toFixed(3));
      } else {
        l.visibility = r.visibility = "hidden";
      }
    });
    if (window.fiordalisoBloom && pairs[1] && pairs[1].l.querySelector(".flower")) {
      window.fiordalisoBloom(at.p < 1 ? 0 : at.p > 1 ? 1 : at.d * 1.05);
    }
    if (flipNav) {
      var n = Math.round(at.p);
      flipNav.querySelector("[data-flip-pos]").textContent = "Foglio " + (n + 1) + " di " + pairs.length;
      flipNav.querySelector('[data-flip="-1"]').disabled = n === 0;
      flipNav.querySelector('[data-flip="1"]').disabled = n === pairs.length - 1;
    }
    if (shown !== target) raf = requestAnimationFrame(paint);
  }
  function onScroll() {
    target = Math.min(window.scrollY, main.offsetHeight - innerHeight);
    if (!raf) raf = requestAnimationFrame(paint);
  }
  function goTo(k) {
    var m = marks[Math.max(0, Math.min(marks.length - 1, k))];
    window.scrollTo({ top: m.from + 2, behavior: "smooth" });
  }
  function fromHash() {
    if (!active || !location.hash) return;
    var map = { "#fioritura": 1, "#stagione": 2, "#occasioni": 3, "#banco": 4, "#biglietto": 5 };
    if (location.hash in map) goTo(map[location.hash]);
  }
  function apply() {
    var on = wide.matches;
    if (on === active) return;
    active = on;
    root.classList.toggle("book-on", on);
    if (flipNav) flipNav.hidden = !on;
    if (on) { build(); target = shown = window.scrollY; onScroll(); fromHash(); }
    else { unbuild(); }
    dispatchEvent(new Event("book:change"));
  }
  if (flipNav) {
    flipNav.addEventListener("click", function (e) {
      var b = e.target.closest("[data-flip]");
      if (b) goTo(Math.round(position(window.scrollY).p) + (+b.dataset.flip));
    });
  }
  addEventListener("keydown", function (e) {
    if (!active || /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
    if (e.key === "ArrowRight") { e.preventDefault(); goTo(Math.round(position(window.scrollY).p) + 1); }
    if (e.key === "ArrowLeft") { e.preventDefault(); goTo(Math.round(position(window.scrollY).p) - 1); }
  });
  addEventListener("scroll", function () { if (active) onScroll(); }, { passive: true });
  addEventListener("hashchange", fromHash);
  var rz;
  addEventListener("resize", function () {
    clearTimeout(rz);
    rz = setTimeout(function () {
      if (active && wide.matches) { unbuild(); active = false; root.classList.remove("book-on"); }
      apply();
    }, 160);
  });
  if (wide.addEventListener) wide.addEventListener("change", apply);
  apply();
})();
