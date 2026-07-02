import { motion } from "framer-motion";
import { ArrowRight, Clock } from "lucide-react";

const posts = [
  {
    title: "Growing a SaaS Without Breaking Systems",
    excerpt:
      "How sustainable growth comes from strong foundations, clear processes, and...",
    category: "Growth",
    image: "bg-amber-100",
  },
  {
    title: "Designing SaaS Workflows That Scale",
    excerpt:
      "A practical guide to building clear, reliable workflows that support growth without...",
    category: "Workflows",
    readTime: "5 min read",
    image: "bg-blue-100",
  },
  {
    title: "The Real Cost of Manual SaaS Work",
    excerpt:
      "A practical look at simplifying workflows, reducing manual work, and scaling...",
    category: "Automation",
    image: "bg-purple-100",
  },
  {
    title: "Streamlining SaaS Without Adding Overhead",
    excerpt:
      "A clear look at how efficient operations help SaaS teams reduce friction, stay aligned, and scale without unnecessary...",
    category: "Operations",
    readTime: "5 min read",
    featured: true,
  },
];

export default function Blog() {
  return (
    <section
      id="blog"
      className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
    >
      <div className="text-center mb-12">
        <span className="inline-block px-4 py-1.5 bg-purple-50 text-purple-600 rounded-full text-sm font-medium mb-4">
          Blogs
        </span>
        <h2 className="text-3xl sm:text-4xl font-bold text-[var(--text)] mb-4">
          Helpful Insights
          <br />
          To Help You Grow
        </h2>
        <p className="text-[var(--text-muted)] mb-8">
          Explore our latest articles to help your SaaS product succeed and
          scale smarter.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {posts.slice(0, 3).map((post, idx) => (
          <motion.article
            key={post.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1 }}
            className="bg-[var(--card)] rounded-3xl overflow-hidden border border-[var(--border)] hover:shadow-lg transition-shadow cursor-pointer"
          >
            <div className={`h-48 ${post.image}`} />
            <div className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="px-3 py-1 bg-purple-100 text-purple-600 rounded-full text-xs font-medium">
                  {post.category}
                </span>
                {post.readTime && (
                  <span className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
                    <Clock className="w-3 h-3" />
                    {post.readTime}
                  </span>
                )}
              </div>
              <h3 className="font-bold text-[var(--text)] mb-2 line-clamp-2">
                {post.title}
              </h3>
              <p className="text-sm text-[var(--text-muted)] line-clamp-2">
                {post.excerpt}
              </p>
            </div>
          </motion.article>
        ))}
      </div>

      {/* Featured Post */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="bg-[var(--card)] rounded-3xl overflow-hidden border border-[var(--border)]"
      >
        <div className="grid md:grid-cols-2">
          <div className="h-64 md:h-auto bg-emerald-100" />
          <div className="p-8 flex flex-col justify-center">
            <span className="inline-block px-3 py-1 bg-purple-100 text-purple-600 rounded-full text-xs font-medium w-fit mb-4">
              {posts[3].category}
            </span>
            <h3 className="text-2xl font-bold text-[var(--text)] mb-3">
              {posts[3].title}
            </h3>
            <p className="text-[var(--text-muted)] mb-4">{posts[3].excerpt}</p>
            <div className="flex items-center gap-2 text-sm text-[var(--text-muted)] mb-6">
              <Clock className="w-4 h-4" />
              {posts[3].readTime}
            </div>
          </div>
        </div>
      </motion.div>

      <div className="text-center mt-8">
        <button className="inline-flex items-center gap-2 text-[var(--text)] font-medium hover:text-purple-600 transition-colors">
          View all <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </section>
  );
}
