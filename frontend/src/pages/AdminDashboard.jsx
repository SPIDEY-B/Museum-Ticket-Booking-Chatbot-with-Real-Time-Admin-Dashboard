import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LogOut, BarChart3, Ticket, Zap, Settings, QrCode, Download,
  Plus, Edit2, Trash2, TrendingUp, Users, Calendar, Eye, EyeOff,
  Shield, ToggleLeft, ToggleRight, RefreshCw, CheckCircle,
  XCircle, Clock, DollarSign
} from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import * as api from '../services/api';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [stats, setStats]   = useState(null);
  const [tickets, setTickets] = useState([]);
  const [shows, setShows]   = useState([]);
  const [museum, setMuseum] = useState(null);

  /* Shows */
  const [showForm, setShowForm] = useState(false);
  const [newShow, setNewShow]   = useState({ name: '', showTime: '', price: '', seatLimit: '', description: '' });

  /* Settings */
  const [settingsForm, setSettingsForm]  = useState({ adultPrice: '', childPrice: '', seatLimit: '', openingTime: '', closingTime: '' });
  const [savingSettings, setSavingSettings] = useState(false);
  const [bookingToggling, setBookingToggling] = useState(false);

  /* Tickets */
  const [searchTerm, setSearchTerm] = useState('');
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [verifyCode, setVerifyCode] = useState('');
  const [showPin, setShowPin] = useState(false);

  const museumId   = localStorage.getItem('museumId');
  const museumName = localStorage.getItem('museumName');

  useEffect(() => {
    if (!museumId) { navigate('/admin-login'); return; }
    fetchAll();
    // Poll every 30s for real-time updates
    const interval = setInterval(fetchAll, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [statsRes, ticketsRes, showsRes, museumRes] = await Promise.all([
        api.museumAPI.getStats(museumId),
        api.ticketAPI.getMuseumTickets(museumId),
        api.showAPI.getMuseumShows(museumId),
        api.museumAPI.getById(museumId),
      ]);
      setStats(statsRes.data || statsRes);
      setTickets(ticketsRes.data || ticketsRes || []);
      setShows(showsRes.data || showsRes || []);
      const m = museumRes.data || museumRes;
      setMuseum(m);
      setSettingsForm({
        adultPrice:   m.adultPrice || m.adultTicketPrice || '',
        childPrice:   m.childPrice || m.childTicketPrice || '',
        seatLimit:    m.seatLimit || '',
        openingTime:  m.openingTime || '09:00',
        closingTime:  m.closingTime || '17:00',
      });
    } catch (err) {
      if (err?.response?.status === 404) {
        toast.error('Museum not found. Please login again.');
        localStorage.clear();
        navigate('/admin-login');
        return;
      }
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    toast.success('Logged out successfully');
    navigate('/');
  };

  /* ── CREATE SHOW ── */
  const handleCreateShow = async (e) => {
    e.preventDefault();
    try {
      await api.showAPI.create(museumId, {
        showName: newShow.name,
        showTime: newShow.showTime,
        price: parseFloat(newShow.price),
        seatLimit: parseInt(newShow.seatLimit),
        description: newShow.description,
      });
      toast.success('Show created successfully! 🎭');
      setNewShow({ name: '', showTime: '', price: '', seatLimit: '', description: '' });
      setShowForm(false);
      fetchAll();
    } catch {
      toast.error('Failed to create show');
    }
  };

  /* ── DELETE SHOW ── */
  const handleDeleteShow = async (showId) => {
    if (!window.confirm('Delete this show?')) return;
    try {
      await api.showAPI.delete(showId);
      toast.success('Show deleted');
      fetchAll();
    } catch {
      toast.error('Failed to delete show');
    }
  };

  /* ── TOGGLE BOOKING ── */
  const handleToggleBooking = async () => {
    if (!museum) return;
    setBookingToggling(true);
    try {
      await api.museumAPI.updateBookingStatus(museumId, !museum.bookingStatus);
      toast.success(`Booking ${!museum.bookingStatus ? 'OPENED' : 'CLOSED'}`);
      fetchAll();
    } catch {
      toast.error('Failed to update booking status');
    } finally {
      setBookingToggling(false);
    }
  };

  /* ── SAVE SETTINGS ── */
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      await api.museumAPI.update(museumId, {
        adultPrice:  parseFloat(settingsForm.adultPrice) || 0,
        childPrice:  parseFloat(settingsForm.childPrice) || 0,
        seatLimit:   parseInt(settingsForm.seatLimit) || 100,
        openingTime: settingsForm.openingTime,
        closingTime: settingsForm.closingTime,
      });
      toast.success('Settings saved! Changes reflect in chatbot immediately. ✅');
      fetchAll();
    } catch {
      toast.error('Failed to save settings');
    } finally {
      setSavingSettings(false);
    }
  };

  /* ── VERIFY TICKET ── */
  const openVerifyModal = (ticket) => {
    setSelectedTicket(ticket);
    setVerifyCode('');
    setShowVerifyModal(true);
  };

  const handleVerifyTicket = async () => {
    if (!selectedTicket || verifyCode.length !== 4) return;
    try {
      await api.ticketAPI.verify({
        ticketId: selectedTicket.id,
        verificationCode: verifyCode,
        museumId,
      });
      toast.success('Ticket verified! ✅');
      setShowVerifyModal(false);
      setSelectedTicket(null);
      setVerifyCode('');
      fetchAll();
    } catch {
      toast.error('Invalid code. Check and try again.');
    }
  };

  /* ── PHONE SEARCH ── */
  const handlePhoneSearch = async (phone) => {
    setSearchTerm(phone);
    if (!phone.trim()) { fetchAll(); return; }
    try {
      const res = await api.ticketAPI.getMuseumTicketsByPhone(museumId, phone);
      setTickets(res.data || res || []);
    } catch {
      toast.error('Phone search failed');
    }
  };

  /* ── QR DOWNLOAD ── */
  const downloadQRCode = () => {
    const img = document.querySelector('#qr-img');
    if (img) {
      const link = document.createElement('a');
      link.href = img.src;
      link.download = `${museumName}-qr.png`;
      link.click();
    } else {
      toast.error('QR image not loaded');
    }
  };

  /* ────────────────────────────────
     UI SUB-COMPONENTS
  ──────────────────────────────── */
  const StatCard = ({ icon: Icon, label, value, sub, color = 'indigo', large = false }) => {
    const colors = {
      indigo: { bg: 'bg-indigo-50', icon: 'text-indigo-600', val: 'text-indigo-700' },
      green:  { bg: 'bg-green-50',  icon: 'text-green-600',  val: 'text-green-700'  },
      blue:   { bg: 'bg-blue-50',   icon: 'text-blue-600',   val: 'text-blue-700'   },
      purple: { bg: 'bg-purple-50', icon: 'text-purple-600', val: 'text-purple-700' },
      amber:  { bg: 'bg-amber-50',  icon: 'text-amber-600',  val: 'text-amber-700'  },
    };
    const c = colors[color] || colors.indigo;
    return (
      <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-all duration-200 cursor-default group">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-gray-500 text-sm font-medium">{label}</p>
            <p className={`${large ? 'text-4xl' : 'text-3xl'} font-extrabold ${c.val} mt-2 group-hover:scale-105 transition-transform`}>{value}</p>
            {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
          </div>
          <div className={`${c.bg} p-3 rounded-xl`}>
            <Icon className={`h-6 w-6 ${c.icon}`} />
          </div>
        </div>
      </div>
    );
  };

  const TabBtn = ({ id, label, icon: Icon }) => (
    <button onClick={() => setActiveTab(id)}
      className={`flex items-center gap-2 py-3.5 px-5 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
        activeTab === id
          ? 'border-indigo-600 text-indigo-700 bg-indigo-50/60'
          : 'border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50'
      }`}>
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );

  const statusBadge = (status) => {
    const map = {
      ACTIVE:    'bg-emerald-100 text-emerald-800',
      USED:      'bg-gray-100 text-gray-600',
      PENDING:   'bg-amber-100 text-amber-800',
      CANCELLED: 'bg-red-100 text-red-700',
    };
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${map[status] || 'bg-gray-100 text-gray-600'}`}>
        {status}
      </span>
    );
  };

  /* ── LOADING ── */
  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-600 border-t-transparent mx-auto mb-4" />
          <p className="text-gray-500 font-medium">Loading dashboard…</p>
        </div>
      </div>
    );
  }

  /* ───────────────────────────────────────────
     MAIN RENDER
  ─────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── HEADER ── */}
      <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-purple-600 text-white sticky top-0 z-30 shadow-xl">
        <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">{museumName}</h1>
            <p className="text-indigo-200 text-sm mt-0.5">Admin Dashboard</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={fetchAll}
              className="bg-white/15 hover:bg-white/25 p-2 rounded-lg transition-all" title="Refresh">
              <RefreshCw className="h-4 w-4" />
            </button>
            {museum && (
              <button onClick={handleToggleBooking} disabled={bookingToggling}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  museum.bookingStatus
                    ? 'bg-emerald-500 hover:bg-emerald-600'
                    : 'bg-red-500 hover:bg-red-600'
                }`}>
                {museum.bookingStatus ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                Booking {museum.bookingStatus ? 'OPEN' : 'CLOSED'}
              </button>
            )}
            <button onClick={handleLogout}
              className="flex items-center gap-2 bg-white/15 hover:bg-white/25 px-4 py-2 rounded-lg transition-all text-sm font-medium">
              <LogOut className="h-4 w-4" /> Logout
            </button>
          </div>
        </div>
      </div>

      {/* ── TABS ── */}
      <div className="bg-white border-b border-gray-200 sticky top-[73px] z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 flex overflow-x-auto">
          <TabBtn id="overview"  label="Overview"      icon={BarChart3} />
          <TabBtn id="tickets"   label="Tickets"       icon={Ticket}    />
          <TabBtn id="shows"     label="Shows"         icon={Zap}       />
          <TabBtn id="qr"        label="QR Code"       icon={QrCode}    />
          <TabBtn id="settings"  label="Settings"      icon={Settings}  />
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* ════════════════════════════ OVERVIEW ════════════════════════════ */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-extrabold text-gray-900 mb-6">Dashboard Overview</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <StatCard icon={Ticket}     label="Today's Tickets"   value={stats?.todayTicketsCount  || 0}                  color="indigo" />
                <StatCard icon={DollarSign} label="Today's Revenue"   value={`₹${stats?.todayRevenue   || 0}`}                color="green"  />
                <StatCard icon={Users}      label="Active Bookings"   value={stats?.activeBookingsCount || 0}                  color="blue"   />
                <StatCard icon={Calendar}   label="Total Shows"       value={stats?.totalShowsCount     || shows.length || 0} color="purple" />
              </div>
            </div>

            {/* Booking status + seat info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className={`rounded-2xl p-6 shadow-md border-2 ${museum?.bookingStatus ? 'bg-emerald-50 border-emerald-300' : 'bg-red-50 border-red-300'}`}>
                <p className="text-sm font-semibold text-gray-600 mb-1">Booking Status</p>
                <div className="flex items-center gap-2">
                  {museum?.bookingStatus
                    ? <CheckCircle className="h-8 w-8 text-emerald-600" />
                    : <XCircle    className="h-8 w-8 text-red-600"     />}
                  <span className={`text-2xl font-extrabold ${museum?.bookingStatus ? 'text-emerald-700' : 'text-red-700'}`}>
                    {museum?.bookingStatus ? 'OPEN' : 'CLOSED'}
                  </span>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
                <p className="text-sm font-semibold text-gray-600 mb-1">Daily Seat Limit</p>
                <p className="text-3xl font-extrabold text-gray-900">{museum?.seatLimit || '—'}</p>
                <p className="text-xs text-gray-400 mt-1">seats per day</p>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
                <p className="text-sm font-semibold text-gray-600 mb-1">Ticket Prices</p>
                <p className="text-lg font-bold text-gray-900">
                  Adult: ₹{museum?.adultPrice || museum?.adultTicketPrice || '—'}
                </p>
                <p className="text-sm text-gray-600">Child: ₹{museum?.childPrice || museum?.childTicketPrice || '—'}</p>
              </div>
            </div>

            {/* Recent Tickets */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-base font-bold text-gray-900">Recent Tickets</h3>
                <button onClick={() => setActiveTab('tickets')}
                  className="text-xs text-indigo-600 hover:underline font-medium">View All →</button>
              </div>
              {tickets.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <Ticket className="h-10 w-10 mx-auto mb-2 opacity-30" />
                  <p className="font-medium">No tickets yet</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100">
                        <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Ticket</th>
                        <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Email</th>
                        <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Amount</th>
                        <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {tickets.slice(0, 5).map(t => (
                        <tr key={t.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-5 py-4 font-mono text-sm font-bold text-indigo-600">{t.ticketNumber}</td>
                          <td className="px-5 py-4 text-sm text-gray-600">{t.userEmail}</td>
                          <td className="px-5 py-4 text-sm font-bold text-gray-900">₹{t.totalPrice}</td>
                          <td className="px-5 py-4">{statusBadge(t.status)}</td>
                          <td className="px-5 py-4 text-sm text-gray-500">{format(new Date(t.createdAt), 'MMM dd, yyyy')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ════════════════════════════ TICKETS ════════════════════════════ */}
        {activeTab === 'tickets' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-extrabold text-gray-900">Ticket Verification</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <div className="lg:col-span-2 bg-white rounded-2xl shadow-md p-6 border border-gray-100">
                <h3 className="font-bold text-gray-700 mb-3">Search by Phone</h3>
                <input type="tel" placeholder="Enter customer phone number"
                  value={searchTerm}
                  onChange={e => handlePhoneSearch(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:border-transparent text-sm" />
              </div>
              <div className="bg-indigo-50 rounded-2xl shadow-md p-6 border border-indigo-100 flex flex-col justify-center">
                <p className="text-xs font-bold text-indigo-500 uppercase mb-1">Total Found</p>
                <p className="text-5xl font-extrabold text-indigo-700">{tickets.length}</p>
                <p className="text-sm text-indigo-500 mt-1">tickets</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
              {tickets.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                  <Ticket className="h-12 w-12 mx-auto mb-3 opacity-20" />
                  <p className="font-semibold">No tickets found</p>
                  <p className="text-sm mt-1">{searchTerm ? 'Try a different phone number' : 'Enter a phone number to search'}</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100">
                        {['Ticket', 'Email', 'Phone', 'Visitors', 'Amount', 'Status', 'Date', 'Action'].map(h => (
                          <th key={h} className="px-5 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {tickets.map(t => (
                        <tr key={t.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-5 py-4 font-mono text-sm font-bold text-indigo-600">{t.ticketNumber}</td>
                          <td className="px-5 py-4 text-sm text-gray-600">{t.userEmail}</td>
                          <td className="px-5 py-4 text-sm text-gray-600">{t.phone || '—'}</td>
                          <td className="px-5 py-4 text-sm text-gray-700">{t.adults}A / {t.children}C</td>
                          <td className="px-5 py-4 text-sm font-bold text-gray-900">₹{t.totalPrice}</td>
                          <td className="px-5 py-4">{statusBadge(t.status)}</td>
                          <td className="px-5 py-4 text-sm text-gray-500">{format(new Date(t.createdAt), 'MMM dd, yyyy')}</td>
                          <td className="px-5 py-4">
                            <button onClick={() => openVerifyModal(t)}
                              disabled={t.status === 'USED' || t.status === 'CANCELLED'}
                              className={`flex items-center gap-1 text-sm font-semibold transition-colors ${
                                t.status === 'USED' || t.status === 'CANCELLED'
                                  ? 'text-gray-300 cursor-not-allowed'
                                  : 'text-indigo-600 hover:text-indigo-800'
                              }`}>
                              <Eye className="h-4 w-4" /> Verify
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ════════════════════════════ SHOWS ════════════════════════════ */}
        {activeTab === 'shows' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-extrabold text-gray-900">Special Shows</h2>
              <button onClick={() => setShowForm(!showForm)}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-md">
                <Plus className="h-4 w-4" /> Add Show
              </button>
            </div>

            {showForm && (
              <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-5">Create New Show</h3>
                <form onSubmit={handleCreateShow} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="text" placeholder="Show Name *" required value={newShow.name}
                      onChange={e => setNewShow({...newShow, name: e.target.value})}
                      className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-400 text-sm" />
                    <input type="datetime-local" required value={newShow.showTime}
                      onChange={e => setNewShow({...newShow, showTime: e.target.value})}
                      className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-400 text-sm" />
                    <input type="number" placeholder="Price ₹ *" required value={newShow.price}
                      onChange={e => setNewShow({...newShow, price: e.target.value})}
                      className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-400 text-sm" />
                    <input type="number" placeholder="Seat Limit *" required value={newShow.seatLimit}
                      onChange={e => setNewShow({...newShow, seatLimit: e.target.value})}
                      className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-400 text-sm" />
                  </div>
                  <textarea placeholder="Description (optional)" value={newShow.description} rows={2}
                    onChange={e => setNewShow({...newShow, description: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-400 text-sm resize-none" />
                  <div className="flex gap-3">
                    <button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-semibold text-sm transition-all">
                      Create Show
                    </button>
                    <button type="button" onClick={() => setShowForm(false)}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold text-sm transition-all">
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {shows.length === 0 ? (
              <div className="text-center py-16 text-gray-400 bg-white rounded-2xl shadow-md border border-gray-100">
                <Zap className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p className="font-semibold text-gray-500">No shows scheduled</p>
                <p className="text-sm mt-1">Create a show to display it in the chatbot</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {shows.map(show => (
                  <div key={show.id}
                    className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="h-1.5 bg-gradient-to-r from-indigo-500 to-purple-500" />
                    <div className="p-5">
                      <h3 className="font-bold text-gray-900 text-base mb-3">{show.showName || show.name}</h3>
                      <div className="space-y-2 text-sm text-gray-600 mb-4">
                        <p className="flex items-center gap-2"><Calendar className="h-4 w-4 text-indigo-400" />
                          {format(new Date(show.showTime), 'MMM dd, yyyy HH:mm')}
                        </p>
                        <p className="flex items-center gap-2"><DollarSign className="h-4 w-4 text-green-500" />
                          ₹{show.price} per ticket
                        </p>
                        <p className="flex items-center gap-2"><Users className="h-4 w-4 text-blue-400" />
                          {show.availableSeats ?? show.seatLimit} / {show.seatLimit} seats
                        </p>
                      </div>
                      {show.description && (
                        <p className="text-xs text-gray-400 mb-4 line-clamp-2">{show.description}</p>
                      )}
                      <div className="flex gap-2">
                        <button onClick={() => handleDeleteShow(show.id)}
                          className="flex-1 flex items-center justify-center gap-1 bg-red-50 hover:bg-red-100 text-red-600 py-2 rounded-lg text-sm font-semibold transition-colors">
                          <Trash2 className="h-4 w-4" /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ════════════════════════════ QR ════════════════════════════ */}
        {activeTab === 'qr' && (
          <div className="max-w-md mx-auto">
            <h2 className="text-2xl font-extrabold text-gray-900 mb-8 text-center">Museum QR Code</h2>
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-8 space-y-6">
              <div className="flex justify-center bg-gray-50 rounded-xl p-6">
                <img id="qr-img"
                  src={`/api/museums/${museumId}/qr-image`}
                  alt="Museum QR Code"
                  className="w-52 h-52 rounded-xl border-4 border-indigo-200 shadow-md"
                  onError={e => e.target.src = `/qr/museum_${museumId}.png`}
                />
              </div>
              <p className="text-center text-gray-500 text-sm">
                Visitors scan this QR code to open the chatbot and book tickets directly.
              </p>
              <button onClick={downloadQRCode}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-semibold transition-all shadow-md">
                <Download className="h-5 w-5" /> Download QR Code
              </button>
            </div>
          </div>
        )}

        {/* ════════════════════════════ SETTINGS ════════════════════════════ */}
        {activeTab === 'settings' && (
          <div className="max-w-2xl space-y-6">
            <h2 className="text-2xl font-extrabold text-gray-900">Settings</h2>

            {/* Museum Permanent Code — PROMINENT */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
              <div className="flex items-center gap-3 mb-3">
                <Shield className="h-6 w-6" />
                <h3 className="font-bold text-lg">Museum Permanent Staff Code</h3>
              </div>
              <p className="text-indigo-200 text-sm mb-4">
                This is the <strong>one fixed 4-digit code</strong> for your museum. Staff use this code to validate visitor tickets at the entry gate. Keep it confidential — share only with your staff.
              </p>
              <div className="bg-white/20 backdrop-blur rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-indigo-200 font-medium mb-1">STAFF ENTRY CODE</p>
                  <p className="text-5xl font-black tracking-[0.5em] font-mono">
                    {showPin ? (museum?.staffPin || '????') : '••••'}
                  </p>
                </div>
                <button onClick={() => setShowPin(p => !p)}
                  className="bg-white/20 hover:bg-white/30 p-3 rounded-xl transition-all">
                  {showPin ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              <p className="text-xs text-indigo-300 mt-3">
                🔐 Visitor shows their ticket → Staff enters this code → Ticket marked USED
              </p>
            </div>

            {/* Price & Capacity Settings */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
              <h3 className="font-bold text-gray-900 mb-5 flex items-center gap-2">
                <Settings className="h-5 w-5 text-indigo-500" /> Ticket Prices & Capacity
              </h3>
              <form onSubmit={handleSaveSettings} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1.5">Adult Price (₹)</label>
                    <input type="number" min="0" value={settingsForm.adultPrice}
                      onChange={e => setSettingsForm(p => ({...p, adultPrice: e.target.value}))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-400 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1.5">Child Price (₹)</label>
                    <input type="number" min="0" value={settingsForm.childPrice}
                      onChange={e => setSettingsForm(p => ({...p, childPrice: e.target.value}))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-400 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1.5">Daily Seat Limit</label>
                    <input type="number" min="1" value={settingsForm.seatLimit}
                      onChange={e => setSettingsForm(p => ({...p, seatLimit: e.target.value}))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-400 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1.5">Opening Time</label>
                    <input type="time" value={settingsForm.openingTime}
                      onChange={e => setSettingsForm(p => ({...p, openingTime: e.target.value}))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-400 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1.5">Closing Time</label>
                    <input type="time" value={settingsForm.closingTime}
                      onChange={e => setSettingsForm(p => ({...p, closingTime: e.target.value}))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-400 text-sm" />
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
                  ℹ️ Changes to prices, seat limit, and timings are <strong>instantly reflected</strong> in the visitor chatbot.
                </div>

                <button type="submit" disabled={savingSettings}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white py-3 rounded-xl font-semibold transition-all">
                  {savingSettings ? 'Saving…' : '✅ Save Settings'}
                </button>
              </form>
            </div>

            {/* Booking status toggle */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
              <h3 className="font-bold text-gray-900 mb-4">Booking Control</h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-800">Booking Status</p>
                  <p className="text-sm text-gray-500 mt-0.5">Toggle to open or close bookings for visitors</p>
                </div>
                <button onClick={handleToggleBooking} disabled={bookingToggling}
                  className={`px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-md ${
                    museum?.bookingStatus
                      ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                      : 'bg-red-500 hover:bg-red-600 text-white'
                  }`}>
                  {museum?.bookingStatus ? '🟢 OPEN – Click to Close' : '🔴 CLOSED – Click to Open'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ════════════════ VERIFY MODAL ════════════════ */}
      {showVerifyModal && selectedTicket && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6">
              <h2 className="text-xl font-bold">Verify Ticket</h2>
              <p className="text-indigo-200 text-sm mt-1">Enter the museum staff code</p>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="font-bold text-gray-900 font-mono">{selectedTicket.ticketNumber}</p>
                <p className="text-sm text-gray-600">{selectedTicket.userEmail}</p>
                <p className="text-sm text-gray-500">{selectedTicket.adults}A / {selectedTicket.children}C · ₹{selectedTicket.totalPrice}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">4-Digit Staff Code</label>
                <input
                  type="text" maxLength={4}
                  value={verifyCode}
                  onChange={e => setVerifyCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-4 py-4 border-2 border-indigo-300 rounded-xl text-center text-3xl font-mono tracking-[0.5em] focus:border-indigo-600 focus:outline-none"
                  placeholder="0000" autoFocus
                />
              </div>
              <button onClick={handleVerifyTicket}
                disabled={verifyCode.length !== 4}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white py-3 rounded-xl font-bold transition-all">
                ✅ Verify Ticket
              </button>
              <button onClick={() => { setShowVerifyModal(false); setSelectedTicket(null); setVerifyCode(''); }}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold transition-all">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
