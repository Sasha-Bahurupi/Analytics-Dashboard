import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getSummary } from '../api';
import { IndianRupee, ShoppingCart, Activity, Store } from 'lucide-react';

const formatCurrency = (value) => {
  return '₹ ' + new Intl.NumberFormat('en-IN').format(value);
};

const formatNumber = (value) => {
  return new Intl.NumberFormat('en-US').format(value);
};

const KPICards = ({ filters }) => {
  const { data, isLoading: loading } = useQuery({
    queryKey: ['summary', filters],
    queryFn: async () => {
      const res = await getSummary(filters);
      return res.data;
    }
  });

  if (loading) return <div className="spinner-container"><div className="spinner"></div></div>;
  if (!data) return null;

  const cards = [
    { title: "Total Revenue", value: formatCurrency(data.total_revenue), icon: <IndianRupee size={20} color="#D82B27" /> },
    { title: "Total Orders", value: formatNumber(data.total_orders), icon: <ShoppingCart size={20} color="#1F5038" /> },
    { title: "Avg Order Value", value: formatCurrency(data.avg_order), icon: <Activity size={20} color="#D82B27" /> },
    { title: "Active Outlets", value: formatNumber(data.total_outlets), icon: <Store size={20} color="#1F5038" /> },
  ];

  return (
    <div className="kpi-grid">
      {cards.map((card, i) => (
        <div key={i} className="glass-card">
          <div className="kpi-title">
            {card.icon}
            {card.title}
          </div>
          <div className="kpi-value">{card.value}</div>
        </div>
      ))}
    </div>
  );
};

export default KPICards;
