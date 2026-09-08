// Fixture di test — dati fittizi stabili, indipendenti da data/players.js
// (i test NON devono dipendere dal listone reale spedito nell'app).
window.TEST_PLAYERS = [
  { id: 'falcone-lecce',        nome: 'Falcone',     squadra: 'Lecce',     ruolo: 'P', quota: 9,  titolarita: 'titolare',    tier: 4, nota: '',                          flags: [],            affidabilita_difesa: 'bassa' },
  { id: 'meret-napoli',         nome: 'Meret',       squadra: 'Napoli',    ruolo: 'P', quota: 13, titolarita: 'ballottaggio', tier: 3, nota: 'ballottaggio con Caprile',  flags: [],            affidabilita_difesa: 'media' },
  { id: 'sommer-inter',         nome: 'Sommer',      squadra: 'Inter',     ruolo: 'P', quota: 16, titolarita: 'titolare',    tier: 2, nota: '',                          flags: [],            affidabilita_difesa: 'alta' },
  { id: 'bastoni-inter',        nome: 'Bastoni',     squadra: 'Inter',     ruolo: 'D', quota: 22, titolarita: 'titolare',    tier: 1, nota: '',                          flags: [],            affidabilita_difesa: 'alta' },
  { id: 'dimarco-inter',        nome: 'Dimarco',     squadra: 'Inter',     ruolo: 'D', quota: 24, titolarita: 'titolare',    tier: 1, nota: 'rigorista occasionale',    flags: ['rigorista'], affidabilita_difesa: 'alta' },
  { id: 'gatti-juventus',       nome: 'Gatti',       squadra: 'Juventus',  ruolo: 'D', quota: 14, titolarita: 'titolare',    tier: 3, nota: '',                          flags: [],            affidabilita_difesa: 'media' },
  { id: 'zortea-cagliari',      nome: 'Zortea',      squadra: 'Cagliari',  ruolo: 'D', quota: 8,  titolarita: 'ballottaggio', tier: 4, nota: 'ballottaggio fascia',      flags: [],            affidabilita_difesa: 'bassa' },
  { id: 'barella-inter',        nome: 'Barella',     squadra: 'Inter',     ruolo: 'C', quota: 26, titolarita: 'titolare',    tier: 1, nota: '',                          flags: [],            affidabilita_difesa: null },
  { id: 'fagioli-fiorentina',   nome: 'Fagioli',     squadra: 'Fiorentina',ruolo: 'C', quota: 11, titolarita: 'ballottaggio', tier: 4, nota: 'ballottaggio a centrocampo',flags: [],           affidabilita_difesa: null },
  { id: 'koopmeiners-juventus', nome: 'Koopmeiners', squadra: 'Juventus',  ruolo: 'C', quota: 24, titolarita: 'titolare',    tier: 2, nota: '',                          flags: ['rigorista'], affidabilita_difesa: null },
  { id: 'zaniolo-udinese',      nome: 'Zaniolo',     squadra: 'Udinese',   ruolo: 'C', quota: 9,  titolarita: 'riserva',     tier: 5, nota: '',                          flags: [],            affidabilita_difesa: null },
  { id: 'colombo-genoa',        nome: 'Colombo',     squadra: 'Genoa',     ruolo: 'A', quota: 7,  titolarita: 'ballottaggio', tier: 4, nota: 'ballottaggio punta',       flags: [],            affidabilita_difesa: null },
  { id: 'lautaro-inter',        nome: 'Lautaro',     squadra: 'Inter',     ruolo: 'A', quota: 40, titolarita: 'titolare',    tier: 1, nota: '',                          flags: ['rigorista'], affidabilita_difesa: null },
  { id: 'retegui-atalanta',     nome: 'Retegui',     squadra: 'Atalanta',  ruolo: 'A', quota: 34, titolarita: 'titolare',    tier: 1, nota: '',                          flags: ['rigorista'], affidabilita_difesa: null },
  { id: 'thuram-inter',         nome: 'Thuram',      squadra: 'Inter',     ruolo: 'A', quota: 32, titolarita: 'titolare',    tier: 1, nota: '',                          flags: [],            affidabilita_difesa: null }
];
