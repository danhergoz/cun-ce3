// Helper functions for CUN Project App

export const countWords = (text: string): number => {
  if (!text) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
};

export const countLinesApprox = (text: string): number => {
  if (!text) return 0;
  const linesByBreak = text.split('\n').length;
  const chars = text.length;
  // Estimate ~80 chars per typed line
  const linesByLength = Math.ceil(chars / 80);
  return Math.max(linesByBreak, linesByLength);
};

export const formatCurrencyCOP = (amount: number): string => {
  if (isNaN(amount) || amount === null || amount === undefined) return '$0';
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const calculateInversionTotal = (unidadII: any): number => {
  if (!unidadII?.inversionInicial) return 0;
  const inv = unidadII.inversionInicial;
  
  const ef = (inv.efectivoDisponible || []).reduce((acc: number, item: any) => acc + (Number(item.monto) || 0), 0);
  const invs = (inv.inventarios || []).reduce((acc: number, item: any) => acc + (Number(item.monto) || 0), 0);
  const ppe = (inv.propiedadPlantaEquipo || []).reduce((acc: number, item: any) => acc + (Number(item.monto) || 0), 0);
  const int = (inv.intangibles || []).reduce((acc: number, item: any) => acc + (Number(item.monto) || 0), 0);
  
  return ef + invs + ppe + int;
};

export const calculateDepreciacionTotal = (ppeList: any[]): number => {
  if (!Array.isArray(ppeList)) return 0;
  return ppeList.reduce((acc, item) => {
    if (item.depreciacionAnual) return acc + Number(item.depreciacionAnual);
    if (item.monto && item.vidaUtilAnos && item.vidaUtilAnos > 0) {
      return acc + (Number(item.monto) / Number(item.vidaUtilAnos));
    }
    return acc;
  }, 0);
};

export const calculateFinanciacionTotal = (financiacion: any): number => {
  if (!financiacion) return 0;
  const socios = (financiacion.aportesSocios || []).reduce((acc: number, i: any) => acc + (Number(i.monto) || 0), 0);
  const ext = (financiacion.aportesExternos || []).reduce((acc: number, i: any) => acc + (Number(i.monto) || 0), 0);
  return socios + ext;
};

export const calculateGastosFijosMensuales = (gastosFijos: any): number => {
  if (!gastosFijos) return 0;
  const pers = (gastosFijos.gastosPersonal || []).reduce((acc: number, item: any) => {
    return acc + (Number(item.salarioMensual) || 0) + (Number(item.prestacionesSociales) || 0);
  }, 0);
  const otros = (gastosFijos.otrosGastosFijos || []).reduce((acc: number, item: any) => acc + (Number(item.monto) || 0), 0);
  return pers + otros;
};
