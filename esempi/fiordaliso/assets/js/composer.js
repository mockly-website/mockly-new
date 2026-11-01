// Il compositore: il mazzo si costruisce gambo per gambo e l'ordine finisce su WhatsApp.
(function () {
  var root = document.documentElement;
  var form = document.querySelector("[data-order]");
  if (!form) return;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var WA = "https://wa.me/393517578080?text=";
  var EXTRA_OFF = 4, DELIVERY = 5;
  var TONES = {
    bianco: { name: "Bianco", a: "#F7F2E6", b: "#D9CFB8" },
    cipria: { name: "Cipria", a: "#E9B7B0", b: "#C4837E" },
    fiamma: { name: "Fiamma", a: "#D9552E", b: "#A23A1B" },
    cielo: { name: "Cielo", a: "#7486CF", b: "#4252A3" },
    sole: { name: "Sole", a: "#EDB93A", b: "#C08917" }
  };
  var MIX = ["cipria", "fiamma", "bianco", "sole"];
  var SIZES = { piccolo: { name: "Piccolo", stems: 7, price: 24 }, medio: { name: "Medio", stems: 12, price: 38 }, grande: { name: "Grande", stems: 19, price: 58 } };

  // ---- disegno dei fiori
  function petal(l, w, fill, line) {
    return '<path d="M0 0C' + w + " " + -l * .3 + " " + w + " " + -l * .8 + " 0 " + -l + "C" + -w + " " + -l * .8 + " " + -w + " " + -l * .3 + ' 0 0Z" fill="' + fill + '"' + (line ? ' stroke="' + line + '" stroke-width=".8"' : "") + "/>";
  }
  function ring(n, l, w, fill, line, off) {
    var o = "";
    for (var i = 0; i < n; i++) o += '<g transform="rotate(' + (i * 360 / n + (off || 0)).toFixed(1) + ')">' + petal(l, w, fill, line) + "</g>";
    return o;
  }
  function disc(r, fill, line) { return '<circle r="' + r + '" fill="' + fill + '"' + (line ? ' stroke="' + line + '"' : "") + "/>"; }
  function dots(n, r, s, fill) {
    var o = "";
    for (var i = 0; i < n; i++) { var a = i * 2.4, q = r * Math.sqrt((i + .5) / n); o += '<circle cx="' + (q * Math.cos(a)).toFixed(1) + '" cy="' + (q * Math.sin(a)).toFixed(1) + '" r="' + s + '" fill="' + fill + '"/>'; }
    return o;
  }
  var DRAW = {
    rosa: function (t) { return ring(5, 38, 26, t.b) + ring(5, 32, 22, t.a, t.b, 36) + ring(4, 22, 16, t.b, t.a, 12) + ring(3, 14, 10, t.a, t.b, 50) + '<path d="M-5 0a5 5 0 1 1 9 3" fill="none" stroke="' + t.b + '" stroke-width="2"/>'; },
    tulipano: function (t) { return '<g transform="translate(0 20)">' + '<g transform="rotate(-20)">' + petal(46, 15, t.b) + '</g><g transform="rotate(20)">' + petal(46, 15, t.b) + "</g>" + petal(50, 18, t.a, t.b) + "</g>"; },
    anemone: function (t) { return ring(7, 39, 19, t.a, t.b) + disc(12, "#1C1B2B") + dots(26, 17, 1.3, "#1C1B2B") + dots(10, 8, 1.2, "#6E6C86"); },
    peonia: function (t) { return ring(9, 40, 18, t.b) + ring(8, 33, 16, t.a, t.b, 20) + ring(7, 25, 13, t.b, t.a, 8) + ring(6, 18, 10, t.a, t.b, 30) + ring(4, 10, 7, t.b, null, 10); },
    fiordaliso: function () { var o = "", i; for (i = 0; i < 12; i++) o += '<g transform="rotate(' + i * 30 + ')"><path d="M0 -6L-5 -24L-11 -36L-4 -31L-2 -42L2 -32L7 -40L6 -30L12 -33L5 -22Z" fill="' + (i % 2 ? "#3F5CC0" : "#2F4BA0") + '"/></g>'; return o + dots(16, 9, 1.8, "#1C2A66"); },
    girasole: function () { return ring(20, 42, 7, "#D29412") + ring(18, 37, 7, "#EDB93A", null, 9) + disc(19, "#4A2B12") + dots(44, 18, 1.1, "#8A5A1E"); },
    margherita: function () { return ring(18, 39, 6, "#F7F2E6", "#CFC5AD") + disc(12, "#E0A71E") + dots(20, 11, 1, "#B57F12"); },
    dalia: function (t) { return ring(12, 42, 9, t.b) + ring(11, 35, 9, t.a, t.b, 15) + ring(10, 27, 8, t.b, t.a, 7) + ring(9, 19, 7, t.a, t.b, 20) + ring(6, 11, 5, t.b); },
    crisantemo: function (t) { return ring(22, 41, 4.5, t.b) + ring(20, 34, 4.5, t.a, null, 8) + ring(16, 26, 4, t.b, null, 4) + ring(12, 18, 4, t.a, null, 12) + ring(8, 10, 3, t.b); },
    settembrini: function (t) {
      var o = "", p = [[0, 0], [-22, -14], [20, -18], [-16, 20], [22, 16]];
      p.forEach(function (q) { o += '<g transform="translate(' + q[0] + " " + q[1] + ') scale(.42)">' + ring(14, 36, 5, t.a, t.b) + disc(10, "#E0A71E") + "</g>"; });
      return o;
    },
    camelia: function (t) { return ring(7, 39, 24, t.b) + ring(6, 30, 19, t.a, t.b, 25) + ring(5, 20, 13, t.b, t.a, 10) + disc(6, "#E0A71E"); },
    mimosa: function () { return '<path d="M-30 30Q0 0 28 -32M-8 8L-30 -6M6 -8L28 2" stroke="#6E7F6A" stroke-width="2" fill="none"/>' + dots(34, 40, 5, "#E8BC21") + dots(14, 34, 3, "#F4D65A"); },
    narciso: function () { return ring(6, 40, 15, "#F7F2E6", "#CFC5AD") + disc(15, "#E0A71E", "#B5760F") + disc(8, "#C98512"); }
  };
  var SP = {
    rosa: { name: "Rosa", all: 1, tint: 1 }, tulipano: { name: "Tulipano", s: "primavera", tint: 1 },
    anemone: { name: "Anemone", s: "primavera", tint: 1 }, peonia: { name: "Peonia", s: "primavera", tint: 1 }, fiordaliso: { name: "Fiordaliso", s: "primavera" },
    girasole: { name: "Girasole", s: "estate" }, margherita: { name: "Margherita", s: "estate" },
    dalia: { name: "Dalia", s: "autunno", tint: 1 }, crisantemo: { name: "Crisantemo", s: "autunno", tint: 1 }, settembrini: { name: "Settembrini", s: "autunno", tint: 1 },
    camelia: { name: "Camelia", s: "inverno", tint: 1 }, mimosa: { name: "Mimosa", s: "inverno" }, narciso: { name: "Narciso", s: "inverno" }
  };
  var season = root.dataset.season;
  function inSeason(id) { return SP[id].all || SP[id].s === season; }

  // ---- stato
  var q = new URLSearchParams(location.search);
  var BASE = {
    campo: [["dalia", "margherita"], "fiamma", "medio"], cipria: [["rosa", "peonia"], "cipria", "grande"], tramontana: [["fiordaliso", "margherita"], "cielo", "medio"],
    bianca: [["rosa"], "bianco", "piccolo"], brace: [["rosa", "dalia"], "fiamma", "medio"], tulipani: [["tulipano"], "cipria", "piccolo"]
  };
  var seasonal = Object.keys(SP).filter(function (k) { return SP[k].s === season; });
  var state = { flowers: ["rosa", seasonal[0]], tone: "misto", size: "medio" };
  var base = BASE[q.get("base")];
  if (base) state = { flowers: base[0].slice(), tone: base[1], size: base[2] };
  var pre = q.get("fiore");
  if (SP[pre] && state.flowers.indexOf(pre) < 0) state.flowers.unshift(pre);

  // ---- preparazione del foglio
  var SLOTS = [];
  for (var k = 0; k < 19; k++) {
    var rad = 150 * Math.sqrt((k + .5) / 19), th = k * 2.39996;
    SLOTS.push({ x: 240 + rad * Math.cos(th), y: 196 + rad * .74 * Math.sin(th), s: 1.02 - k * .006, r: (k * 47) % 60 - 30 });
  }
  var art = $("[data-art]");
  var euc = "";
  [[-150, 150], [-105, 90], [-52, 58], [8, 44], [66, 64], [112, 100], [150, 156], [-175, 215], [175, 215]].forEach(function (p, i) {
    var x = 240 + p[0], y = p[1];
    euc += '<path d="M240 372Q' + (240 + p[0] * .5) + " " + (y + 110) + " " + x + " " + y + '" fill="none" stroke="#54705E" stroke-width="2"/>';
    for (var j = 1; j < 6; j++) {
      var u = j / 6, lx = 240 + (x - 240) * Math.pow(u, .75), ly = 372 + (y - 372) * u;
      euc += '<ellipse cx="' + (lx + (j % 2 ? 10 : -10)).toFixed(1) + '" cy="' + ly.toFixed(1) + '" rx="12" ry="8.5" fill="' + (i % 2 ? "#7F9A86" : "#6B8A76") + '"/>';
    }
  });
  var lower = "";
  for (var g = 0; g < 9; g++) {
    var bx = 196 + g * 11, tx = 240 + (g - 4) * 13;
    lower += '<path d="M' + tx + " 380L" + bx + " 508L" + (bx + 7) + " 502L" + (tx + 4) + ' 380Z" fill="' + (g % 2 ? "#3F6650" : "#2E5240") + '"/>';
  }
  art.innerHTML = '<svg viewBox="0 -10 480 530" aria-hidden="true"><g data-green>' + euc + "</g>" + lower +
    '<g data-stems-layer></g>' +
    '<path d="M150 300L240 396L330 300L300 430L240 458L180 430Z" fill="#B8935F"/><path d="M180 430L240 396L300 430L240 458Z" fill="#A47E4C"/>' +
    '<path d="M211 392h58v13h-58z" fill="#DCC595"/><path d="M212 397h56M212 401h56" stroke="#B59B69"/><path d="M240 398q-34 -12 -42 10q18 12 42 -10q34 -12 42 10q-18 12 -42 -10" fill="none" stroke="#DCC595" stroke-width="3"/>' +
    "<g data-heads></g></svg>";
  var headsLayer = $("[data-heads]", art), stemsLayer = $("[data-stems-layer]", art);
  var nodes = {};

  function toneFor(i) {
    var id = state.tone === "misto" ? MIX[i % MIX.length] : state.tone;
    return id;
  }
  function render(animate) {
    var size = SIZES[state.size], n = state.flowers.length ? size.stems : 0;
    var seen = {}, list = [], stems = "";
    for (var i = n - 1; i >= 0; i--) {
      var sp = state.flowers[(i * 5 + (i >> 1)) % state.flowers.length];
      var tone = SP[sp].tint ? toneFor(i) : "x";
      var key = i + ":" + sp + ":" + tone, o = SLOTS[i];
      seen[key] = 1;
      stems += '<path d="M' + o.x.toFixed(1) + " " + o.y.toFixed(1) + 'L240 384" stroke="#2E5240" stroke-width="3"/>';
      var el = nodes[key];
      if (!el) {
        el = document.createElementNS("http://www.w3.org/2000/svg", "g");
        el.setAttribute("transform", "translate(" + o.x.toFixed(1) + " " + o.y.toFixed(1) + ") rotate(" + o.r + ") scale(" + o.s.toFixed(2) + ")");
        el.innerHTML = '<g class="' + (animate ? "pop" : "") + '" style="--d:' + (animate ? (n - i) * 12 : 0) + 'ms">' + DRAW[sp](TONES[tone] || TONES.bianco) + "</g>";
        nodes[key] = el;
      }
      list.push(el);
    }
    Object.keys(nodes).forEach(function (key) { if (!seen[key]) { nodes[key].remove(); delete nodes[key]; } });
    list.forEach(function (el) { headsLayer.appendChild(el); });
    stemsLayer.innerHTML = stems;
    $("[data-empty]").hidden = n > 0;
    art.style.opacity = n ? 1 : .35;
    summary();
  }
  headsLayer.addEventListener("animationend", function (e) { e.target.classList.remove("pop"); });

  function euro(v) { return v + " €"; }
  function lines() {
    var size = SIZES[state.size], out = [["Mazzo " + size.name.toLowerCase() + ", " + size.stems + " steli", size.price]];
    state.flowers.forEach(function (id) { if (!inSeason(id)) out.push([SP[id].name + " fuori stagione", EXTRA_OFF]); });
    if (form.elements.modo.value === "consegna") out.push(["Consegna in città", DELIVERY]);
    out.push(["Biglietto scritto a mano", 0]);
    return out;
  }
  function total() { return state.flowers.length ? lines().reduce(function (a, b) { return a + b[1]; }, 0) : 0; }
  function summary() {
    var t = euro(total()), st = (state.flowers.length ? SIZES[state.size].stems : 0) + " steli";
    $("[data-price]").textContent = t; $("[data-total]").textContent = t; $("[data-bar-price]").textContent = t;
    $("[data-stems]").textContent = st; $("[data-bar-stems]").textContent = st;
    $("[data-lines]").innerHTML = lines().map(function (l) { return "<li><span>" + l[0] + "</span><span>" + (l[1] ? euro(l[1]) : "compreso") + "</span></li>"; }).join("");
    var fixed = state.flowers.filter(function (id) { return !SP[id].tint; }).map(function (id) { return SP[id].name; });
    $("[data-tone-hint]").textContent = fixed.length ? fixed.join(" e ") + (fixed.length > 1 ? " restano del loro colore" : " resta del suo colore") + ": il resto del mazzo segue la tua scelta." : "";
  }

  // ---- controlli
  function pickBtn(id) {
    var b = document.createElement("button");
    b.type = "button"; b.className = "pick"; b.dataset.id = id;
    b.innerHTML = '<svg viewBox="-48 -48 96 96" aria-hidden="true">' + DRAW[id](TONES.cipria) + "</svg><span>" + SP[id].name + "</span>";
    b.setAttribute("aria-pressed", state.flowers.indexOf(id) >= 0);
    b.addEventListener("click", function () {
      var i = state.flowers.indexOf(id);
      if (i >= 0) state.flowers.splice(i, 1); else state.flowers.push(id);
      b.setAttribute("aria-pressed", i < 0);
      $('[data-err="fiori"]').textContent = "";
      render(true);
    });
    return b;
  }
  var on = $("[data-flowers]"), off = $("[data-flowers-off]");
  Object.keys(SP).forEach(function (id) { (inSeason(id) ? on : off).appendChild(pickBtn(id)); });
  off.classList.add("flowers--off");
  var more = $("[data-more]");
  more.textContent = "Altri fiori, fuori stagione (+" + EXTRA_OFF + " €)";
  more.addEventListener("click", function () { off.hidden = !off.hidden; more.setAttribute("aria-expanded", !off.hidden); });
  if (state.flowers.some(function (id) { return !inSeason(id); })) { off.hidden = false; more.setAttribute("aria-expanded", true); }
  $("[data-season-hint]").textContent = "Adesso è " + season + ": questi sono al banco.";

  var tones = $("[data-tones]");
  function toneBtn(id, label, style) {
    var b = document.createElement("button");
    b.type = "button"; b.className = "tone";
    b.innerHTML = '<i style="background:' + style + '"></i>' + label;
    b.setAttribute("aria-pressed", state.tone === id);
    b.addEventListener("click", function () {
      state.tone = id;
      Array.prototype.forEach.call(tones.children, function (x) { x.setAttribute("aria-pressed", x === b); });
      render(true);
    });
    tones.appendChild(b);
  }
  toneBtn("misto", "Misto", "conic-gradient(#E9B7B0 0 25%,#D9552E 0 50%,#F7F2E6 0 75%,#EDB93A 0)");
  Object.keys(TONES).forEach(function (id) { toneBtn(id, TONES[id].name, TONES[id].a); });

  var sizes = $("[data-sizes]");
  Object.keys(SIZES).forEach(function (id) {
    var b = document.createElement("button"), s = SIZES[id];
    b.type = "button"; b.className = "size";
    b.innerHTML = "<b>" + s.name + "</b><small>" + s.stems + " steli</small><small>" + euro(s.price) + "</small>";
    b.setAttribute("aria-pressed", state.size === id);
    b.addEventListener("click", function () {
      state.size = id;
      Array.prototype.forEach.call(sizes.children, function (x) { x.setAttribute("aria-pressed", x === b); });
      render(true);
    });
    sizes.appendChild(b);
  });

  // ---- biglietto
  var IDEAS = {
    "": ["Ho pensato a te.", "Grazie di tutto.", "A presto."],
    compleanno: ["Tanti auguri!", "Un anno in più, un fiore in più.", "Buon compleanno, da tutti noi."],
    laurea: ["Bravissima, dottoressa!", "Bravissimo, dottore!", "Ce l'hai fatta."],
    scusa: ["Avevi ragione tu.", "Scusami.", "Lo so, lo so."],
    nascita: ["Benvenuto al mondo.", "Benvenuta al mondo.", "Che gioia grande."],
    matrimonio: ["Viva gli sposi!", "Tanta felicità.", "Per il vostro giorno."],
    lutto: ["Vi siamo vicini.", "Con affetto.", "Sentite condoglianze."]
  };
  var note = $("[data-note]"), ideas = $("[data-ideas]"), occ = $("[data-occasion]");
  var ticket = $("[data-ticket]");
  function showNote() {
    var v = note.value.trim();
    $("[data-note-count]").textContent = note.value.length;
    ticket.hidden = !v;
    $("[data-ticket-text]").textContent = v;
  }
  function showIdeas() {
    ideas.innerHTML = "";
    IDEAS[occ.value || ""].forEach(function (t) {
      var b = document.createElement("button");
      b.type = "button"; b.className = "idea"; b.textContent = t;
      b.addEventListener("click", function () { note.value = t; showNote(); });
      ideas.appendChild(b);
    });
  }
  note.addEventListener("input", showNote);
  occ.addEventListener("change", showIdeas);
  if (IDEAS[q.get("occasione")]) occ.value = q.get("occasione");
  if (occ.value === "lutto") state.tone = "bianco";
  if (q.get("biglietto")) note.value = q.get("biglietto").slice(0, 140);
  showIdeas(); showNote();

  // ---- consegna
  var delivery = $("[data-delivery]");
  Array.prototype.forEach.call(form.elements.modo, function (r) {
    r.addEventListener("change", function () { delivery.hidden = form.elements.modo.value !== "consegna"; summary(); });
  });
  function iso(d) { return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }
  var day = $("[data-day]"); day.min = iso(new Date());

  function err(name, msg) {
    var box = form.querySelector('[data-err="' + name + '"]');
    box.textContent = msg || "";
    var f = form.elements[name];
    if (f && f.setAttribute) f.setAttribute("aria-invalid", msg ? "true" : "false");
    return msg ? (f && f.focus ? f : $(".pick")) : null;
  }
  function validate() {
    var bad = [], f = form.elements;
    bad.push(err("fiori", state.flowers.length ? "" : "Scegli almeno un fiore."));
    var msg = "";
    if (!f.giorno.value) msg = "Scegli il giorno.";
    else if (f.giorno.value < day.min) msg = "Questo giorno è già passato.";
    else if (new Date(f.giorno.value + "T12:00").getDay() === 0 && f.fascia.value === "pomeriggio") msg = "La domenica pomeriggio il banco è chiuso: scegli la mattina.";
    bad.push(err("giorno", msg));
    bad.push(err("nome", f.nome.value.trim().length < 2 ? "Scrivi il tuo nome." : ""));
    var home = f.modo.value === "consegna";
    bad.push(err("destinatario", home && !f.destinatario.value.trim() ? "Scrivi a chi portiamo i fiori." : ""));
    bad.push(err("indirizzo", home && !f.indirizzo.value.trim() ? "Scrivi dove portarli." : ""));
    return bad.filter(Boolean);
  }
  ["giorno", "nome", "destinatario", "indirizzo", "fascia"].forEach(function (n) {
    var f = form.elements[n];
    f.addEventListener("change", function () { if (form.dataset.tried) validate(); });
  });
  function message() {
    var f = form.elements, s = SIZES[state.size];
    var t = ["Prova della demo Fiordaliso (sito dimostrativo di Mockly, nessun fiore parte davvero).", "",
      "Mazzo " + s.name.toLowerCase() + " da " + s.stems + " steli",
      "Fiori: " + state.flowers.map(function (id) { return SP[id].name; }).join(", "),
      "Colore: " + (state.tone === "misto" ? "Misto" : TONES[state.tone].name)];
    if (occ.value) t.push("Occasione: " + occ.options[occ.selectedIndex].text);
    if (note.value.trim()) t.push('Biglietto: "' + note.value.trim() + '"');
    var d = new Date(f.giorno.value + "T12:00").toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long" });
    t.push((f.modo.value === "consegna" ? "Consegna" : "Ritiro al banco") + ": " + d + ", " + f.fascia.value);
    if (f.modo.value === "consegna") t.push("Per: " + f.destinatario.value.trim() + ", " + f.indirizzo.value.trim());
    t.push("Nome: " + f.nome.value.trim(), "Totale di esempio: " + euro(total()));
    return t.join("\n");
  }
  var send = $("[data-send]"), done = $("[data-done]");
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    form.dataset.tried = 1;
    var bad = validate();
    if (bad.length) { bad[0].scrollIntoView({ block: "center" }); if (bad[0].focus) bad[0].focus({ preventScroll: true }); return; }
    var url = WA + encodeURIComponent(message());
    $("[data-wa]").href = url;
    send.classList.add("is-busy"); send.textContent = "Preparo il messaggio…";
    window.open(url, "_blank", "noopener");
    setTimeout(function () {
      form.hidden = true; done.hidden = false; done.focus();
      send.classList.remove("is-busy"); send.textContent = "Prepara l'ordine su WhatsApp";
    }, 350);
  });
  $("[data-again]").addEventListener("click", function () {
    form.hidden = false; done.hidden = true; send.focus();
  });

  // ---- la barra in basso sparisce quando serve spazio
  var bar = $("[data-paybar]");
  var seen = false, typing = false;
  function paint() { bar.classList.toggle("is-away", seen || typing); }
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (en) { seen = en[0].isIntersecting; paint(); }).observe($(".summary"));
  }
  form.addEventListener("focusin", function (e) {
    typing = /INPUT|TEXTAREA|SELECT/.test(e.target.tagName) && e.target.type !== "radio";
    document.body.classList.toggle("typing", typing);
    paint();
  });
  form.addEventListener("focusout", function () { typing = false; document.body.classList.remove("typing"); paint(); });

  render(false);
})();
