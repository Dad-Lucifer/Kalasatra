import TopNotification from '../components/landing/TopNotification';
import Navbar from '../components/landing/Navbar';
import CategoryNav from '../components/landing/CategoryNav';
import HeroSection from '../components/landing/HeroSection';
import FeaturedCategories from '../components/landing/FeaturedCategories';
import MatchTheMood from '../components/landing/MatchTheMood';
import Steals from '../components/landing/Steals';
import NewAndPopular from '../components/landing/NewAndPopular';
import BottomMobileNav from '../components/landing/BottomMobileNav';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-black font-sans pb-16 lg:pb-0">
      {/* Top UI */}
      <div className="sticky top-0 z-50">
        <TopNotification />
        <Navbar />
        <CategoryNav />
      </div>

      {/* Main Content */}
      <main>
        <HeroSection />
        <FeaturedCategories />
        <MatchTheMood />
        <Steals />
        <NewAndPopular />
      </main>

      {/* Bottom Nav for Mobile */}
      <BottomMobileNav />
    </div>
  );
}
