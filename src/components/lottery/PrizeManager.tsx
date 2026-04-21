import React, { useState } from 'react';
import { useTranslation } from '../../lib/i18n';
import { LotteryPrize, LotteryDate } from '../../lib/supabase';
import { Trophy, Plus, Edit2, Trash2, Save, X } from 'lucide-react';

interface PrizeManagerProps {
  lotteryDate: LotteryDate;
  prizes: LotteryPrize[];
  onAddPrize: (prize: Omit<LotteryPrize, 'id' | 'created_at' | 'updated_at'>) => void;
  onUpdatePrize: (id: string, prize: Partial<LotteryPrize>) => void;
  onDeletePrize: (id: string) => void;
}

export default function PrizeManager({ 
  lotteryDate, 
  prizes, 
  onAddPrize, 
  onUpdatePrize, 
  onDeletePrize 
}: PrizeManagerProps) {
  const { t } = useTranslation();
  const [isAddingPrize, setIsAddingPrize] = useState(false);
  const [editingPrize, setEditingPrize] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    prize_type: 'lottery' as 'lottery' | 'primitive',
    prize_category: '',
    prize_amount: '',
    winning_number: '',
    winning_numbers: [] as string[],
    description: ''
  });

  const resetForm = () => {
    setFormData({
      prize_type: 'lottery',
      prize_category: '',
      prize_amount: '',
      winning_number: '',
      winning_numbers: [],
      description: ''
    });
    setIsAddingPrize(false);
    setEditingPrize(null);
  };

  const handleSubmit = () => {
    if (!formData.prize_category || !formData.prize_amount) return;

    const prizeData = {
      lottery_date_id: lotteryDate.id,
      prize_type: formData.prize_type,
      prize_category: formData.prize_category,
      prize_amount: parseFloat(formData.prize_amount),
      winning_number: formData.prize_type === 'lottery' ? formData.winning_number : undefined,
      winning_numbers: formData.prize_type === 'primitive' ? formData.winning_numbers : undefined,
      description: formData.description
    };

    if (editingPrize) {
      onUpdatePrize(editingPrize, prizeData);
    } else {
      onAddPrize(prizeData);
    }
    resetForm();
  };

  const startEdit = (prize: LotteryPrize) => {
    setFormData({
      prize_type: prize.prize_type,
      prize_category: prize.prize_category,
      prize_amount: prize.prize_amount.toString(),
      winning_number: prize.winning_number || '',
      winning_numbers: prize.winning_numbers || [],
      description: prize.description || ''
    });
    setEditingPrize(prize.id);
    setIsAddingPrize(true);
  };

  const handleWinningNumbersChange = (value: string) => {
    const numbers = value.split(',').map(n => n.trim()).filter(n => n);
    setFormData({ ...formData, winning_numbers: numbers });
  };

  const lotteryPrizes = prizes.filter(p => p.prize_type === 'lottery');
  const primitivePrizes = prizes.filter(p => p.prize_type === 'primitive');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-800 flex items-center">
          <Trophy className="w-6 h-6 mr-2 text-yellow-500" />
          {t('prizeManagement')} - {lotteryDate.name}
        </h3>
        <button
          onClick={() => setIsAddingPrize(true)}
          className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          {t('addPrize')}
        </button>
      </div>

      {/* Formulario de añadir/editar premio */}
      {isAddingPrize && (
        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-slate-800">
              {editingPrize ? t('editPrize') : t('addPrize')}
            </h4>
            <button
              onClick={resetForm}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {t('prizeType')}
              </label>
              <select
                value={formData.prize_type}
                onChange={(e) => setFormData({ ...formData, prize_type: e.target.value as 'lottery' | 'primitive' })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="lottery">{t('nationalLottery')}</option>
                <option value="primitive">{t('primitiveLottery')}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {t('prizeCategory')}
              </label>
              <input
                type="text"
                value={formData.prize_category}
                onChange={(e) => setFormData({ ...formData, prize_category: e.target.value })}
                placeholder={t('enterPrizeCategory')}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {t('prizeAmount')} (€)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.prize_amount}
                onChange={(e) => setFormData({ ...formData, prize_amount: e.target.value })}
                placeholder="0.00"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {formData.prize_type === 'lottery' ? (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {t('winningNumber')}
                </label>
                <input
                  type="text"
                  value={formData.winning_number}
                  onChange={(e) => setFormData({ ...formData, winning_number: e.target.value })}
                  placeholder="64567"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {t('winningNumbers')}
                </label>
                <input
                  type="text"
                  value={formData.winning_numbers.join(', ')}
                  onChange={(e) => handleWinningNumbersChange(e.target.value)}
                  placeholder="5, 6, 9, 11, 21, 28, 33, 42"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {t('description')}
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder={t('enterDescription')}
                rows={3}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={resetForm}
              className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium"
            >
              {t('cancel')}
            </button>
            <button
              onClick={handleSubmit}
              className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium"
            >
              <Save className="w-4 h-4 mr-2" />
              {t('save')}
            </button>
          </div>
        </div>
      )}

      {/* Lista de premios existentes */}
      <div className="space-y-4">
        {/* Premios de Lotería Nacional */}
        {lotteryPrizes.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-lg p-4">
            <h4 className="font-semibold text-red-600 mb-3">{t('nationalLotteryPrizes')}</h4>
            <div className="space-y-2">
              {lotteryPrizes.map((prize) => (
                <div key={prize.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <span className="font-medium text-slate-800">{prize.prize_category}</span>
                      <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-medium">
                        Nº {prize.winning_number}
                      </span>
                    </div>
                    {prize.description && (
                      <p className="text-sm text-slate-600 mt-1">{prize.description}</p>
                    )}
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-lg font-bold text-green-600">
                      {prize.prize_amount.toFixed(2)}€
                    </span>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => startEdit(prize)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        title={t('edit')}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeletePrize(prize.id)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                        title={t('delete')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Premios de Primitiva */}
        {primitivePrizes.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-lg p-4">
            <h4 className="font-semibold text-green-600 mb-3">{t('primitiveLotteryPrizes')}</h4>
            <div className="space-y-2">
              {primitivePrizes.map((prize) => (
                <div key={prize.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <span className="font-medium text-slate-800">{prize.prize_category}</span>
                      {prize.winning_numbers && (
                        <div className="flex space-x-1">
                          {prize.winning_numbers.map((num, index) => (
                            <span key={index} className="bg-green-500 text-white w-6 h-6 rounded flex items-center justify-center text-xs font-bold">
                              {num}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    {prize.description && (
                      <p className="text-sm text-slate-600 mt-1">{prize.description}</p>
                    )}
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-lg font-bold text-green-600">
                      {prize.prize_amount.toFixed(2)}€
                    </span>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => startEdit(prize)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        title={t('edit')}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeletePrize(prize.id)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                        title={t('delete')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mensaje si no hay premios */}
        {prizes.length === 0 && (
          <div className="text-center py-8 bg-slate-50 rounded-lg">
            <Trophy className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <p className="text-slate-600">{t('noPrizesRegistered')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
