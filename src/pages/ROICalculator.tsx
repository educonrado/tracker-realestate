import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { ArrowLeft, Calculator, TrendingUp, AlertTriangle } from 'lucide-react';
import type { Database } from '../lib/database.types';

type RemateFinanzas = Database['public']['Tables']['remates_finanzas']['Row'];

export default function ROICalculator() {
  const { id } = useParams();
  const [finanzas, setFinanzas] = useState<RemateFinanzas | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Interactive Simulator States
  const [precioVenta, setPrecioVenta] = useState<number>(0);
  const [pujaPropuesta, setPujaPropuesta] = useState<number>(0);
  
  useEffect(() => {
    async function fetchFinanzas() {
      if (!id) return;
      const { data } = await supabase
        .from('remates_finanzas')
        .select('*')
        .eq('id_proceso', id)
        .single();
        
      if (data) {
        setFinanzas(data);
        // Set initial simulator states
        setPrecioVenta(data.precio_venta_objetivo || data.avaluo_pericial || 0);
        setPujaPropuesta(data.puja_propuesta || data.valor_base || 0);
      }
      setLoading(false);
    }
    fetchFinanzas();
  }, [id]);

  if (loading) {
    return <div className="flex justify-center p-10"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div></div>;
  }

  if (!finanzas) {
    return (
      <div className="space-y-6">
        <Link to="/" className="inline-flex items-center text-slate-400 hover:text-white"><ArrowLeft size={16} className="mr-1" /> Volver</Link>
        <div className="card text-center p-10">
          <AlertTriangle className="mx-auto text-amber-500 mb-4" size={48} />
          <h2 className="text-xl font-bold mb-2">Sin datos financieros</h2>
          <p className="text-slate-400 mb-4">No se han encontrado registros financieros (tabla remates_finanzas) para este remate.</p>
        </div>
      </div>
    );
  }

  const gastosEstimados = finanzas.gastos_est_adquisicion || 0;
  const inversionTotal = pujaPropuesta + gastosEstimados;
  const utilidadNeta = precioVenta - inversionTotal;
  const roi = inversionTotal > 0 ? (utilidadNeta / inversionTotal) * 100 : 0;

  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-center justify-between">
        <Link to="/" className="inline-flex items-center text-slate-400 hover:text-white transition-colors">
          <ArrowLeft size={18} className="mr-1" /> Atrás
        </Link>
      </div>

      <div>
        <h2 className="text-3xl font-bold flex items-center gap-2 mb-1">
          <Calculator /> Análisis de Rentabilidad
        </h2>
        <p className="text-slate-400 font-mono text-sm">Remate: {id}</p>
      </div>

      {/* Referencias del Mercado */}
      <div className="grid grid-cols-2 gap-4">
         <div className="card bg-slate-800/40 p-4">
            <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Avalúo Pericial</p>
            <p className="font-mono text-xl font-bold text-slate-200">
               ${finanzas.avaluo_pericial?.toLocaleString() ?? 0}
            </p>
         </div>
         <div className="card bg-slate-800/40 p-4">
            <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Valor Base</p>
            <p className="font-mono text-xl font-bold text-slate-200">
               ${finanzas.valor_base?.toLocaleString() ?? 0}
            </p>
         </div>
      </div>

      {/* Simulador Interactivo */}
      <div className="card space-y-6 border-indigo-500/30">
        <h3 className="text-xl font-bold text-white mb-4">Simulador de Oferta</h3>
        
        <div>
          <div className="flex justify-between mb-2">
            <label className="text-sm font-medium text-slate-300">Puja Propuesta</label>
            <span className="font-mono text-indigo-400 font-bold">${pujaPropuesta.toLocaleString()}</span>
          </div>
          <input 
            type="range" 
            min={finanzas.valor_base || 0} 
            max={(finanzas.avaluo_pericial || Number(finanzas.valor_base) * 2)} 
            step={500}
            value={pujaPropuesta} 
            onChange={(e) => setPujaPropuesta(Number(e.target.value))}
            className="w-full accent-indigo-500"
          />
        </div>

        <div>
          <div className="flex justify-between mb-2">
            <label className="text-sm font-medium text-slate-300">Precio Venta Objetivo (Resale)</label>
            <span className="font-mono text-emerald-400 font-bold">${precioVenta.toLocaleString()}</span>
          </div>
          <input 
            type="range" 
            min={finanzas.valor_base || 0} 
            max={(finanzas.avaluo_pericial || 100000) * 1.5} 
            step={1000}
            value={precioVenta} 
            onChange={(e) => setPrecioVenta(Number(e.target.value))}
            className="w-full accent-emerald-500"
          />
        </div>

        <div className="pt-4 border-t border-slate-700/50">
          <div className="flex justify-between mb-2">
            <p className="text-slate-400">Gastos Estimados Adicionales</p>
            <p className="font-mono font-medium">${gastosEstimados.toLocaleString()}</p>
          </div>
          <div className="flex justify-between text-lg font-bold">
            <p className="text-slate-200">Inversión Total Estimada</p>
            <p className="font-mono text-amber-500">${inversionTotal.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Resultados ROI */}
      <div className={`card transition-colors ${roi > 30 ? 'bg-emerald-900/30 border-emerald-500/50' : roi > 0 ? 'bg-indigo-900/30 border-indigo-500/50' : 'bg-red-900/30 border-red-500/50'}`}>
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className={roi > 0 ? 'text-emerald-400' : 'text-red-400'} />
          <h3 className="text-xl font-bold">Proyección Global</h3>
        </div>
        
        <div className="grid grid-cols-2 gap-6 text-center">
          <div>
            <p className="text-sm text-slate-400 uppercase tracking-wider mb-2">Utilidad Neta</p>
            <p className={`text-3xl font-mono font-bold ${utilidadNeta > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              ${utilidadNeta.toLocaleString()}
            </p>
          </div>
          <div className="border-l border-slate-700/50">
            <p className="text-sm text-slate-400 uppercase tracking-wider mb-2">R.O.I.</p>
            <p className={`text-3xl font-mono font-bold ${roi > 30 ? 'text-emerald-400' : roi > 0 ? 'text-indigo-400' : 'text-red-400'}`}>
              {roi.toFixed(1)}%
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
