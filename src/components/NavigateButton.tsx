import { MapPin } from 'lucide-react';

interface NavigateButtonProps {
  coordenadas: string | null;
  className?: string;
}

export default function NavigateButton({ coordenadas, className = '' }: NavigateButtonProps) {
  const parseCoords = (coords: string | null): { lat: number; lng: number } | null => {
    if (!coords) return null;
    const match = coords.match(/\(([^,]+),([^)]+)\)/);
    if (match) {
      return { lat: parseFloat(match[1]), lng: parseFloat(match[2]) };
    }
    return null;
  };

  const parsed = parseCoords(coordenadas);

  const handleNavigate = () => {
    if (!parsed) return;
    
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
      // In mobile, try to open the native maps application
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      if (isIOS) {
        window.open(`maps://?q=${parsed.lat},${parsed.lng}`, '_blank');
      } else {
        window.open(`geo:${parsed.lat},${parsed.lng}?q=${parsed.lat},${parsed.lng}`, '_blank');
      }
    } else {
      // Fallback for desktop using Google Maps web
      window.open(`https://www.google.com/maps/search/?api=1&query=${parsed.lat},${parsed.lng}`, '_blank');
    }
  };

  if (!parsed) {
    return (
      <button 
        disabled
        className={`btn bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-70 w-full flex items-center justify-center gap-2 ${className}`}
      >
        <MapPin size={20} />
        Coordenadas no disponibles
      </button>
    );
  }

  return (
    <button 
      onClick={handleNavigate}
      className={`btn btn-primary w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/30 ${className}`}
    >
      <MapPin size={20} />
      Navegar al sitio
    </button>
  );
}
