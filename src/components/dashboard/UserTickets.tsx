import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTickets } from '../../context/TicketContext';
import { CreateTicketModal } from '../account/CreateTicketModal';
import { SupportTicket } from '../../types/ticket';
import { Plus, LifeBuoy, MessageSquare, Clock, CheckCircle2, ChevronDown, ChevronUp, Send } from 'lucide-react';

export const UserTickets: React.FC = () => {
  const { currentUser } = useAuth();
  const { tickets, addReply } = useTickets();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [expandedTicketId, setExpandedTicketId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState<{ [ticketId: string]: string }>({});

  // Filter tickets for current user (or show all customer tickets if demo member)
  const userTickets = currentUser
    ? tickets.filter((t) => t.customerEmail.toLowerCase() === currentUser.email.toLowerCase() || t.userId === currentUser.id)
    : tickets;

  const toggleExpand = (id: string) => {
    setExpandedTicketId((prev) => (prev === id ? null : id));
  };

  const handleSendReply = (ticketId: string) => {
    const text = replyText[ticketId]?.trim();
    if (!text) return;

    addReply(ticketId, text, 'customer', currentUser?.name || 'Customer');
    setReplyText((prev) => ({ ...prev, [ticketId]: '' }));
  };

  const getStatusBadge = (status: SupportTicket['status']) => {
    switch (status) {
      case 'OPEN':
        return (
          <span className="px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-full text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            <span>Open</span>
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="px-2.5 py-1 bg-blue-50 text-blue-800 border border-blue-200 rounded-full text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
            <span>In Progress</span>
          </span>
        );
      case 'RESOLVED':
        return (
          <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1">
            <CheckCircle2 size={10} />
            <span>Resolved</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn font-sans">
      {/* Header Banner */}
      <div className="bg-white border border-neutral-200 p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-neutral-400">
            CLIENT CONCIERGE & CARE
          </span>
          <h2 className="font-nike text-3xl font-black uppercase text-black mt-0.5">
            SUPPORT TICKETS ({userTickets.length})
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Direct communication channel with Rayluxx product specialists and dispatch operations.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-5 py-2.5 bg-black text-white hover:bg-neutral-800 rounded-full text-xs font-bold uppercase tracking-wider transition-all inline-flex items-center gap-2 shadow-xs active:scale-95 whitespace-nowrap"
        >
          <Plus size={14} />
          <span>New Support Ticket</span>
        </button>
      </div>

      {/* Tickets List */}
      {userTickets.length === 0 ? (
        <div className="bg-white border border-neutral-200 rounded-2xl p-12 text-center space-y-3 shadow-xs">
          <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center mx-auto text-neutral-400">
            <LifeBuoy size={24} />
          </div>
          <h3 className="font-nike text-xl font-black uppercase text-black">NO ACTIVE TICKETS</h3>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
            You currently have no open inquiries. Need assistance with an order, sizing, or returns?
          </p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-5 py-2 bg-black text-white rounded-full text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 transition-colors inline-block"
          >
            Create Ticket
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {userTickets.map((tck) => {
            const isExpanded = expandedTicketId === tck.id;
            return (
              <div
                key={tck.id}
                className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-xs transition-all hover:border-neutral-300"
              >
                {/* Ticket Summary Row */}
                <div
                  onClick={() => toggleExpand(tck.id)}
                  className="p-5 sm:p-6 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-black text-black">
                        {tck.ticketNumber}
                      </span>
                      {tck.orderNumber && (
                        <span className="text-[10px] font-mono font-bold bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded-full border border-neutral-200">
                          Order: {tck.orderNumber}
                        </span>
                      )}
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-full">
                        {tck.category.replace('_', ' ')}
                      </span>
                      {getStatusBadge(tck.status)}
                    </div>

                    <h4 className="font-bold text-sm text-black sm:text-base">
                      {tck.subject}
                    </h4>

                    <div className="flex items-center gap-4 text-[11px] text-neutral-400">
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        <span>Opened {new Date(tck.createdAt).toLocaleDateString()}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare size={12} />
                        <span>{tck.messages.length} message{tck.messages.length > 1 ? 's' : ''}</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-neutral-100">
                    <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                      {isExpanded ? 'Hide Thread' : 'View Thread'}
                    </span>
                    <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-600">
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                  </div>
                </div>

                {/* Expanded Thread */}
                {isExpanded && (
                  <div className="border-t border-neutral-200 bg-neutral-50/50 p-5 sm:p-6 space-y-4 animate-fadeIn">
                    <div className="space-y-3">
                      {tck.messages.map((m) => {
                        const isUser = m.sender === 'customer';
                        return (
                          <div
                            key={m.id}
                            className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                          >
                            <div className="flex items-center gap-2 mb-1 px-1">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                                {m.senderName}
                              </span>
                              <span className="text-[10px] font-mono text-neutral-400">
                                {m.timestamp}
                              </span>
                            </div>

                            <div
                              className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                                isUser
                                  ? 'bg-black text-white rounded-tr-sm'
                                  : 'bg-white text-neutral-800 border border-neutral-200 rounded-tl-sm'
                              }`}
                            >
                              {m.message}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Reply Input */}
                    {tck.status !== 'RESOLVED' ? (
                      <div className="pt-3 border-t border-neutral-200">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={replyText[tck.id] || ''}
                            onChange={(e) => setReplyText({ ...replyText, [tck.id]: e.target.value })}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSendReply(tck.id);
                            }}
                            placeholder="Type reply to Rayluxx support operations..."
                            className="flex-1 border border-neutral-300 rounded-full px-4 py-2.5 text-xs bg-white focus:outline-none focus:border-black"
                          />
                          <button
                            onClick={() => handleSendReply(tck.id)}
                            disabled={!replyText[tck.id]?.trim()}
                            className="px-4 py-2.5 bg-black text-white rounded-full text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 disabled:opacity-40 transition-colors inline-flex items-center gap-1.5 shadow-xs"
                          >
                            <span>Send</span>
                            <Send size={12} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 bg-neutral-100 rounded-xl text-center text-xs text-neutral-500 font-medium">
                        This support ticket has been resolved. If you have additional inquiries, please open a new ticket.
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Ticket Creation Modal */}
      <CreateTicketModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
};
