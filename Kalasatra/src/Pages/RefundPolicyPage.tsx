import LegalLayout from '../components/legal/LegalLayout';

const TOC = [
  { id: 'rf-1', num: '1.0', title: 'Statutory Recitals & Made-to-Order Doctrine' },
  { id: 'rf-2', num: '2.0', title: 'Strict No-Cancellation Covenant by Customer' },
  { id: 'rf-3', num: '3.0', title: 'Order Cancellation by Kalastra & Full Restitution' },
  { id: 'rf-4', num: '4.0', title: '7-Day Return Window for Defective/Damaged Items' },
  { id: 'rf-5', num: '5.0', title: 'Mandatory Evidentiary Protocol (Unboxing Proof)' },
  { id: 'rf-6', num: '6.0', title: 'Strictly Ineligible & Non-Returnable Categories' },
  { id: 'rf-7', num: '7.0', title: 'Reverse Logistics & Return Shipping Cost Allocation' },
  { id: 'rf-8', num: '8.0', title: 'Inspection, Approval & Refund Turnaround Timelines' },
  { id: 'rf-9', num: '9.0', title: 'Exchanges & Replacement Procedure' },
  { id: 'rf-10', num: '10.0', title: 'Statutory Grievance Redressal & Consumer Forum Rights' },
];

const REFUND_STAGES = [
  {
    step: '1',
    stage: 'Physical Quality Inspection',
    action: 'Verification of claimed defect, original tags, packaging, and unworn condition upon arrival at Mumbai facility.',
    sla: 'Within 2 to 3 Business Days',
  },
  {
    step: '2',
    stage: 'Refund Authorization',
    action: 'Electronic intimation issued confirming approved restitution and payment reversal initiation.',
    sla: 'Immediate upon inspection approval',
  },
  {
    step: '3',
    stage: 'Financial Disbursement',
    action: 'Direct electronic credit reversal back to original payment instrument (Card / Net-banking / UPI) via Razorpay.',
    sla: '7 to 14 Business Days',
  },
];

export default function RefundPolicyPage() {
  return (
    <LegalLayout
      title="Cancellation, Return & Refund Policy"
      subtitle="Statutory Legal Covenant governing order cancellations, return claims, defect rectifications, and refund disbursements under Indian Consumer Protection Laws."
      docReference="KLS/LGL/2026-REF-POL/IND"
      effectiveDate="July 23, 2026"
      lastUpdated="September 27, 2026"
      jurisdiction="Courts & Consumer Disputes Redressal Commissions at Mumbai, Maharashtra, India"
      statutoryActs={[
        'Consumer Protection Act, 2019 (Act 35 of 2019)',
        'Consumer Protection (E-Commerce) Rules, 2020',
        'Indian Contract Act, 1872 (Act 9 of 1872)',
        'Sale of Goods Act, 1930 (Act 3 of 1930)',
      ]}
      toc={TOC}
    >
      {/* ── SECTION 1.0 ── */}
      <section id="rf-1" className="border-b border-black pb-6 sm:pb-8">
        <div className="border-b border-neutral-300 pb-2 mb-3 sm:mb-4">
          <div className="text-[10px] sm:text-xs font-mono font-bold uppercase tracking-widest text-neutral-500 mb-1">
            CLAUSE 1.0
          </div>
          <h2 className="text-base sm:text-lg font-serif font-black uppercase text-black leading-snug break-words">
            1.0 STATUTORY RECITALS &amp; MADE-TO-ORDER DOCTRINE
          </h2>
        </div>
        <div className="space-y-3">
          <p>
            <strong>1.1 Legislative Basis:</strong> This Cancellation, Return, and Refund Policy (&ldquo;Refund Policy&rdquo;)
            is promulgated pursuant to the <em>Consumer Protection Act, 2019</em>, read with Rule 4(4) and Rule 5(3)(e) of
            the <em>Consumer Protection (E-Commerce) Rules, 2020</em>.
          </p>
          <div className="border border-black p-3 sm:p-4 bg-neutral-100 font-mono text-xs break-words">
            <strong className="block uppercase text-black mb-1">
              STATUTORY NOTICE ON MADE-TO-ORDER APPAREL:
            </strong>
            ALL GARMENTS AND ACCESSORIES OFFERED BY KALASTRA ARE CUSTOM MADE-TO-ORDER. PRODUCTION COMMENCES
            INDIVIDUALLY ONLY AFTER AN ORDER HAS BEEN ACCEPTED AND PAYMENT IS VERIFIED. KALASTRA DOES NOT MAINTAIN
            OFF-THE-SHELF INVENTORY. ACCORDINGLY, ALL SALES ARE FINAL SUBJECT STRICTLY TO THE STATUTORY DEFECT REMEDIES
            DETAILED IN THIS INSTRUMENT.
          </div>
        </div>
      </section>

      {/* ── SECTION 2.0 ── */}
      <section id="rf-2" className="border-b border-black pb-6 sm:pb-8">
        <div className="border-b border-neutral-300 pb-2 mb-3 sm:mb-4">
          <div className="text-[10px] sm:text-xs font-mono font-bold uppercase tracking-widest text-neutral-500 mb-1">
            CLAUSE 2.0
          </div>
          <h2 className="text-base sm:text-lg font-serif font-black uppercase text-black leading-snug break-words">
            2.0 STRICT NO-CANCELLATION COVENANT BY CUSTOMER
          </h2>
        </div>
        <div className="space-y-3">
          <p>
            <strong>2.1 Immediate Resource Commitment:</strong> Because fabric procurement, pattern cutting, and tailored
            assembly commence immediately upon receipt of electronic payment, <strong>cancellation of an Order by the
            Customer is strictly prohibited</strong> once payment confirmation has been transmitted.
          </p>
          <p>
            <strong>2.2 Customer Pre-Purchase Verification:</strong> Customers are legally advised to consult the published
            size charts, garment specifications, and product dimensions prior to submitting orders. Requests for cancellation
            due to change of mind, duplicate placement, or subjective hesitation post-checkout cannot be accommodated.
          </p>
        </div>
      </section>

      {/* ── SECTION 3.0 ── */}
      <section id="rf-3" className="border-b border-black pb-6 sm:pb-8">
        <div className="border-b border-neutral-300 pb-2 mb-3 sm:mb-4">
          <div className="text-[10px] sm:text-xs font-mono font-bold uppercase tracking-widest text-neutral-500 mb-1">
            CLAUSE 3.0
          </div>
          <h2 className="text-base sm:text-lg font-serif font-black uppercase text-black leading-snug break-words">
            3.0 ORDER CANCELLATION BY KALASTRA &amp; FULL RESTITUTION
          </h2>
        </div>
        <div className="space-y-3">
          <p>
            <strong>3.1 Legitimate Grounds for Cancellation:</strong> Kalastra reserves the right to cancel an Order prior
            to physical delivery under the following limited circumstances:
          </p>
          <ul className="list-disc pl-5 sm:pl-6 space-y-1 text-xs">
            <li>A structural textile defect or tailoring flaw is discovered during internal pre-dispatch quality checks;</li>
            <li>A material typographical or technical pricing error was displayed on the Site;</li>
            <li>The transaction is flagged as high-risk or potentially fraudulent by our payment aggregator (Razorpay);</li>
            <li>Delivery address falls within an unserviceable remote postal PIN code.</li>
          </ul>
          <p>
            <strong>3.2 100% Refund Restitution:</strong> In any event where Kalastra cancels an Order, the Customer shall
            be entitled to a complete <strong>100% refund of the total purchase amount</strong>, remitted to the original
            source payment method within <strong>7 to 14 Business Days</strong>. This refund constitutes the Customer&rsquo;s
            sole and exclusive remedy.
          </p>
        </div>
      </section>

      {/* ── SECTION 4.0 ── */}
      <section id="rf-4" className="border-b border-black pb-6 sm:pb-8">
        <div className="border-b border-neutral-300 pb-2 mb-3 sm:mb-4">
          <div className="text-[10px] sm:text-xs font-mono font-bold uppercase tracking-widest text-neutral-500 mb-1">
            CLAUSE 4.0
          </div>
          <h2 className="text-base sm:text-lg font-serif font-black uppercase text-black leading-snug break-words">
            4.0 7-DAY RETURN WINDOW FOR DEFECTIVE/DAMAGED ITEMS
          </h2>
        </div>
        <div className="space-y-3">
          <p>
            <strong>4.1 Statutory Notification Period:</strong> Pursuant to Rule 4(4) of the <em>Consumer Protection
            (E-Commerce) Rules, 2020</em>, if a product arrives in a physically damaged condition, suffers from a genuine
            manufacturing defect, or is materially different from the item confirmed in the purchase invoice, you must notify
            Kalastra within <strong>seven (7) calendar days of physical delivery</strong>.
          </p>
          <p>
            <strong>4.2 Expiry of Return Rights:</strong> Any claim submitted after the expiry of the 7-calendar-day window
            shall be deemed time-barred, and the goods shall be conclusively presumed accepted in satisfactory condition.
          </p>
        </div>
      </section>

      {/* ── SECTION 5.0 ── */}
      <section id="rf-5" className="border-b border-black pb-6 sm:pb-8">
        <div className="border-b border-neutral-300 pb-2 mb-3 sm:mb-4">
          <div className="text-[10px] sm:text-xs font-mono font-bold uppercase tracking-widest text-neutral-500 mb-1">
            CLAUSE 5.0
          </div>
          <h2 className="text-base sm:text-lg font-serif font-black uppercase text-black leading-snug break-words">
            5.0 MANDATORY EVIDENTIARY PROTOCOL (UNBOXING PROOF)
          </h2>
        </div>
        <div className="space-y-3">
          <p>
            To initiate an investigation of a claimed defect or transit damage, the Customer must transmit an email to
            <code>kalastra29@gmail.com</code> containing the following mandatory evidentiary documentation:
          </p>
          <div className="border border-black divide-y divide-black font-mono text-xs my-3 bg-neutral-50">
            <div className="p-3">
              <strong>1. Order &amp; Invoice Reference:</strong> The official Kalastra Order ID, purchase invoice number,
              and registered customer contact number.
            </div>
            <div className="p-3">
              <strong>2. Unboxing Record:</strong> Clear, high-resolution digital photographs or an
              unboxing video showcasing the outer courier package, shipping label, and the specific defect or damage.
            </div>
            <div className="p-3">
              <strong>3. Intact Tags &amp; Labels:</strong> Photographic verification that all manufacturer tags, brand
              labels, and wash care tags remain attached to the garment.
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 6.0 ── */}
      <section id="rf-6" className="border-b border-black pb-6 sm:pb-8">
        <div className="border-b border-neutral-300 pb-2 mb-3 sm:mb-4">
          <div className="text-[10px] sm:text-xs font-mono font-bold uppercase tracking-widest text-neutral-500 mb-1">
            CLAUSE 6.0
          </div>
          <h2 className="text-base sm:text-lg font-serif font-black uppercase text-black leading-snug break-words">
            6.0 STRICTLY INELIGIBLE &amp; NON-RETURNABLE CATEGORIES
          </h2>
        </div>
        <div className="space-y-3">
          <p>
            Returns and refunds shall be summarily rejected under the following circumstances:
          </p>
          <ul className="list-disc pl-5 sm:pl-6 space-y-1.5 text-xs">
            <li>Garments that have been worn, washed, perfume-sprayed, soiled, or altered;</li>
            <li>Garments from which original tags, brand ribbons, or seals have been detached or tampered with;</li>
            <li>Items sold during clearance sales or purchased using specific non-refundable promotional discount codes;</li>
            <li>Damage caused by failure to adhere to garment wash and ironing instructions;</li>
            <li>Minor dimensional variances within the standard 1 to 2 cm manufacturing tolerance;</li>
            <li>Subtle color variances attributable to monitor RGB calibrations;</li>
            <li>Claims lodged beyond the statutory 7-calendar-day notification window.</li>
          </ul>
        </div>
      </section>

      {/* ── SECTION 7.0 ── */}
      <section id="rf-7" className="border-b border-black pb-6 sm:pb-8">
        <div className="border-b border-neutral-300 pb-2 mb-3 sm:mb-4">
          <div className="text-[10px] sm:text-xs font-mono font-bold uppercase tracking-widest text-neutral-500 mb-1">
            CLAUSE 7.0
          </div>
          <h2 className="text-base sm:text-lg font-serif font-black uppercase text-black leading-snug break-words">
            7.0 REVERSE LOGISTICS &amp; RETURN SHIPPING COST ALLOCATION
          </h2>
        </div>
        <div className="space-y-3">
          <p>
            <strong>7.1 Company-Borne Reverse Shipping:</strong> If a return request is preliminarily validated by
            our legal desk as a genuine defect or transit damage, <strong>Kalastra will bear 100% of the return courier
            costs</strong>. We will arrange a reverse pickup from your delivery address or provide a prepaid shipping label.
          </p>
          <p>
            <strong>7.2 Safe Packaging Obligation:</strong> You must ensure the garment is securely repacked in its original
            box and weather-resistant mailer. Any damage incurred during reverse transit due to inadequate packaging shall
            be the liability of the Customer.
          </p>
        </div>
      </section>

      {/* ── SECTION 8.0 ── */}
      <section id="rf-8" className="border-b border-black pb-6 sm:pb-8 bg-neutral-50 p-3 sm:p-4 border">
        <div className="border-b border-black pb-2 mb-3 sm:mb-4">
          <div className="text-[10px] sm:text-xs font-mono font-bold uppercase tracking-widest text-black mb-1">
            STATUTORY TIMELINE SUMMARY
          </div>
          <h2 className="text-base sm:text-lg font-serif font-black uppercase text-black leading-snug break-words">
            8.0 INSPECTION, APPROVAL &amp; REFUND TURNAROUND TIMELINES
          </h2>
        </div>
        <div className="space-y-3">
          <p>
            Following the receipt of the returned garment at our Mumbai facility, the following turnaround milestones
            are observed:
          </p>

          {/* ── Mobile Responsive Steps View (sm:hidden) ── */}
          <div className="sm:hidden space-y-2.5 my-3">
            {REFUND_STAGES.map((item) => (
              <div key={item.step} className="border border-black p-3 bg-white font-mono text-xs">
                <div className="flex items-center justify-between border-b border-neutral-200 pb-1.5 mb-2">
                  <span className="font-bold text-black uppercase text-[11px]">{item.step}. {item.stage}</span>
                  <span className="text-[9px] bg-neutral-100 border border-black px-1.5 py-0.5 font-bold">
                    {item.sla}
                  </span>
                </div>
                <p className="text-[11px] text-neutral-700 leading-snug">
                  {item.action}
                </p>
              </div>
            ))}
          </div>

          {/* ── Desktop Clean Table View (hidden sm:block) ── */}
          <div className="hidden sm:block overflow-x-auto w-full my-3">
            <table className="w-full border border-black text-xs font-mono bg-white">
              <thead>
                <tr className="bg-neutral-100 border-b border-black text-left">
                  <th className="p-2.5 border-r border-black uppercase w-1/3">Stage</th>
                  <th className="p-2.5 border-r border-black uppercase w-1/3">Action Performed</th>
                  <th className="p-2.5 uppercase w-1/3">Statutory SLA</th>
                </tr>
              </thead>
              <tbody>
                {REFUND_STAGES.map((item, idx) => (
                  <tr key={item.step} className={idx % 2 === 1 ? 'bg-neutral-50 border-b border-black' : 'border-b border-black'}>
                    <td className="p-2.5 font-bold border-r border-black">{item.step}. {item.stage}</td>
                    <td className="p-2.5 border-r border-black">{item.action}</td>
                    <td className="p-2.5 font-bold">{item.sla}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-[11px] font-mono text-neutral-600">
            Note: While Kalastra initiates payment reversals promptly through Razorpay, actual credit reflects according to
            the interbank clearing cycles of your issuing financial institution.
          </p>
        </div>
      </section>

      {/* ── SECTION 9.0 ── */}
      <section id="rf-9" className="border-b border-black pb-6 sm:pb-8">
        <div className="border-b border-neutral-300 pb-2 mb-3 sm:mb-4">
          <div className="text-[10px] sm:text-xs font-mono font-bold uppercase tracking-widest text-neutral-500 mb-1">
            CLAUSE 9.0
          </div>
          <h2 className="text-base sm:text-lg font-serif font-black uppercase text-black leading-snug break-words">
            9.0 EXCHANGES &amp; REPLACEMENT PROCEDURE
          </h2>
        </div>
        <div className="space-y-3">
          <p>
            Kalastra does not maintain ready stock for direct one-to-one size exchanges. If your approved defective item
            is returned and verified, you will receive a full refund, allowing you to place a fresh Order on the Site for the
            correct size or desired alternative style.
          </p>
        </div>
      </section>

      {/* ── SECTION 10.0 ── */}
      <section id="rf-10" className="pb-4">
        <div className="border-b border-neutral-300 pb-2 mb-3 sm:mb-4">
          <div className="text-[10px] sm:text-xs font-mono font-bold uppercase tracking-widest text-neutral-500 mb-1">
            CLAUSE 10.0
          </div>
          <h2 className="text-base sm:text-lg font-serif font-black uppercase text-black leading-snug break-words">
            10.0 STATUTORY GRIEVANCE REDRESSAL &amp; CONSUMER FORUM RIGHTS
          </h2>
        </div>
        <div className="space-y-3">
          <p>
            Pursuant to the <em>Consumer Protection (E-Commerce) Rules, 2020</em>, any grievance regarding non-receipt of
            refunds, arbitrary rejection of returns, or transit disputes must be directed to our designated officer:
          </p>
          <div className="border border-black p-3 sm:p-4 bg-neutral-50 font-mono text-xs space-y-1 break-words">
            <div className="font-bold text-sm text-black">CONSUMER GRIEVANCE &amp; REFUND REDRESSAL OFFICER</div>
            <div><strong>Entity:</strong> Kalastra (Sole Proprietorship)</div>
            <div><strong>Registered Office:</strong> Kopar Railway Station, Mumbai, Maharashtra, India</div>
            <div><strong>Email:</strong> <span className="break-all">kalastra29@gmail.com</span> (Subject: &ldquo;REFUND GRIEVANCE&rdquo;)</div>
            <div><strong>Telephone:</strong> +91 9082260829</div>
            <div><strong>Statutory Acknowledgment:</strong> Within 48 hours</div>
            <div><strong>Statutory Resolution:</strong> Within 30 days</div>
          </div>
          <div className="border border-black p-3 bg-neutral-100 font-mono text-xs mt-3 break-words">
            <strong>CONSUMER COMMISSION JURISDICTION:</strong> In the event a consumer dispute is not resolved amicably,
            the Customer reserves statutory recourse under the <em>Consumer Protection Act, 2019</em>, before the
            <strong>District Consumer Disputes Redressal Commission at Mumbai, Maharashtra</strong>, or through the
            Government of India&rsquo;s <strong>National Consumer Helpline (NCH)</strong>.
          </div>
        </div>
      </section>
    </LegalLayout>
  );
}
