import { describe, it, expect } from 'vitest';

// ─── Lógica pura de ImportConsole (extraída para testing) ─────────────────────

interface ImportRecord {
  id_proceso: string;
  fecha_remate?: string;
  provincia?: string;
  canton?: string;
  sector?: string | null;
  tipo_bien?: string;
  superficie_m2?: number | null;
  esta_ocupado?: boolean;
  coordenadas?: string | null;
  finanzas?: Record<string, unknown>;
  competencia?: Record<string, unknown>;
  comparables?: Record<string, unknown>[];
}

function parseImportJson(jsonInput: string): { records: ImportRecord[] } | { error: string } {
  if (!jsonInput.trim()) {
    return { error: 'El JSON no puede estar vacío' };
  }

  let parsedData: unknown;
  try {
    parsedData = JSON.parse(jsonInput);
  } catch {
    return { error: 'JSON sintácticamente inválido.' };
  }

  const records: ImportRecord[] = Array.isArray(parsedData) ? parsedData : [parsedData as ImportRecord];

  for (const record of records) {
    if (!record.id_proceso) {
      return { error: 'Cada registro debe contener un "id_proceso"' };
    }
  }

  return { records };
}

function buildActivoPayload(record: ImportRecord) {
  return {
    id_proceso: record.id_proceso,
    fecha_remate: record.fecha_remate || new Date().toISOString().split('T')[0],
    provincia: record.provincia || 'Pichincha',
    canton: record.canton || 'Quito',
    sector: record.sector || null,
    tipo_bien: record.tipo_bien || 'Casa',
    superficie_m2: record.superficie_m2 || null,
    esta_ocupado: record.esta_ocupado !== undefined ? record.esta_ocupado : true,
    coordenadas: record.coordenadas || null,
  };
}

// ─── Tests: parseImportJson ───────────────────────────────────────────────────
describe('parseImportJson', () => {
  it('rechaza input vacío', () => {
    const result = parseImportJson('');
    expect(result).toHaveProperty('error');
    if ('error' in result) expect(result.error).toContain('vacío');
  });

  it('rechaza JSON con sintaxis incorrecta', () => {
    const result = parseImportJson('{ id_proceso: sin-comillas }');
    expect(result).toHaveProperty('error');
    if ('error' in result) expect(result.error).toContain('inválido');
  });

  it('rechaza registro sin id_proceso', () => {
    const result = parseImportJson('[{"canton": "Quito"}]');
    expect(result).toHaveProperty('error');
    if ('error' in result) expect(result.error).toContain('id_proceso');
  });

  it('acepta un array de registros válidos', () => {
    const json = JSON.stringify([
      { id_proceso: 'REM-001', canton: 'Quito' },
      { id_proceso: 'REM-002', canton: 'Guayaquil' },
    ]);
    const result = parseImportJson(json);
    expect(result).toHaveProperty('records');
    if ('records' in result) expect(result.records).toHaveLength(2);
  });

  it('acepta un objeto único (no array) y lo convierte a array', () => {
    const json = JSON.stringify({ id_proceso: 'REM-003', canton: 'Cuenca' });
    const result = parseImportJson(json);
    expect(result).toHaveProperty('records');
    if ('records' in result) expect(result.records).toHaveLength(1);
  });

  it('acepta registros con sub-secciones opcionales (finanzas, competencia, comparables)', () => {
    const json = JSON.stringify([{
      id_proceso: 'REM-004',
      finanzas: { avaluo_pericial: 120000, valor_base: 60000 },
      competencia: { num_postores_estimados: 3 },
      comparables: [{ precio_m2: 850 }],
    }]);
    const result = parseImportJson(json);
    expect(result).toHaveProperty('records');
  });
});

// ─── Tests: buildActivoPayload ────────────────────────────────────────────────
describe('buildActivoPayload', () => {
  it('usa valores por defecto cuando faltan campos opcionales', () => {
    const payload = buildActivoPayload({ id_proceso: 'REM-005' });
    expect(payload.provincia).toBe('Pichincha');
    expect(payload.canton).toBe('Quito');
    expect(payload.tipo_bien).toBe('Casa');
    expect(payload.esta_ocupado).toBe(true);
    expect(payload.sector).toBeNull();
    expect(payload.coordenadas).toBeNull();
  });

  it('respeta los valores proporcionados por el usuario', () => {
    const payload = buildActivoPayload({
      id_proceso: 'REM-006',
      canton: 'Guayaquil',
      provincia: 'Guayas',
      tipo_bien: 'Local Comercial',
      esta_ocupado: false,
      superficie_m2: 250,
    });
    expect(payload.canton).toBe('Guayaquil');
    expect(payload.provincia).toBe('Guayas');
    expect(payload.tipo_bien).toBe('Local Comercial');
    expect(payload.esta_ocupado).toBe(false);
    expect(payload.superficie_m2).toBe(250);
  });

  it('esta_ocupado es false cuando se pasa explícitamente como false', () => {
    const payload = buildActivoPayload({ id_proceso: 'REM-007', esta_ocupado: false });
    expect(payload.esta_ocupado).toBe(false);
  });
});
