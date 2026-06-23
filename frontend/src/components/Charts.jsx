import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { getRevenueByCategory, getRevenueOverTime, getPaymentMethods } from '../api';

const COLORS = ['#D82B27', '#1F5038', '#FFC107', '#8B4513'];

const CustomTooltip = ({ active, payload, label, isCurrency }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ backgroundColor: '#FFFFFF', padding: '1rem', border: '2px solid #1F5038', borderRadius: '4px', color: '#1F5038', boxShadow: '4px 4px 0px #1F5038' }}>
        <p style={{ margin: 0, marginBottom: '0.5rem', fontWeight: '900', textTransform: 'uppercase' }}>{label}</p>
        <p style={{ margin: 0, color: '#D82B27', fontWeight: '700' }}>
          Revenue: {isCurrency 
            ? '₹ ' + new Intl.NumberFormat('en-IN').format(payload[0].value)
            : payload[0].value}
        </p>
      </div>
    );
  }
  return null;
};

const BarChartComponent = ({ filters }) => {
  const { data = [], isLoading: loading } = useQuery({
    queryKey: ['revenue-by-category', filters],
    queryFn: async () => {
      const res = await getRevenueByCategory(filters);
      return res.data;
    }
  });

  return (
    <div className="glass-card">
      <h3 style={{ margin: '0 0 1rem 0', color: '#1F5038', fontWeight: 900, textTransform: 'uppercase' }}>Revenue by Category</h3>
      <div style={{ height: 300 }}>
        {loading ? <div className="spinner-container"><div className="spinner"></div></div> : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1F5038" strokeOpacity={0.2} vertical={false} />
              <XAxis dataKey="category" stroke="#1F5038" tick={{ fill: '#1F5038', fontWeight: 600 }} angle={-45} textAnchor="end" height={60} />
              <YAxis stroke="#1F5038" tick={{ fill: '#1F5038', fontWeight: 600 }} tickFormatter={(val) => `₹ ${val/1000}k`} />
              <Tooltip content={<CustomTooltip isCurrency />} cursor={{ fill: 'rgba(31,80,56,0.1)' }} />
              <Bar dataKey="revenue" fill="#D82B27" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

const LineChartComponent = ({ filters }) => {
  const { data = [], isLoading: loading } = useQuery({
    queryKey: ['revenue-over-time', filters],
    queryFn: async () => {
      const res = await getRevenueOverTime(filters);
      return res.data;
    }
  });

  return (
    <div className="glass-card">
      <h3 style={{ margin: '0 0 1rem 0', color: '#1F5038', fontWeight: 900, textTransform: 'uppercase' }}>Revenue Over Time</h3>
      <div style={{ height: 300 }}>
        {loading ? <div className="spinner-container"><div className="spinner"></div></div> : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 10, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1F5038" strokeOpacity={0.2} vertical={false} />
              <XAxis dataKey="date" stroke="#1F5038" tick={{ fill: '#1F5038', fontWeight: 600 }} />
              <YAxis stroke="#1F5038" tick={{ fill: '#1F5038', fontWeight: 600 }} tickFormatter={(val) => `₹ ${val/1000}k`} />
              <Tooltip content={<CustomTooltip isCurrency />} cursor={{ stroke: '#1F5038', strokeWidth: 2, strokeOpacity: 0.2 }} />
              <Line type="monotone" dataKey="revenue" stroke="#1F5038" strokeWidth={3} dot={false} activeDot={{ r: 6, fill: '#D82B27', stroke: '#1F5038', strokeWidth: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

const PieTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ backgroundColor: '#FFFFFF', padding: '1rem', border: '2px solid #1F5038', borderRadius: '4px', color: '#1F5038', boxShadow: '4px 4px 0px #1F5038' }}>
        <p style={{ margin: 0, fontWeight: '900', textTransform: 'uppercase' }}>{payload[0].name}</p>
        <p style={{ margin: 0, color: payload[0].payload.fill, fontWeight: '700' }}>
          Orders: {new Intl.NumberFormat('en-IN').format(payload[0].value)}
        </p>
      </div>
    );
  }
  return null;
};

const renderPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }) => {
  const RADIAN = Math.PI / 180;
  const radius = outerRadius * 1.35;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text 
      x={x} 
      y={y} 
      fill={COLORS[index % COLORS.length]} 
      textAnchor={x > cx ? 'start' : 'end'} 
      dominantBaseline="central" 
      fontWeight="700" 
      fontSize="13"
    >
      {`${name} ${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const PaymentMethodsChart = ({ filters }) => {
  const { data = [], isLoading: loading } = useQuery({
    queryKey: ['payment-methods', filters],
    queryFn: async () => {
      const res = await getPaymentMethods(filters);
      return res.data;
    }
  });

  return (
    <div className="glass-card">
      <h3 style={{ margin: '0 0 1rem 0', color: '#1F5038', fontWeight: 900, textTransform: 'uppercase' }}>Payment Methods</h3>
      <div style={{ height: 300 }}>
        {loading ? <div className="spinner-container"><div className="spinner"></div></div> : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={100}
                paddingAngle={4}
                dataKey="total_orders"
                nameKey="method"
                label={renderPieLabel}
                labelLine={false}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<PieTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default { BarChartComponent, LineChartComponent, PaymentMethodsChart };
