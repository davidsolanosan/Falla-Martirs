import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../lib/i18n';
import { useSupabase } from '../../lib/SupabaseContext';
import { supabase, News } from '../../lib/supabase';
import { Plus, Edit2, Trash2, FileText, Eye, EyeOff, Calendar, User, AlertCircle, CheckCircle } from 'lucide-react';
import TextEditor from '../../components/editor/TextEditor';

export default function NoticiasAdmin() {
  const { t } = useTranslation();
  const { user } = useSupabase();
  const [news, setNews] = useState<News[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingNews, setEditingNews] = useState<News | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    image_url: '',
    author: user?.name || '',
    status: 'draft' as 'draft' | 'published' | 'hidden'
  });

  // Cargar noticias de Supabase
  useEffect(() => {
    loadNews();
  }, []);

  const loadNews = async () => {
    try {
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading news:', error);
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
      } else {
        setNews(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingNews) {
        // Editar noticia existente
        const { error } = await supabase
          .from('news')
          .update({
            ...formData,
            updated_at: new Date().toISOString(),
            ...(formData.status === 'published' && !editingNews.published_at && { published_at: new Date().toISOString() })
          })
          .eq('id', editingNews.id);

        if (error) {
          console.error('Error updating news:', error);
          alert('Error al actualizar la noticia');
          return;
        }
        
        alert(t('newsUpdated'));
      } else {
        // Crear nueva noticia
        const newNews = {
          ...formData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          ...(formData.status === 'published' && { published_at: new Date().toISOString() })
        };

        const { error } = await supabase
          .from('news')
          .insert(newNews);

        if (error) {
          console.error('Error creating news:', error);
          alert('Error al crear la noticia');
          return;
        }
        
        alert(t('newsCreated'));
      }
      
      await loadNews(); // Recargar noticias
      handleCloseModal();
    } catch (error) {
      console.error('Error:', error);
      alert('Error al guardar la noticia');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm(t('confirmDeleteNews'))) {
      try {
        const { error } = await supabase
          .from('news')
          .delete()
          .eq('id', id);

        if (error) {
          console.error('Error deleting news:', error);
          alert('Error al eliminar la noticia');
          return;
        }
        
        alert(t('newsDeleted'));
        await loadNews(); // Recargar noticias
      } catch (error) {
        console.error('Error:', error);
        alert('Error al eliminar la noticia');
      }
    }
  };

  const handleStatusChange = async (id: string, newStatus: 'draft' | 'published' | 'hidden') => {
    const confirmMessages = {
      published: t('confirmPublishNews'),
      hidden: t('confirmHideNews'),
      draft: ''
    };
    
    if (newStatus !== 'draft' && !confirm(confirmMessages[newStatus])) {
      return;
    }
    
    try {
      const newsItem = news.find(n => n.id === id);
      const updateData = {
        status: newStatus,
        updated_at: new Date().toISOString(),
        ...(newStatus === 'published' && !newsItem?.published_at && { published_at: new Date().toISOString() })
      };

      const { error } = await supabase
        .from('news')
        .update(updateData)
        .eq('id', id);

      if (error) {
        console.error('Error updating news status:', error);
        alert('Error al cambiar el estado de la noticia');
        return;
      }
      
      const successMessages = {
        published: t('newsPublished'),
        hidden: t('newsHidden'),
        draft: t('newsUpdated')
      };
      alert(successMessages[newStatus]);
      await loadNews(); // Recargar noticias
    } catch (error) {
      console.error('Error:', error);
      alert('Error al cambiar el estado de la noticia');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingNews(null);
    setFormData({
      title: '',
      content: '',
      image_url: '',
      author: user?.name || '',
      status: 'draft'
    });
  };

  const handleEdit = (newsItem: News) => {
    setEditingNews(newsItem);
    setFormData({
      title: newsItem.title,
      content: newsItem.content,
      image_url: newsItem.image_url || '',
      author: newsItem.author,
      status: newsItem.status
    });
    setShowModal(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'hidden':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'published':
        return t('newsPublished');
      case 'hidden':
        return t('newsHidden');
      default:
        return t('newsDraft');
    }
  };

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
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-xl" style={{ backgroundColor: 'rgb(239,246,255)' }}>
                <FileText className="w-6 h-6" style={{ color: 'rgb(48,80,105)' }} />
              </div>
              <div>
                <h1 className="text-2xl font-bold" style={{ color: 'rgb(48,80,105)' }}>
                  {t('newsManagement')}
                </h1>
                <p className="text-slate-600">
                  {t('adminNewsDescription')}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center px-4 py-2 text-white rounded-lg transition-colors"
              style={{ backgroundColor: 'rgb(48,80,105)' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgb(38,70,95)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgb(48,80,105)'}
            >
              <Plus className="w-4 h-4 mr-2" />
              {t('addNews')}
            </button>
          </div>
        </div>

        {/* News List */}
        <div className="space-y-6">
          {news.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 text-center">
              <div className="p-3 rounded-xl bg-slate-50 w-fit mx-auto mb-4">
                <FileText className="w-6 h-6 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-800 mb-2">{t('noNews')}</h3>
              <p className="text-slate-600">{t('noNewsDescription')}</p>
            </div>
          ) : (
            news.map((newsItem) => (
              <div key={newsItem.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-slate-800 mb-2">{newsItem.title}</h3>
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
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(newsItem.status)}`}>
                        {getStatusText(newsItem.status)}
                      </span>
                    </div>
                  </div>
                  
                  {/* Content preview */}
                  <div 
                    className="text-slate-700 mb-4 line-clamp-3"
                    dangerouslySetInnerHTML={{ __html: newsItem.content }}
                  />
                  
                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEdit(newsItem)}
                        className="inline-flex items-center px-3 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                      >
                        <Edit2 className="w-4 h-4 mr-1" />
                        {t('editNews')}
                      </button>
                      
                      {newsItem.status === 'published' ? (
                        <button
                          onClick={() => handleStatusChange(newsItem.id, 'hidden')}
                          className="inline-flex items-center px-3 py-2 text-sm font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200 transition-colors"
                        >
                          <EyeOff className="w-4 h-4 mr-1" />
                          {t('hideNews')}
                        </button>
                      ) : newsItem.status === 'hidden' ? (
                        <button
                          onClick={() => handleStatusChange(newsItem.id, 'published')}
                          className="inline-flex items-center px-3 py-2 text-sm font-medium text-green-700 bg-green-100 rounded-lg hover:bg-green-200 transition-colors"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          {t('showNews')}
                        </button>
                      ) : (
                        <button
                          onClick={() => handleStatusChange(newsItem.id, 'published')}
                          className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          {t('publishNews')}
                        </button>
                      )}
                    </div>
                    
                    <button
                      onClick={() => handleDelete(newsItem.id)}
                      className="inline-flex items-center px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      {t('deleteNews')}
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-800">
                  {editingNews ? t('editNews') : t('createNews')}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <AlertCircle className="w-5 h-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {t('newsTitle')}
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[rgb(48,80,105)] focus:border-transparent"
                  placeholder={t('newsTitlePlaceholder')}
                  required
                />
              </div>

              {/* Author */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {t('newsAuthor')}
                </label>
                <input
                  type="text"
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[rgb(48,80,105)] focus:border-transparent"
                  placeholder={t('newsAuthorPlaceholder')}
                  required
                />
              </div>

              {/* Image */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {t('newsImage')}
                </label>
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[rgb(48,80,105)] focus:border-transparent"
                  placeholder={t('newsImagePlaceholder')}
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {t('newsContent')}
                </label>
                <TextEditor
                  value={formData.content}
                  onChange={(value) => setFormData({ ...formData, content: value })}
                  placeholder={t('newsContentPlaceholder')}
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {t('newsStatus')}
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as 'draft' | 'published' | 'hidden' })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[rgb(48,80,105)] focus:border-transparent"
                >
                  <option value="draft">{t('newsDraft')}</option>
                  <option value="published">{t('newsPublished')}</option>
                  <option value="hidden">{t('newsHidden')}</option>
                </select>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end space-x-3 pt-6 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-white rounded-lg transition-colors"
                  style={{ backgroundColor: 'rgb(48,80,105)' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgb(38,70,95)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgb(48,80,105)'}
                >
                  {editingNews ? t('editNews') : t('createNews')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
