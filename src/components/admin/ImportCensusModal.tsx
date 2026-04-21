import React, { useState, useRef } from 'react';
import { Modal } from '../ui/Modal';
import { Upload, AlertCircle, CheckCircle2, FileSpreadsheet } from 'lucide-react';
import { useSupabase } from '../../lib/SupabaseContext';
import { supabase } from '../../lib/supabase';
import { useTranslation } from '../../lib/i18n';
import { User, Family, Category } from '../../types';
import * as XLSX from 'xlsx';

interface ImportCensusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ImportCensusModal({ isOpen, onClose }: ImportCensusModalProps) {
  const { categories, createUser, updateUser } = useSupabase();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [preview, setPreview] = useState<any[]>([]);
  const [allData, setAllData] = useState<any[]>([]); // Guardar todos los datos
  const [showPreview, setShowPreview] = useState(false);
  const [duplicates, setDuplicates] = useState<any[]>([]);
  const [importMode, setImportMode] = useState<'create' | 'update' | 'both'>('both');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError('');
      setSuccess('');
    }
  };

  const parseFile = async (file: File) => {
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    
    if (fileExtension === 'csv') {
      // Parsear CSV
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      const headers = lines[0]?.split(';').map(h => h.trim());
      const data = [];

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(';').map(v => v.trim());
        if (values.length === headers.length) {
          const row: any = {};
          headers.forEach((header, index) => {
            row[header] = values[index];
          });
          data.push(row);
        }
      }

      return data;
    } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
      // Parsear Excel
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      // Convertir a formato JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      if (jsonData.length === 0) return [];
      
      // Primera fila son los headers
      const headers = jsonData[0] as string[];
      const data = [];
      
      for (let i = 1; i < jsonData.length; i++) {
        const row = jsonData[i] as any[];
        if (row.length === 0 || row.every(cell => cell === '' || cell === null || cell === undefined)) {
          continue; // Saltar filas vacías
        }
        
        const rowObj: any = {};
        headers.forEach((header, index) => {
          rowObj[header] = row[index] || '';
        });
        data.push(rowObj);
      }
      
      return data;
    } else {
      throw new Error('Formato de archivo no soportado. Use CSV o XLSX.');
    }
  };

  const findExistingUsers = async (data: any[]) => {
    // Extraer DNIs únicos del archivo
    const dniList = data.map(d => d.DNI).filter(Boolean);
    const emailList = data.map(d => d.CORREU).filter(Boolean); // Usar emails reales del Excel
    
    console.log('DNIs a buscar:', dniList.slice(0, 10));
    console.log('Emails reales a buscar:', emailList.slice(0, 10));
    
    // Buscar por DNI primero
    let { data: usersByDni } = await supabase
      .from('users')
      .select('id, email, dni, name, surname')
      .in('dni', dniList);
    
    // Buscar por email también (solo los que tienen email real)
    let { data: usersByEmail } = await supabase
      .from('users')
      .select('id, email, dni, name, surname')
      .in('email', emailList);
    
    // Combinar y eliminar duplicados
    const allUsers = [...(usersByDni || []), ...(usersByEmail || [])];
    const uniqueUsers = allUsers.filter((user, index, self) => 
      index === self.findIndex(u => u.id === user.id)
    );
    
    console.log('Usuarios encontrados por DNI:', usersByDni?.length || 0);
    console.log('Usuarios encontrados por Email real:', usersByEmail?.length || 0);
    console.log('Usuarios únicos combinados:', uniqueUsers.length);
    
    return uniqueUsers;
  };

  const isDuplicate = (newUser: any, existingUsers: any[]) => {
    return existingUsers.find(existing => {
      // Duplicado por DNI exacto
      if (newUser.DNI && existing.dni === newUser.DNI) return true;
      
      // Duplicado por email real (si existe en el Excel)
      if (newUser.CORREU && existing.email === newUser.CORREU) return true;
      
      // Caso especial FN: si ambos empiezan por FN
      if (newUser.DNI?.startsWith('FN') && existing.dni?.startsWith('FN')) {
        return existing.name === newUser.NOM && existing.surname === newUser.COGNOMS;
      }
      
      return false;
    });
  };

  const handlePreview = async () => {
    if (!file) {
      setError('Por favor selecciona un archivo');
      return;
    }

    try {
      const data = await parseFile(file);

      if (data.length === 0) {
        throw new Error('No se pudieron leer los datos del archivo. Asegúrate de que el archivo tiene datos.');
      }

      console.log('=== DEBUG IMPORTACIÓN ===');
      console.log('Total filas en Excel:', data.length);
      console.log('Muestra de datos:', data.slice(0, 3));

      // Buscar usuarios existentes
      const existingUsers = await findExistingUsers(data);
      
      console.log('Usuarios existentes encontrados:', existingUsers.length);
      console.log('Muestra de existentes:', existingUsers.slice(0, 3));
      
      // Identificar duplicados
      const duplicateRows = data.filter(row => isDuplicate(row, existingUsers));
      
      console.log('Duplicados detectados:', duplicateRows.length);
      console.log('Muestra de duplicados:', duplicateRows.slice(0, 3));
      
      // Analizar primeros 10 para ver por qué no se detectan
      console.log('=== ANÁLISIS DE PRIMEROS 10 ===');
      data.slice(0, 10).forEach((row, idx) => {
        const emailReal = row.CORREU; // Email real del Excel
        const foundByDni = existingUsers.find(u => u.dni === row.DNI);
        const foundByEmail = emailReal ? existingUsers.find(u => u.email === emailReal) : false;
        console.log(`Fila ${idx}: DNI=${row.DNI}, EmailReal=${emailReal || 'SIN EMAIL'}`);
        console.log(`  -> Encontrado por DNI: ${!!foundByDni}`);
        console.log(`  -> Encontrado por Email real: ${!!foundByEmail}`);
        console.log(`  -> Es FN: ${row.DNI?.startsWith('FN')}`);
      });
      
      // Guardar todos los datos para el cálculo correcto
      setAllData(data); // Guardar todos los datos
      setPreview(data.slice(0, 10)); // Mostrar solo primeros 10 como preview
      setDuplicates(duplicateRows);
      setShowPreview(true);
      
    } catch (err: any) {
      console.error('Error previewing file:', err);
      setError(err.message || 'Error al procesar el archivo');
    }
  };

  const handleImport = async () => {
    if (!file) {
      setError('Por favor selecciona un archivo');
      return;
    }

    setIsUploading(true);
    setError('');
    setSuccess('');

    try {
      // Usar los datos que ya cargamos en el preview
      console.log('=== INICIO IMPORTACIÓN ===');
      console.log('Archivo:', file.name);
      console.log('allData length:', allData.length);
      
      const data = allData.length > 0 ? allData : await parseFile(file);
      
      console.log('Datos parseados:', data.length);
      console.log('Primera fila:', data[0]);

      if (data.length === 0) {
        throw new Error('No se pudieron leer los datos del archivo. Asegúrate de que el archivo tiene datos.');
      }

      // Buscar usuarios existentes
      console.log('Buscando usuarios existentes...');
      const existingUsers = await findExistingUsers(data);
      console.log('Usuarios existentes encontrados:', existingUsers.length);
      
      // Función para convertir número de Excel a fecha
function convertExcelDate(excelDate: number): string {
  // Excel usa 1 de enero de 1900 como día 1 (pero Excel cree que 1900 fue bisiesto)
  // Restamos 2 días para compensar el error del bisiesto de Excel
  const date = new Date((excelDate - 25569) * 86400 * 1000);
  
  // Formatear como DD/MM/YYYY
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  
  return `${day}/${month}/${year}`;
}

// Función para procesar el campo de fecha
function processBirthYear(rawValue: any): string {
  if (!rawValue) return '';
  
  if (typeof rawValue === 'number') {
    // Es un número de Excel, convertirlo
    return convertExcelDate(rawValue);
  }
  
  if (typeof rawValue === 'string') {
    // Ya es texto, usarlo directamente
    return rawValue;
  }
  
  return String(rawValue);
}

      // Importar usuarios uno por uno
      let successCount = 0;
      let errorCount = 0;
      let updateCount = 0;
      let skipCount = 0;
      
      for (const row of data) {
        try {
          console.log(`\n=== PROCESANDO FILA ${successCount + errorCount + 1} ===`);
          
          // MOSTRAR TODAS LAS COLUMNAS Y VALORES
          console.log('=== TODAS LAS COLUMNAS ===');
          Object.keys(row).forEach(key => {
            console.log(`${key}: "${row[key]}" (${typeof row[key]})`);
          });
          console.log('=== FIN COLUMNAS ===');
          
          // DEBUG ESPECÍFICO PARA POSTAL, ANY.NAIX Y TELÈFON
          console.log('=== DEBUG POSTAL, ANY.NAIX Y TELÈFON ===');
          console.log('Buscando POSTAL:', row.POSTAL);
          console.log('Buscando ANY.NAIX:', row['ANY.NAIX']);
          console.log('Buscando TELÈFON:', row['TELÈFON']);
          console.log('=== FIN DEBUG ESPECÍFICO ===');
          
          // Mapear campos del CSV al formato de Supabase
          console.log('=== DEBUG FILA COMPLETA ===');
          console.log('Row completa:', row);
          console.log('Columnas disponibles:', Object.keys(row));
          console.log('Valor POSTAL:', row.POSTAL);
          console.log('Valor ANY.NAIX:', row['ANY.NAIX']);
          console.log('Tipo POSTAL:', typeof row.POSTAL);
          console.log('Tipo ANY.NAIX:', typeof row['ANY.NAIX']);
          
          const processedBirthYear = processBirthYear(row['NAIXEMENT']); // Usar el nombre exacto de la columna
          console.log('Birth year procesado:', processedBirthYear);
          
          const userData = {
            email: row.CORREU || `${row.DNI?.replace(/\s+/g, '')}@falla-martirs.com`, // Usar email real si existe
            name: row.NOM || '',
            surname: row.COGNOMS || '',
            birth_year: processedBirthYear, // Usar fecha convertida
            dni: row.DNI || '',
            phone: row['TELÈFON'] || '', // Usar directamente TELÈFON con acento
            // Campos adicionales del CSV
            codigo_jcf: row['COD.JCF'] || '',
            numero_censo: row['NUM.CENS'] || '',
            address: row.ADREÇA || '',
            poblacion: row['POBLACIÓ'] || '',
            codigo_postal: row['C.P'] || '', // Columna C.P (código postal)
            sexo: row.SEXE || '',
            sexe: row.SEXE || '', // Campo del Excel
            correu: row.CORREU || '',
            cargo: row.CARREC || '',
            recompensa: row.RECOMPENSA || '',
            tutor: row.TUTOR || '', // Columna TUTOR
            telefono_tutor: row['TELEFON TUTOR'] || '', // Columna TELEFON TUTOR
            role: 'user' as 'user'
          };
          
          console.log('UserData final:', userData);

          const duplicate = isDuplicate(row, existingUsers);
          const existingUser = existingUsers.find(u => 
            u.dni === row.DNI || 
            (row.CORREU && u.email === row.CORREU) ||
            (row.DNI?.startsWith('FN') && u.dni?.startsWith('FN') && u.name === row.NOM && u.surname === row.COGNOMS)
          );

          // Decidir qué hacer basado en el modo de importación
          if (duplicate && existingUser) {
            if (importMode === 'create') {
              skipCount++;
              continue;
            } else if (importMode === 'update') {
              await updateUser(existingUser.id, userData);
              updateCount++;
              continue;
            }
            // 'both': actualizar
            await updateUser(existingUser.id, userData);
            updateCount++;
          } else {
            // No es duplicado, crear nuevo
            await createUser(userData);
            successCount++;
          }
        } catch (rowError) {
          console.error(`Error procesando fila ${successCount + errorCount + 1}:`, rowError);
          console.error('Row que falló:', row);
          errorCount++;
          continue;
        }
      }

      setSuccess(
        `Importación completada: ${successCount} nuevos${updateCount > 0 ? ` | ${updateCount} actualizados` : ''}${skipCount > 0 ? ` | ${skipCount} omitidos` : ''}${errorCount > 0 ? ` | ${errorCount} errores` : ''}`
      );
      setIsUploading(false);
      
      setTimeout(() => {
        onClose();
        setFile(null);
        setSuccess('');
        setShowPreview(false);
        setPreview([]);
        setDuplicates([]);
        setAllData([]);
      }, 3000);
    } catch (err: any) {
      console.error('Error importing census:', err);
      setError(err.message || 'Error al procesar el archivo');
      setIsUploading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Importar Censo" maxWidth="max-w-4xl">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Seleccionar archivo (CSV o XLSX)
          </label>
          <div className="flex items-center justify-center w-full">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-slate-300 rounded-lg hover:border-slate-400 transition-colors"
            >
              {file?.name.endsWith('.xlsx') || file?.name.endsWith('.xls') ? (
                <FileSpreadsheet className="w-4 h-4 text-slate-400" />
              ) : (
                <Upload className="w-4 h-4 text-slate-400" />
              )}
              <span className="text-sm text-slate-600">
                {file ? file.name : 'Seleccionar archivo CSV o XLSX'}
              </span>
            </button>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Formatos soportados: CSV (separado por ;) y Excel (.xlsx, .xls)
          </p>
        </div>

        {/* Modo de importación */}
        {file && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Modo de importación
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setImportMode('create')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  importMode === 'create'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Solo nuevos
              </button>
              <button
                type="button"
                onClick={() => setImportMode('update')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  importMode === 'update'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Solo actualizar
              </button>
              <button
                type="button"
                onClick={() => setImportMode('both')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  importMode === 'both'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Crear + Actualizar
              </button>
            </div>
          </div>
        )}

        {/* Preview y duplicados */}
        {showPreview && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="text-blue-900 font-medium">Total registros</div>
                <div className="text-blue-700">{allData.length}</div>
              </div>
              <div className="bg-amber-50 p-3 rounded-lg">
                <div className="text-amber-900 font-medium">Duplicados detectados</div>
                <div className="text-amber-700">{duplicates.length}</div>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="text-green-900 font-medium">Nuevos</div>
                <div className="text-green-700">{allData.length - duplicates.length}</div>
              </div>
            </div>

            {duplicates.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <h4 className="text-sm font-medium text-amber-900 mb-2">Primeros duplicados detectados:</h4>
                <div className="text-xs text-amber-700 space-y-1 max-h-32 overflow-y-auto">
                  {duplicates.slice(0, 5).map((dup, idx) => (
                    <div key={idx}>
                      <strong>{dup.NOM} {dup.COGNOMS}</strong> - DNI: {dup.DNI || 'FN...'}
                    </div>
                  ))}
                  {duplicates.length > 5 && (
                    <div className="text-amber-600">...y {duplicates.length - 5} más</div>
                  )}
                </div>
                <div className="text-xs text-amber-600 mt-2">
                  <strong>Casos FN:</strong> Se detectan por nombre + apellidos cuando ambos empiezan por "FN"
                </div>
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <h4 className="text-sm font-medium text-blue-900 mb-2">Vista previa de datos:</h4>
              <div className="text-xs text-blue-700">
                Mostrando {preview.length} de {allData.length} registros totales
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            <span className="text-sm text-green-700">{success}</span>
          </div>
        )}

        <div className="pt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors text-sm"
          >
            Cancelar
          </button>
          {file && !showPreview && (
            <button
              type="button"
              onClick={handlePreview}
              className="px-3 py-1.5 bg-amber-600 text-white rounded-lg font-medium transition-colors text-sm hover:bg-amber-700"
            >
              Previsualizar
            </button>
          )}
          {showPreview && (
            <button
              type="button"
              onClick={handleImport}
              disabled={!file || isUploading}
              className="w-full flex items-center justify-center bg-white text-[rgb(48,80,105)] border-3 border-[rgb(48,80,105)] hover:bg-[rgb(48,80,105)] hover:text-white px-3 py-1.5 rounded-xl font-medium transition-all shadow-sm text-sm disabled:opacity-50"
            >
              {isUploading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Importando...
                </div>
              ) : (
                `Importar (${importMode === 'create' ? 'solo nuevos' : importMode === 'update' ? 'solo actualizar' : 'crear + actualizar'})`
              )}
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}
