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
      <section id="ck-1" className="border-b border-black pb-8">
        <div className="flex items-baseline justify-between border-b border-neutral-300 pb-2 mb-4">
          <h2 className="text-lg font-serif font-black uppercase text-black">
            1.0 STATUTORY CONTEXT &amp; SCOPE OF POLICY
          </h2>
          <span className="font-mono text-xs text-neutral-500">CLAUSE 1.0</span>
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
      <section id="ck-2" className="border-b border-black pb-8">
        <div className="flex items-baseline justify-between border-b border-neutral-300 pb-2 mb-4">
          <h2 className="text-lg font-serif font-black uppercase text-black">
            2.0 DEFINITION &amp; TECHNICAL OPERATION OF COOKIES
          </h2>
          <span className="font-mono text-xs text-neutral-500">CLAUSE 2.0</span>
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
      <section id="ck-3" className="border-b border-black pb-8">
        <div className="flex items-baseline justify-between border-b border-neutral-300 pb-2 mb-4">
          <h2 className="text-lg font-serif font-black uppercase text-black">
            3.0 TAXONOMY OF COOKIES EMPLOYED BY KALASTRA
          </h2>
          <span className="font-mono text-xs text-neutral-500">CLAUSE 3.0</span>
        </div>
        <div className="space-y-3">
          <p>
            Kalastra limits its deployment of browser storage strictly to necessary functional and security requirements.
            The technologies deployed fall into the following four defined categories:
          </p>
          <table className="w-full border border-black text-xs font-mono my-3">
            <thead>
              <tr className="bg-neutral-100 border-b border-black text-left">
                <th className="p-2.5 border-r border-black uppercase w-1/4">Category</th>
                <th className="p-2.5 border-r border-black uppercase w-1/4">Technical Purpose</th>
                <th className="p-2.5 border-r border-black uppercase w-1/4">Lifespan</th>
                <th className="p-2.5 uppercase w-1/4">Consent Required?</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-black">
                <td className="p-2.5 font-bold border-r border-black">Strictly Necessary</td>
                <td className="p-2.5 border-r border-black">User authentication, session tokens, shopping cart state</td>
                <td className="p-2.5 border-r border-black">Session to 30 Days</td>
                <td className="p-2.5 font-bold">Exempt (Essential)</td>
              </tr>
              <tr className="border-b border-black bg-neutral-50">
                <td className="p-2.5 font-bold border-r border-black">Payment Security</td>
                <td className="p-2.5 border-r border-black">Razorpay fraud detection, CSRF protection</td>
                <td className="p-2.5 border-r border-black">Session duration</td>
                <td className="p-2.5 font-bold">Exempt (Security)</td>
              </tr>
              <tr className="border-b border-black">
                <td className="p-2.5 font-bold border-r border-black">Functional State</td>
                <td className="p-2.5 border-r border-black">Theme preferences, wishlist storage</td>
                <td className="p-2.5 border-r border-black">Persistent (Local Storage)</td>
                <td className="p-2.5">User Discretion</td>
              </tr>
              <tr>
                <td className="p-2.5 font-bold border-r border-black">Performance Telemetry</td>
                <td className="p-2.5 border-r border-black">Anonymized page rendering times, error logs</td>
                <td className="p-2.5 border-r border-black">Up to 90 Days</td>
                <td className="p-2.5">DPDP Compliant</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* ── SECTION 4.0 ── */}
      <section id="ck-4" className="border-b border-black pb-8">
        <div className="flex items-baseline justify-between border-b border-neutral-300 pb-2 mb-4">
          <h2 className="text-lg font-serif font-black uppercase text-black">
            4.0 STRICTLY NECESSARY &amp; FUNCTIONAL STORAGE
          </h2>
          <span className="font-mono text-xs text-neutral-500">CLAUSE 4.0</span>
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
      <section id="ck-5" className="border-b border-black pb-8">
        <div className="flex items-baseline justify-between border-b border-neutral-300 pb-2 mb-4">
          <h2 className="text-lg font-serif font-black uppercase text-black">
            5.0 PAYMENT GATEWAY SECURITY TOKENS (RAZORPAY)
          </h2>
          <span className="font-mono text-xs text-neutral-500">CLAUSE 5.0</span>
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
      <section id="ck-6" className="border-b border-black pb-8">
        <div className="flex items-baseline justify-between border-b border-neutral-300 pb-2 mb-4">
          <h2 className="text-lg font-serif font-black uppercase text-black">
            6.0 ANALYTICAL &amp; PERFORMANCE TELEMETRY
          </h2>
          <span className="font-mono text-xs text-neutral-500">CLAUSE 6.0</span>
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
      <section id="ck-7" className="border-b border-black pb-8 bg-neutral-50 p-4 border">
        <div className="flex items-baseline justify-between border-b border-black pb-2 mb-4">
          <h2 className="text-lg font-serif font-black uppercase text-black">
            7.0 CONSENT FRAMEWORK UNDER DPDP ACT, 2023
          </h2>
          <span className="font-mono text-xs font-bold text-black">STATUTORY MANDATE 7.0</span>
        </div>
        <div className="space-y-3">
          <p>
            Pursuant to the <em>Digital Personal Data Protection Act, 2023</em>, online tracking identifiers that are
            capable of identifying an individual constitute personal data. In strict adherence:
          </p>
          <ul className="list-disc pl-6 space-y-1 text-xs">
            <li>Kalastra does NOT deploy third-party advertising cookies or cross-site behavioral tracking networks;</li>
            <li>Kalastra does NOT sell or transfer browsing histories to data brokers or ad exchanges;</li>
            <li>Pursuant to Section 9 of the DPDP Act, no tracking or behavioral profiling cookies are ever directed at minors.</li>
          </ul>
        </div>
      </section>

      {/* ── SECTION 8.0 ── */}
      <section id="ck-8" className="border-b border-black pb-8">
        <div className="flex items-baseline justify-between border-b border-neutral-300 pb-2 mb-4">
          <h2 className="text-lg font-serif font-black uppercase text-black">
            8.0 BROWSER-LEVEL COOKIE MANAGEMENT &amp; OPT-OUT
          </h2>
          <span className="font-mono text-xs text-neutral-500">CLAUSE 8.0</span>
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
      <section id="ck-9" className="border-b border-black pb-8">
        <div className="flex items-baseline justify-between border-b border-neutral-300 pb-2 mb-4">
          <h2 className="text-lg font-serif font-black uppercase text-black">
            9.0 CONSEQUENCES OF DISABLING ESSENTIAL STORAGE
          </h2>
          <span className="font-mono text-xs text-neutral-500">CLAUSE 9.0</span>
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
        <div className="flex items-baseline justify-between border-b border-neutral-300 pb-2 mb-4">
          <h2 className="text-lg font-serif font-black uppercase text-black">
            10.0 STATUTORY INQUIRIES &amp; GRIEVANCE CONTACT
          </h2>
          <span className="font-mono text-xs text-neutral-500">CLAUSE 10.0</span>
        </div>
        <div className="space-y-3">
          <p>
            For any queries or grievances concerning our use of cookies or tracking technologies, contact our statutory
            officer:
          </p>
          <div className="border border-black p-4 bg-neutral-50 font-mono text-xs space-y-1">
            <div className="font-bold text-sm text-black">DATA PROTECTION &amp; COOKIE GOVERNANCE DESK</div>
            <div><strong>Entity:</strong> Kalastra (Sole Proprietorship)</div>
            <div><strong>Address:</strong> Kopar Railway Station, Mumbai, Maharashtra, India</div>
            <div><strong>Email:</strong> kalastra29@gmail.com (Subject: &ldquo;COOKIE POLICY INQUIRY&rdquo;)</div>
            <div><strong>Direct Telephone:</strong> +91 9082260829</div>
          </div>
        </div>
      </section>
    </LegalLayout>
  );
}
