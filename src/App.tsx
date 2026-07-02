import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import DashboardPreview from './components/DashboardPreview';
import LogoCloud from './components/LogoCloud';
import Features from './components/Features';
import Benefits from './components/Benefits';
import HowItWorks from './components/HowItWorks';
import Integrations from './components/Integrations';
import Testimonials from './components/Testimonials';
import Pricing from './components/Pricing';
import Comparison from './components/Comparison';
import FAQ from './components/FAQ';
import Blog from './components/Blog';
import Newsletter from './components/Newsletter';
import Footer from './components/Footer';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="relative min-h-screen">
        {/* Fixed ambient background, shared across the whole page */}
        <div className="shift-canvas">
          <div className="orb" style={{ width: 560, height: 560, top: -180, left: '8%', background: 'radial-gradient(circle, #8335FD, transparent 70%)' }} />
          <div className="orb" style={{ width: 480, height: 480, top: 260, right: '2%', background: 'radial-gradient(circle, #f2b84b, transparent 70%)', opacity: 0.14 }} />
          <div className="orb" style={{ width: 640, height: 640, bottom: -260, left: '30%', background: 'radial-gradient(circle, #4b3fb0, transparent 70%)' }} />
        </div>

        <div className="relative z-10">
          <Navbar />
          <Hero />
          <DashboardPreview />
          <LogoCloud />
          <Features />
          <HowItWorks />
          <Benefits />
          <Integrations />
          <Testimonials />
          <Comparison />
          <Pricing />
          <FAQ />
          <Blog />
          <Newsletter />
          <Footer />
        </div>
      </div>
    </QueryClientProvider>
  );
}

export default App;
