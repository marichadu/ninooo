import React, { useState, useEffect, useRef, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { propertyService } from '../services/api';
import PropertyForm from '../components/admin/PropertyForm';
import ListingsTable from '../components/admin/ListingsTable';
import '../styles/AdminPanel.css';

/* global globalThis */

function AdminPanel({ user }) {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const editHandledRef = useRef(false);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [photoItems, setPhotoItems] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    titleEn: '',
    titleRu: '',
    description: '',
    descriptionEn: '',
    descriptionRu: '',
    city: '',
    cityEn: '',
    cityRu: '',
    zone: '',
    zoneEn: '',
    zoneRu: '',
    type: 'rent',
    sqMeters: '',
    bedrooms: '',
    bathrooms: '',
    floor: '',
    price: '',
    pricePerSqm: '',
    priceNote: '',
    isPricePrivate: false,
    currency: 'USD',
    image: '',
    videoUrls: [],
    listingRef: '',
    category: 'residential',
  });
  const [message, setMessage] = useState('');
  const [formError, setFormError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const propertyData = await propertyService.getAll({ status: 'all' });
        setProperties(propertyData);
      } catch (error) {
        console.error('Error fetching admin data:', error);
        setMessage(t('message.error'));
      } finally {
        setLoading(false);
      }
    })();
  }, [t]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => {
      const nextState = {
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      };

      if (name === 'isPricePrivate') {
        if (!checked) {
          nextState.priceNote = '';
        } else if (!prev.priceNote) {
          nextState.priceNote = t('form.pricePrivateValue');
        }
      }

      return nextState;
    });
  };

  const fileToDataUrl = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
      src: reader.result,
      name: file.name
    });
    reader.onerror = () => reject(new Error(`Failed to read ${file.name}`));
    reader.readAsDataURL(file);
  });

  const syncPhotos = (nextPhotoItems) => {
    setPhotoItems(nextPhotoItems);
    setFormData((prev) => ({
      ...prev,
      image: nextPhotoItems[0]?.src || prev.image || ''
    }));
  };

  const handlePhotosChange = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const uploadedPhotos = await Promise.all(files.map(fileToDataUrl));
    syncPhotos([...photoItems, ...uploadedPhotos]);
    e.target.value = '';
  };

  const handlePhotoMove = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= photoItems.length) {
      return;
    }

    const nextPhotoItems = [...photoItems];
    const [movedPhoto] = nextPhotoItems.splice(index, 1);
    nextPhotoItems.splice(targetIndex, 0, movedPhoto);
    syncPhotos(nextPhotoItems);
  };

  const handlePhotoRemove = (index) => {
    const nextPhotoItems = photoItems.filter((_, currentIndex) => currentIndex !== index);
    syncPhotos(nextPhotoItems);
  };

  const handlePhotoSetMain = (index) => {
    handlePhotoMove(index, -index);
  };

  const handlePhotoAddUrl = (url) => {
    const item = {
      id: `url-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      src: url,
      name: url.split('/').pop().split('?')[0] || 'photo'
    };
    syncPhotos([...photoItems, item]);
  };

  const cityOptions = useMemo(() => {
    const map = new Map();
    properties.forEach(p => {
      const key = p.cityEn || p.city;
      if (key && !map.has(key)) map.set(key, { ka: p.city || '', en: p.cityEn || '', ru: p.cityRu || '' });
    });
    return Array.from(map.values()).sort((a, b) => (a.en || a.ka).localeCompare(b.en || b.ka));
  }, [properties]);

  const zoneOptions = useMemo(() => {
    const map = new Map();
    properties.forEach(p => {
      const key = p.zoneEn || p.zone;
      if (!key) return;
      if (formData.cityEn && p.cityEn !== formData.cityEn) return;
      if (!map.has(key)) map.set(key, { ka: p.zone || '', en: p.zoneEn || '', ru: p.zoneRu || '' });
    });
    return Array.from(map.values()).sort((a, b) => (a.en || a.ka).localeCompare(b.en || b.ka));
  }, [properties, formData.cityEn]);

  const parseVideoUrls = (v) => {
    if (!v) return [];
    try { const a = JSON.parse(v); if (Array.isArray(a) && a.length) return a; } catch {}
    return [v];
  };

  const handleAutofill = (baseName, match) => {
    setFormData(prev => ({
      ...prev,
      [baseName]: match.ka,
      [`${baseName}En`]: match.en,
      [`${baseName}Ru`]: match.ru,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    const missing = [];
    if (!formData.title)   missing.push('Title — Georgian 🇬🇪');
    if (!formData.titleEn) missing.push('Title — English 🇺🇸');
    if (!formData.titleRu) missing.push('Title — Russian 🇷🇺');
    if (!formData.city)    missing.push('City — Georgian 🇬🇪');

    const hasPricePerSqm = formData.pricePerSqm !== '' && Number(formData.pricePerSqm) > 0;
    if (!formData.isPricePrivate && !hasPricePerSqm && (formData.price === '' || formData.price === null || formData.price === undefined)) {
      missing.push('Price (fixed price, price per m², or mark as private)');
    }

    if (missing.length > 0) {
      setFormError('Missing required fields:\n' + missing.map(f => `• ${f}`).join('\n'));
      return;
    }

    try {
      const orderedImages = photoItems.map((photo) => photo.src).filter(Boolean);
      const privatePriceEnabled = Boolean(formData.isPricePrivate);
      const priceNote = privatePriceEnabled ? (formData.priceNote || t('form.pricePrivateValue')) : '';
      const payload = {
        ...formData,
        videoUrls: undefined,
        price: privatePriceEnabled ? 0 : (formData.price || 0),
        pricePerSqm: privatePriceEnabled ? 0 : (formData.pricePerSqm || 0),
        priceNote,
        images: orderedImages,
        image: orderedImages[0] || formData.image || '',
        videoUrl: JSON.stringify((formData.videoUrls || ['']).filter(u => u.trim()))
      };

      if (editingId) {
        await propertyService.update(editingId, payload);
        setMessage(t('message.updateSuccess'));
      } else {
        await propertyService.create(payload);
        setMessage(t('message.createSuccess'));
      }
      setShowForm(false);
      setEditingId(null);
      setFormError('');
      resetForm();
      const data = await propertyService.getAll();
      setProperties(data);
    } catch (error) {
      const serverMsg = error?.response?.data?.message || error?.response?.data?.error;
      setMessage(serverMsg || t('message.error'));
      console.error('Error saving property:', error);
    }
  };

  const handleEdit = (property) => {
    let existingImages = [];
    if (Array.isArray(property.images) && property.images.length > 0) {
      existingImages = property.images;
    } else if (property.image) {
      existingImages = [property.image];
    }

    setFormData({
      title: property.title,
      titleEn: property.titleEn,
      titleRu: property.titleRu,
      description: property.description,
      descriptionEn: property.descriptionEn,
      descriptionRu: property.descriptionRu,
      city: property.city,
      cityEn: property.cityEn,
      cityRu: property.cityRu,
      zone: property.zone,
      zoneEn: property.zoneEn,
      zoneRu: property.zoneRu,
      type: property.type,
      sqMeters: property.sqMeters,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      floor: property.floor,
      price: property.pricePerSqm > 0 ? '' : (property.price || ''),
      pricePerSqm: property.pricePerSqm || '',
      priceNote: property.priceNote || '',
      isPricePrivate: Boolean(property.priceNote),
      currency: property.currency,
      image: property.image,
      videoUrls: parseVideoUrls(property.videoUrl),
      listingRef: property.listingRef || '',
      category: property.category || 'residential',
    });
    setPhotoItems(existingImages.map((src, index) => ({
      id: `${property.id}-${index}`,
      src,
      name: `photo-${index + 1}`
    })));
    setEditingId(property.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!globalThis.confirm(t('message.confirmDelete'))) {
      return;
    }

    try {
      await propertyService.delete(id);
      setMessage(t('message.deleteSuccess'));
      const data = await propertyService.getAll();
      setProperties(data);
    } catch (error) {
      setMessage(error?.response?.data?.message || error?.message || t('message.error'));
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      titleEn: '',
      titleRu: '',
      description: '',
      descriptionEn: '',
      descriptionRu: '',
      city: '',
      cityEn: '',
      cityRu: '',
      zone: '',
      zoneEn: '',
      zoneRu: '',
      type: 'rent',
      sqMeters: '',
      bedrooms: '',
      bathrooms: '',
      floor: '',
      price: '',
      pricePerSqm: '',
      priceNote: '',
      isPricePrivate: false,
      currency: 'USD',
      image: '',
      videoUrls: [],
      listingRef: '',
      category: 'residential',
    });
    setPhotoItems([]);
  };

  const handleClearFilters = () => {
    setStatusFilter('all');
    setTypeFilter('all');
    setCategoryFilter('all');
    setCityFilter('all');
    setZoneFilter('all');
    setRefSearch('');
    setTitleSearch('');
    setSortOrder('newest');
  };

  const [, setActiveTab] = useState('listings');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [cityFilter, setCityFilter] = useState('all');
  const [zoneFilter, setZoneFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');
  const [refSearch, setRefSearch] = useState('');
  const [titleSearch, setTitleSearch] = useState('');

  const filterCities = useMemo(() => {
    const map = new Map();
    properties.forEach(p => {
      const key = p.cityEn || p.city;
      if (key && !map.has(key)) map.set(key, { en: key, ka: p.city || key });
    });
    return Array.from(map.values()).sort((a, b) => a.en.localeCompare(b.en));
  }, [properties]);

  const filterZones = useMemo(() => {
    const map = new Map();
    properties
      .filter(p => cityFilter === 'all' || (p.cityEn || p.city) === cityFilter)
      .forEach(p => {
        const key = p.zoneEn || p.zone;
        if (key && !map.has(key)) map.set(key, { en: key, ka: p.zone || key });
      });
    return Array.from(map.values()).sort((a, b) => a.en.localeCompare(b.en));
  }, [properties, cityFilter]);

  const STATUS_ORDER = { active: 0, rented: 1, sold: 2, disabled: 3 };
  const myListings = properties
    .filter(p =>
      (statusFilter === 'all' || p.status === statusFilter) &&
      (typeFilter === 'all' || p.type === typeFilter) &&
      (categoryFilter === 'all' || (p.category || 'residential') === categoryFilter) &&
      (cityFilter === 'all' || (p.cityEn || p.city) === cityFilter) &&
      (zoneFilter === 'all' || (p.zoneEn || p.zone) === zoneFilter) &&
      (!refSearch.trim() || (p.listingRef || '').toLowerCase().includes(refSearch.trim().toLowerCase())) &&
      (!titleSearch.trim() || (p.title || p.titleEn || '').toLowerCase().includes(titleSearch.trim().toLowerCase()))
    )
    .sort((a, b) => {
      if (sortOrder === 'newest' || sortOrder === 'oldest') {
        const ta = new Date(a.createdAt || 0).getTime();
        const tb = new Date(b.createdAt || 0).getTime();
        return sortOrder === 'newest' ? tb - ta : ta - tb;
      }
      if (sortOrder === 'price-asc') return (a.price || 0) - (b.price || 0);
      if (sortOrder === 'price-desc') return (b.price || 0) - (a.price || 0);
      if (sortOrder === 'title-asc') return (a.title || a.titleEn || '').localeCompare(b.title || b.titleEn || '');
      if (sortOrder === 'title-desc') return (b.title || b.titleEn || '').localeCompare(a.title || a.titleEn || '');
      if (sortOrder === 'status') return (STATUS_ORDER[a.status] ?? 9) - (STATUS_ORDER[b.status] ?? 9);
      return 0;
    });
  const handleMarkStatus = async (id, status) => {
    try {
      await propertyService.update(id, { status });
      const data = await propertyService.getAll();
      setProperties(data);
    } catch (error) {
      setMessage(error?.response?.data?.message || error?.message || t('message.error'));
    }
  };

  const handleToggleFeatured = async (id, featured) => {
    try {
      await propertyService.update(id, { featured });
      const data = await propertyService.getAll();
      setProperties(data);
    } catch (error) {
      setMessage(error?.response?.data?.message || error?.message || t('message.error'));
    }
  };

  const handleVideoUrlsChange = (newUrls) => {
    setFormData(prev => ({ ...prev, videoUrls: newUrls }));
  };

  useEffect(() => {
    if (editHandledRef.current || properties.length === 0) return;
    const editId = searchParams.get('edit');
    if (!editId) return;
    const property = properties.find(p => p.id === editId);
    if (!property) return;

    editHandledRef.current = true;
    let existingImages = [];
    if (Array.isArray(property.images) && property.images.length > 0) {
      existingImages = property.images;
    } else if (property.image) {
      existingImages = [property.image];
    }
    setFormData({
      title: property.title,
      titleEn: property.titleEn,
      titleRu: property.titleRu,
      description: property.description,
      descriptionEn: property.descriptionEn,
      descriptionRu: property.descriptionRu,
      city: property.city,
      cityEn: property.cityEn,
      cityRu: property.cityRu,
      zone: property.zone,
      zoneEn: property.zoneEn,
      zoneRu: property.zoneRu,
      type: property.type,
      sqMeters: property.sqMeters,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      floor: property.floor,
      price: property.pricePerSqm > 0 ? '' : (property.price || ''),
      pricePerSqm: property.pricePerSqm || '',
      priceNote: property.priceNote || '',
      isPricePrivate: Boolean(property.priceNote),
      currency: property.currency,
      image: property.image,
      videoUrls: parseVideoUrls(property.videoUrl),
      listingRef: property.listingRef || '',
      category: property.category || 'residential',
    });
    setPhotoItems(existingImages.map((src, index) => ({
      id: `${property.id}-${index}`,
      src,
      name: `photo-${index + 1}`
    })));
    setEditingId(property.id);
    setShowForm(true);
    setActiveTab('listings');
  }, [properties]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="admin-container">
      <div className="container">
        <div className="admin-header">
          <h1>{t('admin.title')}</h1>
          <p>{t('admin.welcomeAdmin')} {user?.name}</p>
        </div>

        {message && (
          <div className={`message ${/success|успешно|წარმატებ|updated/i.test(message) ? 'success' : 'error'}`}>
            {message}
            <button onClick={() => setMessage('')} className="close-msg">×</button>
          </div>
        )}

        <div className="admin-stats">
          <div className="stat-card">
            <div className="stat-number">{properties.length}</div>
            <div className="stat-label">{t('admin.totalProperties')}</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{properties.filter(p => p.status === 'active').length}</div>
            <div className="stat-label">{t('admin.activeListings')}</div>
          </div>
          <div className="stat-card" onClick={() => setTypeFilter(f => f === 'rent' ? 'all' : 'rent')} style={{ cursor: 'pointer' }}>
            <div className="stat-number">{properties.filter(p => p.type === 'rent').length}</div>
            <div className="stat-label">{t('properties.rent')}</div>
          </div>
          <div className="stat-card" onClick={() => setTypeFilter(f => f === 'sale' ? 'all' : 'sale')} style={{ cursor: 'pointer' }}>
            <div className="stat-number">{properties.filter(p => p.type === 'sale').length}</div>
            <div className="stat-label">{t('properties.sale')}</div>
          </div>
        </div>

        <div className="listings-content">
          <ListingsTable
            t={t}
            listings={myListings}
            loading={loading}
            onEdit={handleEdit}
            onToggleFeatured={handleToggleFeatured}
            statusFilter={statusFilter} onStatusFilter={setStatusFilter}
            typeFilter={typeFilter}   onTypeFilter={setTypeFilter}
            categoryFilter={categoryFilter} onCategoryFilter={setCategoryFilter}
            cityFilter={cityFilter}   onCityFilter={e => { setCityFilter(e.target.value); setZoneFilter('all'); }} filterCities={filterCities}
            zoneFilter={zoneFilter}   onZoneFilter={e => setZoneFilter(e.target.value)} filterZones={filterZones}
            sortOrder={sortOrder}     onSortOrder={e => setSortOrder(e.target.value)}
            refSearch={refSearch}     onRefSearch={setRefSearch}
            titleSearch={titleSearch} onTitleSearch={setTitleSearch}
            onClearFilters={handleClearFilters}
            onAddListing={() => { resetForm(); setEditingId(null); setShowForm(true); }}
            onDelete={handleDelete}
            onMarkStatus={handleMarkStatus}
          />
        </div>

      </div>

      {showForm && (
        <div className="pmodal-overlay">
          <div className="pmodal" onClick={e => e.stopPropagation()}>
            <div className="pmodal-header">
              <h2>{editingId ? t('properties.edit') : t('admin.addListing')}</h2>
              <button
                type="button"
                className="pmodal-close"
                onClick={() => { setShowForm(false); setEditingId(null); setFormError(''); resetForm(); }}
                aria-label="Close"
              >×</button>
            </div>
            {formError && (
              <div className="pform-error">
                {formError.split('\n').map((line, i) => <div key={i}>{line}</div>)}
              </div>
            )}
            <PropertyForm
              t={t}
              editingId={editingId}
              formData={formData}
              onInputChange={handleInputChange}
              photoItems={photoItems}
              onPhotoUpload={handlePhotosChange}
              onPhotoAddUrl={handlePhotoAddUrl}
              onPhotoMove={handlePhotoMove}
              onPhotoRemove={handlePhotoRemove}
              onPhotoSetMain={handlePhotoSetMain}
              cityOptions={cityOptions}
              zoneOptions={zoneOptions}
              onAutofill={handleAutofill}
              videoUrls={formData.videoUrls || ['']}
              onVideoUrlsChange={handleVideoUrlsChange}
              onSubmit={handleSubmit}
              onCancel={() => {
                setShowForm(false);
                setEditingId(null);
                setFormError('');
                resetForm();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPanel;

AdminPanel.propTypes = {
  user: PropTypes.shape({
    role: PropTypes.string,
    name: PropTypes.string
  })
};
