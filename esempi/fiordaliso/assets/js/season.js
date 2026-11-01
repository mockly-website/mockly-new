// Sceglie la stagione dalla data, prima che la pagina si disegni.
(function () {
  var root = document.documentElement;
  var month = new Date().getMonth();
  var season = month < 2 || month === 11 ? "inverno" : month < 5 ? "primavera" : month < 8 ? "estate" : "autunno";
  try {
    season = sessionStorage.getItem("fiordaliso-stagione") || season;
  } catch (e) {}
  root.dataset.season = season;
  root.classList.add("js");
})();
