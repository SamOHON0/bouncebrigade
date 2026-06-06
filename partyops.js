/*
 * PartyOps integration for the Bounce Brigade test site.
 * Feeds castles live from PartyOps and opens the official PartyOps booking
 * widget (the /embed iframe) when a castle is clicked.
 *
 * Public contract used (see PartyOps README):
 *   GET  {origin}/api/products?business_id={uuid}
 *        -> [{ id, name, description, price_per_day, image_url,
 *              quantity_available, delivery_fee }]
 *   embed {origin}/embed/{businessId}?item={slug}   (booking + availability + payment)
 */
(function () {
  "use strict";
  var CFG = window.PARTYOPS || {};
  var state = { live: false, products: [] };

  // Slugify a product name the same way PartyOps seed slugs are formed
  // ("Bouncy Castle & Slide Combo Units" -> "bouncy-castle-and-slide-combo-units",
  //  "Gazebo 4.5 Mtr x 3 Mtr" -> "gazebo-45-mtr-x-3-mtr").
  function slugify(name) {
    return String(name)
      .toLowerCase()
      .replace(/&/g, " and ")
      .replace(/['".]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function euro(n) {
    return "€" + Number(n).toLocaleString("en-IE");
  }

  function fromPartyOps(p) {
    var priceOnRequest = !p.price_per_day || Number(p.price_per_day) === 0;
    return {
      name: p.name,
      description: p.description || "",
      priceLabel: priceOnRequest ? "Call for price" : euro(p.price_per_day) + " / day",
      image: p.image_url || "",
      inStock: Number(p.quantity_available) > 0,
      deliveryFee: Number(p.delivery_fee) || 0,
      slug: p.slug || slugify(p.name)
    };
  }

  function fromFallback(c) {
    return {
      name: c.name,
      description: c.description || "",
      priceLabel: c.price ? euro(c.price) + " / day" : "Call for price",
      image: c.image || "",
      inStock: c.available !== false,
      deliveryFee: 0,
      slug: c.id || slugify(c.name)
    };
  }

  function fetchLive() {
    if (!CFG.origin || !CFG.businessId) return Promise.reject(new Error("no config"));
    var url = CFG.origin.replace(/\/$/, "") + "/api/products?business_id=" + encodeURIComponent(CFG.businessId);
    return fetch(url, { mode: "cors" }).then(function (r) {
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.json();
    }).then(function (data) {
      if (!Array.isArray(data)) throw new Error("unexpected response");
      return data.map(fromPartyOps);
    });
  }

  function fetchFallback() {
    return fetch(CFG.fallbackCatalogue || "catalogue.json")
      .then(function (r) { return r.json(); })
      .then(function (d) { return (d.castles || []).map(fromFallback); });
  }

  function escapeHTML(s) {
    return String(s).replace(/[&<>]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]; });
  }
  function escapeAttr(s) {
    return String(s).replace(/"/g, "&quot;").replace(/</g, "&lt;");
  }

  function cardHTML(item) {
    var img = item.image
      ? '<img src="' + item.image + '" alt="' + escapeAttr(item.name) + '" loading="lazy" onerror="this.onerror=null;this.src=\'images/castle-classic.svg\'"/>'
      : '<img src="images/castle-classic.svg" alt="' + escapeAttr(item.name) + '"/>';
    var soldout = item.inStock ? "" : '<span class="cc-soldout">Currently out</span>';
    var delivery = item.deliveryFee > 0
      ? '<span class="cc-spec">+ ' + euro(item.deliveryFee) + ' delivery</span>'
      : '<span class="cc-spec">Free delivery</span>';
    var tag = item.inStock
      ? '<span class="cc-tag" style="background:var(--green)">In stock</span>'
      : '<span class="cc-tag" style="background:var(--coral);color:#fff">Out</span>';
    return '' +
      '<article class="cc" data-slug="' + escapeAttr(item.slug) + '" data-name="' + escapeAttr(item.name) + '" tabindex="0" role="button" aria-label="Book ' + escapeAttr(item.name) + '" style="cursor:pointer">' +
        '<div class="cc-img">' + img + soldout + '</div>' +
        '<div class="cc-body">' +
          '<h3>' + escapeHTML(item.name) + '</h3>' +
          '<p class="cc-desc">' + escapeHTML(item.description) + '</p>' +
          '<div class="cc-specs">' + delivery + '</div>' +
          '<div class="cc-footer">' +
            '<span class="cc-price">' + escapeHTML(item.priceLabel) + '</span>' +
            tag +
          '</div>' +
          '<span class="btn" style="margin-top:12px;text-align:center;pointer-events:none">Book this castle</span>' +
        '</div>' +
      '</article>';
  }

  function bindGrid(grid) {
    grid.addEventListener("click", function (e) {
      var card = e.target.closest(".cc[data-slug]");
      if (card) openBooking(card.getAttribute("data-slug"), card.getAttribute("data-name"));
    });
    grid.addEventListener("keydown", function (e) {
      if (e.key !== "Enter" && e.key !== " ") return;
      var card = e.target.closest(".cc[data-slug]");
      if (card) { e.preventDefault(); openBooking(card.getAttribute("data-slug"), card.getAttribute("data-name")); }
    });
  }

  function setStatus(msg) {
    var s = document.getElementById("po-status");
    if (s) s.innerHTML = msg;
  }

  function liveNotice(n) {
    return "🟢 Live from PartyOps · " + n + " castle" + (n === 1 ? "" : "s") +
           " · business <code>" + escapeHTML((CFG.businessId || "").slice(0, 8)) + "…</code>";
  }
  function offlineNotice() {
    return "🟡 PartyOps not reachable at <code>" + escapeHTML(CFG.origin || "?") +
           "</code> — showing offline fallback. Start PartyOps, then reload.";
  }

  function renderGrid(grid, opts) {
    opts = opts || {};
    grid.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:var(--mid);font-weight:700">Loading castles from PartyOps…</p>';
    bindGrid(grid);

    fetchLive()
      .then(function (items) { state.live = true; return items; })
      .catch(function () { state.live = false; setStatus(offlineNotice()); return fetchFallback(); })
      .then(function (items) {
        state.products = items;
        var shown = opts.limit ? items.slice(0, opts.limit) : items;
        if (!shown.length) {
          grid.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:var(--mid)">No castles returned.</p>';
          return;
        }
        grid.innerHTML = shown.map(cardHTML).join("");
        if (state.live) setStatus(liveNotice(items.length));
      })
      .catch(function (err) {
        grid.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:var(--coral);font-weight:700">Could not load castles: ' + escapeHTML(err.message) + '</p>';
      });
  }

  function ensureModal() {
    var m = document.getElementById("po-modal");
    if (m) return m;
    m = document.createElement("div");
    m.id = "po-modal";
    m.innerHTML =
      '<div class="po-modal-backdrop" data-close="1"></div>' +
      '<div class="po-modal-card" role="dialog" aria-modal="true">' +
        '<div class="po-modal-head"><strong id="po-modal-title">Book</strong><button class="po-modal-x" data-close="1" aria-label="Close">✕</button></div>' +
        '<div class="po-modal-body" id="po-modal-body"></div>' +
      '</div>';
    document.body.appendChild(m);
    m.addEventListener("click", function (e) {
      if (e.target.getAttribute("data-close")) closeBooking();
    });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeBooking(); });
    injectModalStyles();
    return m;
  }

  function openBooking(slug, name) {
    var m = ensureModal();
    document.getElementById("po-modal-title").textContent = name ? ("Book · " + name) : "Book";
    var body = document.getElementById("po-modal-body");
    if (state.live && CFG.origin && CFG.businessId) {
      var src = CFG.origin.replace(/\/$/, "") + "/embed/" + encodeURIComponent(CFG.businessId) +
                (slug ? "?item=" + encodeURIComponent(slug) : "");
      body.innerHTML = '<iframe id="po-embed" src="' + src + '" title="PartyOps booking widget" style="width:100%;height:780px;border:0;display:block"></iframe>';
    } else {
      body.innerHTML = '<div style="padding:30px;text-align:center">' +
        '<p style="font-weight:800;font-size:18px;margin-bottom:10px">Booking runs through PartyOps</p>' +
        '<p style="color:var(--mid);font-weight:600">This is the offline fallback, so the live booking widget is not available. ' +
        'Start PartyOps at <code>' + escapeHTML(CFG.origin || "?") + '</code> and reload to book <strong>' + escapeHTML(name || "") + '</strong>.</p></div>';
    }
    m.classList.add("open");
    document.body.style.overflow = "hidden";
  }

  function closeBooking() {
    var m = document.getElementById("po-modal");
    if (!m) return;
    m.classList.remove("open");
    document.getElementById("po-modal-body").innerHTML = "";
    document.body.style.overflow = "";
  }

  window.addEventListener("message", function (event) {
    if (!CFG.origin) return;
    try { if (event.origin !== new URL(CFG.origin).origin) return; } catch (e) { return; }
    var d = event.data;
    if (d && (d.type === "partyops:height" || d.type === "rental-widget:height") && typeof d.height === "number") {
      var f = document.getElementById("po-embed");
      if (f) f.style.height = d.height + "px";
    }
  });

  function injectModalStyles() {
    if (document.getElementById("po-modal-styles")) return;
    var css = document.createElement("style");
    css.id = "po-modal-styles";
    css.textContent =
      "#po-modal{position:fixed;inset:0;z-index:1000;display:none}" +
      "#po-modal.open{display:block}" +
      ".po-modal-backdrop{position:absolute;inset:0;background:rgba(20,40,55,.55);backdrop-filter:blur(2px)}" +
      ".po-modal-card{position:relative;max-width:820px;margin:32px auto;background:#fff;border-radius:20px;box-shadow:0 24px 60px rgba(20,40,55,.35);overflow:hidden;max-height:calc(100vh - 64px);display:flex;flex-direction:column}" +
      ".po-modal-head{display:flex;align-items:center;justify-content:space-between;padding:14px 18px;border-bottom:1px solid var(--line)}" +
      ".po-modal-x{background:none;border:none;font-size:18px;cursor:pointer;color:var(--mid);padding:6px}" +
      ".po-modal-body{overflow:auto}";
    document.head.appendChild(css);
  }

  window.BounceBrigade = { renderGrid: renderGrid, openBooking: openBooking, slugify: slugify };

  document.addEventListener("DOMContentLoaded", function () {
    var grids = document.querySelectorAll("[data-partyops-grid]");
    for (var i = 0; i < grids.length; i++) {
      var limit = parseInt(grids[i].getAttribute("data-limit") || "0", 10);
      renderGrid(grids[i], { limit: limit || 0 });
    }
  });
})();
