import React, { createContext, useContext, useState } from 'react';

export const translations = {
  es: {
    appTitle: "Gestión Falla",
    navSummary: "Resumen",
    navMySummary: "Mi Resumen",
    navCensus: "Censo",
    navMyFamily: "Mi Familia",
    navQuotas: "Cuotas",
    navMyQuotas: "Mis Cuotas",
    navLottery: "Lotería",
    navMyLottery: "Mi Lotería",
    navEvents: "Eventos",
    navDocs: "Documentos",
    navSettings: "Configuración",
    viewAsAdmin: "Ver como Admin",
    viewAsFallero: "Ver como Fallero (Admin Fam.)",
    viewAsChild: "Ver como Fallero (Menor)",
    moreOptions: "Más opciones",
    
    // Dashboard
    totalFalleros: "Total Falleros",
    families: "Familias",
    nextEvents: "Próximos Eventos",
    activeLottery: "Lotería Activa",
    activeLotteries: "Loterías Activas",
    familyMembers: "Miembros Familia",
    generalSummary: "Resumen General",
    lotteryStatus: "Estado Lotería",
    manage: "Gestionar",
    sold: "vendidas",
    toSell: "por vender",
    of: "de",
    seeAll: "Ver todos",

    // Censo
    addFallero: "Añadir Fallero",
    addFamily: "Añadir Familia",
    falleros: "Falleros",
    searchUsers: "Buscar usuarios...",
    searchFamilies: "Buscar familias...",
    members: "miembros",
    representative: "Representante",
    colNumCenso: "Num. Censo",
    colCodJCF: "Cód. JCF",
    colName: "Nombre",
    colSurnames: "Apellidos",
    colDNI: "DNI",
    colPhone: "Teléfono",
    colAddress: "Dirección",
    colCity: "Población",
    colCP: "C.P.",
    colBirth: "Nacimiento",
    colSex: "Sexo",
    colRole: "Cargo",
    colReward: "Recompensa",
    colCategory: "Categoría",
    colFamily: "Familia",
    colActions: "Acciones",
    
    // Formularios
    name: "Nombre",
    quota: "Cuota Mensual",
    save: "Guardar",
    cancel: "Cancelar",
    edit: "Editar",
    delete: "Eliminar",
    monthlyQuota: "Cuota Mensual (€)",
    categoryType: "Tipo de Fallero",
    editCategory: "Editar Categoría",
    deleteCategory: "Eliminar Categoría",
    noCategoriesConfigured: "No hay categorías configuradas",
    createCategoriesDescription: "Crea categorías para definir las cuotas de los diferentes tipos de falleros",
    ageRange: "Rango de Edad",
    minAge: "Edad Mínima",
    maxAge: "Edad Máxima",
    years: "años",
    fromAge: "Desde",
    toAge: "Hasta",
    ageRangeDescription: "Los falleros serán asignados automáticamente según su fecha de nacimiento",

    // Cuotas
    quotaControl: "Control de Cuotas",
    myQuotas: "Mis Cuotas",
    registerPayment: "Registrar Pago",
    totalCollected: "Total Recaudado",
    pending: "Pendiente",
    familiesUpToDate: "Familias al día",
    statusByFamily: "Estado por Familia",
    myFamilyStatus: "Estado de mi Familia",
    upToDate: "Al día",
    viewDetail: "Ver detalle",
    totalQuota: "Cuota total",

    // Loteria
    newLottery: "Nueva Lotería",
    totalTickets: "Total papeletas",
    assigned: "Asignadas",
    soldUpper: "Vendidas",
    update: "Actualizar",

    // Eventos
    createEvent: "Crear Evento",
    join: "Apuntarse",
    viewAttendees: "Ver inscritos",
    manageEvent: "Gestionar",
    onlyFamilyAdmins: "Solo los administradores de la familia pueden apuntar a eventos",

    // Documentos
    uploadPdf: "Subir PDF",

    // Configuracion
    addCategory: "Añadir Categoría",
    quotaCategories: "Categorías de Falleros",
    generalSettings: "Configuración General",
    roles: "Roles",
    rolesComingSoon: "Gestión de roles próximamente.",
    generalConfigDescription: "Próximamente podrás configurar los parámetros generales de la falla",
    categoryByBirthdate: "Categorías por fecha de nacimiento",
    categoryDescription: "Las categorías se asignan automáticamente según la fecha de nacimiento del fallero",
  },
  va: {
    appTitle: "Gestió Falla",
    navSummary: "Resum",
    navMySummary: "El meu Resum",
    navCensus: "Cens",
    navMyFamily: "La meua Família",
    navQuotas: "Quotes",
    navMyQuotas: "Les meues Quotes",
    navLottery: "Loteria",
    navMyLottery: "La meua Loteria",
    navEvents: "Esdeveniments",
    navDocs: "Documents",
    navSettings: "Configuració",
    viewAsAdmin: "Veure com a Admin",
    viewAsFallero: "Veure com a Faller (Admin Fam.)",
    viewAsChild: "Veure com a Faller (Menor)",
    moreOptions: "Més opcions",
    
    // Dashboard
    totalFalleros: "Total Fallers",
    families: "Famílies",
    nextEvents: "Pròxims Esdeveniments",
    activeLottery: "Loteria Activa",
    activeLotteries: "Loteries Actives",
    familyMembers: "Membres Família",
    generalSummary: "Resum General",
    lotteryStatus: "Estat Loteria",
    manage: "Gestionar",
    sold: "venudes",
    toSell: "per vendre",
    of: "de",
    seeAll: "Veure tots",

    // Censo
    addFallero: "Afegir Faller",
    addFamily: "Afegir Família",
    falleros: "Fallers",
    searchUsers: "Cercar usuaris...",
    searchFamilies: "Cercar famílies...",
    members: "membres",
    representative: "Representant",
    colNumCenso: "Núm. Cens",
    colCodJCF: "Codi JCF",
    colName: "Nom",
    colSurnames: "Cognoms",
    colDNI: "DNI",
    colPhone: "Telèfon",
    colAddress: "Adreça",
    colCity: "Població",
    colCP: "C.P.",
    colBirth: "Naixement",
    colSex: "Sexe",
    colRole: "Càrrec",
    colReward: "Recompensa",
    colCategory: "Categoria",
    colFamily: "Família",
    colActions: "Accions",
    
    // Formularios
    name: "Nom",
    quota: "Quota Mensual",
    save: "Guardar",
    cancel: "Cancel·lar",
    edit: "Editar",
    delete: "Eliminar",
    monthlyQuota: "Quota Mensual (€)",
    categoryType: "Tipus de Faller",
    editCategory: "Editar Categoria",
    deleteCategory: "Eliminar Categoria",
    noCategoriesConfigured: "No hi ha categories configurades",
    createCategoriesDescription: "Crea categories per definir les quotes dels diferents tipus de fallers",
    ageRange: "Rang d'Edat",
    minAge: "Edat Mínima",
    maxAge: "Edat Máxima",
    years: "anys",
    fromAge: "Des de",
    toAge: "Fins a",
    ageRangeDescription: "Els fallers s'assignaran automàticament segons la seua data de naixement",

    // Cuotas
    quotaControl: "Control de Quotes",
    myQuotas: "Les meues Quotes",
    registerPayment: "Registrar Pagament",
    totalCollected: "Total Recaptat",
    pending: "Pendent",
    familiesUpToDate: "Famílies al dia",
    statusByFamily: "Estat per Família",
    myFamilyStatus: "Estat de la meua Família",
    upToDate: "Al dia",
    viewDetail: "Veure detall",
    totalQuota: "Quota total",

    // Loteria
    newLottery: "Nova Loteria",
    totalTickets: "Total paperetes",
    assigned: "Assignades",
    soldUpper: "Venudes",
    update: "Actualitzar",

    // Eventos
    createEvent: "Crear Esdeveniment",
    join: "Apuntar-se",
    viewAttendees: "Veure inscrits",
    manageEvent: "Gestionar",
    onlyFamilyAdmins: "Només els administradors de la família poden apuntar a esdeveniments",

    // Documentos
    uploadPdf: "Pujar PDF",

    // Configuracion
    addCategory: "Afegir Categoria",
    quotaCategories: "Categories de Fallers",
    generalSettings: "Configuració General",
    roles: "Rols",
    rolesComingSoon: "Gestió de rols pròximament.",
    generalConfigDescription: "Pròximament podràs configurar els paràmetres generals de la falla",
    categoryByBirthdate: "Categories per data de naixement",
    categoryDescription: "Les categories s'assignen automàticament segons la data de naixement del faller",
  }
};

export type Language = 'es' | 'va';
export type TranslationKey = keyof typeof translations.es;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('va'); // Default to Valencian

  const t = (key: TranslationKey): string => {
    return translations[language][key] || translations['es'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useTranslation must be used within LanguageProvider');
  return context;
};
