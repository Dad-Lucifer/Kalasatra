import LegalLayout from '../components/legal/LegalLayout';

const TOC = [
  { id: 'dpdp-1', num: '1.0', title: 'Statutory Preamble & Enacting Framework' },
  { id: 'dpdp-2', num: '2.0', title: 'Identification of the Data Fiduciary' },
  { id: 'dpdp-3', num: '3.0', title: 'Categories of Personal Data Collected' },
  { id: 'dpdp-4', num: '4.0', title: 'Specified Purposes of Processing' },
  { id: 'dpdp-5', num: '5.0', title: 'Consent Architecture & Withdrawal Protocol' },
  { id: 'dpdp-6', num: '6.0', title: 'Processing of Children’s Data (Section 9)' },
  { id: 'dpdp-7', num: '7.0', title: 'Obligations & Security Safeguards (Section 8)' },
  { id: 'dpdp-8', num: '8.0', title: 'Statutory Rights of the Data Principal' },
  { id: 'dpdp-9', num: '9.0', title: 'Duties of the Data Principal (Section 15)' },
  { id: 'dpdp-10', num: '10.0', title: 'Data Retention, Erasure & Localization' },
  { id: 'dpdp-11', num: '11.0', title: 'Disclosure to Third-Party Data Processors' },
  { id: 'dpdp-12', num: '12.0', title: 'Breach Notification Protocol (DPBI Intimation)' },
  { id: 'dpdp-13', num: '13.0', title: 'Grievance Redressal Officer & DPBI Redressal' },
];

export default function PrivacyPolicyPage() {
  return (
    <LegalLayout
      title="Privacy Policy & Personal Data Governance Charter"
      subtitle="Statutory Data Governance Charter formulated in strict compliance with the Digital Personal Data Protection Act, 2023 (Act No. 22 of 2023) of the Parliament of India."
      docReference="KLS/LGL/2026-DPDP-POL/IND"
      effectiveDate="July 23, 2026"
      lastUpdated="September 27, 2026"
      jurisdiction="Republic of India • State of Maharashtra"
      statutoryActs={[
        'Digital Personal Data Protection Act, 2023 (Act No. 22 of 2023)',
        'Information Technology Act, 2000 (Act 21 of 2000)',
        'Information Technology (Intermediary Guidelines) Rules, 2021',
        'Information Technology (SPDI) Rules, 2011',
      ]}
      toc={TOC}
    >
      {/* ── SECTION 1.0 ── */}
      <section id="dpdp-1" className="border-b border-black pb-6 sm:pb-8">
        <div className="border-b border-neutral-300 pb-2 mb-3 sm:mb-4">
          <div className="text-[10px] sm:text-xs font-mono font-bold uppercase tracking-widest text-neutral-500 mb-1">
            CLAUSE 1.0
          </div>
          <h2 className="text-base sm:text-lg font-serif font-black uppercase text-black leading-snug break-words">
            1.0 STATUTORY PREAMBLE &amp; ENACTING FRAMEWORK
          </h2>
        </div>
        <div className="space-y-3">
          <p>
            <strong>1.1 Legislative Basis:</strong> This Privacy Policy and Personal Data Governance Charter
            (&ldquo;Charter&rdquo; or &ldquo;Policy&rdquo;) is formulated, published, and enforced pursuant to the
            provisions of the <strong>Digital Personal Data Protection Act, 2023 (Act No. 22 of 2023)</strong> enacted
            by the Parliament of India (&ldquo;DPDP Act&rdquo;), read with the <em>Information Technology Act, 2000</em>,
            and rules framed thereunder.
          </p>
          <p>
            <strong>1.2 Statutory Notice under Section 5:</strong> Pursuant to Section 5(1) and Section 5(2) of the DPDP
            Act, 2023, this instrument constitutes formal statutory notice presented to every individual (the &ldquo;Data
            Principal&rdquo;) whose personal data is collected, processed, or stored in digital form by Kalastra.
          </p>
          <div className="border border-black p-3 bg-neutral-50 font-mono text-xs break-words">
            <strong>STATUTORY DECLARATION:</strong> KALASTRA PROCESSES DIGITAL PERSONAL DATA STRICTLY IN ACCORDANCE
            WITH THE PRINCIPLES OF PURPOSE LIMITATION, DATA MINIMIZATION, STORAGE LIMITATION, AND STATUTORY ACCOUNTABILITY
            ENJOINED BY THE DPDP ACT, 2023.
          </div>
        </div>
      </section>

      {/* ── SECTION 2.0 ── */}
      <section id="dpdp-2" className="border-b border-black pb-6 sm:pb-8">
        <div className="border-b border-neutral-300 pb-2 mb-3 sm:mb-4">
          <div className="text-[10px] sm:text-xs font-mono font-bold uppercase tracking-widest text-neutral-500 mb-1">
            CLAUSE 2.0
          </div>
          <h2 className="text-base sm:text-lg font-serif font-black uppercase text-black leading-snug break-words">
            2.0 IDENTIFICATION OF THE DATA FIDUCIARY
          </h2>
        </div>
        <div className="space-y-3">
          <p>
            For the purposes of the DPDP Act, 2023, the entity that determines the purpose and means of the processing
            of your digital personal data is:
          </p>
          <div className="border border-black p-3 sm:p-4 bg-neutral-50 font-mono text-xs space-y-1 break-words">
            <div><strong className="uppercase">Designation:</strong> Data Fiduciary (Section 2(i), DPDP Act, 2023)</div>
            <div><strong>Entity Name:</strong> Kalastra</div>
            <div><strong>Constitution:</strong> Sole Proprietorship registered under Indian Laws</div>
            <div><strong>Registered Domicile:</strong> Kopar Railway Station, Mumbai, Maharashtra, India</div>
            <div><strong>Authorized Data Protection Contact:</strong> <span className="break-all">kalastra29@gmail.com</span></div>
            <div><strong>Official Inquiries:</strong> +91 9082260829</div>
          </div>
        </div>
      </section>

      {/* ── SECTION 3.0 ── */}
      <section id="dpdp-3" className="border-b border-black pb-6 sm:pb-8">
        <div className="border-b border-neutral-300 pb-2 mb-3 sm:mb-4">
          <div className="text-[10px] sm:text-xs font-mono font-bold uppercase tracking-widest text-neutral-500 mb-1">
            CLAUSE 3.0
          </div>
          <h2 className="text-base sm:text-lg font-serif font-black uppercase text-black leading-snug break-words">
            3.0 CATEGORIES OF PERSONAL DATA COLLECTED
          </h2>
        </div>
        <div className="space-y-3">
          <p>
            Pursuant to the principle of data minimization, Kalastra collects only such digital personal data as is
            strictly necessary to establish customer accounts, manufacture made-to-order apparel, and execute door-to-door
            deliveries:
          </p>
          <div className="border border-black divide-y divide-black font-mono text-xs my-3 bg-neutral-50">
            <div className="p-3">
              <span className="font-bold text-black uppercase">1. Identity &amp; Contact:</span> Full name,
              mobile telephone number, verified electronic mail address, and customer account credentials.
            </div>
            <div className="p-3">
              <span className="font-bold text-black uppercase">2. Logistics &amp; Invoicing:</span> Complete
              postal delivery address, PIN code, state jurisdiction, landmark, and optional GSTIN (for B2B billing).
            </div>
            <div className="p-3">
              <span className="font-bold text-black uppercase">3. Transactional Records:</span> Order reference numbers,
              product SKUs, sizes selected, transaction timestamps, and tokenized payment verification IDs issued by
              Razorpay.
            </div>
            <div className="p-3">
              <span className="font-bold text-black uppercase">4. Device &amp; Technical:</span> Internet
              Protocol (IP) address, operating system, browser user-agent, session logs, and essential cookies necessary
              for shopping cart state persistence.
            </div>
          </div>
          <p className="border-2 border-black p-3 bg-neutral-100 font-mono text-xs break-words">
            <strong>EXCLUSION OF PAYMENT CREDENTIAL STORAGE:</strong> KALASTRA DOES NOT COLLECT, VIEW, STORE, OR PROCESS
            SENSITIVE FINANCIAL CREDENTIALS, INCLUDING CREDIT/DEBIT CARD NUMBERS, CVV CODES, NET-BANKING PASSWORDS, OR
            UPI PINS. ALL SUCH DATA IS HANDLED DIRECTLY BY RAZORPAY UNDER RBI REGULATIONS.
          </p>
        </div>
      </section>

      {/* ── SECTION 4.0 ── */}
      <section id="dpdp-4" className="border-b border-black pb-6 sm:pb-8">
        <div className="border-b border-neutral-300 pb-2 mb-3 sm:mb-4">
          <div className="text-[10px] sm:text-xs font-mono font-bold uppercase tracking-widest text-neutral-500 mb-1">
            CLAUSE 4.0
          </div>
          <h2 className="text-base sm:text-lg font-serif font-black uppercase text-black leading-snug break-words">
            4.0 SPECIFIED PURPOSES OF PROCESSING
          </h2>
        </div>
        <div className="space-y-3">
          <p>
            Pursuant to Section 4 and Section 5 of the DPDP Act, personal data shall be processed exclusively for the
            following specified lawful purposes:
          </p>
          <ul className="list-disc pl-5 sm:pl-6 space-y-1.5 text-xs">
            <li>
              <strong>Performance of Contract:</strong> Tailoring, manufacturing, packaging, and dispatching made-to-order
              garments ordered by the Data Principal;
            </li>
            <li>
              <strong>Logistics &amp; Courier Execution:</strong> Transmitting recipient address and contact telephone
              data to our contracted Indian courier partners for physical delivery;
            </li>
            <li>
              <strong>Statutory Compliance:</strong> Generating tax invoices and filing tax returns in conformity with
              the <em>Central Goods and Services Tax Act, 2017</em>;
            </li>
            <li>
              <strong>Customer Support &amp; Grievance Redressal:</strong> Responding to inquiries regarding sizing, order
              status, returns for transit defects, and statutory notices;
            </li>
            <li>
              <strong>Platform Security:</strong> Detecting, preventing, and prosecuting cyber attacks, unauthorized account
              intrusions, and fraudulent purchase transactions under the <em>IT Act, 2000</em>.
            </li>
          </ul>
        </div>
      </section>

      {/* ── SECTION 5.0 ── */}
      <section id="dpdp-5" className="border-b border-black pb-6 sm:pb-8">
        <div className="border-b border-neutral-300 pb-2 mb-3 sm:mb-4">
          <div className="text-[10px] sm:text-xs font-mono font-bold uppercase tracking-widest text-neutral-500 mb-1">
            CLAUSE 5.0
          </div>
          <h2 className="text-base sm:text-lg font-serif font-black uppercase text-black leading-snug break-words">
            5.0 CONSENT ARCHITECTURE &amp; WITHDRAWAL PROTOCOL
          </h2>
        </div>
        <div className="space-y-3">
          <p>
            <strong>5.1 Consent Standard (Section 6):</strong> Consent obtained from the Data Principal shall be free,
            specific, informed, unconditional, and unambiguous with clear affirmative action. Consent signifies an agreement
            to the processing of personal data for the specified purposes articulated in this Charter.
          </p>
          <p>
            <strong>5.2 Right to Withdraw Consent:</strong> Under Section 6(4) of the DPDP Act, the Data Principal has the
            unconditional right to withdraw consent at any time. Withdrawal may be exercised by transmitting an email to
            <code>kalastra29@gmail.com</code> with the subject &ldquo;WITHDRAWAL OF CONSENT - DPDP ACT&rdquo;.
          </p>
          <p>
            <strong>5.3 Effect of Withdrawal:</strong> Upon receiving verified notice of withdrawal, Kalastra shall cease
            processing personal data unless retention is mandatory under other Indian statutes (such as preserving GST
            invoices for mandatory statutory tax audit periods). Withdrawal of consent shall not affect the lawfulness of
            processing based on consent prior to withdrawal, but will result in the suspension of active user accounts.
          </p>
        </div>
      </section>

      {/* ── SECTION 6.0 ── */}
      <section id="dpdp-6" className="border-b border-black pb-6 sm:pb-8">
        <div className="border-b border-neutral-300 pb-2 mb-3 sm:mb-4">
          <div className="text-[10px] sm:text-xs font-mono font-bold uppercase tracking-widest text-neutral-500 mb-1">
            CLAUSE 6.0
          </div>
          <h2 className="text-base sm:text-lg font-serif font-black uppercase text-black leading-snug break-words">
            6.0 PROCESSING OF CHILDREN&rsquo;S DATA (SECTION 9)
          </h2>
        </div>
        <div className="space-y-3">
          <p>
            <strong>6.1 Statutory Definition:</strong> Pursuant to Section 2(f) of the DPDP Act, a &ldquo;child&rdquo;
            is defined as an individual who has not completed eighteen (18) years of age.
          </p>
          <p>
            <strong>6.2 Verifiable Parental Consent:</strong> In strict compliance with Section 9(1) of the DPDP Act,
            Kalastra does not process personal data of a child without obtaining verifiable consent from the parent or
            lawful guardian.
          </p>
          <p>
            <strong>6.3 Statutory Prohibitions:</strong> Pursuant to Section 9(2) and Section 9(3) of the DPDP Act,
            Kalastra expressly covenants that it does NOT:
          </p>
          <ul className="list-disc pl-5 sm:pl-6 space-y-1 text-xs">
            <li>Engage in tracking, behavioral monitoring, or surveillance of children;</li>
            <li>Direct targeted advertising towards children;</li>
            <li>Undertake any processing of personal data that is likely to cause any detrimental effect on the well-being of a child.</li>
          </ul>
        </div>
      </section>

      {/* ── SECTION 7.0 ── */}
      <section id="dpdp-7" className="border-b border-black pb-6 sm:pb-8">
        <div className="border-b border-neutral-300 pb-2 mb-3 sm:mb-4">
          <div className="text-[10px] sm:text-xs font-mono font-bold uppercase tracking-widest text-neutral-500 mb-1">
            CLAUSE 7.0
          </div>
          <h2 className="text-base sm:text-lg font-serif font-black uppercase text-black leading-snug break-words">
            7.0 OBLIGATIONS &amp; SECURITY SAFEGUARDS (SECTION 8)
          </h2>
        </div>
        <div className="space-y-3">
          <p>
            In accordance with Section 8(5) of the DPDP Act, Kalastra implements reasonable technical and organizational
            security safeguards to prevent personal data breaches, unauthorized disclosure, or accidental destruction:
          </p>
          <ul className="list-disc pl-5 sm:pl-6 space-y-1 text-xs">
            <li>End-to-end Transport Layer Security (TLS 1.3 / 256-bit SSL) across all web interactions;</li>
            <li>Strict role-based access control, ensuring customer personal details are accessible solely by authorized fulfillment personnel;</li>
            <li>Regular database vulnerability scanning and strict API perimeter defenses;</li>
            <li>Requirement that third-party Data Processors execute formal data protection covenants conforming to Indian standards.</li>
          </ul>
        </div>
      </section>

      {/* ── SECTION 8.0 ── */}
      <section id="dpdp-8" className="border-b border-black pb-6 sm:pb-8 bg-neutral-50 p-3 sm:p-4 border">
        <div className="border-b border-black pb-2 mb-3 sm:mb-4">
          <div className="text-[10px] sm:text-xs font-mono font-bold uppercase tracking-widest text-black mb-1">
            STATUTORY RIGHTS SUMMARY
          </div>
          <h2 className="text-base sm:text-lg font-serif font-black uppercase text-black leading-snug break-words">
            8.0 STATUTORY RIGHTS OF THE DATA PRINCIPAL
          </h2>
        </div>
        <div className="space-y-3 sm:space-y-4">
          <p>
            Under Chapter III (Sections 11 through 14) of the <em>Digital Personal Data Protection Act, 2023</em>, you
            are endowed with the following legally enforceable statutory rights:
          </p>

          <div className="space-y-2.5 sm:space-y-3 text-xs">
            <div className="border border-black p-2.5 sm:p-3 bg-white">
              <strong className="font-mono uppercase block text-black mb-1">
                1. Right to Access Information (Section 11):
              </strong>
              You have the right to obtain from Kalastra: (a) a summary of personal data being processed; (b) the identities
              of all other Data Fiduciaries and Data Processors with whom personal data has been shared; and (c) any other
              information specified by Central Government rules.
            </div>

            <div className="border border-black p-2.5 sm:p-3 bg-white">
              <strong className="font-mono uppercase block text-black mb-1">
                2. Right to Correction, Completion &amp; Updating (Section 12):
              </strong>
              You have the right to request the correction of inaccurate or misleading personal data, completion of incomplete
              data records, and updating of changed contact details.
            </div>

            <div className="border border-black p-2.5 sm:p-3 bg-white">
              <strong className="font-mono uppercase block text-black mb-1">
                3. Right to Erasure / Right to be Forgotten (Section 12):
              </strong>
              You have the right to request the erasure of your personal data when the specified purpose of collection is no
              longer served, or upon withdrawal of consent, subject to statutory retention obligations under Indian tax laws.
            </div>

            <div className="border border-black p-2.5 sm:p-3 bg-white">
              <strong className="font-mono uppercase block text-black mb-1">
                4. Right of Grievance Redressal (Section 13):
              </strong>
              You have the right to readily available grievance redressal mechanisms provided by Kalastra in respect of any act
              or omission regarding your data obligations.
            </div>

            <div className="border border-black p-2.5 sm:p-3 bg-white">
              <strong className="font-mono uppercase block text-black mb-1">
                5. Right to Nominate (Section 14):
              </strong>
              You have the right to nominate any other individual who shall, in the event of your death or incapacity, exercise
              your rights under the DPDP Act.
            </div>
          </div>
          <p className="text-[11px] font-mono text-neutral-600 mt-2">
            To exercise any statutory right, transmit a formal requisition to <code>kalastra29@gmail.com</code> with your
            account credentials and official identification.
          </p>
        </div>
      </section>

      {/* ── SECTION 9.0 ── */}
      <section id="dpdp-9" className="border-b border-black pb-6 sm:pb-8">
        <div className="border-b border-neutral-300 pb-2 mb-3 sm:mb-4">
          <div className="text-[10px] sm:text-xs font-mono font-bold uppercase tracking-widest text-neutral-500 mb-1">
            CLAUSE 9.0
          </div>
          <h2 className="text-base sm:text-lg font-serif font-black uppercase text-black leading-snug break-words">
            9.0 DUTIES OF THE DATA PRINCIPAL (SECTION 15)
          </h2>
        </div>
        <div className="space-y-3">
          <p>
            Pursuant to Section 15 of the DPDP Act, 2023, while exercising your rights, you owe statutory duties to:
          </p>
          <ul className="list-disc pl-5 sm:pl-6 space-y-1 text-xs">
            <li>Comply with the provisions of all applicable laws for the time being in force;</li>
            <li>Ensure you do not impersonate another person when providing personal data for an order;</li>
            <li>Ensure you do not suppress any material information while providing personal data for identity verification;</li>
            <li>Ensure you do not register a false or frivolous grievance or complaint before Kalastra or the Data Protection Board.</li>
          </ul>
        </div>
      </section>

      {/* ── SECTION 10.0 ── */}
      <section id="dpdp-10" className="border-b border-black pb-6 sm:pb-8">
        <div className="border-b border-neutral-300 pb-2 mb-3 sm:mb-4">
          <div className="text-[10px] sm:text-xs font-mono font-bold uppercase tracking-widest text-neutral-500 mb-1">
            CLAUSE 10.0
          </div>
          <h2 className="text-base sm:text-lg font-serif font-black uppercase text-black leading-snug break-words">
            10.0 DATA RETENTION, ERASURE &amp; LOCALIZATION
          </h2>
        </div>
        <div className="space-y-3">
          <p>
            <strong>10.1 Storage in India:</strong> All primary databases containing personal data of Data Principals are
            hosted on secure cloud servers situated within the sovereign territory of the Republic of India.
          </p>
          <p>
            <strong>10.2 Retention Periods:</strong> Data is retained strictly for the duration necessary to satisfy the
            purpose of fulfillment (order completion and 7-day return period), plus statutory retention mandates under the
            <em>Central Goods and Services Tax Act, 2017</em> (which mandates retention of purchase registers and tax invoices
            for up to 72 months from the annual return filing date). Following the expiry of statutory retention periods,
            data is permanently scrubbed from our systems.
          </p>
        </div>
      </section>

      {/* ── SECTION 11.0 ── */}
      <section id="dpdp-11" className="border-b border-black pb-6 sm:pb-8">
        <div className="border-b border-neutral-300 pb-2 mb-3 sm:mb-4">
          <div className="text-[10px] sm:text-xs font-mono font-bold uppercase tracking-widest text-neutral-500 mb-1">
            CLAUSE 11.0
          </div>
          <h2 className="text-base sm:text-lg font-serif font-black uppercase text-black leading-snug break-words">
            11.0 DISCLOSURE TO THIRD-PARTY DATA PROCESSORS
          </h2>
        </div>
        <div className="space-y-3">
          <p>
            Kalastra does not sell, trade, or monetize personal data. Disclosure to third parties is strictly limited to
            certified Data Processors engaged under binding data protection contracts:
          </p>
          <ul className="list-disc pl-5 sm:pl-6 space-y-1 text-xs">
            <li><strong>Payment Aggregators (Razorpay):</strong> Transaction tokens and billing confirmation data;</li>
            <li><strong>Courier Partners:</strong> Name, delivery address, and recipient contact telephone number solely for logistics fulfillment;</li>
            <li><strong>Government / Law Enforcement Authorities:</strong> Exclusively upon receipt of lawful summons or statutory orders issued under Indian law.</li>
          </ul>
        </div>
      </section>

      {/* ── SECTION 12.0 ── */}
      <section id="dpdp-12" className="border-b border-black pb-6 sm:pb-8">
        <div className="border-b border-neutral-300 pb-2 mb-3 sm:mb-4">
          <div className="text-[10px] sm:text-xs font-mono font-bold uppercase tracking-widest text-neutral-500 mb-1">
            CLAUSE 12.0
          </div>
          <h2 className="text-base sm:text-lg font-serif font-black uppercase text-black leading-snug break-words">
            12.0 BREACH NOTIFICATION PROTOCOL (DPBI INTIMATION)
          </h2>
        </div>
        <div className="space-y-3">
          <p>
            In the improbable event of a personal data breach, Kalastra will, in strict accordance with Section 8(6) of
            the DPDP Act, 2023, intimate the <strong>Data Protection Board of India</strong> and each affected Data
            Principal in such form and manner as prescribed under Central Government rules, without undue delay, outlining
            the nature of the breach, affected records, and remedial mitigation measures undertaken.
          </p>
        </div>
      </section>

      {/* ── SECTION 13.0 ── */}
      <section id="dpdp-13" className="pb-4">
        <div className="border-b border-neutral-300 pb-2 mb-3 sm:mb-4">
          <div className="text-[10px] sm:text-xs font-mono font-bold uppercase tracking-widest text-neutral-500 mb-1">
            CLAUSE 13.0
          </div>
          <h2 className="text-base sm:text-lg font-serif font-black uppercase text-black leading-snug break-words">
            13.0 GRIEVANCE REDRESSAL OFFICER &amp; DPBI REDRESSAL
          </h2>
        </div>
        <div className="space-y-3">
          <p>
            Pursuant to Section 13 of the <em>Digital Personal Data Protection Act, 2023</em> and Rule 3(2) of the
            <em>Information Technology Rules, 2021</em>, the contact particulars of our statutory Grievance Redressal
            Officer are officially designated below:
          </p>
          <div className="border border-black p-3 sm:p-4 bg-neutral-50 font-mono text-xs space-y-1 break-words">
            <div className="font-bold text-sm text-black">STATUTORY DATA GRIEVANCE REDRESSAL OFFICER</div>
            <div><strong>Designation:</strong> Data Protection Officer &amp; Grievance Lead</div>
            <div><strong>Entity:</strong> Kalastra (Sole Proprietorship)</div>
            <div><strong>Office:</strong> Kopar Railway Station, Mumbai, Maharashtra, India</div>
            <div><strong>Dedicated Data Email:</strong> <span className="break-all">kalastra29@gmail.com</span></div>
            <div><strong>Telephone:</strong> +91 9082260829</div>
            <div><strong>Statutory Acknowledgment:</strong> Within 48 hours</div>
            <div><strong>Resolution Period:</strong> Within 30 days of registration</div>
          </div>
          <div className="border border-black p-3 bg-neutral-100 font-mono text-xs mt-3 break-words">
            <strong>ESCALATION TO DATA PROTECTION BOARD OF INDIA:</strong> If you do not receive a response from our
            Grievance Officer within 30 days, or if you remain dissatisfied with the resolution, you are legally entitled
            under Section 18 of the DPDP Act, 2023, to lodge a complaint with the <strong>Data Protection Board of India
            (DPBI)</strong> at its official portal or statutory registry.
          </div>
        </div>
      </section>
    </LegalLayout>
  );
}
