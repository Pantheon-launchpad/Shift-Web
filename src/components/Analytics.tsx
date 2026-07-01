import { useAnalytics } from '../hooks/useAnalytics';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

export const Analytics = () => {
  const { data, isLoading } = useAnalytics();

  if (isLoading) {
    return (
      <section id="analytics" className="py-24 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="animate-pulse text-white">Loading analytics...</div>
        </div>
      </section>
    );
  }

  return (
    <section id="analytics" className="py-24 bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Powerful analytics at your fingertips
            </h2>
            <p className="text-gray-400 mb-8">
              Track your key metrics in real-time. Our dashboard gives you a complete 
              overview of your business performance with actionable insights.
            </p>
            
            <div className="grid grid-cols-3 gap-6">
              <div>
                <div className="text-3xl font-bold text-white">{data?.users.toLocaleString()}</div>
                <div className="text-sm text-gray-400">Active Users</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-400">${data?.revenue.toLocaleString()}</div>
                <div className="text-sm text-gray-400">Revenue</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-400">+{data?.growth}%</div>
                <div className="text-sm text-gray-400">Growth</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-black p-6 rounded-2xl border border-white/10"
          >
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data?.chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="name" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#a855f7" 
                  strokeWidth={3}
                  dot={{ fill: '#a855f7' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        </div>
      </div>
    </section>
  );
};