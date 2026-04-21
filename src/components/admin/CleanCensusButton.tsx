import { useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function CleanCensusButton() {
  const [loading, setLoading] = useState(false);

  const cleanCensus = async () => {
    if (!confirm('¿Estás seguro de que quieres borrar TODOS los usuarios y familias? Esta acción no se puede deshacer.')) {
      return;
    }

    setLoading(true);
    try {
      // Borrar todas las familias
      const { error: familiesError } = await supabase
        .from('families')
        .delete()
        .neq('id', 'dummy'); // Borrar todas

      if (familiesError) throw familiesError;

      // Borrar todos los usuarios excepto admins
      const { error: usersError } = await supabase
        .from('users')
        .delete()
        .in('role', ['directiva', 'delegado_loteria', 'delegado_festejos', 'fallero']);

      if (usersError) throw usersError;

      alert('Censo borrado completamente. Ahora puedes importar desde cero.');
      window.location.reload();
    } catch (error) {
      console.error('Error borrando censo:', error);
      alert('Error al borrar el censo: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={cleanCensus}
      disabled={loading}
      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
    >
      {loading ? 'Borrando...' : 'Borrar Censo Completo'}
    </button>
  );
}
