import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Layout from '../components/Layout';

function renderLayout(initialPath = '/') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Layout />
    </MemoryRouter>
  );
}

describe('Layout', () => {
  it('muestra el título "RematesTracker" en el header', () => {
    renderLayout();
    expect(screen.getByText('RematesTracker')).toBeInTheDocument();
  });

  it('renderiza los tres ítems de navegación', () => {
    renderLayout();
    expect(screen.getByText('Inicio')).toBeInTheDocument();
    expect(screen.getByText('Inspección')).toBeInTheDocument();
    expect(screen.getByText('Consola')).toBeInTheDocument();
  });

  it('el nav tiene exactamente 3 ítems', () => {
    renderLayout();
    const navItems = document.querySelectorAll('nav li');
    expect(navItems).toHaveLength(3);
  });

  it('el link de Inicio apunta a "/"', () => {
    renderLayout('/');
    const inicioLink = screen.getByText('Inicio').closest('a');
    expect(inicioLink?.getAttribute('href')).toBe('/');
  });

  it('el link de Inspección apunta a "/inspeccion"', () => {
    renderLayout('/');
    const inspeccionLink = screen.getByText('Inspección').closest('a');
    expect(inspeccionLink?.getAttribute('href')).toBe('/inspeccion');
  });

  it('el link de Consola apunta a "/import"', () => {
    renderLayout('/');
    const importLink = screen.getByText('Consola').closest('a');
    expect(importLink?.getAttribute('href')).toBe('/import');
  });

  it('el link activo recibe la clase de color indigo (isActive)', () => {
    renderLayout('/');
    const inicioLink = screen.getByText('Inicio').closest('a');
    expect(inicioLink?.className).toContain('indigo');
  });

  it('no renderiza el comentario CSS como texto visible', () => {
    renderLayout();
    // Este es el bug que corregimos — verificamos que no vuelva a ocurrir
    expect(screen.queryByText(/\/\* Main Content Area \*\//)).not.toBeInTheDocument();
  });
});
