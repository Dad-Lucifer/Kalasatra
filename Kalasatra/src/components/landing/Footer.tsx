
import { Link } from 'react-router-dom';
import { 
  FaInstagram, 
  FaXTwitter, 
  FaYoutube, 
  FaWhatsapp, 
} from 'react-icons/fa6';
import logoImg from '../../assets/kalastra-logo.png';

const footerNav = [
  {
    title: 'COLLECTIONS',
    links: [
      { label: "Men's Wear", href: '/category/mens-wear' },
      { label: "Women's Wear", href: '/category/womens-wear' },
      { label: "Kids' Wear", href: '/category/kids-wear' },
      { label: 'Accessories', href: '/category/accessories' },
      { label: 'New Arrivals', href: '/category/new-arrivals' },
    ],
  },
  {
    title: 'THE BRAND',
    links: [
      { label: 'Our Story', href: '/#story' },
      { label: 'Craftsmanship', href: '/#story' },
      { label: 'Sustainability', href: '/#story' },
      { label: 'Press & Media', href: '#' },
      { label: 'Careers', href: '#' },
    ],
  },
  {
    title: 'HELP & SUPPORT',
    links: [
      { label: 'Customer Care', href: '#' },
      { label: 'Shipping & Delivery', href: '#' },
      { label: 'Returns & Exchanges', href: '#' },
      { label: 'Size Guide', href: '#' },
      { label: 'Track Order', href: '/orders' },
    ],
  },
  {
    title: 'LEGAL',
    links: [
      { label: 'Privacy Policy', href: '#' },
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Cookie Preferences', href: '#' },
      { label: 'Accessibility', href: '#' },
    ],
  },
];

const socialLinks = [
  { name: 'Instagram', href: 'https://instagram.com', icon: FaInstagram },
  { name: 'X / Twitter', href: 'https://twitter.com', icon: FaXTwitter },
  { name: 'YouTube', href: 'https://youtube.com', icon: FaYoutube },
  { name: 'WhatsApp', href: 'https://whatsapp.com', icon: FaWhatsapp },
];

export default function Footer() {


  

  return (
    <footer className="bg-black text-white border-t border-zinc-900 pt-16 lg:pt-24 pb-12 px-6 sm:px-10 md:px-16 lg:px-24 relative overflow-hidden">
      {/* Top Newsletter / Brand Statement Banner */}
     

      {/* Main Footer Links Grid */}
      <div className="max-w-7xl mx-auto py-13 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12 lg:gap-8">
        {/* Brand Info Column */}
        <div className="lg:col-span-2 space-y-6 pr-4">
         
          <Link to="/" className=" flex flex-row items-center gap-1">
            <img 
              src={logoImg} 
              alt="Kalastra Logo" 
              className="h-30 sm:h-30 w-auto object-contain  "
            />
            <div className="text-3xl  text-white mt-1 font-bold tracking-wide">
              KALASTRA
            </div>
          </Link>

          {/* <p className="text-xl text-zinc-400 leading-relaxed font-normal max-w-sm">
            Kalastra combines <span className="text-white italic">“Kala”</span> (Art) and <span className="text-white italic">“Vastra”</span> (Clothing) to create trendsetting wearable art that empowers personal, unapologetic expression.
          </p> */}

          {/* Social Links */}
          <div className="flex items-center gap-3 pt-2">
            {socialLinks.map((social) => {
              const IconComponent = social.icon;
              return (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.name}
                  className="w-10 h-10 rounded-full border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white hover:border-white hover:bg-zinc-900 transition-all duration-300"
                >
                  <IconComponent className="text-base" />
                </a>
              );
            })}
          </div>
        </div>

        {/* Navigation Link Columns */}
        {footerNav.map((col) => (
          <div key={col.title} className="space-y-5">
            <h4 className="text-md font-bold uppercase tracking-[0.2em] text-white">
              {col.title}
            </h4>
            <ul className="space-y-3">
              {col.links.map((link) => (
                <li key={link.label}>
                  {link.href.startsWith('/') ? (
                    <Link
                      to={link.href}
                      className="text-lg sm:text-lg text-zinc-400 hover:text-yellow-400 transition-colors duration-200 block"
                    >
                      {link.label}
                    </Link>
                  ) : (
                    <a
                      href={link.href}
                      className="text-lg sm:text-lg text-zinc-400 hover:text-white transition-colors duration-200 block"
                    >
                      {link.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom Bar & Copyright */}
      <div className="max-w-7xl mx-auto pt-8 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-md text-zinc-500">
        <p>
          &copy; {new Date().getFullYear()} <strong className="font-semibold text-zinc-300">Kalastra Clothing</strong>. All rights reserved.
        </p>

        <p className="tracking-wide">
          WEARABLE ART CRAFTED WITH CREATIVITY & PURPOSE.
        </p>
      </div>
    </footer>
  );
}

