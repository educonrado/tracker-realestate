import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ImportConsole from '../pages/ImportConsole';
import { supabase } from '../lib/supabaseClient';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function renderConsole() {
  return render(
    <MemoryRouter>
      <ImportConsole />
    </MemoryRouter>
  );
}

function mockUpsertOk() {
  vi.mocked(supabase.from).mockReturnValue({
    select: vi.fn().mockReturnThis(),
    order: vi.fn().mockResolvedValue({ data: [], error: null }),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn(),
    insert: vi.fn().mockResolvedValue({ error: null }),
    upsert: vi.fn().mockResolvedValue({ error: null }),
  } as any);
}

// ─── Tests ────────────────────────────────────────────────────────────────────
describe('ImportConsole', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renderiza el título y descripción', () => {
    renderConsole();
    expect(screen.getByText(/AI Import Console/i)).toBeInTheDocument();
    expect(screen.getByText(/Pega el objeto JSON/i)).toBeInTheDocument();
  });

  it('renderiza el textarea y el botón de upsert', () => {
    renderConsole();
    expect(document.querySelector('textarea')).toBeInTheDocument();
    expect(screen.getByText(/Ejecutar Upsert a DB/i)).toBeInTheDocument();
  });

  it('muestra error cuando el JSON está vacío', async () => {
    renderConsole();

    const btn = screen.getByText(/Ejecutar Upsert a DB/i);
    fireEvent.click(btn);

    await waitFor(() => {
      expect(screen.getByText(/no puede estar vacío/i)).toBeInTheDocument();
    });
  });

  it('muestra error cuando el JSON tiene sintaxis incorrecta', async () => {
    renderConsole();

    const textarea = document.querySelector('textarea')!;
    fireEvent.change(textarea, { target: { value: '{ invalid json }' } });
    fireEvent.click(screen.getByText(/Ejecutar Upsert a DB/i));

    await waitFor(() => {
      expect(screen.getByText(/inválido/i)).toBeInTheDocument();
    });
  });

  it('muestra error cuando falta id_proceso', async () => {
    renderConsole();

    const textarea = document.querySelector('textarea')!;
    fireEvent.change(textarea, {
      target: { value: JSON.stringify([{ canton: 'Quito' }]) },
    });
    fireEvent.click(screen.getByText(/Ejecutar Upsert a DB/i));

    await waitFor(() => {
      expect(screen.getByText(/id_proceso/i)).toBeInTheDocument();
    });
  });

  it('muestra éxito cuando el JSON es válido y upsert es exitoso', async () => {
    mockUpsertOk();
    renderConsole();

    const validJson = JSON.stringify([{
      id_proceso: 'REM-IMPORT-001',
      canton: 'Quito',
      tipo_bien: 'Casa',
      finanzas: { avaluo_pericial: 100000, valor_base: 50000 },
    }]);

    const textarea = document.querySelector('textarea')!;
    fireEvent.change(textarea, { target: { value: validJson } });
    fireEvent.click(screen.getByText(/Ejecutar Upsert a DB/i));

    await waitFor(() => {
      expect(screen.getByText(/1 registro.*procesado/i)).toBeInTheDocument();
    });
  });

  it('limpia el textarea después de un upsert exitoso', async () => {
    mockUpsertOk();
    renderConsole();

    const validJson = JSON.stringify([{ id_proceso: 'REM-CLEANUP-001' }]);
    const textarea = document.querySelector('textarea')!;
    fireEvent.change(textarea, { target: { value: validJson } });
    fireEvent.click(screen.getByText(/Ejecutar Upsert a DB/i));

    await waitFor(() => {
      expect((textarea as HTMLTextAreaElement).value).toBe('');
    });
  });

  it('el botón se deshabilita durante el procesamiento', async () => {
    // Upsert que tarda (nunca resuelve)
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: [], error: null }),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn(),
      insert: vi.fn().mockResolvedValue({ error: null }),
      upsert: vi.fn().mockReturnValue(new Promise(() => {})),
    } as any);

    renderConsole();

    const validJson = JSON.stringify([{ id_proceso: 'REM-SLOW-001' }]);
    const textarea = document.querySelector('textarea')!;
    fireEvent.change(textarea, { target: { value: validJson } });

    const btn = screen.getByText(/Ejecutar Upsert a DB/i).closest('button')!;
    fireEvent.click(btn);

    // El botón debería estar deshabilitado mientras procesa
    await waitFor(() => {
      expect(btn).toBeDisabled();
    });
  });
});
