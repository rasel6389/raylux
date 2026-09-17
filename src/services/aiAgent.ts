import { AIAgentConfig } from '../types/ticket';
import { Order } from '../types/product';

export const DEFAULT_AI_CONFIG: AIAgentConfig = {
  enabled: true,
  model: 'gemini-3.8-flash',
  apiKey: '',
  systemPrompt: `You are the RAYLUX INTELLIGENCE AGENT — an ultra-responsive, architectural technical headwear specialist.
Tone: Concise, premium, technical, authoritative (Nike Tech / Acronym aesthetic).
You know the full Raylux catalog:
- MONOLITH 01 (Onyx, L/XL 58-61cm, $195 / £154)
- APEX STORM GORE-TEX 3L (All-weather waterproof membrane, $195 / £154)
- ARCHETYPE 03 (Bone, S/M 54-57cm, $160 / £126)
- CIPHER 04 CORDURA® 5-Panel (Adjustable, $95 / £75)
Shipping: Free Worldwide Express over $150 USD or £120 GBP. Carriers: DHL Express & FedEx Priority.
Returns: 30-Day Risk-Free Archival Exchange.
Currencies: Full native support for USD ($) and GBP (£).`,
  welcomeMessage: 'RAYLUX INTELLIGENCE ONLINE // Ask about sizing specs, GORE-TEX care, order waybills, or currency rates.',
  enableOrderLookup: true,
  enableTicketCreation: true,
};

const AI_CONFIG_KEY = 'raylux_ai_agent_config_v2';

export function getAIAgentConfig(): AIAgentConfig {
  try {
    const saved = localStorage.getItem(AI_CONFIG_KEY);
    if (saved) {
      return { ...DEFAULT_AI_CONFIG, ...JSON.parse(saved) };
    }
  } catch {
    // ignore
  }
  return DEFAULT_AI_CONFIG;
}

export function saveAIAgentConfig(config: AIAgentConfig): void {
  try {
    localStorage.setItem(AI_CONFIG_KEY, JSON.stringify(config));
  } catch {
    // ignore
  }
}

export async function queryRayluxAgent(
  userPrompt: string,
  orders: Order[],
  currency: 'USD' | 'GBP',
  exchangeRate: number,
  config = getAIAgentConfig()
): Promise<string> {
  const promptLower = userPrompt.toLowerCase().trim();

  // 1. Live Order Tracking Lookup
  if (config.enableOrderLookup) {
    const orderMatch = userPrompt.match(/RLX-[\w-]+/i);
    if (orderMatch) {
      const orderNum = orderMatch[0].toUpperCase();
      const found = orders.find((o) => o.orderNumber.toUpperCase() === orderNum);
      if (found) {
        const symbol = found.currency === 'GBP' ? '£' : '$';
        return `[ORDER TELEMETRY FOUND]\n\n• Order Number: ${found.orderNumber}\n• Status: ${found.status}\n• Carrier: ${found.carrier}\n• Waybill / Tracking: ${found.trackingNumber}\n• Total: ${symbol}${found.total.toFixed(2)}\n• Destination: ${found.shippingAddress.city}, ${found.shippingAddress.country}\n\nDispatch manifest is synchronized. Would you like to file a support ticket or request delivery updates?`;
      } else {
        return `[ORDER LOOKUP: NOT FOUND]\nWe could not locate order "${orderNum}" in our live dispatch database. Please check your tracking code or view "My Orders" in your member dashboard.`;
      }
    }

    if (promptLower.includes('track') || promptLower.includes('order status') || promptLower.includes('where is my order')) {
      if (orders.length > 0) {
        const latest = orders[0];
        return `[LATEST DISPATCH TELEMETRY]\n\n• Order: ${latest.orderNumber}\n• Status: ${latest.status}\n• Carrier: ${latest.carrier}\n• Tracking: ${latest.trackingNumber}\n\nTo inspect another order, simply share your order number (e.g. RLX-8921-EU).`;
      }
      return `Please provide your order reference number (e.g. RLX-8921-EU) and I will immediately query our real-time courier telemetry.`;
    }
  }

  // 2. Sizing Specs
  if (promptLower.includes('size') || promptLower.includes('fit') || promptLower.includes('measurement')) {
    return `[RAYLUX ANATOMICAL FIT GUIDE]\n\n• S/M (Small / Medium): Fits head circumferences 54 – 57 CM (21.2 – 22.4 IN). Tailored for low-profile crown depth.\n• L/XL (Large / Extra Large): Fits head circumferences 58 – 61 CM (22.8 – 24.0 IN). Engineered with deeper apex ergonomics.\n• ONE SIZE (Adjustable): Features high-tensile magnetic buckle and mil-spec webbing for 54 – 62 CM range.\n\nComplimentary size exchanges are included under our 30-Day Archival Policy.`;
  }

  // 3. GORE-TEX & Waterproof Material Tech
  if (promptLower.includes('gore-tex') || promptLower.includes('waterproof') || promptLower.includes('fabric') || promptLower.includes('rain')) {
    return `[MATERIAL ARCHITECTURE // GORE-TEX® 3L]\n\n• Membrane: Genuine GORE-TEX 3-Layer laminated with 28,000mm hydrostatic head waterproof rating.\n• Seam Construction: 13mm micro-bonded hot-air tape eliminating needle perforation leakage.\n• Breathability: RET < 6 m²Pa/W for continuous moisture vapor transmission during intense activity.\n• Care: Machine wash cold (30°C) with liquid technical detergent. Do not dry clean or use fabric softeners.`;
  }

  // 4. Currency & Pricing (USD vs GBP)
  if (promptLower.includes('currency') || promptLower.includes('pound') || promptLower.includes('dollar') || promptLower.includes('gbp') || promptLower.includes('usd') || promptLower.includes('exchange rate')) {
    const rateText = `1 USD = £${exchangeRate.toFixed(2)} GBP`;
    const thresholdText = currency === 'GBP' ? '£120' : '$150';
    return `[CURRENCY MATRIX // DUAL FX ENGINE]\n\n• Active Currency: ${currency} (${currency === 'GBP' ? '£ British Pound' : '$ US Dollar'})\n• Live Rate: ${rateText}\n• Free Express Shipping: Over ${thresholdText}\n\nYou can toggle between USD ($) and GBP (£) anytime from the top bar currency selector. All prices and checkout invoices calculate in real-time.`;
  }

  // 5. Shipping & Worldwide Dispatch
  if (promptLower.includes('ship') || promptLower.includes('delivery') || promptLower.includes('courier') || promptLower.includes('dispatch')) {
    return `[GLOBAL DISPATCH NETWORK]\n\n• UK & EU Transit: 1–3 business days via DHL Express Global.\n• US & Americas: 2–4 business days via FedEx Priority.\n• Rest of World: 3–5 business days with full door-to-door telemetry.\n• Threshold: Free dispatch on all orders over $150 USD or £120 GBP.`;
  }

  // 6. Returns & Warranty
  if (promptLower.includes('return') || promptLower.includes('refund') || promptLower.includes('exchange') || promptLower.includes('warranty')) {
    return `[30-DAY ARCHIVAL RETURN POLICY]\n\nAll unworn Raylux silhouettes in original packaging with intact security seals qualify for complimentary returns or exchanges within 30 days of arrival. You can generate a return waybill directly from your Member Dashboard or open a Support Ticket.`;
  }

  // 7. Support Ticket Query
  if (promptLower.includes('ticket') || promptLower.includes('contact') || promptLower.includes('human') || promptLower.includes('support team')) {
    return `[CUSTOMER CARE SUPPORT DESK]\n\nYou can open an official support ticket anytime from your Member Dashboard under the "Support Tickets" tab. Our operations team reviews all inquiries within 2 hours.`;
  }

  // 8. If Gemini API key configured, query Google Gemini
  if (config.apiKey && config.apiKey.trim().length > 10) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${config.apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [
                  { text: `${config.systemPrompt}\n\nCustomer question: ${userPrompt}` },
                ],
              },
            ],
          }),
        }
      );
      if (response.ok) {
        const data = await response.json();
        const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (aiText) return aiText;
      }
    } catch {
      // Fallback to semantic response
    }
  }

  // Default Technical Assistant response
  return `RAYLUX INTELLIGENCE // Model: ${config.model.toUpperCase()}\n\nThank you for reaching out. We specialize in architectural technical headwear engineered with GORE-TEX® 3L and CORDURA® textiles.\n\nHow may I assist you further? You can ask about:\n• Sizing & ergonomic crown fit (S/M vs L/XL)\n• Order tracking waybills (share your RLX order number)\n• USD / GBP currency conversions\n• Global dispatch timelines and return protocols`;
}

export const askGeminiAgent = (
  userPrompt: string,
  orders: Order[],
  currency: 'USD' | 'GBP' = 'USD',
  exchangeRate: number = 0.79,
  config = getAIAgentConfig()
) => queryRayluxAgent(userPrompt, orders, currency, exchangeRate, config);
