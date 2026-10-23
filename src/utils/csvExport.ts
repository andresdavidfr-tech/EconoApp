import { EconomicVariable } from '../types';

/**
 * Genera y descarga un archivo CSV con el historial cronológico de una variable económica.
 * Incluye Byte Order Mark (BOM) UTF-8 (\uFEFF) para compatibilidad total con Excel y Google Sheets.
 */
export function exportVariableHistoryToCsv(variable: EconomicVariable, customRangeData?: { date: string; value: number }[]) {
  if (!variable) return;

  const dataToExport = customRangeData && customRangeData.length > 0 
    ? customRangeData 
    : (variable.history && variable.history.length > 0 ? variable.history : [{ date: variable.lastUpdated, value: variable.value }]);

  // Encabezados con formato estándar
  const headers = ['Fecha', 'Valor', 'Unidad', 'Variable', 'Fuente', 'Tipo_Fuente', 'Frecuencia'];
  
  // Filas de datos
  const rows = dataToExport.map(item => {
    const safeName = `"${(variable.name || '').replace(/"/g, '""')}"`;
    const safeUnit = `"${(variable.unit || '').replace(/"/g, '""')}"`;
    const safeSource = `"${(variable.source || '').replace(/"/g, '""')}"`;
    const safeSourceType = `"${(variable.sourceType || '').replace(/"/g, '""')}"`;
    const safeFreq = `"${(variable.frequency || '').replace(/"/g, '""')}"`;

    return [
      item.date,
      item.value,
      safeUnit,
      safeName,
      safeSource,
      safeSourceType,
      safeFreq
    ].join(',');
  });

  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');

  // Crear Blob y disparar descarga
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  const sanitizedId = (variable.id || 'variable').toLowerCase().replace(/[^a-z0-9_-]/g, '_');
  const todayStr = new Date().toISOString().split('T')[0];
  link.setAttribute('href', url);
  link.setAttribute('download', `${sanitizedId}_historial_${todayStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
