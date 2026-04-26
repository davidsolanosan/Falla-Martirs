import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../lib/i18n';
import { 
  NewspaperIcon, 
  CalendarIcon, 
  CurrencyDollarIcon, 
  TicketIcon, 
  CogIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';

export default function Inici() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const menuItems = [
    {
      id: 'noticies',
      title: t('noticies'),
      icon: 'noticies.png',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      route: '/noticies'
    },
    {
      id: 'esdeveniments',
      title: t('esdeveniments'),
      icon: 'esdeveniments.png',
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
      route: '/esdeveniments'
    },
    {
      id: 'quotes',
      title: t('quotes'),
      icon: 'quotes.png',
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      route: '/cuotas'
    },
    {
      id: 'loteria',
      title: t('loteria'),
      icon: 'loteria.png',
      color: 'from-yellow-500 to-yellow-600',
      bgColor: 'bg-yellow-50',
      iconColor: 'text-yellow-600',
      route: '/loterias'
    },
    {
      id: 'documents',
      title: t('documents'),
      icon: 'Documents.png',
      color: 'from-cyan-500 to-cyan-600',
      bgColor: 'bg-cyan-50',
      iconColor: 'text-cyan-600',
      route: '/documents'
    },
    {
      id: 'galeria',
      title: t('galeria'),
      icon: 'galeria.png',
      color: 'from-pink-500 to-pink-600',
      bgColor: 'bg-pink-50',
      iconColor: 'text-pink-600',
      route: '/galeria'
    },
    {
      id: 'configuracio',
      title: t('configuracio'),
      icon: CogIcon,
      color: 'from-slate-500 to-slate-600',
      bgColor: 'bg-slate-50',
      iconColor: 'text-slate-600',
      route: '/configuracio'
    }
  ];

  const handleNavigation = (route: string) => {
    navigate(route);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-800 mb-2">{t('inici')}</h1>
        <p className="text-slate-600">Portal Falla Màrtirs</p>
      </div>

      {/* Grid de tarjetas - Perfectamente cuadrada */}
      <div className="grid grid-cols-2 gap-4 aspect-square mb-6">
        {menuItems.slice(0, 6).map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.route)}
              className="group relative bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all duration-200 hover:scale-105 active:scale-95 aspect-square"
            >
              {/* Fondo decorativo */}
              <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-200`} />
              
              <div className="flex flex-col h-full relative">
                {/* Icono flotante para imágenes personalizadas */}
                {(item.id === 'esdeveniments' || item.id === 'noticies' || item.id === 'quotes' || item.id === 'loteria' || item.id === 'documents' || item.id === 'galeria') && (
                  <div className="absolute top-3 left-1/2 transform -translate-x-1/2 group-hover:scale-110 transition-transform duration-200 z-10">
                    <img 
                      src={`/icons/${item.icon}`} 
                      alt={item.title}
                      className="w-22 h-22 object-cover"
                    />
                  </div>
                )}
                
                {/* Icono normal para otros */}
                {(item.id !== 'esdeveniments' && item.id !== 'noticies' && item.id !== 'quotes' && item.id !== 'loteria' && item.id !== 'documents' && item.id !== 'galeria') && (
                  <div className={`${item.bgColor} w-16 h-16 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200`}>
                    <Icon className={`w-9 h-9 ${item.iconColor}`} />
                  </div>
                )}
                
                {/* Contenido inferior */}
                <div className={`${(item.id === 'esdeveniments' || item.id === 'noticies' || item.id === 'quotes' || item.id === 'loteria' || item.id === 'documents' || item.id === 'galeria') ? 'absolute top-25 left-0 right-0' : ''}`}>
                  {/* Título */}
                  <h3 className="text-lg font-bold text-center mb-1 tracking-wide" style={{ fontFamily: "'Madimi One', sans-serif", color: "#464971" }}>
                    {item.title}
                  </h3>
                  
                  {/* Indicador de navegación */}
                  <div className="flex items-center justify-center">
                    <span className="text-sm font-medium text-slate-500 mr-4" style={{ fontFamily: "'Madimi One', sans-serif" }}>
                      {item.id === 'noticies' && '3 noves'}
                      {item.id === 'esdeveniments' && '2 pròxims'}
                      {item.id === 'quotes' && 'Veure estat'}
                      {item.id === 'loteria' && 'Activa'}
                    </span>
                    <div className="flex items-center space-x-1">
                      <div className="w-1 h-1 bg-slate-600 rounded-full"></div>
                      <div className="w-1 h-1 bg-slate-600 rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Tarjeta de Configuración - Ancho completo */}
      <button
        onClick={() => handleNavigation('/configuracio')}
        className="w-full group relative bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Icono */}
            <div className="bg-slate-50 w-12 h-12 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
              <CogIcon className="w-6 h-6 text-slate-600" />
            </div>
            
            {/* Contenido */}
            <div className="text-left">
              <h3 className="text-lg font-semibold text-slate-800">
                {t('configuracio')}
              </h3>
              <p className="text-sm text-slate-500">
                Preferencias y ajustes
              </p>
            </div>
          </div>
          
          {/* Indicador */}
          <ChevronRightIcon className="w-5 h-5 text-slate-400 group-hover:text-slate-600 group-hover:translate-x-1 transition-all duration-200" />
        </div>
      </button>

      {/* Espacio extra para scroll en móvil */}
      <div className="h-20"></div>
    </div>
  );
}
