window.makeJPDBDemoEvents = function (timeZone) {
  const now = new Date();
  const at = (days, hour, minute = 0) => {
    const d = new Date(now);
    d.setDate(d.getDate() + days);
    d.setHours(hour, minute, 0, 0);
    return d.toISOString();
  };
  return [
    {
      id:"demo-basketball",
      competitionId:"demo-comp-basketball",
      title:"Basketball Knockout",
      description:"Partie amicale à élimination. Tous les niveaux sont les bienvenus.",
      startAt:at(2,18,30), endAt:at(2,20,30), timezone:timeZone,
      city:"Sherbrooke", venue:"Parc Jacques-Cartier", games:["Basketball"], status:"scheduled",
      maxParticipants:12, participantsCount:8, reservedCount:8, spotsLeft:4,
      minAge:18, maxAge:null, registrationOpen:true, feeAmount:20, feeCurrency:"CAD"
    },
    {
      id:"demo-chess",
      competitionId:"demo-comp-chess",
      title:"Soirée d’échecs",
      description:"Rencontres amicales et parties rapides.",
      startAt:at(4,19), endAt:at(4,21), timezone:timeZone,
      city:"Granby", venue:"Bibliothèque municipale", games:["Échecs"], status:"scheduled",
      maxParticipants:16, participantsCount:15, reservedCount:15, spotsLeft:1,
      minAge:12, maxAge:null, registrationOpen:true, feeAmount:10, feeCurrency:"CAD"
    },
    {
      id:"demo-tetris",
      competitionId:"demo-comp-tetris",
      title:"Tournoi Tetris",
      description:"Petit tournoi communautaire de Tetris avec format convivial.",
      startAt:at(7,14), endAt:at(7,16), timezone:timeZone,
      city:"Montréal", venue:"Maison de quartier", games:["Tetris"], status:"scheduled",
      maxParticipants:20, participantsCount:20, reservedCount:20, spotsLeft:0,
      minAge:null, maxAge:null, registrationOpen:false, feeAmount:15, feeCurrency:"CAD"
    }
  ];
};
