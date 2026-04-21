import React, { useState } from 'react';
import { Users, Key, AlertCircle, CheckCircle, Download, Mail } from 'lucide-react';
import { generateInitialPasswords, getUsersWithoutPassword } from '../../utils/passwordGenerator';

export function PasswordGenerator() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleGeneratePasswords = async () => {
    setIsGenerating(true);
    setError('');
    setSuccess('');
    setResults(null);

    try {
      const result = await generateInitialPasswords();
      
      if (result.success) {
        setResults(result);
        setSuccess(`¡Contraseñas generadas para ${result.processed} usuarios!`);
      } else {
        setError(result.error || 'Error generando contraseñas');
      }
    } catch (err: any) {
      console.error('Error generating passwords:', err);
      setError('Ocurrió un error. Por favor, inténtalo de nuevo.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCheckUsers = async () => {
    setIsGenerating(true);
    setError('');
    setSuccess('');

    try {
      const result = await getUsersWithoutPassword();
      
      if (result.success) {
        setResults(result);
        setSuccess(`Hay ${result.total} usuarios elegibles sin contraseña`);
      } else {
        setError(result.error || 'Error verificando usuarios');
      }
    } catch (err: any) {
      console.error('Error checking users:', err);
      setError('Ocurrió un error. Por favor, inténtalo de nuevo.');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadCSV = () => {
    if (!results?.results) return;

    const csvContent = [
      ['Usuario', 'Email', 'Categoría', 'DNI', 'Año Nacimiento', 'Contraseña', 'Estado'],
      ...results.results.map((result: any) => [
        result.user || '',
        result.email || '',
        result.category || '',
        result.dni || '',
        result.birth_year || '',
        result.password || '',
        result.status || ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contraseñas_falleros_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const sendEmails = () => {
    if (!results?.results) return;

    const successfulUsers = results.results.filter((r: any) => r.status === 'success');
    
    // Aquí implementarías el envío real de emails
    // Por ahora, mostramos una alerta con los datos
    const emailContent = successfulUsers.map((user: any) => 
      `Para: ${user.email}\nUsuario: ${user.user}\nContraseña: ${user.password}\n---`
    ).join('\n');

    alert('Emails preparados. Implementar servicio de envío:\n\n' + emailContent);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
          <Key className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-800">Generador de Contraseñas</h2>
          <p className="text-sm text-slate-500">Genera contraseñas iniciales para falleros</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg flex items-start text-red-600 text-sm">
          <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-100 rounded-lg flex items-start text-green-600 text-sm">
          <CheckCircle className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
          <span>{success}</span>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex gap-3">
          <button
            onClick={handleCheckUsers}
            disabled={isGenerating}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-50"
          >
            <Users className="w-4 h-4" />
            {isGenerating ? 'Verificando...' : 'Verificar Usuarios'}
          </button>

          <button
            onClick={handleGeneratePasswords}
            disabled={isGenerating}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            <Key className="w-4 h-4" />
            {isGenerating ? 'Generando...' : 'Generar Contraseñas'}
          </button>
        </div>

        {results?.users && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-2">Usuarios elegibles sin contraseña:</h3>
            <div className="text-sm text-blue-700">
              <p>Total: {results.users.length} usuarios</p>
              <ul className="mt-2 space-y-1">
                {results.users.slice(0, 5).map((user: any, idx: number) => (
                  <li key={idx}>
                    {user.name} {user.surname} - {user.email} - {user.categories?.name}
                  </li>
                ))}
                {results.users.length > 5 && (
                  <li className="text-blue-600">...y {results.users.length - 5} más</li>
                )}
              </ul>
            </div>
          </div>
        )}

        {results?.results && (
          <div className="space-y-4">
            <div className="flex gap-3">
              <button
                onClick={downloadCSV}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                <Download className="w-4 h-4" />
                Descargar CSV
              </button>

              <button
                onClick={sendEmails}
                className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
              >
                <Mail className="w-4 h-4" />
                Preparar Emails
              </button>
            </div>

            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <div className="bg-slate-50 px-4 py-2 border-b border-slate-200">
                <h3 className="font-medium text-slate-700">Resultados</h3>
              </div>
              <div className="max-h-64 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 sticky top-0">
                    <tr>
                      <th className="px-4 py-2 text-left">Usuario</th>
                      <th className="px-4 py-2 text-left">Email</th>
                      <th className="px-4 py-2 text-left">Categoría</th>
                      <th className="px-4 py-2 text-left">Contraseña</th>
                      <th className="px-4 py-2 text-left">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.results.map((result: any, idx: number) => (
                      <tr key={idx} className="border-t border-slate-100">
                        <td className="px-4 py-2">{result.user}</td>
                        <td className="px-4 py-2">{result.email}</td>
                        <td className="px-4 py-2">{result.category}</td>
                        <td className="px-4 py-2 font-mono text-xs">
                          {result.password || '-'}
                        </td>
                        <td className="px-4 py-2">
                          <span className={`px-2 py-1 rounded text-xs ${
                            result.status === 'success' 
                              ? 'bg-green-100 text-green-700'
                              : result.status === 'skipped'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {result.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <h3 className="font-medium text-amber-900 mb-2">Información importante:</h3>
          <ul className="text-sm text-amber-700 space-y-1">
            <li> Solo se generan contraseñas para usuarios con categorías: Juvenil, Adulto, Jubilado</li>
            <li> Los usuarios deben tener email, DNI y año de nacimiento registrados</li>
            <li> Formato de contraseña: DNI + Año de nacimiento (ej: 12345678A1990)</li>
            <li> Las contraseñas se marcan como temporales, obligando al cambio en primer login</li>
            <li> Descarga el CSV para tener un respaldo de las contraseñas generadas</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
