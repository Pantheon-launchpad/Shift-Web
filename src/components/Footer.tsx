import { FaXTwitter, FaLinkedin, FaInstagram } from 'react-icons/fa6';
import logo from '../assets/logo.svg';

const footerLinks = {
  Product: ['How it works', 'Roadmaps', 'Focus sessions', 'Proof cards', 'Pricing'],
  Company: ['About', 'Notes', 'Careers'],
  Legal: ['Privacy', 'Terms'],
};

const socials = [
  { Icon: FaXTwitter, label: 'X' },
  { Icon: FaLinkedin, label: 'LinkedIn' },
  { Icon: FaInstagram, label: 'Instagram' },
];

export default function Footer() {
  return (
    <footer className="py-16 px-4 sm:px-6 lg:px-8" style={{ borderTop: '1px solid var(--line)' }}>
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <img src={logo} alt="Shift logo" className="w-7 h-7 rounded-lg" />
              <span className="font-display font-semibold text-lg" style={{ color: 'var(--text)' }}>Shift</span>
            </div>
            <p className="text-sm text-muted mb-5 max-w-xs leading-relaxed">
              Most productivity apps help you plan. Shift helps you finish.
            </p>
            <div className="flex items-center gap-2">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href="#"
                  aria-label={s.label}
                  className="w-9 h-9 rounded-full flex items-center justify-center pill"
                >
                  <s.Icon className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                </a>
              ))}
            </div>
          </div>

          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-semibold text-[13px] mb-4" style={{ color: 'var(--text)' }}>{category}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-[13px] text-muted hover:text-[var(--text)] transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-4" style={{ borderTop: '1px solid var(--line)' }}>
          <p className="text-[13px] text-faint">© 2026 Shift. Built for people who start things.</p>
          <p className="text-[13px] text-faint">One task. Every day.</p>
        </div>
      </div>
    </footer>
  );
}
