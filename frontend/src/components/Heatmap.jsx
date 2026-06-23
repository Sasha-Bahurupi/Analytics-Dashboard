import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getHeatmap } from '../api';

const HOURS = Array.from({length: 24}, (_, i) => i.toString().padStart(2, '0'));

const Heatmap = ({ filters }) => {
  const { data = [], isLoading: loading } = useQuery({
    queryKey: ['heatmap', filters],
    queryFn: async () => {
      const res = await getHeatmap(filters);
      return res.data;
    }
  });

  const uniqueDates = Array.from(new Set(data.map(d => d.date))).sort();
  
  const dataMap = {};
  let maxOrders = 0;
  
  uniqueDates.forEach(d => {
    dataMap[d] = {};
    HOURS.forEach(h => {
      dataMap[d][h] = 0;
    });
  });

  data.forEach(item => {
    if (dataMap[item.date]) {
      dataMap[item.date][item.hour] = item.total_orders;
      if (item.total_orders > maxOrders) {
        maxOrders = item.total_orders;
      }
    }
  });

  const getColor = (value) => {
    if (value === 0) return 'rgba(31, 80, 56, 0.1)';
    const opacity = 0.2 + (value / maxOrders) * 0.8;
    return `rgba(216, 43, 39, ${opacity})`; // Red
  };

  const formatDateLabel = (dateStr) => {
    const d = new Date(dateStr);
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
    const monthDay = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return `${dayName}, ${monthDay}`;
  };

  return (
    <div className="glass-card" style={{ gridColumn: '1 / -1' }}>
      <h3 style={{ margin: '0 0 1rem 0', color: '#1F5038', fontWeight: 900, textTransform: 'uppercase' }}>📅 Daily Customer Traffic</h3>
      {loading ? (
        <div className="spinner-container"><div className="spinner"></div></div>
      ) : uniqueDates.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#1F5038', padding: '2rem 0' }}>No data available for the selected filters.</p>
      ) : (
        <div style={{ overflowX: 'auto', overflowY: 'auto', maxHeight: '500px', paddingRight: '10px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '120px repeat(24, minmax(24px, 1fr))', gap: '3px', minWidth: '800px', position: 'relative' }}>
            
            {/* Header: Hours */}
            <div style={{ position: 'sticky', top: 0, left: 0, background: 'var(--card-bg)', zIndex: 20 }}></div>
            {HOURS.map(hour => (
              <div key={`header-${hour}`} style={{ fontSize: '0.7rem', color: '#1F5038', fontWeight: 600, textAlign: 'center', position: 'sticky', top: 0, background: 'var(--card-bg)', zIndex: 10, paddingBottom: '8px' }}>
                {hour}
              </div>
            ))}

            {/* Rows: Dates */}
            {uniqueDates.map(date => (
              <React.Fragment key={date}>
                <div style={{ 
                  fontSize: '0.75rem', 
                  color: '#1F5038', 
                  display: 'flex', 
                  alignItems: 'center', 
                  paddingRight: '8px',
                  fontWeight: 700,
                  position: 'sticky',
                  left: 0,
                  background: 'var(--card-bg)',
                  zIndex: 10
                }}>
                  {formatDateLabel(date)}
                </div>
                {HOURS.map(hour => {
                  const val = dataMap[date][hour];
                  return (
                    <div 
                      key={`${date}-${hour}`}
                      title={`${formatDateLabel(date)} at ${hour}:00 - ${val} orders`}
                      style={{
                        backgroundColor: getColor(val),
                        borderRadius: '2px',
                        height: '24px',
                        transition: 'all 0.2s',
                        cursor: 'crosshair',
                        border: '1px solid rgba(31,80,56,0.1)',
                        position: 'relative',
                        zIndex: 1
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.borderColor = '#1F5038';
                        e.target.style.transform = 'scale(1.1)';
                        e.target.style.zIndex = 5;
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.borderColor = 'rgba(31,80,56,0.1)';
                        e.target.style.transform = 'scale(1)';
                        e.target.style.zIndex = 1;
                      }}
                    />
                  );
                })}
              </React.Fragment>
            ))}
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginTop: '1.5rem', gap: '0.5rem', fontSize: '0.8rem', color: '#1F5038', fontWeight: 700 }}>
            <span>Less</span>
            <div style={{ display: 'flex', gap: '3px' }}>
              <div style={{ width: '14px', height: '14px', borderRadius: '2px', background: 'rgba(31, 80, 56, 0.1)' }}></div>
              <div style={{ width: '14px', height: '14px', borderRadius: '2px', background: 'rgba(216, 43, 39, 0.4)' }}></div>
              <div style={{ width: '14px', height: '14px', borderRadius: '2px', background: 'rgba(216, 43, 39, 0.7)' }}></div>
              <div style={{ width: '14px', height: '14px', borderRadius: '2px', background: 'rgba(216, 43, 39, 1)' }}></div>
            </div>
            <span>More</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Heatmap;
