import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import EmptyState from './EmptyState';

/**
 * DataTable — reusable table with pagination and empty state.
 *
 * @param {Array}   columns      - [{ key, label, render, width, align }]
 * @param {Array}   data         - row data
 * @param {boolean} loading      - show spinner overlay
 * @param {Object}  pagination   - { page, totalPages, total, hasPrev, hasNext }
 * @param {Function} onPageChange - (newPage) => void
 * @param {string}  emptyTitle   - empty state headline
 * @param {string}  emptyDesc    - empty state description
 */
const DataTable = ({
  columns      = [],
  data         = [],
  loading      = false,
  pagination,
  onPageChange,
  emptyTitle   = 'No results found',
  emptyDesc    = 'Try adjusting your search or filters.',
  stickyHeader = false,
}) => (
  <div style={{ background: 'white', borderRadius: 12, border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
    {loading ? (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem 2rem', flexDirection: 'column', gap: '0.75rem' }}>
        <div className="spinner" />
        <p style={{ color: '#9ca3af', fontSize: '0.875rem', margin: 0 }}>Loading…</p>
      </div>
    ) : (
      <>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#fafafa', borderBottom: '1px solid #f1f5f9' }}>
                {columns.map(col => (
                  <th
                    key={col.key}
                    style={{
                      padding: '0.75rem 1rem',
                      textAlign: col.align || 'left',
                      fontSize: '0.6875rem', fontWeight: 600,
                      color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em',
                      whiteSpace: 'nowrap', width: col.width,
                    }}
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td colSpan={columns.length}>
                    <EmptyState title={emptyTitle} description={emptyDesc} compact />
                  </td>
                </tr>
              ) : data.map((row, ri) => (
                <tr
                  key={row.id ?? ri}
                  style={{ borderBottom: '1px solid #f9fafb', transition: 'background 0.1s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  {columns.map(col => (
                    <td
                      key={col.key}
                      style={{
                        padding: '0.75rem 1rem', fontSize: '0.8125rem', color: '#4b5563',
                        textAlign: col.align || 'left', verticalAlign: 'middle',
                      }}
                    >
                      {col.render ? col.render(row[col.key], row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0.875rem 1.25rem', borderTop: '1px solid #f9fafb',
          }}>
            <p style={{ fontSize: '0.8125rem', color: '#9ca3af', margin: 0 }}>
              Showing {((pagination.page - 1) * 15) + 1}–{Math.min(pagination.page * 15, pagination.total)} of {pagination.total}
            </p>
            <div style={{ display: 'flex', gap: '0.375rem', alignItems: 'center' }}>
              <button
                onClick={() => onPageChange?.(pagination.page - 1)}
                disabled={!pagination.hasPrev}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: 32, height: 32, borderRadius: 8, border: '1px solid #e5e7eb',
                  background: 'white', color: '#4b5563', cursor: pagination.hasPrev ? 'pointer' : 'not-allowed',
                  opacity: pagination.hasPrev ? 1 : 0.4, transition: 'all 0.15s',
                }}
              >
                <ChevronLeft size={15} />
              </button>
              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#111827', padding: '0 0.5rem' }}>
                {pagination.page} / {pagination.totalPages}
              </span>
              <button
                onClick={() => onPageChange?.(pagination.page + 1)}
                disabled={!pagination.hasNext}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: 32, height: 32, borderRadius: 8, border: '1px solid #e5e7eb',
                  background: 'white', color: '#4b5563', cursor: pagination.hasNext ? 'pointer' : 'not-allowed',
                  opacity: pagination.hasNext ? 1 : 0.4, transition: 'all 0.15s',
                }}
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </>
    )}
  </div>
);

export default DataTable;
