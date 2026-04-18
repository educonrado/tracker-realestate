import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ROICalculator from '../pages/ROICalculator';
import { supabase } from '../lib/supabaseClient';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function renderROI(id = 'REM-TEST-001') {
  return render(
    <MemoryRouter initialEntries={[`/roi/${id}`]}>
      <Routes>
        <Route path="/roi/:id" element={<ROICalculator />} />
        <Route path="/" element={<div>Dashboard</div>} />
      </Routes>
    </MemoryRouter>
  );
}

function mockFinanzas(data: Record<string, unknown> | null) {
  vi.mocked(supabase.from).mockReturnValue({
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data, error: null }),
    maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
    order: vi.fn().mockResolvedValue({ data: [], error: null }),
    insert: vi.fn().mockResolvedValue({ error: null }),
    upsert: vi.fn().mockResolvedValue({ error: null }),
    update: vi.fn().mockReturnThis(),
  } as any);
}

// ─── Tests ────────────────────────────────────────────────────────────────────
describe('ROICalculator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('muestra spinner de carga inicialmente', () => {
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn(() => new Promise(() => {})), // never resolves
      order: vi.fn(),
      insert: vi.fn(),
      upsert: vi.fn(),
    } as any);

    renderROI();
    expect(document.querySelector('.animate-spin')).toBeTruthy();
  });

  it('muestra pantalla "Sin datos financieros" cuando no hay finanzas', async () => {
    mockFinanzas(null);
    renderROI();

    await waitFor(() => {
      expect(screen.getByText(/Sin datos financieros/i)).toBeInTheDocument();
    });
  });

  it('muestra el Avalúo Pericial y Valor Base cuando hay datos', async () => {
    mockFinanzas({
      id_proceso: 'REM-TEST-001',
      avaluo_pericial: 120000,
      valor_base: 60000,
      gastos_est_adquisicion: 5000,
      puja_propuesta: 60000,
      precio_venta_objetivo: 100000,
    });

    renderROI();
    await waitFor(() => {
      expect(screen.getByText(/Avalúo Pericial/i)).toBeInTheDocument();
      expect(screen.getByText(/120[.,]000/)).toBeInTheDocument();
      expect(screen.getByText(/Valor Base/i)).toBeInTheDocument();
    });
  });

  it('muestra el simulador interactivo (sliders)', async () => {
    mockFinanzas({
      id_proceso: 'REM-TEST-001',
      avaluo_pericial: 120000,
      valor_base: 60000,
      gastos_est_adquisicion: 5000,
      puja_propuesta: 60000,
      precio_venta_objetivo: 100000,
    });

    renderROI();
    await waitFor(() => {
      expect(screen.getByText(/Simulador de Oferta/i)).toBeInTheDocument();
    });

    const sliders = document.querySelectorAll('input[type="range"]');
    expect(sliders).toHaveLength(2);
  });

  it('muestra "Proyección Global" con ROI calculado', async () => {
    mockFinanzas({
      id_proceso: 'REM-TEST-001',
      avaluo_pericial: 120000,
      valor_base: 60000,
      gastos_est_adquisicion: 5000,
      puja_propuesta: 60000,
      precio_venta_objetivo: 100000,
    });

    renderROI();
    await waitFor(() => {
      expect(screen.getByText(/Proyección Global/i)).toBeInTheDocument();
      expect(screen.getByText('R.O.I.')).toBeInTheDocument();
      expect(screen.getByText(/Utilidad Neta/i)).toBeInTheDocument();
    });
  });

  it('el ROI cambia al mover el slider de puja', async () => {
    mockFinanzas({
      id_proceso: 'REM-TEST-001',
      avaluo_pericial: 120000,
      valor_base: 60000,
      gastos_est_adquisicion: 0,
      puja_propuesta: 60000,
      precio_venta_objetivo: 100000,
    });

    renderROI();
    await waitFor(() => screen.getByText(/Simulador de Oferta/i));

    const sliders = document.querySelectorAll('input[type="range"]');
    const pujaSlider = sliders[0];

    // Obtenemos el ROI antes
    const roiAntesEl = screen.getByText(/R\.O\.I\./i).closest('div')?.parentElement;
    const roiAntes = roiAntesEl?.querySelector('p:last-child')?.textContent;

    // Cambiamos el slider
    fireEvent.change(pujaSlider, { target: { value: '100000' } });

    await waitFor(() => {
      const roiDespuesEl = screen.getByText(/R\.O\.I\./i).closest('div');
      const roiDespues = roiDespuesEl?.querySelector('p:last-child')?.textContent;
      expect(roiDespues).not.toBe(roiAntes);
    });
  });

  it('muestra el id del proceso en la page', async () => {
    mockFinanzas({
      id_proceso: 'REM-TEST-999',
      avaluo_pericial: 80000,
      valor_base: 40000,
      gastos_est_adquisicion: 2000,
      puja_propuesta: 40000,
      precio_venta_objetivo: 70000,
    });

    renderROI('REM-TEST-999');
    await waitFor(() => {
      expect(screen.getByText(/REM-TEST-999/)).toBeInTheDocument();
    });
  });
});
