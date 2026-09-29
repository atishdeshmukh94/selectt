import React from 'react';
import Hero from '../components/home/Hero';
import RecentlyViewed from '../components/home/RecentlyViewed';
import BrandExplorer from '../components/home/BrandExplorer';
import BodyTypeFilter from '../components/home/BodyTypeFilter';
import Stats from '../components/home/Stats';
import Testimonials from '../components/home/Testimonials';
import BlogSection from '../components/home/BlogSection';
import StepsSection from '../components/home/StepsSection';
import PromoSection from '../components/home/PromoSection';
import FAQ from '../components/home/FAQ';
import BuySellSection from '../components/home/BuySellSection';
import SectionDivider from '../components/common/SectionDivider';
import MobileHomeLayout from '../components/home/MobileHomeLayout';
import Reveal from '../components/common/Reveal';
import PageMeta from '../components/common/PageMeta';

const Home = () => {
  return (
    <>
      <PageMeta title="Buy & Sell Certified Used Cars | Selectt" description="India's most trusted marketplace to buy and sell certified used cars with warranty and free inspection." />
      {/* Mobile Layout */}
      <div className="block md:hidden">
        <MobileHomeLayout />
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:block">
        <Reveal delay={0.1}>
          <Hero />
        </Reveal>
        
        <Reveal>
          <BuySellSection style={{ backgroundColor: '#F5F5F5' }} />
        </Reveal>
        
        <Reveal>
          <RecentlyViewed />
        </Reveal>
        
        <Reveal>
          <SectionDivider title="Explore Popular Brands" />
          <BrandExplorer />
        </Reveal>
        
        <Reveal>
          <SectionDivider title="How Selectt Works" />
          <StepsSection />
        </Reveal>
        
        <Reveal>
          <SectionDivider title="Explore by Body Type" />
          <BodyTypeFilter />
        </Reveal>
        
        <Reveal>
          <SectionDivider title="Insights That Drive Us" />
          <Stats />
        </Reveal>
        
        <Reveal>
          <SectionDivider title="What Motivates Us" align="left" maxWidthClass="max-w-[1400px]" />
          <Testimonials />
        </Reveal>
        
        <Reveal>
          <SectionDivider title="Latest from Our Blog" align="left" />
          <BlogSection />
        </Reveal>
        
        <Reveal>
          <PromoSection />
        </Reveal>
        
        <Reveal>
          <FAQ />
        </Reveal>
      </div>
    </>
  );
};

export default Home;
