import React, { useState, useEffect } from 'react';
import {
  type SectorialData,
  parseMonthId,
  formatMonthLabel,
} from '../../store/sectorMetricsStore';
import { X, Save, Calendar, CheckCircle2, Clock } from 'lucide-react';

interface Props {
  data: SectorialData;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: SectorialData) => void;
}

export const SectorMetricsModal: React.FC<Props> = ({
  data,
  isOpen,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<SectorialData>(data);

  // Sync state whenever data prop changes or modal reopens
  useEffect(() => {
    setFormData(data);
  }, [data, isOpen]);

  if (!isOpen) return null;

  const handleMonthPickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newId = e.target.value; // e.g. "2026-09"
    if (!newId) return;
    const { year, month } = parseMonthId(newId);
    const newLabel = formatMonthLabel(year, month);

    setFormData((prev) => ({
      ...prev,
      id: newId,
      monthYear: newLabel,
      statusDescription: prev.statusDescription.includes('Apuração')
        ? prev.statusDescription
        : `Mês de apuração: ${newLabel}`,
    }));
  };

  const handlePeChange = (field: keyof SectorialData['pe'], val: string | number) => {
    setFormData((prev) => {
      const numVal = typeof val === 'number' ? val : Number(val) || 0;
      const updatedPe = {
        ...prev.pe,
        [field]: typeof prev.pe[field] === 'number' ? numVal : val,
      };

      if (field === 'previsto' || field === 'executado') {
        const previsto = field === 'previsto' ? numVal : updatedPe.previsto;
        const executado = field === 'executado' ? numVal : updatedPe.executado;
        updatedPe.agregado = previsto > 0 ? Math.round((executado / previsto) * 100) : 0;
      }

      return {
        ...prev,
        pe: updatedPe,
      };
    });
  };

  const handleBusChange = (field: keyof SectorialData['bus'], val: string | number) => {
    setFormData((prev) => ({
      ...prev,
      bus: {
        ...prev.bus,
        [field]: typeof prev.bus[field] === 'number' ? Number(val) || 0 : val,
      },
    }));
  };

  const handleWipChange = (field: keyof SectorialData['wip'], val: string | number) => {
    setFormData((prev) => ({
      ...prev,
      wip: {
        ...prev.wip,
        [field]: typeof prev.wip[field] === 'number' ? Number(val) || 0 : val,
      },
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-surface border border-border rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-blue-600 dark:text-blue-400" />
            <h3 className="text-lg font-bold text-text-main">
              Configurar Período & Metas — {formData.monthYear}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-background text-text-muted hover:text-text-main transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6">
          {/* Header & Date Configuration */}
          <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-950/20 space-y-4">
            <h4 className="text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar size={14} />
              <span>Configuração do Período (Mês e Ano)</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-text-muted mb-1 block">
                  Seletor de Mês/Ano
                </label>
                <input
                  type="month"
                  className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text-main focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  value={formData.id.match(/^\d{4}-\d{2}$/) ? formData.id : ''}
                  onChange={handleMonthPickerChange}
                />
                <span className="text-[11px] text-text-muted mt-0.5 block">
                  Escolha o mês e ano desejados no calendário.
                </span>
              </div>

              <div>
                <label className="text-xs font-semibold text-text-muted mb-1 block">
                  Nome de Exibição do Período
                </label>
                <input
                  type="text"
                  className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text-main focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  value={formData.monthYear}
                  onChange={(e) => setFormData({ ...formData, monthYear: e.target.value })}
                  placeholder="Ex: Agosto/2026"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="text-xs font-semibold text-text-muted mb-1 block">
                  Texto de Status / Apuração
                </label>
                <input
                  type="text"
                  className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text-main focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  value={formData.statusDescription}
                  onChange={(e) => setFormData({ ...formData, statusDescription: e.target.value })}
                  placeholder="Ex: Mês fechado. Apuração em 10/09/2026."
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-text-muted mb-1 block">
                  Tipo de Relatório
                </label>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, isClosed: true })}
                    className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-medium border flex items-center justify-center gap-1.5 transition-colors ${
                      formData.isClosed
                        ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                        : 'bg-surface border-border text-text-muted hover:text-text-main'
                    }`}
                  >
                    <CheckCircle2 size={13} />
                    <span>Mês Fechado</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, isClosed: false })}
                    className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-medium border flex items-center justify-center gap-1.5 transition-colors ${
                      !formData.isClosed
                        ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                        : 'bg-surface border-border text-text-muted hover:text-text-main'
                    }`}
                  >
                    <Clock size={13} />
                    <span>Em Andamento</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* INDICADOR 1 */}
          <div className="p-4 rounded-xl border border-border/80 bg-background/60 space-y-3">
            <h4 className="font-semibold text-sm text-text-main flex items-center justify-between">
              <span>1. Planejamento Estratégico (PE)</span>
              <span className="text-xs text-blue-600 dark:text-blue-400 font-bold">
                Agregado: {formData.pe.agregado}%
              </span>
            </h4>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-text-muted block mb-1">Previsto</label>
                <input
                  type="number"
                  min="0"
                  className="w-full bg-surface border border-border rounded-lg px-3 py-1.5 text-sm text-text-main"
                  value={formData.pe.previsto}
                  onChange={(e) => handlePeChange('previsto', e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs text-text-muted block mb-1">Executado</label>
                <input
                  type="number"
                  min="0"
                  className="w-full bg-surface border border-border rounded-lg px-3 py-1.5 text-sm text-text-main"
                  value={formData.pe.executado}
                  onChange={(e) => handlePeChange('executado', e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs text-text-muted block mb-1">Cancelado</label>
                <input
                  type="number"
                  min="0"
                  className="w-full bg-surface border border-border rounded-lg px-3 py-1.5 text-sm text-text-main"
                  value={formData.pe.cancelado}
                  onChange={(e) => handlePeChange('cancelado', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* INDICADOR 2 */}
          <div className="p-4 rounded-xl border border-border/80 bg-background/60 space-y-3">
            <h4 className="font-semibold text-sm text-text-main">
              2. Chamados Interdepartamentais (Bus)
            </h4>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-text-muted block mb-1">Meta Máxima (Teto)</label>
                <input
                  type="number"
                  min="1"
                  className="w-full bg-surface border border-border rounded-lg px-3 py-1.5 text-sm text-text-main"
                  value={formData.bus.maxLimit}
                  onChange={(e) => handleBusChange('maxLimit', e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs text-text-muted block mb-1">Abertos no Mês</label>
                <input
                  type="number"
                  min="0"
                  className="w-full bg-surface border border-border rounded-lg px-3 py-1.5 text-sm text-text-main"
                  value={formData.bus.abertosNoMes}
                  onChange={(e) => handleBusChange('abertosNoMes', e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs text-text-muted block mb-1">Em Execução (Pico)</label>
                <input
                  type="number"
                  min="0"
                  className="w-full bg-surface border border-border rounded-lg px-3 py-1.5 text-sm text-text-main"
                  value={formData.bus.emExecucaoPico}
                  onChange={(e) => handleBusChange('emExecucaoPico', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* INDICADOR 3 */}
          <div className="p-4 rounded-xl border border-border/80 bg-background/60 space-y-3">
            <h4 className="font-semibold text-sm text-text-main">
              3. Limite de Trabalho em Andamento (WIP) por Dev
            </h4>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-text-muted block mb-1">Meta Máx / Dev</label>
                <input
                  type="number"
                  min="1"
                  className="w-full bg-surface border border-border rounded-lg px-3 py-1.5 text-sm text-text-main"
                  value={formData.wip.maxLimitPerDev}
                  onChange={(e) => handleWipChange('maxLimitPerDev', e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs text-text-muted block mb-1">Abertas no Mês</label>
                <input
                  type="number"
                  min="0"
                  className="w-full bg-surface border border-border rounded-lg px-3 py-1.5 text-sm text-text-main"
                  value={formData.wip.abertasNoMes}
                  onChange={(e) => handleWipChange('abertasNoMes', e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs text-text-muted block mb-1">Em Execução (Média/Dev)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="w-full bg-surface border border-border rounded-lg px-3 py-1.5 text-sm text-text-main"
                  value={formData.wip.emExecucaoMediaDev}
                  onChange={(e) => handleWipChange('emExecucaoMediaDev', e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium rounded-lg border border-border hover:bg-background transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
            >
              <Save size={16} />
              <span>Salvar Alterações</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
