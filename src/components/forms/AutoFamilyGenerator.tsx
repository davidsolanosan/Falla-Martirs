import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { useSupabase } from '../../lib/SupabaseContext';
import { useTranslation } from '../../lib/i18n';
import { generateFamiliesFromUsers, updateFamiliesWithNewUsers } from '../../utils/familyUtils';
import { supabase } from '../../lib/supabase';
import { Users, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';

interface AutoFamilyGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AutoFamilyGenerator({ isOpen, onClose }: AutoFamilyGeneratorProps) {
  const { users, families, createFamily, updateFamily, deleteFamily, deleteFamilyWithoutRefresh } = useSupabase();
  const { t } = useTranslation();
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedFamilies, setGeneratedFamilies] = useState<any[]>([]);
  const [existingFamilies, setExistingFamilies] = useState<any[]>([]);
  const [previewMode, setPreviewMode] = useState(true);
  const [regenerateAll, setRegenerateAll] = useState(false);

  // Función para obtener nombres de los miembros
  const getMemberNames = (family: any) => {
    if (!family.members || !Array.isArray(family.members)) return [];
    
    return family.members.map((memberId: string) => {
      const user = users.find(u => u.id === memberId);
      if (!user) return 'Usuario desconocido';
      
      const name = `${user.name || ''} ${user.surname || ''}`.trim();
      const isRepresentative = family.representativeIds && family.representativeIds.includes(memberId);
      
      return {
        name: name || 'Sin nombre',
        isRepresentative
      };
    });
  };

  // Función para ordenar familias alfabéticamente
  const sortFamilies = (families: any[]) => {
    return [...families].sort((a, b) => {
      const nameA = (a.name || '').toLowerCase();
      const nameB = (b.name || '').toLowerCase();
      return nameA.localeCompare(nameB, 'es', { sensitivity: 'base' });
    });
  };

  const generateFamilies = async () => {
    console.log('=== BOTÓN GENERAR FAMILIAS PRESIONADO ===');
    console.log('Usuarios disponibles:', users.length);
    console.log('Familias existentes:', families.length);
    
    setIsGenerating(true);
    try {
      // Generar familias basadas en usuarios actuales
      const newFamilies = generateFamiliesFromUsers(users as any);
      
      console.log('Familias generadas:', newFamilies.length);
      
      // Identificar familias nuevas vs existentes
      let existing, trulyNew;
      
      if (regenerateAll) {
        // Si regeneramos todo, todas las familias son "nuevas"
        existing = [];
        trulyNew = newFamilies;
        console.log('Modo: REGENERAR TODAS LAS FAMILIAS');
      } else {
        // Modo normal: solo crear familias nuevas
        existing = families.filter(f => 
          newFamilies.some(nf => nf.address === f.address)
        );
        
        trulyNew = newFamilies.filter(nf => 
          !families.some(f => f.address === nf.address)
        );
        console.log('Modo: SOLO FAMILIAS NUEVAS');
      }
      
      console.log('Familias existentes encontradas:', existing.length);
      console.log('Familias realmente nuevas:', trulyNew.length);
      
      setExistingFamilies(sortFamilies(existing));
      setGeneratedFamilies(sortFamilies(trulyNew));
    } catch (error) {
      console.error("Error generating families:", error);
      alert("Error al generar familias. Revisa la consola para más detalles.");
    } finally {
      setIsGenerating(false);
    }
  };

  const createFamilies = async () => {
    setIsGenerating(true);
    try {
      // Si regeneramos todo, eliminar todas las familias existentes primero
      if (regenerateAll) {
        console.log('=== ELIMINANDO FAMILIAS EXISTENTES ===');
        console.log('Familias a eliminar:', families.length);
        
        for (const family of families) {
          console.log('Eliminando familia:', family.id, family.name);
          await deleteFamilyWithoutRefresh(family.id);
        }
        
        // También eliminar el family_id de todos los usuarios
        console.log('=== LIMPIANDO family_id DE USUARIOS ===');
        await supabase
          .from('users')
          .update({ family_id: null })
          .not('family_id', 'is', null);
      }
      
      // Crear solo las familias nuevas
      const createdFamilyIds: string[] = [];
      console.log('=== CREANDO FAMILIAS ===');
      console.log('Familias a crear:', generatedFamilies.length);
      
      for (let i = 0; i < generatedFamilies.length; i++) {
        const family = generatedFamilies[i];
        console.log(`Creando familia ${i + 1}:`, family.name, family.address, `Miembros: ${family.members?.length || 0}`);
        
        const createdFamily = await createFamily({
          name: family.name,
          address: family.address,
          phone: family.phone
        });
        
        if (createdFamily && createdFamily.id) {
          createdFamilyIds.push(createdFamily.id);
          console.log(`✅ Familia creada con ID: ${createdFamily.id}`);
        } else {
          console.log(`❌ Error creando familia:`, family.name);
        }
      }
      
      console.log('=== RESUMEN DE CREACIÓN ===');
      console.log('Familias a crear:', generatedFamilies.length);
      console.log('Familias creadas exitosamente:', createdFamilyIds.length);
      console.log('IDs de familias creadas:', createdFamilyIds);
      
      // Asignar usuarios a las familias creadas
      console.log('=== ASIGNANDO USUARIOS A FAMILIAS ===');
      console.log('Familias creadas:', createdFamilyIds.length);
      console.log('Total usuarios a asignar:', generatedFamilies.reduce((total, family) => total + (family.members?.length || 0), 0));
      
      console.log('=== INICIANDO ASIGNACIÓN DE USUARIOS ===');
      console.log('Total familias generadas:', generatedFamilies.length);
      console.log('Total IDs de familias creadas:', createdFamilyIds.length);
      
      for (let i = 0; i < generatedFamilies.length; i++) {
        const family = generatedFamilies[i];
        const familyId = createdFamilyIds[i];
        
        console.log(`\n--- Procesando familia ${i + 1} ---`);
        console.log('Nombre familia:', family.name);
        console.log('ID familia:', familyId);
        console.log('Miembros a asignar:', family.members?.length || 0);
        console.log('IDs de miembros:', family.members);
        
        if (familyId && family.members) {
          // Asignar cada usuario a su familia
          for (let j = 0; j < family.members.length; j++) {
            const userId = family.members[j];
            console.log(`  Asignando usuario ${j + 1}/${family.members.length}:`, userId, 'a familia', familyId);
            
            const { data, error } = await supabase
              .from('users')
              .update({ family_id: familyId })
              .eq('id', userId)
              .select();
            
            if (error) {
              console.error('  ❌ Error asignando usuario', userId, 'a familia', familyId, ':', error);
            } else {
              console.log('  ✅ Usuario', userId, 'asignado correctamente a familia', familyId);
              console.log('  📄 Datos actualizados:', data);
            }
          }
        } else {
          console.log('  ⚠️  Saltando familia - No hay familyId o members:', { familyId, members: family.members });
        }
      }
      
      console.log('=== VERIFICACIÓN FINAL ===');
      console.log('Familias creadas:', createdFamilyIds.length);
      console.log('Usuarios asignados:', generatedFamilies.reduce((total, family) => total + (family.members?.length || 0), 0));
      
      setPreviewMode(false);
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (error) {
      console.error("Error creating families:", error);
      alert("Error al crear familias. Revisa la consola para más detalles.");
    } finally {
      setIsGenerating(false);
    }
  };

  const updateExistingFamilies = async () => {
    setIsGenerating(true);
    try {
      // Actualizar familias existentes con nuevos miembros
      const updatedFamilies = updateFamiliesWithNewUsers(families as any, users as any);
      
      for (const family of updatedFamilies) {
        const existing = families.find(f => f.id === family.id);
        if (existing && (
          existing.name !== family.name ||
          existing.address !== family.address ||
          existing.phone !== family.phone
        )) {
          await updateFamily(family.id, {
            name: family.name,
            address: family.address,
            phone: family.phone
          });
        }
      }
      
      console.log('=== VERIFICACIÓN FINAL ===');
      console.log('Familias creadas:', createdFamilyIds.length);
      console.log('Usuarios asignados:', generatedFamilies.reduce((total, family) => total + (family.members?.length || 0), 0));
      
      setPreviewMode(false);
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (error) {
      console.error("Error updating families:", error);
      alert("Error al actualizar familias. Revisa la consola para más detalles.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Generador Automático de Familias">
      <div className="space-y-6">
        {/* Información */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-blue-900">¿Cómo funciona?</h4>
              <p className="text-sm text-blue-700 mt-1">
                Las familias se agrupan por dirección exacta. El nombre se genera con los apellidos de los adultos mayores.
              </p>
            </div>
          </div>
        </div>

        {/* Opción de regeneración */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="regenerateAll"
              checked={regenerateAll}
              onChange={(e) => setRegenerateAll(e.target.checked)}
              className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-amber-300 rounded"
            />
            <label htmlFor="regenerateAll" className="ml-3 text-sm text-amber-900">
              <span className="font-medium">Regenerar todas las familias</span>
              <span className="block text-amber-700">Elimina las familias existentes y crea todas las familias desde cero</span>
            </label>
          </div>
        </div>

        {/* Botón de generación */}
        <div className="flex justify-center">
          <button
            onClick={() => {
              console.log('=== CLICK EN BOTÓN GENERAR FAMILIAS ===');
              generateFamilies();
            }}
            disabled={isGenerating}
            className="flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            {isGenerating ? (
              <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
            ) : (
              <Users className="h-5 w-5 mr-2" />
            )}
            {isGenerating ? 'Generando...' : 'Generar Familias'}
          </button>
        </div>

        {/* Resultados */}
        {generatedFamilies.length > 0 || existingFamilies.length > 0 ? (
          <div className="space-y-4">
            {/* Resumen */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                  <div>
                    <p className="text-sm font-medium text-green-900">Familias Nuevas</p>
                    <p className="text-2xl font-bold text-green-600">{generatedFamilies.length}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
                  <div>
                    <p className="text-sm font-medium text-yellow-900">Familias Existentes</p>
                    <p className="text-2xl font-bold text-yellow-600">{existingFamilies.length}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Lista de familias nuevas */}
            {generatedFamilies.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-slate-900 mb-3">Familias a Crear</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {generatedFamilies.map((family, index) => {
                    const memberNames = getMemberNames(family);
                    return (
                      <div key={index} className="bg-white border border-slate-200 rounded-lg p-3">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="font-medium text-slate-900">{family.name}</p>
                            <p className="text-sm text-slate-500">{family.address}</p>
                            
                            {/* Lista de miembros */}
                            {memberNames.length > 0 && (
                              <div className="mt-2 space-y-1">
                                <p className="text-xs text-slate-400 mb-1">
                                  {memberNames.length} miembro{memberNames.length !== 1 ? 's' : ''}
                                  {memberNames.filter(m => m.isRepresentative).length > 0 && 
                                    ` • ${memberNames.filter(m => m.isRepresentative).length} representante${memberNames.filter(m => m.isRepresentative).length !== 1 ? 's' : ''}`
                                  }
                                </p>
                                <div className="flex flex-wrap gap-1">
                                  {memberNames.map((member, idx) => (
                                    <span 
                                      key={idx}
                                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                        member.isRepresentative 
                                          ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                                          : 'bg-gray-100 text-gray-700 border border-gray-200'
                                      }`}
                                    >
                                      {member.name}
                                      {member.isRepresentative && (
                                        <span className="ml-1 text-blue-600">★</span>
                                      )}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full ml-3">
                            NUEVO
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Lista de familias existentes */}
            {existingFamilies.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-slate-900 mb-3">Familias Existentes</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {existingFamilies.map((family, index) => {
                    const memberNames = getMemberNames(family);
                    return (
                      <div key={family.id} className="bg-white border border-slate-200 rounded-lg p-3">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="font-medium text-slate-900">{family.name}</p>
                            <p className="text-sm text-slate-500">{family.address}</p>
                            
                            {/* Lista de miembros */}
                            {memberNames.length > 0 && (
                              <div className="mt-2 space-y-1">
                                <p className="text-xs text-slate-400 mb-1">
                                  {memberNames.length} miembro{memberNames.length !== 1 ? 's' : ''}
                                  {memberNames.filter(m => m.isRepresentative).length > 0 && 
                                    ` • ${memberNames.filter(m => m.isRepresentative).length} representante${memberNames.filter(m => m.isRepresentative).length !== 1 ? 's' : ''}`
                                  }
                                </p>
                                <div className="flex flex-wrap gap-1">
                                  {memberNames.map((member, idx) => (
                                    <span 
                                      key={idx}
                                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                        member.isRepresentative 
                                          ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                                          : 'bg-gray-100 text-gray-700 border border-gray-200'
                                      }`}
                                    >
                                      {member.name}
                                      {member.isRepresentative && (
                                        <span className="ml-1 text-blue-600">★</span>
                                      )}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full ml-3">
                            EXISTE
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Botones de acción */}
            {console.log('=== VERIFICACIÓN BOTÓN ===', { previewMode, generatedFamiliesLength: generatedFamilies.length, isGenerating }) || previewMode && (
              <div className="flex justify-center space-x-4 pt-4 border-t border-slate-200">
                {generatedFamilies.length > 0 && (
                  <button
                    onClick={createFamilies}
                    disabled={isGenerating}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    {isGenerating ? 'Creando...' : `Crear ${generatedFamilies.length} Familias`}
                  </button>
                )}
                
                {existingFamilies.length > 0 && (
                  <button
                    onClick={updateExistingFamilies}
                    disabled={isGenerating}
                    className="px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50"
                  >
                    {isGenerating ? 'Actualizando...' : 'Actualizar Familias Existentes'}
                  </button>
                )}
              </div>
            )}

            {!previewMode && (
              <div className="flex justify-center pt-4 border-t border-slate-200">
                <div className="flex items-center text-green-600">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  <span className="font-medium">¡Operación completada!</span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500">
            <Users className="h-12 w-12 mx-auto mb-3 text-slate-300" />
            <p>Haz clic en "Generar Familias" para ver el preview</p>
          </div>
        )}
      </div>
    </Modal>
  );
}
