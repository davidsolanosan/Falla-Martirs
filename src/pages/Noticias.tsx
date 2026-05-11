import React, { useState, useEffect } from 'react';
import { useTranslation } from '../lib/i18n';
import { useSupabase } from '../lib/SupabaseContext';
import { supabase, News, NewsRead } from '../lib/supabase';
import { FileText, Calendar, User, Check, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';

export default function Noticias() {
  const { t } = useTranslation();
  const { user } = useSupabase();
  const [news, setNews] = useState<News[]>([]);
  const [readNews, setReadNews] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReadNews, setShowReadNews] = useState(false);

  // Cargar noticias de Supabase
  useEffect(() => {
    loadNewsAndReadStatus();
    
    // Verificar si hay un hash en la URL para scroll a noticia específica
    const hash = window.location.hash;
    if (hash && hash.startsWith('#news-')) {
      const newsId = hash.replace('#news-', '');
      setTimeout(() => {
        const element = document.getElementById(`news-${newsId}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          // Resaltar temporalmente la noticia
          element.style.border = '2px solid rgb(59, 130, 246)';
          element.style.boxShadow = '0 0 0 10px rgba(59, 130, 246, 0.3)';
          setTimeout(() => {
            element.style.border = '';
            element.style.boxShadow = '';
          }, 3000);
        }
      }, 1000);
    }
  }, [user]);

  const loadNewsAndReadStatus = async () => {
    try {
      // Cargar todas las noticias publicadas
      const { data: newsData, error: newsError } = await supabase
        .from('news')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (newsError) {
        console.error('Error loading news:', newsError);
        // Si no existe la tabla, mostramos datos de ejemplo
        setNews([
          {
            id: '1',
            title: 'Bienvenida a la nueva temporada',
            content: '<p>Estamos muy contentos de dar la bienvenida a todos los falleros a la nueva temporada 2026.</p>',
            author: 'Juan Pérez',
            status: 'published',
            created_at: '2026-04-29T10:00:00Z',
            updated_at: '2026-04-29T10:00:00Z',
            published_at: '2026-04-29T10:00:00Z'
          }
        ]);
        setReadNews([]);
      } else {
        setNews(newsData || []);
        
        // Cargar noticias leídas por el usuario solo si está autenticado
        if (user?.id) {
          const { data: readData, error: readError } = await supabase
            .from('news_read')
            .select('news_id')
            .eq('user_id', user.id);

          if (!readError && readData) {
            setReadNews(readData.map(item => item.news_id));
          } else {
            setReadNews([]);
          }
        } else {
          setReadNews([]);
        }
      }
    } catch (error) {
      console.error('Error:', error);
      setReadNews([]);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (newsId: string) => {
    if (!readNews.includes(newsId)) {
      // Verificar si hay usuario autenticado
      if (!user?.id) {
        alert('Debes iniciar sesión para marcar noticias como leídas');
        return;
      }

      try {
        // Guardar en Supabase que el usuario ha leído esta noticia
        const { error } = await supabase
          .from('news_read')
          .insert({
            news_id: newsId,
            user_id: user.id,
            read_at: new Date().toISOString()
          });

        if (error) {
          console.error('Error marking news as read:', error);
          alert('Error al marcar la noticia como leída');
          return;
        }

        setReadNews([...readNews, newsId]);
        alert(t('newsMarkedAsRead'));
      } catch (error) {
        console.error('Error:', error);
        alert('Error al marcar la noticia como leída');
      }
    }
  };

  const unreadNews = news.filter(n => n.status === 'published' && !readNews.includes(n.id));
  const readNewsList = news.filter(n => n.status === 'published' && readNews.includes(n.id));

  const NewsCard = ({ newsItem, isRead = false }: { newsItem: News; isRead?: boolean }) => (
    <div id={`news-${newsItem.id}`} className={`bg-white rounded-2xl shadow-sm border ${isRead ? 'border-slate-200 opacity-75' : 'border-slate-100'} overflow-hidden transition-all duration-300`}>
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className={`text-xl font-bold mb-2 ${isRead ? 'text-slate-600' : 'text-slate-800'}`}>
              {newsItem.title}
            </h3>
            <div className="flex items-center space-x-4 text-sm text-slate-600">
              <div className="flex items-center space-x-1">
                <User className="w-4 h-4" />
                <span>{newsItem.author}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>{new Date(newsItem.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          {!isRead && (
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                Nueva
              </span>
            </div>
          )}
        </div>
        
        {/* Image */}
        {newsItem.image_url && (
          <div className="mb-4">
            <img 
              src={newsItem.image_url} 
              alt={newsItem.title}
              className="w-full h-48 object-cover rounded-lg"
            />
          </div>
        )}
        
        {/* Content */}
        <div 
          className={`text-slate-700 mb-4 ${isRead ? 'line-clamp-2' : ''}`}
          dangerouslySetInnerHTML={{ __html: newsItem.content }}
        />
        
        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {!isRead && (
              <button
                onClick={() => handleMarkAsRead(newsItem.id)}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Check className="w-4 h-4 mr-2" />
                {t('markAsRead')}
              </button>
            )}
          </div>
          
          {isRead && (
            <div className="flex items-center text-sm text-slate-500">
              <Check className="w-4 h-4 mr-1" />
              {t('readNews')}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[rgb(48,80,105)] mx-auto mb-4"></div>
          <p className="text-slate-600">{t('loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-xl" style={{ backgroundColor: 'rgb(239,246,255)' }}>
                <FileText className="w-6 h-6" style={{ color: 'rgb(48,80,105)' }} />
              </div>
              <div>
                <h1 className="text-2xl font-bold" style={{ color: 'rgb(48,80,105)' }}>
                  {t('navNews')}
                </h1>
                <p className="text-slate-600">
                  {unreadNews.length > 0 
                    ? `${unreadNews.length} ${t('unreadNews').toLowerCase()}`
                    : t('noUnreadNews')
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Unread News */}
        {unreadNews.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-slate-700 mb-4 flex items-center">
              <AlertCircle className="w-5 h-5 mr-2 text-blue-600" />
              {t('unreadNews')} ({unreadNews.length})
            </h2>
            <div className="space-y-6">
              {unreadNews.map((newsItem) => (
                <NewsCard key={newsItem.id} newsItem={newsItem} />
              ))}
            </div>
          </div>
        )}

        {/* Read News Toggle */}
        {readNewsList.length > 0 && (
          <div className="mb-6">
            <button
              onClick={() => setShowReadNews(!showReadNews)}
              className="w-full flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
            >
              <h2 className="text-lg font-semibold text-slate-700 flex items-center">
                {t('readNews')} ({readNewsList.length})
              </h2>
              {showReadNews ? (
                <ChevronUp className="w-5 h-5 text-slate-600" />
              ) : (
                <ChevronDown className="w-5 h-5 text-slate-600" />
              )}
            </button>
          </div>
        )}

        {/* Read News (Collapsible) */}
        {showReadNews && readNewsList.length > 0 && (
          <div className="space-y-6">
            {readNewsList.map((newsItem) => (
              <NewsCard key={newsItem.id} newsItem={newsItem} isRead />
            ))}
          </div>
        )}

        {/* No News State */}
        {unreadNews.length === 0 && readNewsList.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 text-center">
            <div className="p-3 rounded-xl bg-slate-50 w-fit mx-auto mb-4">
              <FileText className="w-6 h-6 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-800 mb-2">{t('noNews')}</h3>
            <p className="text-slate-600">{t('noNewsDescription')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
