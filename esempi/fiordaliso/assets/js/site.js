// Menu, scorrimento delle schede, stagioni, ricorrenze: tutto ciò che serve su più pagine.
(function () {
  var root = document.documentElement;
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  // Titolo scritto lettera per lettera
  var ink = $(".ink");
  if (ink) {
    var letter = 0;
    ink.innerHTML = ["Per chi", "sono?"].map(function (line) {
      return '<span class="ink__line">' + line.split("").map(function (c) {
        return '<i style="--i:' + letter++ + '">' + c + "</i>";
      }).join("") + "</span>";
    }).join("");
    ink.classList.add("is-split");
  }

  // Intestazione che diventa carta quando la copertina è passata
  var bar = $(".topbar");
  var cover = $(".cover");
  function onScroll() {
    if (!bar) return;
    var past = cover ? cover.getBoundingClientRect().bottom < 70 : true;
    bar.classList.toggle("is-solid", past);
  }
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Menu
  var menu = $("#menu"), scrim = $(".scrim"), open = $(".menu-btn"), close = $(".menu__close");
  var scrollY = 0;
  function setMenu(on) {
    if (on) {
      scrollY = window.scrollY;
      menu.hidden = scrim.hidden = false;
      document.body.style.cssText = "position:fixed;left:0;right:0;top:-" + scrollY + "px";
      void menu.offsetWidth;
      menu.classList.add("is-on");
      scrim.classList.add("is-on");
      open.setAttribute("aria-expanded", "true");
      close.focus();
    } else {
      menu.classList.remove("is-on");
      scrim.classList.remove("is-on");
      open.setAttribute("aria-expanded", "false");
      document.body.style.cssText = "";
      root.style.scrollBehavior = "auto";
      window.scrollTo(0, scrollY);
      root.style.scrollBehavior = "";
      setTimeout(function () {
        if (!menu.classList.contains("is-on")) menu.hidden = scrim.hidden = true;
      }, reduce ? 0 : 290);
      open.focus();
    }
  }
  if (menu) {
    open.addEventListener("click", function () { setMenu(true); });
    close.addEventListener("click", function () { setMenu(false); });
    scrim.addEventListener("click", function () { setMenu(false); });
    addEventListener("keydown", function (e) {
      if (!menu.classList.contains("is-on")) return;
      if (e.key === "Escape") setMenu(false);
      if (e.key === "Tab") {
        var items = $$("a, button", menu), first = items[0], last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
    $$("a", menu).forEach(function (a) {
      a.addEventListener("click", function (e) {
        var here = a.pathname === location.pathname && a.hash;
        if (here) {
          e.preventDefault();
          setMenu(false);
          location.hash = a.hash;
          dispatchEvent(new HashChangeEvent("hashchange"));
          var t = $(a.hash);
          if (t && !root.classList.contains("book-on")) t.scrollIntoView();
        }
      });
    });
  }

  // La barra del pollice si fa da parte nel finale, che ha il suo bottone
  var thumb = $(".thumb"), end = $(".finale__card");
  if (thumb && end && "IntersectionObserver" in window) {
    new IntersectionObserver(function (e) { thumb.classList.toggle("is-away", e[0].isIntersecting); }, { threshold: .15 }).observe(end);
  }

  // Foto che non arriva: il riquadro resta in ordine
  $$("img").forEach(function (img) {
    img.addEventListener("error", function () { img.classList.add("is-broken"); });
  });

  // Schede che scorrono di lato
  $$("[data-sheets]").forEach(function (list) {
    var pager = list.parentElement.querySelector("[data-pager]");
    function items() { return Array.prototype.filter.call(list.children, function (x) { return !x.hidden; }); }
    function update() {
      if (!pager) return;
      var all = items(), left = list.scrollLeft + 24, at = 0;
      all.forEach(function (x, i) { if (x.offsetLeft - list.offsetLeft <= left) at = i; });
      if (list.scrollLeft + list.clientWidth >= list.scrollWidth - 8) at = all.length - 1;
      $("[data-pos]", pager).textContent = at + 1 + " di " + all.length;
      $("[data-prev]", pager).disabled = at === 0;
      $("[data-next]", pager).disabled = at === all.length - 1;
      list.dataset.at = at;
    }
    function go(d) {
      var all = items(), to = all[Math.max(0, Math.min(all.length - 1, +(list.dataset.at || 0) + d))];
      list.scrollTo({ left: to.offsetLeft - list.offsetLeft - 20, behavior: reduce ? "auto" : "smooth" });
    }
    if (pager) {
      $("[data-prev]", pager).addEventListener("click", function () { go(-1); });
      $("[data-next]", pager).addEventListener("click", function () { go(1); });
    }
    list.addEventListener("scroll", update, { passive: true });
    list.addEventListener("sheets:refresh", function () { list.scrollLeft = 0; update(); });
    addEventListener("resize", update);
    update();
  });

  // Stagioni
  var months = ["gennaio", "febbraio", "marzo", "aprile", "maggio", "giugno", "luglio", "agosto", "settembre", "ottobre", "novembre", "dicembre"];
  function setSeason(s, keep) {
    root.dataset.season = s;
    $$("[data-set-season]").forEach(function (b) { b.setAttribute("aria-pressed", b.dataset.setSeason === s); });
    $$("[data-season-item]").forEach(function (x) { x.hidden = x.dataset.seasonItem !== s; });
    var list = $(".season [data-sheets]");
    if (list) list.dispatchEvent(new Event("sheets:refresh"));
    var m = $("[data-month]");
    if (m) m.textContent = keep ? "Al banco, a " + months[new Date().getMonth()] : "Al banco, in " + s;
    if (!keep) { try { sessionStorage.setItem("fiordaliso-stagione", s); } catch (e) {} }
  }
  if ($("[data-set-season]")) {
    setSeason(root.dataset.season, true);
    $$("[data-set-season]").forEach(function (b) {
      b.addEventListener("click", function () { setSeason(b.dataset.setSeason); });
    });
  }

  // Girare un foglio
  $$(".sheet__inner").forEach(function (b) {
    b.addEventListener("click", function () {
      b.setAttribute("aria-pressed", b.getAttribute("aria-pressed") !== "true");
    });
  });

  // La prossima ricorrenza, calcolata dalla data di oggi
  var num = $("[data-next-days]");
  if (num) {
    var now = new Date(); now.setHours(0, 0, 0, 0);
    var y = now.getFullYear();
    function mother(year) {
      var d = new Date(year, 4, 1);
      d.setDate(1 + (7 - d.getDay()) % 7 + 7);
      return d;
    }
    var days = [];
    [y, y + 1].forEach(function (k) {
      days.push([new Date(k, 1, 14), "San Valentino"], [new Date(k, 2, 8), "l'8 marzo"], [new Date(k, 2, 19), "la festa del papà"],
        [mother(k), "la festa della mamma"], [new Date(k, 10, 2), "il 2 novembre"], [new Date(k, 11, 25), "Natale"]);
    });
    days = days.filter(function (d) { return d[0] > now; }).sort(function (a, b) { return a[0] - b[0]; });
    var n = Math.round((days[0][0] - now) / 864e5);
    num.textContent = n === 1 ? "Domani" : n;
    num.classList.toggle("is-word", n === 1);
    var name = days[0][1];
    $("[data-next-name]").textContent = n === 1 ? "è " + name + "." : "giorni a " + name.replace(/^(il|la) /, function (m) { return m === "il " ? "il " : "la "; }) + ".";
  }
})();
