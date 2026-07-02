import { Plus } from "lucide-react";

const footerLinks = {
  Sections: ["Features", "Benefits", "Integrations", "Pricing", "FAQ"],
  Socials: ["Instagram", "Twitter/X", "LinkedIn"],
  Pages: ["Home", "Newsletter", "Blogs", "404"],
};

export default function Footer() {
  return (
    <footer className="bg-[var(--card)] border-t border-[var(--border)] py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-purple-800 rounded-lg flex items-center justify-center">
                <Plus className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-[var(--text)]">
                Shift
              </span>
            </div>
            <p className="text-[var(--text-muted)] text-sm mb-4">
              Turn complex data into clear, actionable insights so you can make
              smarter decisions and drive growth with confidence
            </p>
            <button className="bg-purple-800 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-purple-800 transition-colors">
              Get Template
            </button>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-semibold text-[var(--text)] mb-4">
                {category}
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-[var(--text-muted)] hover:text-[var(--text)] text-sm transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-8 border-t border-[var(--border)] flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-[var(--text-muted)]"> by Tega</p>
          <p className="text-sm text-[var(--text-muted)]">
            Built in Framer. © 2024 Shift
          </p>
        </div>
      </div>
    </footer>
  );
}
