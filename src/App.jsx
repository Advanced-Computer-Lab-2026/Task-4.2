import React, { useEffect, useMemo, useRef, useState } from 'react';

const KEY = 'acl-marketplace-v3';
const categories = ['textbooks', 'electronics', 'furniture', 'clothing', 'other'];
const conditions = ['new', 'like-new', 'used', 'worn'];
const currentUser = { name: 'You', email: 'you@example.com' };
const photo = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1000&q=85`;
const seed = [
  { id: 'm1', title: 'Calculus II textbook', category: 'textbooks', condition: 'used', price: 320, description: 'Second-year calculus textbook, complete with all chapters. A few highlighted sections and notes in pencil, but no missing or torn pages. Useful for the midterm and final revision sessions. You can inspect it before deciding.', status: 'active', owner: 'you', seller: 'You', sellerEmail: currentUser.email, pickup: 'GUC student area, near the main cafeteria', photos: [photo('photo-1512820790803-83ca734da794'), photo('photo-1494438639946-1ebd1d20bf85')], emoji: '📚' },
  { id: 'm2', title: 'Student desk lamp', category: 'furniture', condition: 'like-new', price: 240, description: 'Compact study lamp with warm light, adjustable position and a USB power cable. Used for one semester only. The cable and light both work. Great for a dorm desk or a small workspace.', status: 'active', owner: 'other', seller: 'Mariam', sellerEmail: 'mariam.seller@example.com', pickup: 'GUC library entrance, weekdays after 1 PM', photos: [photo('photo-1507473885765-e6ed057f782c')], emoji: '💡' },
  { id: 'm3', title: 'Bluetooth headphones', category: 'electronics', condition: 'used', price: 650, description: 'Wireless over-ear headphones in good working condition. They connect with Bluetooth and include the original carrying pouch and charging cable. The battery lasts about six hours based on my usage. There are a few cosmetic scratches near one hinge; see the photos. Happy to let you test sound and pairing before buying.', status: 'active', owner: 'other', seller: 'Omar', sellerEmail: 'omar.seller@example.com', pickup: 'Arrange a meetup at GUC Gate 3', photos: [photo('photo-1505740420928-5e560c06d30e'), photo('photo-1546435770-a3e426bf472b')], emoji: '🎧' },
  { id: 'm4', title: 'Engineering lab coat', category: 'clothing', condition: 'new', price: 200, description: 'White engineering lab coat, medium size, bought for a lab but never worn. Still clean and folded. Suitable for laboratory practical sessions. Please check your required size before arranging pickup.', status: 'active', owner: 'you', seller: 'You', sellerEmail: currentUser.email, pickup: 'Meet at GUC main entrance, mornings', photos: [photo('photo-1542058186993-286fdce0b580')], emoji: '🥼' },
  { id: 'm5', title: 'Drawing tablet', category: 'electronics', condition: 'like-new', price: 1450, description: 'Small USB drawing tablet with pressure-sensitive pen and protective sleeve. Used for a few class illustrations; fully functional. Works with common creative software after installing the manufacturer driver. You are welcome to try the pen and pressure sensitivity on my laptop before buying.', status: 'active', owner: 'other', seller: 'Nour', sellerEmail: 'nour.seller@example.com', pickup: 'GUC design building reception', photos: [photo('photo-1671087709820-274fdd9ac67a')], emoji: '✏️' },
  { id: 'm6', title: 'Used storage shelf', category: 'furniture', condition: 'worn', price: 390, description: 'Light wooden storage shelf. Stable and usable, though there are visible scratches from moving rooms. The shelves are best for books, stationery and small storage boxes, not very heavy appliances. Buyer should arrange a way to transport it from near campus.', status: 'active', owner: 'other', seller: 'Youssef', sellerEmail: 'youssef.seller@example.com', pickup: 'Collect from a public pickup point near GUC, by arrangement', photos: [photo('photo-1594620302200-9a762244a156')], emoji: '🗄️' },
  { id: 'm7', title: 'MATH 201 workbook', category: 'textbooks', condition: 'used', price: 140, description: 'Workbook with practice problems, solutions and lecture notes. All pages present and in readable condition. Some exercises have answers written in pencil. Already sold to another student.', status: 'sold', owner: 'you', seller: 'You', sellerEmail: currentUser.email, pickup: 'GUC campus (previous listing)', photos: [photo('photo-1544947950-fa07a98d237f')], emoji: '📖' },
  { id: 'm8', title: 'Sketching kit', category: 'other', condition: 'like-new', price: 180, description: 'Charcoal pencils, graphite pencils, blending tools and an A5 sketch pad. Some pencils have been lightly used, but the set still has plenty of material for design practice and drawing assignments.', status: 'active', owner: 'other', seller: 'Salma', sellerEmail: 'salma.seller@example.com', pickup: 'Meet outside the GUC architecture studios', photos: [photo('photo-1758521232691-613561977b6a'), photo('photo-1771366629879-8b3128ee62ca')], emoji: '🎨' },
];

const emptyForm = { title: '', price: '', category: '', condition: '', description: '', pickup: '', status: 'active', photoUrl: '' };
const currency = new Intl.NumberFormat('en-EG', { style: 'currency', currency: 'EGP', maximumFractionDigits: 2 });
const display = (value) => value === 'like-new' ? 'Like new' : value ? value[0].toUpperCase() + value.slice(1) : '';

function saved() {
  try {
    const value = JSON.parse(localStorage.getItem(KEY));
    return Array.isArray(value) ? value : seed;
  } catch {
    return seed;
  }
}

function ListingImage({ src, alt, emoji, className = '' }) {
  const [broken, setBroken] = useState(false);
  useEffect(() => setBroken(false), [src]);
  return src && !broken
    ? <img className={className} src={src} alt={alt} loading="lazy" onError={() => setBroken(true)} />
    : <span className="image-fallback" role="img" aria-label={`${alt || 'Item'} photo unavailable`}>{emoji || '📦'}</span>;
}

function Dialog({ children, className, onClose, label }) {
  const dialogRef = useRef(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  useEffect(() => {
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialogRef.current?.querySelector('button, input, select, textarea, a[href]')?.focus();
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        event.preventDefault();
        onCloseRef.current();
        return;
      }
      if (event.key !== 'Tab' || !dialogRef.current) return;
      const focusable = [...dialogRef.current.querySelectorAll('button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href]')];
      if (!focusable.length) {
        event.preventDefault();
        dialogRef.current.focus();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus();
    };
  }, []);
  return <div className="dialog-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onCloseRef.current()}>
    <section ref={dialogRef} className={`dialog ${className}`} role="dialog" aria-modal="true" aria-label={label} tabIndex={-1}>{children}</section>
  </div>;
}

function Header({ onSell }) {
  return <>
    <div className="utility-bar"><span>Campus pickup</span><span>Prices in EGP</span></div>
    <header className="site-header">
      <a className="brand" href="#top" aria-label="Campus Exchange home"><span className="brand-mark" aria-hidden="true">C</span><span>Campus <strong>Exchange</strong></span></a>
      <nav className="main-nav" aria-label="Main navigation"><a href="#browse">Browse</a></nav>
      <div className="header-actions"><span className="demo-user" role="group" aria-label="Demo account: You"><span className="avatar" aria-hidden="true">Y</span><span className="demo-user-label">Demo account <strong>You</strong></span></span><button className="button button-primary" type="button" onClick={onSell}>Sell an item</button></div>
    </header>
  </>;
}

function Hero() {
  return <section className="hero" id="top">
    <div><p className="eyebrow">Campus Exchange</p><h1>Good finds, close by.</h1><p className="hero-copy">Browse second-hand essentials from students on your campus.</p><a className="button button-primary" href="#browse">Browse listings <span aria-hidden="true">↓</span></a></div>
    <div className="hero-note"><span className="hero-note-icon" aria-hidden="true">↗</span><span>Find it nearby.<br /><strong>Pass it on.</strong></span></div>
  </section>;
}

function MarketplaceToolbar({ query, setQuery, category, setCategory, sort, setSort, activeOnly, setActiveOnly, maxPrice, setMaxPrice, onClear, hasFilters }) {
  return <section className="toolbar" aria-label="Search and filter listings">
    <div className="toolbar-top">
      <label className="search-control"><span aria-hidden="true">⌕</span><span className="visually-hidden">Search listings</span><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search items, categories, or details" /></label>
      <label className="select-control"><span>Sort by</span><select value={sort} onChange={(event) => setSort(event.target.value)}><option value="featured">Featured</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option></select></label>
    </div>
    <div className="filter-row">
      <div className="category-filters" aria-label="Filter by category">
        <button type="button" className={category === 'all' ? 'filter-chip selected' : 'filter-chip'} aria-pressed={category === 'all'} onClick={() => setCategory('all')}>All items</button>
        {categories.map((value) => <button type="button" key={value} className={category === value ? 'filter-chip selected' : 'filter-chip'} aria-pressed={category === value} onClick={() => setCategory(value)}>{display(value)}</button>)}
      </div>
      <div className="filter-options">
        <label className="price-filter">Max price <span className="currency-prefix">EGP</span><input aria-label="Maximum price in EGP" inputMode="decimal" type="number" min="0" placeholder="Any" value={maxPrice} onChange={(event) => setMaxPrice(event.target.value)} /></label>
        <label className="toggle-control"><input type="checkbox" checked={activeOnly} onChange={(event) => setActiveOnly(event.target.checked)} /><span className="toggle-track" aria-hidden="true"></span><span>Active only</span></label>
        {hasFilters && <button className="text-button clear-filters" type="button" onClick={onClear}>Clear filters</button>}
      </div>
    </div>
  </section>;
}

function ListingCard({ item, onOpen }) {
  const sold = item.status === 'sold';
  return <button className={`listing-card${sold ? ' is-sold' : ''}`} type="button" onClick={onOpen} aria-label={`${item.title}, ${currency.format(item.price)}, ${sold ? 'sold' : 'active'}. View details`}>
    <span className="card-image"><ListingImage src={item.photos?.[0]} alt={item.title} emoji={item.emoji} className="listing-image" />
      {sold && <span className="sold-overlay" aria-hidden="true">Sold</span>}
      <span className={`status-badge ${sold ? 'status-sold' : 'status-active'}`}>{sold ? 'Sold' : 'Active'}</span>
    </span>
    <span className="card-content">
      <span className="card-badges"><span className="category-badge">{display(item.category)}</span><span>{display(item.condition)}</span></span>
      <span className="card-title">{item.title}</span>
      <span className="card-description">{item.description || 'No description supplied.'}</span>
      <span className="card-price">{currency.format(item.price)}</span>
    </span>
  </button>;
}

function ListingDetailsDialog({ item, onClose, onEdit, onMarkSold }) {
  const [activePhoto, setActivePhoto] = useState(0);
  const images = item.photos || [];
  const contactSubject = encodeURIComponent(`Campus Exchange: ${item.title}`);
  const contactBody = encodeURIComponent(`Hi ${item.seller},\n\nI'm interested in your listing "${item.title}" (${currency.format(item.price)}). Is it still available?\n\n`);
  return <Dialog className="details-dialog" label={`${item.title} details`} onClose={onClose}>
    <button className="icon-button dialog-close" type="button" aria-label="Close item details" onClick={onClose}>×</button>
    <div className="details-layout">
      <div className="gallery-column">
        <div className="detail-image-wrap"><ListingImage src={images[activePhoto] || images[0]} alt={`${item.title}, photo ${activePhoto + 1}`} emoji={item.emoji} className="detail-image" />{item.status === 'sold' && <span className="detail-sold-banner">Sold</span>}</div>
        {images.length > 1 && <div className="thumbnail-row" aria-label="Item photos">{images.map((src, index) => <button type="button" key={`${src}-${index}`} className={`thumbnail${activePhoto === index ? ' current' : ''}`} aria-label={`Show photo ${index + 1} of ${images.length}`} aria-pressed={activePhoto === index} onClick={() => setActivePhoto(index)}><ListingImage src={src} alt="" emoji={item.emoji} className="thumbnail-image" /></button>)}</div>}
      </div>
      <div className="details-content">
        <div className="detail-status-row"><span className={`status-badge ${item.status === 'sold' ? 'status-sold' : 'status-active'}`}>{item.status === 'sold' ? 'Sold' : 'Active'}</span><span className="detail-category">{display(item.category)} · {display(item.condition)}</span></div>
        <h2>{item.title}</h2><p className="detail-price">{currency.format(item.price)}</p>
        <section className="detail-description"><h3>Description</h3><p>{item.description || 'No description supplied.'}</p></section>
        <dl className="seller-details"><div><dt>Seller</dt><dd>{item.seller}</dd></div><div><dt>Campus pickup</dt><dd>{item.pickup || 'Arrange directly with seller'}</dd></div></dl>
        <div className="dialog-actions">
          {item.owner === 'you' ? <><button className="button button-primary" type="button" onClick={onEdit}>Edit listing</button>{item.status === 'active' && <button className="button button-secondary" type="button" onClick={onMarkSold}>Mark as sold</button>}</>
            : item.status === 'sold' ? <p className="unavailable-message">This item has been sold and is no longer available.</p>
              : <a className="button button-primary contact-button" href={`mailto:${item.sellerEmail}?subject=${contactSubject}&body=${contactBody}`}>Contact seller <span aria-hidden="true">↗</span></a>}
        </div>
      </div>
    </div>
  </Dialog>;
}

function validateForm(form) {
  const errors = {};
  if (!form.title.trim()) errors.title = 'Enter an item title.';
  if (form.price.trim() === '' || !Number.isFinite(Number(form.price)) || Number(form.price) < 0) errors.price = 'Enter a valid price of 0 EGP or more.';
  if (!categories.includes(form.category)) errors.category = 'Choose a category.';
  if (!conditions.includes(form.condition)) errors.condition = 'Choose an item condition.';
  if (!['active', 'sold'].includes(form.status)) errors.status = 'Choose a valid listing status.';
  return errors;
}

function ListingFormDialog({ editor, setEditor, onSubmit, onClose, errors, onClearError }) {
  const formRef = useRef(null);
  function update(field, value) {
    setEditor((current) => ({ ...current, form: { ...current.form, [field]: value } }));
    onClearError(field);
  }
  function fieldError(field) {
    return errors[field] ? <span className="field-error" id={`${field}-error`}>{errors[field]}</span> : null;
  }
  const previewSrc = editor.form.photoUrl.trim();
  return <Dialog className="form-dialog" label={editor.id ? 'Edit listing' : 'Create a listing'} onClose={onClose}>
    <div className="form-dialog-header"><div><p className="eyebrow">Campus Exchange</p><h2>{editor.id ? 'Edit your listing' : 'Sell an item'}</h2><p>Share a few details so another student can find it.</p></div><button className="icon-button dialog-close" type="button" aria-label="Close listing form" onClick={onClose}>×</button></div>
    <form ref={formRef} onSubmit={onSubmit} noValidate>
      <div className="form-section"><h3>Item details</h3>
        <div className="form-grid">
          <label className="form-field"><span>Item title <b aria-hidden="true">*</b></span><input id="title" type="text" required value={editor.form.title} onChange={(event) => update('title', event.target.value)} placeholder="e.g. Calculus textbook" aria-invalid={Boolean(errors.title)} aria-describedby={errors.title ? 'title-error' : undefined} />{fieldError('title')}</label>
          <label className="form-field"><span>Price (EGP) <b aria-hidden="true">*</b></span><input id="price" type="text" inputMode="decimal" required value={editor.form.price} onChange={(event) => update('price', event.target.value)} placeholder="e.g. 250" aria-invalid={Boolean(errors.price)} aria-describedby={errors.price ? 'price-error' : undefined} />{fieldError('price')}</label>
          <label className="form-field"><span>Category <b aria-hidden="true">*</b></span><select id="category" required value={editor.form.category} onChange={(event) => update('category', event.target.value)} aria-invalid={Boolean(errors.category)} aria-describedby={errors.category ? 'category-error' : undefined}><option value="">Select a category</option>{categories.map((value) => <option value={value} key={value}>{display(value)}</option>)}</select>{fieldError('category')}</label>
          <label className="form-field"><span>Condition <b aria-hidden="true">*</b></span><select id="condition" required value={editor.form.condition} onChange={(event) => update('condition', event.target.value)} aria-invalid={Boolean(errors.condition)} aria-describedby={errors.condition ? 'condition-error' : undefined}><option value="">Select a condition</option>{conditions.map((value) => <option value={value} key={value}>{display(value)}</option>)}</select>{fieldError('condition')}</label>
          <label className="form-field full-width"><span>Description <small>Optional</small></span><textarea id="description" rows="4" value={editor.form.description} onChange={(event) => update('description', event.target.value)} placeholder="Share useful details about the item." /></label>
          <label className="form-field full-width"><span>Campus pickup location <small>Optional</small></span><input id="pickup" type="text" value={editor.form.pickup} onChange={(event) => update('pickup', event.target.value)} placeholder="e.g. Library entrance" /></label>
        </div>
      </div>
      <div className="form-section image-form-section"><h3>Item photo <span className="optional-label">Optional</span></h3><div className="image-form-layout"><label className="form-field"><span>Image URL</span><input id="photoUrl" type="text" inputMode="url" value={editor.form.photoUrl} onChange={(event) => update('photoUrl', event.target.value)} placeholder="https://..." /><small>Paste a direct image link. If it cannot load, your item emoji will be shown instead.</small></label><div className="form-preview"><ListingImage src={previewSrc} alt="Preview of your listing" emoji="📦" className="preview-image" /></div></div></div>
      <div className="form-section account-section"><h3>Seller contact</h3><label className="form-field"><span>Seller email</span><input type="email" value={currentUser.email} readOnly aria-readonly="true" className="readonly-input" /><small>This demo email is fixed so buyers can contact the listing owner.</small></label></div>
      {editor.id && <div className="form-section status-section"><label className="form-field"><span>Listing status</span><select id="status" value={editor.form.status} onChange={(event) => update('status', event.target.value)} aria-invalid={Boolean(errors.status)} aria-describedby={errors.status ? 'status-error' : undefined}><option value="active">Active</option><option value="sold">Sold</option></select>{fieldError('status')}</label></div>}
      {Object.keys(errors).length > 0 && <p className="form-alert" role="alert">Please correct the highlighted fields.</p>}
      <div className="form-footer"><button className="button button-secondary" type="button" onClick={onClose}>Cancel</button><button className="button button-primary" type="submit">{editor.id ? 'Save changes' : 'Publish listing'}</button></div>
    </form>
  </Dialog>;
}

export default function App() {
  const [items, setItems] = useState(saved);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState('featured');
  const [activeOnly, setActiveOnly] = useState(true);
  const [maxPrice, setMaxPrice] = useState('');
  const [selected, setSelected] = useState(null);
  const [editor, setEditor] = useState(null);
  const [errors, setErrors] = useState({});
  const [notice, setNotice] = useState('');

  useEffect(() => localStorage.setItem(KEY, JSON.stringify(items)), [items]);
  const listing = useMemo(() => {
    const filtered = items.filter((item) => (category === 'all' || item.category === category)
      && (!activeOnly || item.status === 'active')
      && (maxPrice === '' || (Number.isFinite(Number(maxPrice)) && Number(maxPrice) >= 0 && item.price <= Number(maxPrice)))
      && `${item.title} ${item.category} ${item.condition} ${item.description || ''}`.toLowerCase().includes(query.trim().toLowerCase()));
    if (sort === 'low') filtered.sort((a, b) => a.price - b.price);
    if (sort === 'high') filtered.sort((a, b) => b.price - a.price);
    return filtered;
  }, [items, category, activeOnly, maxPrice, query, sort]);
  const hasFilters = Boolean(query || category !== 'all' || !activeOnly || maxPrice !== '' || sort !== 'featured');

  function startEdit(item) {
    if (item && item.owner !== 'you') return;
    const form = item ? {
      title: item.title,
      price: String(item.price),
      category: item.category,
      condition: item.condition,
      description: item.description || '',
      pickup: item.pickup || '',
      status: item.status,
      photoUrl: item.photos?.[0] || '',
    } : { ...emptyForm };
    setErrors({});
    setSelected(null);
    setEditor({ id: item?.id || null, form, initialForm: { ...form } });
  }

  function requestCloseForm() {
    if (!editor) return;
    const dirty = JSON.stringify(editor.form) !== JSON.stringify(editor.initialForm);
    if (dirty && !window.confirm('Discard your changes to this listing?')) return;
    setEditor(null);
    setErrors({});
  }

  function submit(event) {
    event.preventDefault();
    const nextErrors = validateForm(editor.form);
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      requestAnimationFrame(() => document.querySelector('[aria-invalid="true"]')?.focus());
      return;
    }
    const original = editor.id ? items.find((item) => item.id === editor.id && item.owner === 'you') : null;
    if (editor.id && !original) {
      setNotice('This listing can no longer be edited.');
      setEditor(null);
      return;
    }
    const next = {
      title: editor.form.title.trim(),
      price: Number(editor.form.price),
      category: editor.form.category,
      condition: editor.form.condition,
      description: editor.form.description.trim(),
      pickup: editor.form.pickup.trim(),
      status: editor.id ? editor.form.status : 'active',
      photos: editor.form.photoUrl.trim() ? [editor.form.photoUrl.trim()] : original?.photos || [],
      emoji: original?.emoji || '📦',
      owner: 'you',
      seller: currentUser.name,
      sellerEmail: currentUser.email,
    };
    if (editor.id) {
      setItems((current) => current.map((item) => item.id === editor.id ? { ...item, ...next } : item));
      setNotice('Your listing was updated.');
    } else {
      setItems((current) => [{ ...next, id: `m-${Date.now()}` }, ...current]);
      setNotice('Your listing is live.');
    }
    setEditor(null);
    setErrors({});
  }

  function markAsSold(item) {
    if (item.owner !== 'you') return;
    setItems((current) => current.map((entry) => entry.id === item.id && entry.owner === 'you' ? { ...entry, status: 'sold' } : entry));
    setNotice('Your listing is marked as sold.');
  }

  function reset() {
    setItems(seed);
    setSelected(null);
    setEditor(null);
    setErrors({});
    setQuery('');
    setCategory('all');
    setSort('featured');
    setActiveOnly(true);
    setMaxPrice('');
    setNotice('Demo listings restored.');
  }

  function clearFilters() {
    setQuery('');
    setCategory('all');
    setSort('featured');
    setActiveOnly(true);
    setMaxPrice('');
  }

  return <div className="market-app">
    <Header onSell={() => startEdit(null)} />
    <main>
      <Hero />
      <section className="marketplace" id="browse" aria-labelledby="browse-heading">
        <div className="section-heading"><div><p className="eyebrow">Find your next campus essential</p><h2 id="browse-heading">Browse listings</h2></div><p className="section-help">Compare prices and arrange pickup directly with the seller.</p></div>
        <MarketplaceToolbar query={query} setQuery={setQuery} category={category} setCategory={setCategory} sort={sort} setSort={setSort} activeOnly={activeOnly} setActiveOnly={setActiveOnly} maxPrice={maxPrice} setMaxPrice={setMaxPrice} onClear={clearFilters} hasFilters={hasFilters} />
        {notice && <div className="notice" role="status" aria-live="polite"><span>{notice}</span><button className="icon-button notice-close" type="button" aria-label="Dismiss message" onClick={() => setNotice('')}>×</button></div>}
        <div className="results-heading" aria-live="polite"><h3>{listing.length} {listing.length === 1 ? 'item' : 'items'} found</h3><span>{activeOnly ? 'Showing active listings' : 'Showing all listings'}</span></div>
        {listing.length ? <div className="listing-grid">{listing.map((item) => <ListingCard key={item.id} item={item} onOpen={() => setSelected(item.id)} />)}</div>
          : <div className="empty-state"><span className="empty-icon" aria-hidden="true">⌕</span><h3>No matching listings</h3><p>Try a different search or clear your filters to see all items.</p><button className="button button-secondary" type="button" onClick={clearFilters}>Clear filters</button></div>}
      </section>
    </main>
    <footer className="site-footer"><a className="brand footer-brand" href="#top"><span className="brand-mark" aria-hidden="true">C</span><span>Campus <strong>Exchange</strong></span></a><span>Campus pickup · Prices in EGP</span><button className="text-button reset-button" type="button" onClick={reset}>Reset demo</button></footer>
    {selected && (() => {
      const item = items.find((entry) => entry.id === selected);
      return item ? <ListingDetailsDialog key={item.id} item={item} onClose={() => setSelected(null)} onEdit={() => startEdit(item)} onMarkSold={() => markAsSold(item)} /> : null;
    })()}
    {editor && <ListingFormDialog editor={editor} setEditor={setEditor} onSubmit={submit} onClose={requestCloseForm} errors={errors} onClearError={(field) => setErrors((current) => { const next = { ...current }; delete next[field]; return next; })} />}
  </div>;
}
