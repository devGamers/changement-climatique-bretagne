import dayjs from "dayjs";
import moment from "moment";

export const today = moment().format('YYYY-MM-DD')
export const initDate = moment().startOf('year').format('YYYY-MM-DD')

export const polluants = ['CH4', 'CO2', 'CO2IND', 'N2O', 'GF']
export const secteurs = ['Agricole', 'Autres transports', 'Déchets', 'Industrie hors énergie', 'Résidentiel', 'Routier', 'Tertiaire']
export const energies = ['Biomasse', 'Gaz naturel', 'Hors énergie', 'Produits pétroliers', 'Electricité', 'Autres', 'Chaleur']
export const annees = [2010, 2018, 2020]

export const periodes = [
    {value: 1, siecle: `21ème siècle (2001 - ${moment().format('YYYY')})`, periode : {start: '2001-01-01', end: today}},
    {value: 2, siecle: "20ème siècle (1901 - 2000) ", periode : {start: '1901-01-01', end: '2000-12-31'}},
]

export const rangePresets = [
    { label: '7 dernier jours', value: [dayjs().add(-7, 'd'), dayjs()] },
    { label: '14 dernier jours', value: [dayjs().add(-14, 'd'), dayjs()] },
    { label: '30 dernier jours', value: [dayjs().add(-30, 'd'), dayjs()] },
    { label: '90 dernier jour', value: [dayjs().add(-90, 'd'), dayjs()] },
    { label: 'Cette semaine', value: [dayjs().startOf('week'), dayjs().endOf('week')] },
    { label: 'Ce mois', value: [dayjs().startOf('month'), dayjs().endOf('month')] },
    { label: 'Cette année', value: [dayjs().startOf('year'), dayjs().endOf('year')] },
    { label: 'Semaine prochaine', value: [dayjs().add(1, 'week').startOf('week'), dayjs().add(1, 'week').endOf('week')] },
    { label: 'Mois prochain', value: [dayjs().add(1, 'month').startOf('month'), dayjs().add(1, 'month').endOf('month')] },
    { label: 'Année prochaine', value: [dayjs().add(1, 'year').startOf('year'), dayjs().add(1, 'year').endOf('year')] },
];

export const mois = [
    { court: 'Jan', long: 'Janvier' },
    { court: 'Fév', long: 'Février' },
    { court: 'Mar', long: 'Mars' },
    { court: 'Avr', long: 'Avril' },
    { court: 'Mai', long: 'Mai' },
    { court: 'Juin', long: 'Juin' },
    { court: 'Juil', long: 'Juillet' },
    { court: 'Aoû', long: 'Août' },
    { court: 'Sep', long: 'Septembre' },
    { court: 'Oct', long: 'Octobre' },
    { court: 'Nov', long: 'Novembre' },
    { court: 'Déc', long: 'Décembre' }
];

export const departements = [
    {value: 22, label: "Côtes-d'Armor"},
    {value: 29, label: "Finistère"},
    {value: 35, label: "Ille-et-Vilaine"},
    {value: 56, label: "Morbihan"},
]

export const columns = [
    {value: 'RR', label: 'Précipitation', temperature: false},
    {value: 'TNTXM', label: 'Température moyenne', temperature: true},
    {value: 'TNSOL', label: 'Température min. moy. à 10 cm du sol', temperature: true},
    {value: 'TN50', label: 'Température min. moy. à 50 cm du sol', temperature: true},
]

export const phenomenes = [
    {value: 'BROU', label: "Brouillard"},
    {value: 'BRUME', label: "Brume"},
    {value: 'ORAG', label: "Orage"},
    {value: 'GRELE', label: "Grêle"},
    {value: 'NEIG', label: "Neige"},    
    {value: 'ROSEE', label: "Rosée"},
    {value: 'FUMEE', label: "Fumée"},
    {value: 'GELEE', label: "Gelée blanche"},
    {value: 'GRESIL', label: "Grésil"},
    {value: 'ECLAIR', label: "Eclair"},
]