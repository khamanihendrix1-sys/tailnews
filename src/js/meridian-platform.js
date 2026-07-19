(function () {
  "use strict";

  var config = window.MERIDIAN_CONFIG || {
    ticker: [],
    quickLinks: [],
    bookmarksKey: "meridianSavedBriefings"
  };

  function createEl(tag, className, html) {
    var el = document.createElement(tag);
    if (className) {
      el.className = className;
    }
    if (html) {
      el.innerHTML = html;
    }
    return el;
  }

  function getSaved() {
    try {
      return JSON.parse(localStorage.getItem(config.bookmarksKey) || "[]");
    } catch (e) {
      return [];
    }
  }

  function setSaved(items) {
    localStorage.setItem(config.bookmarksKey, JSON.stringify(items));
  }

  function isSaved(href) {
    return getSaved().some(function (item) {
      return item.href === href;
    });
  }

  function toggleSaved(entry) {
    var items = getSaved();
    var idx = items.findIndex(function (item) {
      return item.href === entry.href;
    });

    if (idx >= 0) {
      items.splice(idx, 1);
    } else {
      items.unshift(entry);
    }

    setSaved(items.slice(0, 40));
    return idx < 0;
  }

  function initTicker() {
    var header = document.querySelector("header");
    if (!header || !config.ticker || !config.ticker.length) {
      return;
    }

    var ticker = createEl("div", "md-ticker");
    var wrap = createEl("div", "xl:container mx-auto px-3 sm:px-4 xl:px-2");
    var rail = createEl("div", "md-ticker-rail");

    config.ticker.forEach(function (item) {
      var chip = createEl("div", "md-ticker-item");
      chip.innerHTML =
        "<span class='md-ticker-label'>" +
        item.label +
        "</span><span class='md-ticker-value'>" +
        item.value +
        "</span><span class='md-ticker-delta'>" +
        item.delta +
        "</span>";
      rail.appendChild(chip);
    });

    wrap.appendChild(rail);
    ticker.appendChild(wrap);
    header.appendChild(ticker);
    document.body.classList.add("md-has-ticker");
  }

  function initTitleLengthGuards() {
    var titleTargets = document.querySelectorAll(
      "main .hover-img h2 a, " +
      "main .hover-img h3 a, " +
      "main .hover-img h4 a, " +
      "main .md-heat-card h4"
    );

    if (!titleTargets.length) {
      return;
    }

    titleTargets.forEach(function (node) {
      var text = (node.textContent || "").replace(/\s+/g, " ").trim();
      if (!text) {
        return;
      }

      var words = text.split(" ");
      if (words.length <= 7) {
        return;
      }

      node.textContent = words.slice(0, 7).join(" ") + "...";
    });
  }

  function initMostReadLinks() {
    var rows = document.querySelectorAll("main .post-number li");
    if (!rows.length) {
      return;
    }

    rows.forEach(function (row) {
      var link = row.querySelector("a[href]");
      if (!link) {
        return;
      }

      row.classList.add("md-clickable-row");

      row.addEventListener("click", function (event) {
        if (event.target.closest("a")) {
          return;
        }

        var href = link.getAttribute("href");
        if (!href || href === "#") {
          return;
        }

        window.location.href = href;
      });
    });
  }

  function resolveAssetPath(path) {
    if (window.location.pathname.indexOf("/docs/") > -1) {
      return "../" + path;
    }
    return path;
  }

  function normalizeTerm(text) {
    return (text || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function humanizeTerm(term) {
    return (term || "")
      .replace(/[-_]+/g, " ")
      .replace(/\b\w/g, function (ch) {
        return ch.toUpperCase();
      });
  }

  function initTaxonomyRouting() {
    var path = window.location.pathname || "";
    var legacyMatch = path.match(/\/(category|sector|sectors|tag|topic|taxonomy|author)\/([^/?#]+)/i);

    if (legacyMatch && path.indexOf(".html") === -1) {
      var bucket = legacyMatch[1].toLowerCase();
      var term = legacyMatch[2];
      var target = "/category.html";

      if (bucket === "sector" || bucket === "sectors") {
        target = "/sectors.html";
      } else if (bucket === "author") {
        target = "/author.html";
      }

      window.location.replace(target + "?term=" + encodeURIComponent(term));
      return;
    }

    var routeByLabel = {
      markets: "category.html",
      market: "category.html",
      sectors: "sectors.html",
      sector: "sectors.html",
      policy: "policy.html",
      legal: "policy.html",
      compliance: "policy.html",
      research: "search.html",
      rankings: "author.html",
      author: "author.html"
    };

    var termRules = [
      { term: "industrial", test: /(industrial|logistics|warehouse|last-mile|distribution)/ },
      { term: "multifamily", test: /(multifamily|apartment|residential)/ },
      { term: "office", test: /(office|workplace|conversion|downtown|cbd)/ },
      { term: "hospitality", test: /(hospitality|hotel|adr|lodging)/ },
      { term: "retail", test: /(retail|storefront|mall)/ },
      { term: "life-science", test: /(life science|life-science|lab space)/ },
      { term: "debt-markets", test: /(debt|lending|cmbs|spread|coupon|refinanc|issuance|reit)/ },
      { term: "policy", test: /(policy|regulatory|compliance|legal|gdpr|privacy|terms)/ }
    ];

    function getTaxonomyTerm(link, label, target) {
      if (target === "author.html") {
        return label || "author";
      }

      var card = link.closest(".hover-img, article, li, .splide__slide, .relative");
      var localHeading = card ? card.querySelector("h1, h2, h3, h4") : null;
      var sectionHeading = link.closest("section, div") ? link.closest("section, div").querySelector("h2, h3") : null;
      var context = [
        link.textContent || "",
        localHeading ? localHeading.textContent : "",
        sectionHeading ? sectionHeading.textContent : ""
      ].join(" ").toLowerCase();

      var found = termRules.find(function (rule) {
        return rule.test.test(context);
      });

      if (found) {
        return found.term;
      }

      return label || "markets";
    }

    document.querySelectorAll("a[href]").forEach(function (link) {
      var rawHref = (link.getAttribute("href") || "").trim();
      if (!rawHref || rawHref.indexOf("http") === 0 || rawHref.indexOf("mailto:") === 0 || rawHref.indexOf("tel:") === 0 || rawHref.indexOf("javascript:") === 0) {
        return;
      }

      var label = normalizeTerm(link.textContent || "");
      var baseHref = rawHref.split("?")[0].split("#")[0];
      var normalizedBaseHref = baseHref.replace(/^\.\//, "").replace(/^\//, "").toLowerCase();
      var hasGenericTaxonomyHref =
        normalizedBaseHref === "category" ||
        normalizedBaseHref === "category.html" ||
        normalizedBaseHref === "sectors" ||
        normalizedBaseHref === "sectors.html" ||
        normalizedBaseHref === "author" ||
        normalizedBaseHref === "author.html";
      if (!hasGenericTaxonomyHref && rawHref !== "#") {
        return;
      }

      var target = routeByLabel[label];
      if (!target) {
        if (normalizedBaseHref.indexOf("category") === 0) {
          target = "category.html";
        } else if (normalizedBaseHref.indexOf("sectors") === 0) {
          target = "sectors.html";
        } else if (normalizedBaseHref.indexOf("author") === 0) {
          target = "author.html";
        } else {
          return;
        }
      }

      var term = getTaxonomyTerm(link, label, target);
      if (!term) {
        return;
      }

      link.setAttribute("href", "/" + target + "?term=" + encodeURIComponent(term));
    });

    var params = new URLSearchParams(window.location.search);
    var activeTerm = params.get("term");
    if (!activeTerm) {
      return;
    }

    var titleNode = document.querySelector("main h2");
    if (titleNode) {
      var pageName = (window.location.pathname.split("/").pop() || "").toLowerCase();
      if (pageName === "category" || pageName === "category.html" || pageName === "sectors" || pageName === "sectors.html" || pageName === "author" || pageName === "author.html") {
        var labelPrefix = (pageName === "author" || pageName === "author.html") ? "Author" : "Topic";
        titleNode.innerHTML = "<span class='inline-block h-5 border-l-3 border-red-600 mr-2'></span>" + labelPrefix + ": " + humanizeTerm(activeTerm);
      }
    }
  }

  function initImageFallbacks() {
    var defaultImage = resolveAssetPath("src/img/bg.jpg");
    var noImageFallback = resolveAssetPath("src/img/no-img.jpg");

    function resolveReplacement(fileName) {
      if (fileName.indexOf("avatar") === 0) {
        return resolveAssetPath("src/img/avatar.jpg");
      }
      if (fileName.indexOf("post1") === 0) {
        return resolveAssetPath("src/img/post1.jpg");
      }
      if (fileName.indexOf("post2") === 0) {
        return resolveAssetPath("src/img/post2.jpg");
      }
      if (fileName.indexOf("post3") === 0) {
        return resolveAssetPath("src/img/post3.jpg");
      }
      return defaultImage;
    }

    document.querySelectorAll("img[src*='img/dummy/']").forEach(function (img) {
      var currentSrc = img.getAttribute("src") || "";
      var fileName = currentSrc.split("/").pop() || "";
      img.setAttribute("src", resolveReplacement(fileName));
      img.onerror = function () {
        img.onerror = null;
        img.setAttribute("src", noImageFallback);
      };
    });

    document.querySelectorAll("a[href*='img/dummy/']").forEach(function (link) {
      link.setAttribute("href", defaultImage);
    });
  }

  function initVisualImageEnhancements() {
    var imagePools = {
      operations: [
        resolveAssetPath("src/img/post1.jpg"),
        resolveAssetPath("src/img/dummy/img13.jpg"),
        resolveAssetPath("src/img/dummy/img16.jpg"),
        resolveAssetPath("src/img/dummy/img18.jpg"),
        resolveAssetPath("src/img/dummy/img22.jpg")
      ],
      workplace: [
        resolveAssetPath("src/img/post2.jpg"),
        resolveAssetPath("src/img/dummy/img14.jpg"),
        resolveAssetPath("src/img/dummy/img15.jpg"),
        resolveAssetPath("src/img/dummy/img24.jpg"),
        resolveAssetPath("src/img/dummy/img27.jpg")
      ],
      finance: [
        resolveAssetPath("src/img/post3.jpg"),
        resolveAssetPath("src/img/dummy/img17.jpg"),
        resolveAssetPath("src/img/dummy/img19.jpg"),
        resolveAssetPath("src/img/dummy/img20.jpg"),
        resolveAssetPath("src/img/dummy/img21.jpg")
      ],
      policy: [
        resolveAssetPath("src/img/dummy/img23.jpg"),
        resolveAssetPath("src/img/dummy/img25.jpg"),
        resolveAssetPath("src/img/dummy/img26.jpg"),
        resolveAssetPath("src/img/bg.jpg")
      ]
    };

    var themeCursors = {
      operations: 0,
      workplace: 0,
      finance: 0,
      policy: 0
    };

    var keywordToTheme = [
      { theme: "operations", match: /(industrial|logistics|warehouse|retail|rent|occupancy|absorption|sun\s?belt|multifamily|hospitality)/ },
      { theme: "workplace", match: /(office|conversion|life\s?science|gateway|downtown|workplace|leasing)/ },
      { theme: "finance", match: /(debt|cmbs|lending|issuance|reit|cap\s?rate|pricing|spread|refinanc|fund|volume|liquidity)/ },
      { theme: "policy", match: /(policy|regulatory|legal|compliance|privacy|gdpr|disclaimer|terms)/ }
    ];

    var fallbackThemes = ["operations", "workplace", "finance", "policy"];
    var fallbackPointer = 0;

    function getContextText(img) {
      var zone = img.closest("article, .hover-img, .post-item, .relative, .p-4, .p-6") || img.parentElement;
      if (!zone) {
        return "";
      }

      var heading = zone.querySelector("h1, h2, h3, h4, h5, h6");
      var paragraph = zone.querySelector("p");
      var label = zone.querySelector("a, span");
      var pieces = [
        heading ? heading.textContent : "",
        paragraph ? paragraph.textContent : "",
        label ? label.textContent : "",
        img.getAttribute("alt") || ""
      ];

      return pieces.join(" ").toLowerCase();
    }

    function pickThemeFromContext(context) {
      var found = keywordToTheme.find(function (entry) {
        return entry.match.test(context);
      });

      if (found) {
        return found.theme;
      }

      var theme = fallbackThemes[fallbackPointer % fallbackThemes.length];
      fallbackPointer += 1;
      return theme;
    }

    function nextImageForTheme(theme) {
      var pool = imagePools[theme] || imagePools.operations;
      var cursor = themeCursors[theme] || 0;
      var image = pool[cursor % pool.length];
      themeCursors[theme] = cursor + 1;
      return image;
    }

    document.querySelectorAll("main img").forEach(function (img) {
      var src = (img.getAttribute("src") || "").toLowerCase();
      var alt = (img.getAttribute("alt") || "").trim();
      var hasAvatarClass = img.classList.contains("rounded-full");
      var isAvatar = hasAvatarClass || src.indexOf("avatar") > -1;
      var isLikelyIcon = (img.closest("button") && !img.closest("main")) || src.indexOf("favicon") > -1;

      if (isAvatar || isLikelyIcon) {
        return;
      }

      var isPlaceholder =
        src.indexOf("img/dummy/") > -1 ||
        src.indexOf("bg.jpg") > -1 ||
        src.indexOf("no-img.jpg") > -1 ||
        alt.toLowerCase() === "alt title" ||
        alt.toLowerCase() === "image description";

      if (!isPlaceholder) {
        return;
      }

      var context = getContextText(img);
      var theme = pickThemeFromContext(context);
      img.setAttribute("src", nextImageForTheme(theme));
      img.setAttribute("loading", "lazy");
      img.classList.add("object-cover");

      if (!alt || alt.toLowerCase() === "alt title" || alt.toLowerCase() === "image description") {
        img.setAttribute("alt", "Commercial real estate market visual");
      }
    });
  }

  function initBackNavigation() {
    var main = document.querySelector("main#content");
    if (!main || main.querySelector("[data-md-back-btn]")) {
      return;
    }

    var path = (window.location.pathname.split("/").pop() || "").toLowerCase();
    var isDetailPage =
      path.indexOf("article-") === 0 ||
      path.indexOf("single") === 0 ||
      path.indexOf("report") > -1;

    if (!isDetailPage) {
      return;
    }

    var backWrap = createEl("div", "md-back-nav");
    var backButton = createEl("button", "md-back-btn", "Back");
    backButton.type = "button";
    backButton.setAttribute("aria-label", "Go back");
    backButton.setAttribute("data-md-back-btn", "true");

    backButton.addEventListener("click", function () {
      if (window.history.length > 1) {
        window.history.back();
      } else {
        window.location.href = "index.html";
      }
    });

    backWrap.appendChild(backButton);
    main.insertBefore(backWrap, main.firstChild);
  }

  function initCommandPalette() {
    var openShortcut = function (event) {
      var key = event.key && event.key.toLowerCase();
      if ((event.metaKey || event.ctrlKey) && key === "k") {
        event.preventDefault();
        openPalette();
      }
      if (key === "/" && !event.metaKey && !event.ctrlKey && !event.altKey) {
        var tag = (event.target && event.target.tagName || "").toLowerCase();
        if (tag !== "input" && tag !== "textarea") {
          event.preventDefault();
          openPalette();
        }
      }
      if (key === "escape") {
        closePalette();
      }
    };

    var palette = createEl("div", "md-palette");
    palette.innerHTML =
      "<div class='md-palette-panel'>" +
      "<div class='md-palette-top'>" +
      "<strong>Meridian Navigator</strong><span>Ctrl/Cmd+K</span>" +
      "</div>" +
      "<input class='md-palette-input' type='text' placeholder='Jump to Markets, Research, Policy...'>" +
      "<ul class='md-palette-list'></ul>" +
      "</div>";

    document.body.appendChild(palette);

    var input = palette.querySelector(".md-palette-input");
    var list = palette.querySelector(".md-palette-list");

    function renderList(filter) {
      var q = (filter || "").toLowerCase().trim();
      list.innerHTML = "";

      config.quickLinks
        .filter(function (item) {
          return !q || item.name.toLowerCase().indexOf(q) > -1;
        })
        .forEach(function (item) {
          var li = createEl("li", "md-palette-item");
          li.innerHTML = "<a href='" + item.href + "'>" + item.name + "</a>";
          list.appendChild(li);
        });
    }

    function openPalette() {
      palette.classList.add("show");
      renderList("");
      input.value = "";
      setTimeout(function () {
        input.focus();
      }, 0);
    }

    function closePalette() {
      palette.classList.remove("show");
    }

    input.addEventListener("input", function () {
      renderList(input.value);
    });

    palette.addEventListener("click", function (event) {
      if (event.target === palette) {
        closePalette();
      }
    });

    document.addEventListener("keydown", openShortcut);
    renderList("");
  }

  function initCardBookmarks() {
    var cards = document.querySelectorAll(".hover-img");
    if (!cards.length) {
      return;
    }

    cards.forEach(function (card) {
      var headingLink = card.querySelector("h2 a, h3 a, h4 a, a");
      if (!headingLink) {
        return;
      }

      var href = headingLink.getAttribute("href") || "#";
      var title = (headingLink.textContent || "Briefing").trim();
      if (!title) {
        return;
      }

      var button = createEl("button", "md-save-briefing", "Save");
      button.type = "button";

      if (isSaved(href)) {
        button.classList.add("saved");
        button.textContent = "Saved";
      }

      button.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopPropagation();
        var added = toggleSaved({ title: title, href: href });
        button.classList.toggle("saved", added);
        button.textContent = added ? "Saved" : "Save";
      });

      card.appendChild(button);
    });
  }

  function initNewsletter() {
    var forms = document.querySelectorAll("form");
    if (!forms.length) {
      return;
    }

    forms.forEach(function (form) {
      var email = form.querySelector("input[type='email']");
      var actionButton = form.querySelector("button");
      if (!email || !actionButton) {
        return;
      }

      var note = createEl("p", "md-newsletter-note", "");
      form.appendChild(note);

      form.addEventListener("submit", function (event) {
        event.preventDefault();
      });

      actionButton.addEventListener("click", function (event) {
        event.preventDefault();
        var value = (email.value || "").trim();
        var isValid = /.+@.+\..+/.test(value);
        if (!isValid) {
          note.textContent = "Enter a valid work email to receive weekly briefings.";
          note.classList.remove("ok");
          return;
        }

        note.textContent = "Subscription request captured. Meridian desk will confirm access.";
        note.classList.add("ok");
      });
    });
  }

  function initPolicyLastUpdated() {
    var badge = document.querySelector("[data-md-last-updated]");
    if (!badge) {
      return;
    }

    var dateText = new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric"
    });

    badge.textContent = "Last updated: " + dateText;
  }

  function initDataLab() {
    var blocks = document.querySelectorAll(".md-datalab");
    if (!blocks.length || !config.datalabMetros || !config.datalabMetros.length) {
      return;
    }

    blocks.forEach(function (block) {
      var regionFilter = block.querySelector("[data-md-filter-region]");
      var sectorFilter = block.querySelector("[data-md-filter-sector]");
      var searchInput = block.querySelector("[data-md-search]");
      var rowTarget = block.querySelector("[data-md-rows]");
      var statCap = block.querySelector("[data-md-stat='avg-cap']");
      var statNoi = block.querySelector("[data-md-stat='avg-noi']");
      var statVolume = block.querySelector("[data-md-stat='volume']");
      var statTop = block.querySelector("[data-md-stat='top-market']");
      var heatmapTarget = block.querySelector("[data-md-heatmap]");
      var trendTarget = block.querySelector("[data-md-trend]");
      var exportBtn = block.querySelector("[data-md-export]");
      var signalModeToggleBtn = block.querySelector("[data-md-signal-mode-toggle]");
      var signalModeLabel = block.querySelector("[data-md-signal-mode-label]");
      var signalBtn = block.querySelector("[data-md-signal-request]");
      var pdfBtn = block.querySelector("[data-md-export-pdf]");
      var signalStatus = block.querySelector("[data-md-signal-status]");
      var signalResponse = block.querySelector("[data-md-signal-response]");
      var signalModeNote = block.querySelector("[data-md-signal-mode-note]");
      var saveViewBtn = block.querySelector("[data-md-save-view]");
      var viewsTarget = block.querySelector("[data-md-saved-views]");
      var sortButtons = block.querySelectorAll("[data-md-sort]");
      var syncUrl = block.getAttribute("data-md-sync-url") !== "false";
      var viewStoreKey = "meridianDataLabViews";
      var signalModeStoreKey = "meridianSignalMode";
      var lastSignalResponse = null;
      var signalOptions = Object.assign({}, config.signalEngine || {});

      var state = {
        sortKey: "volumeB",
        sortDir: "desc"
      };

      function getViews() {
        try {
          return JSON.parse(localStorage.getItem(viewStoreKey) || "[]");
        } catch (e) {
          return [];
        }
      }

      function getStoredSignalMode() {
        try {
          var saved = localStorage.getItem(signalModeStoreKey);
          if (saved === "mock" || saved === "live") {
            return saved;
          }
        } catch (e) {
          return null;
        }

        return null;
      }

      function setStoredSignalMode(mode) {
        try {
          localStorage.setItem(signalModeStoreKey, mode);
        } catch (e) {
          return;
        }
      }

      function isMockMode() {
        return signalOptions.useMock === true;
      }

      function applySignalModeUi() {
        var inMockMode = isMockMode();
        var buttonLabel = inMockMode ? "Mode: Mock" : "Mode: Live";
        var panelNote = inMockMode
          ? "Mock mode auto-fallback is enabled for local demo."
          : "Live mode sends requests to configured Signal Engine endpoint.";
        var modeLabelText = inMockMode
          ? "Using mock response source"
          : "Using live signal endpoint";

        if (signalModeToggleBtn) {
          signalModeToggleBtn.textContent = buttonLabel;
          signalModeToggleBtn.classList.remove("md-mode-live", "md-mode-mock");
          signalModeToggleBtn.classList.add(inMockMode ? "md-mode-mock" : "md-mode-live");
        }

        if (signalModeLabel) {
          signalModeLabel.textContent = modeLabelText;
          signalModeLabel.classList.remove("md-mode-live", "md-mode-mock");
          signalModeLabel.classList.add(inMockMode ? "md-mode-mock" : "md-mode-live");
        }

        if (signalModeNote) {
          signalModeNote.textContent = panelNote;
        }
      }

      function initializeSignalMode() {
        var storedMode = getStoredSignalMode();
        if (storedMode === "mock") {
          signalOptions.useMock = true;
        } else if (storedMode === "live") {
          signalOptions.useMock = false;
        }

        applySignalModeUi();
      }

      function toggleSignalMode() {
        signalOptions.useMock = !isMockMode();
        setStoredSignalMode(isMockMode() ? "mock" : "live");
        applySignalModeUi();
        setSignalStatus("Signal mode changed to " + (isMockMode() ? "mock" : "live") + ".", "success");
      }

      function setViews(views) {
        localStorage.setItem(viewStoreKey, JSON.stringify(views.slice(0, 12)));
      }

      function readUrlState() {
        if (!syncUrl) {
          return;
        }

        var params = new URLSearchParams(window.location.search);
        var region = params.get("region");
        var sector = params.get("sector");
        var q = params.get("q");
        var sort = params.get("sort");
        var dir = params.get("dir");

        if (regionFilter && region) {
          regionFilter.value = region;
        }
        if (sectorFilter && sector) {
          sectorFilter.value = sector;
        }
        if (searchInput && q) {
          searchInput.value = q;
        }
        if (sort) {
          state.sortKey = sort;
        }
        if (dir === "asc" || dir === "desc") {
          state.sortDir = dir;
        }
      }

      function writeUrlState() {
        if (!syncUrl) {
          return;
        }

        var params = new URLSearchParams(window.location.search);
        var region = regionFilter ? regionFilter.value : "All";
        var sector = sectorFilter ? sectorFilter.value : "All";
        var q = (searchInput && searchInput.value || "").trim();

        if (region && region !== "All") {
          params.set("region", region);
        } else {
          params.delete("region");
        }

        if (sector && sector !== "All") {
          params.set("sector", sector);
        } else {
          params.delete("sector");
        }

        if (q) {
          params.set("q", q);
        } else {
          params.delete("q");
        }

        params.set("sort", state.sortKey);
        params.set("dir", state.sortDir);

        var qs = params.toString();
        var nextUrl = window.location.pathname + (qs ? "?" + qs : "");
        window.history.replaceState({}, "", nextUrl);
      }

      function renderViews() {
        if (!viewsTarget) {
          return;
        }

        var views = getViews();
        viewsTarget.innerHTML = "";
        views.forEach(function (view, idx) {
          var chip = createEl("button", "md-view-chip", view.name);
          chip.type = "button";
          chip.addEventListener("click", function () {
            if (regionFilter) regionFilter.value = view.region;
            if (sectorFilter) sectorFilter.value = view.sector;
            if (searchInput) searchInput.value = view.q;
            state.sortKey = view.sortKey;
            state.sortDir = view.sortDir;
            rerender();
          });

          var remove = createEl("button", "md-view-delete", "x");
          remove.type = "button";
          remove.addEventListener("click", function (event) {
            event.preventDefault();
            event.stopPropagation();
            var next = getViews();
            next.splice(idx, 1);
            setViews(next);
            renderViews();
          });

          var wrap = createEl("span", "md-view-item");
          wrap.appendChild(chip);
          wrap.appendChild(remove);
          viewsTarget.appendChild(wrap);
        });
      }

      function saveCurrentView() {
        var name = "View " + (new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString());
        var view = {
          name: name,
          region: regionFilter ? regionFilter.value : "All",
          sector: sectorFilter ? sectorFilter.value : "All",
          q: searchInput ? (searchInput.value || "") : "",
          sortKey: state.sortKey,
          sortDir: state.sortDir
        };
        var views = getViews();
        views.unshift(view);
        setViews(views);
        renderViews();
      }

      function filteredRows() {
        var region = regionFilter ? regionFilter.value : "All";
        var sector = sectorFilter ? sectorFilter.value : "All";
        var query = ((searchInput && searchInput.value) || "").toLowerCase().trim();

        return config.datalabMetros
          .filter(function (item) {
            return region === "All" || item.region === region;
          })
          .filter(function (item) {
            return sector === "All" || item.sector === sector;
          })
          .filter(function (item) {
            return !query || item.metro.toLowerCase().indexOf(query) > -1;
          });
      }

      function sortedRows(rows) {
        return rows.slice().sort(function (a, b) {
          var dir = state.sortDir === "asc" ? 1 : -1;
          if (a[state.sortKey] > b[state.sortKey]) {
            return 1 * dir;
          }
          if (a[state.sortKey] < b[state.sortKey]) {
            return -1 * dir;
          }
          return 0;
        });
      }

      function renderHeatmap(rows) {
        if (!heatmapTarget) {
          return;
        }

        var aggregate = {};
        rows.forEach(function (row) {
          if (!aggregate[row.sector]) {
            aggregate[row.sector] = { count: 0, volume: 0 };
          }
          aggregate[row.sector].count += 1;
          aggregate[row.sector].volume += row.volumeB;
        });

        var list = Object.keys(aggregate)
          .map(function (sector) {
            return {
              sector: sector,
              volume: aggregate[sector].volume,
              share: aggregate[sector].volume / Math.max(1, rows.reduce(function (sum, item) {
                return sum + item.volumeB;
              }, 0))
            };
          })
          .sort(function (a, b) {
            return b.volume - a.volume;
          });

        heatmapTarget.innerHTML = "";
        list.forEach(function (entry) {
          var el = createEl("div", "md-heat-row");
          el.innerHTML =
            "<div class='md-heat-top'><span>" +
            entry.sector +
            "</span><strong>$" +
            entry.volume.toFixed(1) +
            "B</strong></div>" +
            "<div class='md-heat-bar'><span style='width:" +
            (entry.share * 100).toFixed(1) +
            "%'></span></div>";
          heatmapTarget.appendChild(el);
        });
      }

      function renderTrend(rows) {
        if (!trendTarget) {
          return;
        }

        var ranked = rows.slice().sort(function (a, b) {
          return b.volumeB - a.volumeB;
        }).slice(0, 6);

        if (!ranked.length) {
          trendTarget.innerHTML = "";
          return;
        }

        var values = ranked.map(function (row) {
          return row.yoyPrice;
        });

        var min = Math.min.apply(null, values);
        var max = Math.max.apply(null, values);
        var width = 360;
        var height = 120;
        var padX = 10;
        var padY = 12;

        var points = values.map(function (value, index) {
          var x = padX + (index * ((width - padX * 2) / Math.max(1, values.length - 1)));
          var yRatio = (value - min) / Math.max(0.0001, (max - min));
          var y = height - padY - (yRatio * (height - padY * 2));
          return x.toFixed(1) + "," + y.toFixed(1);
        }).join(" ");

        trendTarget.innerHTML =
          "<svg viewBox='0 0 " + width + " " + height + "' class='md-trend-svg' preserveAspectRatio='none'>" +
          "<polyline points='" + points + "' fill='none' stroke='#b88a44' stroke-width='3' stroke-linecap='round'></polyline>" +
          "</svg>" +
          "<div class='md-trend-labels'>" +
          ranked.map(function (row) { return "<span>" + row.metro + "</span>"; }).join("") +
          "</div>";
      }

      function renderRows(rows) {
        if (!rowTarget) {
          return;
        }

        rowTarget.innerHTML = "";
        rows.forEach(function (item) {
          var tr = createEl("tr", "border-t border-gray-100");
          tr.innerHTML =
            "<td class='p-3'>" + item.metro + "</td>" +
            "<td class='p-3'>" + item.region + "</td>" +
            "<td class='p-3'>" + item.sector + "</td>" +
            "<td class='p-3'>" + item.capRate.toFixed(1) + "%</td>" +
            "<td class='p-3'>" + item.noiGrowth.toFixed(1) + "%</td>" +
            "<td class='p-3'>" + item.occupancy.toFixed(1) + "%</td>" +
            "<td class='p-3'>$" + item.volumeB.toFixed(1) + "B</td>";
          rowTarget.appendChild(tr);
        });
      }

      function renderStats(rows) {
        if (!rows.length) {
          if (statCap) statCap.textContent = "0.0%";
          if (statNoi) statNoi.textContent = "0.0%";
          if (statVolume) statVolume.textContent = "$0.0B";
          if (statTop) statTop.textContent = "No match";
          return;
        }

        var avgCap = rows.reduce(function (sum, row) {
          return sum + row.capRate;
        }, 0) / rows.length;

        var avgNoi = rows.reduce(function (sum, row) {
          return sum + row.noiGrowth;
        }, 0) / rows.length;

        var totalVolume = rows.reduce(function (sum, row) {
          return sum + row.volumeB;
        }, 0);

        var topMarket = rows.slice().sort(function (a, b) {
          return b.noiGrowth - a.noiGrowth;
        })[0];

        if (statCap) statCap.textContent = avgCap.toFixed(2) + "%";
        if (statNoi) statNoi.textContent = avgNoi.toFixed(2) + "%";
        if (statVolume) statVolume.textContent = "$" + totalVolume.toFixed(1) + "B";
        if (statTop) statTop.textContent = topMarket.metro;
      }

      function exportCsv(rows) {
        var headers = ["Metro", "Region", "Sector", "Cap Rate", "NOI Growth", "Occupancy", "Volume B"];
        var lines = [headers.join(",")].concat(rows.map(function (row) {
          return [
            row.metro,
            row.region,
            row.sector,
            row.capRate,
            row.noiGrowth,
            row.occupancy,
            row.volumeB
          ].join(",");
        }));

        var blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
        var url = URL.createObjectURL(blob);
        var link = document.createElement("a");
        link.href = url;
        link.download = "meridian-datalab.csv";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }

      function getSignalPayload(rows) {
        return {
          generatedAt: new Date().toISOString(),
          filters: {
            region: regionFilter ? regionFilter.value : "All",
            sector: sectorFilter ? sectorFilter.value : "All",
            query: searchInput ? (searchInput.value || "").trim() : ""
          },
          sort: {
            key: state.sortKey,
            direction: state.sortDir
          },
          summary: {
            rowCount: rows.length,
            avgCapRate: statCap ? statCap.textContent : "0.0%",
            avgNoiGrowth: statNoi ? statNoi.textContent : "0.0%",
            totalVolume: statVolume ? statVolume.textContent : "$0.0B",
            topMarket: statTop ? statTop.textContent : "No match"
          },
          rows: rows.slice(0, 30)
        };
      }

      function renderSignalResponse(data) {
        if (!signalResponse) {
          return;
        }

        signalResponse.textContent = JSON.stringify(data || {}, null, 2);
      }

      function setSignalStatus(message, level) {
        if (!signalStatus) {
          return;
        }

        signalStatus.textContent = message;
        signalStatus.classList.remove("text-red-600", "text-green-600", "text-gray-500", "text-amber-700");

        if (level === "error") {
          signalStatus.classList.add("text-red-600");
          return;
        }

        if (level === "pending") {
          signalStatus.classList.add("text-amber-700");
          return;
        }

        if (level === "idle") {
          signalStatus.classList.add("text-gray-500");
          return;
        }

        signalStatus.classList.add("text-green-600");
      }

      function requestSignalReport(rows) {
        if (!window.MeridianSignalEngine || typeof window.MeridianSignalEngine.requestReport !== "function") {
          setSignalStatus("Signal Engine client is missing.", "error");
          return;
        }

        if (signalBtn) {
          signalBtn.disabled = true;
        }

        setSignalStatus("Sending payload to Signal Engine...", "pending");

        window.MeridianSignalEngine
          .requestReport(getSignalPayload(rows), signalOptions)
          .then(function (response) {
            lastSignalResponse = response.data || {};
            renderSignalResponse(lastSignalResponse);
            var modeLabel = lastSignalResponse.mode || (isMockMode() ? "mock" : "live");
            setSignalStatus("Signal Engine response received (" + modeLabel + ", HTTP " + response.status + ").", "success");
          })
          .catch(function (error) {
            renderSignalResponse({
              status: "error",
              message: (error && error.message) || "Signal Engine request failed."
            });
            setSignalStatus((error && error.message) || "Signal Engine request failed.", "error");
          })
          .finally(function () {
            if (signalBtn) {
              signalBtn.disabled = false;
            }
          });
      }

      function exportPdfReport(rows) {
        if (!window.MeridianPdfReport || typeof window.MeridianPdfReport.generateReport !== "function") {
          setSignalStatus("PDF report generator is missing.", "error");
          return;
        }

        var baseSummary = {
          "Region Filter": regionFilter ? regionFilter.value : "All",
          "Sector Filter": sectorFilter ? sectorFilter.value : "All",
          "Search Query": searchInput ? (searchInput.value || "").trim() || "-" : "-",
          "Average Cap Rate": statCap ? statCap.textContent : "0.0%",
          "Average NOI Growth": statNoi ? statNoi.textContent : "0.0%",
          "Total Volume": statVolume ? statVolume.textContent : "$0.0B",
          "Top NOI Market": statTop ? statTop.textContent : "No match"
        };

        var signalSummary = lastSignalResponse && lastSignalResponse.summary ? lastSignalResponse.summary : null;
        var reportSummary = signalSummary ? Object.assign({}, baseSummary, signalSummary) : baseSummary;
        var reportRows = lastSignalResponse && Array.isArray(lastSignalResponse.rows) ? lastSignalResponse.rows : rows.slice(0, 20);

        window.MeridianPdfReport
          .generateReport({
            title: "Meridian Data - Signal Engine Report",
            fileName: "meridian-signal-report.pdf",
            summary: reportSummary,
            rows: reportRows
          })
          .then(function (result) {
            if (result && result.fallback) {
              setSignalStatus("PDF library unavailable. Downloaded TXT fallback report.", "success");
              return;
            }
            setSignalStatus("PDF report generated successfully.", "success");
          })
          .catch(function (error) {
            setSignalStatus((error && error.message) || "PDF generation failed.", "error");
          });
      }

      function rerender() {
        var rows = sortedRows(filteredRows());
        renderRows(rows);
        renderStats(rows);
        renderHeatmap(rows);
        renderTrend(rows);
        writeUrlState();
      }

      if (regionFilter) {
        regionFilter.addEventListener("change", rerender);
      }
      if (sectorFilter) {
        sectorFilter.addEventListener("change", rerender);
      }
      if (searchInput) {
        searchInput.addEventListener("input", rerender);
      }

      sortButtons.forEach(function (btn) {
        btn.addEventListener("click", function () {
          var nextSort = btn.getAttribute("data-md-sort");
          if (!nextSort) {
            return;
          }

          if (state.sortKey === nextSort) {
            state.sortDir = state.sortDir === "asc" ? "desc" : "asc";
          } else {
            state.sortKey = nextSort;
            state.sortDir = "desc";
          }

          rerender();
        });
      });

      if (exportBtn) {
        exportBtn.addEventListener("click", function () {
          exportCsv(sortedRows(filteredRows()));
        });
      }

      if (signalModeToggleBtn) {
        signalModeToggleBtn.addEventListener("click", function () {
          toggleSignalMode();
        });
      }

      if (signalBtn) {
        signalBtn.addEventListener("click", function () {
          requestSignalReport(sortedRows(filteredRows()));
        });
      }

      if (pdfBtn) {
        pdfBtn.addEventListener("click", function () {
          exportPdfReport(sortedRows(filteredRows()));
        });
      }

      if (saveViewBtn) {
        saveViewBtn.addEventListener("click", function () {
          saveCurrentView();
        });
      }

      readUrlState();
      initializeSignalMode();
      renderViews();
      setSignalStatus("Signal Engine status: idle", "idle");
      rerender();
    });
  }

  function init() {
    initTaxonomyRouting();
    initImageFallbacks();
    initVisualImageEnhancements();
    initCommandPalette();
    initCardBookmarks();
    initNewsletter();
    initPolicyLastUpdated();
    initDataLab();
    initTitleLengthGuards();
    initMostReadLinks();
    initBackNavigation();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
