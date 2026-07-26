import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import logoImg from '../assets/kalastra-logo.png';

interface Section {
  id: string;
  num: number;
  title: string;
  category: 'general' | 'orders' | 'returns' | 'legal';
  icon: string;
  content: Array<{
    type: 'paragraph' | 'bullet_list' | 'callout' | 'key_value';
    text?: string;
    items?: string[];
    calloutType?: 'warning' | 'info' | 'important';
    keyValue?: Array<{ label: string; value: string }>;
  }>;
}

const customStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&family=Outfit:wght@300;400;500;600&display=swap');
  
  .font-cinzel { font-family: 'Cinzel', serif; }
  .font-outfit { font-family: 'Outfit', sans-serif; }
  
  .glass-panel {
    background: rgba(26, 11, 46, 0.5);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(212, 175, 55, 0.18);
    box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.4);
  }
  
  .gold-gradient-text {
    background: linear-gradient(135deg, #FFDF73 0%, #D4AF37 50%, #B8922A 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .gold-border-glow {
    border: 1px solid rgba(212, 175, 55, 0.35);
    box-shadow: 0 0 20px rgba(212, 175, 55, 0.15);
  }

  /* Hide scrollbar for Chrome, Safari and Opera */
  .no-scrollbar::-webkit-scrollbar {
    display: none;
  }
  /* Hide scrollbar for IE, Edge and Firefox */
  .no-scrollbar {
    -ms-overflow-style: none;  /* IE and Edge */
    scrollbar-width: none;  /* Firefox */
  }

  ::-webkit-scrollbar {
    width: 5px;
    height: 5px;
  }
  ::-webkit-scrollbar-track {
    background: #0f0518;
  }
  ::-webkit-scrollbar-thumb {
    background: #D4AF37;
    border-radius: 3px;
  }
`;

const SECTIONS_DATA: Section[] = [
  {
    id: 'definitions',
    num: 1,
    title: 'DEFINITIONS',
    category: 'general',
    icon: '📖',
    content: [
      {
        type: 'key_value',
        keyValue: [
          { label: 'Business Days', value: 'Monday through Friday, excluding public holidays in Mumbai, Maharashtra.' },
          { label: 'Made-to-Order', value: 'A product manufactured, cut, stitched, or finished only after an order is confirmed and payment is received.' },
          { label: 'Order', value: 'A request placed by you through the Site to purchase one or more products.' },
          { label: 'Products', value: 'All physical clothing items and accessories offered for sale by Kalastra on the Site.' },
          { label: 'Site', value: 'The Kalastra e-commerce website, subdomains, mobile versions, and related services.' },
        ],
      },
    ],
  },
  {
    id: 'about-kalastra',
    num: 2,
    title: 'ABOUT KALASTRA',
    category: 'general',
    icon: '🏛️',
    content: [
      {
        type: 'paragraph',
        text: 'Kalastra is a clothing brand registered and operating as a sole proprietorship in India.',
      },
      {
        type: 'key_value',
        keyValue: [
          { label: 'Legal Name', value: 'Kalastra' },
          { label: 'Constitution', value: 'Sole Proprietorship' },
          { label: 'Registered Address', value: 'Kopar Railway Station, Mumbai, Maharashtra, India' },
          { label: 'GST Registration', value: 'Available on request and reflected in your purchase invoice' },
          { label: 'Customer Support Email', value: 'kalastra29@gmail.com' },
          { label: 'Customer Support Phone', value: '+91 9082260829' },
        ],
      },
    ],
  },
  {
    id: 'account-security',
    num: 3,
    title: 'ACCOUNT REGISTRATION AND SECURITY',
    category: 'general',
    icon: '🔐',
    content: [
      {
        type: 'bullet_list',
        items: [
          'Account Creation: To place an order, you must create a user account on the Site. Guest checkout is not available. You agree to provide accurate, current, and complete information.',
          'Account Security: You are solely responsible for maintaining the confidentiality of your login credentials and for all activities under your account. Notify us immediately of unauthorized use.',
          'Account Termination: We reserve the right to suspend or terminate your account if we suspect inaccurate information, fraudulent activity, or violation of these Terms.',
        ],
      },
    ],
  },
  {
    id: 'product-info',
    num: 4,
    title: 'PRODUCT INFORMATION AND AVAILABILITY',
    category: 'orders',
    icon: '🧵',
    content: [
      {
        type: 'callout',
        calloutType: 'info',
        text: 'Made-to-Order Manufacturing: Production begins only after your Order has been accepted and payment confirmed. Each garment is crafted specifically for you.',
      },
      {
        type: 'bullet_list',
        items: [
          'Product Descriptions: We strive to display Products accurately. Due to screen settings and fabric properties, exact colors and textures cannot be guaranteed.',
          'Variations: Slight variations in color, size, and finish do not constitute a defect. Minor measurement deviations of 1-2 cm may occur during tailoring.',
          'Size Chart: Consultation of the size chart is required prior to ordering.',
          'Limited Editions & Pre-Orders: Pre-order items are subject to specific production timelines and availability windows. Pre-orders cannot be cancelled once placed.',
          'No Custom Tailoring: All Products are manufactured according to standard size chart measurements. No alterations or custom fittings are provided.',
        ],
      },
    ],
  },
  {
    id: 'orders-cancellation',
    num: 5,
    title: 'ORDERS, ACCEPTANCE, AND CANCELLATION',
    category: 'orders',
    icon: '🚫',
    content: [
      {
        type: 'callout',
        calloutType: 'warning',
        text: 'STRICT NO-CANCELLATION POLICY: Once an Order is placed and payment received, cancellation is NOT permitted under any circumstances. Resource allocation begins immediately.',
      },
      {
        type: 'bullet_list',
        items: [
          'Order Acceptance: A binding contract is formed upon receipt of a payment confirmation email from us.',
          'Refusal or Cancellation by Us: We reserve the right to cancel orders due to manufacturing defects discovered during quality checks, pricing errors, or suspected fraud.',
          'Refunds on Company Cancellation: Full refund will be issued to the original payment method within 7-14 Business Days if cancelled by us.',
        ],
      },
    ],
  },
  {
    id: 'pricing-payment',
    num: 6,
    title: 'PRICING AND PAYMENT',
    category: 'orders',
    icon: '💳',
    content: [
      {
        type: 'bullet_list',
        items: [
          'Currency & Taxes: Prices are in Indian Rupees (INR) and inclusive of Goods and Services Tax (GST).',
          'Payment Gateways: Exclusively online via Razorpay and integrated gateways. Cash on delivery, bank transfers, and offline methods are not accepted.',
          'Pricing Errors: In the event of a material pricing error, you will be offered the choice to reconfirm at the correct price or cancel for a full refund.',
        ],
      },
    ],
  },
  {
    id: 'shipping-delivery',
    num: 7,
    title: 'SHIPPING, DELIVERY, AND RISK OF LOSS',
    category: 'orders',
    icon: '🚚',
    content: [
      {
        type: 'key_value',
        keyValue: [
          { label: 'Shipping Region', value: 'Exclusively within India (no international shipping)' },
          { label: 'Delivery Timeline', value: '7 to 14 Business Days from Order confirmation (includes production + transit)' },
          { label: 'Transit Risk', value: 'Kalastra bears risk of loss or damage until delivery at your provided address' },
          { label: 'Address Accuracy', value: 'User is responsible for complete address. Re-shipment fees apply for address errors' },
        ],
      },
    ],
  },
  {
    id: 'returns-refunds',
    num: 8,
    title: 'RETURNS, REFUNDS, AND EXCHANGES',
    category: 'returns',
    icon: '↺',
    content: [
      {
        type: 'callout',
        calloutType: 'important',
        text: 'All sales are final. Returns are strictly limited to damaged, defective, or incorrect items reported within 7 calendar days of delivery.',
      },
      {
        type: 'bullet_list',
        items: [
          'Return Window: Must notify us within 7 calendar days of delivery with digital photos of damage and packaging.',
          'Condition: Must be original, unused, unwashed, unaltered condition with tags intact.',
          'Non-Returnable Items: Worn, washed, ironed, tag-less items, or sale/discounted items are final sale.',
          'Exchanges: Direct exchanges are not offered. Return eligible defective item for refund and place a new order.',
          'Return Shipping: Kalastra bears return shipping cost for approved defective/damaged returns.',
          'Refund Processing: Issued to original payment method within 7 to 14 Business Days after inspection approval.',
        ],
      },
    ],
  },
  {
    id: 'intellectual-property',
    num: 9,
    title: 'INTELLECTUAL PROPERTY RIGHTS',
    category: 'legal',
    icon: '⚖️',
    content: [
      {
        type: 'paragraph',
        text: 'All content on the Site—including text, graphics, logos, images, software, and design aesthetics—is the exclusive property of Kalastra protected under Indian IP laws.',
      },
      {
        type: 'bullet_list',
        items: [
          'Trademarks: Kalastra trademark and brand elements cannot be used without prior written consent.',
          'License: Limited, non-exclusive, non-transferable license for personal, non-commercial use.',
          'Prohibitions: Copying, scraping, selling, or duplicating any content or product designs is strictly prohibited.',
        ],
      },
    ],
  },
  {
    id: 'user-conduct',
    num: 10,
    title: 'USER CONDUCT AND PROHIBITED ACTIVITIES',
    category: 'legal',
    icon: '🛡️',
    content: [
      {
        type: 'paragraph',
        text: 'You agree not to engage in fraudulent orders, backend intrusion, uploading malware, code exploitation, harassment of staff, or interfering with site operation. Violations result in immediate account termination and legal action.',
      },
    ],
  },
  {
    id: 'promotions-coupons',
    num: 11,
    title: 'PROMOTIONS AND DISCOUNT CODES',
    category: 'orders',
    icon: '🎟️',
    content: [
      {
        type: 'bullet_list',
        items: [
          'Discount Codes: Subject to specific terms communicated at offer creation.',
          'Non-Combinable: Cannot be combined with other offers unless explicitly stated.',
          'Modification: Kalastra reserves the right to withdraw or modify promotions at any time.',
        ],
      },
    ],
  },
  {
    id: 'disclaimer-warranties',
    num: 12,
    title: 'DISCLAIMER OF WARRANTIES',
    category: 'legal',
    icon: '⚠️',
    content: [
      {
        type: 'paragraph',
        text: 'Site and Products are provided on an "as is" and "as available" basis. Customer is responsible for following garment care instructions. Damage from improper washing or ironing voids liability.',
      },
    ],
  },
  {
    id: 'limitation-liability',
    num: 13,
    title: 'LIMITATION OF LIABILITY',
    category: 'legal',
    icon: '🔒',
    content: [
      {
        type: 'paragraph',
        text: 'To the maximum extent permitted by Indian law, Kalastra’s aggregate liability is limited to the purchase price paid for the specific product in claim.',
      },
    ],
  },
  {
    id: 'indemnification',
    num: 14,
    title: 'INDEMNIFICATION',
    category: 'legal',
    icon: '🛡️',
    content: [
      {
        type: 'paragraph',
        text: 'You agree to defend and hold harmless Kalastra and its proprietor against claims, damages, or expenses arising from your use of the Site or violation of these Terms.',
      },
    ],
  },
  {
    id: 'third-party-services',
    num: 15,
    title: 'THIRD-PARTY SERVICES AND LINKS',
    category: 'legal',
    icon: '🔗',
    content: [
      {
        type: 'bullet_list',
        items: [
          'Payment Gateway: Handled securely via Razorpay. We do not store card details.',
          'Shipping Partners: Local courier logistics. Transit loss covered as per Section 7.',
          'External Links: We are not responsible for content or policies on third-party sites.',
        ],
      },
    ],
  },
  {
    id: 'privacy-data',
    num: 16,
    title: 'PRIVACY AND DATA COLLECTION',
    category: 'legal',
    icon: '🔒',
    content: [
      {
        type: 'paragraph',
        text: 'Governed by our separate Privacy Policy. We collect necessary data and analytics to fulfill orders and improve services.',
      },
    ],
  },
  {
    id: 'force-majeure',
    num: 17,
    title: 'FORCE MAJEURE',
    category: 'legal',
    icon: '🌧️',
    content: [
      {
        type: 'paragraph',
        text: 'Not liable for delays caused by acts of God, strikes, lockdowns, transport failures, or events beyond reasonable control. Timelines will extend accordingly.',
      },
    ],
  },
  {
    id: 'governing-law',
    num: 18,
    title: 'GOVERNING LAW AND DISPUTE RESOLUTION',
    category: 'legal',
    icon: '⚖️',
    content: [
      {
        type: 'key_value',
        keyValue: [
          { label: 'Governing Law', value: 'Laws of the Republic of India' },
          { label: 'Jurisdiction', value: 'Exclusive jurisdiction of courts in Mumbai, Maharashtra, India' },
          { label: 'Informal Resolution', value: 'Good-faith resolution required prior to litigation' },
        ],
      },
    ],
  },
  {
    id: 'modifications-terms',
    num: 19,
    title: 'MODIFICATIONS TO TERMS',
    category: 'general',
    icon: '📝',
    content: [
      {
        type: 'paragraph',
        text: 'We reserve the right to update these Terms at any time. Continued use of the Site after posting constitutes acceptance of revised terms.',
      },
    ],
  },
  {
    id: 'general-provisions',
    num: 20,
    title: 'GENERAL PROVISIONS',
    category: 'legal',
    icon: '📄',
    content: [
      {
        type: 'bullet_list',
        items: [
          'Severability: Invalid provisions do not affect the validity of remaining provisions.',
          'Waiver: Failure to enforce a right does not constitute a waiver.',
          'Entire Agreement: Terms + Privacy Policy + Order Confirmation form the complete agreement.',
        ],
      },
    ],
  },
  {
    id: 'contact-information',
    num: 21,
    title: 'CONTACT INFORMATION',
    category: 'general',
    icon: '📞',
    content: [
      {
        type: 'key_value',
        keyValue: [
          { label: 'Email', value: 'kalastra29@gmail.com' },
          { label: 'Phone', value: '+91 9082260829' },
          { label: 'Mailing Address', value: 'Kalastra, Kopar Railway Station, Mumbai, Maharashtra, India' },
          { label: 'Support SLA', value: 'Up to 2 Business Days for email response' },
        ],
      },
    ],
  },
];

export default function TermsPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [activeSectionId, setActiveSectionId] = useState<string>('definitions');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  
  // Accordion state (ProductDetailPage style)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(() => {
    // Expand first 3 by default
    const initial: Record<string, boolean> = {};
    SECTIONS_DATA.forEach((s, idx) => {
      initial[s.id] = idx < 3;
    });
    return initial;
  });

  const toggleSection = (id: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const expandAll = () => {
    const all: Record<string, boolean> = {};
    SECTIONS_DATA.forEach((s) => (all[s.id] = true));
    setExpandedSections(all);
  };

  const collapseAll = () => {
    const none: Record<string, boolean> = {};
    SECTIONS_DATA.forEach((s) => (none[s.id] = false));
    setExpandedSections(none);
  };

  // Filter sections by search and category
  const filteredSections = useMemo(() => {
    return SECTIONS_DATA.filter((sec) => {
      const matchesCategory = activeCategory === 'all' || sec.category === activeCategory;
      const q = searchQuery.toLowerCase().trim();
      if (!q) return matchesCategory;

      const matchesTitle = sec.title.toLowerCase().includes(q);
      const matchesContent = sec.content.some((c) => {
        if (c.text?.toLowerCase().includes(q)) return true;
        if (c.items?.some((i) => i.toLowerCase().includes(q))) return true;
        if (c.keyValue?.some((kv) => kv.label.toLowerCase().includes(q) || kv.value.toLowerCase().includes(q))) return true;
        return false;
      });

      return matchesCategory && (matchesTitle || matchesContent);
    });
  }, [searchQuery, activeCategory]);

  // When searching, expand matching sections automatically
  useEffect(() => {
    if (searchQuery.trim()) {
      const expanded: Record<string, boolean> = {};
      filteredSections.forEach((s) => (expanded[s.id] = true));
      setExpandedSections(expanded);
    }
  }, [searchQuery, filteredSections]);

  // Scroll spy to highlight active nav item
  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + 220;
      for (const sec of SECTIONS_DATA) {
        const el = document.getElementById(sec.id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveSectionId(sec.id);
            break;
          }
        }
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    // Ensure section is expanded
    setExpandedSections((prev) => ({ ...prev, [id]: true }));
    
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) {
        const yOffset = -110;
        const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }, 50);
  };

  const copySectionLink = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/terms#${id}`;
    navigator.clipboard.writeText(url);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2500);
  };

  return (
    <div className="min-h-screen bg-[#0f0518] font-outfit text-[#FDFBF7] selection:bg-[#D4AF37] selection:text-[#0f0518] relative overflow-x-hidden">
      <style>{customStyles}</style>

      {/* Atmospheric Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-[#3a1b66] blur-[180px] opacity-25" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#D4AF37] blur-[190px] opacity-10" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-15 mix-blend-overlay" />
      </div>

      {/* ─── Top Navbar ─── */}
      <header className="sticky top-0 z-50 glass-panel border-b border-[#D4AF37]/20 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 h-16 sm:h-20 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2.5 sm:gap-3 group cursor-pointer bg-transparent border-none"
          >
            <img src={logoImg} alt="Kalastra Logo" className="h-8 sm:h-10 w-auto object-contain drop-shadow-[0_0_8px_rgba(212,175,55,0.5)]" />
            <span className="text-lg sm:text-xl font-black gold-gradient-text font-cinzel tracking-widest group-hover:scale-105 transition-transform">
              Kalasatra
            </span>
          </button>

          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => navigate('/')}
              className="px-3 sm:px-4 py-2 rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[#A08BA6] hover:text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-all border border-transparent hover:border-[#D4AF37]/30 cursor-pointer"
            >
              ← <span className="hidden sm:inline">Back to</span> Store
            </button>
          </div>
        </div>
      </header>

      {/* ─── Hero Header (Product Detail Style Breadcrumb & Badge) ─── */}
      <section className="relative z-10 pt-8 sm:pt-14 pb-8 px-4 sm:px-6 text-center max-w-4xl mx-auto">
        <div className="flex items-center justify-center gap-2 mb-4">
          <button
            onClick={() => navigate('/')}
            className="text-[10px] sm:text-xs uppercase tracking-[0.15em] text-[#A08BA6] hover:text-[#D4AF37] transition-colors cursor-pointer bg-transparent border-none"
          >
            Store
          </button>
          <span className="text-[10px] text-[#D4AF37]/40">/</span>
          <span className="text-[10px] sm:text-xs uppercase tracking-[0.15em] text-[#D4AF37] font-semibold">
            Terms & Conditions
          </span>
        </div>

        <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#FFDF73] text-[9px] sm:text-[10px] font-black uppercase tracking-[0.25em] font-cinzel mb-4 shadow-[0_0_15px_rgba(212,175,55,0.15)]">
          <span>📜 Official Covenant</span>
          <span>•</span>
          <span>Updated: July 23, 2026</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black gold-gradient-text font-cinzel tracking-tight leading-tight mb-4">
          Terms & Conditions
        </h1>

        <p className="text-xs sm:text-base text-[#A08BA6] font-light leading-relaxed mb-8 max-w-2xl mx-auto px-2">
          Please review the official operating covenant governing your made-to-order purchases with Kalastra.
        </p>

        {/* Search Bar (Mobile + Desktop Optimized) */}
        <div className="relative max-w-xl mx-auto mb-8 px-2 sm:px-0">
          <svg className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-[#D4AF37]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search clauses (e.g. delivery, returns, GST, cancellation)..."
            className="w-full pl-12 sm:pl-14 pr-12 sm:pr-14 py-3.5 sm:py-4 bg-[#0a0310]/90 border border-[#D4AF37]/30 rounded-2xl text-[#FDFBF7] text-xs sm:text-sm placeholder-[#A08BA6]/50 outline-none focus:border-[#D4AF37] focus:shadow-[0_0_25px_rgba(212,175,55,0.25)] transition-all font-mono shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-6 top-1/2 -translate-y-1/2 text-[#A08BA6] hover:text-[#FDFBF7] text-xs font-bold uppercase tracking-wider cursor-pointer bg-transparent border-none"
            >
              ×
            </button>
          )}
        </div>

        {/* Feature Cards Grid (Inspiration from ProductDetailPage L383-398) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
          {[
            { icon: '🚫', title: 'No Cancellation', sub: 'Made-to-order garments' },
            { icon: '🚚', title: '7–14 Days Shipping', sub: 'Domestic India only' },
            { icon: '↺', title: '7-Day Return Window', sub: 'Defect / damaged items' },
            { icon: '💳', title: 'Online Gateways', sub: 'Razorpay integration' },
          ].map((item) => (
            <div
              key={item.title}
              className="glass-panel p-3.5 sm:p-4 rounded-2xl border border-gray-200/10 hover:border-[#D4AF37]/50 transition-all duration-300 group cursor-default"
            >
              <span className="text-xl sm:text-2xl block mb-1.5 group-hover:scale-110 transition-transform">{item.icon}</span>
              <p className="text-[10px] sm:text-xs font-bold text-[#FDFBF7] uppercase tracking-wider leading-snug">{item.title}</p>
              <p className="text-[9px] sm:text-[10px] text-[#A08BA6] mt-0.5">{item.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Mobile Category Horizontal Scrollbar Bar ─── */}
      <div className="lg:hidden sticky top-16 sm:top-20 z-40 bg-[#0f0518]/95 backdrop-blur-md border-b border-[#D4AF37]/20 py-2.5 px-4 overflow-x-auto no-scrollbar flex items-center gap-2">
        {[
          { id: 'all', label: 'All (21)' },
          { id: 'general', label: 'General' },
          { id: 'orders', label: 'Orders & Shipping' },
          { id: 'returns', label: 'Returns' },
          { id: 'legal', label: 'Legal & Conduct' },
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-3.5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer border shrink-0 ${
              activeCategory === cat.id
                ? 'bg-[#D4AF37] text-[#0f0518] border-[#D4AF37] shadow-[0_0_10px_rgba(212,175,55,0.4)]'
                : 'bg-[#1a0b2e]/60 text-[#A08BA6] border-[#D4AF37]/20'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* ─── Main Content Layout ─── */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-10 flex flex-col lg:flex-row gap-8 lg:gap-12">
        
        {/* Left Desktop Navigation Sidebar */}
        <aside className="hidden lg:block w-80 shrink-0">
          <div className="glass-panel rounded-3xl p-6 sticky top-28 space-y-6">
            <div>
              <h3 className="text-xs font-bold text-[#D4AF37] uppercase tracking-[0.25em] font-cinzel mb-3">
                Categories
              </h3>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'all', label: 'All (21)' },
                  { id: 'general', label: 'General' },
                  { id: 'orders', label: 'Orders & Shipping' },
                  { id: 'returns', label: 'Returns' },
                  { id: 'legal', label: 'Legal & Conduct' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer border ${
                      activeCategory === cat.id
                        ? 'bg-[#D4AF37] text-[#0f0518] border-[#D4AF37] shadow-[0_0_10px_rgba(212,175,55,0.4)]'
                        : 'bg-transparent text-[#A08BA6] border-[#D4AF37]/20 hover:border-[#D4AF37]/50 hover:text-[#FDFBF7]'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Accordion Controls */}
            <div className="flex gap-2 pt-2 border-t border-[#D4AF37]/15">
              <button
                onClick={expandAll}
                className="flex-1 py-1.5 rounded-lg border border-[#D4AF37]/25 text-[9px] font-bold text-[#D4AF37] uppercase tracking-widest hover:bg-[#D4AF37]/10 transition-all cursor-pointer bg-transparent"
              >
                Expand All
              </button>
              <button
                onClick={collapseAll}
                className="flex-1 py-1.5 rounded-lg border border-gray-700 text-[9px] font-bold text-[#A08BA6] uppercase tracking-widest hover:text-[#FDFBF7] transition-all cursor-pointer bg-transparent"
              >
                Collapse All
              </button>
            </div>

            <div className="border-t border-[#D4AF37]/15 pt-4 max-h-[50vh] overflow-y-auto pr-1 custom-scrollbar">
              <h3 className="text-xs font-bold text-[#D4AF37] uppercase tracking-[0.25em] font-cinzel mb-3">
                Index Navigation
              </h3>
              <nav className="space-y-1">
                {filteredSections.map((sec) => (
                  <button
                    key={sec.id}
                    onClick={() => scrollToSection(sec.id)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-2.5 cursor-pointer ${
                      activeSectionId === sec.id
                        ? 'bg-[#D4AF37]/20 text-[#FFDF73] border border-[#D4AF37]/40 font-bold shadow-[0_0_10px_rgba(212,175,55,0.15)]'
                        : 'text-[#A08BA6] hover:text-[#FDFBF7] hover:bg-white/5'
                    }`}
                  >
                    <span className="text-xs shrink-0">{sec.icon}</span>
                    <span className="truncate">
                      {sec.num}. {sec.title}
                    </span>
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </aside>

        {/* Right Clauses Accordions & Content List */}
        <main className="flex-1 space-y-4 sm:space-y-6 min-w-0">
          
          {/* Mobile Accordion Controls Bar */}
          <div className="lg:hidden flex items-center justify-between px-2 text-xs">
            <span className="text-[#A08BA6] uppercase tracking-widest text-[10px]">
              Showing <span className="text-[#D4AF37] font-bold">{filteredSections.length}</span> clauses
            </span>
            <div className="flex gap-2">
              <button
                onClick={expandAll}
                className="text-[9px] text-[#D4AF37] font-bold uppercase tracking-widest bg-transparent border-none cursor-pointer"
              >
                Expand All
              </button>
              <span className="text-gray-600">•</span>
              <button
                onClick={collapseAll}
                className="text-[9px] text-[#A08BA6] font-bold uppercase tracking-widest bg-transparent border-none cursor-pointer"
              >
                Collapse
              </button>
            </div>
          </div>

          {filteredSections.length === 0 ? (
            <div className="glass-panel rounded-3xl p-10 sm:p-16 text-center">
              <p className="text-4xl mb-4">🔍</p>
              <p className="text-base text-[#D4AF37] uppercase tracking-[0.25em] font-cinzel font-bold">No clauses match your query</p>
              <p className="text-xs text-[#A08BA6] mt-2">Try searching for terms like "delivery", "refund", "made to order", or "GST"</p>
              <button
                onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}
                className="mt-6 px-6 py-2.5 bg-[#D4AF37] text-[#0f0518] font-bold text-xs uppercase tracking-widest rounded-xl cursor-pointer hover:brightness-110 transition-all border-none"
              >
                Reset Search
              </button>
            </div>
          ) : (
            filteredSections.map((sec) => {
              const isExpanded = expandedSections[sec.id] ?? false;

              return (
                <article
                  key={sec.id}
                  id={sec.id}
                  className={`glass-panel rounded-2xl sm:rounded-3xl overflow-hidden transition-all duration-300 border ${
                    isExpanded ? 'border-[#D4AF37]/35 shadow-[0_0_30px_rgba(0,0,0,0.5)]' : 'border-[#D4AF37]/15 hover:border-[#D4AF37]/30'
                  }`}
                >
                  {/* Header / Accordion Trigger (Product Detail Style L368-375) */}
                  <div
                    onClick={() => toggleSection(sec.id)}
                    className="p-5 sm:p-7 flex items-center justify-between gap-4 cursor-pointer select-none bg-gradient-to-r from-transparent via-white/[0.02] to-transparent hover:bg-white/[0.04] transition-colors"
                  >
                    <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                      <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-lg sm:text-2xl shadow-[0_0_12px_rgba(212,175,55,0.15)] shrink-0">
                        {sec.icon}
                      </div>
                      <div className="min-w-0">
                        <span className="text-[9px] sm:text-[10px] font-black text-[#D4AF37] uppercase tracking-[0.25em] font-cinzel block">
                          Clause {sec.num}
                        </span>
                        <h2 className="text-sm sm:text-lg font-bold text-[#FDFBF7] font-cinzel tracking-wide truncate mt-0.5">
                          {sec.title}
                        </h2>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={(e) => copySectionLink(sec.id, e)}
                        className="p-2 rounded-lg border border-[#D4AF37]/20 text-[#A08BA6] hover:text-[#D4AF37] hover:border-[#D4AF37]/50 transition-all cursor-pointer bg-transparent text-[10px] hidden sm:flex items-center gap-1"
                        title="Copy Clause Link"
                      >
                        {copiedSection === sec.id ? (
                          <span className="text-[#10B981] font-bold">✓ Copied</span>
                        ) : (
                          <span>🔗 Link</span>
                        )}
                      </button>

                      {/* Accordion Chevron Indicator */}
                      <div className={`w-8 h-8 rounded-full border border-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37] transition-transform duration-300 ${isExpanded ? 'rotate-180 bg-[#D4AF37]/10' : ''}`}>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Expandable Accordion Body */}
                  {isExpanded && (
                    <div className="px-5 sm:px-8 pb-6 sm:pb-8 pt-2 border-t border-[#D4AF37]/10 space-y-4 animate-fade-in">
                      {sec.content.map((item, idx) => {
                        if (item.type === 'paragraph') {
                          return (
                            <p key={idx} className="text-xs sm:text-sm text-[#A08BA6] leading-relaxed font-light">
                              {item.text}
                            </p>
                          );
                        }

                        if (item.type === 'callout') {
                          const isWarn = item.calloutType === 'warning';
                          const isImp = item.calloutType === 'important';
                          return (
                            <div
                              key={idx}
                              className="p-4 sm:p-5 rounded-2xl border backdrop-blur-md relative overflow-hidden"
                              style={{
                                background: isWarn ? 'rgba(244,63,94,0.1)' : isImp ? 'rgba(212,175,55,0.1)' : 'rgba(59,130,246,0.1)',
                                borderColor: isWarn ? 'rgba(244,63,94,0.3)' : isImp ? 'rgba(212,175,55,0.3)' : 'rgba(59,130,246,0.3)',
                              }}
                            >
                              <div
                                className="absolute top-0 left-0 bottom-0 w-1.5"
                                style={{ background: isWarn ? '#F43F5E' : isImp ? '#D4AF37' : '#3B82F6' }}
                              />
                              <p className="text-xs sm:text-sm font-bold leading-relaxed tracking-wide" style={{ color: isWarn ? '#F43F5E' : isImp ? '#FFDF73' : '#60A5FA' }}>
                                {item.text}
                              </p>
                            </div>
                          );
                        }

                        if (item.type === 'bullet_list') {
                          return (
                            <ul key={idx} className="space-y-2.5 pl-1">
                              {item.items?.map((bullet, bIdx) => (
                                <li key={bIdx} className="flex items-start gap-2.5 text-xs sm:text-sm text-[#A08BA6] leading-relaxed font-light">
                                  <span className="text-[#D4AF37] font-bold text-xs mt-1 shrink-0">◆</span>
                                  <span>{bullet}</span>
                                </li>
                              ))}
                            </ul>
                          );
                        }

                        if (item.type === 'key_value') {
                          return (
                            <div key={idx} className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 bg-[#0a0310]/70 p-3.5 sm:p-4 rounded-2xl border border-[#D4AF37]/15">
                              {item.keyValue?.map((kv, kvIdx) => (
                                <div key={kvIdx} className="p-3 bg-[#1a0b2e]/50 rounded-xl border border-[#D4AF37]/10">
                                  <p className="text-[9px] font-black uppercase tracking-widest text-[#D4AF37] font-cinzel mb-1">{kv.label}</p>
                                  <p className="text-xs sm:text-sm text-[#FDFBF7] font-mono leading-snug break-words">{kv.value}</p>
                                </div>
                              ))}
                            </div>
                          );
                        }

                        return null;
                      })}
                    </div>
                  )}
                </article>
              );
            })
          )}

          {/* Contact Card at Bottom (Product Detail Feature Style) */}
          <div className="glass-panel rounded-3xl p-6 sm:p-10 text-center relative overflow-hidden border border-[#D4AF37]/30 shadow-[0_0_40px_rgba(212,175,55,0.15)] mt-12">
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-[#D4AF37]/15 to-transparent rounded-bl-full blur-3xl pointer-events-none" />
            <span className="text-3xl sm:text-4xl block mb-3">💬</span>
            <h3 className="text-lg sm:text-xl font-bold gold-gradient-text font-cinzel tracking-wider mb-2">Have Questions About Our Covenant?</h3>
            <p className="text-xs sm:text-sm text-[#A08BA6] max-w-md mx-auto mb-6 font-light leading-relaxed">
              Our customer support concierge is ready to assist you during standard business hours.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              <a
                href="mailto:kalastra29@gmail.com"
                className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-[#D4AF37] to-[#FFDF73] text-[#0f0518] text-xs font-black uppercase tracking-[0.2em] rounded-xl hover:shadow-[0_0_25px_rgba(212,175,55,0.5)] transition-all cursor-pointer font-cinzel text-center border-none"
              >
                Email Support
              </a>
              <a
                href="tel:+919082260829"
                className="w-full sm:w-auto px-6 py-3.5 bg-[#0a0310] text-[#D4AF37] text-xs font-black uppercase tracking-[0.2em] rounded-xl border border-[#D4AF37]/40 hover:bg-[#D4AF37]/10 transition-all cursor-pointer font-cinzel text-center"
              >
                Call +91 9082260829
              </a>
            </div>
          </div>
        </main>
      </div>

      {/* Floating Scroll to Top Button */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-6 right-5 z-40 w-11 h-11 sm:w-12 sm:h-12 rounded-full glass-panel border border-[#D4AF37]/40 text-[#D4AF37] flex items-center justify-center text-lg hover:bg-[#D4AF37] hover:text-[#0f0518] transition-all duration-300 cursor-pointer shadow-[0_0_20px_rgba(212,175,55,0.25)] hover:scale-110"
        title="Scroll to Top"
      >
        ↑
      </button>
    </div>
  );
}
