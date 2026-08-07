window.makeJPDBDemoEvents = function (timeZone) {
  const now = new Date();
  const at = (days, hour, minute = 0) => {
    const d = new Date(now);
    d.setDate(d.getDate() + days);
    d.setHours(hour, minute, 0, 0);
    return d.toISOString();
  };
  return [
    { id:"demo-basketball", title:"Basketball Knockout", description:"Partie amicale à élimination. Tous les niveaux sont les bienvenus.", startAt:at(2,18,30), endAt:at(2,20,30), timezone:timeZone, city:"Sherbrooke", venue:"Parc Jacques-Cartier", games:["Basketball"], status:"scheduled" },
    { id:"demo-chess", title:"Soirée d’échecs", description:"Rencontres amicales et parties rapides.", startAt:at(4,19), endAt:at(4,21), timezone:timeZone, city:"Granby", venue:"Bibliothèque municipale", games:["Échecs"], status:"scheduled" },
    { id:"demo-tetris", title:"Tournoi Tetris", description:"Petit tournoi communautaire de Tetris avec format convivial.", startAt:at(7,14), endAt:at(7,16), timezone:timeZone, city:"Montréal", venue:"Maison de quartier", games:["Tetris"], status:"scheduled" }
  ];
};
