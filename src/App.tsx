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
      <div className="min-h-screen bg-[#f8fafc]">
        <Navbar />
        <Hero />
        <DashboardPreview />
        <LogoCloud />
        <Features />
        <Benefits />
        <HowItWorks />
        <Integrations />
        <Testimonials />
        <Pricing />
        <Comparison />
        <FAQ />
        <Blog />
        <Newsletter />
        <Footer />
      </div>
    </QueryClientProvider>
  );
}

export default App;