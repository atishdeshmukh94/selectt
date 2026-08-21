import React, { useState, useEffect } from 'react';
import { Upload, Send } from 'lucide-react';
import PageMeta from '../components/common/PageMeta';

const CareersPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    position: '',
    message: ''
  });
  const [file, setFile] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate form submission
    console.log('Form submitted:', formData, file);
    alert('Thank you for your application! We will review it and get back to you soon.');
    // Reset form
    setFormData({ fullName: '', email: '', phone: '', position: '', message: '' });
    setFile(null);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <>
      <PageMeta title="Careers - Join Our Team | Selectt" description="Explore job opportunities and join the Selectt team to help revolutionize the pre-owned car buying and selling experience in India." />
      <div className="min-h-screen bg-slate-50 font-sans pb-20 w-full overflow-x-hidden pt-24">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-4xl font-black text-[#0C1B33] mb-8 text-center">Careers at Selectt</h1>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Info Section */}
            <div className="bg-white rounded-[2rem] p-8 md:p-12 shadow-xl shadow-slate-200/50 border border-slate-100 text-slate-600 h-fit">
              <h2 className="text-2xl font-bold mb-4 text-[#0C1B33]">Join the Revolution</h2>
              <p className="mb-6 leading-relaxed">
                We are always looking for passionate, driven individuals to join our team and help us build the most trusted and transparent platform for used cars in India.
              </p>
              <h3 className="font-bold text-[#0C1B33] text-lg mt-8 mb-4">Current Openings:</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#00C9AF] mt-2 shrink-0"></div>
                  <div>
                    <h4 className="font-bold text-[#0C1B33]">Sales Executive</h4>
                    <span className="text-sm text-slate-500">Mumbai • Full-time</span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#00C9AF] mt-2 shrink-0"></div>
                  <div>
                    <h4 className="font-bold text-[#0C1B33]">Car Evaluator</h4>
                    <span className="text-sm text-slate-500">Remote / Field • Full-time</span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#00C9AF] mt-2 shrink-0"></div>
                  <div>
                    <h4 className="font-bold text-[#0C1B33]">Content Writer</h4>
                    <span className="text-sm text-slate-500">Remote • Full-time</span>
                  </div>
                </li>
              </ul>

              <div className="mt-10 pt-6 border-t border-slate-100">
                <p className="text-sm text-slate-500">If you don't see a role that fits but still want to join us, feel free to apply with "Other" as the position.</p>
              </div>
            </div>

            {/* Form Section */}
            <div className="bg-[#0C1B33] rounded-[2rem] p-8 md:p-12 shadow-2xl text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#00C9AF] rounded-full blur-3xl opacity-20 -translate-y-1/2 translate-x-1/3"></div>

              <h2 className="text-2xl font-bold mb-6 text-white relative z-10">Apply Online</h2>

              <form onSubmit={handleSubmit} className="relative z-10 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-1.5">Full Name *</label>
                  <input
                    type="text"
                    name="fullName"
                    required
                    className="w-full bg-[#162947] border border-[#2A3E54] rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-[#00C9AF] focus:ring-1 focus:ring-[#00C9AF] transition-colors"
                    placeholder="Your Full Name"
                    value={formData.fullName}
                    onChange={handleChange}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-1.5">Email Address *</label>
                    <input
                      type="email"
                      name="email"
                      required
                      className="w-full bg-[#162947] border border-[#2A3E54] rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-[#00C9AF] focus:ring-1 focus:ring-[#00C9AF] transition-colors"
                      placeholder="yourname@example.com"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-1.5">Phone Number *</label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      className="w-full bg-[#162947] border border-[#2A3E54] rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-[#00C9AF] focus:ring-1 focus:ring-[#00C9AF] transition-colors"
                      placeholder="+91 98765 43210"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-1.5">Position Applying For *</label>
                  <select
                    name="position"
                    required
                    className="w-full bg-[#162947] border border-[#2A3E54] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00C9AF] focus:ring-1 focus:ring-[#00C9AF] transition-colors appearance-none"
                    value={formData.position}
                    onChange={handleChange}
                  >
                    <option value="" disabled>Select a position</option>
                    <option value="Sales Executive">Sales Executive</option>
                    <option value="Marketing Executive">Marketing Executive</option>
                    <option value="Content Writer">Content Writer</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-1.5">Upload Resume (PDF, DOCX) *</label>
                  <div className="w-full bg-[#162947] border border-[#2A3E54] border-dashed rounded-xl px-4 py-6 text-center hover:border-[#00C9AF] transition-colors cursor-pointer relative">
                    <input
                      type="file"
                      required
                      accept=".pdf,.doc,.docx"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      onChange={(e) => setFile(e.target.files[0])}
                    />
                    <div className="flex flex-col items-center gap-2 pointer-events-none">
                      <div className="w-10 h-10 bg-[#2A3E54] rounded-full flex items-center justify-center text-slate-300">
                        <Upload size={18} />
                      </div>
                      {file ? (
                        <span className="text-sm text-green-400 font-medium">{file.name}</span>
                      ) : (
                        <>
                          <span className="text-sm font-semibold text-white">Click to upload or drag and drop</span>
                          <span className="text-xs text-slate-400">Max file size 5MB</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-1.5">Cover Letter / Message</label>
                  <textarea
                    name="message"
                    rows="3"
                    className="w-full bg-[#162947] border border-[#2A3E54] rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-[#00C9AF] focus:ring-1 focus:ring-[#00C9AF] transition-colors resize-none"
                    placeholder="Tell us why you'd be a great fit..."
                    value={formData.message}
                    onChange={handleChange}
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#00C9AF] hover:bg-[#0C1B33] text-[#0A1C3A] font-bold py-4 px-6 rounded-xl shadow-lg shadow-[#00C9AF]/10 transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-4"
                >
                  Submit Application <Send size={18} />
                </button>
              </form>
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default CareersPage;

