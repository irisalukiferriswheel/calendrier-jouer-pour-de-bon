(() => {
  "use strict";

  const query = new URLSearchParams(location.search);
  const api = (query.get("api") || "").replace(/\/$/, "");

  const I18N = {
    fr: {
      eyebrow:"Jouer pour de bon", title:"Organiser une partie", intro:"Créez une activité qui pourra apparaître dans le calendrier public.",
      requiredNote:"Les champs marqués * sont obligatoires.", sectionGame:"La partie", titleLabel:"Nom de l’activité *", gameLabel:"Jeu *",
      descriptionLabel:"Description", descriptionPlaceholder:"Décrivez le format, le niveau ou les informations utiles.",
      sectionSchedule:"Date et heure", dateLabel:"Date *", startLabel:"Début *", endLabel:"Fin *", timezoneLabel:"Fuseau horaire *",
      sectionLocation:"Lieu", cityLabel:"Ville *", countryLabel:"Pays *", venueLabel:"Lieu / établissement *", addressLabel:"Adresse",
      sectionParticipation:"Participants", capacityLabel:"Nombre maximum de joueurs *", ageGroupLabel:"Groupe d’âge *",
      ageAll:"Tous âges", ageYouth:"Moins de 18 ans", ageAdult:"18 ans et plus", ageCustom:"Âges personnalisés",
      minAgeLabel:"Âge minimum", maxAgeLabel:"Âge maximum", capacityHelp:"Les places restantes seront calculées automatiquement à partir des inscriptions actives.",
      sectionRegistration:"Inscription", feeLabel:"Coût par joueur *", currencyLabel:"Devise *", publishLabel:"Publication *",
      draft:"Brouillon", publish:"Publier et ouvrir les inscriptions", previewButton:"Prévisualiser l’activité",
      previewEyebrow:"Aperçu", notPublished:"Non publié", connectionNote:"La connexion d’authentification de l’organisateur sera branchée avant la publication réelle.",
      invalidTime:"L’heure de fin doit être après l’heure de début.", invalidAge:"La plage d’âge n’est pas valide.", requiredAge:"Indiquez au moins un âge pour une plage personnalisée.",
      players:"joueurs maximum", allAges:"Tous âges", agePlus:"{min} ans et +", ageUpTo:"Jusqu’à {max} ans", ageRange:"{min}–{max} ans",
      free:"Gratuit", draftPreview:"Brouillon", publicPreview:"Prêt à publier",
      createButton:"Créer l’activité", creating:"Création…", created:"Activité créée avec succès.",
      authNeeded:"La page est prête, mais l’API et la connexion organisateur doivent être actives pour créer réellement l’activité.",
      createError:"Impossible de créer l’activité pour le moment.", openCalendar:"Voir le calendrier"
    },
    en: {
      eyebrow:"Playing for Good", title:"Organize a game", intro:"Create an activity that can appear in the public calendar.",
      requiredNote:"Fields marked * are required.", sectionGame:"The game", titleLabel:"Activity name *", gameLabel:"Game *",
      descriptionLabel:"Description", descriptionPlaceholder:"Describe the format, level, or other useful information.",
      sectionSchedule:"Date and time", dateLabel:"Date *", startLabel:"Start *", endLabel:"End *", timezoneLabel:"Time zone *",
      sectionLocation:"Location", cityLabel:"City *", countryLabel:"Country *", venueLabel:"Venue *", addressLabel:"Address",
      sectionParticipation:"Participants", capacityLabel:"Maximum number of players *", ageGroupLabel:"Age group *",
      ageAll:"All ages", ageYouth:"Under 18", ageAdult:"18 and over", ageCustom:"Custom ages",
      minAgeLabel:"Minimum age", maxAgeLabel:"Maximum age", capacityHelp:"Spots left will be calculated automatically from active registrations.",
      sectionRegistration:"Registration", feeLabel:"Cost per player *", currencyLabel:"Currency *", publishLabel:"Publication *",
      draft:"Draft", publish:"Publish and open registration", previewButton:"Preview activity",
      previewEyebrow:"Preview", notPublished:"Not published", connectionNote:"Organizer authentication will be connected before real publishing is enabled.",
      invalidTime:"End time must be after start time.", invalidAge:"The age range is not valid.", requiredAge:"Enter at least one age for a custom range.",
      players:"players maximum", allAges:"All ages", agePlus:"Ages {min}+", ageUpTo:"Up to age {max}", ageRange:"Ages {min}–{max}",
      free:"Free", draftPreview:"Draft", publicPreview:"Ready to publish",
      createButton:"Create activity", creating:"Creating…", created:"Activity created successfully.",
      authNeeded:"The page is ready, but the API and organizer sign-in must be active to create the activity for real.",
      createError:"The activity could not be created right now.", openCalendar:"View calendar"
    }
  };

  let lang = localStorage.getItem("jpdb-organizer-language") || "fr";
  const $ = id => document.getElementById(id);
  const form = $("organizerForm");
  const ageGroup = $("ageGroupSelect");
  const customAgeFields = $("customAgeFields");
  const errorBox = $("formError");
  const preview = $("previewSection");
  let createButton = null;
  let createMessage = null;
  let calendarLink = null;

  init();

  function init() {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth()+1).padStart(2,"0");
    const dd = String(today.getDate()).padStart(2,"0");
    $("dateInput").min = `${yyyy}-${mm}-${dd}`;
    $("dateInput").value = `${yyyy}-${mm}-${dd}`;
    $("startInput").value = "18:30";
    $("endInput").value = "20:30";

    const browserZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if ([...$("timezoneSelect").options].some(option => option.value === browserZone)) {
      $("timezoneSelect").value = browserZone;
    }

    document.querySelectorAll("[data-lang]").forEach(button => {
      button.addEventListener("click", () => {
        lang = button.dataset.lang;
        localStorage.setItem("jpdb-organizer-language", lang);
        applyLanguage();
      });
    });

    ageGroup.addEventListener("change", toggleCustomAges);
    form.addEventListener("submit", onSubmit);
    applyLanguage();
    toggleCustomAges();
  }

  function applyLanguage() {
    if (!I18N[lang]) lang = "fr";
    document.documentElement.lang = lang;
    document.title = lang === "fr" ? "Organiser une partie — Jouer pour de bon" : "Organize a game — Playing for Good";
    document.querySelectorAll("[data-i18n]").forEach(node => {
      const key = node.dataset.i18n;
      if (I18N[lang][key]) node.textContent = I18N[lang][key];
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach(node => {
      const key = node.dataset.i18nPlaceholder;
      if (I18N[lang][key]) node.placeholder = I18N[lang][key];
    });
    document.querySelectorAll("[data-i18n-option]").forEach(node => {
      const key = node.dataset.i18nOption;
      if (I18N[lang][key]) node.textContent = I18N[lang][key];
    });
    document.querySelectorAll("[data-lang]").forEach(button => {
      button.classList.toggle("active", button.dataset.lang === lang);
    });
    if (createButton) createButton.textContent = t("createButton");
    if (calendarLink) calendarLink.textContent = t("openCalendar");
    if (!preview.hidden) renderPreview(window.JPDBOrganizerPreview);
  }

  function toggleCustomAges() {
    customAgeFields.hidden = ageGroup.value !== "custom";
  }

  function onSubmit(event) {
    event.preventDefault();
    hideError();
    if (!form.reportValidity()) return;

    const ages = resolveAges();
    if (ages.error) return showError(ages.error);

    const date = $("dateInput").value;
    const start = $("startInput").value;
    const end = $("endInput").value;
    const timezone = $("timezoneSelect").value;
    const startAt = zonedDateTimeToIso(date, start, timezone);
    const endAt = zonedDateTimeToIso(date, end, timezone);

    if (Date.parse(endAt) <= Date.parse(startAt)) return showError(t("invalidTime"));

    const publish = $("publishSelect").value === "published";
    const game = $("gameInput").value.trim();
    const title = $("titleInput").value.trim();
    const city = $("cityInput").value.trim();
    const venue = $("venueInput").value.trim();
    const description = $("descriptionInput").value.trim();
    const maxParticipants = Number($("capacityInput").value);
    const feeAmount = Number($("feeInput").value);
    const feeCurrency = $("currencySelect").value;

    const competition = {
      title,
      description: description || null,
      activityType: game,
      startAt,
      endAt,
      timezone,
      locationType: "physical",
      locationName: venue,
      locationAddress: $("addressInput").value.trim() || null,
      city,
      feeAmount,
      feeCurrency,
      country: $("countryInput").value.trim().toUpperCase(),
      maxParticipants,
      minAge: ages.minAge,
      maxAge: ages.maxAge,
      visibility: publish ? "public" : "unlisted",
      status: publish ? "open_for_registration" : "draft"
    };

    const calendarEvent = {
      competitionId: "<competition-id-created-by-api>",
      title,
      description: description || null,
      startAt,
      endAt,
      timezone,
      city,
      venue,
      games: [game],
      visibility: publish ? "published" : "draft",
      status: "scheduled"
    };

    window.JPDBOrganizerPreview = { competition, calendarEvent };
    renderPreview(window.JPDBOrganizerPreview);
  }

  function resolveAges() {
    if (ageGroup.value === "all") return { minAge:null, maxAge:null };
    if (ageGroup.value === "youth") return { minAge:0, maxAge:17 };
    if (ageGroup.value === "adult") return { minAge:18, maxAge:null };
    const minRaw = $("minAgeInput").value;
    const maxRaw = $("maxAgeInput").value;
    if (!minRaw && !maxRaw) return { error:t("requiredAge") };
    const minAge = minRaw ? Number(minRaw) : null;
    const maxAge = maxRaw ? Number(maxRaw) : null;
    if ((minAge !== null && (minAge < 0 || minAge > 120)) || (maxAge !== null && (maxAge < 0 || maxAge > 120)) || (minAge !== null && maxAge !== null && minAge > maxAge)) {
      return { error:t("invalidAge") };
    }
    return { minAge, maxAge };
  }

  function renderPreview(payload) {
    if (!payload) return;
    const c = payload.competition;
    $("previewTitle").textContent = c.title;
    const age = formatAge(c.minAge, c.maxAge);
    const price = c.feeAmount === 0 ? t("free") : new Intl.NumberFormat(lang === "fr" ? "fr-CA" : "en-CA", { style:"currency", currency:c.feeCurrency }).format(c.feeAmount);
    $("previewFacts").innerHTML = "";
    [c.activityType, `${c.city} · ${c.locationName}`, `${c.maxParticipants} ${t("players")}`, age, price, c.visibility === "public" ? t("publicPreview") : t("draftPreview")]
      .forEach(value => { const span=document.createElement("span"); span.textContent=value; $("previewFacts").append(span); });
    $("previewDescription").textContent = c.description || "";
    ensureCreateControls();
    createMessage.hidden = true;
    calendarLink.hidden = true;
    createButton.disabled = false;
    createButton.textContent = t("createButton");
    preview.hidden = false;
    preview.scrollIntoView({ behavior:"smooth", block:"nearest" });
  }

  function ensureCreateControls() {
    if (createButton) return;
    const actions = document.createElement("div");
    actions.style.display = "flex";
    actions.style.gap = "12px";
    actions.style.flexWrap = "wrap";
    actions.style.marginTop = "16px";

    createButton = document.createElement("button");
    createButton.type = "button";
    createButton.className = "primary-button";
    createButton.textContent = t("createButton");
    createButton.addEventListener("click", createActivity);

    calendarLink = document.createElement("a");
    calendarLink.className = "primary-button";
    calendarLink.style.textDecoration = "none";
    calendarLink.textContent = t("openCalendar");
    calendarLink.hidden = true;

    createMessage = document.createElement("p");
    createMessage.className = "connection-note";
    createMessage.hidden = true;

    actions.append(createButton, calendarLink);
    preview.append(createMessage, actions);
  }

  async function createActivity() {
    const payload = window.JPDBOrganizerPreview;
    if (!payload) return;

    const token = localStorage.getItem("jpdb_api_token") || "";
    if (!api || !token) {
      createMessage.textContent = t("authNeeded");
      createMessage.hidden = false;
      return;
    }

    const c = payload.competition;
    createButton.disabled = true;
    createButton.textContent = t("creating");
    createMessage.hidden = true;

    try {
      const response = await fetch(`${api}/v1/organizer/activities`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: c.title,
          description: c.description,
          game: c.activityType,
          startAt: c.startAt,
          endAt: c.endAt,
          timezone: c.timezone,
          city: c.city,
          venue: c.locationName,
          address: c.locationAddress,
          country: c.country,
          maxParticipants: c.maxParticipants,
          minAge: c.minAge,
          maxAge: c.maxAge,
          feeAmount: c.feeAmount,
          feeCurrency: c.feeCurrency,
          publish: c.visibility === "public"
        })
      });

      const json = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(json.error || `HTTP ${response.status}`);

      createMessage.textContent = t("created");
      createMessage.hidden = false;
      createButton.disabled = true;
      createButton.textContent = t("created");

      const params = new URLSearchParams();
      if (api) params.set("api", api);
      calendarLink.href = `../${params.toString() ? `?${params.toString()}` : ""}`;
      calendarLink.hidden = false;
    } catch (error) {
      console.error(error);
      createMessage.textContent = t("createError");
      createMessage.hidden = false;
      createButton.disabled = false;
      createButton.textContent = t("createButton");
    }
  }

  function formatAge(min,max) {
    if (min === null && max === null) return t("allAges");
    if (min !== null && max !== null) return t("ageRange").replace("{min}",min).replace("{max}",max);
    if (min !== null) return t("agePlus").replace("{min}",min);
    return t("ageUpTo").replace("{max}",max);
  }

  function zonedDateTimeToIso(dateString, timeString, timeZone) {
    const [year,month,day] = dateString.split("-").map(Number);
    const [hour,minute] = timeString.split(":").map(Number);
    const desired = Date.UTC(year,month-1,day,hour,minute,0);
    let guess = desired;
    for (let i=0;i<3;i++) {
      const parts = new Intl.DateTimeFormat("en-CA", {
        timeZone, year:"numeric", month:"2-digit", day:"2-digit", hour:"2-digit", minute:"2-digit", second:"2-digit", hourCycle:"h23"
      }).formatToParts(new Date(guess));
      const get = type => Number(parts.find(part => part.type === type)?.value || 0);
      const represented = Date.UTC(get("year"),get("month")-1,get("day"),get("hour"),get("minute"),get("second"));
      const delta = desired - represented;
      if (delta === 0) break;
      guess += delta;
    }
    return new Date(guess).toISOString();
  }

  function t(key) { return I18N[lang]?.[key] || I18N.fr[key] || key; }
  function showError(message) { errorBox.textContent=message; errorBox.hidden=false; errorBox.scrollIntoView({behavior:"smooth",block:"nearest"}); }
  function hideError() { errorBox.hidden=true; errorBox.textContent=""; }
})();