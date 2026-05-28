import Navbar from '../components/landing/Navbar';
import HeroSection from '../components/landing/HeroSection';
import BrandStory from '../components/landing/BrandStory';
import FeaturedProducts from '../components/landing/FeaturedProducts';
import BrandEngagement from '../components/landing/BrandEngagement';
import Promotions from '../components/landing/Promotions';
import Footer from '../components/landing/Footer';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-rich-black text-soft-white">
      <Navbar />
      <HeroSection />
      <BrandStory />
      <FeaturedProducts />
      <BrandEngagement />
      <Promotions />
      <Footer />
    </div>
  );
}
