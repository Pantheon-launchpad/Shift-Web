import { motion } from "framer-motion";
import { ArrowRight, Clock } from "lucide-react";

const posts = [
  {
    title: 'Why goals fail before they start',
    excerpt: 'It usually isn\u2019t ambition or discipline. It\u2019s that nobody tells you what to do on a random Tuesday...',
    category: 'Finishing',
    readTime: '4 min read',
  },
  {
    title: 'The case for one task a day',
    excerpt: 'A long backlog feels productive and produces nothing. Here\u2019s what happens when you cut it to one...',
    category: 'Focus',
    readTime: '5 min read',
  },
  {
    title: 'Build in public without the dread',
    excerpt: 'Most people quit posting updates because writing them feels like a second job. It doesn\u2019t have to...',
    category: 'Proof',
    readTime: '3 min read',
  },
  {
    title: 'What a roadmap should actually do',
    excerpt: 'Most roadmaps are static documents nobody revisits. A good one should update itself and tell you what today looks like, not just where the finish line is.',
    category: 'Roadmaps',
    readTime: '6 min read',
    featured: true,
  },
];

export default function Blog() {
  return (
    <section id="blog" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-14">
        <div className="eyebrow justify-center mb-4">Notes</div>
        <h2 className="font-display font-semibold mb-4" style={{ fontSize: 'clamp(1.9rem, 3.4vw, 2.75rem)', color: 'var(--text)' }}>
          Writing on finishing what you start
        </h2>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 mb-5">
        {posts.slice(0, 3).map((post, idx) => (
          <motion.article
            key={post.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1 }}
            className="card p-6 cursor-pointer"
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="pill px-2.5 py-1 text-[10.5px] font-mono" style={{ color: 'var(--violet)' }}>{post.category}</span>
              <span className="flex items-center gap-1 text-[11px] text-faint">
                <Clock className="w-3 h-3" />{post.readTime}
              </span>
            </div>
            <h3 className="font-display font-semibold text-[16px] mb-2 leading-snug" style={{ color: 'var(--text)' }}>{post.title}</h3>
            <p className="text-[13px] leading-relaxed text-muted">{post.excerpt}</p>
          </motion.article>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="glass-strong rounded-3xl p-8 md:p-10"
      >
        <span className="pill inline-block px-2.5 py-1 text-[10.5px] font-mono mb-4" style={{ color: 'var(--gold)' }}>{posts[3].category}</span>
        <h3 className="font-display text-2xl font-semibold mb-3 max-w-xl" style={{ color: 'var(--text)' }}>{posts[3].title}</h3>
        <p className="text-muted mb-5 max-w-xl leading-relaxed">{posts[3].excerpt}</p>
        <div className="flex items-center gap-2 text-[12px] text-faint">
          <Clock className="w-3.5 h-3.5" />{posts[3].readTime}
        </div>
      </motion.div>

      <div className="text-center mt-10">
        <button className="inline-flex items-center gap-2 font-medium text-sm" style={{ color: 'var(--text)' }}>
          Read more <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </section>
  );
}
