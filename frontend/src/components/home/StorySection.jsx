import React from 'react';
import { ChevronLeft, ChevronRight, User, Play, VolumeX } from 'lucide-react';

const stories = [
  {
    image: '/img/selectt-benefits-1.webp',
    name: 'Ayush Srivastava',
    location: 'Lucknow',
    testimony: "Our first car that we'd truly love for years to come."
  },
  {
    image: '/img/selectt-benefits-2.webp',
    name: 'Darshan',
    location: 'Delhi',
    testimony: 'Our family had our hearts set on XUV 700. So, when we saw it on Selectt, we just got it home.'
  },
  {
    image: '/img/selectt-benefits-3.webp',
    name: 'Manu Rasho',
    location: 'Bengaluru',
    testimony: "Our car looks like a new car, feels like a new car and drives like one. The smile on our daughters' faces has made the decision worth it."
  },
  {
    image: '/img/about-us-mission.webp',
    name: 'Priya Sharma',
    location: 'Mumbai',
    testimony: 'Found the perfect hatchback within my budget. The infinite options made it so easy!'
  }
];

const StorySection = () => {
  return (
    <section className="bg-[#00C9AF]/90 py-12 md:py-20 px-4 relative overflow-hidden">
      {/* Section Header */}
      <div className="max-w-7xl mx-auto flex items-end justify-between mb-8 px-4 md:px-0">
        <div>
          <h2 className="text-3xl font-bold text-[#fff] mb-2 flex items-center">
            What Motivates Us
          </h2>
          <p className="text-[#fff] text-sm">Real stories from 1M+ happy car buyers across India</p>
        </div>
        <div className="hidden md:flex gap-3">
          <button className="w-12 h-12 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-[#0C1B33] hover:border-slate-300 transition-all shadow-sm bg-white">
            <ChevronLeft size={24} className="opacity-60" />
          </button>
          <button className="w-12 h-12 rounded-full border border-slate-200 flex items-center justify-center text-[#00C9AF] hover:border-[#00C9AF] transition-all shadow-sm bg-white">
            <ChevronRight size={24} />
          </button>
        </div>
      </div>

      {/* Stories Carousel/Grid */}
      <div className="max-w-7xl mx-auto relative group">
        <div className="flex md:grid md:grid-cols-2 lg:grid-cols-4 gap-6 overflow-x-auto md:overflow-visible hide-scrollbar snap-x snap-mandatory px-4 md:px-0">
          {stories.map((story, idx) => (
            <div
              key={idx}
              className="relative min-w-[300px] md:min-w-0 h-[500px] rounded-[2rem] overflow-hidden shadow-md transition-transform hover:-translate-y-1 cursor-pointer snap-center group"
            >
              {/* Background Image */}
              <img
                src={story.image}
                alt={story.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />

              {/* Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0C1B33]/90 via-[#0C1B33]/20 to-[#0C1B33]/10"></div>

              {/* Top Badges */}
              <div className="absolute top-5 left-5 right-5 flex justify-between items-start">
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md py-1.5 px-3 rounded-full">
                  <div className="w-5 h-5 bg-[#00C9AF] rounded-full flex items-center justify-center text-[10px] text-[#0A1C3A] font-black">C</div>
                  <span className="text-white text-xs font-bold tracking-wide">myselectt</span>
                </div>

                <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white/90">
                  <VolumeX size={14} />
                </div>
              </div>

              {/* Play Button */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white group-hover:bg-white/40 transition-all border border-white/20 shadow-lg cursor-pointer">
                <Play size={24} className="fill-white translate-x-0.5" />
              </div>

              {/* Bottom Content */}
              <div className="absolute bottom-6 left-6 right-6 text-white text-left">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-[#00C9AF] rounded-xl flex items-center justify-center shrink-0">
                    <User size={20} className="text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-sm tracking-tight">{story.name} | <span className="font-semibold">{story.location}</span></p>
                  </div>
                </div>
                <p className="text-sm leading-relaxed text-[#f9f9f9] line-clamp-3 italic font-medium">
                  "{story.testimony}"
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StorySection;

