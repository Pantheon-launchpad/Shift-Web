import { useEffect, useState } from 'react';
import { Menu, X, Moon, Sun, ArrowUpRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../stores/useStore';
import logo from '../assets/logo.svg';

const navLinks = [
  { name: 'Product', href: '#product' },
  { name: 'How it works', href: '#how-it-works' },
  { name: 'Proof', href: '#proof' },
  { name: 'Pricing', href: '#pricing' },
  { name: 'FAQ', href: '#faq' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState('#product');
  const { theme, toggleTheme } = useStore();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const sections = navLinks
      .map((link) => document.querySelector<HTMLElement>(link.href))
      .filter((el): el is HTMLElement => el !== null);

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActive(`#${entry.target.id}`);
          }
        });
      },
      {
        // Thin band near the vertical center of the viewport, offset for the
        // fixed navbar — whichever section crosses it becomes "active".
        rootMargin: '-45% 0px -50% 0px',
        threshold: 0,
      }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return (
    <motion.nav
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
      className="fixed top-4 left-0 right-0 z-50 flex justify-center px-4"
    >
      <div
        className="glass-strong flex items-center rounded-full transition-all duration-500 ease-out"
        style={{
          padding: scrolled ? '6px 8px 6px 18px' : '9px 10px 9px 22px',
          gap: scrolled ? '1.25rem' : '2rem',
          boxShadow: 'var(--shadow-lift)',
        }}
      >
        <a href="#" className="flex items-center gap-2 shrink-0">
          <img src={logo} alt="Shift logo" className="w-7 h-7 rounded-lg" />
          <span className="font-display font-semibold text-[15px]" style={{ color: 'var(--text)' }}>Shift</span>
        </a>

        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={() => setActive(link.href)}
              className="relative px-3 py-1.5 text-[13px] font-medium rounded-full transition-colors"
              style={{ color: active === link.href ? 'var(--text)' : 'var(--text-muted)' }}
            >
              {active === link.href && (
                <motion.span
                  layoutId="nav-active"
                  className="absolute inset-0 rounded-full"
                  style={{ background: 'var(--glass-strong)', border: '1px solid var(--glass-border)' }}
                  transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                />
              )}
              <span className="relative">{link.name}</span>
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="relative w-8 h-8 rounded-full flex items-center justify-center overflow-hidden"
            style={{ background: 'var(--glass)', border: '1px solid var(--glass-border)' }}
          >
            <AnimatePresence mode="wait" initial={false}>
              {theme === 'dark' ? (
                <motion.span key="moon" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.25 }}>
                  <Moon className="w-4 h-4" style={{ color: 'var(--text)' }} />
                </motion.span>
              ) : (
                <motion.span key="sun" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.25 }}>
                  <Sun className="w-4 h-4" style={{ color: 'var(--text)' }} />
                </motion.span>
              )}
            </AnimatePresence>
          </button>

          <button onClick={() => navigate('/login')} className="btn btn-primary hidden md:inline-flex text-[13px] py-2 px-4">
            Start free <ArrowUpRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: 'var(--glass)', border: '1px solid var(--glass-border)' }}
          >
            {isOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.97 }}
            transition={{ duration: 0.2 }}
            className="glass-strong absolute top-16 left-4 right-4 rounded-3xl p-4 md:hidden"
            style={{ boxShadow: 'var(--shadow-lift)' }}
          >
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="px-3 py-2.5 rounded-xl text-sm font-medium"
                  style={{ color: 'var(--text)' }}
                >
                  {link.name}
                </a>
              ))}
              <button onClick={() => navigate('/login')} className="btn btn-primary w-full mt-2 justify-center">Start free</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
