import React, { useEffect, useState } from 'react';
import { analyticsService } from '../services/api';
import '../styles/Analytics.css';

function Analytics() {
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const tx = await analyticsService.getTransactions();
      const sum = await analyticsService.getSummary();
      setTransactions(tx);
      setSummary(sum);
    } catch (err) {
      console.error('Analytics error', err);
    }
  };

  return (
    <div className="analytics-page container">
      <h1>Analytics</h1>
      <section className="analytics-summary">
        <h2>Summary</h2>
        {summary ? (
          Array.isArray(summary) ? (
            <div className="summary-grid">
              {summary.map(s => (
                <div key={s.userId} className="summary-card">
                  <div className="name">{s.name}</div>
                  <div className="counts">Sales: {s.sales} • Rentals: {s.rentals}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="summary-card">
              <div className="name">{summary.name}</div>
              <div className="counts">Sales: {summary.sales} • Rentals: {summary.rentals}</div>
            </div>
          )
        ) : (
          <div>Loading summary...</div>
        )}
      </section>

      <section className="analytics-transactions">
        <h2>Transactions</h2>
        {transactions.length === 0 ? (
          <p>No transactions yet.</p>
        ) : (
          <table className="tx-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Property</th>
                <th>User</th>
                <th>Price</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(t => (
                <tr key={t.id}>
                  <td>{t.type}</td>
                  <td>{t.propertyTitle}</td>
                  <td>{t.userId}</td>
                  <td>{t.price}</td>
                  <td>{new Date(t.date).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

export default Analytics;
