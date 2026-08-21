import React, { useEffect } from 'react';
import { MapPin, Phone, Mail, Clock, Instagram, Facebook, Youtube, Send } from 'lucide-react';
import PageMeta from '../components/common/PageMeta';

const ContactUsPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <PageMeta title="Contact Us - Get in Touch | Selectt" description="Have questions about buying or selling a car? Contact the Selectt support team." />
      <div className="min-h-screen bg-slate-50 font-sans pb-20 w-full overflow-x-hidden">
        {/* Premium Hero Section */}
        <section className="relative pt-24 pb-28 border-b border-slate-800">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0c1b33] via-[#0a162a] to-[#060d19] z-0"></div>
          <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] z-0"></div>

          {/* Decorative blur orbs */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#00C9AF] rounded-full mix-blend-screen filter blur-[120px] opacity-35 animate-pulse z-0"></div>
          <div className="absolute bottom-0 left-10 w-72 h-72 bg-purple-600 rounded-full mix-blend-screen filter blur-[100px] opacity-20 z-0"></div>

          <div className="max-w-4xl mx-auto px-4 relative z-10 text-center text-white">
            <h1 className="text-4xl md:text-5xl font-black mb-6">Get in Touch</h1>
            <p className="text-slate-300 text-base md:text-lg font-medium max-w-2xl mx-auto leading-relaxed">
              Have questions about buying, selling, or our loan process? Our team is here to help you every step of the way.
            </p>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 -mt-10 relative z-20">
          <div className="grid lg:grid-cols-3 gap-8">

            {/* Contact Information Cards */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden group hover:-translate-y-1 transition-transform">
                <div className="w-12 h-12 bg-red-50 text-[#00C9AF] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <MapPin size={24} />
                </div>
                <h3 className="text-lg font-bold text-[#0C1B33] mb-2">Visit Us</h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-4">
                  Techno It Park, Eksar Village,<br />
                  Eksar, Borivali West,<br />
                  Mumbai, Maharashtra 400091
                </p>
                <a href="https://maps.google.com/?q=Techno+It+Park,+Borivali+West,+Mumbai" target="_blank" rel="noreferrer" className="text-[#00C9AF] text-sm font-bold flex items-center gap-1 hover:text-[#0C1B33] transition-colors">
                  Get Directions <Send size={14} />
                </a>
              </div>

              <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden group hover:-translate-y-1 transition-transform">
                <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Phone size={24} />
                </div>
                <h3 className="text-lg font-bold text-[#0C1B33] mb-2">Call Us</h3>
                <p className="text-slate-500 text-sm mb-1">Sales & Support</p>
                <a href="tel:+918574667466" className="text-xl font-black text-[#0C1B33] hover:text-blue-600 transition-colors block mb-4">
                  +91 85746 67466
                </a>
                <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
                  <Clock size={14} /> Mon-Sun, 9AM to 8PM
                </div>
              </div>

              <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden group hover:-translate-y-1 transition-transform">
                <div className="w-12 h-12 bg-purple-50 text-purple-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Mail size={24} />
                </div>
                <h3 className="text-lg font-bold text-[#0C1B33] mb-2">Email Us</h3>
                <a href="mailto:support@selecttcars.com" className="text-[#0C1B33] font-bold hover:text-purple-600 transition-colors block">
                  support@selecttcars.com
                </a>
              </div>
            </div>

            {/* Social Media & Map */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100">
                <h3 className="text-2xl font-black text-[#0C1B33] mb-6">Connect with us online</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <a href="https://www.instagram.com/selectt_cars/" target="_blank" rel="noreferrer" className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 hover:border-pink-200 hover:bg-pink-50 transition-colors group">
                    <div className="w-10 h-10 bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-500 rounded-full flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                      <Instagram size={20} />
                    </div>
                    <div>
                      <div className="font-bold text-[#0C1B33]">Instagram</div>
                      <div className="text-xs text-slate-500">@selectt_cars</div>
                    </div>
                  </a>
                  <a href="#" className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50 transition-colors group">
                    <div className="w-10 h-10 bg-[#1877F2] rounded-full flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                      <Facebook size={20} />
                    </div>
                    <div>
                      <div className="font-bold text-[#0C1B33]">Facebook</div>
                      <div className="text-xs text-slate-500">Join our community</div>
                    </div>
                  </a>
                  <a href="#" className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 hover:border-red-200 hover:bg-red-50 transition-colors group">
                    <div className="w-10 h-10 bg-[#FF0000] rounded-full flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                      <Youtube size={20} />
                    </div>
                    <div>
                      <div className="font-bold text-[#0C1B33]">YouTube</div>
                      <div className="text-xs text-slate-500">Watch our reviews</div>
                    </div>
                  </a>
                </div>
              </div>

              <div className="bg-slate-200 rounded-[2rem] overflow-hidden shadow-xl shadow-slate-200/50 border border-slate-100 h-[400px]">
                {/* Embed Google Maps */}
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3718.518934921303!2d81.6249335!3d21.250916699999998!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a28ddc706886a21%3A0x3427ad396965afa5!2sWEPNEX!5e0!3m2!1sen!2sin!4v1772273391007!5m2!1sen!2sin"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  title="Selectt Cars Location"
                ></iframe>
              </div>
            </div>

          </div>
        </section>
      </div>
    </>
  );
};

export default ContactUsPage;
