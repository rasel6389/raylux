import React, { createContext, useContext, useState, useEffect } from 'react';
import { SupportTicket } from '../types/ticket';

interface TicketContextType {
  tickets: SupportTicket[];
  createTicket: (data: {
    customerName: string;
    customerEmail: string;
    userId?: string;
    orderNumber?: string;
    subject: string;
    category: SupportTicket['category'];
    priority: SupportTicket['priority'];
    initialMessage: string;
  }) => SupportTicket;
  addReply: (ticketId: string, message: string, sender: 'customer' | 'support' | 'admin' | 'ai', senderName: string) => void;
  updateTicketStatus: (ticketId: string, status: SupportTicket['status']) => void;
  getTicketsByEmail: (email: string) => SupportTicket[];
}

const DEFAULT_TICKETS: SupportTicket[] = [
  {
    id: 'tck-001',
    ticketNumber: 'TCK-8921-UK',
    userId: 'usr-marcus-01',
    customerName: 'Marcus Vance',
    customerEmail: 'marcus.vance@studio.com',
    orderNumber: 'RLX-8921-EU',
    subject: 'GORE-TEX 3L Waterproof membrane maintenance protocol',
    category: 'PRODUCT_INQUIRY',
    priority: 'MEDIUM',
    status: 'IN_PROGRESS',
    createdAt: '2026-09-14T10:30:00Z',
    updatedAt: '2026-09-15T14:20:00Z',
    messages: [
      {
        id: 'msg-1',
        sender: 'customer',
        senderName: 'Marcus Vance',
        message: 'Could you confirm the recommended wash cycle temperature for the Apex Storm GORE-TEX 3L silhouette without stripping the DWR coating?',
        timestamp: 'Sep 14, 2026 • 10:30 AM',
      },
      {
        id: 'msg-2',
        sender: 'support',
        senderName: 'Rayluxx Ops Specialist',
        message: 'Hello Marcus. For GORE-TEX 3L editions, machine wash on cold/delicate (30°C max) using liquid technical detergent. Line dry away from direct heat sources to preserve seam bonding.',
        timestamp: 'Sep 15, 2026 • 02:20 PM',
      },
    ],
  },
  {
    id: 'tck-002',
    ticketNumber: 'TCK-8742-EU',
    userId: 'usr-elena-02',
    customerName: 'Elena Rostova',
    customerEmail: 'elena.rostova@design.de',
    orderNumber: 'RLX-8874-US',
    subject: 'Exchange S/M for L/XL 58-61CM crown fit',
    category: 'RETURN_EXCHANGE',
    priority: 'HIGH',
    status: 'OPEN',
    createdAt: '2026-09-16T08:15:00Z',
    updatedAt: '2026-09-16T08:15:00Z',
    messages: [
      {
        id: 'msg-3',
        sender: 'customer',
        senderName: 'Elena Rostova',
        message: 'The Cordura 5-Panel arrived today in pristine condition, but my head circumference is 59cm and S/M is slightly snug. Requesting exchange dispatch for L/XL.',
        timestamp: 'Sep 16, 2026 • 08:15 AM',
      },
    ],
  },
];

const TICKETS_STORAGE_KEY = 'raylux_support_tickets_v2';

const TicketContext = createContext<TicketContextType | undefined>(undefined);

export const TicketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tickets, setTickets] = useState<SupportTicket[]>(() => {
    try {
      const saved = localStorage.getItem(TICKETS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return DEFAULT_TICKETS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(TICKETS_STORAGE_KEY, JSON.stringify(tickets));
    } catch {
      // ignore
    }
  }, [tickets]);

  const createTicket = (data: {
    customerName: string;
    customerEmail: string;
    userId?: string;
    orderNumber?: string;
    subject: string;
    category: SupportTicket['category'];
    priority: SupportTicket['priority'];
    initialMessage: string;
  }): SupportTicket => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const newTicket: SupportTicket = {
      id: `tck-${Date.now()}`,
      ticketNumber: `TCK-${randomNum}-UK`,
      userId: data.userId,
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      orderNumber: data.orderNumber,
      subject: data.subject,
      category: data.category,
      priority: data.priority,
      status: 'OPEN',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [
        {
          id: `msg-${Date.now()}`,
          sender: 'customer',
          senderName: data.customerName,
          message: data.initialMessage,
          timestamp: new Date().toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }),
        },
      ],
    };

    setTickets((prev) => [newTicket, ...prev]);
    return newTicket;
  };

  const addReply = (
    ticketId: string,
    message: string,
    sender: 'customer' | 'support' | 'admin' | 'ai',
    senderName: string
  ) => {
    const newReply = {
      id: `msg-${Date.now()}`,
      sender,
      senderName,
      message,
      timestamp: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    setTickets((prev) =>
      prev.map((t) => {
        if (t.id === ticketId) {
          return {
            ...t,
            updatedAt: new Date().toISOString(),
            status: sender === 'support' || sender === 'admin' ? 'IN_PROGRESS' : t.status,
            messages: [...t.messages, newReply],
          };
        }
        return t;
      })
    );
  };

  const updateTicketStatus = (ticketId: string, status: SupportTicket['status']) => {
    setTickets((prev) =>
      prev.map((t) => (t.id === ticketId ? { ...t, status, updatedAt: new Date().toISOString() } : t))
    );
  };

  const getTicketsByEmail = (email: string) => {
    const trimmed = email.trim().toLowerCase();
    return tickets.filter((t) => t.customerEmail.toLowerCase() === trimmed);
  };

  return (
    <TicketContext.Provider
      value={{
        tickets,
        createTicket,
        addReply,
        updateTicketStatus,
        getTicketsByEmail,
      }}
    >
      {children}
    </TicketContext.Provider>
  );
};

export const useTickets = () => {
  const context = useContext(TicketContext);
  if (!context) {
    throw new Error('useTickets must be used within a TicketProvider');
  }
  return context;
};
