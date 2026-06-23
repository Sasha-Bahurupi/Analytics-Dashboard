import React, { useState, useCallback, useContext } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Login from './components/Login';
import { LogOut } from 'lucide-react';
import KPICards from './components/KPICards';
import Charts from './components/Charts';
import Filters from './components/Filters';
import OrdersTable from './components/OrdersTable';
import TopSellers from './components/TopSellers';
import Heatmap from './components/Heatmap';
import { getFilters } from './api';

function Dashboard() {
  const { logout } = useContext(AuthContext);

  const { data: filterOptions = { outlets: [], categories: [], statuses: [], min_date: '', max_date: '' }, isLoading: loadingFilters } = useQuery({
    queryKey: ['filters'],
    queryFn: async () => {
      const res = await getFilters();
      return res.data;
    }
  });

  const [filters, setFilters] = useState({
    start_date: '',
    end_date: '',
    outlet: '',
    category: '',
    status: ''
  });

  const handleFilterChange = useCallback((name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  }, []);

  return (
    <div className="dashboard-container">
      <header className="header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <img src="/logo.png" alt="California Burrito Logo" style={{ height: '40px' }} />
          <h1 style={{ 
            margin: 0, 
            color: '#F5EEDC',
            backgroundColor: '#D82B27',
            padding: '0.25rem 1rem',
            borderRadius: '12px',
            display: 'inline-block',
            lineHeight: 1.2
          }}>Business Analytics</h1>
        </div>
        <button 
          onClick={logout}
          style={{
            background: 'none',
            border: 'none',
            color: '#1F5038',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            cursor: 'pointer',
            fontWeight: 700,
            fontSize: '1rem'
          }}
        >
          <LogOut size={20} />
          Logout
        </button>
      </header>
      
      {loadingFilters ? (
         <div className="spinner-container"><div className="spinner"></div></div>
      ) : (
        <>
          <Filters 
            options={filterOptions} 
            values={filters} 
            onChange={handleFilterChange} 
          />
          
          <KPICards filters={filters} />
          
          <div className="charts-grid">
            <Charts.BarChartComponent filters={filters} />
            <Charts.LineChartComponent filters={filters} />
          </div>

          <div className="charts-grid">
            <TopSellers filters={filters} />
            <Charts.PaymentMethodsChart filters={filters} />
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <Heatmap filters={filters} />
          </div>

          <OrdersTable filters={filters} />
        </>
      )}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AuthWrapper />
    </AuthProvider>
  );
}

function AuthWrapper() {
  const { isAuthenticated } = useContext(AuthContext);

  if (!isAuthenticated) {
    return <Login />;
  }

  return <Dashboard />;
}

export default App;
