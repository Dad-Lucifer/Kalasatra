import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Footer from '../landing/Footer';
import logoImg from '../../assets/kalastra-logo.png';

interface TocItem {
  id: string;
  num: string;
  title: string;
}

interface LegalLayoutProps {
  title: string;
  subtitle: string;
  docReference: string;
  effectiveDate: string;
  lastUpdated: string;
  jurisdiction: string;
  statutoryActs: string[];
  toc: TocItem[];
  children: React.ReactNode;
}

const LEGAL_TABS = [
  { label: 'Terms & Conditions', path: '/terms', short: 'Terms' },
  { label: 'Privacy Policy (DPDP Act, 2023)', path: '/privacy-policy', short: 'Privacy' },
  { label: 'Cookie Policy', path: '/cookie-policy', short: 'Cookies' },
  { label: 'Refund & Cancellation', path: '/refund-policy', short: 'Refunds' },
];

export default function LegalLayout({
  title,
  subtitle,
  docReference,
  effectiveDate,
  lastUpdated,
  jurisdiction,
  statutoryActs,
  toc,
  children,
}: LegalLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeToc, setActiveToc] = useState<string>('');

  const handlePrint = () => {
    window.print();
  };

  const scrollToClause = (id: string) => {
    setActiveToc(id);
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -90;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'auto' });
    }
  };

  const filteredToc = toc.filter(
    (item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.num.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F4F4F5] text-black font-serif antialiased selection:bg-black selection:text-white">
      {/* ── Inline Print Stylesheet & Clean Typography ── */}
      <style>{`
        @media print {
          body {
            background: #ffffff !important;
            color: #000000 !important;
          }
          .no-print, header, nav, footer, .toc-sidebar, .search-container, .print-hide {
            display: none !important;
          }
          .legal-paper {
            border: none !important;
            box-shadow: none !important;
            margin: 0 !important;
            padding: 0 !important;
            max-width: 100% !important;
          }
          .page-break {
            page-break-before: always;
          }
          a {
            text-decoration: none !important;
            color: #000000 !important;
          }
        }
        
        .legal-serif {
          font-family: "Times New Roman", Times, "Playfair Display", Georgia, serif;
        }
        
        .legal-mono {
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
        }

        .legal-sans {
          font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }
      `}</style>

      {/* ── Official Government / Statutory Banner (Top) ── */}
      <div className="no-print bg-black text-white text-[10px] sm:text-[11px] font-mono tracking-widest py-1.5 px-4 text-center border-b border-neutral-800 uppercase">
        <span>Republic of India • State of Maharashtra • E-Commerce Statutory Regulatory Compliance</span>
      </div>

      {/* ── Top Navigation Bar ── */}
      <header className="no-print sticky top-0 z-40 bg-white border-b-2 border-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Entity Name */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2 group">
              <img
                src={logoImg}
                alt="Kalastra Emblem"
                className="h-9 w-auto object-contain filter grayscale contrast-200"
              />
              <div>
                <span className="text-lg font-bold tracking-widest uppercase font-serif text-black block leading-none">
                  KALASTRA
                </span>
                <span className="text-[9px] tracking-widest text-neutral-600 uppercase font-mono">
                  Legal & Regulatory Affairs
                </span>
              </div>
            </Link>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => navigate('/')}
              className="px-3 py-1.5 text-xs font-mono font-semibold uppercase tracking-wider text-black border border-black hover:bg-black hover:text-white transition-none"
            >
              ← Back to Store
            </button>
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 text-xs font-mono font-bold uppercase tracking-wider bg-black text-white border border-black hover:bg-neutral-800 transition-none flex items-center gap-1.5"
              title="Print or Save as PDF"
            >
              <span>🖨️</span>
              <span className="hidden sm:inline">Print Document</span>
            </button>
          </div>
        </div>

        {/* ── Document Switcher Sub-Navigation ── */}
        <nav className="bg-[#EFEFEF] border-t border-neutral-300 px-4 sm:px-6 lg:px-8 overflow-x-auto no-scrollbar">
          <div className="max-w-7xl mx-auto flex items-center space-x-1 sm:space-x-2 py-1.5">
            <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500 mr-2 shrink-0 hidden md:inline">
              STATUTORY INSTRUMENTS:
            </span>
            {LEGAL_TABS.map((tab) => {
              const isActive = location.pathname === tab.path;
              return (
                <Link
                  key={tab.path}
                  to={tab.path}
                  className={`px-3 py-1 text-xs font-mono uppercase tracking-wider whitespace-nowrap border ${
                    isActive
                      ? 'bg-black text-white border-black font-bold'
                      : 'bg-white text-neutral-800 border-neutral-300 hover:border-black hover:text-black font-medium'
                  } transition-none`}
                >
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.short}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </header>

      {/* ── Document Container ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* ── Left Sidebar (Table of Contents & Quick Search) ── */}
          <aside className="no-print lg:w-72 shrink-0">
            <div className="sticky top-28 bg-white border-2 border-black p-5">
              <div className="border-b border-black pb-3 mb-4">
                <h3 className="text-xs font-bold font-mono uppercase tracking-widest text-black">
                  Clause Directory
                </h3>
                <p className="text-[10px] font-mono text-neutral-500 mt-0.5">
                  Official Section Index
                </p>
              </div>

              {/* Clause Search */}
              <div className="mb-4">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter clauses (e.g., DPDP, refund, tax)..."
                  className="w-full px-2.5 py-1.5 text-xs font-mono border border-black bg-neutral-50 text-black placeholder-neutral-400 outline-none focus:bg-white"
                />
              </div>

              {/* Section Jump List */}
              <div className="max-h-[60vh] overflow-y-auto space-y-1 pr-1 font-mono text-xs">
                {filteredToc.length === 0 ? (
                  <p className="text-neutral-500 text-[11px] py-2">No clauses match.</p>
                ) : (
                  filteredToc.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => scrollToClause(item.id)}
                      className={`w-full text-left px-2 py-1.5 text-[11px] leading-tight flex items-start gap-2 border-b border-neutral-100 ${
                        activeToc === item.id
                          ? 'bg-black text-white font-bold'
                          : 'text-neutral-800 hover:bg-neutral-100'
                      }`}
                    >
                      <span className="shrink-0 font-bold">{item.num}</span>
                      <span className="truncate">{item.title}</span>
                    </button>
                  ))
                )}
              </div>

              {/* Bottom Metadata Reminder */}
              <div className="mt-4 pt-3 border-t border-black text-[10px] font-mono text-neutral-600">
                <div>DOC: {docReference}</div>
                <div>STATE: MAHARASHTRA, INDIA</div>
              </div>
            </div>
          </aside>

          {/* ── Main Legal Document Paper ── */}
          <main className="flex-1 min-w-0">
            <article className="legal-paper bg-white border-2 border-black p-6 sm:p-10 md:p-14 shadow-sm text-black">
              
              {/* Formal Legal Header / Seal Docket */}
              <div className="border-b-4 border-double border-black pb-8 mb-8 text-center relative">
                
                {/* Formal Stamp Box */}
                <div className="inline-block border-2 border-black px-4 py-1 mb-4 text-[10px] font-mono uppercase tracking-[0.25em] font-bold">
                  OFFICIAL STATUTORY INSTRUMENT • JURISDICTION: MUMBAI, INDIA
                </div>

                <div className="text-xs font-mono tracking-widest text-neutral-600 uppercase mb-2">
                  GOVERNMENT OF INDIA STATUTORY COMPLIANCE DOCKET
                </div>

                <h1 className="text-2xl sm:text-4xl font-serif font-black tracking-tight uppercase text-black mb-3">
                  {title}
                </h1>

                <p className="text-xs sm:text-sm font-serif italic text-neutral-700 max-w-2xl mx-auto mb-6">
                  {subtitle}
                </p>

                {/* Metadata Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-neutral-50 border border-black p-3 text-left font-mono text-[10px] sm:text-[11px]">
                  <div>
                    <span className="text-neutral-500 uppercase block">DOCKET REF:</span>
                    <strong className="text-black">{docReference}</strong>
                  </div>
                  <div>
                    <span className="text-neutral-500 uppercase block">EFFECTIVE DATE:</span>
                    <strong className="text-black">{effectiveDate}</strong>
                  </div>
                  <div>
                    <span className="text-neutral-500 uppercase block">LAST REVISED:</span>
                    <strong className="text-black">{lastUpdated}</strong>
                  </div>
                  <div>
                    <span className="text-neutral-500 uppercase block">JURISDICTION:</span>
                    <strong className="text-black">{jurisdiction}</strong>
                  </div>
                </div>

                {/* Statutory Acts Citation */}
                <div className="mt-4 pt-3 border-t border-neutral-300 text-left font-mono text-[10px] text-neutral-600">
                  <span className="font-bold text-black uppercase">ENACTING STATUTES & LEGISLATIVE BASIS: </span>
                  {statutoryActs.join(' • ')}
                </div>
              </div>

              {/* Document Preamble / Notice of Enforceability */}
              <div className="border border-black bg-neutral-50 p-4 mb-8 text-xs font-serif leading-relaxed text-justify">
                <strong className="font-mono uppercase font-bold text-black block mb-1">
                  MANDATORY STATUTORY NOTICE & LEGAL BINDING EFFECT:
                </strong>
                THIS DOCUMENT IS AN ELECTRONIC RECORD GENERATED BY A COMPUTER SYSTEM PURSUANT TO THE
                PROVISIONS OF THE INFORMATION TECHNOLOGY ACT, 2000, THE INDIAN CONTRACT ACT, 1872, AND THE
                DIGITAL PERSONAL DATA PROTECTION ACT, 2023 (ACT NO. 22 OF 2023). THIS ELECTRONIC RECORD IS
                GENERATED WITHOUT PHYSICAL OR DIGITAL SIGNATURES UNDER APPLICABLE ELECTRONIC COMMERCE RULES.
                BY ACCESSING, BROWSING, OR PURCHASING PRODUCTS THROUGH KALASTRA, YOU ENTER INTO A LEGALLY
                ENFORCEABLE CONTRACT GOVERNED BY THE STATUTES OF THE REPUBLIC OF INDIA.
              </div>

              {/* Legal Clauses Body */}
              <div className="space-y-10 legal-content text-justify leading-relaxed font-serif text-[13px] sm:text-[14px]">
                {children}
              </div>

              {/* Attestation & Execution Block */}
              <div className="mt-14 pt-8 border-t-4 border-double border-black">
                <div className="text-xs font-mono uppercase tracking-widest text-neutral-500 mb-4">
                  EXECUTION & ISSUANCE ATTESTATION
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs font-mono">
                  <div className="border border-black p-4 bg-neutral-50">
                    <div className="text-[10px] text-neutral-500 uppercase mb-1">ISSUED BY AUTHORITY OF:</div>
                    <div className="font-bold text-black text-sm">KALASTRA</div>
                    <div className="text-neutral-700">Constitution: Sole Proprietorship</div>
                    <div className="text-neutral-700">Registered Office: Kopar Railway Station, Mumbai, Maharashtra, India</div>
                    <div className="text-neutral-700">Official Contact: kalastra29@gmail.com | +91 9082260829</div>
                    <div className="text-neutral-700 mt-2 font-bold text-[10px]">
                      REGULATION COMPLIANT: IT ACT 2000 • DPDP ACT 2023
                    </div>
                  </div>

                  <div className="border border-black p-4 bg-neutral-50 flex flex-col justify-between">
                    <div>
                      <div className="text-[10px] text-neutral-500 uppercase mb-1">OFFICIAL VERIFICATION SEAL:</div>
                      <div className="font-serif italic text-neutral-600 mb-3">
                        Certified as the authentic and current legal instrument of Kalastra E-Commerce operations.
                      </div>
                    </div>
                    <div className="border-t border-black pt-2 flex items-center justify-between">
                      <span className="font-bold text-black uppercase">STATUS: ENFORCEABLE</span>
                      <span className="text-[10px] text-neutral-500">MUMBAI JURISDICTION</span>
                    </div>
                  </div>
                </div>
              </div>

            </article>
          </main>
        </div>
      </div>

      {/* ── Main Site Footer ── */}
      <Footer />
    </div>
  );
}
