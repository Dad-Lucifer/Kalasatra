import Navbar from '../components/landing/Navbar';
import HeroSection from '../components/landing/HeroSection';
import BrandStory from '../components/landing/BrandStory';
import FeaturedProducts from '../components/landing/FeaturedProducts';
import BrandEngagement from '../components/landing/BrandEngagement';
import Promotions from '../components/landing/Promotions';
import Footer from '../components/landing/Footer';

interface LandingPageProps {
  onAuthClick?: () => void;
  onHomeClick?: () => void;
}

export default function LandingPage({ onAuthClick, onHomeClick }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-rich-black text-soft-white">
      <Navbar onAuthClick={onAuthClick} onHomeClick={onHomeClick} />
      <HeroSection />
      <BrandStory />
      <FeaturedProducts />
      <BrandEngagement />
      <Promotions />
      <Footer />
    </div>
  );
}
