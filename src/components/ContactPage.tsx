import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2, MessageSquare, Headphones, Award, Sparkles } from 'lucide-react';
import SEO from './SEO';
import { getGlobalConfig } from '../services/dbService';
import { ContactConfig } from '../types';

export const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    institution: '',
    category: 'admission',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [contactInfo, setContactInfo] = useState<ContactConfig>({
    email: 'support@campusai.com.ng',
    whatsapp: '+234 802 764 1663',
    address: 'FUTA Tech Park, Akure, Ondo State, Nigeria',
    supportHours: 'Mon – Sat: 8:00 AM – 6:00 PM WAT'
  });

  useEffect(() => {
    const fetchConfig = async () => {
      const config = await getGlobalConfig();
      if (config && config.contact) {
        setContactInfo(config.contact);
      }
    };
    fetchConfig();
  }, []);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      alert('Please fill in all required fields.');
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      // Also save to localStorage inquiries log
      const inquiries = JSON.parse(localStorage.getItem('campusai_inquiries') || '[]');
      inquiries.push({ ...formData, id: `inq-${Date.now()}`, date: new Date().toISOString() });
      localStorage.setItem('campusai_inquiries', JSON.stringify(inquiries));
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-24 transition-colors">
      <SEO 
        title="Contact Us | CampusAI Command Desk & Support" 
        description="Get in touch with CampusAI Nigeria support, admission strategists, and technical command desk for assistance." 
      />

      <div className="max-w-7xl mx-auto px-4 md:px-8">
        
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-purple-100 dark:border-purple-800">
            <Headphones size={12} />
            Command Desk & Support Center
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight">
            Get in Touch With <span className="text-purple-600 dark:text-purple-400">CampusAI</span>
          </h1>
          <p className="text-gray-500 dark:text-slate-300 font-medium text-base">
            Have questions about JAMB caps, aggregate calculations, CGPA tracking, or premium scholar packs? Our Akure and Lagos support desks are ready to assist you.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Contact Info Cards */}
          <div className="lg:col-span-1 space-y-6">
            
            <div className="bg-white dark:bg-gray-900 p-8 rounded-[32px] border border-gray-200 dark:border-gray-800 shadow-sm space-y-6">
              <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                <MessageSquare className="text-purple-600" size={20} />
                Direct Channels
              </h3>

              <div className="space-y-4">
                <a 
                  href={`mailto:${contactInfo.email}`}
                  className="flex items-start gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                    <Mail size={18} />
                  </div>
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-gray-400">Official Email</div>
                    <div className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-purple-600 transition-colors">{contactInfo.email}</div>
                  </div>
                </a>

                <a 
                  href={`https://wa.me/${contactInfo.whatsapp.replace(/\D/g, '')}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-start gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <Phone size={18} />
                  </div>
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-gray-400">WhatsApp Hotline</div>
                    <div className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-emerald-600 transition-colors">{contactInfo.whatsapp}</div>
                  </div>
                </a>

                <div className="flex items-start gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-gray-400">Primary Hub</div>
                    <div className="text-sm font-bold text-gray-900 dark:text-white">{contactInfo.address}</div>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                    <Clock size={18} />
                  </div>
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-gray-400">Support Hours</div>
                    <div className="text-sm font-bold text-gray-900 dark:text-white">{contactInfo.supportHours}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 bg-gradient-to-br from-purple-900 to-indigo-900 text-white rounded-[32px] shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
              <Sparkles className="text-purple-300 mb-4" size={24} />
              <h4 className="font-black text-lg uppercase tracking-tight mb-2">Need Instant Answers?</h4>
              <p className="text-xs text-purple-200 font-medium leading-relaxed mb-6">
                Our AI Admission Strategist is trained on 2026 JAMB guidelines, cutoffs, and university requirements. Open the AI Chat drawer anytime for instant answers.
              </p>
              <button 
                onClick={() => window.dispatchEvent(new CustomEvent('campusai_open_chat'))}
                className="w-full py-3 bg-white text-purple-900 rounded-2xl font-black text-xs uppercase tracking-wider hover:bg-purple-50 transition-all shadow-md"
              >
                Launch AI Strategist
              </button>
            </div>

          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-900 p-8 md:p-12 rounded-[32px] border border-gray-200 dark:border-gray-800 shadow-sm">
            {submitted ? (
              <div className="py-16 text-center space-y-6">
                <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-xl">
                  <CheckCircle2 size={40} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-gray-900 dark:text-white">Message Received Successfully!</h3>
                  <p className="text-gray-500 dark:text-slate-300 text-sm max-w-md mx-auto font-medium">
                    Thank you for reaching out to CampusAI Command Desk. A support specialist or admission strategist has received your inquiry and will respond within 2-4 hours.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({ name: '', email: '', phone: '', institution: '', category: 'admission', message: '' });
                  }}
                  className="px-6 py-3 bg-purple-600 text-white rounded-2xl text-xs font-bold uppercase tracking-wider shadow-md hover:bg-purple-700 transition-all"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight mb-1">Send a Support Ticket</h3>
                  <p className="text-xs text-gray-500 dark:text-slate-300 font-medium">Fill out the form below and our team will get back to you promptly.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Oluwaseun Adeleke"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-xs text-gray-900 dark:text-white font-medium outline-none focus:border-purple-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. seun@gmail.com"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-xs text-gray-900 dark:text-white font-medium outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Phone Number / WhatsApp</label>
                    <input
                      type="tel"
                      placeholder="e.g. +234 801 234 5678"
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-xs text-gray-900 dark:text-white font-medium outline-none focus:border-purple-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Target Institution / University</label>
                    <input
                      type="text"
                      placeholder="e.g. University of Lagos (UNILAG)"
                      value={formData.institution}
                      onChange={e => setFormData({ ...formData, institution: e.target.value })}
                      className="w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-xs text-gray-900 dark:text-white font-medium outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Inquiry Category</label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-xs text-gray-900 dark:text-white font-medium outline-none focus:border-purple-500"
                  >
                    <option value="admission">Admission & Cutoff Inquiry</option>
                    <option value="calculator">Aggregate / CGPA Calculator Support</option>
                    <option value="scholar">Scholar Pack & Premium Access</option>
                    <option value="technical">Technical Issue / Bug Report</option>
                    <option value="partnership">Institutional Partnership</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Your Message *</label>
                  <textarea
                    required
                    rows={5}
                    placeholder="Describe your question or issue in detail..."
                    value={formData.message}
                    onChange={e => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-xs text-gray-900 dark:text-white font-medium outline-none focus:border-purple-500 resize-none"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-bold text-xs uppercase tracking-wider shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Submitting Ticket...</span>
                  ) : (
                    <>
                      <Send size={16} />
                      <span>Submit Support Ticket</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};

export default ContactPage;
