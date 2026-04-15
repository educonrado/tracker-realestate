import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import InspectionForm from '../pages/InspectionForm';
import { supabase } from '../lib/supabaseClient';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function renderForm() {
  return render(
    <MemoryRouter>
      <InspectionForm />
    </MemoryRouter>
  );
}

function mockRematesLoad(remates: unknown[] = []) {
  vi.mocked(supabase.from).mockReturnValue({
    select: vi.fn().mockReturnThis(),
    order: vi.fn().mockResolvedValue({ data: remates, error: null }),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn(),
    insert: vi.fn().mockResolvedValue({ error: null }),
    upsert: vi.fn(),
  } as any);
}

// ─── Tests ────────────────────────────────────────────────────────────────────
describe('InspectionForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renderiza el formulario correctamente', async () => {
    mockRematesLoad();
    renderForm();

    expect(screen.getByText(/Nueva Inspección/i)).toBeInTheDocument();
    expect(screen.getByText(/Remate a inspeccionar/i)).toBeInTheDocument();
    expect(screen.getByText(/Evaluación Rápida/i)).toBeInTheDocument();
    expect(screen.getByText(/Observaciones/i)).toBeInTheDocument();
  });

  it('muestra los remates cargados en el selector', async () => {
    mockRematesLoad([
      { id_proceso: 'REM-001', tipo_bien: 'Casa', canton: 'Quito' },
      { id_proceso: 'REM-002', tipo_bien: 'Terreno', canton: 'Guayaquil' },
    ]);

    renderForm();

    await waitFor(() => {
      expect(screen.getByText(/Casa en Quito \(REM-001\)/i)).toBeInTheDocument();
      expect(screen.getByText(/Terreno en Guayaquil \(REM-002\)/i)).toBeInTheDocument();
    });
  });

  it('resalta el botón Positivo al hacer clic', async () => {
    mockRematesLoad();
    renderForm();

    const positiveBtn = screen.getByText('Positivo').closest('button')!;
    fireEvent.click(positiveBtn);

    expect(positiveBtn.className).toContain('emerald');
  });

  it('resalta el botón Negativo al hacer clic', async () => {
    mockRematesLoad();
    renderForm();

    const negativeBtn = screen.getByText('Negativo').closest('button')!;
    fireEvent.click(negativeBtn);

    expect(negativeBtn.className).toContain('red');
  });

  it('cambia entre Positivo y Negativo correctamente', async () => {
    mockRematesLoad();
    renderForm();

    const positiveBtn = screen.getByText('Positivo').closest('button')!;
    const negativeBtn = screen.getByText('Negativo').closest('button')!;

    fireEvent.click(positiveBtn);
    expect(positiveBtn.className).toContain('emerald');

    fireEvent.click(negativeBtn);
    expect(negativeBtn.className).toContain('red');
    // positivo ya no debe estar activo
    expect(positiveBtn.className).not.toContain('emerald-500 border-emerald-500');
  });

  it('renderiza la sección de Ubicación GPS con botón de captura', () => {
    mockRematesLoad();
    renderForm();

    expect(screen.getByText(/Ubicación GPS/i)).toBeInTheDocument();
    expect(screen.getByText(/Capturar Ahora/i)).toBeInTheDocument();
    expect(screen.getByText(/Ninguna ubicación capturada/i)).toBeInTheDocument();
  });

  it('muestra las coordenadas capturadas tras llamar a geolocation', async () => {
    mockRematesLoad();

    // Mock geolocation que ejecuta el callback inmediatamente
    vi.spyOn(navigator.geolocation, 'getCurrentPosition').mockImplementation((success) => {
      success({
        coords: { latitude: -0.2295, longitude: -78.5243, accuracy: 10 } as GeolocationCoordinates,
        timestamp: Date.now(),
      });
    });

    renderForm();

    const captureBtn = screen.getByText(/Capturar Ahora/i);
    fireEvent.click(captureBtn);

    await waitFor(() => {
      expect(screen.getByText(/\-0\.2295/)).toBeInTheDocument();
    });
  });

  it('renderiza la sección de fotografía', () => {
    mockRematesLoad();
    renderForm();

    expect(screen.getByText(/Adjuntar Fotografía/i)).toBeInTheDocument();
    const fileInput = document.querySelector('input[type="file"]');
    expect(fileInput).toBeInTheDocument();
    expect(fileInput?.getAttribute('accept')).toBe('image/*');
  });

  it('muestra el botón de guardar', () => {
    mockRematesLoad();
    renderForm();

    expect(screen.getByText(/Guardar Inspección/i)).toBeInTheDocument();
  });

  it('el campo de impacto acepta solo valores numéricos', () => {
    mockRematesLoad();
    renderForm();

    const impactoInput = screen.getByPlaceholderText(/Opcional Ej\. 5000/i);
    expect(impactoInput.getAttribute('type')).toBe('number');
  });
});
