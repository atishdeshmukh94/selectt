import React, { useState, useEffect } from 'react';
import { Upload, Send, CheckCircle, Briefcase, MapPin, Clock, X, Loader2 } from 'lucide-react';
import PageMeta from '../components/common/PageMeta';
import { API_URL } from '../config/api';

const DEFAULT_JOBS = [
  { id: 1, title: 'Sales Executive', location: 'Mumbai', job_type: 'Full-time' },
  { id: 2, title: 'Car Evaluator', location: 'Remote / Field', job_type: 'Full-time' },
  { id: 3, title: 'Content Writer', location: 'Remote', job_type: 'Full-time' }
];

const CareersPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [jobs, setJobs] = useState(DEFAULT_JOBS);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showThankYouModal, setShowThankYouModal] = useState(false);
  const [submittedData, setSubmittedData] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    position: '',
    message: ''
  });
  const [file, setFile] = useState(null);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await fetch(`${API_URL}/api/careers/jobs`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data) && json.data.length > 0) {
            setJobs(json.data);
          }
        }
      } catch (err) {
        console.error('Error fetching jobs:', err);
      } finally {
        setLoadingJobs(false);
      }
    };
    fetchJobs();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errorMessage) setErrorMessage('');
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > 10 * 1024 * 1024) {
        alert('File size exceeds 10MB limit. Please choose a smaller file.');
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      alert('Please upload your resume (PDF or DOCX).');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const data = new FormData();
      data.append('fullName', formData.fullName);
      data.append('email', formData.email);
      data.append('phone', formData.phone);
      data.append('position', formData.position);
      data.append('message', formData.message);
      data.append('resume', file);

      const res = await fetch(`${API_URL}/api/careers/apply`, {
        method: 'POST',
        body: data
      });

      const result = await res.json();
      if (res.ok && result.success) {
        setSubmittedData({ ...formData, fileName: file.name });
        setShowThankYouModal(true);
        // Reset form
        setFormData({ fullName: '', email: '', phone: '', position: '', message: '' });
        setFile(null);
      } else {
        setErrorMessage(result.message || 'Failed to submit application. Please try again.');
      }
    } catch (err) {
      console.error('Submission error:', err);
      setErrorMessage('Network error occurred. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <PageMeta
        title="Careers - Join Our Team | Selectt"
        description="Explore job opportunities and join the Selectt team to help build India's premier used car marketplace."
      />
      <div className="min-h-screen bg-slate-50 font-sans pb-20 w-full overflow-x-hidden pt-24">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-14">
            <span className="inline-block px-3 py-1 bg-[#00C9AF]/15 text-[#0A524A] rounded-full text-xs font-bold uppercase tracking-wider mb-3.5">
              Work With Us
            </span>
            <h1 className="text-4xl sm:text-5xl font-black text-[#0C1B33] mb-3.5">Careers at Selectt</h1>
            <p className="text-slate-600 mt-3 max-w-xl mx-auto text-sm sm:text-base">
              Be a part of a fast-growing team shaping the future of transparent and fair automobile buying & selling.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-start">
            {/* Left Info Section */}
            <div className="bg-white rounded-[2rem] p-8 md:p-10 shadow-xl shadow-slate-200/50 border border-slate-100 text-slate-600">
              <h2 className="text-2xl font-bold mb-3.5 text-[#0C1B33]">Join the Revolution</h2>
              <p className="mb-8 leading-relaxed text-sm sm:text-base text-slate-600">
                We are always looking for passionate, driven individuals to join our team and help us build the most trusted and transparent platform for used cars in India.
              </p>

              <div className="flex items-center justify-between mt-8 mb-5">
                <h3 className="font-bold text-[#0C1B33] text-lg flex items-center gap-2">
                  <Briefcase size={18} className="text-[#00C9AF]" /> Current Openings:
                </h3>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#E6FAF7] text-[#0A524A]">
                  {jobs.length} Available
                </span>
              </div>

              <ul className="space-y-3.5">
                {jobs.map((job) => (
                  <li
                    key={job.id}
                    className="flex items-start gap-3.5 p-4 rounded-2xl bg-slate-50/80 hover:bg-[#E6FAF7]/50 border border-slate-100/80 transition-colors"
                  >
                    <div className="w-2.5 h-2.5 rounded-full bg-[#00C9AF] mt-2 shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-[#0C1B33] text-base mb-1.5">{job.title}</h4>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                        <span className="flex items-center gap-1">
                          <MapPin size={12} className="text-slate-400" /> {job.location || 'Mumbai'}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock size={12} className="text-slate-400" /> {job.job_type || 'Full-time'}
                        </span>
                      </div>
                      {job.description && (
                        <p className="text-xs text-slate-500 mt-2 line-clamp-2">{job.description}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>

              <div className="mt-8 pt-5 border-t border-slate-100">
                <p className="text-xs sm:text-sm text-slate-500">
                  Don't see a role that fits your profile? Feel free to apply with <strong>"Other"</strong> as your position and tell us how you can make an impact.
                </p>
              </div>
            </div>

            {/* Right Form Section */}
            <div className="bg-[#0C1B33] rounded-[2rem] p-8 md:p-10 shadow-2xl text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#00C9AF] rounded-full blur-3xl opacity-20 -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>

              <h2 className="text-2xl font-bold mb-3.5 text-white relative z-10">Apply Online</h2>
              <p className="text-xs text-slate-300 mb-8 relative z-10">
                Fill in the details below and upload your CV. Our recruitment team will review your application.
              </p>

              {errorMessage && (
                <div className="mb-4 p-3 rounded-xl bg-red-500/20 border border-red-500/50 text-red-200 text-xs font-medium">
                  {errorMessage}
                </div>
              )}

              <form onSubmit={handleSubmit} className="relative z-10 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Full Name *</label>
                  <input
                    type="text"
                    name="fullName"
                    required
                    className="w-full bg-[#162947] border border-[#2A3E54] rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-[#00C9AF] focus:ring-1 focus:ring-[#00C9AF] transition-colors text-sm"
                    placeholder="e.g. Rahul Sharma"
                    value={formData.fullName}
                    onChange={handleChange}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address *</label>
                    <input
                      type="email"
                      name="email"
                      required
                      className="w-full bg-[#162947] border border-[#2A3E54] rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-[#00C9AF] focus:ring-1 focus:ring-[#00C9AF] transition-colors text-sm"
                      placeholder="yourname@example.com"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Phone Number *</label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      className="w-full bg-[#162947] border border-[#2A3E54] rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-[#00C9AF] focus:ring-1 focus:ring-[#00C9AF] transition-colors text-sm"
                      placeholder="+91 98765 43210"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Position Applying For *</label>
                  <select
                    name="position"
                    required
                    className="w-full bg-[#162947] border border-[#2A3E54] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00C9AF] focus:ring-1 focus:ring-[#00C9AF] transition-colors text-sm cursor-pointer"
                    value={formData.position}
                    onChange={handleChange}
                  >
                    <option value="" disabled className="bg-[#0C1B33] text-slate-400">Select a position</option>
                    {jobs.map((job) => (
                      <option key={job.id} value={job.title} className="bg-[#0C1B33] text-white">
                        {job.title} ({job.location || 'Mumbai'})
                      </option>
                    ))}
                    <option value="Other" className="bg-[#0C1B33] text-white">Other / General Application</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Upload Resume (PDF, DOCX) *</label>
                  <div className="w-full bg-[#162947] border border-[#2A3E54] border-dashed rounded-xl px-4 py-5 text-center hover:border-[#00C9AF] transition-colors cursor-pointer relative group">
                    <input
                      type="file"
                      required={!file}
                      accept=".pdf,.doc,.docx"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                      onChange={handleFileChange}
                    />
                    <div className="flex flex-col items-center gap-1.5 pointer-events-none relative z-10">
                      <div className="w-9 h-9 bg-[#2A3E54] group-hover:bg-[#00C9AF]/20 group-hover:text-[#00C9AF] rounded-full flex items-center justify-center text-slate-300 transition-colors">
                        <Upload size={16} />
                      </div>
                      {file ? (
                        <div className="flex items-center gap-2">
                          <CheckCircle size={14} className="text-[#00C9AF]" />
                          <span className="text-xs text-[#00C9AF] font-bold truncate max-w-[220px]">{file.name}</span>
                          <span className="text-[10px] text-slate-400">({(file.size / (1024 * 1024)).toFixed(2)} MB)</span>
                        </div>
                      ) : (
                        <>
                          <span className="text-xs font-semibold text-white">Click to upload or drag & drop</span>
                          <span className="text-[10px] text-slate-400">PDF, DOC, DOCX up to 10MB</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Cover Letter / Message (Optional)</label>
                  <textarea
                    name="message"
                    rows="3"
                    className="w-full bg-[#162947] border border-[#2A3E54] rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-[#00C9AF] focus:ring-1 focus:ring-[#00C9AF] transition-colors resize-none text-sm"
                    placeholder="Tell us about your experience and why you want to join..."
                    value={formData.message}
                    onChange={handleChange}
                  ></textarea>
                </div>

                {/* Submit button with high-contrast text and glowing hover */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#00C9AF] hover:bg-[#00e3c5] text-[#081325] font-black text-sm sm:text-base py-3.5 px-6 rounded-xl shadow-lg shadow-[#00C9AF]/25 transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2 mt-4 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={18} className="animate-spin text-[#081325]" /> Submitting Application...
                    </>
                  ) : (
                    <>
                      Submit Application <Send size={16} className="text-[#081325]" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Thank You Popup Modal */}
      {showThankYouModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-slate-100 relative text-center transform animate-scale-up">
            <button
              onClick={() => setShowThankYouModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-2 rounded-full hover:bg-slate-100 transition-colors"
            >
              <X size={20} />
            </button>

            <div className="w-16 h-16 bg-[#E6FAF7] text-[#00C9AF] rounded-full flex items-center justify-center mx-auto mb-5 shadow-inner">
              <CheckCircle size={36} className="text-[#00C9AF]" />
            </div>

            <h3 className="text-2xl font-black text-[#0C1B33] mb-2">Application Received!</h3>
            <p className="text-slate-600 text-sm mb-6 leading-relaxed">
              Thank you, <strong className="text-slate-900">{submittedData?.fullName}</strong>! We've received your application for the position of <strong className="text-[#00C9AF]">{submittedData?.position}</strong>.
            </p>

            <div className="bg-slate-50 rounded-2xl p-4 text-left text-xs text-slate-600 mb-6 space-y-2 border border-slate-100">
              <div className="flex justify-between">
                <span className="text-slate-400">Position:</span>
                <span className="font-semibold text-slate-800">{submittedData?.position}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Email:</span>
                <span className="font-semibold text-slate-800">{submittedData?.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Resume:</span>
                <span className="font-semibold text-slate-800 truncate max-w-[180px]">{submittedData?.fileName}</span>
              </div>
            </div>

            <p className="text-xs text-slate-500 mb-6">
              Our recruitment team will review your profile and reach out to you within 2–3 business days.
            </p>

            <button
              onClick={() => setShowThankYouModal(false)}
              className="w-full py-3.5 bg-[#0C1B33] hover:bg-[#162947] text-white font-bold rounded-xl text-sm transition-colors shadow-lg"
            >
              Done / Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default CareersPage;
