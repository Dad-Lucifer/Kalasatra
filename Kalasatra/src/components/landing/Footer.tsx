import logoImg from '../../assets/kalastra-logo.png';

const footerLinks = [
  {
    title: 'Collections',
    links: [
      { label: "Men's Wear", href: '#men', icon: '▣' },
      { label: "Women's Wear", href: '#women', icon: '◈' },
      { label: "Kids' Wear", href: '#kids', icon: '◎' },
      { label: 'Accessories', href: '#', icon: '◆' },
      { label: 'Limited Drops', href: '#', icon: '★' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About Us', href: '#story', icon: '◇' },
      { label: 'Our Story', href: '#story', icon: '▪' },
      { label: 'Careers', href: '#', icon: '✦' },
      { label: 'Press Kit', href: '#', icon: '◉' },
      { label: 'Sustainability', href: '#', icon: '◎' },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'Contact Us', href: '#', icon: '→' },
      { label: 'Shipping Info', href: '#', icon: '→' },
      { label: 'Returns & Exchanges', href: '#', icon: '↺' },
      { label: 'Size Guide', href: '#', icon: '→' },
      { label: 'FAQ', href: '#', icon: '?' },
    ],
  },
  {
    title: 'Connect',
    links: [
      { label: '@kalasatra on Instagram', href: '#', icon: 'IG' },
      { label: '@kalasatra on Twitter', href: '#', icon: 'X' },
      { label: 'YouTube Channel', href: '#', icon: 'YT' },
      { label: 'Discord Community', href: '#', icon: 'DC' },
      { label: 'WhatsApp Business', href: '#', icon: 'WA' },
    ],
  },
];

const socialMedia = [
  { name: 'Instagram', handle: '@kalasatra', icon: 'IG' },
  { name: 'Twitter', handle: '@kalasatra', icon: 'X' },
  { name: 'YouTube', handle: '@kalasatra', icon: 'YT' },
  { name: 'Discord', handle: 'Kalasatra Community', icon: 'DC' },
];

export default function Footer() {
  return (
    <footer className="relative bg-rich-black border-t border-luxury-gold/15">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_center,rgba(212,175,55,0.03),transparent_70%)]" />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-10">
        {/* Main Footer Content */}
        <div className="pt-16 lg:pt-24 pb-12">
          <div className="grid sm:grid-cols-2 lg:grid-cols-6 gap-10 lg:gap-8 mb-16 lg:mb-20">
            {/* Brand Column */}
            <div className="lg:col-span-1">
              <a href="#" className="flex items-center mb-8 h-16">
                <img src={logoImg} alt="Kalastra Logo" className="h-full w-auto object-contain" />
              </a>

              <p className="text-sm text-soft-white/50 leading-relaxed mb-8 max-w-xs font-light">
                Premium streetwear at the intersection of cultural heritage and contemporary rebellion.
              </p>

              {/* Social Icons */}
              <div className="flex gap-2 flex-wrap">
                {socialMedia.map((social) => (
                  <a
                    key={social.icon}
                    href="#"
                    className="group w-9 h-9 border border-luxury-gold/20 flex items-center justify-center text-xs font-bold text-luxury-gold hover:bg-luxury-gold hover:text-rich-black hover:border-luxury-gold transition-all duration-300 hover:shadow-[0_0_15px_rgba(212,175,55,0.3)]"
                    title={social.name}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Link Columns */}
            {footerLinks.map((group) => (
              <div key={group.title} className="lg:col-span-1">
                <h4 className="text-xs uppercase tracking-[0.2em] text-luxury-gold font-bold mb-6 flex items-center gap-2">
                  <span className="w-full h-px bg-gradient-to-r from-luxury-gold/40 to-transparent" />
                  {group.title}
                </h4>
                <ul className="space-y-3">
                  {group.links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className="group/link flex items-center gap-2 text-sm text-soft-white/50 hover:text-luxury-gold transition-all duration-300"
                      >
                        <span className="text-xs opacity-0 group-hover/link:opacity-100 transition-opacity duration-300">
                          {link.icon}
                        </span>
                        <span className="group-hover/link:translate-x-1 transition-transform duration-300">
                          {link.label}
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Newsletter Signup */}
          <div className="relative p-8 lg:p-10 mb-16 border border-luxury-gold/15 bg-gradient-to-r from-dark-charcoal/50 to-rich-black/50 overflow-hidden group">
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-luxury-gold/5 rounded-full blur-2xl opacity-30 group-hover:opacity-60 transition-opacity duration-700" />
            
            <div className="relative grid lg:grid-cols-2 gap-8 items-center">
              <div className="space-y-3">
                <h3 className="font-heading text-2xl font-bold text-soft-white">
                  Get 15% Off Your First Order
                </h3>
                <p className="text-soft-white/60 text-sm">
                  Join our newsletter and stay updated with latest drops and exclusives.
                </p>
              </div>
              
              <form className="flex gap-2">
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="flex-1 px-5 py-3 bg-rich-black/60 border border-luxury-gold/20 text-soft-white text-sm placeholder:text-soft-white/30 outline-none focus:border-luxury-gold/60 transition-all duration-300"
                />
                <button className="group/btn relative px-6 py-3 bg-luxury-gold text-rich-black font-bold uppercase tracking-[0.1em] text-sm hover:shadow-[0_0_25px_rgba(212,175,55,0.4)] transition-all duration-500">
                  <span className="relative z-10">Subscribe</span>
                  <span className="absolute inset-0 bg-gold-light scale-x-0 group-hover/btn:scale-x-100 transition-transform duration-500 origin-left" />
                </button>
              </form>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-luxury-gold/20 to-transparent mb-8" />
        </div>

        {/* Bottom Footer */}
        <div className="py-10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="text-xs text-soft-white/40 order-2 sm:order-1">
            <p>&copy; {new Date().getFullYear()} Kalasatra Studio. All rights reserved.</p>
            <p className="mt-2">Crafted for those who refuse to blend in.</p>
          </div>

          <div className="flex gap-8 order-1 sm:order-2 flex-wrap justify-center">
            <a
              href="#"
              className="text-xs uppercase tracking-[0.1em] text-soft-white/40 hover:text-luxury-gold transition-colors duration-300"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="text-xs uppercase tracking-[0.1em] text-soft-white/40 hover:text-luxury-gold transition-colors duration-300"
            >
              Terms of Service
            </a>
            <a
              href="#"
              className="text-xs uppercase tracking-[0.1em] text-soft-white/40 hover:text-luxury-gold transition-colors duration-300"
            >
              Cookie Policy
            </a>
            <a
              href="#"
              className="text-xs uppercase tracking-[0.1em] text-soft-white/40 hover:text-luxury-gold transition-colors duration-300"
            >
              Sitemap
            </a>
          </div>

          <div className="text-xs text-soft-white/40 order-3 justify-self-end">
            <p className="text-right">
              Read <span className="text-luxury-gold font-semibold">@kalasatra</span> for inspiration
            </p>
          </div>
        </div>
      </div>

      {/* Top Divider */}
      <div className="absolute bottom-full left-0 right-0 h-px bg-gradient-to-r from-transparent via-luxury-gold/10 to-transparent" />
    </footer>
  );
}
