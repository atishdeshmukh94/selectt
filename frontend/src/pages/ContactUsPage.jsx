import React, { useEffect, useState } from 'react';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Instagram,
  Facebook,
  Youtube,
  Send,
  CheckCircle2,
  Headphones,
  ShieldCheck,
  MessageSquareText,
  Building2,
  ArrowRight
} from 'lucide-react';
import PageMeta from '../components/common/PageMeta';

const ContactUsPage = () => {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'General Inquiry',
    message: ''
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormSubmitted(true);
  };

  return (
    <>
      <PageMeta
        title="Contact Us - Get in Touch with Selectt Support | Selectt"
        description="Have questions about buying, selling, or car financing? Contact the Selectt dedicated support team via phone, email, or visit our experience centers."
      />

      <div className="min-h-screen bg-[#F8FAFC] font-sans pb-20 w-full overflow-x-hidden text-slate-800 antialiased selection:bg-[#00C9AF]/20 selection:text-[#0C1B33]">
        
        {/* ───────────── Hero Header ───────────── */}
        <section className="relative pt-20 pb-20 bg-[#0C1B33] border-b border-slate-800 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0c1b33] via-[#0a162a] to-[#060d19] z-0"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#00C9AF] rounded-full mix-blend-screen filter blur-[140px] opacity-25 animate-pulse z-0"></div>
          <div className="absolute bottom-0 left-10 w-80 h-80 bg-purple-600 rounded-full mix-blend-screen filter blur-[120px] opacity-20 z-0"></div>

          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#00C9AF]/15 text-[#00C9AF] border border-[#00C9AF]/20 w-fit mx-auto">
              <Headphones size={13} /> We're Here to Help
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Get in touch with our team
            </h1>
            <p className="text-slate-300 text-sm sm:text-base font-normal max-w-xl mx-auto leading-relaxed">
              Have questions about vehicle verification, test drives, financing, or selling your car? Our dedicated advisors are available 7 days a week.
            </p>
          </div>
        </section>

        {/* ───────────── 3 Quick Contact Channel Cards ───────────── */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            
            {/* Phone Card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs text-left space-y-3 hover:border-slate-300 transition-all">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#00a892] flex items-center justify-center border border-teal-100">
                <Phone size={18} />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Direct Helpline</span>
                <h3 className="text-lg font-bold text-slate-900 mt-0.5">+91 85746 67466</h3>
              </div>
              <p className="text-slate-500 text-xs font-normal">
                Available Monday to Sunday, 9:00 AM to 8:00 PM for instant call support.
              </p>
            </div>

            {/* Email Card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs text-left space-y-3 hover:border-slate-300 transition-all">
              <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100">
                <Mail size={18} />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Email Inquiries</span>
                <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                  <a href="mailto:hello@selectt.in" className="hover:text-[#00C9AF] transition-colors">
                    hello@selectt.in
                  </a>
                </h3>
              </div>
              <p className="text-slate-500 text-xs font-normal">
                Our support desk typically responds to all inquiries within 2 business hours.
              </p>
            </div>

            {/* Location Card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs text-left space-y-3 hover:border-slate-300 transition-all">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
                <Building2 size={18} />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Corporate HQ</span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">Techno IT Park, Borivali West</h3>
              </div>
              <p className="text-slate-500 text-xs font-normal">
                Eksar Village, Borivali West, Mumbai, Maharashtra 400091
              </p>
            </div>

          </div>
        </section>

        {/* ───────────── Main Form & Location Embed ───────────── */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            {/* Left Column: Interactive Contact Form */}
            <div className="lg:col-span-6 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-xs text-left">
              <div className="mb-6">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#00a892]">Send a Message</span>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-0.5">
                  How can we help you today?
                </h2>
                <p className="text-slate-500 text-xs font-normal mt-1">
                  Leave your details and our team will get in touch directly.
                </p>
              </div>

              {formSubmitted ? (
                <div className="py-12 text-center space-y-3.5">
                  <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto border border-emerald-100">
                    <CheckCircle2 size={24} />
                  </div>
                  <h4 className="font-bold text-slate-900 text-base">Message Sent Successfully!</h4>
                  <p className="text-slate-500 text-xs font-normal leading-relaxed max-w-xs mx-auto">
                    Thank you for reaching out. A dedicated customer advisor will respond to your query shortly.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Sharma"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3.5 py-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:border-[#00C9AF] focus:ring-2 focus:ring-[#00C9AF]/10 focus:outline-none bg-slate-50/50"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                        Email Address
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="e.g. rahul@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-3.5 py-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:border-[#00C9AF] focus:ring-2 focus:ring-[#00C9AF]/10 focus:outline-none bg-slate-50/50"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="e.g. 98765 43210"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-3.5 py-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:border-[#00C9AF] focus:ring-2 focus:ring-[#00C9AF]/10 focus:outline-none bg-slate-50/50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                      Inquiry Topic
                    </label>
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-3.5 py-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:border-[#00C9AF] focus:ring-2 focus:ring-[#00C9AF]/10 focus:outline-none bg-slate-50/50"
                    >
                      <option value="Buying a Car">Buying a Certified Pre-Owned Car</option>
                      <option value="Selling a Car">Selling or Valuating My Car</option>
                      <option value="Used Car Loan">Car Loan & Financing Inquiry</option>
                      <option value="Car Insurance">Insurance Renewal & Claims</option>
                      <option value="E-Challan">E-Challan Clearance Assistance</option>
                      <option value="Partnership">Dealer Partnership Network</option>
                      <option value="General Inquiry">Other Support Inquiry</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                      Your Message
                    </label>
                    <textarea
                      rows={4}
                      required
                      placeholder="Please write your questions or vehicle requirements here..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-3.5 py-3 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:border-[#00C9AF] focus:ring-2 focus:ring-[#00C9AF]/10 focus:outline-none bg-slate-50/50 resize-none"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 bg-[#00C9AF] hover:bg-[#00b29c] text-[#0C1B33] font-bold rounded-xl shadow-xs transition-all text-xs uppercase tracking-wider cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Send Message</span>
                    <Send size={13} />
                  </button>
                </form>
              )}
            </div>

            {/* Right Column: Social Channels & Map Embed */}
            <div className="lg:col-span-6 space-y-6 text-left">
              
              {/* Official Social Links */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Social Channels</span>
                <h3 className="text-base font-bold text-slate-900">Follow Selectt on Social Media</h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <a
                    href="https://www.youtube.com/@selecttcars"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 p-3 rounded-xl border border-slate-200/80 hover:border-red-200 hover:bg-red-50/40 transition-colors group"
                  >
                    <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center text-white shrink-0">
                      <Youtube size={16} />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-slate-900">YouTube</div>
                      <div className="text-[10px] text-slate-400">@selecttcars</div>
                    </div>
                  </a>

                  <a
                    href="https://www.instagram.com/selectt.cars/"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 p-3 rounded-xl border border-slate-200/80 hover:border-pink-200 hover:bg-pink-50/40 transition-colors group"
                  >
                    <div className="w-8 h-8 bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-600 rounded-lg flex items-center justify-center text-white shrink-0">
                      <Instagram size={16} />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-slate-900">Instagram</div>
                      <div className="text-[10px] text-slate-400">@selectt.cars</div>
                    </div>
                  </a>

                  <a
                    href="https://www.facebook.com/selectt.cars"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 p-3 rounded-xl border border-slate-200/80 hover:border-blue-200 hover:bg-blue-50/40 transition-colors group"
                  >
                    <div className="w-8 h-8 bg-[#1877F2] rounded-lg flex items-center justify-center text-white shrink-0">
                      <Facebook size={16} />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-slate-900">Facebook</div>
                      <div className="text-[10px] text-slate-400">@selectt.cars</div>
                    </div>
                  </a>
                </div>
              </div>

              {/* Google Maps Embed */}
              <div className="bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-xs h-[320px]">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3816.0104434779314!2d72.84024937526559!3d19.240511081998196!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7b1225805846b%3A0x41b6768c541beaf8!2sTechno%20It%20Park%2C%20Eksar%20Village%2C%20Eksar%2C%20Borivali%2C%20Mumbai%2C%20Maharashtra%20400091!5e1!3m2!1sen!2sin!4v1790604300027!5m2!1sen!2sin"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="strict-origin-when-cross-origin"
                  title="Selectt Corporate Location"
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

