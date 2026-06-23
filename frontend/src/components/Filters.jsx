import React from 'react';
import { getExportUrl } from '../api';

const Filters = ({ options, values, onChange }) => {
  const handleReset = () => {
    onChange('start_date', '');
    onChange('end_date', '');
    onChange('outlet', '');
    onChange('category', '');
    onChange('status', '');
  };

  const handleExport = () => {
    window.open(getExportUrl(values), '_blank');
  };

  return (
    <div className="glass-card filters-container">
      <div className="filter-group">
        <label>Start Date</label>
        <input 
          type="date" 
          className="filter-input"
          value={values.start_date}
          min={options.min_date}
          max={options.max_date}
          onChange={(e) => onChange('start_date', e.target.value)}
        />
      </div>
      <div className="filter-group">
        <label>End Date</label>
        <input 
          type="date" 
          className="filter-input"
          value={values.end_date}
          min={options.min_date}
          max={options.max_date}
          onChange={(e) => onChange('end_date', e.target.value)}
        />
      </div>
      <div className="filter-group">
        <label>Outlet</label>
        <select 
          className="filter-input" 
          value={values.outlet} 
          onChange={(e) => onChange('outlet', e.target.value)}
        >
          <option value="">All Outlets</option>
          {options.outlets.map(o => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
      </div>
      <div className="filter-group">
        <label>Category</label>
        <select 
          className="filter-input" 
          value={values.category} 
          onChange={(e) => onChange('category', e.target.value)}
        >
          <option value="">All Categories</option>
          {options.categories.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>
      <div className="filter-group">
        <label>Status / Order Type</label>
        <select 
          className="filter-input" 
          value={values.status} 
          onChange={(e) => onChange('status', e.target.value)}
        >
          <option value="">All Statuses</option>
          {options.statuses && options.statuses.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>
      
      <div style={{ marginLeft: 'auto', display: 'flex', gap: '10px' }}>
        <button className="btn" onClick={handleExport} style={{ backgroundColor: '#1F5038', color: '#F5EEDC' }}>
          Download CSV
        </button>
        <button className="btn btn-secondary" onClick={handleReset}>
          Reset Filters
        </button>
      </div>
    </div>
  );
};

export default Filters;
