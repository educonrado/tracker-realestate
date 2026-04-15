import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Database, UploadCloud, CheckCircle, AlertTriangle } from 'lucide-react';

export default function ImportConsole() {
  const [jsonInput, setJsonInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | 'idle', message: string }>({ type: 'idle', message: '' });

  const handleImport = async () => {
    setStatus({ type: 'idle', message: '' });
    if (!jsonInput.trim()) {
      setStatus({ type: 'error', message: 'El JSON no puede estar vacío' });
      return;
    }

    let parsedData: any;
    try {
      parsedData = JSON.parse(jsonInput);
    } catch (err) {
      setStatus({ type: 'error', message: 'JSON sintácticamente inválido.' });
      return;
    }

    const records = Array.isArray(parsedData) ? parsedData : [parsedData];
    
    setLoading(true);
    let successCount = 0;
    
    try {
      for (const record of records) {
        if (!record.id_proceso) {
          throw new Error('Cada registro debe contener un "id_proceso"');
        }

        // 1. Extraer y Upsert en remates_activos
        const activoData = {
          id_proceso: record.id_proceso,
          fecha_remate: record.fecha_remate || new Date().toISOString(),
          provincia: record.provincia || 'Pichincha',
          canton: record.canton || 'Quito',
          sector: record.sector || null,
          tipo_bien: record.tipo_bien || 'Casa',
          superficie_m2: record.superficie_m2 || null,
          esta_ocupado: record.esta_ocupado !== undefined ? record.esta_ocupado : true,
          coordenadas: record.coordenadas || null,
        };

        const { error: err1 } = await supabase.from('remates_activos').upsert(activoData);
        if (err1) throw new Error(`Error en activos: ${err1.message}`);

        // 2. Extraer y Upsert en remates_finanzas si existen datos
        if (record.finanzas) {
           const finanzasData = {
             id_proceso: record.id_proceso,
             ...record.finanzas
           };
           const { error: err2 } = await supabase.from('remates_finanzas').upsert(finanzasData, { onConflict: 'id_proceso' });
           // Note: id_proceso might not trigger conflict unless we define the constraint in Supabase appropriately, 
           // but assuming the relational model maps 1:1 or id_proceso is a unique constraint/index. 
           // Standard upsert might duplicate if id is the PK, but for bulk imports we do our best.
           if (err2) throw new Error(`Error en finanzas: ${err2.message}`);
        }

        // 3. Extraer y Upsert en remates_competencia si existen datos
        if (record.competencia) {
           const compData = {
             id_proceso: record.id_proceso,
             ...record.competencia
           };
           const { error: err3 } = await supabase.from('remates_competencia').upsert(compData);
           if (err3) throw new Error(`Error en competencia: ${err3.message}`);
        }

        // 4. Competencia comparables si existe
        if (record.comparables && Array.isArray(record.comparables)) {
          for (const comparable of record.comparables) {
            const { error: err4 } = await supabase.from('remates_comparables').insert({
              id_proceso: record.id_proceso,
              ...comparable
            });
            if (err4) throw new Error(`Error en comparables: ${err4.message}`);
          }
        }
        
        successCount++;
      }
      
      setStatus({ type: 'success', message: `${successCount} registros procesados exitosamente.` });
      setJsonInput(''); // Limpiar el text area 
    } catch (err: any) {
      console.error(err);
      setStatus({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-10">
      <h2 className="text-3xl font-bold flex items-center gap-2">
        <Database size={28} /> AI Import Console
      </h2>
      <p className="text-slate-400">
        Pega el objeto JSON generado por la IA para inyectar Remates dentro de la Base de Datos.
      </p>

      {status.message && (
        <div className={`p-4 rounded-xl flex items-center gap-3 ${status.type === 'error' ? 'bg-red-500/20 text-red-400 border border-red-500/50' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50'}`}>
          {status.type === 'error' ? <AlertTriangle /> : <CheckCircle />}
          <span className="font-medium">{status.message}</span>
        </div>
      )}

      <div className="card space-y-4">
        
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-slate-300 uppercase tracking-wide">
            Carga JSON (Bulk Upsert)
          </label>
        </div>

        <textarea
          value={jsonInput}
          onChange={(e) => setJsonInput(e.target.value)}
          className="input-field min-h-[400px] font-mono text-xs text-indigo-200"
          placeholder={`[
  {
    "id_proceso": "REM-12345",
    "fecha_remate": "2026-05-10",
    "canton": "Quito",
    "tipo_bien": "Casa",
    "finanzas": {
        "avaluo_pericial": 120000,
        "valor_base": 60000
    }
  }
]`}
        />
        
        <button 
          onClick={handleImport}
          disabled={loading}
          className="btn btn-primary w-full flex justify-center gap-2"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
          ) : (
             <><UploadCloud size={20} /> Ejecutar Upsert a DB</>
          )}
        </button>
      </div>
    </div>
  );
}
