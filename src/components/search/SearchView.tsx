import React, { useState, useMemo } from 'react';
import { useFlySync } from '../../store/FlySyncContext';
import { FlightOffer } from '../../types';
import {
  Search,
  ArrowUpDown,
  Calendar,
  Users,
  MapPin,
  Tag,
  Bell,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Flame,
  Minus,
  Plus,
  X,
  Sparkles
} from 'lucide-react';
import { AirportSelect } from '../common/AirportSelect';

interface SearchViewProps {
  onSelectOffer: (offer: FlightOffer) => void;
  onOpenCreateAlert: (origin: string, dest: string, maxMiles: number) => void;
}

export const SearchView: React.FC<SearchViewProps> = ({ onSelectOffer, onOpenCreateAlert }) => {
  const { offers, programs } = useFlySync();

  const [tripType, setTripType] = useState<'i' | 'v' | 'rt'>('rt');
  const [origin, setOrigin] = useState<string>('CGH');
  const [destination, setDestination] = useState<string>('REC');
  const [cabinClass, setCabinClass] = useState<'economy' | 'business'>('economy');

  // Dates
  const [depDate, setDepDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 25);
    return d.toISOString().split('T')[0];
  });
  const [retDate, setRetDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 32);
    return d.toISOString().split('T')[0];
  });

  // Calendar open state
  const [calendarTarget, setCalendarTarget] = useState<'dep' | 'ret' | null>(null);
  const [currentMonthDate, setCurrentMonthDate] = useState<Date>(() => new Date());

  // Payment filter (Todas vs Milhas vs Dinheiro)
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'miles' | 'cash'>('all');

  // Passenger state
  const [showPassengerPicker, setShowPassengerPicker] = useState<boolean>(false);
  const [adults, setAdults] = useState<number>(1);
  const [children, setChildren] = useState<number>(0);
  const [infants, setInfants] = useState<number>(0);

  // Search triggered
  const [hasSearched, setHasSearched] = useState<boolean>(true);

  // Swap Origin and Destination
  const handleSwap = () => {
    const tmp = origin;
    setOrigin(destination);
    setDestination(tmp);
  };

  const totalPassengers = adults + children + infants;
  const passengerLabel = `${totalPassengers} ${totalPassengers === 1 ? 'passageiro' : 'passageiros'}`;

  // Month navigation for Economilhas calendar
  const handlePrevMonth = () => {
    setCurrentMonthDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };
  const handleNextMonth = () => {
    setCurrentMonthDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const monthLabel = currentMonthDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  // Generate calendar days with prices (Economilhas style: day + lowest price in k)
  const calendarDays = useMemo(() => {
    const year = currentMonthDate.getFullYear();
    const month = currentMonthDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();

    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    for (let d = 1; d <= totalDays; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      
      // Look for real radar offers for this route & date
      const matched = offers.filter(o =>
        o.departureDate === dateStr &&
        o.status === 'ativa' &&
        (!origin || o.origin.toUpperCase() === origin.toUpperCase() || o.originCity.toLowerCase().includes(origin.toLowerCase())) &&
        (!destination || o.destination.toUpperCase() === destination.toUpperCase() || o.destCity.toLowerCase().includes(destination.toLowerCase()))
      );

      let price: number;
      if (matched.length > 0) {
        price = Math.min(...matched.map(o => o.miles));
      } else {
        // Base route estimation based on route type
        const isInter = ['MIA', 'LIS', 'MAD', 'CDG', 'MCO', 'EZE', 'SCL', 'CUN', 'JFK'].includes(destination.toUpperCase());
        const basePrice = isInter ? 42000 : 12900;
        const hash = (d * 7 + (month + 1) * 11) % 7;
        price = basePrice + hash * 600;
      }

      days.push({ day: d, dateStr, price });
    }
    return days;
  }, [currentMonthDate, origin, destination, offers]);

  // Find lowest price of the month among upcoming days (for green highlight)
  const minMonthPrice = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const validFutureDays = calendarDays.filter(d => d && d.dateStr >= todayStr);
    const validPrices = validFutureDays.map(d => d!.price);
    return validPrices.length > 0 ? Math.min(...validPrices) : 12900;
  }, [calendarDays]);

  // Results matching query
  const matchingOffers = useMemo(() => {
    if (!hasSearched) return [];
    const todayStr = new Date().toISOString().split('T')[0];

    return offers.filter(o => {
      if (o.status !== 'ativa' || o.departureDate < todayStr) return false;
      const origMatch = !origin || o.origin.toUpperCase() === origin.toUpperCase() || o.originCity.toLowerCase().includes(origin.toLowerCase());
      const destMatch = !destination || o.destination.toUpperCase() === destination.toUpperCase() || o.destCity.toLowerCase().includes(destination.toLowerCase());
      const cabinMatch = cabinClass === 'economy' ? o.cabinClass !== 'business' : o.cabinClass === 'business';
      
      // Payment filter
      if (paymentFilter === 'miles' && o.paymentType === 'cash') return false;
      if (paymentFilter === 'cash' && o.paymentType !== 'cash') return false;

      return origMatch && destMatch && cabinMatch;
    }).sort((a, b) => {
      const aVal = a.paymentType === 'cash' ? (a.cashPriceTotal || a.miles) : a.miles;
      const bVal = b.paymentType === 'cash' ? (b.cashPriceTotal || b.miles) : b.miles;
      return aVal - bVal;
    });
  }, [offers, hasSearched, origin, destination, cabinClass, paymentFilter]);

  const formatDateDisplay = (isoStr: string) => {
    try {
      const parts = isoStr.split('-');
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        return d.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' });
      }
    } catch {}
    return isoStr;
  };

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Header */}
      <div>
        <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#9d98b0] block mb-1">
          Passagens com milhas
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
          Buscar <span className="text-[#34d399]">voos</span>
        </h1>
        <p className="text-sm text-[#9d98b0] mt-1 leading-relaxed">
          Compare o preço em milhas e tarifas promocionais entre os programas.
        </p>
      </div>

      {/* Search Filter Card */}
      <div className="rounded-[22px] p-5 sm:p-6 bg-[#110d1d] border border-white/10 shadow-xl space-y-3">
        {/* Trip Type Segmented Buttons */}
        <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-[#181328] border border-white/10">
          <button
            type="button"
            onClick={() => setTripType('i')}
            className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              tripType === 'i' ? 'bg-gradient-to-r from-[#3ee6a8] to-[#2fd08a] text-[#08060f] shadow-sm' : 'text-[#9d98b0] hover:text-white'
            }`}
          >
            Somente ida
          </button>
          <button
            type="button"
            onClick={() => setTripType('v')}
            className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              tripType === 'v' ? 'bg-gradient-to-r from-[#3ee6a8] to-[#2fd08a] text-[#08060f] shadow-sm' : 'text-[#9d98b0] hover:text-white'
            }`}
          >
            Somente volta
          </button>
          <button
            type="button"
            onClick={() => setTripType('rt')}
            className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              tripType === 'rt' ? 'bg-gradient-to-r from-[#3ee6a8] to-[#2fd08a] text-[#08060f] shadow-sm' : 'text-[#9d98b0] hover:text-white'
            }`}
          >
            Ida e volta
          </button>
        </div>

        {/* Origin Airport with Autocomplete & Suggestions */}
        <AirportSelect
          value={origin}
          onChange={setOrigin}
          placeholder="Código ou Cidade (ex: CGH, GRU, GIG)"
          label="Origem"
          iconType="takeoff"
          offers={offers}
          isOrigin={true}
          variant="large"
        />

        {/* Swap Button */}
        <div className="flex justify-center -my-1">
          <button
            type="button"
            onClick={handleSwap}
            className="w-10 h-10 rounded-full bg-[#181328] border border-white/15 hover:border-[#8b7cf6] text-[#8b7cf6] hover:text-white flex items-center justify-center transition-all shadow-md cursor-pointer hover:rotate-180"
            title="Inverter origem e destino"
          >
            <ArrowUpDown className="w-4 h-4" />
          </button>
        </div>

        {/* Destination Airport with Autocomplete & Suggestions */}
        <AirportSelect
          value={destination}
          onChange={setDestination}
          placeholder="Código ou Cidade (ex: REC, MAD, MIA)"
          label="Destino"
          iconType="landing"
          offers={offers}
          isOrigin={false}
          variant="large"
        />

        {/* Dates & Cabin Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
          {/* Departure Date Button */}
          <button
            type="button"
            onClick={() => setCalendarTarget(calendarTarget === 'dep' ? null : 'dep')}
            className={`flex items-center gap-3 bg-[#181328] border rounded-2xl px-3.5 py-2.5 text-left transition-all cursor-pointer ${
              calendarTarget === 'dep' ? 'border-[#34d399] shadow-[0_0_12px_rgba(52,211,153,0.3)]' : 'border-white/15'
            }`}
          >
            <Calendar className="w-4 h-4 text-[#34d399] shrink-0" />
            <div className="min-w-0">
              <span className="text-[9px] uppercase font-bold text-[#6f6a84] block">Ida</span>
              <span className="text-xs sm:text-sm font-bold text-white truncate block">
                {formatDateDisplay(depDate)}
              </span>
            </div>
          </button>

          {/* Return Date Button */}
          {tripType === 'rt' && (
            <button
              type="button"
              onClick={() => setCalendarTarget(calendarTarget === 'ret' ? null : 'ret')}
              className={`flex items-center gap-3 bg-[#181328] border rounded-2xl px-3.5 py-2.5 text-left transition-all cursor-pointer ${
                calendarTarget === 'ret' ? 'border-[#34d399] shadow-[0_0_12px_rgba(52,211,153,0.3)]' : 'border-white/15'
              }`}
            >
              <Calendar className="w-4 h-4 text-[#34d399] shrink-0" />
              <div className="min-w-0">
                <span className="text-[9px] uppercase font-bold text-[#6f6a84] block">Volta</span>
                <span className="text-xs sm:text-sm font-bold text-white truncate block">
                  {formatDateDisplay(retDate)}
                </span>
              </div>
            </button>
          )}

          {/* Cabin Class */}
          <div className={`flex items-center gap-3 bg-[#181328] border border-white/15 rounded-2xl px-3.5 py-2.5 ${tripType !== 'rt' ? 'col-span-1' : 'col-span-2 sm:col-span-1'}`}>
            <Tag className="w-4 h-4 text-[#8b7cf6] shrink-0" />
            <div className="min-w-0 flex-1">
              <span className="text-[9px] uppercase font-bold text-[#6f6a84] block">Classe</span>
              <select
                value={cabinClass}
                onChange={e => setCabinClass(e.target.value as any)}
                className="w-full bg-transparent text-white font-bold text-xs sm:text-sm outline-none cursor-pointer"
              >
                <option value="economy" className="bg-[#181328]">Econômica</option>
                <option value="business" className="bg-[#181328]">Executiva</option>
              </select>
            </div>
          </div>
        </div>

        {/* Passenger Button */}
        <button
          type="button"
          onClick={() => setShowPassengerPicker(!showPassengerPicker)}
          className="w-full flex items-center justify-between bg-[#181328] border border-white/15 hover:border-white/30 rounded-2xl px-4 py-2.5 text-left transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <Users className="w-4 h-4 text-[#8b7cf6] shrink-0" />
            <div>
              <span className="text-[9px] uppercase font-bold text-[#6f6a84] block">Passageiros</span>
              <span className="text-xs sm:text-sm font-bold text-white">{passengerLabel}</span>
            </div>
          </div>
          <span className="text-xs font-bold text-[#8b7cf6]">Alterar</span>
        </button>

        {/* Passenger Stepper Card */}
        {showPassengerPicker && (
          <div className="p-4 rounded-2xl bg-[#181328] border border-white/15 space-y-3 animate-fade-in">
            <div className="flex items-center justify-between text-xs pb-2 border-b border-white/8">
              <div>
                <strong className="text-white block">Adultos</strong>
                <small className="text-[#6f6a84]">12 anos ou mais</small>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setAdults(Math.max(1, adults - 1))}
                  className="w-8 h-8 rounded-full border border-white/15 bg-[#110d1d] text-white flex items-center justify-center font-bold text-sm cursor-pointer"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-4 text-center font-bold font-mono">{adults}</span>
                <button
                  type="button"
                  onClick={() => setAdults(adults + 1)}
                  className="w-8 h-8 rounded-full border border-white/15 bg-[#110d1d] text-white flex items-center justify-center font-bold text-sm cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pb-2 border-b border-white/8">
              <div>
                <strong className="text-white block">Crianças</strong>
                <small className="text-[#6f6a84]">2 a 11 anos</small>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setChildren(Math.max(0, children - 1))}
                  className="w-8 h-8 rounded-full border border-white/15 bg-[#110d1d] text-white flex items-center justify-center font-bold text-sm cursor-pointer"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-4 text-center font-bold font-mono">{children}</span>
                <button
                  type="button"
                  onClick={() => setChildren(children + 1)}
                  className="w-8 h-8 rounded-full border border-white/15 bg-[#110d1d] text-white flex items-center justify-center font-bold text-sm cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <div>
                <strong className="text-white block">Bebês</strong>
                <small className="text-[#6f6a84]">Até 23 meses</small>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setInfants(Math.max(0, infants - 1))}
                  className="w-8 h-8 rounded-full border border-white/15 bg-[#110d1d] text-white flex items-center justify-center font-bold text-sm cursor-pointer"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-4 text-center font-bold font-mono">{infants}</span>
                <button
                  type="button"
                  onClick={() => setInfants(infants + 1)}
                  className="w-8 h-8 rounded-full border border-white/15 bg-[#110d1d] text-white flex items-center justify-center font-bold text-sm cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Interactive Economilhas Day-by-Day Calendar Picker */}
        {calendarTarget && (
          <div className="p-4 sm:p-5 rounded-2xl bg-[#181328] border border-[#34d399]/40 space-y-3.5 animate-fade-in shadow-2xl">
            {/* Month Header Navigation */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="w-8 h-8 rounded-full bg-[#110d1d] border border-white/15 text-slate-300 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
                title="Mês anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="text-center">
                <strong className="text-sm sm:text-base font-bold text-white capitalize font-sans block">
                  {monthLabel}
                </strong>
                <span className="text-[10px] text-[#34d399] font-bold uppercase tracking-wider block">
                  {calendarTarget === 'dep' ? 'Selecionando Data de Ida' : 'Selecionando Data de Volta'}
                </span>
              </div>
              <button
                type="button"
                onClick={handleNextMonth}
                className="w-8 h-8 rounded-full bg-[#110d1d] border border-white/15 text-slate-300 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
                title="Próximo mês"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Weekdays */}
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-[#6f6a84]">
              <span>D</span><span>S</span><span>T</span><span>Q</span><span>Q</span><span>S</span><span>S</span>
            </div>

            {/* Days Grid with Economilhas Prices & Lowest Highlight */}
            <div className="grid grid-cols-7 gap-1.5">
              {calendarDays.map((item, idx) => {
                if (!item) {
                  return <div key={`empty-${idx}`} className="aspect-[1/1.1]" />;
                }

                const todayStr = new Date().toISOString().split('T')[0];
                const isPast = item.dateStr < todayStr;
                const isSelected = (calendarTarget === 'dep' && item.dateStr === depDate) ||
                                   (calendarTarget === 'ret' && item.dateStr === retDate);
                const isLowest = !isPast && item.price === minMonthPrice;

                return (
                  <button
                    key={item.dateStr}
                    type="button"
                    disabled={isPast}
                    onClick={() => {
                      if (calendarTarget === 'dep') {
                        setDepDate(item.dateStr);
                      } else {
                        setRetDate(item.dateStr);
                      }
                      setCalendarTarget(null);
                    }}
                    className={`aspect-[1/1.1] rounded-xl flex flex-col items-center justify-center gap-0.5 p-1 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-gradient-to-r from-[#3ee6a8] to-[#2fd08a] text-[#08060f] font-bold shadow-md ring-2 ring-white/50'
                        : isPast
                        ? 'bg-[#110d1d]/40 text-slate-600 border border-transparent cursor-not-allowed opacity-35'
                        : isLowest
                        ? 'bg-[#34d399]/20 border-2 border-[#34d399] text-white shadow-[0_0_12px_rgba(52,211,153,0.3)] hover:scale-105'
                        : 'bg-[#110d1d] hover:bg-white/10 text-slate-200 border border-white/5'
                    }`}
                  >
                    <b className="text-xs font-semibold">{item.day}</b>
                    {!isPast && (
                      <small className={`text-[8.5px] font-mono tabular-nums leading-none ${
                        isSelected 
                          ? 'text-[#08060f] font-bold' 
                          : isLowest 
                          ? 'text-[#34d399] font-black' 
                          : 'text-[#9d98b0]'
                      }`}>
                        {(item.price / 1000).toFixed(1)}k
                      </small>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Footnote & Close */}
            <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[11px] text-[#9d98b0]">
              <p className="leading-snug">
                Milhas estimadas por trecho. O <span className="text-[#34d399] font-bold">menor preço do mês</span> fica em verde.
              </p>
              <button
                type="button"
                onClick={() => setCalendarTarget(null)}
                className="px-2.5 py-1 text-xs font-bold text-slate-400 hover:text-white rounded-lg hover:bg-white/10 shrink-0 cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        )}

        {/* Primary Action Button */}
        <button
          type="button"
          onClick={() => setHasSearched(true)}
          className="w-full min-h-[50px] rounded-2xl bg-gradient-to-r from-[#3ee6a8] to-[#2fd08a] hover:from-[#34d399] hover:to-[#22c55e] text-[#08060f] font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-[0_10px_28px_-12px_rgba(52,211,153,0.55)] cursor-pointer"
        >
          <Search className="w-4 h-4 stroke-[2.5]" />
          <span>Pesquisar ofertas</span>
        </button>

        {/* Secondary Actions */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={() => {
              setOrigin('');
              setDestination('');
              setHasSearched(false);
            }}
            className="min-h-[44px] rounded-xl bg-[#110d1d] hover:bg-white/5 border border-white/15 text-xs font-semibold text-[#c9c4f5] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Limpar pesquisa</span>
          </button>

          <button
            type="button"
            onClick={() => onOpenCreateAlert(origin, destination, 50000)}
            className="min-h-[44px] rounded-xl bg-[#110d1d] hover:bg-white/5 border border-white/15 text-xs font-semibold text-[#c9c4f5] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Bell className="w-3.5 h-3.5 text-[#8b7cf6]" />
            <span>Criar alerta</span>
          </button>
        </div>
      </div>

      {/* Search Results */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white">
              Resultados da busca ({matchingOffers.length})
            </h2>
            <p className="text-xs text-[#9d98b0] mt-0.5">
              FlySync monitora passagens em <strong>milhas</strong> e tarifas promocionais em <strong>dinheiro (R$)</strong>.
            </p>
          </div>

          {/* Payment filter pills */}
          <div className="flex items-center gap-1 bg-[#110d1d] p-1 rounded-xl border border-white/10 shrink-0 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setPaymentFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                paymentFilter === 'all'
                  ? 'bg-gradient-to-r from-[#3ee6a8] to-[#2fd08a] text-[#08060f] shadow-sm'
                  : 'text-[#9d98b0] hover:text-white'
              }`}
            >
              Todas as tarifas
            </button>
            <button
              type="button"
              onClick={() => setPaymentFilter('miles')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                paymentFilter === 'miles'
                  ? 'bg-gradient-to-r from-[#3ee6a8] to-[#2fd08a] text-[#08060f] shadow-sm'
                  : 'text-[#9d98b0] hover:text-white'
              }`}
            >
              Milhas
            </button>
            <button
              type="button"
              onClick={() => setPaymentFilter('cash')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                paymentFilter === 'cash'
                  ? 'bg-gradient-to-r from-[#3ee6a8] to-[#2fd08a] text-[#08060f] shadow-sm'
                  : 'text-[#9d98b0] hover:text-white'
              }`}
            >
              Dinheiro (R$)
            </button>
          </div>
        </div>

        {matchingOffers.length === 0 ? (
          <div className="p-8 rounded-2xl bg-[#110d1d] border border-white/10 text-center space-y-3">
            <Search className="w-10 h-10 text-[#6f6a84] mx-auto opacity-50" />
            <h3 className="text-lg font-bold text-white">Nenhum voo encontrado para esta rota</h3>
            <p className="text-xs text-[#9d98b0] max-w-sm mx-auto">
              Tente alterar a origem/destino para grandes hubs (ex: GRU, GIG, BSB) ou ative um alerta para ser avisado assim que surgir disponibilidade.
            </p>
            <button
              type="button"
              onClick={() => onOpenCreateAlert(origin, destination, 50000)}
              className="px-4 py-2 rounded-xl bg-[#8b7cf6] text-white text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              Criar Alerta para {origin} → {destination}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {matchingOffers.map(offer => {
              const prog = programs.find(p => p.id === offer.programId);
              const isCash = offer.paymentType === 'cash';

              return (
                <div
                  key={offer.id}
                  onClick={() => onSelectOffer(offer)}
                  className="rounded-2xl p-4 bg-[#110d1d] hover:bg-[#151024] border border-white/10 hover:border-[#34d399]/40 transition-all cursor-pointer shadow-md flex items-center justify-between gap-3 group"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: prog?.color || '#34d399' }} />
                      <span className="text-[11px] font-bold text-slate-300">
                        {offer.airline} {offer.paymentType !== 'cash' && `· ${prog?.name}`}
                      </span>
                    </div>

                    <strong className="text-lg font-black tracking-tight text-white block">
                      {offer.origin} → {offer.destination}
                    </strong>
                    <small className="text-xs text-[#9d98b0] block truncate">
                      {formatDateDisplay(offer.departureDate)} · {offer.destCity}
                    </small>
                  </div>

                  <div className="text-right shrink-0">
                    {isCash ? (
                      <div>
                        <span className="text-base font-black text-[#34d399] font-mono tabular-nums block">
                          R$ {(offer.cashPriceTotal || offer.miles).toLocaleString('pt-BR')}
                        </span>
                        <small className="text-[10px] text-emerald-300 font-bold uppercase block">
                          total c/ taxas
                        </small>
                      </div>
                    ) : (
                      <div>
                        <span className="text-base font-black text-[#34d399] font-mono tabular-nums block">
                          {offer.miles.toLocaleString('pt-BR')}
                        </span>
                        <small className="text-[10px] text-[#9d98b0] block">
                          +{offer.cashAmount.toFixed(2)} taxas
                        </small>
                      </div>
                    )}
                    <button
                      type="button"
                      className="mt-1 text-[11px] font-bold text-[#8b7cf6] group-hover:text-white flex items-center gap-1 justify-end"
                    >
                      <span>Ver detalhes</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
