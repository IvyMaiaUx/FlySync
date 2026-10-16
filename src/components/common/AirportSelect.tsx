import React, { useState, useRef, useEffect, useMemo } from 'react';
import { AIRPORTS, AirportItem, findAirportByIata, GLOBAL_AIRPORTS_DICT } from '../../data/airports';
import { Search, X, PlaneTakeoff, PlaneLanding, MapPin, Check, Sparkles } from 'lucide-react';
import { FlightOffer } from '../../types';

const TOP_ORIGINS: { iata: string; city: string }[] = [
  { iata: 'GRU', city: 'São Paulo' },
  { iata: 'CGH', city: 'Congonhas' },
  { iata: 'GIG', city: 'Rio Galeão' },
  { iata: 'SDU', city: 'Santos Dumont' },
  { iata: 'BSB', city: 'Brasília' },
  { iata: 'CNF', city: 'Belo Horizonte' },
  { iata: 'VCP', city: 'Campinas' },
  { iata: 'REC', city: 'Recife' },
  { iata: 'SSA', city: 'Salvador' },
  { iata: 'POA', city: 'Porto Alegre' },
  { iata: 'FOR', city: 'Fortaleza' }
];

const TOP_DESTINATIONS: { iata: string; city: string }[] = [
  { iata: 'MIA', city: 'Miami' },
  { iata: 'LIS', city: 'Lisboa' },
  { iata: 'MAD', city: 'Madri' },
  { iata: 'SCL', city: 'Santiago' },
  { iata: 'EZE', city: 'Buenos Aires' },
  { iata: 'MCO', city: 'Orlando' },
  { iata: 'CDG', city: 'Paris' },
  { iata: 'REC', city: 'Recife' },
  { iata: 'SSA', city: 'Salvador' },
  { iata: 'CUN', city: 'Cancún' },
  { iata: 'JFK', city: 'Nova York' },
  { iata: 'DXB', city: 'Dubai' }
];

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
  variant?: 'compact' | 'large';
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
  required = false,
  variant = 'compact'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(value);
  const containerRef = useRef<HTMLDivElement>(null);

  // Quick suggestions list for origin vs destination
  const quickSuggestions = isOrigin ? TOP_ORIGINS : TOP_DESTINATIONS;

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

  // Filtra lista de aeroportos combinando catálogo estático, catálogo global e busca do usuário
  const filteredAirports = useMemo(() => {
    const q = (searchTerm || '').trim().toLowerCase();

    // 1. Se o campo estiver vazio, exibe TODOS os aeroportos com voos no Radar + aeroportos principais
    if (!q) {
      const activeList: AirportItem[] = [];
      const seen = new Set<string>();

      // Aeroportos com ofertas ativas no radar ordenados pelos que têm mais voos
      const sortedActive = Array.from(availableRoutesMap.entries())
        .sort((a, b) => b[1] - a[1]);

      for (const [iata] of sortedActive) {
        if (!seen.has(iata)) {
          seen.add(iata);
          const meta = findAirportByIata(iata);
          if (meta) {
            activeList.push(meta);
          } else {
            activeList.push({
              iata,
              city: iata,
              name: `Aeroporto de ${iata}`,
              country: 'Destino no Radar',
              popular: true
            });
          }
        }
      }

      // Adiciona todos os aeroportos curados do Brasil e do mundo que ainda não entraram
      for (const a of AIRPORTS) {
        if (!seen.has(a.iata)) {
          seen.add(a.iata);
          activeList.push(a);
        }
      }

      return activeList;
    }

    // 2. Se o usuário estiver pesquisando: busca em curados + ofertas + catálogo de 8.600+ IATAs
    const matches: AirportItem[] = [];
    const seen = new Set<string>();

    // Primeiro no catálogo base e ativos
    const baseAndActive = [...AIRPORTS];
    availableRoutesMap.forEach((_, iata) => {
      if (!baseAndActive.some(a => a.iata === iata)) {
        const meta = findAirportByIata(iata);
        baseAndActive.push(meta || {
          iata,
          city: iata,
          name: `Aeroporto de ${iata}`,
          country: 'Destino no Radar',
          popular: true
        });
      }
    });

    for (const a of baseAndActive) {
      if (
        a.iata.toLowerCase().includes(q) ||
        a.city.toLowerCase().includes(q) ||
        a.name.toLowerCase().includes(q) ||
        a.country.toLowerCase().includes(q)
      ) {
        if (!seen.has(a.iata)) {
          seen.add(a.iata);
          matches.push(a);
        }
      }
    }

    // Busca no catálogo global completo de 8.600+ aeroportos
    for (const [code, [city, name]] of Object.entries(GLOBAL_AIRPORTS_DICT)) {
      if (seen.has(code)) continue;

      const codeMatch = code.toLowerCase().startsWith(q) || code.toLowerCase().includes(q);
      const cityMatch = city && city.toLowerCase().includes(q);
      const nameMatch = name && name.toLowerCase().includes(q);

      if (codeMatch || cityMatch || nameMatch) {
        seen.add(code);
        matches.push({
          iata: code,
          city: city || code,
          name: name || `Aeroporto ${code}`,
          country: 'Internacional',
          popular: false
        });
        if (matches.length >= 60) break;
      }
    }

    return matches.sort((a, b) => {
      // Exatidão de IATA primeiro
      if (a.iata.toLowerCase() === q) return -1;
      if (b.iata.toLowerCase() === q) return 1;
      // Ofertas ativas primeiro
      const countA = availableRoutesMap.get(a.iata) || 0;
      const countB = availableRoutesMap.get(b.iata) || 0;
      if (countA !== countB) return countB - countA;
      // Começo do código IATA
      if (a.iata.toLowerCase().startsWith(q) && !b.iata.toLowerCase().startsWith(q)) return -1;
      if (!a.iata.toLowerCase().startsWith(q) && b.iata.toLowerCase().startsWith(q)) return 1;
      return 0;
    });
  }, [searchTerm, availableRoutesMap]);

  const handleSelect = (airport: { iata: string; city?: string }) => {
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
    const isLarge = variant === 'large';
    const iconClass = isLarge
      ? "w-4 h-4 text-[#8b7cf6] absolute left-3.5 top-3.5"
      : "w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5";

    switch (iconType) {
      case 'takeoff':
        return <PlaneTakeoff className={isLarge ? iconClass : "w-3.5 h-3.5 text-cyan-400 absolute left-2.5 top-2.5"} />;
      case 'landing':
        return <PlaneLanding className={isLarge ? iconClass : "w-3.5 h-3.5 text-emerald-400 absolute left-2.5 top-2.5"} />;
      default:
        return <Search className={iconClass} />;
    }
  };

  const isLarge = variant === 'large';

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
          className={
            isLarge
              ? "w-full pl-10 pr-8 py-3 text-sm font-bold border border-white/15 focus:border-[#8b7cf6] rounded-2xl bg-[#181328] text-white focus:outline-hidden uppercase font-mono placeholder:font-sans placeholder:normal-case placeholder:text-slate-500 transition-colors"
              : "w-full pl-8 pr-7 py-2 text-xs border border-purple-800/80 rounded-lg bg-[#1A0B3B] text-white focus:ring-2 focus:ring-[#22C55E] focus:outline-hidden uppercase font-mono placeholder:font-sans placeholder:normal-case placeholder:text-slate-500"
          }
        />

        {renderIcon()}

        {searchTerm && (
          <button
            type="button"
            onClick={handleClear}
            className={`absolute right-2 p-1 text-slate-400 hover:text-white rounded-md hover:bg-purple-900/60 transition-colors cursor-pointer ${
              isLarge ? "top-3" : "top-2"
            }`}
            title="Limpar campo"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Dropdown com a Lista de Sugestões e Aeroportos */}
        {isOpen && (
          <div
            className="absolute top-full left-0 right-0 mt-1.5 z-50 w-full rounded-2xl bg-[#120529]/95 border border-purple-500/40 shadow-[0_20px_50px_rgba(0,0,0,0.85)] backdrop-blur-xl overflow-hidden"
          >
            {/* Header da lista com Sugestões Populares */}
            <div className="px-3.5 py-2.5 bg-[#0A0218]/90 border-b border-purple-900/50 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-bold">
                <span className="flex items-center gap-1.5 text-purple-300">
                  <Sparkles className="w-3.5 h-3.5 text-[#22C55E]" />
                  <span>{searchTerm ? 'Resultados da Busca' : 'Sugestões no Radar'}</span>
                </span>
                <span className="text-[10px] text-slate-400 bg-purple-950/80 border border-purple-800/50 px-2 py-0.5 rounded-full font-mono">
                  {filteredAirports.length} {filteredAirports.length === 1 ? 'opção' : 'opções'}
                </span>
              </div>

              {/* Sugestões Populares para 1 clique dentro do dropdown */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none pt-0.5">
                <span className="text-[9px] uppercase font-bold text-slate-400 shrink-0">Mais buscados:</span>
                {quickSuggestions.map(s => (
                  <button
                    key={s.iata}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleSelect(s);
                    }}
                    onClick={() => handleSelect(s)}
                    className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#1C0938] hover:bg-[#22C55E] hover:text-slate-950 text-purple-200 border border-purple-700/60 transition-colors whitespace-nowrap cursor-pointer shrink-0"
                  >
                    {s.iata} · {s.city}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-1.5 max-h-80 overflow-y-auto space-y-1">
              {filteredAirports.length > 0 ? (
                filteredAirports.map(airport => {
                  const count = availableRoutesMap.get(airport.iata) || 0;
                  const isSelected = value.toUpperCase() === airport.iata;

                  return (
                    <button
                      key={airport.iata}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleSelect(airport);
                      }}
                      onClick={() => handleSelect(airport)}
                      className={`w-full px-3 py-2.5 rounded-xl text-left transition-all flex items-center justify-between gap-3 cursor-pointer group ${
                        isSelected
                          ? 'bg-purple-900/80 text-white border border-[#22C55E]/60 shadow-[0_0_12px_rgba(34,197,94,0.2)]'
                          : 'hover:bg-purple-900/40 text-slate-200 border border-transparent hover:border-purple-800/40'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Badge IATA em destaque */}
                        <span className="px-2.5 py-1.5 rounded-lg bg-[#220946] border border-purple-700/80 text-[#22C55E] group-hover:border-[#22C55E]/60 font-mono font-black text-xs tracking-wider shrink-0 shadow-inner">
                          {airport.iata}
                        </span>

                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                            <span>{airport.city}</span>
                            <span className="text-[10px] text-purple-300/80 font-normal">({airport.country})</span>
                          </div>
                          <div className="text-[11px] text-slate-400 truncate mt-0.5">
                            {airport.name}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {count > 0 && (
                          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/70 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                            {count} {count === 1 ? 'oferta' : 'ofertas'}
                          </span>
                        )}
                        {isSelected && (
                          <Check className="w-4 h-4 text-[#22C55E] stroke-[3]" />
                        )}
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="p-4 text-center text-xs text-slate-400">
                  <MapPin className="w-6 h-6 mx-auto mb-1.5 text-purple-400 opacity-60" />
                  <p className="font-semibold text-slate-300">Nenhum aeroporto encontrado para <strong>"{searchTerm}"</strong></p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Você pode pressionar Enter ou pesquisar diretamente por <strong>{searchTerm.toUpperCase()}</strong>.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
