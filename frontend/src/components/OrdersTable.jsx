import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getOrders } from '../api';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const OrdersTable = ({ filters }) => {
  const [page, setPage] = useState(1);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [filters]);

  const { data: responseData, isLoading: loading } = useQuery({
    queryKey: ['orders', filters, page],
    queryFn: async () => {
      const res = await getOrders({ ...filters, page, limit: 10 });
      return res.data;
    }
  });

  const data = responseData?.data || [];
  const totalPages = responseData?.total_pages || 1;

  return (
    <div className="glass-card">
      <h3 style={{ margin: '0 0 1rem 0', color: '#1F5038', fontWeight: 900, textTransform: 'uppercase' }}>Recent Orders</h3>
      
      {loading ? (
        <div className="spinner-container"><div className="spinner"></div></div>
      ) : (
        <>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Order Date</th>
                  <th>Bill No</th>
                  <th>Outlet</th>
                  <th>Brand</th>
                  <th>Item</th>
                  <th>Qty</th>
                  <th>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row, i) => (
                  <tr key={i}>
                    <td>{new Date(row.Order_Datetime).toLocaleString()}</td>
                    <td>{row.BillNo}</td>
                    <td>{row.Outlet_Name}</td>
                    <td>{row.Brand}</td>
                    <td>{row.Item}</td>
                    <td>{row.Quantity}</td>
                    <td style={{ color: '#D82B27', fontWeight: 700 }}>
                      {'₹ ' + new Intl.NumberFormat('en-IN').format(row.Revenue)}
                    </td>
                  </tr>
                ))}
                {data.length === 0 && (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', color: '#1F5038', fontWeight: 600 }}>No orders found for the selected filters.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {totalPages > 1 && (
            <div className="pagination">
              <span style={{ fontSize: '0.875rem', color: '#1F5038', fontWeight: 700 }}>
                Page {page} of {totalPages}
              </span>
              <div className="pagination-controls">
                <button 
                  className="btn btn-secondary" 
                  disabled={page === 1} 
                  onClick={() => setPage(p => p - 1)}
                  style={{ padding: '0.5rem', height: 'auto', display: 'flex' }}
                >
                  <ChevronLeft size={20} />
                </button>
                <button 
                  className="btn btn-secondary" 
                  disabled={page === totalPages} 
                  onClick={() => setPage(p => p + 1)}
                  style={{ padding: '0.5rem', height: 'auto', display: 'flex' }}
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default OrdersTable;
