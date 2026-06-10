import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { safeImageSrc } from '../../utils/propertyDisplay';

const STATUS_OPTIONS = ['active', 'sold', 'rented', 'disabled'];
const STATUS_I18N_KEY = { active: 'admin.statusActive', sold: 'admin.statusSold', rented: 'admin.statusRented', disabled: 'admin.statusDisabled' };
const PAGE_SIZE = 10;

function ListingsTable({
  t, listings, loading,
  onEdit, onDelete, onMarkStatus, onToggleFeatured, onAddListing, onClearFilters,
  statusFilter, onStatusFilter,
  typeFilter, onTypeFilter,
  categoryFilter, onCategoryFilter,
  cityFilter, onCityFilter, filterCities,
  zoneFilter, onZoneFilter, filterZones,
  sortOrder, onSortOrder,
  refSearch, onRefSearch,
  titleSearch, onTitleSearch,
}) {
  const [page, setPage] = useState(1);

  useEffect(() => { setPage(1); }, [statusFilter, typeFilter, cityFilter, zoneFilter, sortOrder, refSearch, listings.length]);

  const totalPages = Math.max(1, Math.ceil(listings.length / PAGE_SIZE));
  const paged = listings.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="listings-section">
      <div className="listings-toolbar">
        <select value={['price-asc','price-desc'].includes(sortOrder) ? 'newest' : sortOrder} onChange={onSortOrder} className="sort-select">
          <option value="newest">{t('admin.sortNewest')}</option>
          <option value="oldest">{t('admin.sortOldest')}</option>
          <option value="status">{t('admin.sortByStatus')}</option>
        </select>
        <button className="btn btn-primary" onClick={onAddListing}>
          {t('admin.addListing')}
        </button>
      </div>

      <div className="listings-table">
        <table>
          <thead>
            <tr className="filters-row">
              <th style={{ width: 56 }}></th>
              <th>
                <input type="text" value={refSearch} onChange={e => onRefSearch(e.target.value)} placeholder="ID" className="col-filter" />
              </th>
              <th>
                <input
                  type="text"
                  value={titleSearch}
                  onChange={e => onTitleSearch(e.target.value)}
                  placeholder={t('form.title')}
                  className="col-filter"
                />
              </th>
              <th>
                <select value={cityFilter} onChange={onCityFilter} className="col-filter">
                  <option value="all">{t('properties.city')}</option>
                  {filterCities.map(c => <option key={c.en} value={c.en}>{c.ka || c.en}</option>)}
                </select>
              </th>
              <th>
                <select value={zoneFilter} onChange={onZoneFilter} disabled={!filterZones.length} className="col-filter">
                  <option value="all">{t('properties.zone')}</option>
                  {filterZones.map(z => <option key={z.en} value={z.en}>{z.ka || z.en}</option>)}
                </select>
              </th>
              <th>
                <select value={categoryFilter} onChange={e => onCategoryFilter(e.target.value)} className="col-filter">
                  <option value="all">{t('properties.category')}</option>
                  <option value="residential">{t('properties.residential')}</option>
                  <option value="commercial">{t('properties.commercial')}</option>
                  <option value="land">{t('properties.land')}</option>
                </select>
              </th>
              <th>
                <select value={typeFilter} onChange={e => onTypeFilter(e.target.value)} className="col-filter">
                  <option value="all">{t('form.type')}</option>
                  <option value="rent">{t('properties.rent')}</option>
                  <option value="sale">{t('properties.sale')}</option>
                </select>
              </th>
              <th>
                <select
                  value={['price-asc','price-desc'].includes(sortOrder) ? sortOrder : 'none'}
                  onChange={e => onSortOrder({ target: { value: e.target.value === 'none' ? 'newest' : e.target.value } })}
                  className="col-filter"
                >
                  <option value="none">{t('form.price')}</option>
                  <option value="price-asc">{t('admin.sortPriceAsc')}</option>
                  <option value="price-desc">{t('admin.sortPriceDesc')}</option>
                </select>
              </th>
              <th>
                <select value={statusFilter} onChange={e => onStatusFilter(e.target.value)} className="col-filter">
                  <option value="all">{t('admin.status')}</option>
                  <option value="active">{t('admin.statusActive')}</option>
                  <option value="sold">{t('admin.statusSold')}</option>
                  <option value="rented">{t('admin.statusRented')}</option>
                  <option value="disabled">{t('admin.statusDisabled')}</option>
                </select>
              </th>
              <th>
                <button type="button" className="col-filter-clear" onClick={onClearFilters} title="Clear filters">✕</button>
              </th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={10} className="table-state">{t('common.loading')}</td></tr>
            )}
            {!loading && listings.length === 0 && (
              <tr><td colSpan={10} className="table-state">{t('properties.noResults')}</td></tr>
            )}
            {!loading && paged.map(property => (
              <tr key={property.id}>
                <td>
                  <img
                    src={safeImageSrc(property.image)}
                    alt=""
                    className="listing-thumb"
                  />
                </td>
                <td className="listing-ref">{property.listingRef || '—'}</td>
                <td className="listing-title-cell">
                  <Link to={`/properties/${property.id}`} className="listing-title-link">
                    {property.title || property.titleEn}
                  </Link>
                </td>
                <td>{property.city || property.cityEn}</td>
                <td>{property.zone || property.zoneEn || '—'}</td>
                <td>
                  <span className={`badge ${property.category || 'residential'}`}>
                    {t(`properties.${property.category || 'residential'}`)}
                  </span>
                </td>
                <td>
                  <span className={`badge ${property.type}`}>
                    {property.type === 'rent' ? t('properties.rent') : t('properties.sale')}
                  </span>
                </td>
                <td>{property.priceNote || `$${property.price?.toLocaleString()}`}</td>
                <td>
                  <select
                    className="status-select"
                    value={property.status}
                    onChange={e => onMarkStatus(property.id, e.target.value)}
                  >
                    {STATUS_OPTIONS.map(s => (
                      <option key={s} value={s}>{t(STATUS_I18N_KEY[s])}</option>
                    ))}
                  </select>
                </td>
                <td className="actions">
                  <button
                    className={`btn btn-small ${property.featured ? 'btn-featured-on' : 'btn-featured-off'}`}
                    onClick={() => onToggleFeatured(property.id, !property.featured)}
                    title={property.featured ? 'Remove from homepage' : 'Show on homepage'}
                  >{property.featured ? '★' : '☆'}</button>
                  <button className="btn btn-small btn-primary" onClick={() => onEdit(property)}>{t('properties.edit')}</button>
                  <button className="btn btn-small btn-danger" onClick={() => onDelete(property.id)}>{t('properties.delete')}</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="listings-pagination">
          <button
            className="btn btn-secondary"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >‹ Prev</button>
          <span className="pagination-info">{page} / {totalPages} ({listings.length} total)</span>
          <button
            className="btn btn-secondary"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >Next ›</button>
        </div>
      )}
    </div>
  );
}

export default ListingsTable;

ListingsTable.propTypes = {
  t: PropTypes.func.isRequired,
  listings: PropTypes.array.isRequired,
  loading: PropTypes.bool,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onMarkStatus: PropTypes.func.isRequired,
  onToggleFeatured: PropTypes.func.isRequired,
  onAddListing: PropTypes.func.isRequired,
  onClearFilters: PropTypes.func.isRequired,
  statusFilter: PropTypes.string.isRequired,
  onStatusFilter: PropTypes.func.isRequired,
  typeFilter: PropTypes.string.isRequired,
  onTypeFilter: PropTypes.func.isRequired,
  categoryFilter: PropTypes.string.isRequired,
  onCategoryFilter: PropTypes.func.isRequired,
  cityFilter: PropTypes.string.isRequired,
  onCityFilter: PropTypes.func.isRequired,
  filterCities: PropTypes.arrayOf(PropTypes.shape({ en: PropTypes.string, ka: PropTypes.string })).isRequired,
  zoneFilter: PropTypes.string.isRequired,
  onZoneFilter: PropTypes.func.isRequired,
  filterZones: PropTypes.arrayOf(PropTypes.shape({ en: PropTypes.string, ka: PropTypes.string })).isRequired,
  sortOrder: PropTypes.string.isRequired,
  onSortOrder: PropTypes.func.isRequired,
  refSearch: PropTypes.string.isRequired,
  onRefSearch: PropTypes.func.isRequired,
  titleSearch: PropTypes.string.isRequired,
  onTitleSearch: PropTypes.func.isRequired,
};
