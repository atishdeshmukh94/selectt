import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Badge, Textarea } from '@/components/ui';
import { Car, Calendar, MapPin, Gauge, IndianRupee, ShieldCheck, Sparkles } from 'lucide-react';

const BRAND = {
  midnight: '#0C1B33',
  teal: '#00C9AF',
  actionBlue: '#0057FF',
  iceWhite: '#F0F5FA',
  slate: '#637696',
  white: '#FFFFFF',
};

const MAKES_AND_MODELS = {
  'Maruti Suzuki': {
    Swift: { basePrice: 7.8, fuels: ['Petrol', 'CNG'], demand: 1.12 },
    Baleno: { basePrice: 8.8, fuels: ['Petrol', 'CNG'], demand: 1.1 },
    Dzire: { basePrice: 8.6, fuels: ['Petrol', 'CNG'], demand: 1.11 },
    Brezza: { basePrice: 10.8, fuels: ['Petrol', 'CNG'], demand: 1.08 },
    Ertiga: { basePrice: 11.6, fuels: ['Petrol', 'CNG'], demand: 1.08 },
    XL6: { basePrice: 13.2, fuels: ['Petrol', 'Hybrid'], demand: 1.05 },
    Fronx: { basePrice: 9.2, fuels: ['Petrol', 'CNG'], demand: 1.09 },
    'Grand Vitara': { basePrice: 14.8, fuels: ['Petrol', 'Hybrid', 'CNG'], demand: 1.08 },
    'e Vitara': { basePrice: 18.8, fuels: ['Electric'], demand: 1.06 }
  },
  Hyundai: {
    i20: { basePrice: 8.6, fuels: ['Petrol'], demand: 1.03 },
    Venue: { basePrice: 11.2, fuels: ['Petrol', 'Diesel'], demand: 1.05 },
    Verna: { basePrice: 13.6, fuels: ['Petrol'], demand: 1.01 },
    Creta: { basePrice: 16.8, fuels: ['Petrol', 'Diesel'], demand: 1.14 },
    Alcazar: { basePrice: 18.9, fuels: ['Petrol', 'Diesel'], demand: 1.04 },
    'Kona Electric': { basePrice: 23.5, fuels: ['Electric'], demand: 0.95 },
    CretaEV: { basePrice: 18.5, fuels: ['Electric'], demand: 1.05 }
  },
  Tata: {
    Altroz: { basePrice: 8.8, fuels: ['Petrol', 'Diesel', 'CNG'], demand: 1 },
    Punch: { basePrice: 9.1, fuels: ['Petrol', 'CNG'], demand: 1.12 },
    Nexon: { basePrice: 13.4, fuels: ['Petrol', 'Diesel'], demand: 1.13 },
    Harrier: { basePrice: 20.6, fuels: ['Diesel'], demand: 1.04 },
    Safari: { basePrice: 23.8, fuels: ['Diesel'], demand: 1.02 },
    'Tiago EV': { basePrice: 9.6, fuels: ['Electric'], demand: 1.06 },
    'Punch EV': { basePrice: 12.4, fuels: ['Electric'], demand: 1.08 },
    'Nexon EV': { basePrice: 15.8, fuels: ['Electric'], demand: 1.1 },
    'Curvv EV': { basePrice: 19.4, fuels: ['Electric'], demand: 1.07 }
  },
  Mahindra: {
    XUV3XO: { basePrice: 10.4, fuels: ['Petrol', 'Diesel'], demand: 1.05 },
    ScorpioN: { basePrice: 18.8, fuels: ['Petrol', 'Diesel'], demand: 1.12 },
    XUV700: { basePrice: 21.2, fuels: ['Petrol', 'Diesel'], demand: 1.14 },
    Thar: { basePrice: 15.4, fuels: ['Petrol', 'Diesel'], demand: 1.1 },
    'XUV400 EV': { basePrice: 15.6, fuels: ['Electric'], demand: 1.04 },
    'BE 6': { basePrice: 19.8, fuels: ['Electric'], demand: 1.07 }
  },
  Kia: {
    Sonet: { basePrice: 10.8, fuels: ['Petrol', 'Diesel'], demand: 1.07 },
    Carens: { basePrice: 13.8, fuels: ['Petrol', 'Diesel'], demand: 1.06 },
    Seltos: { basePrice: 16.5, fuels: ['Petrol', 'Diesel'], demand: 1.12 },
    'EV6': { basePrice: 63, fuels: ['Electric'], demand: 0.96 }
  },
  Toyota: {
    Glanza: { basePrice: 8.7, fuels: ['Petrol', 'CNG'], demand: 1.03 },
    Hyryder: { basePrice: 15.6, fuels: ['Petrol', 'Hybrid', 'CNG'], demand: 1.09 },
    InnovaCrysta: { basePrice: 25.2, fuels: ['Diesel'], demand: 1.07 },
    InnovaHycross: { basePrice: 28.8, fuels: ['Petrol', 'Hybrid'], demand: 1.12 }
  },
  Honda: {
    Amaze: { basePrice: 8.2, fuels: ['Petrol'], demand: 1 },
    City: { basePrice: 14.2, fuels: ['Petrol', 'Hybrid'], demand: 1.04 },
    Elevate: { basePrice: 13.6, fuels: ['Petrol'], demand: 1.04 }
  },
  MG: {
    Astor: { basePrice: 13.6, fuels: ['Petrol'], demand: 0.98 },
    Hector: { basePrice: 18.6, fuels: ['Petrol', 'Diesel'], demand: 0.97 },
    Comet: { basePrice: 8.2, fuels: ['Electric'], demand: 1.01 },
    ZSEV: { basePrice: 20.2, fuels: ['Electric'], demand: 0.99 },
    WindsorEV: { basePrice: 15.8, fuels: ['Electric'], demand: 1.04 }
  }
};

const VARIANTS_BY_MODEL = {
  'Maruti Suzuki': {
    Swift: ['LXi', 'VXi', 'VXi AMT', 'ZXi', 'ZXi+'],
    Baleno: ['Sigma', 'Delta', 'Delta AMT', 'Zeta', 'Alpha'],
    Dzire: ['LXi', 'VXi', 'VXi AMT', 'ZXi', 'ZXi+'],
    Brezza: ['LXi', 'VXi', 'ZXi', 'ZXi AT', 'ZXi+'],
    Ertiga: ['LXi', 'VXi', 'ZXi', 'VXi AT', 'ZXi+ AT'],
    XL6: ['Zeta', 'Zeta AT', 'Alpha', 'Alpha+ AT'],
    Fronx: ['Sigma', 'Delta', 'Delta+', 'Zeta Turbo', 'Alpha Turbo'],
    'Grand Vitara': ['Sigma', 'Delta', 'Delta CNG', 'Zeta', 'Zeta+', 'Alpha', 'Alpha+'],
    'e Vitara': ['Delta', 'Zeta', 'Alpha']
  },
  Hyundai: {
    i20: ['Era', 'Magna', 'Sportz', 'Asta', 'Asta(O)'],
    Venue: ['E', 'S', 'S(O)', 'SX', 'SX(O)'],
    Verna: ['EX', 'S', 'SX', 'SX Turbo', 'SX(O)'],
    Creta: ['E', 'EX', 'S', 'SX', 'SX(O)'],
    Alcazar: ['Executive', 'Prestige', 'Platinum', 'Signature'],
    'Kona Electric': ['Premium', 'Premium Dual Tone'],
    CretaEV: ['Executive', 'Smart', 'Premium', 'Excellence']
  },
  Tata: {
    Altroz: ['XE', 'XM', 'XT', 'XZ', 'XZ+'],
    Punch: ['Pure', 'Adventure', 'Accomplished', 'Creative'],
    Nexon: ['Smart', 'Pure', 'Creative', 'Fearless'],
    Harrier: ['Smart', 'Pure', 'Adventure', 'Fearless'],
    Safari: ['Smart', 'Pure', 'Adventure', 'Accomplished'],
    'Tiago EV': ['XE MR', 'XT MR', 'XZ+ MR', 'XZ+ LR'],
    'Punch EV': ['Smart', 'Adventure', 'Empowered'],
    'Nexon EV': ['Creative', 'Fearless', 'Empowered'],
    'Curvv EV': ['Creative', 'Accomplished', 'Empowered+']
  },
  Mahindra: {
    XUV3XO: ['MX1', 'MX2', 'MX3', 'AX5', 'AX7'],
    ScorpioN: ['Z2', 'Z4', 'Z6', 'Z8', 'Z8L'],
    XUV700: ['MX', 'AX3', 'AX5', 'AX7', 'AX7L'],
    Thar: ['AX(O)', 'LX Hard Top', 'LX Convertible'],
    'XUV400 EV': ['EC Pro', 'EL Pro'],
    'BE 6': ['Pack One', 'Pack Two', 'Pack Three']
  },
  Kia: {
    Sonet: ['HTE', 'HTK', 'HTK+', 'HTX', 'GTX+'],
    Carens: ['Premium', 'Prestige', 'Prestige Plus', 'Luxury', 'Luxury Plus'],
    Seltos: ['HTE', 'HTK', 'HTK+', 'HTX', 'X-Line'],
    EV6: ['GT Line RWD', 'GT Line AWD']
  },
  Toyota: {
    Glanza: ['E', 'S', 'G', 'V'],
    Hyryder: ['E', 'S', 'G', 'V Hybrid'],
    InnovaCrysta: ['GX', 'VX', 'ZX'],
    InnovaHycross: ['GX', 'VX', 'ZX', 'ZX(O)']
  },
  Honda: {
    Amaze: ['V', 'VX', 'ZX'],
    City: ['SV', 'V', 'VX', 'ZX', 'e:HEV ZX'],
    Elevate: ['SV', 'V', 'VX', 'ZX']
  },
  MG: {
    Astor: ['Sprint', 'Shine', 'Select', 'Sharp', 'Savvy'],
    Hector: ['Style', 'Shine', 'Smart', 'Sharp', 'Savvy Pro'],
    Comet: ['Executive', 'Excite', 'Exclusive'],
    ZSEV: ['Executive', 'Excite Pro', 'Exclusive Pro'],
    WindsorEV: ['Excite', 'Exclusive', 'Essence']
  }
};

const CITIES = ['Mumbai', 'Delhi', 'Bengaluru', 'Pune', 'Hyderabad', 'Chennai', 'Ahmedabad', 'Kolkata', 'Jaipur', 'Chandigarh', 'Lucknow', 'Indore', 'Surat', 'Kochi', 'Nagpur', 'Goa'];

const CURRENT_YEAR = Math.max(new Date().getFullYear(), 2026);
const MIN_ALLOWED_YEAR = Math.max(2015, CURRENT_YEAR - 10);
const YEARS = Array.from({ length: CURRENT_YEAR - MIN_ALLOWED_YEAR + 1 }, (_, i) => CURRENT_YEAR - i);
const OWNERS = ['1', '2', '3', '4+'];

function formatLakhs(value) {
  return `₹${value.toFixed(2)} Lakhs`;
}

function SelectField({ value, onValueChange, placeholder, options }) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="h-12 rounded-xl border-slate-200 bg-white text-slate-950 shadow-sm transition-all hover:border-slate-300 hover:shadow-md focus:ring-2 focus:ring-slate-200">
        <SelectValue placeholder={placeholder} className="text-slate-950" />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option} value={option}>
            {option}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export default function SelecttUsedCarValuationCalculator() {
  const [form, setForm] = useState({
    make: '',
    model: '',
    variant: '',
    kilometers: '',
    owners: '1',
    fuel: '',
    transmission: '',
    year: '2024',
    city: '',
  });
  const [valuation, setValuation] = useState(null);
  const [lead, setLead] = useState({
    name: '',
    phone: '',
    appointmentDate: '',
    notes: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const availableModels = useMemo(() => {
    if (!form.make || !MAKES_AND_MODELS[form.make]) return [];
    return Object.keys(MAKES_AND_MODELS[form.make]).sort();
  }, [form.make]);

  const availableFuels = useMemo(() => {
    if (!form.make || !form.model) return [];
    return MAKES_AND_MODELS[form.make]?.[form.model]?.fuels || [];
  }, [form.make, form.model]);

  const availableVariants = useMemo(() => {
    if (!form.make || !form.model) return [];
    return VARIANTS_BY_MODEL[form.make]?.[form.model] || ['Standard'];
  }, [form.make, form.model]);

  const availableTransmissions = useMemo(() => {
    if (!form.make || !form.model) return [];
    if (form.fuel === 'Electric') return ['Automatic'];
    if (form.model === 'InnovaHycross' || form.model === 'EV6' || form.model === 'Kona Electric') return ['Automatic'];
    return ['Manual', 'Automatic'];
  }, [form.make, form.model, form.fuel]);

  function updateField(key, value) {
    setForm((prev) => {
      if (key === 'make') {
        return { ...prev, make: value, model: '', variant: '', fuel: '', transmission: '' };
      }
      if (key === 'model') {
        return { ...prev, model: value, variant: '', fuel: '', transmission: '' };
      }
      if (key === 'fuel') {
        return { ...prev, fuel: value, transmission: value === 'Electric' ? 'Automatic' : '', variant: prev.variant };
      }
      return { ...prev, [key]: value };
    });
  }

  function calculateValuation() {
    const year = Number(form.year);
    const kilometers = Number(form.kilometers);
    const owners = form.owners === '4+' ? 4 : Number(form.owners || 1);
    const carMeta = MAKES_AND_MODELS[form.make]?.[form.model];

    if (!form.make || !form.model || !form.variant || !form.kilometers || !form.owners || !form.fuel || !form.transmission || !form.year || !form.city || !carMeta) {
      setValuation({ error: 'Please complete all fields before checking the value.' });
      return;
    }

    if (!Number.isFinite(kilometers) || kilometers < 0) {
      setValuation({ error: 'Please enter a valid kilometers-driven figure.' });
      return;
    }

    if (year < MIN_ALLOWED_YEAR) {
      setValuation({
        error: `Selectt policy currently accepts cars from ${MIN_ALLOWED_YEAR} onward only. Vehicles below ${MIN_ALLOWED_YEAR} are not eligible.`
      });
      return;
    }

    const age = CURRENT_YEAR - year;
    const expectedKm = Math.max(age * 12000, 10000);
    const kmDelta = kilometers - expectedKm;
    const cityMultiplierMap = {
      Mumbai: 1.03,
      Delhi: 1.01,
      Bengaluru: 1.04,
      Pune: 1.02,
      Hyderabad: 1.01,
      Chennai: 1,
      Ahmedabad: 0.99,
      Kolkata: 0.98,
      Jaipur: 0.99,
      Chandigarh: 1,
      Lucknow: 0.98,
      Indore: 0.98,
      Surat: 0.99,
      Kochi: 1,
      Nagpur: 0.98,
      Goa: 1.01
    };

    const fuelMultiplierMap = {
      Petrol: 1,
      Diesel: 0.97,
      CNG: 0.94,
      Hybrid: 1.05,
      Electric: form.city === 'Bengaluru' || form.city === 'Mumbai' || form.city === 'Delhi' || form.city === 'Pune' ? 1.08 : 1.03
    };

    const ownerPenalty = Math.max(0.82, 1 - (owners - 1) * 0.06);
    const agePenalty = Math.max(0.42, 1 - age * 0.085);
    const kmPenalty = kmDelta > 0 ? Math.max(0.8, 1 - kmDelta / 250000) : Math.min(1.06, 1 + Math.abs(kmDelta) / 300000);
    const fuelMultiplier = fuelMultiplierMap[form.fuel] || 1;
    const transmissionMultiplier = form.transmission === 'Automatic' ? 1.02 : 0.99;
    const cityMultiplier = cityMultiplierMap[form.city] || 1;
    const demandMultiplier = carMeta.demand || 1;
    const procurementBoost = age <= 5 && owners === 1 ? 1.03 : 1.01;

    const fairValue = carMeta.basePrice * agePenalty * kmPenalty * ownerPenalty * fuelMultiplier * transmissionMultiplier * cityMultiplier * demandMultiplier * procurementBoost;
    const bestPrice = Math.max(1.25, fairValue);
    const low = Math.max(1, bestPrice * 0.96);
    const high = bestPrice * 1.04;

    const strengths = [];
    if (owners === 1) strengths.push('single-owner profile improves procurement appeal');
    if (kilometers <= expectedKm) strengths.push('kilometers are healthy for the car age');
    if (form.fuel === 'Hybrid' || form.fuel === 'Electric') strengths.push('alternative fuel demand supports stronger pricing');
    if ((carMeta.demand || 1) >= 1.08) strengths.push('this model has strong resale demand in India');
    if (form.city === 'Mumbai' || form.city === 'Bengaluru' || form.city === 'Pune') strengths.push('your city has solid used-car demand');

    const caution = [];
    if (kilometers > expectedKm + 20000) caution.push('higher-than-average running lowers the offer range');
    if (owners >= 3) caution.push('multiple ownership history affects buyer confidence');
    if (age >= 8) caution.push('older age pushes the car closer to Selectt policy limits');
    if (form.fuel === 'Diesel' && form.city === 'Delhi') caution.push('diesel demand can be softer around NCR restrictions');

    setValuation({
      low,
      high,
      bestPrice,
      expectedKm,
      age,
      strengths,
      caution,
      headline: `Estimated Selectt procurement range for your ${form.year} ${form.make} ${form.model} ${form.variant}`
    });
    setSubmitted(false);
  }

  function handleBooking() {
    if (!valuation || valuation.error) return;
    if (!lead.name || !lead.phone || !lead.appointmentDate) return;
    setSubmitted(true);
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-900">
      <div className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-12">
        <div className="grid gap-6 lg:grid-cols-5">
          <Card className="lg:col-span-3 overflow-hidden border-0 shadow-xl">
            <div className="p-6 md:p-8" style={{ backgroundColor: BRAND.midnight }}>
              <Badge className="mb-4 border-0 text-white" style={{ backgroundColor: BRAND.actionBlue }}>Selectt Value</Badge>
              <h1 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">Used Car Valuation Calculator</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6" style={{ color: '#D8E2F0' }}>
                Get a fast, seller-friendly estimate for your car and book an inspection with Selectt.
              </p>
            </div>
            <CardContent className="bg-white p-6 md:p-8">
              <div className="mb-6 grid gap-3 md:grid-cols-3">
                <div className="rounded-2xl p-4" style={{ backgroundColor: BRAND.iceWhite }}>
                  <div className="flex items-center gap-2 text-sm font-medium" style={{ color: BRAND.midnight }}>
                    <Car className="h-4 w-4" /> All Indian 4-wheelers
                  </div>
                  <p className="mt-2 text-sm" style={{ color: BRAND.slate }}>Includes mainstream passenger cars and EVs relevant for India in 2026.</p>
                </div>
                <div className="rounded-2xl p-4" style={{ backgroundColor: BRAND.iceWhite }}>
                  <div className="flex items-center gap-2 text-sm font-medium" style={{ color: BRAND.midnight }}>
                    <Gauge className="h-4 w-4" /> Fast pricing logic
                  </div>
                  <p className="mt-2 text-sm" style={{ color: BRAND.slate }}>Values reflect age, km, owners, fuel type, city demand, and resale strength.</p>
                </div>
                <div className="rounded-2xl p-4" style={{ backgroundColor: BRAND.iceWhite }}>
                  <div className="flex items-center gap-2 text-sm font-medium" style={{ color: BRAND.midnight }}>
                    <Calendar className="h-4 w-4" /> Selectt policy
                  </div>
                  <p className="mt-2 text-sm" style={{ color: BRAND.slate }}>Only cars from {MIN_ALLOWED_YEAR} onward are eligible. Below-2015 cars are not accepted.</p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2 rounded-3xl border border-slate-100 bg-gradient-to-br from-white to-slate-50 p-4 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
                  <p className="text-sm font-medium" style={{ color: BRAND.midnight }}>Car make</p>
                  <SelectField value={form.make} onValueChange={(v) => updateField('make', v)} placeholder="Select make" options={Object.keys(MAKES_AND_MODELS).sort()} />
                </div>
                <div className="space-y-2 rounded-3xl border border-slate-100 bg-gradient-to-br from-white to-slate-50 p-4 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
                  <p className="text-sm font-medium" style={{ color: BRAND.midnight }}>Car model</p>
                  <SelectField value={form.model} onValueChange={(v) => updateField('model', v)} placeholder="Select model" options={availableModels} />
                </div>
                <div className="space-y-2 rounded-3xl border border-teal-100 bg-gradient-to-br from-teal-50 to-white p-4 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium" style={{ color: BRAND.midnight }}>Variant</p>
                    <span className="rounded-full px-2 py-1 text-xs font-medium" style={{ backgroundColor: '#DDFBF6', color: BRAND.teal }}>Trim selection</span>
                  </div>
                  <SelectField value={form.variant} onValueChange={(v) => updateField('variant', v)} placeholder="Select variant" options={availableVariants} />
                </div>
                <div className="space-y-2 rounded-3xl border border-slate-100 bg-gradient-to-br from-white to-slate-50 p-4 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
                  <p className="text-sm font-medium" style={{ color: BRAND.midnight }}>Kilometers driven</p>
                  <Input className="h-12 rounded-xl border-slate-200 bg-white font-semibold text-slate-950 caret-slate-950 shadow-sm placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-slate-200" placeholder="e.g. 45000" value={form.kilometers} onChange={(e) => updateField('kilometers', e.target.value.replace(/[^0-9]/g, ''))} />
                </div>
                <div className="space-y-2 rounded-3xl border border-slate-100 bg-gradient-to-br from-white to-slate-50 p-4 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
                  <p className="text-sm font-medium" style={{ color: BRAND.midnight }}>Number of owners</p>
                  <SelectField value={form.owners} onValueChange={(v) => updateField('owners', v)} placeholder="Number of owners" options={OWNERS} />
                </div>
                <div className="space-y-2 rounded-3xl border border-slate-100 bg-gradient-to-br from-white to-slate-50 p-4 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
                  <p className="text-sm font-medium" style={{ color: BRAND.midnight }}>Fuel type</p>
                  <SelectField value={form.fuel} onValueChange={(v) => updateField('fuel', v)} placeholder="Fuel type" options={availableFuels} />
                </div>
                <div className="space-y-2 rounded-3xl border border-teal-100 bg-gradient-to-br from-teal-50 to-white p-4 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium" style={{ color: BRAND.midnight }}>Transmission</p>
                    <span className="rounded-full px-2 py-1 text-xs font-medium" style={{ backgroundColor: '#DDFBF6', color: BRAND.teal }}>Manual / Automatic</span>
                  </div>
                  <SelectField value={form.transmission} onValueChange={(v) => updateField('transmission', v)} placeholder="Select transmission" options={availableTransmissions} />
                </div>
                <div className="space-y-2 rounded-3xl border border-slate-100 bg-gradient-to-br from-white to-slate-50 p-4 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
                  <p className="text-sm font-medium" style={{ color: BRAND.midnight }}>Year of manufacture</p>
                  <SelectField value={form.year} onValueChange={(v) => updateField('year', v)} placeholder="Year of manufacture" options={YEARS.map(String)} />
                </div>
                <div className="space-y-2 rounded-3xl border border-slate-100 bg-gradient-to-br from-white to-slate-50 p-4 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
                  <p className="text-sm font-medium" style={{ color: BRAND.midnight }}>City</p>
                  <SelectField value={form.city} onValueChange={(v) => updateField('city', v)} placeholder="Select city" options={CITIES} />
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Button className="h-12 rounded-xl px-6 text-white shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl" style={{ backgroundColor: BRAND.teal }} onClick={calculateValuation}>
                  Check Fair Resale Value
                </Button>
                <div className="inline-flex items-center gap-2 rounded-xl border px-4 py-3 text-sm shadow-sm" style={{ backgroundColor: BRAND.iceWhite, color: BRAND.midnight, borderColor: '#D9E5F3' }}>
                  <ShieldCheck className="h-4 w-4" /> Seller-friendly estimate
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2 border-0 shadow-xl">
            <CardHeader className="pb-3" style={{ backgroundColor: BRAND.iceWhite }}>
              <CardTitle className="flex items-center gap-2 text-slate-900"><IndianRupee className="h-5 w-5" /> Estimated Value</CardTitle>
              <CardDescription>Realistic range based on age, km, fuel, ownership, demand, and city.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              {!valuation && (
                <div className="rounded-3xl border border-dashed border-slate-200 bg-gradient-to-br from-white to-slate-50 p-6 text-sm text-slate-500 shadow-sm">
                  <div className="flex items-center gap-2 text-sm font-medium" style={{ color: BRAND.midnight }}>
                    <Sparkles className="h-4 w-4" style={{ color: BRAND.teal }} /> Instant Selectt estimate preview
                  </div>
                  <p className="mt-3 leading-6">Enter your car details to unlock a live valuation range, procurement fit, and inspection booking form.</p>
                </div>
              )}

              {valuation?.error && (
                <div className="rounded-3xl border p-5 text-sm shadow-sm" style={{ borderColor: '#F1B4B4', backgroundColor: '#FFF5F5', color: '#7F1D1D' }}>
                  {valuation.error}
                </div>
              )}

              {valuation && !valuation.error && (
                <>
                  <div className="rounded-3xl p-6 text-white shadow-xl" style={{ backgroundColor: BRAND.midnight }}>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm" style={{ color: '#C7D4E8' }}>{valuation.headline}</p>
                        <h2 className="mt-2 text-3xl font-semibold">{formatLakhs(valuation.bestPrice)}</h2>
                        <p className="mt-2 text-sm" style={{ color: '#C7D4E8' }}>Expected Selectt offer range: {formatLakhs(valuation.low)} to {formatLakhs(valuation.high)}</p>
                      </div>
                      <div className="rounded-2xl px-3 py-2 text-xs font-medium shadow-sm" style={{ backgroundColor: BRAND.teal, color: BRAND.midnight }}>
                        Fast estimate
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-3xl p-4 shadow-sm" style={{ backgroundColor: BRAND.iceWhite }}>
                      <p className="text-xs uppercase tracking-wide" style={{ color: BRAND.slate }}>Vehicle age</p>
                      <p className="mt-2 text-xl font-semibold" style={{ color: BRAND.midnight }}>{valuation.age} yrs</p>
                    </div>
                    <div className="rounded-3xl p-4 shadow-sm" style={{ backgroundColor: BRAND.iceWhite }}>
                      <p className="text-xs uppercase tracking-wide" style={{ color: BRAND.slate }}>Expected km</p>
                      <p className="mt-2 text-xl font-semibold" style={{ color: BRAND.midnight }}>{valuation.expectedKm.toLocaleString('en-IN')} km</p>
                    </div>
                    <div className="rounded-3xl p-4 shadow-sm" style={{ backgroundColor: BRAND.iceWhite }}>
                      <p className="text-xs uppercase tracking-wide" style={{ color: BRAND.slate }}>Procurement fit</p>
                      <p className="mt-2 text-xl font-semibold" style={{ color: BRAND.midnight }}>{valuation.age <= 5 ? 'High' : valuation.age <= 8 ? 'Good' : 'Borderline'}</p>
                    </div>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="rounded-2xl border border-slate-200 p-4">
                      <div className="flex items-center gap-2 text-sm font-medium" style={{ color: BRAND.midnight }}>
                        <Sparkles className="h-4 w-4" style={{ color: BRAND.teal }} /> Value strengths
                      </div>
                      <div className="mt-3 space-y-2">
                        {(valuation.strengths.length ? valuation.strengths : ['Standard market demand and profile support this estimate.']).map((item) => (
                          <div key={item} className="rounded-xl px-3 py-2 text-sm" style={{ backgroundColor: BRAND.iceWhite, color: BRAND.midnight }}>
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="rounded-2xl border border-slate-200 p-4">
                      <div className="flex items-center gap-2 text-sm font-medium" style={{ color: BRAND.midnight }}>
                        <ShieldCheck className="h-4 w-4" style={{ color: BRAND.actionBlue }} /> Things affecting price
                      </div>
                      <div className="mt-3 space-y-2">
                        {(valuation.caution.length ? valuation.caution : ['No major negative pricing signals from the entered data.']).map((item) => (
                          <div key={item} className="rounded-xl px-3 py-2 text-sm" style={{ backgroundColor: '#f9f9f9', color: BRAND.slate }}>
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-slate-200 p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-semibold" style={{ color: BRAND.midnight }}>Book your inspection</h3>
                        <p className="mt-1 text-sm" style={{ color: BRAND.slate }}>Lock the estimate and let Selectt inspect the car for a final offer.</p>
                      </div>
                      <Badge className="border-0 text-white" style={{ backgroundColor: BRAND.actionBlue }}>Inspection</Badge>
                    </div>

                    <div className="mt-4 grid gap-3">
                      <Input className="h-12 rounded-xl border-slate-200" placeholder="Your name" value={lead.name} onChange={(e) => setLead((prev) => ({ ...prev, name: e.target.value }))} />
                      <Input className="h-12 rounded-xl border-slate-200" placeholder="Phone number" value={lead.phone} onChange={(e) => setLead((prev) => ({ ...prev, phone: e.target.value.replace(/[^0-9]/g, '').slice(0, 10) }))} />
                      <Input className="h-12 rounded-xl border-slate-200" type="date" value={lead.appointmentDate} onChange={(e) => setLead((prev) => ({ ...prev, appointmentDate: e.target.value }))} />
                      <Textarea className="min-h-24 rounded-xl border-slate-200" placeholder="Pickup address, preferred time, or extra notes" value={lead.notes} onChange={(e) => setLead((prev) => ({ ...prev, notes: e.target.value }))} />
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      <Button className="h-12 rounded-xl px-6 text-white" style={{ backgroundColor: BRAND.teal }} onClick={handleBooking}>
                        Book Inspection Appointment
                      </Button>
                      <p className="text-xs" style={{ color: BRAND.slate }}>This demo captures the lead on the front end. Hook it to your CRM or API next.</p>
                    </div>

                    {submitted && (
                      <div className="mt-4 rounded-2xl px-4 py-3 text-sm" style={{ backgroundColor: '#ECFDF5', color: '#065F46' }}>
                        Appointment request captured for {lead.name || 'customer'} on {lead.appointmentDate}. Next step: connect this submission to Selectt’s backend or WhatsApp lead workflow.
                      </div>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
