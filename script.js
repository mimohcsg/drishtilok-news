(() => {
  const REFRESH_MS = 15 * 60 * 1000;
  const THUMB_CLASSES = ["story-thumb-a", "story-thumb-b", "story-thumb-c", "story-thumb-d", "story-thumb-e"];

  const dateEl = document.getElementById("liveDate");
  const navToggle = document.getElementById("navToggle");
  const primaryNav = document.getElementById("primaryNav");
  const langToggle = document.getElementById("langToggle");
  const refreshBtn = document.getElementById("refreshNews");
  const liveStatusText = document.getElementById("liveStatusText");
  const trendingTrack = document.getElementById("trendingTrack");
  const heroTitle = document.getElementById("heroTitle");
  const heroDeck = document.getElementById("heroDeck");
  const heroKicker = document.getElementById("heroKicker");
  const heroLink = document.getElementById("heroLink");
  const heroMedia = document.getElementById("heroMedia");
  const topStoryGrid = document.getElementById("topStoryGrid");
  const topGridMeta = document.getElementById("topGridMeta");
  const liveFeedList = document.getElementById("liveFeedList");
  const liveFeedMeta = document.getElementById("liveFeedMeta");
  const stateTabs = document.querySelectorAll("#districtTabs .state-tab");
  const districtFeedList = document.getElementById("districtFeedList");
  const districtEmpty = document.getElementById("districtEmpty");
  const localMeta = document.getElementById("localMeta");

  let latestItems = [];
  let activeFilter = "all";
  const UJJAIN_DIV_DISTRICTS = ["ujjain", "dewas", "ratlam", "mandsaur", "neemuch", "shajapur", "agar"];
  const INDORE_DIV_DISTRICTS = ["indore", "dhar", "jhabua", "alirajpur", "khargone", "barwani", "khandwa", "burhanpur"];

  /** Current news language: hi (default) or en. Button label shows the other language. */
  function getNewsLang() {
    return document.documentElement.lang === "en" ? "en" : "hi";
  }

  function formatDateForLang(date = new Date()) {
    const locale = getNewsLang() === "en" ? "en-IN" : "hi-IN";
    try {
      return new Intl.DateTimeFormat(locale, {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(date);
    } catch {
      return date.toDateString();
    }
  }

  function formatTime(iso) {
    if (!iso) return "";
    const locale = getNewsLang() === "en" ? "en-IN" : "hi-IN";
    try {
      return new Intl.DateTimeFormat(locale, {
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(iso));
    } catch {
      return "";
    }
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function updateDateLabel() {
    if (!dateEl) return;
    const now = new Date();
    dateEl.dateTime = now.toISOString();
    dateEl.textContent = formatDateForLang(now);
  }

  updateDateLabel();

  if (navToggle && primaryNav) {
    navToggle.addEventListener("click", () => {
      const open = primaryNav.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(open));
      navToggle.setAttribute(
        "aria-label",
        open
          ? getNewsLang() === "en"
            ? "Close menu"
            : "मेनू बंद करें"
          : getNewsLang() === "en"
            ? "Open menu"
            : "मेनू खोलें"
      );
    });
  }

  if (langToggle) {
    langToggle.addEventListener("click", () => {
      const nextLang = getNewsLang() === "hi" ? "en" : "hi";
      document.documentElement.lang = nextLang;
      // Button shows the language you can switch to next
      langToggle.setAttribute("aria-pressed", String(nextLang === "en"));
      langToggle.textContent = nextLang === "en" ? "हिं" : "EN";
      updateDateLabel();
      loadNews();
    });
  }

  stateTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      activeFilter = tab.dataset.filter || "all";
      stateTabs.forEach((t) => {
        const active = t === tab;
        t.classList.toggle("is-active", active);
        t.setAttribute("aria-selected", String(active));
      });
      renderDistrictFeed(latestItems, activeFilter);
    });
  });

  document.querySelectorAll(".newsletter-form, .search-form").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const btn = form.querySelector("button[type='submit']");
      if (!btn) return;
      const original = btn.textContent;
      btn.textContent = form.classList.contains("newsletter-form") ? "धन्यवाद!" : "खोज जारी…";
      setTimeout(() => {
        btn.textContent = original;
      }, 1400);
    });
  });

  document.querySelectorAll(".video-play").forEach((btn) => {
    btn.addEventListener("click", () => {
      btn.classList.add("is-playing");
      const label = btn.parentElement?.querySelector("h3");
      window.alert(
        (label?.textContent || "वीडियो") +
          "\n\nडेमो मोड: यहाँ असली प्लेयर कनेक्ट किया जा सकता है।"
      );
    });
  });

  function articleHref(item) {
    return `article.html?id=${encodeURIComponent(item.id)}&lang=${getNewsLang()}`;
  }

  function setStatus(message, isError = false) {
    if (!liveStatusText) return;
    liveStatusText.textContent = message;
    liveStatusText.parentElement?.classList.toggle("is-error", isError);
  }

  function renderTrending(items) {
    if (!trendingTrack) return;
    const label = document.querySelector(".trending-label");
    if (label) {
      label.textContent = getNewsLang() === "en" ? "Trending News" : "ट्रेंडिंग न्यूज़";
    }
    const picks = [...items]
      .sort((a, b) => (b.frontScore || 0) - (a.frontScore || 0))
      .slice(0, 8);
    if (!picks.length) {
      trendingTrack.innerHTML = `<span class="trending-placeholder">अभी कोई सुर्खी नहीं</span>`;
      return;
    }
    const links = picks
      .map(
        (item) =>
          `<a href="${articleHref(item)}">${escapeHtml(item.title)}</a>`
      )
      .join("");
    trendingTrack.innerHTML = links + links;
  }

  function pickFrontStory(items) {
    if (!items?.length) return null;
    return [...items].sort((a, b) => {
      const fb = b.frontScore || 0;
      const fa = a.frontScore || 0;
      if (fb !== fa) return fb - fa;
      return Date.parse(b.publishedAt || 0) - Date.parse(a.publishedAt || 0);
    })[0];
  }

  function renderHero(item) {
    if (!item || !heroTitle) return;
    const hi = getNewsLang() === "hi";
    heroTitle.textContent = item.title;
    if (heroDeck) {
      heroDeck.textContent =
        item.summary ||
        (hi
          ? "इंदौर, उज्जैन, देवास, मध्य प्रदेश और भारत की ताज़ा कवरेज — पूरी खबर नीचे पढ़ें।"
          : "Latest coverage from the region and India — read below.");
    }
    if (heroKicker) {
      const tags = [];
      if (item.isBreaking) tags.push(hi ? "ब्रेकिंग" : "Breaking");
      if (item.isIndia && !item.districtLabel) tags.push(hi ? "देश" : "India");
      const place =
        item.districtLabel ||
        item.divisionLabel ||
        (item.isMpStatewide ? (hi ? "मध्य प्रदेश" : "Madhya Pradesh") : null) ||
        (item.isIndia ? (hi ? "भारत" : "India") : null) ||
        (hi ? "मप्र पश्चिम" : "West MP");
      tags.push(place);
      heroKicker.textContent = hi
        ? `लाइव · सत्यव्रत · ${tags.join(" · ")}`
        : `Live · Satyavrat · ${tags.join(" · ")}`;
    }
    if (heroLink) {
      heroLink.href = articleHref(item);
      heroLink.removeAttribute("target");
      heroLink.removeAttribute("rel");
      heroLink.textContent = hi ? "पूरी खबर पढ़ें" : "Read full story";
    }
    if (heroMedia) {
      if (item.image) {
        heroMedia.style.backgroundImage = `linear-gradient(120deg, rgba(18,20,26,.72), rgba(18,20,26,.35)), url("${item.image}")`;
        heroMedia.style.backgroundSize = "cover";
        heroMedia.style.backgroundPosition = "center";
      } else {
        heroMedia.style.backgroundImage = "";
      }
      heroMedia.setAttribute("aria-label", item.title);
    }
  }

  function filterByArea(items, filter = "all") {
    if (!filter || filter === "all") return items;
    if (filter === "mp") {
      return items.filter((item) => item.isMpStatewide || item.district || (item.regionScore || 0) >= 8);
    }
    if (filter === "division:indore-div") {
      return items.filter(
        (item) =>
          item.division === "indore-div" || INDORE_DIV_DISTRICTS.includes(item.district)
      );
    }
    if (filter === "division:ujjain-div") {
      return items.filter(
        (item) =>
          item.division === "ujjain-div" || UJJAIN_DIV_DISTRICTS.includes(item.district)
      );
    }
    if (filter.startsWith("district:")) {
      const id = filter.slice("district:".length);
      return items.filter((item) => item.district === id);
    }
    return items;
  }

  function renderDistrictFeed(items, filter = "all") {
    if (!districtFeedList) return;
    const hi = getNewsLang() === "hi";
    const filtered = filterByArea(items, filter);
    const list = filtered.slice(0, 24);

    if (districtEmpty) {
      districtEmpty.hidden = list.length > 0;
      districtEmpty.textContent = hi
        ? "इस क्षेत्र की खबर अभी नहीं मिली — थोड़ी देर बाद देखें।"
        : "No stories for this area right now.";
    }

    districtFeedList.innerHTML = list
      .map(
        (item) => `
      <li class="live-feed-item">
        <a href="${articleHref(item)}">
          <span class="live-feed-source">${escapeHtml(
            item.districtLabel ||
              item.divisionLabel ||
              (item.isMpStatewide ? (hi ? "मध्य प्रदेश" : "MP") : null) ||
              item.category ||
              (hi ? "मप्र" : "MP")
          )}</span>
          <span class="live-feed-title">${escapeHtml(item.title)}</span>
          <span class="live-feed-time">${item.publishedAt ? formatTime(item.publishedAt) : "—"}</span>
        </a>
      </li>`
      )
      .join("");

    if (localMeta) {
      localMeta.textContent = hi
        ? `${list.length} खबरें · इंदौर / उज्जैन / देवास / मप्र`
        : `${list.length} stories · Indore / Ujjain / Dewas / MP`;
    }
  }

  function storyCard(item, index, feature = false) {
    const hi = getNewsLang() === "hi";
    const thumbClass = THUMB_CLASSES[index % THUMB_CLASSES.length];
    const thumbStyle = item.image
      ? `style="background-image:url('${escapeHtml(item.image)}');background-size:cover;background-position:center;"`
      : "";
    const summary = feature && item.summary ? `<p>${escapeHtml(item.summary)}</p>` : "";
    const brand = hi ? "सत्यव्रत" : "Satyavrat";
    const fallbackCat = hi ? "टॉप" : "Top";
    return `
      <article class="story${feature ? " story-feature" : ""}">
        <a href="${articleHref(item)}">
          <div class="story-thumb ${thumbClass}" ${thumbStyle}></div>
          <div class="story-body">
            <span class="chip">${escapeHtml(item.category || fallbackCat)}</span>
            <h3>${escapeHtml(item.title)}</h3>
            ${summary}
            <span class="story-source">${brand}${
              item.publishedAt ? ` · ${formatTime(item.publishedAt)}` : ""
            }</span>
          </div>
        </a>
      </article>
    `;
  }

  function renderTopGrid(items) {
    if (!topStoryGrid) return;
    const hi = getNewsLang() === "hi";
    const top = items.slice(0, 5);
    if (!top.length) {
      topStoryGrid.innerHTML = `<p class="feed-empty">${
        hi ? "अभी टॉप न्यूज़ उपलब्ध नहीं।" : "No top stories available right now."
      }</p>`;
      topStoryGrid.setAttribute("aria-busy", "false");
      return;
    }
    topStoryGrid.innerHTML = top
      .map((item, index) => storyCard(item, index, index === 0))
      .join("");
    topStoryGrid.setAttribute("aria-busy", "false");
  }

  function renderLiveFeed(items, meta) {
    if (!liveFeedList) return;
    const hi = getNewsLang() === "hi";
    const list = items.slice(0, 24);
    const fallbackCat = hi ? "टॉप" : "Top";
    liveFeedList.innerHTML = list
      .map(
        (item) => `
      <li class="live-feed-item">
        <a href="${articleHref(item)}">
          <span class="live-feed-source">${escapeHtml(item.category || fallbackCat)}</span>
          <span class="live-feed-title">${escapeHtml(item.title)}</span>
          <span class="live-feed-time">${item.publishedAt ? formatTime(item.publishedAt) : "—"}</span>
        </a>
      </li>`
      )
      .join("");

    if (liveFeedMeta && meta) {
      liveFeedMeta.textContent = hi
        ? `${meta.count} खबरें · इंदौर/उज्जैन/देवास/मप्र · हर 15 मिनट अपडेट`
        : `${meta.count} stories · Indore/Ujjain/Dewas/MP · updates every 15 min`;
    }
    if (topGridMeta && meta?.refreshedAt) {
      topGridMeta.textContent = hi
        ? `मप्र पश्चिम · अपडेट ${formatTime(meta.refreshedAt)}`
        : `West MP · updated ${formatTime(meta.refreshedAt)}`;
    }
  }

  async function loadNews({ force = false } = {}) {
    const lang = getNewsLang();
    const hi = lang === "hi";
    setStatus(
      force
        ? hi
          ? "अपडेट हो रहा है…"
          : "Refreshing…"
        : hi
          ? "इंदौर · उज्जैन · देवास · मप्र की खबरें लोड हो रही हैं…"
          : "Loading Indore / Ujjain / Dewas / MP feed…"
    );
    if (refreshBtn) refreshBtn.disabled = true;
    if (topStoryGrid) topStoryGrid.setAttribute("aria-busy", "true");

    try {
      const params = new URLSearchParams({ lang });
      if (force) params.set("refresh", "1");
      const res = await fetch(`/api/news?${params}`, {
        headers: { Accept: "application/json" },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const items = data.items || [];
      latestItems = items;

      if (!items.length) {
        setStatus(
          hi
            ? "अभी क्षेत्रीय खबर नहीं मिली — थोड़ी देर बाद देखें"
            : "No regional stories found — try again shortly",
          true
        );
        return;
      }

      const front = pickFrontStory(items) || items[0];
      renderHero(front);
      renderTrending(items);
      renderTopGrid([front, ...items.filter((i) => i.id !== front.id)]);
      renderLiveFeed(items, data);
      renderDistrictFeed(items, activeFilter);
      setStatus(
        hi
          ? `लाइव · मप्र पश्चिम · ${formatTime(data.refreshedAt)} · अगला अपडेट 15 मि`
          : `Live · West MP · ${formatTime(data.refreshedAt)} · next in 15 min`
      );
    } catch (err) {
      console.error(err);
      setStatus(
        hi ? "सर्वर से कनेक्ट नहीं — npm start चलाएँ" : "Cannot reach server — run npm start",
        true
      );
      if (heroTitle && /लोड|Loading/i.test(heroTitle.textContent)) {
        heroTitle.textContent = hi
          ? "लाइव न्यूज़ के लिए सर्वर चालू करें"
          : "Start the server for live news";
      }
      if (heroDeck) {
        heroDeck.textContent = hi
          ? "टर्मिनल में drishtilok-news फ़ोल्डर में जाकर npm install और npm start चलाएँ, फिर http://localhost:4173 खोलें।"
          : "In the drishtilok-news folder run npm install and npm start, then open http://localhost:4173.";
      }
    } finally {
      if (refreshBtn) refreshBtn.disabled = false;
    }
  }

  if (refreshBtn) {
    refreshBtn.addEventListener("click", () => loadNews({ force: true }));
  }

  loadNews();
  setInterval(() => loadNews(), REFRESH_MS);
})();
