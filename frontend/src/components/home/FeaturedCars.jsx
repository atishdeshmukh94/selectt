import React from 'react';
import { ArrowRight } from 'lucide-react';
import CarCard from '../common/CarCard';

const cars = [
  {
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuB31AS3nWEPRUaZWOlG5NhZnL16A1SMCDJXVxo9Vk6yVsH_N9PwfN7tfssJhOCfZJHzVepqrElG6bCk0zv7k80K0wvrbted6QoJ9j2R8YSgQwyvI09oHoha2U_ApBQjIRmhCPQoMlh3PPmhleHutfaKYfSMOYQFOulXgR7saWSQFpXL4Qr7Ct8nbj-CJtK6egEo8QhB5WPIKs2Y7gFjtGw38JWFRc5HPr3fFDHfgahqCXKt1TvTVqEuU-KDUoOdvxZ471llQtGXUITI",
    title: "2021 Hyundai Creta",
    spec: "SX Plus Auto Petrol • 22,400 km",
    tags: ["1ST OWNER", "Automatic"],
    emi: "₹26,450/mo",
    price: "₹14.20 Lakh",
    isCertified: true
  },
  {
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuA1lHioVzKx0guvVJdlgSXSqV4vWaY-t-2MkY7qwZt8XEfdgxSTbnsNeD2lbkE31WmmYWph14km-SyT0_uLg9QTLl579Jjh6zap9lyx6QUxyydG2682at-5S09DUj5laNb77NZaAXCm9uA3th5a2OWugCmGIAzwWd1FQlZQCCOPO_eZNqNkV0wzmPeXA4eeqCI1uJH1mz7dVDgO0u_Zh-XD-HhguCZJwcoBeX4V6Z2ePeYAuREENCS0GQz-KeUlpSSd05XH1PGT-6FN",
    title: "2019 Maruti Swift",
    spec: "VXI Manual Petrol • 45,100 km",
    tags: ["1ST OWNER", "Manual"],
    emi: "₹10,500/mo",
    price: "₹5.75 Lakh",
    isCertified: true
  },
  {
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuC_hy2iMFnpYEpNJzoUBP-9pMDuF5P82pAlA-rMeSbO9XE_rIIIqs7sZXtpD2Ucm3N244kGd2Q7cUv26nrItmXUjvnQKoiN56-F0NJr5jPtZmUqvRPujFnXBU1Qu14-MnAepSi7QKQMwN-FQ562fvSgAg8gd3TVIBcBs3TSIwcZhLSSfZm9XTRjzg79lNf2ej-1cx-BgZk2cWYkY296uer0wNAvbpGPl_2KnbiPFbmsP2-ASrVFgFqpC1YZsld_BpkObIrHsNgtyG8m",
    title: "2020 BMW 3 Series",
    spec: "320d Luxury Line • 18,200 km",
    tags: ["1ST OWNER", "Diesel"],
    emi: "₹72,800/mo",
    price: "₹38.60 Lakh",
    isLuxury: true
  },
  {
    image: "https://spn-sta.spinny.com/blog/20220228143125/ezgif.com-gif-maker-2021-11-19T173220.087.jpg",
    title: "2022 Tata Nexon",
    spec: "XZ+ AMT Petrol • 15,200 km",
    tags: ["1ST OWNER", "Automatic"],
    emi: "₹21,200/mo",
    price: "₹11.80 Lakh",
    isCertified: true
  }
];

const FeaturedCars = () => {
  return (
    <section className="py-20 px-4">
      <div className="max-w-7xl mx-auto mb-10 flex items-end justify-between">
        <div>
          <h2 className="text-3xl font-800 mb-2 text-navy dark:text-white">Featured Cars</h2>
          <p className="text-slate-500 dark:text-slate-400">Hand-picked premium cars for you</p>
        </div>
        <a className="text-accent font-bold flex items-center gap-1 hover:underline cursor-pointer" href="#">
          View all 1,200+ cars
          <ArrowRight size={16} />
        </a>
      </div>
      
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cars.map((car, index) => (
          <CarCard key={index} {...car} />
        ))}
      </div>
    </section>
  );
};

export default FeaturedCars;
