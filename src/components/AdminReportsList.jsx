import { useState, useEffect } from 'react';
import { fetchWithAuth } from '../services/authHelper';

export default function ReportsList({ onSelectReport, refreshKey = 0 }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [pagination, setPagination] = useState({ offset: 0, limit: 20, total: 0 });

  useEffect(() => {
    fetchReports();
  }, [pagination.offset, statusFilter, refreshKey]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        limit: pagination.limit,
        offset: pagination.offset,
        ...(statusFilter && { status: statusFilter }),
      });

      const response = await fetchWithAuth(`/api/reports?${params}`);

      if (response.ok) {
        const data = await response.json();
        setReports(data.reports);
        setPagination((prev) => ({ ...prev, total: data.total }));
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNextPage = () => {
    if (pagination.offset + pagination.limit < pagination.total) {
      setPagination((prev) => ({
        ...prev,
        offset: prev.offset + prev.limit,
      }));
    }
  };

  const handlePrevPage = () => {
    if (pagination.offset > 0) {
      setPagination((prev) => ({
        ...prev,
        offset: Math.max(0, prev.offset - prev.limit),
      }));
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      not_yet_reviewed: '#ef4444',
      reviewing: '#f59e0b',
      done: '#10b981',
    };
    return colors[status] || '#94a3b8';
  };

  return (
    <div className="admin-section">
      <div className="section-header">
        <h2>Reports Management</h2>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPagination((prev) => ({ ...prev, offset: 0 }));
          }}
          className="filter-select"
        >
          <option value="">All Statuses</option>
          <option value="not_yet_reviewed">Not Yet Reviewed</option>
          <option value="reviewing">Reviewing</option>
          <option value="done">Done</option>
        </select>
      </div>

      {loading ? (
        <div className="admin-loading">Loading reports...</div>
      ) : reports.length > 0 ? (
        <>
          <div className="reports-table">
            <div className="table-header">
              <div className="col-title">Title</div>
              <div className="col-status">Status</div>
              <div className="col-date">Date</div>
            </div>
            {reports.map((report) => (
              <div
                key={report.id}
                className="table-row"
                onClick={() => onSelectReport(report)}
              >
                <div className="col-title">
                  <div className="report-title">{report.title}</div>
                </div>
                <div className="col-status">
                  <span
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(report.status) }}
                  >
                    {report.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                <div className="col-date">{new Date(report.date).toLocaleDateString()}</div>
              </div>
            ))}
          </div>

          <div className="pagination">
            <button
              onClick={handlePrevPage}
              disabled={pagination.offset === 0}
              className="pagination-btn"
            >
              ← Previous
            </button>
            <span className="pagination-info">
              {pagination.offset + 1} - {Math.min(pagination.offset + pagination.limit, pagination.total)} of{' '}
              {pagination.total}
            </span>
            <button
              onClick={handleNextPage}
              disabled={pagination.offset + pagination.limit >= pagination.total}
              className="pagination-btn"
            >
              Next →
            </button>
          </div>
        </>
      ) : (
        <div className="empty-state">No reports found</div>
      )}
    </div>
  );
}
