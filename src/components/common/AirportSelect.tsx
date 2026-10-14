import React, { useState, useRef, useEffect, useMemo } from 'react';
import { AIRPORTS, AirportItem } from '../../data/airports';
import { Search, X, PlaneTakeoff, PlaneLanding, MapPin, Check, Sparkles } from 'lucide-react';
import { FlightOffer } from '../../types';

interface AirportSelectProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  label?: string;
  iconType?: 'takeoff' | 'landing' | 'search';
  offers?: FlightOffer[];
  isOrigin?: boolean;
  className?: string;
  required?: boolean;
}

export const AirportSelect: React.FC<AirportSelectProps> = ({
  value,
  onChange,
  placeholder = 'Ex: GRU, REC, MIA...',
  label,
  iconType = 'search',
  offers = [],
  isOrigin = true,
  className = '',
  required = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(value);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sincroniza searchTerm se value mudar externamente (ex: botão de limpar ou reset)
  useEffect(() => {
    setSearchTerm(value);
  }, [value]);

  // Fecha dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Coleta IATAs e contagem de voos existentes nas ofertas do FlySync
  const availableRoutesMap = useMemo(() => {
    const map = new Map<string, number>();
    offers.forEach(o => {
      const code = isOrigin ? o.origin : o.destination;
      if (code) {
        map.set(code.toUpperCase(), (map.get(code.toUpperCase()) || 0) + 1);
      }
    });
    return map;
  }, [offers, isOrigin]);

  // Filtra lista de aeroportos combinando catálogo estático e busca do usuário
  const filteredAirports = useMemo(() => {
    const q = (searchTerm || '').trim().toLowerCase();

    // Cria lista base de aeroportos
    const list = [...AIRPORTS];

    // Se houver IATA nas ofertas que não está no catálogo base, inclui dinamicamente
    availableRoutesMap.forEach((_, iata) => {
      if (!list.some(a => a.iata === iata)) {
        list.push({
          iata,
          city: iata,
          name: `Aeroporto de ${iata}`,
          country: 'Destino no Radar',
          popular: true
        });
      }
    });

    if (!q) {
      // Prioriza aeroportos que têm ofertas ativas no Radar ou populares
      return list
        .filter(a => a.popular || availableRoutesMap.has(a.iata))
        .sort((a, b) => {
          const countA = availableRoutesMap.get(a.iata) || 0;
          const countB = availableRoutesMap.get(b.iata) || 0;
          return countB - countA;
        })
        .slice(0, 10);
    }

    return list
      .filter(a =>
        a.iata.toLowerCase().includes(q) ||
        a.city.toLowerCase().includes(q) ||
        a.name.toLowerCase().includes(q) ||
        a.country.toLowerCase().includes(q)
      )
      .sort((a, b) => {
        // Exatidão de IATA primeiro
        if (a.iata.toLowerCase() === q) return -1;
        if (b.iata.toLowerCase() === q) return 1;
        if (a.iata.toLowerCase().startsWith(q)) return -1;
        if (b.iata.toLowerCase().startsWith(q)) return 1;
        return 0;
      })
      .slice(0, 15);
  }, [searchTerm, availableRoutesMap]);

  const handleSelect = (airport: AirportItem) => {
    setSearchTerm(airport.iata);
    onChange(airport.iata);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSearchTerm('');
    onChange('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchTerm(val);
    onChange(val);
    if (!isOpen) setIsOpen(true);
  };

  const renderIcon = () => {
    switch (iconType) {
      case 'takeoff':
        return <PlaneTakeoff className="w-3.5 h-3.5 text-cyan-400 absolute left-2.5 top-2.5" />;
      case 'landing':
        return <PlaneLanding className="w-3.5 h-3.5 text-emerald-400 absolute left-2.5 top-2.5" />;
      default:
        return <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />;
    }
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {label && (
        <label className="block text-xs font-semibold text-slate-300 mb-1">
          {label}
        </label>
      )}

      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          required={required}
          className="w-full pl-8 pr-7 py-2 text-xs border border-purple-800/80 rounded-lg bg-[#1A0B3B] text-white focus:ring-2 focus:ring-[#22C55E] focus:outline-hidden uppercase font-mono placeholder:font-sans placeholder:normal-case placeholder:text-slate-500"
        />

        {renderIcon()}

        {searchTerm && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 top-2 p-0.5 text-slate-400 hover:text-white rounded-md hover:bg-purple-900/60 transition-colors cursor-pointer"
            title="Limpar campo"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Dropdown com a Lista de IATAs e Aeroportos */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 rounded-xl bg-[#14062E] border border-purple-700/80 shadow-[0_10px_35px_rgba(0,0,0,0.7)] backdrop-blur-md overflow-hidden max-h-72 overflow-y-auto">
          {/* Header da lista */}
          <div className="px-3 py-1.5 bg-[#0F0322] border-b border-purple-900/60 flex items-center justify-between text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#22C55E]" />
              {searchTerm ? 'Aeroportos Correspondentes' : 'Aeroportos Populares no Radar'}
            </span>
            <span>{filteredAirports.length} opções</span>
          </div>

          <div className="p-1 space-y-0.5">
            {filteredAirports.length > 0 ? (
              filteredAirports.map(airport => {
                const count = availableRoutesMap.get(airport.iata) || 0;
                const isSelected = value.toUpperCase() === airport.iata;

                return (
                  <button
                    key={airport.iata}
                    type="button"
                    onClick={() => handleSelect(airport)}
                    className={`w-full px-2.5 py-2 rounded-lg text-left transition-all flex items-center justify-between gap-2.5 cursor-pointer ${
                      isSelected
                        ? 'bg-purple-900/80 text-white border border-[#22C55E]/50'
                        : 'hover:bg-[#1E0940] text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {/* Badge IATA em destaque */}
                      <span className="px-2 py-1 rounded-md bg-[#250B4E] border border-purple-700 text-[#22C55E] font-mono font-black text-xs tracking-wider shrink-0 shadow-sm">
                        {airport.iata}
                      </span>

                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                          <span>{airport.city}</span>
                          <span className="text-[10px] text-slate-400 font-normal">({airport.country})</span>
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">
                          {airport.name}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {count > 0 && (
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-1.5 py-0.5 rounded-full">
                          {count} {count === 1 ? 'oferta' : 'ofertas'}
                        </span>
                      )}
                      {isSelected && (
                        <Check className="w-3.5 h-3.5 text-[#22C55E]" />
                      )}
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="p-3 text-center text-xs text-slate-400">
                <MapPin className="w-5 h-5 mx-auto mb-1 text-purple-400 opacity-60" />
                <p>Nenhum aeroporto encontrado para <strong>"{searchTerm}"</strong></p>
                <p className="text-[10px] text-slate-500 mt-1">
                  Você pode usar "{searchTerm.toUpperCase()}" diretamente para pesquisar.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
