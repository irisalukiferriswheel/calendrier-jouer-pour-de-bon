(() => {
  "use strict";

  const categories = [
    {
      id: "sports",
      label: { fr: "Sports et jeux physiques", en: "Sports & physical games" },
      aliases: [
        "basketball", "soccer", "football", "hockey", "volleyball", "tennis",
        "badminton", "pickleball", "baseball", "softball", "running", "course",
        "5 km", "5k", "table tennis", "ping pong"
      ]
    },
    {
      id: "board-strategy",
      label: { fr: "Jeux de société et stratégie", en: "Board & strategy games" },
      aliases: [
        "échecs", "echecs", "chess", "catan", "azul", "monopoly", "scrabble",
        "backgammon", "checkers", "dames", "go"
      ]
    },
    {
      id: "cards",
      label: { fr: "Jeux de cartes", en: "Card games" },
      aliases: [
        "cards", "cartes", "poker", "bridge", "cribbage", "euchre", "uno",
        "magic the gathering", "magic: the gathering"
      ]
    },
    {
      id: "video",
      label: { fr: "Jeux vidéo", en: "Video games" },
      aliases: [
        "tetris", "angry birds", "candy crush", "minecraft", "rocket league",
        "mario kart", "fall guys", "overcooked"
      ]
    },
    {
      id: "skill-puzzle",
      label: { fr: "Jeux d’adresse et casse-têtes", en: "Skill & puzzle games" },
      aliases: [
        "puzzle", "casse-tête", "casse tete", "sudoku", "rubik", "jenga",
        "cornhole", "darts", "fléchettes", "flechettes"
      ]
    },
    {
      id: "social-party",
      label: { fr: "Jeux sociaux et de groupe", en: "Social & party games" },
      aliases: [
        "charades", "trivia", "quiz", "pictionary", "bingo", "karaoke",
        "werewolf", "loup-garou", "loup garou"
      ]
    },
    {
      id: "other",
      label: { fr: "Autres", en: "Other" },
      aliases: []
    }
  ];

  const normalize = value => String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase()
    .trim();

  function matches(game, alias) {
    const value = normalize(game);
    const candidate = normalize(alias);
    if (!value || !candidate) return false;
    if (candidate.length <= 3) return value === candidate;
    return value === candidate || value.includes(candidate);
  }

  function categoryForGame(game) {
    for (const category of categories) {
      if (category.id === "other") continue;
      if (category.aliases.some(alias => matches(game, alias))) return category.id;
    }
    return "other";
  }

  function labelForCategory(id, lang) {
    const category = categories.find(item => item.id === id);
    return category?.label?.[lang] || category?.label?.fr || id;
  }

  window.JPDB_GAME_TAXONOMY = {
    categories,
    categoryForGame,
    labelForCategory
  };
})();
