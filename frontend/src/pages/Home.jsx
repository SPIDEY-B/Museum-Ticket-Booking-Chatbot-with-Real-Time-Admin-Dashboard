import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar, Ticket, QrCode, Users, ArrowRight, Building2,
  MapPin, IndianRupee, Sparkles, Star, Clock, Shield, Globe2, UserPlus
} from 'lucide-react';
import { museumAPI } from '../services/api';
import toast from 'react-hot-toast';

const Home = () => {
  const [museums, setMuseums]   = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => { fetchMuseums(); }, []);

  const fetchMuseums = async () => {
    try {
      // api interceptor already unwraps response.data → returns ApiResponse<List<Museum>>
      // ApiResponse shape: { success, message, data }
      const res = await museumAPI.getAll();
      const list = res?.data ?? res ?? [];
      setMuseums(Array.isArray(list) ? list : []);
    } catch {
      toast.error('Failed to fetch museums');
      setMuseums([]);
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: Ticket,   title: 'Instant Booking',    desc: 'Book tickets in seconds via our button-driven chatbot — no typing required', color: 'from-blue-500 to-blue-600' },
    { icon: QrCode,   title: 'QR Entry',            desc: 'Scan museum QR code to open chatbot and book instantly from your phone',      color: 'from-purple-500 to-purple-600' },
    { icon: Calendar, title: 'Special Shows',        desc: 'Book exclusive events and exhibitions added by museum admins in real-time',    color: 'from-pink-500 to-pink-600' },
    { icon: Users,    title: 'Group Booking',        desc: 'Book adult + children tickets together with live total price preview',         color: 'from-green-500 to-green-600' },
    { icon: Shield,   title: 'Secure & No-Scanner', desc: 'Staff PIN validation — no hardware scanners needed at entry gates',            color: 'from-orange-500 to-orange-600' },
    { icon: Globe2,   title: 'Multi-Museum',         desc: 'One platform for all registered museums — manage from a single dashboard',     color: 'from-indigo-500 to-indigo-600' },
  ];

  const adultPrice = (m) => m.adultPrice ?? m.adultTicketPrice ?? 0;
  const childPrice = (m) => m.childPrice ?? m.childTicketPrice ?? 0;

  return (
    <div className="min-h-screen">

      {/* ── HERO ── */}
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 animated-gradient" />

        {/* Floating dots */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(18)].map((_, i) => (
            <div key={i} className="absolute animate-float"
              style={{
                left: `${5 + Math.random() * 90}%`,
                top:  `${5 + Math.random() * 90}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${3 + Math.random() * 5}s`,
              }}>
              <div className="w-3 h-3 bg-white/10 rounded-full backdrop-blur-sm" />
            </div>
          ))}
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-white mb-8">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-semibold">The future of museum ticketing is here</span>
          </div>

          <h1 className="text-6xl md:text-7xl font-extrabold text-white mb-6 leading-tight">
            Discover & Book
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-pink-300">
              Museum Experiences
            </span>
          </h1>

          <p className="text-xl text-white/90 mb-12 max-w-3xl mx-auto">
            Scan. Tap. Enter. Book museum tickets in seconds via chatbot — no queues, no paper tickets, no scanners.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/register-museum"
              className="group relative px-8 py-4 bg-white text-indigo-700 rounded-2xl font-bold hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 overflow-hidden">
              <span className="relative z-10 flex items-center justify-center gap-2">
                <Building2 className="h-5 w-5" />
                Register Your Museum
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-50 to-purple-50 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
            </Link>
            <a href="#museums"
              className="px-8 py-4 bg-white/20 backdrop-blur-md border-2 border-white text-white rounded-2xl font-bold hover:bg-white/30 transform hover:-translate-y-1 transition-all duration-300">
              <span className="flex items-center justify-center gap-2">
                <Star className="h-5 w-5" /> Explore Museums
              </span>
            </a>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20">
            {[
              { value: museums.length || '—', label: 'Live Museums',      icon: Building2 },
              { value: '10,000+',              label: 'Visitors Served',   icon: Users     },
              { value: '100%',                 label: 'Paperless',         icon: QrCode    },
              { value: '0',                    label: 'Hardware Needed',   icon: Shield    },
            ].map((s, i) => (
              <div key={i} className="text-center group">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md text-white mb-3 group-hover:scale-110 transition-transform">
                  <s.icon className="h-6 w-6" />
                </div>
                <div className="text-3xl font-extrabold text-white mb-1">{s.value}</div>
                <div className="text-sm text-white/80">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Wave */}
        <div className="absolute bottom-0 left-0 w-full">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120" className="w-full h-auto">
            <path fill="#fff" fillOpacity="1"
              d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L0,120Z" />
          </svg>
        </div>
      </div>

      {/* ── FEATURES ── */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Why MuseumQR?</h2>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto">
              Everything a modern museum needs — no complex setups, no scanners, just a QR code.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <div key={i}
                className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden border border-gray-100">
                <div className={`absolute inset-0 bg-gradient-to-br ${f.color} opacity-0 group-hover:opacity-5 transition-opacity`} />
                <div className="relative p-8">
                  <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br ${f.color} text-white mb-5 group-hover:scale-110 transition-transform`}>
                    <f.icon className="h-7 w-7" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{f.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── HOW IT WORKS ── */}
      <div className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-extrabold text-gray-900 mb-4">How It Works</h2>
          <p className="text-gray-500 mb-14 text-lg">3 steps for visitors. 1 dashboard for admins.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '1', icon: QrCode,   title: 'Scan QR Code',     desc: 'Visitor scans the museum\'s QR code to open the booking chatbot instantly on their phone.' },
              { step: '2', icon: Ticket,   title: 'Book & Pay',        desc: 'Choose tickets, enter email & phone, then pay securely via Razorpay — all button-driven.' },
              { step: '3', icon: Shield,   title: 'Enter with Code',   desc: 'At the gate, enter the staff 4-digit code on your ticket to mark it USED. No scanner needed.' },
            ].map((s, i) => (
              <div key={i} className="relative">
                {i < 2 && (
                  <div className="hidden md:block absolute top-8 right-0 w-1/2 h-0.5 bg-gradient-to-r from-indigo-300 to-transparent translate-x-1/2 z-0" />
                )}
                <div className="relative z-10 bg-white rounded-2xl p-8 shadow-md border border-gray-100 hover:shadow-xl transition-shadow">
                  <div className="w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center font-extrabold text-lg mx-auto mb-4">
                    {s.step}
                  </div>
                  <s.icon className="h-8 w-8 text-indigo-500 mx-auto mb-3" />
                  <h3 className="font-bold text-gray-900 mb-2">{s.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── MUSEUMS LIST ── */}
      <div id="museums" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Partner Museums</h2>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto">
              Discover registered museums and book your tickets instantly via chatbot
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent" />
            </div>
          ) : museums.length === 0 ? (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gray-100 text-gray-400 mb-6">
                <Building2 className="h-10 w-10" />
              </div>
              <h3 className="text-2xl font-bold text-gray-700 mb-3">No Museums Yet</h3>
              <p className="text-gray-500 mb-8">Be the first to register your museum!</p>
              <Link to="/register-museum"
                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-semibold transition-all">
                <UserPlus className="h-5 w-5" /> Register Now
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {museums.map((museum, idx) => (
                <Link key={museum.id} to={`/museum/${museum.id}`}
                  className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden border border-gray-100"
                  style={{ animationDelay: `${idx * 0.08}s` }}>

                  {/* Header gradient */}
                  <div className="relative h-44 bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center overflow-hidden">
                    <Building2 className="h-20 w-20 text-white/25" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    {!museum.bookingStatus && (
                      <span className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                        Booking Closed
                      </span>
                    )}
                    {museum.bookingStatus && (
                      <span className="absolute top-3 right-3 bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                        Open
                      </span>
                    )}
                  </div>

                  <div className="p-6">
                    <h3 className="text-lg font-extrabold text-gray-900 mb-1 group-hover:text-indigo-600 transition-colors">
                      {museum.museumName}
                    </h3>
                    <div className="flex items-center text-gray-500 text-sm mb-4 gap-1">
                      <MapPin className="h-4 w-4 flex-shrink-0" />
                      {museum.location}
                    </div>

                    {/* Pricing */}
                    <div className="flex gap-3 mb-4">
                      <div className="flex-1 bg-indigo-50 rounded-xl p-3 text-center">
                        <p className="text-xs text-gray-500 mb-0.5">Adult</p>
                        <p className="text-base font-extrabold text-indigo-700 flex items-center justify-center gap-0.5">
                          <IndianRupee className="h-3.5 w-3.5" />{adultPrice(museum)}
                        </p>
                      </div>
                      <div className="flex-1 bg-purple-50 rounded-xl p-3 text-center">
                        <p className="text-xs text-gray-500 mb-0.5">Child</p>
                        <p className="text-base font-extrabold text-purple-700 flex items-center justify-center gap-0.5">
                          <IndianRupee className="h-3.5 w-3.5" />{childPrice(museum)}
                        </p>
                      </div>
                    </div>

                    {/* Timings */}
                    {(museum.openingTime || museum.closingTime) && (
                      <div className="flex items-center gap-1 text-xs text-gray-400 mb-4">
                        <Clock className="h-3.5 w-3.5" />
                        {museum.openingTime || '9:00'} – {museum.closingTime || '17:00'}
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <QrCode className="h-3.5 w-3.5" /> Scan to book
                      </span>
                      <span className="inline-flex items-center text-indigo-600 font-bold text-sm gap-1 group-hover:gap-2 transition-all">
                        Book Now <ArrowRight className="h-4 w-4" />
                      </span>
                    </div>
                  </div>

                  {/* Hover border */}
                  <div className="absolute inset-0 border-2 border-indigo-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── CTA ── */}
      <div className="py-24 bg-gradient-to-r from-indigo-700 to-purple-700">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-4xl font-extrabold text-white mb-4">Ready to Go Paperless?</h2>
          <p className="text-xl text-indigo-200 mb-10">
            Register your museum today and let visitors book from their phones in seconds.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/register-museum"
              className="px-8 py-4 bg-white text-indigo-700 rounded-2xl font-bold hover:shadow-2xl transform hover:-translate-y-1 transition-all">
              Register Your Museum
            </Link>
            <a href="#museums"
              className="px-8 py-4 border-2 border-white text-white rounded-2xl font-bold hover:bg-white/10 transform hover:-translate-y-1 transition-all">
              Browse Museums
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
