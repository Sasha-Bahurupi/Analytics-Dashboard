import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getTopSellers } from '../api';

const MEDAL_EMOJIS = ['🥇', '🥈', '🥉', '4.', '5.'];

const TopSellers = ({ filters }) => {
  const { data = [], isLoading: loading } = useQuery({
    queryKey: ['top-sellers', filters],
    queryFn: async () => {
      const res = await getTopSellers(filters);
      return res.data;
    }
  });

  return (
    <div className="glass-card">
      <h3 style={{ margin: '0 0 1.5rem 0', color: '#1F5038', fontWeight: 900, textTransform: 'uppercase' }}>🍽️ Our Best Selling Menu Items</h3>

      {loading ? (
        <div className="spinner-container"><div className="spinner"></div></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {data.map((item, i) => {
            const maxQty = data[0]?.total_qty || 1;
            const barWidth = (item.total_qty / maxQty) * 100;
            return (
              <div key={i}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '1.25rem', width: '2rem', textAlign: 'center' }}>{MEDAL_EMOJIS[i]}</span>
                    <span style={{ fontWeight: 700, color: '#1F5038', fontSize: '0.95rem' }}>{item.item}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ color: '#D82B27', fontWeight: 800, fontSize: '0.95rem' }}>
                      {'₹ ' + new Intl.NumberFormat('en-IN').format(item.total_revenue)}
                    </span>
                    <span style={{ color: '#1F5038', fontSize: '0.8rem', marginLeft: '0.5rem', fontWeight: 600 }}>
                      ({new Intl.NumberFormat('en-IN').format(item.total_qty)} sold)
                    </span>
                  </div>
                </div>
                <div style={{ width: '100%', backgroundColor: 'rgba(31,80,56,0.1)', borderRadius: '4px', height: '8px' }}>
                  <div
                    style={{
                      width: `${barWidth}%`,
                      height: '8px',
                      borderRadius: '4px',
                      background: i === 0 ? '#1F5038' : i === 1 ? '#FFC107' : i === 2 ? '#8B4513' : '#D82B27',
                      transition: 'width 0.6s ease',
                    }}
                  />
                </div>
              </div>
            );
          })}
          {data.length === 0 && (
            <p style={{ textAlign: 'center', color: '#94a3b8', padding: '1rem 0' }}>No data available for the selected filters.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default TopSellers;
