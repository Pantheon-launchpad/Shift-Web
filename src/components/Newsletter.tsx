// newsletter.tsx
'use client';

import { motion } from 'framer-motion';
import { Send } from 'lucide-react';

export default function Newsletter() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative bg-white rounded-3xl p-12 border border-gray-200 overflow-hidden"
      >
        {/* Animated decorative elements */}
        <motion.div 
          className="absolute top-0 left-0 w-32 h-32 bg-purple-800"
          initial={{ x: -100, y: -100, rotate: 45 }}
          whileInView={{ x: -50, y: -50 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
        <motion.div 
          className="absolute bottom-0 right-0 w-48 h-48 bg-purple-800"
          initial={{ x: 100, y: 100, rotate: 12 }}
          whileInView={{ x: 25, y: 25 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
        />
        
        {/* Floating shapes */}
        <motion.div
          className="absolute top-20 right-20 w-4 h-4 bg-purple-200 rounded-full"
          animate={{ y: [0, -20, 0], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-20 left-20 w-6 h-6 bg-purple-300 rounded-full"
          animate={{ y: [0, 15, 0], opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: 4, repeat: Infinity, delay: 1 }}
        />
        
        <div className="relative z-10 text-center">
          <motion.h2 
            className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Subscribe To The<br />Shift Newsletter!
          </motion.h2>
          <motion.p 
            className="text-gray-600 mb-8 max-w-md mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Get expert tips, updates, and smart analytics insights delivered straight to your inbox.
          </motion.p>
          
          <motion.div 
            className="flex flex-col sm:flex-row gap-3 justify-center items-center max-w-md mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <input 
              type="email" 
              placeholder="Enter your email"
              className="w-full sm:flex-1 px-6 py-3 rounded-full border border-gray-200 focus:outline-none focus:border-purple-500 transition-colors"
            />
            <motion.button 
              className="w-full sm:w-auto bg-purple-800 text-white px-8 py-3 rounded-full font-medium hover:bg-purple-800 transition-colors flex items-center justify-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Subscribe Now
              <Send className="w-4 h-4" />
            </motion.button>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}