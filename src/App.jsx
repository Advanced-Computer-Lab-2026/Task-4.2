import React, { useEffect, useMemo, useRef, useState } from 'react';
import { KEY, categories, conditions, currentUser, seed, emptyForm } from './data.js';

const MAX_PHOTOS = 4;
const MAX_COMPARE = 3;
const budgets = [200, 500, 1000];

const cap = s => s === 'like-new' ? 'Like new' : (s || '').replace(/\b\w/g, m => m.toUpperCase());
const money = n => `EGP ${Number(n).toLocaleString()}`;

function load() {
  try {
    const value = JSON.parse(localStorage.getItem(KEY));
    return Array.isArray(value) ? value : seed;
  } catch {
    return seed;
  }
}

function validate(f) {
  const errors = {};
  if (!f.title.trim()) errors.title = 'Enter an item title.';
  if (f.price.trim() === '' || !Number.isFinite(Number(f.price)) || Number(f.price) < 0) errors.price = 'Enter a price of zero or more.';
  if (!categories.slice(1).includes(f.category)) errors.category = 'Choose a category.';
  if (!conditions.includes(f.condition)) errors.condition = 'Choose the item condition.';
  if (!['active', 'sold'].includes(f.status)) errors.status = 'Choose a valid status.';
  return errors;
}

// Shrinks an uploaded photo so it fits comfortably in localStorage.
function resizePhoto(file) {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) return reject(new Error('not-image'));
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('read'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('decode'));
      img.onload = () => {
        const scale = Math.min(1, 900 / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

function ListingImage({ src, alt, emoji, className = '' }) {
  const [broken, setBroken] = useState(false);
  useEffect(() => setBroken(false), [src]);
  return src && !broken
    ? <img className={className} src={src} alt={alt} loading="lazy" onError={() => setBroken(true)} />
    : <span className="item-emoji" role="img" aria-label="Photo unavailable">{emoji || '📦'}</span>;
}

// Dialog shell: Escape to close, focus trap, focus return and background scroll lock.
function Modal({ label, onClose, className = '', children }) {
  const ref = useRef(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    const node = ref.current;
    const previous = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const focusables = () => [...node.querySelectorAll('button:not([disabled]),a[href],input:not([readonly]):not([disabled]),select,textarea')];
    (node.querySelector('[data-autofocus]') || focusables()[0] || node).focus();
    function onKey(e) {
      if (e.key === 'Escape') { e.stopPropagation(); closeRef.current(); return; }
      if (e.key !== 'Tab') return;
      const list = focusables();
      if (!list.length) return;
      const first = list[0], last = list[list.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
    node.addEventListener('keydown', onKey);
    return () => {
      node.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
      if (previous && previous.focus) previous.focus();
    };
  }, []);

  return (
    <div className="overlay" onMouseDown={e => e.target === e.currentTarget && onClose()}>
      <section ref={ref} className={`dialog ${className}`} role="dialog" aria-modal="true" aria-label={label} tabIndex={-1}>
        <button type="button" className="close" aria-label="Close" onClick={onClose}>×</button>
        {children}
      </section>
    </div>
  );
}

function Field({ id, label, required, error, hint, wide, children }) {
  return (
    <div className={`field${wide ? ' wide' : ''}`}>
      <label htmlFor={id}>{label}{required && <span className="req" aria-hidden="true"> *</span>}</label>
      {children}
      {hint && <small className="hint" id={`${id}-hint`}>{hint}</small>}
      {error && <small className="field-error" id={`${id}-err`}>{error}</small>}
    </div>
  );
}

export default function App() {
  const [items, setItems] = useState(load);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [condition, setCondition] = useState('all');
  const [maxPrice, setMaxPrice] = useState('');
  const [hideSold, setHideSold] = useState(true);
  const [scope, setScope] = useState('all'); // 'all' | 'mine'
  const [sort, setSort] = useState('featured');
  const [selected, setSelected] = useState(null);
  const [activePhoto, setActivePhoto] = useState(0);
  const [editor, setEditor] = useState(null); // null or {id, form, errors}
  const [compare, setCompare] = useState([]);
  const [comparing, setComparing] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(items)); }
    catch { setNotice('Could not save to this browser (storage may be full). Your changes will be lost on reload.'); }
  }, [items]);
  useEffect(() => setActivePhoto(0), [selected]);
  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(''), 6000);
    return () => clearTimeout(t);
  }, [notice]);

  const { listing, hiddenSold } = useMemo(() => {
    const q = query.trim().toLowerCase();
    const parsed = Number(maxPrice);
    const limit = maxPrice.trim() === '' || Number.isNaN(parsed) ? Infinity : parsed;
    const matches = items.filter(x =>
      (scope === 'all' || x.owner === 'you') &&
      (category === 'all' || x.category === category) &&
      (condition === 'all' || x.condition === condition) &&
      x.price <= limit &&
      `${x.title} ${x.category} ${x.description}`.toLowerCase().includes(q));
    const shown = hideSold ? matches.filter(x => x.status !== 'sold') : matches;
    if (sort === 'low') shown.sort((a, b) => a.price - b.price);
    if (sort === 'high') shown.sort((a, b) => b.price - a.price);
    return { listing: shown, hiddenSold: matches.length - shown.length };
  }, [items, query, category, condition, maxPrice, hideSold, scope, sort]);

  const filtersActive = query || category !== 'all' || condition !== 'all' || maxPrice !== '' || sort !== 'featured' || scope !== 'all';
  function clearFilters() {
    setQuery(''); setCategory('all'); setCondition('all'); setMaxPrice(''); setSort('featured'); setScope('all'); setHideSold(true);
  }
  function showResults(next = {}) {
    if (next.category) setCategory(next.category);
    if (next.scope) setScope(next.scope);
    document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' });
  }

  function toggleCompare(id) {
    setCompare(c => c.includes(id) ? c.filter(x => x !== id) : c.length < MAX_COMPARE ? [...c, id] : c);
  }

  function startEdit(item) {
    if (item && item.owner !== 'you') return;
    setSelected(null);
    setEditor({
      id: item?.id || null,
      errors: {},
      form: item
        ? { title: item.title, price: String(item.price), category: item.category, condition: item.condition, description: item.description, pickup: item.pickup || '', status: item.status, photos: item.photos || [] }
        : { ...emptyForm, photos: [] },
    });
  }
  const setField = (name, value) => setEditor(s => ({ ...s, form: { ...s.form, [name]: value }, errors: { ...s.errors, [name]: undefined } }));

  async function addPhotos(fileList) {
    const files = [...fileList];
    if (!files.length) return;
    const room = MAX_PHOTOS - editor.form.photos.length;
    const results = await Promise.allSettled(files.slice(0, room).map(resizePhoto));
    const added = results.filter(r => r.status === 'fulfilled').map(r => r.value);
    const failed = results.length - added.length;
    const skipped = files.length - room > 0 ? files.length - room : 0;
    setEditor(s => s && ({
      ...s,
      form: { ...s.form, photos: [...s.form.photos, ...added] },
      errors: { ...s.errors, photos: failed ? 'Some files were not images and were skipped.' : skipped ? `Only ${MAX_PHOTOS} photos fit; extras were skipped.` : undefined },
    }));
  }
  const removePhoto = i => setEditor(s => ({ ...s, form: { ...s.form, photos: s.form.photos.filter((_, n) => n !== i) } }));

  function submit(event) {
    event.preventDefault();
    const f = editor.form;
    const errors = validate(f);
    if (Object.keys(errors).length) {
      setEditor(s => ({ ...s, errors }));
      const first = ['title', 'price', 'category', 'condition', 'status'].find(k => errors[k]);
      document.getElementById(`f-${first}`)?.focus();
      return;
    }
    const original = editor.id ? items.find(x => x.id === editor.id) : null;
    const next = {
      ...f,
      title: f.title.trim(),
      price: Number(f.price),
      description: f.description.trim(),
      pickup: f.pickup.trim(),
      emoji: original?.emoji || '📦',
      owner: 'you',
      seller: currentUser.name,
      sellerEmail: currentUser.email,
    };
    if (editor.id) {
      setItems(items.map(x => x.id === editor.id ? { ...x, ...next } : x));
      setNotice('Changes saved.');
    } else {
      setItems([{ ...next, id: `m-${Date.now()}`, status: 'active' }, ...items]);
      setNotice('Your item is now listed.');
      setScope('all'); // make sure the new listing is visible
    }
    setEditor(null);
  }

  function reset() {
    setItems(seed); setSelected(null); setEditor(null); setCompare([]); setComparing(false);
    clearFilters(); setConfirmReset(false); setNotice('Example items restored.');
  }

  const bind = name => ({
    id: `f-${name}`,
    value: editor.form[name],
    onChange: e => setField(name, e.target.value),
    'aria-invalid': editor.errors[name] ? 'true' : undefined,
    'aria-describedby': editor.errors[name] ? `f-${name}-err` : undefined,
  });

  const compareItems = compare.map(id => items.find(x => x.id === id)).filter(Boolean);
  const cheapest = compareItems.length ? Math.min(...compareItems.map(x => x.price)) : null;

  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar-inner">
          <button className="brand" onClick={() => { clearFilters(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
            <span className="brand-icon" aria-hidden="true">✳</span> CAMPUS<span className="brand-alt">exchange</span>
          </button>
          <nav aria-label="Main">
            <button className={scope === 'all' ? 'nav-on' : ''} onClick={() => showResults({ scope: 'all' })}>Browse</button>
            <button className={scope === 'mine' ? 'nav-on' : ''} onClick={() => showResults({ scope: 'mine' })}>My listings</button>
          </nav>
          <div className="nav-actions">
            <span className="user" title={currentUser.email}><span className="avatar" aria-hidden="true">Y</span><span className="user-name">{currentUser.name}</span></span>
            <button className="btn primary" onClick={() => startEdit(null)}>+ Sell an item</button>
          </div>
        </div>
      </header>

      <main>
        <section className="intro">
          <h1>Find a good deal on campus.</h1>
          <p>Compare second-hand items from other students, then list your own. All prices in EGP.</p>
        </section>

        <section className="filters" aria-label="Search and filters">
          <div className="field search-field">
            <label htmlFor="q">Search</label>
            <input id="q" type="search" placeholder="Search title or description" value={query} onChange={e => setQuery(e.target.value)} />
          </div>
          <div className="field budget-field">
            <label htmlFor="max">Max price (EGP)</label>
            <input id="max" type="number" inputMode="numeric" min="0" list="budget-options" placeholder="No limit" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} />
            <datalist id="budget-options">{budgets.map(b => <option key={b} value={b} />)}</datalist>
          </div>
          <div className="field">
            <label htmlFor="cat">Category</label>
            <select id="cat" value={category} onChange={e => setCategory(e.target.value)}>
              {categories.map(c => <option key={c} value={c}>{c === 'all' ? 'All categories' : cap(c)}</option>)}
            </select>
          </div>
          <div className="field">
            <label htmlFor="cond">Condition</label>
            <select id="cond" value={condition} onChange={e => setCondition(e.target.value)}>
              <option value="all">Any condition</option>
              {conditions.map(c => <option key={c} value={c}>{cap(c)}</option>)}
            </select>
          </div>
          <div className="field">
            <label htmlFor="sort">Sort by</label>
            <select id="sort" value={sort} onChange={e => setSort(e.target.value)}>
              <option value="featured">Featured</option>
              <option value="low">Price: low to high</option>
              <option value="high">Price: high to low</option>
            </select>
          </div>
        </section>

        <section id="results" aria-labelledby="results-title">
          <div className="results-head">
            <div>
              <h2 id="results-title">{scope === 'mine' ? 'My listings' : 'Listings'}</h2>
              <p className="count" aria-live="polite">{listing.length} {listing.length === 1 ? 'item' : 'items'}</p>
            </div>
            <div className="results-tools">
              <label className="check"><input type="checkbox" checked={hideSold} onChange={e => setHideSold(e.target.checked)} /> Hide sold items</label>
              {filtersActive && <button type="button" className="btn link" onClick={clearFilters}>Clear filters</button>}
            </div>
          </div>
          {hiddenSold > 0 && <p className="hint-line">{hiddenSold} sold {hiddenSold === 1 ? 'item is' : 'items are'} hidden.</p>}
          {notice && <p className="notice" role="status">{notice} <button type="button" aria-label="Dismiss message" onClick={() => setNotice('')}>×</button></p>}

          <div className="grid">
            {listing.map(item => {
              const picked = compare.includes(item.id);
              const sold = item.status === 'sold';
              return (
                <article className={`card${sold ? ' is-sold' : ''}`} key={item.id}>
                  <button type="button" className="card-photo" onClick={() => setSelected(item.id)} aria-label={`View ${item.title}`}>
                    <ListingImage src={item.photos?.[0]} alt="" emoji={item.emoji} className="listing-img" />
                    {sold && <span className="badge sold">Sold</span>}
                    {item.owner === 'you' && <span className="badge mine">Your listing</span>}
                  </button>
                  <div className="card-body">
                    <p className="price">{money(item.price)}</p>
                    <h3>{item.title}</h3>
                    <p className="meta">{cap(item.category)} · {cap(item.condition)}</p>
                    <p className="where"><span aria-hidden="true">📍</span> {item.pickup || 'Arrange with seller'}</p>
                    <div className="card-actions">
                      <button type="button" className="btn secondary" onClick={() => setSelected(item.id)}>View details</button>
                      <label className="check"><input type="checkbox" checked={picked} disabled={!picked && compare.length >= MAX_COMPARE} onChange={() => toggleCompare(item.id)} /> Compare</label>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
          {listing.length === 0 && (
            <div className="empty">
              <p><strong>No listings match.</strong></p>
              <p>{scope === 'mine' ? 'You have no listings here yet.' : 'Try a higher budget or fewer filters.'}</p>
              <div className="empty-actions">
                {filtersActive && <button type="button" className="btn secondary" onClick={clearFilters}>Clear filters</button>}
                <button type="button" className="btn primary" onClick={() => startEdit(null)}>Sell an item</button>
              </div>
            </div>
          )}
        </section>

        <footer>
          <strong>CAMPUS exchange</strong><span>From students, for students.</span>
          {confirmReset
            ? <span className="reset-confirm" role="alertdialog" aria-label="Confirm reset">Restore the example items? Your changes will be lost.
                <button type="button" className="btn danger" onClick={reset}>Yes, reset</button>
                <button type="button" className="btn link" onClick={() => setConfirmReset(false)}>Cancel</button></span>
            : <button type="button" className="btn link push" onClick={() => setConfirmReset(true)}>Reset demo</button>}
        </footer>
      </main>

      {compare.length > 0 && (
        <aside className="tray" aria-label="Compare tray">
          <div className="tray-items">
            {compareItems.map(x => <span className="tray-chip" key={x.id}>{x.title} · {money(x.price)}<button type="button" aria-label={`Remove ${x.title} from comparison`} onClick={() => toggleCompare(x.id)}>×</button></span>)}
          </div>
          <div className="tray-actions">
            <button type="button" className="btn link" onClick={() => setCompare([])}>Clear</button>
            <button type="button" className="btn primary" disabled={compare.length < 2} onClick={() => setComparing(true)}>{compare.length < 2 ? 'Pick one more to compare' : `Compare ${compare.length} items`}</button>
          </div>
        </aside>
      )}

      {selected && (() => {
        const item = items.find(x => x.id === selected);
        if (!item) return null;
        const images = item.photos || [];
        const subject = encodeURIComponent(`Campus Exchange: ${item.title}`);
        const body = encodeURIComponent(`Hi ${item.seller},\n\nI'm interested in your listing "${item.title}" (EGP ${item.price}). Is it still available?\n\n`);
        return (
          <Modal label="Item details" onClose={() => setSelected(null)} className="detail">
            <div className="detail-visual">
              <ListingImage src={images[activePhoto] || images[0]} alt={`${item.title} photo ${activePhoto + 1}`} emoji={item.emoji} className="detail-img" />
            </div>
            {images.length > 1 && <div className="thumbs" role="group" aria-label="Item photos">{images.map((src, i) =>
              <button type="button" key={i} className={activePhoto === i ? 'thumb active' : 'thumb'} aria-label={`Show photo ${i + 1} of ${images.length}`} aria-pressed={activePhoto === i} onClick={() => setActivePhoto(i)}>
                <ListingImage src={src} alt="" emoji={item.emoji} className="thumb-img" />
              </button>)}</div>}
            <p className="kicker">{cap(item.category)} · {cap(item.condition)}</p>
            <h2>{item.title}</h2>
            <p className="detail-price">{money(item.price)} <span className={`status ${item.status}`}>{cap(item.status)}</span></p>
            <p className="description">{item.description || 'No description supplied.'}</p>
            <dl className="meta-grid">
              <div><dt>Pickup</dt><dd>{item.pickup || 'Arrange directly with seller'}</dd></div>
              <div><dt>Seller</dt><dd>{item.seller}</dd></div>
            </dl>
            <div className="detail-actions">
              {item.owner === 'you'
                ? <button type="button" className="btn primary" onClick={() => startEdit(item)}>Edit your listing</button>
                : item.status === 'sold'
                  ? <p className="fineprint">This item is marked as sold.</p>
                  : <a className="btn primary" href={`mailto:${item.sellerEmail}?subject=${subject}&body=${body}`}>✉ Contact seller</a>}
              <label className="check"><input type="checkbox" checked={compare.includes(item.id)} disabled={!compare.includes(item.id) && compare.length >= MAX_COMPARE} onChange={() => toggleCompare(item.id)} /> Add to compare</label>
            </div>
          </Modal>
        );
      })()}

      {comparing && compareItems.length > 0 && (
        <Modal label="Compare items" onClose={() => setComparing(false)} className="compare-dialog">
          <h2>Compare items</h2>
          <div className="table-wrap">
            <table>
              <thead><tr><th scope="col"><span className="sr-only">Attribute</span></th>{compareItems.map(x => <th scope="col" key={x.id}>{x.title}</th>)}</tr></thead>
              <tbody>
                <tr><th scope="row">Price</th>{compareItems.map(x => <td key={x.id}><strong>{money(x.price)}</strong>{x.price === cheapest && compareItems.length > 1 && <span className="badge best">Lowest</span>}</td>)}</tr>
                <tr><th scope="row">Condition</th>{compareItems.map(x => <td key={x.id}>{cap(x.condition)}</td>)}</tr>
                <tr><th scope="row">Category</th>{compareItems.map(x => <td key={x.id}>{cap(x.category)}</td>)}</tr>
                <tr><th scope="row">Status</th>{compareItems.map(x => <td key={x.id}>{cap(x.status)}</td>)}</tr>
                <tr><th scope="row">Pickup</th>{compareItems.map(x => <td key={x.id}>{x.pickup || 'Arrange with seller'}</td>)}</tr>
                <tr><th scope="row">Seller</th>{compareItems.map(x => <td key={x.id}>{x.seller}</td>)}</tr>
                <tr><th scope="row"><span className="sr-only">Actions</span></th>{compareItems.map(x => <td key={x.id}><button type="button" className="btn secondary" onClick={() => { setComparing(false); setSelected(x.id); }}>View</button></td>)}</tr>
              </tbody>
            </table>
          </div>
        </Modal>
      )}

      {editor && (() => {
        const f = editor.form;
        const previewPrice = f.price.trim() !== '' && Number.isFinite(Number(f.price)) && Number(f.price) >= 0 ? money(f.price) : 'EGP —';
        return (
          <Modal label={editor.id ? 'Edit item' : 'Sell item'} onClose={() => setEditor(null)} className="sell">
            <div className="modal-head">
              <p className="kicker">Campus Exchange</p>
              <h2>{editor.id ? 'Edit your listing' : 'Sell an item'}</h2>
              <p className="muted">Fields marked * are required.</p>
            </div>
            <div className="sell-layout">
              <form onSubmit={submit} noValidate>
                <div className="form-grid">
                  <Field id="f-title" label="Item title" required wide error={editor.errors.title}>
                    <input data-autofocus maxLength={80} placeholder="What are you selling?" {...bind('title')} />
                  </Field>
                  <Field id="f-price" label="Price (EGP)" required error={editor.errors.price}>
                    <input type="number" min="0" step="0.01" inputMode="decimal" placeholder="0" {...bind('price')} />
                  </Field>
                  <Field id="f-category" label="Category" required error={editor.errors.category}>
                    <select {...bind('category')}><option value="">Select</option>{categories.slice(1).map(c => <option value={c} key={c}>{cap(c)}</option>)}</select>
                  </Field>
                  <Field id="f-condition" label="Condition" required error={editor.errors.condition}>
                    <select {...bind('condition')}><option value="">Select</option>{conditions.map(c => <option value={c} key={c}>{cap(c)}</option>)}</select>
                  </Field>
                  {editor.id && (
                    <Field id="f-status" label="Status" error={editor.errors.status}>
                      <select {...bind('status')}><option value="active">Active</option><option value="sold">Sold</option></select>
                    </Field>
                  )}
                  <Field id="f-description" label="Description" wide hint="Optional. Mention wear, what's included and why it's a good deal.">
                    <textarea rows="4" placeholder="Describe your item" {...bind('description')} aria-describedby="f-description-hint" />
                  </Field>
                  <Field id="f-pickup" label="Pickup / meetup location" wide hint="Optional. Pick a public spot on campus.">
                    <input placeholder="e.g. Library entrance, weekdays after 1 PM" {...bind('pickup')} aria-describedby="f-pickup-hint" />
                  </Field>
                  <div className="field wide">
                    <span className="label" id="photos-label">Photos <span className="muted">(optional, up to {MAX_PHOTOS})</span></span>
                    <div className="photo-row">
                      {f.photos.map((src, i) => (
                        <div className="photo-tile" key={i}>
                          <ListingImage src={src} alt={`Photo ${i + 1}`} emoji="📦" className="thumb-img" />
                          <button type="button" aria-label={`Remove photo ${i + 1}`} onClick={() => removePhoto(i)}>×</button>
                        </div>
                      ))}
                      {f.photos.length < MAX_PHOTOS && (
                        <label className="photo-add">
                          <span aria-hidden="true">＋</span> Add photo
                          <input type="file" accept="image/*" multiple onChange={e => { addPhotos(e.target.files); e.target.value = ''; }} aria-labelledby="photos-label" />
                        </label>
                      )}
                    </div>
                    {editor.errors.photos && <small className="field-error">{editor.errors.photos}</small>}
                  </div>
                  <Field id="f-email" label="Seller contact email" wide hint="Taken from your account so buyers can contact you.">
                    <input id="f-email" value={currentUser.email} readOnly aria-readonly="true" className="readonly-input" aria-describedby="f-email-hint" />
                  </Field>
                </div>
                {Object.values(editor.errors).some(Boolean) && <p className="alert" role="alert">Please fix the highlighted fields.</p>}
                <div className="modal-foot">
                  <button type="button" className="btn secondary" onClick={() => setEditor(null)}>Cancel</button>
                  <button className="btn primary" type="submit">{editor.id ? 'Save changes' : 'Publish item'}</button>
                </div>
              </form>
              <aside className="preview" aria-label="Listing preview">
                <p className="kicker">Preview</p>
                <article className="card">
                  <div className="card-photo static"><ListingImage src={f.photos[0]} alt="" emoji="📦" className="listing-img" /></div>
                  <div className="card-body">
                    <p className="price">{previewPrice}</p>
                    <h3>{f.title.trim() || 'Your item title'}</h3>
                    <p className="meta">{f.category ? cap(f.category) : 'Category'} · {f.condition ? cap(f.condition) : 'Condition'}</p>
                    <p className="where"><span aria-hidden="true">📍</span> {f.pickup.trim() || 'Arrange with seller'}</p>
                  </div>
                </article>
              </aside>
            </div>
          </Modal>
        );
      })()}
    </div>
  );
}
