import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { Database } from '../lib/database.types';
import { MapPin, List as ListIcon, Map as MapIcon, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

type RemateActivo = Database['public']['Tables']['remates_activos']['Row'];
type RemateFinanzas = Database['public']['Tables']['remates_finanzas']['Row'];

type RemateWithFinanzas = RemateActivo & {
  remates_finanzas: RemateFinanzas[];
};

export default function Dashboard() {
  const [remates, setRemates] = useState<RemateWithFinanzas[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'list' | 'map'>('list');

  useEffect(() => {
    async function fetchRemates() {
      const { data, error } = await supabase
        .from('remates_activos')
        .select(`
          *,
          remates_finanzas (*)
        `)
        .order('fecha_remate', { ascending: true });
        
      if (error) {
        console.error('Error fetching data', error);
      } else {
        setRemates(data as unknown as RemateWithFinanzas[]);
      }
      setLoading(false);
    }
    
    fetchRemates();
  }, []);

  const getSemaforoInfo = (remate: RemateWithFinanzas) => {
    const finanza = remate.remates_finanzas?.[0];
    if (!finanza || !finanza.valor_base || !finanza.avaluo_pericial) {
      return { color: 'bg-slate-600', text: 'N/A', ratio: null };
    }
    const ratio = finanza.valor_base / finanza.avaluo_pericial;
    let color = 'bg-red-500 shadow-red-500/50';
    if (ratio <= 0.6) color = 'bg-emerald-500 shadow-emerald-500/50';
    else if (ratio <= 0.85) color = 'bg-amber-500 shadow-amber-500/50';
    
    return { color, text: `${(ratio * 100).toFixed(0)}%`, ratio };
  };

  const parseCoords = (coords: string | null): [number, number] | null => {
    if (!coords) return null;
    // Format comes like "(lat,lng)"
    const match = coords.match(/\(([^,]+),([^)]+)\)/);
    if (match) {
      return [parseFloat(match[1]), parseFloat(match[2])];
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Oportunidades</h2>
        <div className="flex bg-slate-800 p-1 rounded-xl">
          <button 
            onClick={() => setView('list')}
            className={`p-2 rounded-lg transition-all ${view === 'list' ? 'bg-indigo-600 shadow-md' : 'text-slate-400 hover:text-white'}`}
          >
            <ListIcon size={20} />
          </button>
          <button 
            onClick={() => setView('map')}
            className={`p-2 rounded-lg transition-all ${view === 'map' ? 'bg-indigo-600 shadow-md' : 'text-slate-400 hover:text-white'}`}
          >
            <MapIcon size={20} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-10">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : remates.length === 0 ? (
        <div className="card text-center py-10">
          <p className="text-slate-400">No hay remates activos en este momento.</p>
        </div>
      ) : view === 'list' ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {remates.map((remate) => {
            const semaforo = getSemaforoInfo(remate);
            const finanza = remate.remates_finanzas?.[0];
            return (
              <Link to={`/roi/${remate.id_proceso}`} key={remate.id_proceso} className="card hover:border-indigo-500/50 transition-all flex flex-col group relative overflow-hidden block">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-lg text-white mb-1 truncate">{remate.tipo_bien} en {remate.canton}</h3>
                    <p className="text-sm text-slate-400 flex items-center gap-1">
                      <MapPin size={14} /> {remate.sector || remate.provincia}
                    </p>
                  </div>
                  <div className={`shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-bold shadow-lg ${semaforo.color}`}>
                    {semaforo.text}
                  </div>
                </div>
                
                <div className="mt-auto pt-4 border-t border-slate-700/50 flex justify-between items-center">
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Valor Base</p>
                    <p className="font-mono font-bold text-indigo-300">
                      ${finanza?.valor_base?.toLocaleString() ?? 'N/A'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Fecha</p>
                    <p className="font-mono text-sm">{new Date(remate.fecha_remate).toLocaleDateString()}</p>
                  </div>
                  <div className="bg-slate-700/50 p-2 rounded-full group-hover:bg-indigo-600 transition-colors">
                    <ChevronRight size={18} />
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      ) : (
        <div className="card p-2 h-[60vh] overflow-hidden rounded-2xl relative z-0">
          <MapContainer center={[-1.8312, -78.1834]} zoom={6} className="h-full w-full rounded-xl">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {remates.map((remate) => {
              const coords = parseCoords(remate.coordenadas);
              if (!coords) return null;
              const semaforo = getSemaforoInfo(remate);
              return (
                <Marker key={remate.id_proceso} position={coords}>
                  <Popup className="premium-popup">
                    <div className="font-sans text-slate-800">
                      <h4 className="font-bold text-lg mb-1">{remate.tipo_bien}</h4>
                      <p className="text-sm mb-2">{remate.canton}, {remate.sector}</p>
                      <div className="flex justify-between mb-3 bg-slate-100 p-2 rounded">
                        <span className="text-xs uppercase font-bold text-slate-500">Relación</span>
                        <span className={`text-xs px-2 py-0.5 rounded text-white ${semaforo.color}`}>{semaforo.text}</span>
                      </div>
                      <Link to={`/roi/${remate.id_proceso}`} className="btn btn-primary py-2 px-4 text-sm w-full">Ver ROI</Link>
                    </div>
                  </Popup>
                </Marker>
              )
            })}
          </MapContainer>
        </div>
      )}
    </div>
  );
}
