import LegalLayout from '../components/legal/LegalLayout';

const TOC = [
  { id: 'ck-1', num: '1.0', title: 'Statutory Context & Scope of Policy' },
  { id: 'ck-2', num: '2.0', title: 'Definition & Technical Operation of Cookies' },
  { id: 'ck-3', num: '3.0', title: 'Taxonomy of Cookies Employed by Kalastra' },
  { id: 'ck-4', num: '4.0', title: 'Strictly Necessary & Functional Storage' },
  { id: 'ck-5', num: '5.0', title: 'Payment Gateway Security Tokens (Razorpay)' },
  { id: 'ck-6', num: '6.0', title: 'Analytical & Performance Telemetry' },
  { id: 'ck-7', num: '7.0', title: 'Consent Framework under DPDP Act, 2023' },
  { id: 'ck-8', num: '8.0', title: 'Browser-Level Cookie Management & Opt-Out' },
  { id: 'ck-9', num: '9.0', title: 'Consequences of Disabling Essential Storage' },
  { id: 'ck-10', num: '10.0', title: 'Statutory Inquiries & Grievance Contact' },
];

const COOKIE_CATEGORIES = [
  {
    category: 'Strictly Necessary',
    tag: 'Essential',
    purpose: 'User authentication, active session tokens, and shopping cart persistence across page views.',
    lifespan: 'Session to 30 Days',
    consent: 'Exempt (Essential Operation)',
  },
  {
    category: 'Payment Security',
    tag: 'Security',
    purpose: 'Razorpay payment frame anti-fraud tokens, session anomaly detection, and CSRF protection.',
    lifespan: 'Session duration',
    consent: 'Exempt (Payment Security)',
  },
  {
    category: 'Functional State',
    tag: 'User Discretion',
    purpose: 'Theme mode preferences, recently viewed items, and client-side wishlist storage.',
    lifespan: 'Persistent (Local Storage)',
    consent: 'User Discretion',
  },
  {
    category: 'Performance Telemetry',
    tag: 'DPDP Compliant',
    purpose: 'Anonymized page rendering latency, crash reports, and system optimization telemetry.',
    lifespan: 'Up to 90 Days',
    consent: 'DPDP Act Compliant',
  },
];

export default function CookiePolicyPage() {
  return (
    <LegalLayout
      title="Cookie Policy & Tracking Technologies Instrument"
      subtitle="Formal Regulatory Instrument governing browser storage, telemetry tokens, and compliance with the Digital Personal Data Protection Act, 2023."
      docReference="KLS/LGL/2026-CK-POL/IND"
      effectiveDate="July 23, 2026"
      lastUpdated="September 27, 2026"
      jurisdiction="Republic of India • State of Maharashtra"
      statutoryActs={[
        'Digital Personal Data Protection Act, 2023 (Act No. 22 of 2023)',
        'Information Technology Act, 2000 (Act 21 of 2000)',
        'Information Technology (Intermediary Guidelines) Rules, 2021',
      ]}
      toc={TOC}
    >
      {/* ── SECTION 1.0 ── */}
      <section id="ck-1" className="border-b border-black pb-6 sm:pb-8">
        <div className="border-b border-neutral-300 pb-2 mb-3 sm:mb-4">
          <div className="text-[10px] sm:text-xs font-mono font-bold uppercase tracking-widest text-neutral-500 mb-1">
            CLAUSE 1.0
          </div>
          <h2 className="text-base sm:text-lg font-serif font-black uppercase text-black leading-snug break-words">
            1.0 STATUTORY CONTEXT &amp; SCOPE OF POLICY
          </h2>
        </div>
        <div className="space-y-3">
          <p>
            <strong>1.1 Legislative Basis:</strong> This Cookie Policy and Tracking Technologies Instrument (&ldquo;Cookie
            Policy&rdquo;) governs the deployment of cookies, local storage mechanisms, session identifiers, and related
            browser storage technologies on the Kalastra e-commerce platform. It is promulgated in adherence to the
            <em>Digital Personal Data Protection Act, 2023 (DPDP Act)</em> and the <em>Information Technology Act, 2000</em>.
          </p>
          <p>
            <strong>1.2 Applicability:</strong> This policy applies to all visitors, registered users, and purchasing
            customers accessing the platform through web browsers or mobile digital interfaces.
          </p>
        </div>
      </section>

      {/* ── SECTION 2.0 ── */}
      <section id="ck-2" className="border-b border-black pb-6 sm:pb-8">
        <div className="border-b border-neutral-300 pb-2 mb-3 sm:mb-4">
          <div className="text-[10px] sm:text-xs font-mono font-bold uppercase tracking-widest text-neutral-500 mb-1">
            CLAUSE 2.0
          </div>
          <h2 className="text-base sm:text-lg font-serif font-black uppercase text-black leading-snug break-words">
            2.0 DEFINITION &amp; TECHNICAL OPERATION OF COOKIES
          </h2>
        </div>
        <div className="space-y-3">
          <p>
            <strong>2.1 Technical Characterization:</strong> A cookie is a small alphanumeric text file transmitted by our
            web servers to your device&rsquo;s local hard drive or browser cache. Cookies enable our application to remember
            your preferences, authenticate your user session, maintain selected garments in your shopping cart, and ensure
            secure checkout processing.
          </p>
          <p>
            <strong>2.2 Local Storage &amp; Session Storage:</strong> In addition to HTTP cookies, the platform utilizes
            HTML5 Local Storage and Session Storage to store client-side application state (such as authentication tokens
            and wishlist configurations) locally within your device without transmitting unnecessary overhead with every
            server request.
          </p>
        </div>
      </section>

      {/* ── SECTION 3.0 ── */}
      <section id="ck-3" className="border-b border-black pb-6 sm:pb-8">
        <div className="border-b border-neutral-300 pb-2 mb-3 sm:mb-4">
          <div className="text-[10px] sm:text-xs font-mono font-bold uppercase tracking-widest text-neutral-500 mb-1">
            CLAUSE 3.0
          </div>
          <h2 className="text-base sm:text-lg font-serif font-black uppercase text-black leading-snug break-words">
            3.0 TAXONOMY OF COOKIES EMPLOYED BY KALASTRA
          </h2>
        </div>
        <div className="space-y-3">
          <p>
            Kalastra limits its deployment of browser storage strictly to necessary functional and security requirements.
            The technologies deployed fall into the following four defined categories:
          </p>

          {/* ── Mobile Responsive Cards View (sm:hidden) ── */}
          <div className="sm:hidden space-y-3 my-3">
            {COOKIE_CATEGORIES.map((item) => (
              <div key={item.category} className="border border-black p-3 bg-neutral-50 font-mono text-xs">
                <div className="flex items-center justify-between border-b border-neutral-300 pb-1.5 mb-2">
                  <span className="font-bold text-black uppercase text-[11px]">{item.category}</span>
                  <span className="text-[9px] bg-white border border-black px-1.5 py-0.5 font-bold text-black">
                    {item.tag}
                  </span>
                </div>
                <div className="text-[11px] text-neutral-800 mb-1.5 leading-snug">
                  <strong className="text-black uppercase text-[9px] block mb-0.5">Technical Purpose:</strong>
                  {item.purpose}
                </div>
                <div className="flex items-center justify-between text-[10px] text-neutral-600 border-t border-neutral-200 pt-1.5 mt-1.5">
                  <span><strong>Lifespan:</strong> {item.lifespan}</span>
                </div>
              </div>
            ))}
          </div>

          {/* ── Desktop Clean Table View (hidden sm:block) ── */}
          <div className="hidden sm:block overflow-x-auto w-full my-3">
            <table className="w-full border border-black text-xs font-mono">
              <thead>
                <tr className="bg-neutral-100 border-b border-black text-left">
                  <th className="p-2.5 border-r border-black uppercase w-1/4">Category</th>
                  <th className="p-2.5 border-r border-black uppercase w-1/3">Technical Purpose</th>
                  <th className="p-2.5 border-r border-black uppercase w-1/5">Lifespan</th>
                  <th className="p-2.5 uppercase">Consent Status</th>
                </tr>
              </thead>
              <tbody>
                {COOKIE_CATEGORIES.map((item, idx) => (
                  <tr key={item.category} className={idx % 2 === 1 ? 'bg-neutral-50 border-b border-black' : 'border-b border-black'}>
                    <td className="p-2.5 font-bold border-r border-black">{item.category}</td>
                    <td className="p-2.5 border-r border-black">{item.purpose}</td>
                    <td className="p-2.5 border-r border-black">{item.lifespan}</td>
                    <td className="p-2.5 font-bold">{item.consent}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── SECTION 4.0 ── */}
      <section id="ck-4" className="border-b border-black pb-6 sm:pb-8">
        <div className="border-b border-neutral-300 pb-2 mb-3 sm:mb-4">
          <div className="text-[10px] sm:text-xs font-mono font-bold uppercase tracking-widest text-neutral-500 mb-1">
            CLAUSE 4.0
          </div>
          <h2 className="text-base sm:text-lg font-serif font-black uppercase text-black leading-snug break-words">
            4.0 STRICTLY NECESSARY &amp; FUNCTIONAL STORAGE
          </h2>
        </div>
        <div className="space-y-3">
          <p>
            <strong>4.1 Essential Operations:</strong> Strictly necessary cookies and local storage tokens are essential
            for the proper operation of the platform. They enable you to move around the Site, preserve selected garments
            across page transitions, and log into your account securely.
          </p>
          <p>
            <strong>4.2 Exemption from Consent:</strong> Under Indian data protection principles, because these cookies are
            indispensable to the delivery of the service explicitly requested by the Data Principal (i.e. operating the
            e-commerce store), they are executed automatically upon platform access.
          </p>
        </div>
      </section>

      {/* ── SECTION 5.0 ── */}
      <section id="ck-5" className="border-b border-black pb-6 sm:pb-8">
        <div className="border-b border-neutral-300 pb-2 mb-3 sm:mb-4">
          <div className="text-[10px] sm:text-xs font-mono font-bold uppercase tracking-widest text-neutral-500 mb-1">
            CLAUSE 5.0
          </div>
          <h2 className="text-base sm:text-lg font-serif font-black uppercase text-black leading-snug break-words">
            5.0 PAYMENT GATEWAY SECURITY TOKENS (RAZORPAY)
          </h2>
        </div>
        <div className="space-y-3">
          <p>
            When you proceed to checkout, payment processing is initiated via the embedded checkout frame of our RBI-licensed
            payment aggregator, <strong>Razorpay Software Private Limited</strong>. Razorpay deploys specialized security
            and anti-fraud cookies designed to detect automated payment hijacking, spoofed sessions, and fraudulent card
            attacks. These tokens do not convey payment card details to Kalastra.
          </p>
        </div>
      </section>

      {/* ── SECTION 6.0 ── */}
      <section id="ck-6" className="border-b border-black pb-6 sm:pb-8">
        <div className="border-b border-neutral-300 pb-2 mb-3 sm:mb-4">
          <div className="text-[10px] sm:text-xs font-mono font-bold uppercase tracking-widest text-neutral-500 mb-1">
            CLAUSE 6.0
          </div>
          <h2 className="text-base sm:text-lg font-serif font-black uppercase text-black leading-snug break-words">
            6.0 ANALYTICAL &amp; PERFORMANCE TELEMETRY
          </h2>
        </div>
        <div className="space-y-3">
          <p>
            Kalastra may utilize aggregate, anonymized technical telemetry to analyze website performance, latency, and
            error rates. Such telemetry aggregates metrics across thousands of sessions without associating network requests
            with your individual legal identity.
          </p>
        </div>
      </section>

      {/* ── SECTION 7.0 ── */}
      <section id="ck-7" className="border-b border-black pb-6 sm:pb-8 bg-neutral-50 p-3 sm:p-4 border">
        <div className="border-b border-black pb-2 mb-3 sm:mb-4">
          <div className="text-[10px] sm:text-xs font-mono font-bold uppercase tracking-widest text-black mb-1">
            STATUTORY MANDATE 7.0
          </div>
          <h2 className="text-base sm:text-lg font-serif font-black uppercase text-black leading-snug break-words">
            7.0 CONSENT FRAMEWORK UNDER DPDP ACT, 2023
          </h2>
        </div>
        <div className="space-y-3">
          <p>
            Pursuant to the <em>Digital Personal Data Protection Act, 2023</em>, online tracking identifiers that are
            capable of identifying an individual constitute personal data. In strict adherence:
          </p>
          <ul className="list-disc pl-5 sm:pl-6 space-y-1 text-xs">
            <li>Kalastra does NOT deploy third-party advertising cookies or cross-site behavioral tracking networks;</li>
            <li>Kalastra does NOT sell or transfer browsing histories to data brokers or ad exchanges;</li>
            <li>Pursuant to Section 9 of the DPDP Act, no tracking or behavioral profiling cookies are ever directed at minors.</li>
          </ul>
        </div>
      </section>

      {/* ── SECTION 8.0 ── */}
      <section id="ck-8" className="border-b border-black pb-6 sm:pb-8">
        <div className="border-b border-neutral-300 pb-2 mb-3 sm:mb-4">
          <div className="text-[10px] sm:text-xs font-mono font-bold uppercase tracking-widest text-neutral-500 mb-1">
            CLAUSE 8.0
          </div>
          <h2 className="text-base sm:text-lg font-serif font-black uppercase text-black leading-snug break-words">
            8.0 BROWSER-LEVEL COOKIE MANAGEMENT &amp; OPT-OUT
          </h2>
        </div>
        <div className="space-y-3">
          <p>
            You possess the technical right and ability to accept, decline, or purge cookies at any time via your browser
            configuration settings. Instructions for standard browsers are provided below:
          </p>
          <div className="border border-black divide-y divide-black font-mono text-xs my-3 bg-neutral-50">
            <div className="p-3">
              <strong>Google Chrome:</strong> Settings &rarr; Privacy and security &rarr; Third-party cookies &rarr; See all site data and permissions.
            </div>
            <div className="p-3">
              <strong>Apple Safari:</strong> Settings &rarr; Safari &rarr; Advanced &rarr; Block All Cookies.
            </div>
            <div className="p-3">
              <strong>Mozilla Firefox:</strong> Settings &rarr; Privacy &amp; Security &rarr; Enhanced Tracking Protection &rarr; Custom.
            </div>
            <div className="p-3">
              <strong>Microsoft Edge:</strong> Settings &rarr; Cookies and site permissions &rarr; Manage and delete cookies and site data.
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 9.0 ── */}
      <section id="ck-9" className="border-b border-black pb-6 sm:pb-8">
        <div className="border-b border-neutral-300 pb-2 mb-3 sm:mb-4">
          <div className="text-[10px] sm:text-xs font-mono font-bold uppercase tracking-widest text-neutral-500 mb-1">
            CLAUSE 9.0
          </div>
          <h2 className="text-base sm:text-lg font-serif font-black uppercase text-black leading-snug break-words">
            9.0 CONSEQUENCES OF DISABLING ESSENTIAL STORAGE
          </h2>
        </div>
        <div className="space-y-3">
          <p>
            Please note that if you disable or purge essential cookies and local storage, key functionalities of the Site
            will cease to operate. You will be unable to maintain garments in your shopping cart, authenticate your account,
            or complete online payments through Razorpay.
          </p>
        </div>
      </section>

      {/* ── SECTION 10.0 ── */}
      <section id="ck-10" className="pb-4">
        <div className="border-b border-neutral-300 pb-2 mb-3 sm:mb-4">
          <div className="text-[10px] sm:text-xs font-mono font-bold uppercase tracking-widest text-neutral-500 mb-1">
            CLAUSE 10.0
          </div>
          <h2 className="text-base sm:text-lg font-serif font-black uppercase text-black leading-snug break-words">
            10.0 STATUTORY INQUIRIES &amp; GRIEVANCE CONTACT
          </h2>
        </div>
        <div className="space-y-3">
          <p>
            For any queries or grievances concerning our use of cookies or tracking technologies, contact our statutory
            officer:
          </p>
          <div className="border border-black p-3 sm:p-4 bg-neutral-50 font-mono text-xs space-y-1 break-words">
            <div className="font-bold text-sm text-black">DATA PROTECTION &amp; COOKIE GOVERNANCE DESK</div>
            <div><strong>Entity:</strong> Kalastra (Sole Proprietorship)</div>
            <div><strong>Address:</strong> Kopar Railway Station, Mumbai, Maharashtra, India</div>
            <div><strong>Email:</strong> <span className="break-all">kalastra29@gmail.com</span> (Subject: &ldquo;COOKIE POLICY INQUIRY&rdquo;)</div>
            <div><strong>Direct Telephone:</strong> +91 9082260829</div>
          </div>
        </div>
      </section>
    </LegalLayout>
  );
}
