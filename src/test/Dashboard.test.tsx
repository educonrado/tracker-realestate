import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Dashboard from '../pages/Dashboard';
import { supabase } from '../lib/supabaseClient';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function renderDashboard() {
  return render(
    <MemoryRouter>
      <Dashboard />
    </MemoryRouter>
  );
}

function makeMockRemate(overrides = {}) {
  return {
    id_proceso: 'REM-TEST-001',
    tipo_bien: 'Casa',
    canton: 'Quito',
    sector: 'La Carolina',
    provincia: 'Pichincha',
    fecha_remate: '2026-06-15',
    coordenadas: null,
    superficie_m2: 120,
    esta_ocupado: true,
    remates_finanzas: [{
      id: 1,
      id_proceso: 'REM-TEST-001',
      avaluo_pericial: 100000,
      valor_base: 55000,
      gastos_est_adquisicion: 3000,
      puja_propuesta: null,
      precio_venta_objetivo: null,
    }],
    ...overrides,
  };
}

// ─── Tests ────────────────────────────────────────────────────────────────────
describe('Dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('muestra spinner de carga inicialmente', () => {
    // Supabase nunca resuelve → loading persiste
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      order: vi.fn(() => new Promise(() => {})), // never resolves
      eq: vi.fn().mockReturnThis(),
      single: vi.fn(),
      insert: vi.fn(),
      upsert: vi.fn(),
    } as any);

    renderDashboard();
    expect(document.querySelector('.animate-spin')).toBeTruthy();
  });

  it('muestra mensaje vacío cuando no hay remates', async () => {
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: [], error: null }),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn(),
      insert: vi.fn(),
      upsert: vi.fn(),
    } as any);

    renderDashboard();
    await waitFor(() => {
      expect(screen.getByText(/No hay remates activos/i)).toBeInTheDocument();
    });
  });

  it('renderiza tarjetas de remates cuando hay datos', async () => {
    const mockData = [makeMockRemate()];

    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: mockData, error: null }),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn(),
      insert: vi.fn(),
      upsert: vi.fn(),
    } as any);

    renderDashboard();
    await waitFor(() => {
      expect(screen.getByText(/Casa en Quito/i)).toBeInTheDocument();
    });
  });

  it('muestra el semáforo verde (≤60%) correctamente', async () => {
    // valor_base = 55000 / avaluo = 100000 → 55% → verde
    const mockData = [makeMockRemate()];

    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: mockData, error: null }),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn(),
      insert: vi.fn(),
      upsert: vi.fn(),
    } as any);

    renderDashboard();
    await waitFor(() => {
      // El semáforo muestra el % del ratio
      expect(screen.getByText('55%')).toBeInTheDocument();
    });
  });

  it('muestra semáforo N/A cuando no hay datos financieros', async () => {
    const mockData = [makeMockRemate({ remates_finanzas: [] })];

    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: mockData, error: null }),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn(),
      insert: vi.fn(),
      upsert: vi.fn(),
    } as any);

    renderDashboard();
    await waitFor(() => {
      expect(screen.getByText('N/A')).toBeInTheDocument();
    });
  });

  it('alterna entre vista de lista y mapa al hacer clic en botones', async () => {
    const mockData = [makeMockRemate({ coordenadas: '(-0.229, -78.524)' })];

    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: mockData, error: null }),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn(),
      insert: vi.fn(),
      upsert: vi.fn(),
    } as any);

    renderDashboard();
    await waitFor(() => screen.getByText(/Casa en Quito/i));

    // Click en botón mapa (segundo botón del toggle)
    const mapBtn = document.querySelectorAll('button')[1];
    fireEvent.click(mapBtn);

    await waitFor(() => {
      expect(screen.getByTestId('map-container')).toBeInTheDocument();
    });
  });

  it('muestra el valor base correctamente formateado', async () => {
    const mockData = [makeMockRemate()];

    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: mockData, error: null }),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn(),
      insert: vi.fn(),
      upsert: vi.fn(),
    } as any);

    renderDashboard();
    await waitFor(() => {
      expect(screen.getByText(/55[.,]000/)).toBeInTheDocument();
    });
  });
});
