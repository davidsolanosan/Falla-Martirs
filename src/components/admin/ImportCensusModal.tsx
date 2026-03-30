import React, { useState, useRef } from 'react';
import { Modal } from '../ui/Modal';
import { Upload, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useData } from '../../lib/DataContext';
import { collection, addDoc, getDocs, query, where, writeBatch, doc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { User, Family, Category } from '../../types';

interface ImportCensusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ImportCensusModal({ isOpen, onClose }: ImportCensusModalProps) {
  const { categories } = useData();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError('');
      setSuccess('');
    }
  };

  const parseCSV = (text: string) => {
    const lines = text.split('\n');
    const headers = lines[0].split(';').map(h => h.trim().replace(/"/g, ''));
    
    const result = [];
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      
      // Handle commas inside quotes if necessary, but assuming simple semicolon separated for now
      // as it's common in Spanish Excel exports
      const currentline = lines[i].split(';');
      
      if (currentline.length === headers.length) {
        const obj: any = {};
        for (let j = 0; j < headers.length; j++) {
          obj[headers[j]] = currentline[j].trim().replace(/"/g, '');
        }
        result.push(obj);
      }
    }
    return result;
  };

  const handleImport = async () => {
    if (!file) {
      setError('Por favor, selecciona un archivo CSV.');
      return;
    }

    setIsUploading(true);
    setError('');
    setSuccess('');

    try {
      const text = await file.text();
      // Try semicolon first (common in Excel ES), then comma
      let data = parseCSV(text);
      if (data.length === 0 || Object.keys(data[0]).length <= 1) {
        // Fallback to comma separated
        const lines = text.split('\n');
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        data = [];
        for (let i = 1; i < lines.length; i++) {
          if (!lines[i].trim()) continue;
          const currentline = lines[i].split(',');
          if (currentline.length === headers.length) {
            const obj: any = {};
            for (let j = 0; j < headers.length; j++) {
              obj[headers[j]] = currentline[j].trim().replace(/"/g, '');
            }
            data.push(obj);
          }
        }
      }

      if (data.length === 0) {
        throw new Error('No se pudieron leer los datos del archivo. Asegúrate de que es un CSV válido.');
      }

      // 1. Ensure "Pendiente" category exists
      let pendingCategoryId = '';
      const pendingCat = categories.find(c => c.name.toLowerCase() === 'pendiente');
      if (pendingCat) {
        pendingCategoryId = pendingCat.id;
      } else {
        const newCatRef = await addDoc(collection(db, 'categories'), {
          name: 'Pendiente',
          quotaAmount: 0
        });
        pendingCategoryId = newCatRef.id;
      }

      // 2. Group by Address (ADREÇA)
      const familiesByAddress: Record<string, any[]> = {};
      data.forEach(row => {
        const address = row['ADREÇA'] || 'Sin Dirección';
        if (!familiesByAddress[address]) {
          familiesByAddress[address] = [];
        }
        familiesByAddress[address].push(row);
      });

      // 3. Process batches (Firestore has a 500 write limit per batch)
      const batch = writeBatch(db);
      let operationCount = 0;

      for (const [address, members] of Object.entries(familiesByAddress)) {
        // Create Family document reference
        const familyRef = doc(collection(db, 'families'));
        const familyId = familyRef.id;
        
        // Determine representative (first adult, or just first member)
        let repIndex = members.findIndex(m => m['INF/MAY'] === 'MAY');
        if (repIndex === -1) repIndex = 0;
        
        const memberIds: string[] = [];
        let repUserId = '';

        // Create Users
        for (let i = 0; i < members.length; i++) {
          const member = members[i];
          const userRef = doc(collection(db, 'users'));
          const userId = userRef.id;
          memberIds.push(userId);

          if (i === repIndex) {
            repUserId = userId;
          }

          // Generate pseudo-email based on DNI or Num Censo
          const identifier = member['DNI'] || member['NUM.CENS.'] || `fallero${userId.substring(0,5)}`;
          const pseudoEmail = `${identifier.toLowerCase().replace(/[^a-z0-9]/g, '')}@fallamartirs.app`;

          const userData: Partial<User> = {
            name: member['NOM'] || 'Sin Nombre',
            apellidos: member['COGNOMS'] || '',
            email: pseudoEmail,
            role: 'fallero',
            categoryId: pendingCategoryId,
            familyId: familyId,
            isAdult: member['INF/MAY'] === 'MAY',
            isFamilyAdmin: i === repIndex,
            dni: member['DNI'] || '',
            telefono: member['TELEF'] || '',
            direccion: member['ADREÇA'] || '',
            poblacion: member['POBLACIÓ'] || '',
            codigoPostal: member['C.POSTAL'] || '',
            anyoNacimiento: member['ANY.NAIX'] || '',
            sexo: member['SEXE'] || '',
            cargo: member['CARREC'] || '',
            recompensa: member['RECOMPENSA'] || '',
            codigoJCF: member['COD.JCF'] || '',
            numeroCenso: member['NUM.CENS.'] || ''
          };

          batch.set(userRef, userData);
          operationCount++;

          if (operationCount >= 450) {
            await batch.commit();
            operationCount = 0;
          }
        }

        // Create Family
        const familyName = members[repIndex]['COGNOMS'] ? `Familia ${members[repIndex]['COGNOMS']}` : `Familia en ${address}`;
        const familyData: Partial<Family> = {
          name: familyName,
          representativeId: repUserId,
          members: memberIds
        };

        batch.set(familyRef, familyData);
        operationCount++;

        if (operationCount >= 450) {
          await batch.commit();
          operationCount = 0;
        }
      }

      if (operationCount > 0) {
        await batch.commit();
      }

      setSuccess(`¡Importación completada! Se han importado ${data.length} falleros agrupados en ${Object.keys(familiesByAddress).length} familias.`);
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      
    } catch (err: any) {
      console.error("Import error:", err);
      setError(err.message || 'Ocurrió un error durante la importación.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Importar Censo (CSV)">
      <div className="space-y-6">
        <div className="bg-blue-50 text-blue-800 p-4 rounded-xl text-sm border border-blue-100">
          <p className="font-bold mb-2">Instrucciones:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Guarda tu Excel como archivo <strong>CSV (delimitado por comas o punto y coma)</strong>.</li>
            <li>Asegúrate de que la primera fila tiene los nombres exactos de las columnas que me pasaste (COD.JCF, NUM.CENS., etc.).</li>
            <li>Se agruparán automáticamente en Familias a los falleros que compartan la misma <strong>ADREÇA</strong> (Dirección).</li>
            <li>Se les asignará la categoría "Pendiente" para que luego puedas ajustar las cuotas.</li>
            <li>El usuario de acceso será su <strong>DNI@fallamartirs.app</strong> (o NUM.CENS. si no tienen DNI).</li>
          </ul>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-start text-red-600 text-sm">
            <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3 bg-green-50 border border-green-100 rounded-xl flex items-start text-green-600 text-sm">
            <CheckCircle2 className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
            <span>{success}</span>
          </div>
        )}

        <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center hover:bg-slate-50 transition-colors">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
            ref={fileInputRef}
            id="csv-upload"
          />
          <label htmlFor="csv-upload" className="cursor-pointer flex flex-col items-center">
            <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-4">
              <Upload className="w-6 h-6" />
            </div>
            <span className="text-slate-700 font-medium mb-1">
              {file ? file.name : 'Haz clic para seleccionar tu archivo CSV'}
            </span>
            <span className="text-slate-500 text-sm">
              {file ? `${(file.size / 1024).toFixed(2)} KB` : 'Solo archivos .csv'}
            </span>
          </label>
        </div>

        <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors"
            disabled={isUploading}
          >
            Cerrar
          </button>
          <button
            onClick={handleImport}
            disabled={!file || isUploading}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center"
          >
            {isUploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Importando...
              </>
            ) : (
              'Comenzar Importación'
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}
