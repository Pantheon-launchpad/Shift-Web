import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import DashboardPreview from "./components/DashboardPreview";
import LogoCloud from "./components/LogoCloud";
import Features from "./components/Features";
import Benefits from "./components/Benefits";
import HowItWorks from "./components/HowItWorks";
import Integrations from "./components/Integrations";
import Testimonials from "./components/Testimonials";
import Pricing from "./components/Pricing";
import Comparison from "./components/Comparison";
import FAQ from "./components/FAQ";
import Blog from "./components/Blog";
import Newsletter from "./components/Newsletter";
import Footer from "./components/Footer";

function App() {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] transition-colors duration-300">
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
  );
}

export default App;
