import { describe, it, expect } from 'vitest';

// ─── Funciones puras extraídas de ROICalculator ───────────────────────────────
// (Duplicamos la lógica aquí para poder testearla en aislamiento puro)

function calcularROI(pujaPropuesta: number, gastosEstimados: number, precioVenta: number) {
  const inversionTotal = pujaPropuesta + gastosEstimados;
  const utilidadNeta = precioVenta - inversionTotal;
  const roi = inversionTotal > 0 ? (utilidadNeta / inversionTotal) * 100 : 0;
  return { inversionTotal, utilidadNeta, roi };
}

function getSemaforoColor(valorBase: number, avaluoPericial: number): string {
  const ratio = valorBase / avaluoPericial;
  if (ratio <= 0.6) return 'verde';
  if (ratio <= 0.85) return 'amarillo';
  return 'rojo';
}

function parseCoords(coords: string | null): [number, number] | null {
  if (!coords) return null;
  const match = coords.match(/\(([^,]+),([^)]+)\)/);
  if (match) return [parseFloat(match[1]), parseFloat(match[2])];
  return null;
}

// ─── Tests: Cálculo ROI ────────────────────────────────────────────────────────
describe('calcularROI', () => {
  it('calcula utilidad neta e inversión total correctamente', () => {
    const { inversionTotal, utilidadNeta } = calcularROI(50000, 5000, 80000);
    expect(inversionTotal).toBe(55000);
    expect(utilidadNeta).toBe(25000);
  });

  it('calcula ROI positivo cuando precio venta > inversión', () => {
    const { roi } = calcularROI(50000, 5000, 80000);
    expect(roi).toBeCloseTo(45.45, 1);
  });

  it('calcula ROI cero cuando no hay inversión', () => {
    const { roi } = calcularROI(0, 0, 10000);
    expect(roi).toBe(0);
  });

  it('ROI negativo cuando precio venta < inversión', () => {
    const { roi } = calcularROI(80000, 5000, 60000);
    expect(roi).toBeLessThan(0);
  });

  it('ROI es exactamente 0% si se vende al costo', () => {
    const { roi } = calcularROI(50000, 5000, 55000);
    expect(roi).toBe(0);
  });
});

// ─── Tests: Semáforo de oportunidad ──────────────────────────────────────────
describe('getSemaforoColor', () => {
  it('retorna verde cuando valor_base <= 60% del avalúo', () => {
    expect(getSemaforoColor(60000, 100000)).toBe('verde');
    expect(getSemaforoColor(50000, 100000)).toBe('verde');
  });

  it('retorna amarillo cuando ratio está entre 60% y 85%', () => {
    expect(getSemaforoColor(70000, 100000)).toBe('amarillo');
    expect(getSemaforoColor(85000, 100000)).toBe('amarillo');
  });

  it('retorna rojo cuando ratio supera 85%', () => {
    expect(getSemaforoColor(90000, 100000)).toBe('rojo');
    expect(getSemaforoColor(100000, 100000)).toBe('rojo');
  });
});

// ─── Tests: Parsing de coordenadas ────────────────────────────────────────────
describe('parseCoords', () => {
  it('parsea correctamente el formato PostgreSQL "(lat,lng)"', () => {
    const result = parseCoords('(-0.2295, -78.5243)');
    expect(result).not.toBeNull();
    expect(result![0]).toBeCloseTo(-0.2295);
    expect(result![1]).toBeCloseTo(-78.5243);
  });

  it('retorna null cuando el valor es null', () => {
    expect(parseCoords(null)).toBeNull();
  });

  it('retorna null cuando el formato es inválido', () => {
    expect(parseCoords('coordenadas_incorrectas')).toBeNull();
  });

  it('maneja coordenadas positivas (norte del ecuador)', () => {
    const result = parseCoords('(1.2345, -77.1234)');
    expect(result![0]).toBeGreaterThan(0);
  });
});
