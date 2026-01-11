import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { usersAPI } from '../services/api';
import { Search, Filter, Eye } from 'lucide-react';
import UserDetailModal from '../components/users/UserDetailModal';
import styles from '../styles/pages/common.module.css';

export default function Users() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const { data: stats } = useQuery({
    queryKey: ['users-stats'],
    queryFn: usersAPI.getStats,
  });

  const { data: usersData, isLoading } = useQuery({
    queryKey: ['users-list', page, search, levelFilter, roleFilter],
    queryFn: () =>
      usersAPI.getList({
        page,
        limit: 50,
        search,
        level: levelFilter,
        role: roleFilter,
      }),
  });

  const users = usersData?.data?.users || [];
  const pagination = usersData?.data?.pagination;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>User Intelligence</h1>
        <p className={styles.subtitle}>360°-Ansicht aller Nutzer</p>
      </div>

      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        <div className="card-compact">
          <p className={styles.statLabel}>Total Users</p>
          <p className={styles.statValue}>{stats?.data?.totalUsers || 0}</p>
        </div>

        <div className="card-compact">
          <p className={styles.statLabel}>Active Users (30d)</p>
          <p className={`${styles.statValue} ${styles.statValueSuccess}`}>
            {stats?.data?.activeUsers || 0}
          </p>
          {stats?.data?.totalUsers && (
            <p className={styles.statSubtext}>
              {Math.round((stats.data.activeUsers / stats.data.totalUsers) * 100)}% of total
            </p>
          )}
        </div>

        <div className="card-compact">
          <p className={styles.statLabel}>Churn Rate</p>
          <p className={`${styles.statValue} ${styles.statValueDanger}`}>
            {stats?.data?.churnRate || 0}%
          </p>
        </div>

        <div className="card-compact">
          <p className={styles.statLabel}>Level Distribution</p>
          <div className={styles.levelList}>
            {stats?.data?.levelDistribution?.slice(0, 3).map((level: any) => (
              <div key={level.level} className={styles.levelItem}>
                <span className={styles.levelLabel}>Level {level.level}:</span>
                <span className={styles.levelValue}>{level.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <form onSubmit={handleSearch}>
          <div className={styles.filters}>
            <div className={`${styles.filterGroup} ${styles.filterFull}`}>
              <label className={styles.filterLabel}>Search</label>
              <div className={styles.filterInputWrapper}>
                <Search size={18} className={styles.filterIcon} />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Username oder Email..."
                  className="input"
                  style={{ paddingLeft: 'calc(var(--spacing-md) + 24px)' }}
                />
              </div>
            </div>

            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Level</label>
              <select
                value={levelFilter}
                onChange={(e) => {
                  setLevelFilter(e.target.value);
                  setPage(1);
                }}
                className="input"
              >
                <option value="">Alle Levels</option>
                <option value="1">Level 1 - Starter</option>
                <option value="2">Level 2 - Rising Star</option>
                <option value="3">Level 3 - Creator</option>
                <option value="4">Level 4 - Pro</option>
                <option value="5">Level 5 - Elite</option>
              </select>
            </div>

            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Role</label>
              <select
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value);
                  setPage(1);
                }}
                className="input"
              >
                <option value="">Alle Rollen</option>
                <option value="creator">Creator</option>
                <option value="promoter">Promoter</option>
                <option value="both">Both</option>
              </select>
            </div>
          </div>
        </form>
      </div>

      {/* User Table */}
      <div className="card">
        {isLoading ? (
          <div className={styles.loading}>
            <div className="spinner spinner-lg"></div>
          </div>
        ) : users.length === 0 ? (
          <div className={styles.emptyState}>
            <Filter size={48} className={styles.emptyIcon} />
            <p className={styles.emptyText}>Keine User gefunden</p>
          </div>
        ) : (
          <>
            <div className={styles.tableContainer}>
              <table className="table">
                <thead className="table-header">
                  <tr>
                    <th>User</th>
                    <th>Level</th>
                    <th>Role</th>
                    <th style={{ textAlign: 'right' }}>Products</th>
                    <th style={{ textAlign: 'right' }}>Sales</th>
                    <th style={{ textAlign: 'right' }}>Earnings</th>
                    <th>Stripe</th>
                    <th style={{ textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user: any) => (
                    <tr key={user.id}>
                      <td className="table-cell">
                        <div className={styles.userInfo}>
                          <span className={styles.userName}>{user.username}</span>
                          <span className={styles.userEmail}>{user.email}</span>
                        </div>
                      </td>
                      <td className="table-cell">
                        <span
                          className={`badge ${
                            user.level >= 4
                              ? 'badge-success'
                              : user.level >= 2
                              ? 'badge-info'
                              : 'badge-warning'
                          }`}
                        >
                          Level {user.level}
                        </span>
                      </td>
                      <td className="table-cell" style={{ textTransform: 'capitalize' }}>
                        {user.role}
                      </td>
                      <td className="table-cell" style={{ textAlign: 'right' }}>
                        {user.products_count || 0}
                      </td>
                      <td className="table-cell" style={{ textAlign: 'right' }}>
                        {user.sales_count || 0}
                      </td>
                      <td className="table-cell" style={{ textAlign: 'right', fontWeight: 500 }}>
                        €{parseFloat(user.total_earnings || 0).toFixed(2)}
                      </td>
                      <td className="table-cell">
                        {user.stripe_charges_enabled ? (
                          <span className={styles.statusConnected}>✓ Connected</span>
                        ) : (
                          <span className={styles.statusNotConnected}>Not connected</span>
                        )}
                      </td>
                      <td className="table-cell" style={{ textAlign: 'center' }}>
                        <button
                          onClick={() => setSelectedUserId(user.id)}
                          className={`btn btn-ghost btn-sm ${styles.actionButton}`}
                        >
                          <Eye size={16} />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className={styles.pagination}>
                <p className={styles.paginationText}>
                  Showing {(page - 1) * 50 + 1} to {Math.min(page * 50, pagination.total)} of{' '}
                  {pagination.total} users
                </p>
                <div className={styles.paginationButtons}>
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    className="btn btn-secondary btn-sm"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page >= pagination.totalPages}
                    className="btn btn-secondary btn-sm"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* User Detail Modal */}
      {selectedUserId && (
        <UserDetailModal userId={selectedUserId} onClose={() => setSelectedUserId(null)} />
      )}
    </div>
  );
}
