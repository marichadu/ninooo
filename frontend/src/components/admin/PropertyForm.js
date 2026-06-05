import React, { useState } from 'react';
import PropTypes from 'prop-types';

const LANGS = [
  { id: 'ka', suffix: '',   flag: '🇬🇪', placeholder: 'Georgian' },
  { id: 'en', suffix: 'En', flag: '🇺🇸', placeholder: 'English'  },
  { id: 'ru', suffix: 'Ru', flag: '🇷🇺', placeholder: 'Russian'  },
];

function MultiLangGroup({ label, baseName, formData, onChange, onAutofill, required, multiline, suggestions }) {
  const handleChange = (e, lang) => {
    onChange(e);
    if (suggestions && onAutofill) {
      const val = e.target.value;
      const match = suggestions.find(s => s[lang.id] && s[lang.id].toLowerCase() === val.toLowerCase());
      if (match) onAutofill(baseName, match);
    }
  };

  return (
    <div className="multilang-group">
      <span className="multilang-label">{label}{required ? ' *' : ''}</span>
      <div className="multilang-inputs">
        {LANGS.map(lang => {
          const listId = suggestions?.length ? `${baseName}-${lang.id}-list` : undefined;
          return (
            <div key={lang.id} className="multilang-field">
              <span className="lang-flag-inline" aria-hidden="true">{lang.flag}</span>
              {multiline ? (
                <textarea
                  name={`${baseName}${lang.suffix}`}
                  value={formData[`${baseName}${lang.suffix}`] || ''}
                  onChange={onChange}
                  rows={3}
                  placeholder={lang.placeholder}
                />
              ) : (
                <>
                  <input
                    type="text"
                    name={`${baseName}${lang.suffix}`}
                    value={formData[`${baseName}${lang.suffix}`] || ''}
                    onChange={e => handleChange(e, lang)}
                    required={required && lang.suffix === ''}
                    placeholder={lang.placeholder}
                    list={listId}
                    autoComplete="off"
                  />
                  {listId && (
                    <datalist id={listId}>
                      {suggestions.map(s => s[lang.id] ? <option key={s[lang.id]} value={s[lang.id]} /> : null)}
                    </datalist>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function LocationSelector({ label, baseName, formData, onChange, onAutofill, required, options }) {
  const currentEn = formData[`${baseName}En`] || '';
  const isKnown = options?.some(o => o.en && o.en === currentEn);
  const hasAnyValue = formData[baseName] || formData[`${baseName}En`] || formData[`${baseName}Ru`];
  const selectValue = isKnown ? currentEn : (hasAnyValue ? '__new__' : '');

  const handleSelectChange = (e) => {
    const val = e.target.value;
    if (!val || val === '__new__') {
      if (onAutofill) onAutofill(baseName, { ka: '', en: '', ru: '' });
    } else {
      const match = options.find(o => o.en === val);
      if (match && onAutofill) onAutofill(baseName, match);
    }
  };

  return (
    <div className="multilang-group">
      <span className="multilang-label">{label}{required ? ' *' : ''}</span>
      {options?.length > 0 && (
        <select className="location-quick-select" value={selectValue} onChange={handleSelectChange}>
          <option value="">— Choose existing —</option>
          {options.map(o => <option key={o.en || o.ka} value={o.en || o.ka}>{o.en || o.ka}</option>)}
          <option value="__new__">— Type new —</option>
        </select>
      )}
      <div className="multilang-inputs">
        {LANGS.map(lang => (
          <div key={lang.id} className="multilang-field">
            <span className="lang-flag-inline" aria-hidden="true">{lang.flag}</span>
            <input
              type="text"
              name={`${baseName}${lang.suffix}`}
              value={formData[`${baseName}${lang.suffix}`] || ''}
              onChange={onChange}
              placeholder={lang.placeholder}
              required={required && lang.suffix === ''}
              autoComplete="off"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function PropertyForm({
  t,
  editingId,
  formData,
  onInputChange,
  cityOptions,
  zoneOptions,
  onAutofill,
  videoUrls,
  onVideoUrlsChange,
  photoItems,
  onPhotoUpload,
  onPhotoAddUrl,
  onPhotoMove,
  onPhotoRemove,
  onPhotoSetMain,
  onSubmit,
  onCancel
}) {
  const [urlInput, setUrlInput] = useState('');

  const commitUrl = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    onPhotoAddUrl(trimmed);
    setUrlInput('');
  };

  return (
    <form onSubmit={onSubmit} className="pform">

      <div className="pform-specs">
        <div className="form-group">
          <label>{t('form.listingRef')}</label>
          <input type="text" name="listingRef" value={formData.listingRef || ''} onChange={onInputChange} placeholder="e.g. 26041151" />
        </div>
        <div className="form-group">
          <label>{t('form.category')}</label>
          <select name="category" value={formData.category || 'residential'} onChange={onInputChange}>
            <option value="residential">{t('properties.residential')}</option>
            <option value="commercial">{t('properties.commercial')}</option>
            <option value="land">{t('properties.land')}</option>
          </select>
        </div>
        <div className="form-group">
          <label>{t('form.type')}</label>
          <select name="type" value={formData.type} onChange={onInputChange}>
            <option value="rent">{t('properties.rent')}</option>
            <option value="sale">{t('properties.sale')}</option>
          </select>
        </div>
        <div className="form-group">
          <label>{t('form.sqMeters')}</label>
          <input type="number" name="sqMeters" min="0" value={formData.sqMeters} onChange={onInputChange} />
        </div>
        <div className="form-group">
          <label>{t('form.bedrooms')}</label>
          <input type="number" name="bedrooms" min="0" value={formData.bedrooms} onChange={onInputChange} />
        </div>
        <div className="form-group">
          <label>{t('form.bathrooms')}</label>
          <input type="number" name="bathrooms" min="0" value={formData.bathrooms} onChange={onInputChange} />
        </div>
        <div className="form-group">
          <label>{t('form.floor')}</label>
          <input type="number" name="floor" min="0" value={formData.floor} onChange={onInputChange} />
        </div>
      </div>

      <div className="pform-price">
        <div className="form-group">
          <label>{t('form.price')}</label>
          <input
            type="number"
            min="0"
            name="price"
            value={formData.price}
            onChange={onInputChange}
            disabled={formData.isPricePrivate}
            placeholder="e.g. 120000"
          />
        </div>
        <div className="form-group">
          <label>Price per m²</label>
          <input
            type="number"
            min="0"
            name="pricePerSqm"
            value={formData.pricePerSqm}
            onChange={onInputChange}
            disabled={formData.isPricePrivate}
            placeholder="e.g. 1600"
          />
        </div>
        <div className="form-group">
          <label>Currency</label>
          <select name="currency" value={formData.currency} onChange={onInputChange}>
            <option value="USD">USD ($)</option>
            <option value="GEL">GEL (₾)</option>
            <option value="EUR">EUR (€)</option>
          </select>
        </div>
        <div className="form-group pform-private-row">
          <label className="checkbox-row">
            <input type="checkbox" name="isPricePrivate" checked={formData.isPricePrivate} onChange={onInputChange} />
            <span>{t('form.pricePrivate')}</span>
          </label>
          <small className="field-hint">{t('form.pricePrivateHelp')}</small>
        </div>
      </div>

      <LocationSelector label={t('form.city')} baseName="city" formData={formData} onChange={onInputChange} onAutofill={onAutofill} options={cityOptions} required />
      <LocationSelector label={t('form.zone')} baseName="zone" formData={formData} onChange={onInputChange} onAutofill={onAutofill} options={zoneOptions} />
      <MultiLangGroup label={t('form.title')}       baseName="title"       formData={formData} onChange={onInputChange} required />
      <MultiLangGroup label={t('form.description')} baseName="description" formData={formData} onChange={onInputChange} multiline />

      <div className="photo-collection">
        <div className="photo-collection-header">
          <strong>{t('form.photos')}</strong>
          <span>{photoItems.length ? `${photoItems.length} ${t('form.photos').toLowerCase()}` : t('form.noPhotos')}</span>
        </div>

        <div className="pform-photo-add">
          <div className="pform-photo-add-file">
            <label className="pform-file-label">
              <span>Upload from computer</span>
              <input type="file" accept="image/*" multiple onChange={onPhotoUpload} />
            </label>
          </div>
          <div className="pform-photo-add-url">
            <input
              type="url"
              className="pform-url-input"
              value={urlInput}
              onChange={e => setUrlInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); commitUrl(); } }}
              placeholder="Or paste an image URL…"
            />
            <button type="button" className="btn btn-secondary pform-url-btn" onClick={commitUrl}>
              Add
            </button>
          </div>
        </div>
        <small className="field-hint" style={{ marginBottom: 10, display: 'block' }}>
          For Facebook photos: open the photo, right-click the image → "Open image in new tab", then paste that URL.
        </small>

        {photoItems.length > 0 ? (
          <div className="photo-grid">
            {photoItems.map((photo, index) => (
              <div className={`photo-card ${index === 0 ? 'is-main' : ''}`} key={photo.id}>
                <img src={photo.src} alt={photo.name || `Photo ${index + 1}`} />
                <div className="photo-card-body">
                  <span className="photo-index">{index + 1}</span>
                  {index === 0 && <span className="photo-badge">{t('form.mainPhoto')}</span>}
                </div>
                <div className="photo-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => onPhotoSetMain(index)} disabled={index === 0}>{t('form.setMainPhoto')}</button>
                  <button type="button" className="btn btn-secondary" onClick={() => onPhotoMove(index, -1)} disabled={index === 0}>{t('form.moveUp')}</button>
                  <button type="button" className="btn btn-secondary" onClick={() => onPhotoMove(index, 1)} disabled={index === photoItems.length - 1}>{t('form.moveDown')}</button>
                  <button type="button" className="btn btn-secondary" onClick={() => onPhotoRemove(index)}>{t('form.removePhoto')}</button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="photo-empty-state">{t('form.noPhotos')}</div>
        )}
      </div>

      <div className="form-group form-group-full pform-video">
        <label>Video URLs</label>
        {(videoUrls || ['']).map((url, i) => (
          <div key={i} className="pform-video-row">
            <input
              type="url"
              value={url}
              onChange={e => {
                const next = [...(videoUrls || [''])];
                next[i] = e.target.value;
                onVideoUrlsChange(next);
              }}
              placeholder="https://www.facebook.com/.../videos/..."
            />
            <button
              type="button"
              className="btn btn-secondary pform-video-remove"
              onClick={() => onVideoUrlsChange((videoUrls || ['']).filter((_, j) => j !== i))}
              disabled={(videoUrls || ['']).length === 1}
            >×</button>
          </div>
        ))}
        <button
          type="button"
          className="btn btn-secondary pform-video-add"
          onClick={() => onVideoUrlsChange([...(videoUrls || ['']), ''])}
        >+ Add another video</button>
        <small className="field-hint" style={{ marginTop: 6, display: 'block' }}>Paste public Facebook video URLs to show next to the photos.</small>
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn-success">{editingId ? t('form.save') : t('form.submit')}</button>
        <button type="button" className="btn btn-secondary" onClick={onCancel}>{t('form.cancel')}</button>
      </div>
    </form>
  );
}

export default PropertyForm;

PropertyForm.propTypes = {
  t: PropTypes.func.isRequired,
  editingId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  formData: PropTypes.object.isRequired,
  onInputChange: PropTypes.func.isRequired,
  cityOptions: PropTypes.array,
  zoneOptions: PropTypes.array,
  onAutofill: PropTypes.func,
  videoUrls: PropTypes.arrayOf(PropTypes.string),
  onVideoUrlsChange: PropTypes.func,
  photoItems: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    src: PropTypes.string.isRequired,
    name: PropTypes.string
  })).isRequired,
  onPhotoUpload: PropTypes.func.isRequired,
  onPhotoAddUrl: PropTypes.func.isRequired,
  onPhotoMove: PropTypes.func.isRequired,
  onPhotoRemove: PropTypes.func.isRequired,
  onPhotoSetMain: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired
};

LocationSelector.propTypes = {
  label: PropTypes.string.isRequired,
  baseName: PropTypes.string.isRequired,
  formData: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  onAutofill: PropTypes.func,
  required: PropTypes.bool,
  options: PropTypes.array,
};

MultiLangGroup.propTypes = {
  label: PropTypes.string.isRequired,
  baseName: PropTypes.string.isRequired,
  formData: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  onAutofill: PropTypes.func,
  required: PropTypes.bool,
  multiline: PropTypes.bool,
  suggestions: PropTypes.array,
};
