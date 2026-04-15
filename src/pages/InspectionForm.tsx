import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { MapPin, Camera, Save, AlertCircle } from 'lucide-react';
import type { Database } from '../lib/database.types';

type RemateActivo = Database['public']['Tables']['remates_activos']['Row'];

export default function InspectionForm() {
  const [remates, setRemates] = useState<RemateActivo[]>([]);
  const [loading, setLoading] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  
  // Form State
  const [idProceso, setIdProceso] = useState('');
  const [factor, setFactor] = useState<'Positivo' | 'Negativo' | ''>('');
  const [comentario, setComentario] = useState('');
  const [coordenadasActuales, setCoordenadasActuales] = useState<string | null>(null);
  const [foto, setFoto] = useState<File | null>(null);
  const [impacto, setImpacto] = useState<number | ''>('');

  useEffect(() => {
    async function loadRemates() {
      const { data } = await supabase.from('remates_activos').select('*').order('fecha_remate', { ascending: false });
      if (data) setRemates(data);
    }
    loadRemates();
  }, []);

  const captureLocation = () => {
    setGeoLoading(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoordenadasActuales(`(${position.coords.latitude},${position.coords.longitude})`);
          setGeoLoading(false);
        },
        (error) => {
          console.error("No se pudo obtener localización", error);
          alert('Por favor permite el acceso a ubicación.');
          setGeoLoading(false);
        }
      );
    } else {
      alert('Geolocalización no soportada en este dispositivo');
      setGeoLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idProceso || !factor) {
      alert('Seleccione remate y factor');
      return;
    }

    setLoading(true);
    try {
      // 1. Opcionalmente subir la foto a Supabase Storage
      let urlFoto = '';
      if (foto) {
        const fileExt = foto.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${idProceso}/${fileName}`;
        
        const { error: uploadError } = await supabase.storage.from('inspecciones').upload(filePath, foto);
        if (uploadError) throw uploadError;
        
        const { data: publicUrlData } = supabase.storage.from('inspecciones').getPublicUrl(filePath);
        urlFoto = publicUrlData.publicUrl;

        // Registrar la foto en remates_fotos
        await supabase.from('remates_fotos').insert({
          id_proceso: idProceso,
          url_foto: urlFoto,
          descripcion: 'Foto de inspección de campo'
        });
      }

      // 2. Registrar en la bitácora
      const { error: bitacoraError } = await supabase.from('remates_bitacora').insert({
        id_proceso: idProceso,
        factor_tipo: factor as 'Positivo' | 'Negativo',
        comentario: comentario + (coordenadasActuales ? ` \n[Localización capturada: ${coordenadasActuales}]` : ''),
        impacto_estimado_usd: impacto ? Number(impacto) : null
      });

      if (bitacoraError) throw bitacoraError;

      alert('Inspección guardada exitosamente.');
      // Reset
      setFactor('');
      setComentario('');
      setImpacto('');
      setFoto(null);
      setCoordenadasActuales(null);
    } catch (err: any) {
      console.error(err);
      alert('Error guardando inspección: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-10">
      <h2 className="text-3xl font-bold flex items-center gap-2">
        <ClipboardCheckIcon /> Nueva Inspección
      </h2>
      
      <form onSubmit={handleSubmit} className="card space-y-5">
        
        {/* Selector de Remate */}
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2 uppercase tracking-wide">
            Remate a inspeccionar
          </label>
          <select 
            value={idProceso}
            onChange={(e) => setIdProceso(e.target.value)}
            className="select-field"
            required
          >
            <option value="">-- Selecciona el remate --</option>
            {remates.map(r => (
              <option key={r.id_proceso} value={r.id_proceso}>
                {r.tipo_bien} en {r.canton} ({r.id_proceso})
              </option>
            ))}
          </select>
        </div>

        {/* Factores Positivo / Negativo */}
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2 uppercase tracking-wide">
            Evaluación Rápida
          </label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setFactor('Positivo')}
              className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all touch-manipulation
                ${factor === 'Positivo' 
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' 
                  : 'bg-slate-800 border-slate-700 text-slate-400'}`}
            >
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <span className="text-2xl">👍</span>
              </div>
              <span className="font-bold">Positivo</span>
            </button>
            <button
              type="button"
              onClick={() => setFactor('Negativo')}
              className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all touch-manipulation
                ${factor === 'Negativo' 
                  ? 'bg-red-500/20 border-red-500 text-red-400' 
                  : 'bg-slate-800 border-slate-700 text-slate-400'}`}
            >
               <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                <span className="text-2xl">👎</span>
              </div>
              <span className="font-bold">Negativo</span>
            </button>
          </div>
        </div>

        {/* Impacto Económico */}
         <div>
          <label className="block text-sm font-medium text-slate-400 mb-2 uppercase tracking-wide">
            Impacto Estimado (USD)
          </label>
          <input
            type="number"
            value={impacto}
            onChange={(e) => setImpacto(e.target.value ? Number(e.target.value) : '')}
            className="input-field"
            placeholder="Opcional Ej. 5000"
          />
        </div>

        {/* Comentarios */}
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2 uppercase tracking-wide">
            Observaciones (Seguridad, Plusvalía)
          </label>
          <textarea
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            className="input-field min-h-[120px]"
            placeholder="El sector es seguro, hay un parque cerca..."
            required
          />
        </div>

        {/* Geolocalización */}
        <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
          <div className="flex items-center justify-between mb-2">
             <label className="block text-sm font-medium text-slate-400 uppercase tracking-wide">
              Ubicación GPS
            </label>
            <button 
              type="button"
              onClick={captureLocation}
              disabled={geoLoading}
              className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 text-sm bg-indigo-500/10 px-3 py-1.5 rounded-full"
            >
              <MapPin size={16} /> {geoLoading ? 'Generando...' : 'Capturar Ahora'}
            </button>
          </div>
          {coordenadasActuales ? (
            <p className="text-emerald-400 font-mono text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              {coordenadasActuales}
            </p>
          ) : (
            <p className="text-slate-500 text-sm flex items-center gap-1"><AlertCircle size={14}/> Ninguna ubicación capturada</p>
          )}
        </div>

        {/* Subida de Fotografía */}
        <div>
           <label className="block text-sm font-medium text-slate-400 mb-2 uppercase tracking-wide flex items-center gap-2">
            <Camera size={16} /> Adjuntar Fotografía
          </label>
          <input 
            type="file" 
            accept="image/*"
            capture="environment"
            className="block w-full text-sm text-slate-400
              file:mr-4 file:py-3 file:px-4
              file:rounded-xl file:border-0
              file:text-sm file:font-semibold
              file:bg-indigo-600 file:text-white
              hover:file:bg-indigo-700"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                setFoto(e.target.files[0]);
              }
            }}
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="btn btn-primary w-full flex items-center gap-2 mt-4"
        >
          <Save size={20} />
          {loading ? 'Guardando Registro...' : 'Guardar Inspección'}
        </button>
      </form>
    </div>
  );
}

function ClipboardCheckIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
      <path d="M15 2H9a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1z"></path>
      <path d="m9 14 2 2 4-4"></path>
    </svg>
  );
}
