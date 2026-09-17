export interface TicketMessage {
  id: string;
  sender: 'customer' | 'support' | 'admin' | 'ai';
  senderName: string;
  message: string;
  timestamp: string;
}

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  userId?: string;
  customerName: string;
  customerEmail: string;
  orderNumber?: string;
  subject: string;
  category: 'ORDER_STATUS' | 'RETURN_EXCHANGE' | 'SIZING_HELP' | 'BILLING' | 'PRODUCT_INQUIRY' | 'OTHER';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
  createdAt: string;
  updatedAt: string;
  messages: TicketMessage[];
}

export interface AIAgentConfig {
  enabled: boolean;
  model: 'gemini-3.8-flash' | 'gemini-3.5-pro' | 'gemini-2.5-flash';
  apiKey?: string;
  temperature?: number;
  systemPrompt: string;
  welcomeMessage: string;
  enableOrderLookup: boolean;
  enableTicketCreation: boolean;
}
