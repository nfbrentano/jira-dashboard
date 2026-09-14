import React, { useState } from 'react';
import type { SectorialData } from '../../store/sectorMetricsStore';
import { X, Save } from 'lucide-react';

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

  if (!isOpen) return null;

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
          <h3 className="text-lg font-bold text-text-main">
            Editar Indicadores Setoriais — {formData.monthYear}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-background text-text-muted hover:text-text-main transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6">
          {/* Header Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-text-muted mb-1 block">
                Mês / Período
              </label>
              <input
                type="text"
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-text-main"
                value={formData.monthYear}
                onChange={(e) => setFormData({ ...formData, monthYear: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-text-muted mb-1 block">
                Texto de Apuração / Status
              </label>
              <input
                type="text"
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-text-main"
                value={formData.statusDescription}
                onChange={(e) => setFormData({ ...formData, statusDescription: e.target.value })}
                required
              />
            </div>
          </div>

          {/* INDICADOR 1 */}
          <div className="p-4 rounded-xl border border-border/80 bg-background/60 space-y-3">
            <h4 className="font-semibold text-sm text-text-main flex items-center justify-between">
              <span>1. Planejamento Estratégico (PE)</span>
              <span className="text-xs text-blue-600 font-bold">Agregado: {formData.pe.agregado}%</span>
            </h4>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-text-muted block mb-1">Previsto</label>
                <input
                  type="number"
                  min="0"
                  className="w-full bg-surface border border-border rounded-lg px-3 py-1.5 text-sm"
                  value={formData.pe.previsto}
                  onChange={(e) => handlePeChange('previsto', e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs text-text-muted block mb-1">Executado</label>
                <input
                  type="number"
                  min="0"
                  className="w-full bg-surface border border-border rounded-lg px-3 py-1.5 text-sm"
                  value={formData.pe.executado}
                  onChange={(e) => handlePeChange('executado', e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs text-text-muted block mb-1">Cancelado</label>
                <input
                  type="number"
                  min="0"
                  className="w-full bg-surface border border-border rounded-lg px-3 py-1.5 text-sm"
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
                  className="w-full bg-surface border border-border rounded-lg px-3 py-1.5 text-sm"
                  value={formData.bus.maxLimit}
                  onChange={(e) => handleBusChange('maxLimit', e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs text-text-muted block mb-1">Abertos no Mês</label>
                <input
                  type="number"
                  min="0"
                  className="w-full bg-surface border border-border rounded-lg px-3 py-1.5 text-sm"
                  value={formData.bus.abertosNoMes}
                  onChange={(e) => handleBusChange('abertosNoMes', e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs text-text-muted block mb-1">Em Execução (Pico)</label>
                <input
                  type="number"
                  min="0"
                  className="w-full bg-surface border border-border rounded-lg px-3 py-1.5 text-sm"
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
                  className="w-full bg-surface border border-border rounded-lg px-3 py-1.5 text-sm"
                  value={formData.wip.maxLimitPerDev}
                  onChange={(e) => handleWipChange('maxLimitPerDev', e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs text-text-muted block mb-1">Abertas no Mês</label>
                <input
                  type="number"
                  min="0"
                  className="w-full bg-surface border border-border rounded-lg px-3 py-1.5 text-sm"
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
                  className="w-full bg-surface border border-border rounded-lg px-3 py-1.5 text-sm"
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
              className="px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5 transition-colors shadow-xs"
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
