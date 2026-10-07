import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTickets } from '../context/TicketContext';
import { useNavigation } from '../context/NavigationContext';
import { SupportTicket } from '../types/ticket';
import {
  LifeBuoy,
  Plus,
  Send,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Search,
  ArrowRight,
  ShieldCheck,
  Package,
  Sparkles,
} from 'lucide-react';

export const SupportPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { tickets, createTicket, addReply } = useTickets();
  const { supportTicketId, setSupportTicketId, trackingOrderNumber, goToTracking } = useNavigation();

  const [activeTab, setActiveTab] = useState<'create' | 'lookup'>(supportTicketId ? 'lookup' : 'create');

  // Form State for Ticket Creation
  const [customerName, setCustomerName] = useState(currentUser?.name || '');
  const [customerEmail, setCustomerEmail] = useState(currentUser?.email || '');
  const [orderNumber, setOrderNumber] = useState(trackingOrderNumber || '');
  const [category, setCategory] = useState<SupportTicket['category']>('ORDER_STATUS');
  const [priority, setPriority] = useState<SupportTicket['priority']>('MEDIUM');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [createdTicketResult, setCreatedTicketResult] = useState<SupportTicket | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Ticket Lookup State
  const [lookupQuery, setLookupQuery] = useState(currentUser?.email || supportTicketId || '');
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(supportTicketId || null);
  const [customerReplyText, setCustomerReplyText] = useState('');
  const [faqExpanded, setFaqExpanded] = useState<number | null>(null);

  // Sync user details if user logs in
  useEffect(() => {
    if (currentUser) {
      if (!customerName) setCustomerName(currentUser.name);
      if (!customerEmail) setCustomerEmail(currentUser.email);
      if (!lookupQuery) setLookupQuery(currentUser.email);
    }
  }, [currentUser]);

  // Sync with supportTicketId param
  useEffect(() => {
    if (supportTicketId) {
      setSelectedTicketId(supportTicketId);
      setActiveTab('lookup');
    }
  }, [supportTicketId]);

  // Filtered tickets for lookup tab
  const matchingTickets = useMemo(() => {
    const q = lookupQuery.trim().toLowerCase();
    if (!q) {
      if (currentUser?.email) {
        return tickets.filter(
          (t) =>
            t.customerEmail.toLowerCase() === currentUser.email.toLowerCase() ||
            (currentUser.id && t.userId === currentUser.id)
        );
      }
      return [];
    }

    return tickets.filter((t) => {
      const matchEmail = t.customerEmail.toLowerCase().includes(q);
      const matchNumber = t.ticketNumber.toLowerCase().includes(q) || t.id.toLowerCase().includes(q);
      const matchOrder = t.orderNumber?.toLowerCase().includes(q);
      const matchSubject = t.subject.toLowerCase().includes(q);
      return matchEmail || matchNumber || matchOrder || matchSubject;
    });
  }, [tickets, lookupQuery, currentUser]);

  const activeSelectedTicket = useMemo(() => {
    if (!selectedTicketId) return matchingTickets[0] || null;
    return tickets.find((t) => t.id === selectedTicketId) || matchingTickets[0] || null;
  }, [tickets, selectedTicketId, matchingTickets]);

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim() || !customerEmail.trim()) return;

    setIsSubmitting(true);
    const newT = createTicket({
      customerName: customerName.trim() || 'Valued Member',
      customerEmail: customerEmail.trim().toLowerCase(),
      userId: currentUser?.id,
      orderNumber: orderNumber.trim() || undefined,
      subject: subject.trim(),
      category,
      priority,
      initialMessage: message.trim(),
    });

    setTimeout(() => {
      setIsSubmitting(false);
      setCreatedTicketResult(newT);
      setLookupQuery(newT.customerEmail);
      setSelectedTicketId(newT.id);
      setSupportTicketId(newT.id);
      // Reset form fields
      setSubject('');
      setMessage('');
    }, 400);
  };

  const handleCustomerReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSelectedTicket || !customerReplyText.trim()) return;

    addReply(
      activeSelectedTicket.id,
      customerReplyText.trim(),
      'customer',
      activeSelectedTicket.customerName || currentUser?.name || 'Customer'
    );
    setCustomerReplyText('');
  };

  const getStatusBadge = (status: SupportTicket['status']) => {
    switch (status) {
      case 'OPEN':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            <span>Open Ticket</span>
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-50 text-blue-800 border border-blue-200">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
            <span>In Progress</span>
          </span>
        );
      case 'RESOLVED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
            <CheckCircle2 size={12} className="text-emerald-600" />
            <span>Resolved</span>
          </span>
        );
    }
  };

  const getCategoryLabel = (cat: SupportTicket['category']) => {
    switch (cat) {
      case 'ORDER_STATUS':
        return 'Order Tracking & Dispatch';
      case 'RETURN_EXCHANGE':
        return 'Return & Sizing Exchange';
      case 'SIZING_HELP':
        return 'Crown Fit & Head Measurement';
      case 'PRODUCT_INQUIRY':
        return 'GORE-TEX® & Material Care';
      case 'BILLING':
        return 'Billing, Currency & Customs';
      case 'OTHER':
        return 'General Inquiry & Feedback';
      default:
        return cat;
    }
  };

  const FAQS = [
    {
      q: 'When will my order ship and how do I track it?',
      a: 'All orders placed before 2:00 PM GMT ship the same business day from our London Atelier. You receive an electronic waybill via email, and you can track real-time telemetry on our Track Order page at any time.',
    },
    {
      q: 'How should I clean and maintain my GORE-TEX® 3L cap?',
      a: 'For genuine 3-layer GORE-TEX membranes, hand wash or machine wash on delicate cycle at 30°C using liquid technical wash. Never use fabric softeners or chlorine bleach. Air dry flat away from direct heat to preserve bonded seam integrity.',
    },
    {
      q: 'Which size is right for me (S/M vs L/XL)?',
      a: 'S/M is tailored for head circumferences between 54–57 cm. L/XL fits 58–61 cm. Both sizes include our micro-cinch tension strap with magnetic Fidlock or laser-etched matte hardware for micro-adjustments.',
    },
    {
      q: 'What is your return and exchange policy?',
      a: 'We offer a 30-day risk-free inspection window. Items must be in unwashed, original condition with technical tags attached. Members enjoy complimentary worldwide return waybills.',
    },
  ];

  return (
    <div className="w-full min-h-screen bg-white font-sans text-black select-none">
      
      {/* Top Banner (Nike Style) */}
      <div className="border-b border-neutral-200 bg-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-3">
          <div className="text-xs text-neutral-500 uppercase tracking-widest font-semibold flex items-center gap-2">
            <span>RAYLUXX</span>
            <span>/</span>
            <span>CLIENT SERVICES</span>
            <span>/</span>
            <span className="text-black font-bold">SUPPORT CONCIERGE</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="font-nike text-4xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-black">
                CLIENT SUPPORT DESK
              </h1>
              <p className="font-sans text-neutral-600 text-sm sm:text-base max-w-2xl mt-2 leading-relaxed">
                Connect directly with Rayluxx product engineers and dispatch operations. Submit inquiries, track ticket resolutions, or request technical sizing advice.
              </p>
            </div>

            {/* Quick Metrics */}
            <div className="flex items-center gap-4 border border-neutral-200 rounded-2xl p-3 bg-neutral-50/70 text-xs">
              <div className="text-center px-3 border-r border-neutral-200">
                <span className="font-black text-black text-base block font-nike">&lt; 2 HRS</span>
                <span className="text-neutral-500 text-[10px] uppercase font-bold">Avg Response</span>
              </div>
              <div className="text-center px-3 border-r border-neutral-200">
                <span className="font-black text-emerald-600 text-base block font-nike">100%</span>
                <span className="text-neutral-500 text-[10px] uppercase font-bold">Resolution Rate</span>
              </div>
              <div className="text-center px-3">
                <span className="font-black text-black text-base block font-nike">LONDON HQ</span>
                <span className="text-neutral-500 text-[10px] uppercase font-bold">Atelier Ops</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Navigation Tabs */}
        <div className="flex border-b border-neutral-200 mb-8">
          <button
            onClick={() => setActiveTab('create')}
            className={`py-3.5 px-6 font-nike text-sm sm:text-base uppercase font-bold tracking-tight transition-all relative cursor-pointer ${
              activeTab === 'create'
                ? 'text-black after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2.5px] after:bg-black'
                : 'text-neutral-500 hover:text-black'
            }`}
          >
            <span className="flex items-center gap-2">
              <Plus size={16} />
              <span>Open New Ticket</span>
            </span>
          </button>

          <button
            onClick={() => setActiveTab('lookup')}
            className={`py-3.5 px-6 font-nike text-sm sm:text-base uppercase font-bold tracking-tight transition-all relative cursor-pointer ${
              activeTab === 'lookup'
                ? 'text-black after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2.5px] after:bg-black'
                : 'text-neutral-500 hover:text-black'
            }`}
          >
            <span className="flex items-center gap-2">
              <LifeBuoy size={16} />
              <span>Check Existing Tickets ({matchingTickets.length})</span>
            </span>
          </button>
        </div>

        {/* TAB 1: CREATE TICKET */}
        {activeTab === 'create' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            
            {/* Form */}
            <div className="lg:col-span-8 bg-white border border-neutral-200 rounded-3xl p-6 sm:p-10 shadow-xs">
              
              {createdTicketResult ? (
                <div className="text-center py-10 space-y-6 animate-fadeIn">
                  <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center mx-auto shadow-md">
                    <CheckCircle2 size={32} />
                  </div>

                  <div className="space-y-2">
                    <span className="text-xs font-bold uppercase tracking-widest text-neutral-400 block">
                      TICKET REGISTERED // DISPATCHED TO OPERATIONS
                    </span>
                    <h2 className="font-nike text-3xl font-black uppercase text-black">
                      YOUR TICKET HAS BEEN CREATED
                    </h2>
                    <p className="text-sm text-neutral-600 max-w-md mx-auto">
                      Our concierge team has received your inquiry. Reference your unique ticket number below:
                    </p>
                  </div>

                  <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-2xl max-w-sm mx-auto font-mono text-sm">
                    <span className="text-neutral-500 text-xs block mb-1">TICKET IDENTIFIER</span>
                    <strong className="text-black text-lg font-bold">{createdTicketResult.ticketNumber}</strong>
                    <span className="text-[11px] text-neutral-500 block mt-1">
                      Assigned to: {createdTicketResult.customerEmail}
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
                    <button
                      onClick={() => {
                        setActiveTab('lookup');
                        setSelectedTicketId(createdTicketResult.id);
                        setCreatedTicketResult(null);
                      }}
                      className="px-6 py-3 bg-black text-white rounded-full text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 transition-colors"
                    >
                      View Live Conversation
                    </button>
                    <button
                      onClick={() => setCreatedTicketResult(null)}
                      className="px-6 py-3 border border-neutral-300 rounded-full text-xs font-bold uppercase tracking-wider hover:border-black transition-colors"
                    >
                      Open Another Ticket
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleCreateTicket} className="space-y-6">
                  <div>
                    <h2 className="font-nike text-2xl font-black uppercase text-black mb-1">
                      NEW SUPPORT INQUIRY
                    </h2>
                    <p className="text-xs text-neutral-500">
                      Fill out the form below. For order-related questions, include your Order Reference (e.g. RLX-8921-EU).
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-2">
                        Your Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Marcus Vance"
                        className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black focus:bg-white transition-all font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        placeholder="marcus.vance@studio.com"
                        className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black focus:bg-white transition-all font-medium"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-2">
                        Order Reference # (Optional)
                      </label>
                      <input
                        type="text"
                        value={orderNumber}
                        onChange={(e) => setOrderNumber(e.target.value)}
                        placeholder="e.g. RLX-8921-EU"
                        className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black focus:bg-white transition-all font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-2">
                        Inquiry Category *
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value as any)}
                        className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black focus:bg-white transition-all font-medium cursor-pointer"
                      >
                        <option value="ORDER_STATUS">Order Status & Tracking</option>
                        <option value="RETURN_EXCHANGE">Return & Sizing Exchange</option>
                        <option value="SIZING_HELP">Crown Fit & Head Size</option>
                        <option value="PRODUCT_INQUIRY">GORE-TEX® & Technical Specs</option>
                        <option value="BILLING">Billing & Currency</option>
                        <option value="OTHER">Other Inquiry</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-2">
                        Urgency Level *
                      </label>
                      <select
                        value={priority}
                        onChange={(e) => setPriority(e.target.value as any)}
                        className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black focus:bg-white transition-all font-medium cursor-pointer"
                      >
                        <option value="LOW">Low (General Inquiry)</option>
                        <option value="MEDIUM">Medium (Standard)</option>
                        <option value="HIGH">High (Urgent Dispatch)</option>
                        <option value="URGENT">Urgent (Package Damaged / Lost)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-2">
                      Subject Line *
                    </label>
                    <input
                      type="text"
                      required
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="e.g. Requesting S/M to L/XL exchange for Cordura 5-Panel"
                      className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black focus:bg-white transition-all font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-2">
                      Detailed Description *
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Please provide full details so our team can resolve your inquiry on the first reply..."
                      className="w-full bg-neutral-50 border border-neutral-300 rounded-xl p-4 text-sm focus:outline-none focus:border-black focus:bg-white transition-all font-medium"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full sm:w-auto px-8 py-4 bg-black text-white hover:bg-neutral-800 disabled:opacity-50 rounded-full font-sans text-xs font-bold uppercase tracking-widest transition-all inline-flex items-center justify-center gap-2 shadow-lg cursor-pointer active:scale-98"
                    >
                      <Send size={14} />
                      <span>{isSubmitting ? 'Submitting Ticket...' : 'Submit Support Ticket'}</span>
                    </button>
                  </div>
                </form>
              )}

            </div>

            {/* Right Side: Direct Contacts & Assistance */}
            <div className="lg:col-span-4 space-y-6">
              
              <div className="bg-neutral-50 border border-neutral-200 rounded-3xl p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center flex-shrink-0">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <h3 className="font-nike text-base font-bold uppercase text-black">
                      RAYLUXX GUARANTEE
                    </h3>
                    <span className="text-[11px] text-neutral-500 block">30-Day Risk-Free Returns</span>
                  </div>
                </div>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Every Rayluxx technical cap comes with a 2-year warranty against textile delamination, seam tape breakdown, and hardware failure.
                </p>
              </div>

              <div className="bg-neutral-900 text-white rounded-3xl p-6 space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-neutral-400">
                  <Package size={14} />
                  <span>Looking for an Order?</span>
                </div>
                <h4 className="font-nike text-xl font-bold uppercase">
                  TRACK LIVE DISPATCH
                </h4>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Have an order number? You can check live carrier telemetry, transit waybills, and estimated delivery dates immediately.
                </p>
                <button
                  onClick={() => goToTracking(orderNumber || undefined)}
                  className="w-full py-3 bg-white text-black hover:bg-neutral-100 rounded-full text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Open Tracking Telemetry</span>
                  <ArrowRight size={13} />
                </button>
              </div>

            </div>

          </div>
        )}

        {/* TAB 2: LOOKUP EXISTING TICKETS & LIVE REPLIES */}
        {activeTab === 'lookup' && (
          <div className="space-y-6">
            
            {/* Search Filter Bar */}
            <div className="bg-neutral-50 border border-neutral-200 p-4 rounded-2xl flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                <input
                  type="text"
                  value={lookupQuery}
                  onChange={(e) => setLookupQuery(e.target.value)}
                  placeholder="Filter by Email, Ticket Number (TCK-...), or Order #..."
                  className="w-full bg-white border border-neutral-200 rounded-xl pl-10 pr-4 py-2.5 text-xs font-medium focus:outline-none focus:border-black"
                />
              </div>

              <button
                onClick={() => setLookupQuery(currentUser?.email || '')}
                className="px-4 py-2.5 bg-neutral-200 hover:bg-neutral-300 text-neutral-800 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-colors cursor-pointer"
              >
                Reset Filter
              </button>
            </div>

            {/* Split Screen View: Queue + Conversation Thread */}
            {matchingTickets.length === 0 ? (
              <div className="text-center py-16 border border-neutral-200 rounded-3xl p-8 space-y-4 bg-white">
                <LifeBuoy size={40} className="text-neutral-300 mx-auto" />
                <h3 className="font-nike text-2xl font-black uppercase text-black">
                  NO TICKETS FOUND
                </h3>
                <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                  {lookupQuery
                    ? `No support records matched "${lookupQuery}". Try entering your registered checkout email address or ticket identifier.`
                    : 'Enter your email or ticket reference in the search bar above to look up your conversations.'}
                </p>
                <button
                  onClick={() => setActiveTab('create')}
                  className="px-6 py-3 bg-black text-white text-xs font-bold uppercase rounded-full hover:bg-neutral-800 transition-colors"
                >
                  Create New Ticket
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Left Queue List */}
                <div className="lg:col-span-5 bg-white border border-neutral-200 rounded-3xl overflow-hidden shadow-xs">
                  <div className="p-4 border-b border-neutral-200 bg-neutral-50/70 flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-black">
                      YOUR TICKETS ({matchingTickets.length})
                    </span>
                    <span className="text-[10px] text-neutral-500 font-medium">Click to view thread</span>
                  </div>

                  <div className="divide-y divide-neutral-100 max-h-[580px] overflow-y-auto">
                    {matchingTickets.map((t) => {
                      const isSelected = activeSelectedTicket?.id === t.id;
                      const lastMsg = t.messages[t.messages.length - 1];

                      return (
                        <div
                          key={t.id}
                          onClick={() => setSelectedTicketId(t.id)}
                          className={`p-5 cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-neutral-50 border-l-4 border-black'
                              : 'hover:bg-neutral-50/60'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="font-mono text-xs font-bold text-black">
                              {t.ticketNumber}
                            </span>
                            {getStatusBadge(t.status)}
                          </div>

                          <h4 className="font-bold text-xs text-black line-clamp-1">
                            {t.subject}
                          </h4>

                          <p className="text-[11px] text-neutral-500 line-clamp-1 mt-1">
                            {lastMsg?.message || 'No messages'}
                          </p>

                          <div className="flex items-center justify-between mt-3 text-[10px] text-neutral-400 font-medium pt-2 border-t border-dashed border-neutral-200">
                            <span>{getCategoryLabel(t.category)}</span>
                            <span>{t.messages.length} {t.messages.length === 1 ? 'Message' : 'Messages'}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Right: Active Ticket Details & Message History */}
                {activeSelectedTicket && (
                  <div className="lg:col-span-7 bg-white border border-neutral-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
                    
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between pb-6 border-b border-neutral-200 gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-xs font-bold text-neutral-400">
                            {activeSelectedTicket.ticketNumber}
                          </span>
                          {getStatusBadge(activeSelectedTicket.status)}
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-neutral-100 text-neutral-700">
                            {activeSelectedTicket.priority} Priority
                          </span>
                        </div>

                        <h3 className="font-nike text-xl sm:text-2xl font-black uppercase text-black leading-snug">
                          {activeSelectedTicket.subject}
                        </h3>

                        <div className="text-xs text-neutral-500 mt-1 flex flex-wrap gap-2 items-center">
                          <span>Client: <strong className="text-black">{activeSelectedTicket.customerName}</strong> ({activeSelectedTicket.customerEmail})</span>
                          {activeSelectedTicket.orderNumber && (
                            <>
                              <span>•</span>
                              <button
                                onClick={() => goToTracking(activeSelectedTicket.orderNumber)}
                                className="underline font-bold text-black hover:text-neutral-600"
                              >
                                Order: {activeSelectedTicket.orderNumber}
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Messages Thread */}
                    <div className="space-y-4 max-h-[380px] overflow-y-auto pr-2">
                      {activeSelectedTicket.messages.map((msg) => {
                        const isStaff = msg.sender === 'admin' || msg.sender === 'support';

                        return (
                          <div
                            key={msg.id}
                            className={`p-4 rounded-2xl text-xs leading-relaxed space-y-1 ${
                              isStaff
                                ? 'bg-black text-white ml-4 sm:ml-8 shadow-sm'
                                : 'bg-neutral-100 text-neutral-900 mr-4 sm:mr-8'
                            }`}
                          >
                            <div className="flex items-center justify-between text-[10px] font-bold opacity-75 pb-1 border-b border-white/10">
                              <span className="flex items-center gap-1.5">
                                {isStaff && <Sparkles size={11} className="text-white" />}
                                <span>{msg.senderName}</span>
                              </span>
                              <span className="font-mono text-[9px]">{msg.timestamp}</span>
                            </div>
                            <p className="pt-1 whitespace-pre-wrap">{msg.message}</p>
                          </div>
                        );
                      })}
                    </div>

                    {/* Reply Input Form */}
                    <form onSubmit={handleCustomerReply} className="pt-4 border-t border-neutral-200 space-y-3">
                      <div className="relative">
                        <textarea
                          rows={3}
                          required
                          value={customerReplyText}
                          onChange={(e) => setCustomerReplyText(e.target.value)}
                          placeholder="Type your response to Rayluxx Support..."
                          className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl p-4 text-xs font-medium focus:bg-white focus:outline-none focus:border-black transition-all"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-neutral-400">
                          Replies are monitored live by operations specialists.
                        </span>
                        <button
                          type="submit"
                          className="px-6 py-2.5 bg-black hover:bg-neutral-800 text-white rounded-full text-xs font-bold uppercase tracking-wider transition-colors inline-flex items-center gap-2 cursor-pointer shadow-xs"
                        >
                          <Send size={13} />
                          <span>Send Reply</span>
                        </button>
                      </div>
                    </form>

                  </div>
                )}

              </div>
            )}

          </div>
        )}

        {/* BOTTOM FAQ ACCORDION SECTION */}
        <div className="mt-16 pt-12 border-t border-neutral-200">
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="text-center space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 block">
                FREQUENTLY RESOLVED INQUIRIES
              </span>
              <h2 className="font-nike text-3xl font-black uppercase text-black">
                INSTANT ANSWERS & SPECS
              </h2>
            </div>

            <div className="divide-y divide-neutral-200 border-y border-neutral-200">
              {FAQS.map((faq, index) => {
                const isOpen = faqExpanded === index;
                return (
                  <div key={index} className="py-4">
                    <button
                      onClick={() => setFaqExpanded(isOpen ? null : index)}
                      className="w-full flex items-center justify-between text-left font-bold text-sm text-black hover:text-neutral-600 transition-colors cursor-pointer"
                    >
                      <span>{faq.q}</span>
                      {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                    {isOpen && (
                      <p className="pt-3 text-xs text-neutral-600 leading-relaxed animate-fadeIn">
                        {faq.a}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
