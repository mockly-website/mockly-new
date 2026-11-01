/* Lama & Pettine — demo Mockly
   Vanilla JS, nessuna dipendenza. Tutto funziona anche senza animazioni. */

(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  var body = document.body;
  var header = document.querySelector(".site-header");
  var pole = document.querySelector(".pole-progress");
  var thumbCta = document.querySelector(".thumb-cta");
  var hero = document.querySelector(".hero");
  var poleStripes = document.querySelector(".pole-stripes");
  var poleShade = document.querySelector(".pole-shade");
  var stripeBands = Array.prototype.slice.call(document.querySelectorAll(".stripe-band span"));
  var stripePeriod = 36 * Math.SQRT2;
  var polePeakScale = 2.4;

  function prefersReduced() {
    return reduceMotion.matches;
  }

  /* ----------------------------------------------------------------------
     Intestazione e palo: rotazione legata allo scroll, percentuale illuminata
     ---------------------------------------------------------------------- */

  var scrollTicking = false;

  var scrollShift = 0;
  var idleShift = 0;
  var shopOpen = false;
  var spinUntil = 0;
  var spinning = false;
  var lastFrame = 0;

  function applyStripes() {
    var shift = (scrollShift + idleShift) % stripePeriod;
    if (poleStripes) {
      poleStripes.style.transform = "translate3d(0, " + (-shift).toFixed(1) + "px, 0)";
    }
    stripeBands.forEach(function (band) {
      band.style.transform = "translate3d(" + (-shift).toFixed(1) + "px, 0, 0)";
    });
  }

  /* All'apertura il palo fa un giro; poi gira da solo solo a bottega aperta. */
  function spinFrame(time) {
    var intro = time < spinUntil;
    if ((!intro && !shopOpen) || prefersReduced()) {
      spinning = false;
      return;
    }
    var delta = Math.min(50, time - (lastFrame || time));
    lastFrame = time;
    idleShift += delta * (intro ? 0.09 : 0.016);
    applyStripes();
    window.requestAnimationFrame(spinFrame);
  }

  function startSpin() {
    if (spinning || prefersReduced()) return;
    spinning = true;
    lastFrame = 0;
    window.requestAnimationFrame(spinFrame);
  }

  function updateScrollEffects() {
    var top = window.scrollY || window.pageYOffset || 0;
    var max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    var progress = Math.min(1, Math.max(0, top / max));

    if (header) {
      header.classList.toggle("is-scrolled", top > 8);
    }

    if (poleShade) {
      poleShade.style.transform = "scaleY(" + (1 - progress).toFixed(4) + ")";
    }

    if (!prefersReduced()) {
      /* Le strisce si ripetono ogni 50,9px: il modulo le fa girare per sempre. */
      scrollShift = top * 0.36;
      applyStripes();

      /* Palo grande nella prima schermata, poi si stringe e diventa barra. */
      if (pole && hero) {
        var leaving = Math.min(1, top / Math.max(1, hero.offsetHeight * 0.7));
        var scale = 1 + (polePeakScale - 1) * (1 - leaving);
        pole.style.transform = "scaleX(" + scale.toFixed(3) + ")";
      }
    }

    if (thumbCta && hero) {
      var passedHero = top > Math.max(240, hero.offsetHeight * 0.62);
      var hideForMenu = body.classList.contains("menu-aperto");
      var hideForTarget =
        body.classList.contains("prenota-in-vista") ||
        body.classList.contains("chiusura-in-vista") ||
        body.classList.contains("footer-in-vista");
      thumbCta.classList.toggle(
        "is-visible",
        passedHero && !hideForMenu && !hideForTarget
      );
    }

    scrollTicking = false;
  }

  function requestScrollUpdate() {
    if (!scrollTicking) {
      scrollTicking = true;
      window.requestAnimationFrame(updateScrollEffects);
    }
  }

  window.addEventListener("scroll", requestScrollUpdate, { passive: true });
  window.addEventListener("resize", requestScrollUpdate);

  /* ----------------------------------------------------------------------
     Comparse allo scroll
     ---------------------------------------------------------------------- */

  var revealItems = Array.prototype.slice.call(document.querySelectorAll(".reveal"));

  revealItems.forEach(function (item) {
    var section = item.closest("section");
    var group = section
      ? Array.prototype.slice.call(section.querySelectorAll(".reveal"))
      : revealItems;
    var index = group.indexOf(item);
    item.style.setProperty("--reveal-delay", Math.min(index * 55, 220) + "ms");
  });

  if ("IntersectionObserver" in window) {
    var revealObserver = new IntersectionObserver(
      function (entries, observer) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -7% 0px", threshold: 0.06 }
    );

    revealItems.forEach(function (item) {
      revealObserver.observe(item);
    });
  } else {
    revealItems.forEach(function (item) {
      item.classList.add("is-visible");
    });
  }

  /* ----------------------------------------------------------------------
     Menu: dialog nativo, chiusura con X, Esc e tocco fuori
     ---------------------------------------------------------------------- */

  var menu = document.getElementById("menu");
  var menuOpen = document.querySelector(".menu-open");
  var menuClose = document.querySelector(".menu-close");
  var menuLinks = menu ? Array.prototype.slice.call(menu.querySelectorAll("a[href^='#']")) : [];

  function syncMenuState(open) {
    if (menuOpen) {
      menuOpen.setAttribute("aria-expanded", open ? "true" : "false");
    }
    body.classList.toggle("menu-aperto", open);
    if (open && thumbCta) {
      thumbCta.classList.remove("is-visible");
    }
    requestScrollUpdate();
  }

  function openMenu() {
    if (!menu || !menuOpen) return;
    if (typeof menu.showModal === "function") {
      if (!menu.open) menu.showModal();
    } else {
      menu.setAttribute("open", "");
    }
    syncMenuState(true);
  }

  function closeMenu(restoreFocus) {
    if (!menu) return;
    if (menu.open && typeof menu.close === "function") {
      menu.close();
    } else {
      menu.removeAttribute("open");
    }
    syncMenuState(false);
    if (restoreFocus !== false && menuOpen && menuOpen.offsetParent !== null) {
      menuOpen.focus();
    }
  }

  if (menu && menuOpen) {
    menuOpen.addEventListener("click", openMenu);

    if (menuClose) {
      menuClose.addEventListener("click", function () {
        closeMenu(true);
      });
    }

    menu.addEventListener("cancel", function (event) {
      event.preventDefault();
      closeMenu(true);
    });

    menu.addEventListener("close", function () {
      syncMenuState(false);
    });

    menu.addEventListener("click", function (event) {
      if (event.target === menu) {
        closeMenu(true);
      }
    });

    menuLinks.forEach(function (link) {
      link.addEventListener("click", function (event) {
        var hash = link.getAttribute("href");
        var target = hash && hash.length > 1 ? document.querySelector(hash) : null;
        event.preventDefault();
        closeMenu(false);
        if (target) {
          window.setTimeout(function () {
            if (window.location.hash !== hash) {
              window.location.hash = hash;
            } else {
              target.scrollIntoView({ block: "start" });
            }
            target.setAttribute("tabindex", "-1");
            target.classList.add("focus-target");
            target.focus({ preventScroll: true });
          }, 30);
        }
      });
    });
  }

  /* ----------------------------------------------------------------------
     Listino: conto, riepilogo e stati vuoti
     ---------------------------------------------------------------------- */

  var servicesForm = document.getElementById("servizi");
  var receiptLines = document.getElementById("receipt-lines");
  var receiptEmpty = document.getElementById("receipt-empty");
  var totalEl = document.getElementById("totale");
  var summaryChoices = document.getElementById("riepilogo-scelte");
  var summaryTotal = document.getElementById("riepilogo-totale");
  var thumbTotal = document.getElementById("thumb-totale");
  var servicesError = document.getElementById("errore-servizi");
  var resetButton = document.getElementById("azzera-conto");

  function formatPrice(value) {
    return String(value) + " €";
  }

  function getSelectedServices() {
    if (!servicesForm) return [];

    var chosen = [];
    var taglio = servicesForm.querySelector('input[name="taglio"]:checked');
    var extras = servicesForm.querySelectorAll('input[name="extra"]:checked');

    if (taglio) {
      chosen.push({
        name: taglio.getAttribute("data-name") || "Taglio",
        price: Number(taglio.getAttribute("data-price")) || 0
      });
    }

    Array.prototype.forEach.call(extras, function (extra) {
      chosen.push({
        name: extra.getAttribute("data-name") || "Aggiunta",
        price: Number(extra.getAttribute("data-price")) || 0
      });
    });

    return chosen;
  }

  function buildReceiptLine(service) {
    var line = document.createElement("div");
    line.className = "receipt-line";
    var name = document.createElement("span");
    var price = document.createElement("span");
    name.textContent = service.name;
    price.textContent = formatPrice(service.price);
    line.appendChild(name);
    line.appendChild(price);
    return line;
  }

  function buildSummaryLine(service) {
    var line = document.createElement("p");
    line.className = "summary-line";
    var name = document.createElement("span");
    var price = document.createElement("span");
    name.textContent = service.name;
    price.textContent = formatPrice(service.price);
    line.appendChild(name);
    line.appendChild(price);
    return line;
  }

  function bumpElement(element) {
    if (!element || prefersReduced()) return;
    element.classList.remove("is-bump");
    /* Riavvia l'animazione solo quando il totale cambia davvero. */
    void element.offsetWidth;
    element.classList.add("is-bump");
  }

  function renderServices(animate) {
    var services = getSelectedServices();
    var total = services.reduce(function (sum, service) {
      return sum + service.price;
    }, 0);

    if (receiptLines) {
      receiptLines.replaceChildren();
      services.forEach(function (service) {
        receiptLines.appendChild(buildReceiptLine(service));
      });
    }

    if (receiptEmpty) {
      receiptEmpty.hidden = services.length > 0;
    }

    if (totalEl) {
      totalEl.textContent = formatPrice(total);
    }

    if (summaryChoices) {
      summaryChoices.replaceChildren();
      if (services.length) {
        services.forEach(function (service) {
          summaryChoices.appendChild(buildSummaryLine(service));
        });
      } else {
        var empty = document.createElement("p");
        empty.className = "summary-empty";
        empty.textContent = "Nessun servizio scelto. Il conto si fa al listino.";
        summaryChoices.appendChild(empty);
      }
    }

    if (summaryTotal) {
      summaryTotal.textContent = formatPrice(total);
    }

    if (thumbTotal) {
      thumbTotal.textContent = services.length ? formatPrice(total) : "vuoto";
    }

    if (animate) {
      bumpElement(totalEl);
      bumpElement(summaryTotal);
      bumpElement(thumbTotal);
    }

    return { services: services, total: total };
  }

  if (servicesForm) {
    servicesForm.addEventListener("change", function (event) {
      if (event.target && event.target.matches("input")) {
        renderServices(true);
        if (servicesError) servicesError.textContent = "";
        invalidateResult();
      }
    });
  }

  if (resetButton) {
    resetButton.addEventListener("click", function () {
      if (!servicesForm) return;
      servicesForm.reset();
      Array.prototype.forEach.call(
        servicesForm.querySelectorAll('input[name="taglio"]'),
        function (input) {
          input.checked = false;
        }
      );
      renderServices(true);
      if (servicesError) servicesError.textContent = "";
      invalidateResult();
    });
  }

  ["animationend", "webkitAnimationEnd"].forEach(function (eventName) {
    [totalEl, summaryTotal, thumbTotal].forEach(function (element) {
      if (element) {
        element.addEventListener(eventName, function () {
          element.classList.remove("is-bump");
        });
      }
    });
  });

  /* ----------------------------------------------------------------------
     Orari di Cagliari, stato aperto/chiuso e prossima apertura
     ---------------------------------------------------------------------- */

  var schedule = {
    0: [],
    1: [],
    2: [[540, 780], [960, 1200]],
    3: [[540, 780], [960, 1200]],
    4: [[540, 780], [960, 1200]],
    5: [[540, 780], [960, 1260]],
    6: [[540, 1080]]
  };

  var dayNames = [
    "domenica",
    "lunedì",
    "martedì",
    "mercoledì",
    "giovedì",
    "venerdì",
    "sabato"
  ];

  var romeFormatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Rome",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23"
  });

  function pad(value) {
    return String(value).padStart(2, "0");
  }

  function romeNow() {
    var parts = {};
    romeFormatter.formatToParts(new Date()).forEach(function (part) {
      if (part.type !== "literal") parts[part.type] = part.value;
    });

    var year = Number(parts.year);
    var month = Number(parts.month);
    var day = Number(parts.day);
    var hour = Number(parts.hour);
    var minute = Number(parts.minute);
    var weekday = new Date(Date.UTC(year, month - 1, day)).getUTCDay();

    return {
      year: year,
      month: month,
      day: day,
      hour: hour,
      minute: minute,
      weekday: weekday,
      minutes: hour * 60 + minute,
      dateString: year + "-" + pad(month) + "-" + pad(day),
      timeString: pad(hour) + ":" + pad(minute)
    };
  }

  function timeLabel(minutes) {
    return pad(Math.floor(minutes / 60)) + ":" + pad(minutes % 60);
  }

  function nextOpening(now) {
    for (var offset = 0; offset < 7; offset += 1) {
      var weekday = (now.weekday + offset) % 7;
      var ranges = schedule[weekday];

      for (var index = 0; index < ranges.length; index += 1) {
        var start = ranges[index][0];
        if (offset === 0 && start <= now.minutes) continue;
        return { offset: offset, weekday: weekday, start: start };
      }
    }
    return null;
  }

  var stateEl = document.getElementById("orari-state");
  var stateWord = document.getElementById("stato-parola");
  var nextEl = document.getElementById("prossima-apertura");
  var clockEl = document.getElementById("ora-cagliari");
  var hoursList = document.getElementById("orari-list");
  var bookingDate = document.getElementById("giorno");
  var lastToday = null;

  function updateTodayRow(weekday) {
    if (!hoursList || lastToday === weekday) return;
    lastToday = weekday;
    Array.prototype.forEach.call(hoursList.querySelectorAll("li"), function (item) {
      var isToday = Number(item.getAttribute("data-day")) === weekday;
      item.classList.toggle("is-today", isToday);
      if (isToday) {
        item.setAttribute("aria-current", "date");
      } else {
        item.removeAttribute("aria-current");
      }
    });
  }

  function updateOpeningStatus() {
    var now = romeNow();
    var openRange = null;

    schedule[now.weekday].forEach(function (range) {
      if (now.minutes >= range[0] && now.minutes < range[1]) {
        openRange = range;
      }
    });

    updateTodayRow(now.weekday);

    shopOpen = Boolean(openRange);
    if (shopOpen) startSpin();

    if (stateEl && stateWord) {
      if (openRange) {
        stateEl.setAttribute("data-state", "open");
        stateWord.textContent = "Aperto ora";
      } else {
        stateEl.setAttribute("data-state", "closed");
        stateWord.textContent = "Chiuso ora";
      }
    }

    if (nextEl) {
      if (openRange) {
        nextEl.textContent = "Si chiude alle " + timeLabel(openRange[1]) + ".";
      } else {
        var next = nextOpening(now);
        if (next) {
          var when =
            next.offset === 0
              ? "oggi"
              : next.offset === 1
                ? "domani"
                : dayNames[next.weekday];
          var isLunch = next.offset === 0 && now.minutes >= 540;
          nextEl.textContent =
            (isLunch ? "Pausa pranzo. Riapre oggi alle " : "Riapre " + when + " alle ") +
            timeLabel(next.start) +
            ".";
        } else {
          nextEl.textContent = "Riapre martedì alle 09:00.";
        }
      }
    }

    if (clockEl) {
      clockEl.textContent = now.timeString;
      clockEl.setAttribute(
        "datetime",
        now.dateString + "T" + now.timeString
      );
    }

    if (bookingDate) {
      bookingDate.min = now.dateString;
    }
  }

  updateOpeningStatus();
  window.setInterval(updateOpeningStatus, 30000);

  /* ----------------------------------------------------------------------
     Navigazione fuori dal menu: fuoco sul bersaglio, non solo scroll
     ---------------------------------------------------------------------- */

  Array.prototype.forEach.call(
    document.querySelectorAll('.skip-link, a[href="#contenuto"]'),
    function (skipLink) {
      skipLink.addEventListener("click", function () {
        var main = document.getElementById("contenuto");
        if (!main) return;
        main.setAttribute("tabindex", "-1");
        main.classList.add("focus-target");
        window.setTimeout(function () {
          main.focus({ preventScroll: true });
        }, 10);
      });
    }
  );

  /* ----------------------------------------------------------------------
     Prenotazione: controlli, stato di invio, riepilogo WhatsApp
     ---------------------------------------------------------------------- */

  var bookingForm = document.getElementById("form-prenota");
  var nameInput = document.getElementById("nome");
  var dateInput = document.getElementById("giorno");
  var slotInput = document.getElementById("fascia");
  var notesInput = document.getElementById("note");
  var submitButton = document.getElementById("invia-prenotazione");
  var submitLabel = submitButton
    ? submitButton.querySelector(".button-label")
    : null;
  var resultBox = document.getElementById("risultato");
  var resultText = document.getElementById("testo-riepilogo");
  var whatsappLink = document.getElementById("apri-whatsapp");
  var mocklyNumber = "393517578080";

  var italianDate = new Intl.DateTimeFormat("it-IT", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC"
  });

  function setFieldError(fieldId, input, message) {
    var field = document.getElementById(fieldId);
    var error = field ? field.querySelector(".field-error") : null;
    if (error) error.textContent = message || "";
    if (input) {
      if (message) {
        input.setAttribute("aria-invalid", "true");
      } else {
        input.removeAttribute("aria-invalid");
      }
    }
    if (field) field.classList.toggle("field--error", Boolean(message));
  }

  function clearErrors() {
    setFieldError("campo-nome", nameInput, "");
    setFieldError("campo-data", dateInput, "");
    setFieldError("campo-fascia", slotInput, "");
    if (servicesError) servicesError.textContent = "";
  }

  function setDateErrorPresent() {
    return Boolean(dateInput && dateInput.getAttribute("aria-invalid"));
  }

  function parseItalianDate(value) {
    if (!value) return null;
    var pieces = value.split("-").map(Number);
    if (pieces.length !== 3) return null;
    var date = new Date(Date.UTC(pieces[0], pieces[1] - 1, pieces[2], 12));
    if (
      date.getUTCFullYear() !== pieces[0] ||
      date.getUTCMonth() !== pieces[1] - 1 ||
      date.getUTCDate() !== pieces[2]
    ) {
      return null;
    }
    return date;
  }

  function validateBooking() {
    var firstInvalid = null;
    clearErrors();

    var nameValue = nameInput ? nameInput.value.trim().replace(/\s+/g, " ") : "";
    if (!nameValue) {
      setFieldError("campo-nome", nameInput, "Scrivi il tuo nome.");
      if (!firstInvalid) firstInvalid = nameInput;
    } else if (nameValue.length < 2) {
      setFieldError("campo-nome", nameInput, "Il nome è troppo corto.");
      if (!firstInvalid) firstInvalid = nameInput;
    }

    var now = romeNow();
    var dateValue = dateInput ? dateInput.value : "";
    var selectedDate = parseItalianDate(dateValue);
    if (!dateValue || !selectedDate) {
      setFieldError("campo-data", dateInput, "Scegli un giorno.");
      if (!firstInvalid) firstInvalid = dateInput;
    } else if (dateValue < now.dateString) {
      setFieldError("campo-data", dateInput, "Questa data è già passata.");
      if (!firstInvalid) firstInvalid = dateInput;
    } else if (schedule[selectedDate.getUTCDay()].length === 0) {
      setFieldError(
        "campo-data",
        dateInput,
        "La bottega è chiusa quel giorno: scegli da martedì a sabato."
      );
      if (!firstInvalid) firstInvalid = dateInput;
    }

    var isToday = dateValue === now.dateString;
    var todayRanges = isToday ? schedule[now.weekday] : [];
    if (
      todayRanges.length &&
      !setDateErrorPresent() &&
      now.minutes >= todayRanges[todayRanges.length - 1][1]
    ) {
      setFieldError("campo-data", dateInput, "Per oggi la bottega ha già chiuso: scegli un altro giorno.");
      if (!firstInvalid) firstInvalid = dateInput;
    }

    if (!slotInput || !slotInput.value) {
      setFieldError("campo-fascia", slotInput, "Scegli mattina o pomeriggio.");
      if (!firstInvalid) firstInvalid = slotInput;
    } else if (isToday && slotInput.value === "Mattina" && now.minutes >= 780) {
      setFieldError("campo-fascia", slotInput, "La mattina di oggi è già passata: scegli il pomeriggio.");
      if (!firstInvalid) firstInvalid = slotInput;
    }

    var selection = getSelectedServices();
    if (!selection.length) {
      if (servicesError) {
        servicesError.textContent =
          "Scegli almeno un servizio dal listino. Il conto si prepara lì.";
      }
      if (!firstInvalid && submitButton) firstInvalid = submitButton;
    }

    return {
      ok: !firstInvalid,
      firstInvalid: firstInvalid,
      services: selection,
      total: selection.reduce(function (sum, service) {
        return sum + service.price;
      }, 0)
    };
  }

  function buildMessage(values) {
    var now = romeNow();
    var date = parseItalianDate(dateInput.value);
    var humanDate = date ? italianDate.format(date) : "";

    var lines = [
      "Ciao Mockly, questa è una DEMO di prenotazione per Lama & Pettine (attività inventata).",
      "",
      "Nome: " + nameInput.value.trim().replace(/\s+/g, " "),
      "Giorno: " + humanDate,
      "Fascia: " + slotInput.value,
      "Servizi:"
    ];

    values.services.forEach(function (service) {
      lines.push("- " + service.name + ": " + formatPrice(service.price));
    });

    lines.push("Totale di esempio: " + formatPrice(values.total));

    var notes = notesInput ? notesInput.value.trim() : "";
    if (notes) {
      lines.push("Note: " + notes);
    }

    lines.push(
      "",
      "Prezzi, orari e indirizzo sono di esempio. Messaggio preparato il " +
        now.dateString +
        " alle " +
        now.timeString +
        " (ora di Cagliari). Nessun dato è stato inviato automaticamente."
    );

    return lines.join("\n");
  }

  function resetResult() {
    if (!resultBox) return;
    if (!resultBox.hidden) {
      resultBox.hidden = true;
      if (resultText) resultText.textContent = "";
      if (whatsappLink) {
        whatsappLink.href = "https://wa.me/" + mocklyNumber;
      }
    }
    if (submitButton && !submitButton.classList.contains("is-sending")) {
      if (submitLabel) submitLabel.textContent = "Prepara il messaggio";
    }
  }

  function invalidateResult() {
    resetResult();
  }

  [nameInput, dateInput, slotInput, notesInput].forEach(function (input) {
    if (!input) return;
    input.addEventListener("input", function () {
      if (input === nameInput) setFieldError("campo-nome", nameInput, "");
      if (input === dateInput) setFieldError("campo-data", dateInput, "");
      if (input === slotInput) setFieldError("campo-fascia", slotInput, "");
      invalidateResult();
    });
    input.addEventListener("change", function () {
      if (input === dateInput) setFieldError("campo-data", dateInput, "");
      if (input === slotInput) setFieldError("campo-fascia", slotInput, "");
      invalidateResult();
    });
  });

  if (bookingForm) {
    bookingForm.addEventListener("submit", function (event) {
      event.preventDefault();
      var validation = validateBooking();

      if (!validation.ok) {
        if (validation.firstInvalid) validation.firstInvalid.focus();
        return;
      }

      if (!submitButton) return;
      resetResult();
      submitButton.disabled = true;
      submitButton.classList.add("is-sending");
      submitButton.setAttribute("aria-busy", "true");
      if (submitLabel) submitLabel.textContent = "Preparo il messaggio…";

      window.setTimeout(function () {
        var message = buildMessage(validation);
        if (resultText) resultText.textContent = message;
        if (whatsappLink) {
          whatsappLink.href =
            "https://wa.me/" +
            mocklyNumber +
            "?text=" +
            encodeURIComponent(message);
        }
        if (resultBox) {
          resultBox.hidden = false;
          window.requestAnimationFrame(function () {
            resultBox.focus({ preventScroll: true });
            resultBox.scrollIntoView({
              behavior: prefersReduced() ? "auto" : "smooth",
              block: "center"
            });
          });
        }

        submitButton.disabled = false;
        submitButton.classList.remove("is-sending");
        submitButton.removeAttribute("aria-busy");
        if (submitLabel) submitLabel.textContent = "Rigenera il messaggio";
      }, 650);
    });
  }

  /* ----------------------------------------------------------------------
     CTA fissa: visibile solo quando serve, mai sopra il modulo o la chiusura
     ---------------------------------------------------------------------- */

  var bookingSection = document.getElementById("prenota");
  var closingSection = document.getElementById("chiusura");
  var footerSection = document.querySelector(".site-footer");

  if ("IntersectionObserver" in window) {
    var targetObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.target === bookingSection) {
            body.classList.toggle("prenota-in-vista", entry.isIntersecting);
          }
          if (entry.target === closingSection) {
            body.classList.toggle("chiusura-in-vista", entry.isIntersecting);
          }
          if (entry.target === footerSection) {
            body.classList.toggle("footer-in-vista", entry.isIntersecting);
          }
        });
        requestScrollUpdate();
      },
      { threshold: 0.03 }
    );

    if (bookingSection) targetObserver.observe(bookingSection);
    if (closingSection) targetObserver.observe(closingSection);
    if (footerSection) targetObserver.observe(footerSection);
  }

  reduceMotion.addEventListener("change", function () {
    if (prefersReduced()) {
      if (pole) pole.style.transform = "none";
      if (poleStripes) poleStripes.style.transform = "none";
      stripeBands.forEach(function (band) {
        band.style.transform = "none";
      });
    }
    requestScrollUpdate();
  });

  /* ----------------------------------------------------------------------
     Avvio
     ---------------------------------------------------------------------- */

  renderServices(false);
  updateScrollEffects();
  spinUntil = window.performance.now() + 1400;
  startSpin();
  window.addEventListener("load", updateScrollEffects, { once: true });
})();
