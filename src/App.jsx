import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { KEY, categories, conditions, currentUser, seed, emptyForm, cap, money, validate, saveListing, filterListings, loadItems } from './marketplace.js';

function Icon({ name, size = 20, ...props }) {
  const paths = {
    search: <><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4 4"/></>,
    plus: <path d="M12 5v14M5 12h14"/>,
    arrow: <path d="M5 12h14m-6-6 6 6-6 6"/>,
    pin: <><path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z"/><circle cx="12" cy="10" r="2"/></>,
    check: <path d="m5 12 4 4L19 6"/>,
    close: <path d="m6 6 12 12M6 18 18 6"/>,
    compare: <><path d="M8 4v16M16 4v16M4 8h8M12 16h8"/><circle cx="8" cy="8" r="2"/><circle cx="16" cy="16" r="2"/></>,
    mail: <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 6 9 7 9-7"/></>,
    box: <><path d="m12 3 9 5v9l-9 5-9-5V8l9-5Z M3 8l9 5 9-5M12 13v9M8 5l9 5"/></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>{paths[name] || paths.box}</svg>;
}

function ListingImage({ src, alt, emoji, className = '' }) {
  const [broken, setBroken] = useState(false);
  useEffect(() => setBroken(false), [src]);
  return src && !broken ? <img className={className} src={src} alt={alt} loading="lazy" onError={() => setBroken(true)}/> : <span className="image-fallback" role="img" aria-label={`${alt || 'Item'} — photo unavailable`}>{emoji || '📦'}</span>;
}

// Native dialogs keep the background inert; Tab wraps explicitly inside them.
function Modal({ title, onClose, className = '', children }) {
  const ref = useRef(null);
  const titleId = useId();
  useEffect(() => {
    const previous = document.activeElement;
    const dialog = ref.current;
    dialog.showModal();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      dialog.close();
      document.body.style.overflow = overflow;
      if (previous?.isConnected) previous.focus({ preventScroll: true });
    };
  }, []);
  function containFocus(event) {
    if (event.key !== 'Tab') return;
    const controls = Array.from(event.currentTarget.querySelectorAll('button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex="0"]'))
      .filter(control => control.getClientRects().length > 0);
    const first = controls[0];
    const last = controls.at(-1);
    if (!first) return;
    if (event.shiftKey && (document.activeElement === first || document.activeElement === event.currentTarget)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
  return <dialog ref={ref} className={`modal ${className}`} aria-labelledby={titleId} onKeyDown={containFocus} onCancel={event => { event.preventDefault(); onClose(); }} onClick={event => { if (event.target === event.currentTarget) { const box = event.currentTarget.getBoundingClientRect(); if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) onClose(); } }}>
    <div className="modal-heading"><h2 id={titleId}>{title}</h2><button className="icon-button" aria-label={`Close ${title}`} onClick={onClose}><Icon name="close"/></button></div>
    {children}
  </dialog>;
}

function SellerAction({ item, onEdit }) {
  const subject = encodeURIComponent(`Campus Exchange: ${item.title}`);
  const body = encodeURIComponent(`Hi ${item.seller},\n\nI'm interested in your listing "${item.title}" (${money(item.price)}). Is it still available?\n\n`);
  return item.owner === 'you' ? <button className="button primary" onClick={() => onEdit(item)}>Edit your listing <Icon name="arrow" size={17}/></button> : item.status === 'sold' ? <p className="helper">This item has been sold.</p> : <><a className="button primary" href={`mailto:${item.sellerEmail}?subject=${subject}&body=${body}`}><Icon name="mail" size={18}/> Contact seller</a><p className="helper">Opens your email app with a sample seller address.</p></>;
}

function Detail({ item, onClose, onEdit, compared, onCompare }) {
  const [photo, setPhoto] = useState(0);
  const images = item.photos || [];
  return <Modal title={item.title} onClose={onClose} className="detail-modal">
    <div className="detail-layout"><div><div className="detail-photo"><ListingImage src={images[photo]} alt={`${item.title}, photo ${photo + 1}`} emoji={item.emoji}/><span className={`badge ${item.status === 'sold' ? 'sold' : ''}`}>{item.status === 'sold' ? 'Sold' : cap(item.condition)}</span></div>
      {images.length > 1 && <div className="thumbnails" aria-label="Listing photos">{images.map((src, index) => <button key={index} aria-label={`Show photo ${index + 1}`} aria-pressed={index === photo} onClick={() => setPhoto(index)}><ListingImage src={src} alt="" emoji={item.emoji}/></button>)}</div>}
      {/^m\d+$/.test(item.id) && <p className="helper">Example listing photos are illustrative stock images.</p>}</div>
      <div className="detail-copy"><p className="eyebrow">{cap(item.category)} · {cap(item.condition)}</p><p className="detail-price">{money(item.price)}</p><span className={`availability ${item.status}`}>{item.status === 'sold' ? 'Sold' : 'Available'}</span><h3>About this item</h3><p className="description">{item.description || 'No description supplied.'}</p><div className="pickup"><Icon name="pin"/><div><strong>Pickup / meetup</strong><p>{item.pickup || 'Arrange directly with the seller'}</p></div></div><div className="seller"><span className="avatar">{(item.seller || 'S')[0]}</span><div><strong>{item.seller || 'Campus seller'}</strong><span>{item.owner === 'you' ? 'Your listing' : 'Campus seller'}</span></div></div><SellerAction item={item} onEdit={onEdit}/><button className="button secondary full" aria-pressed={compared} onClick={() => onCompare(item.id)}><Icon name={compared ? 'check' : 'compare'} size={17}/>{compared ? 'Remove from comparison' : 'Add to comparison'}</button></div></div>
  </Modal>;
}

function ListingEditor({ item, onClose, onSave }) {
  const [form, setForm] = useState(item ? { ...item, price: String(item.price), pickup: item.pickup || '', photos: item.photos || [] } : { ...emptyForm });
  const [errors, setErrors] = useState({});
  const [saveError, setSaveError] = useState('');
  const [photoError, setPhotoError] = useState('');
  const [reading, setReading] = useState(false);
  const formRef = useRef(null);
  const id = useId();
  const update = (key, value) => { setForm(previous => ({ ...previous, [key]: value })); setErrors(previous => ({ ...previous, [key]: undefined })); setSaveError(''); };
  const fieldProps = key => ({ id: `${id}-${key}`, 'aria-invalid': !!errors[key], 'aria-describedby': errors[key] ? `${id}-${key}-error` : undefined });
  const fieldError = key => errors[key] && <small className="field-error" id={`${id}-${key}-error`}>{errors[key]}</small>;
  async function addPhotos(event) {
    const files = Array.from(event.target.files || []);
    event.target.value = '';
    setPhotoError('');
    if (form.photos.length + files.length > 3) { setPhotoError('You can add up to 3 photos. Remove one first.'); return; }
    if (files.some(file => !['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 1024 * 1024)) { setPhotoError('Choose JPG, PNG or WebP images up to 1 MB each.'); return; }
    setReading(true);
    try {
      const photos = await Promise.all(files.map(file => new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = () => reject(new Error('Photo could not be read.')); reader.readAsDataURL(file); })));
      setForm(previous => ({ ...previous, photos: [...previous.photos, ...photos] }));
    } catch { setPhotoError('Could not read that photo. Please try another image.'); }
    finally { setReading(false); }
  }
  function submit(event) {
    event.preventDefault();
    const nextErrors = validate(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) { formRef.current.querySelector(`[id="${id}-${Object.keys(nextErrors)[0]}"]`)?.focus(); return; }
    const message = onSave(item?.id, form);
    if (message) setSaveError(message);
  }
  return <Modal title={item ? 'Edit your listing' : 'Give it a second home.'} onClose={onClose} className="editor-modal"><p className="modal-intro">{item ? 'Update your item’s details or mark it as sold.' : 'List an item for your campus community. Fields marked * are required.'}</p><form ref={formRef} onSubmit={submit} noValidate>
    <div className="form-grid">
      <label className="wide" htmlFor={`${id}-title`}>Item title *<input {...fieldProps('title')} autoFocus value={form.title} onChange={event => update('title', event.target.value)} placeholder="e.g. Calculus textbook, 8th edition" required/>{fieldError('title')}</label>
      <label htmlFor={`${id}-price`}>Price (EGP) *<input {...fieldProps('price')} type="number" min="0" step="any" inputMode="decimal" value={form.price} onChange={event => update('price', event.target.value)} placeholder="0.00" required/>{fieldError('price')}<small className="helper">Giving it away? Enter 0.</small></label>
      <label htmlFor={`${id}-category`}>Category *<select {...fieldProps('category')} value={form.category} onChange={event => update('category', event.target.value)} required><option value="">Choose a category</option>{categories.slice(1).map(value => <option key={value} value={value}>{cap(value)}</option>)}</select>{fieldError('category')}</label>
      <label className="wide" htmlFor={`${id}-condition`}>Condition *<select {...fieldProps('condition')} value={form.condition} onChange={event => update('condition', event.target.value)} required><option value="">Choose a condition</option>{conditions.map(value => <option key={value} value={value}>{cap(value)}</option>)}</select>{fieldError('condition')}</label>
      <label className="wide">Description<textarea rows="3" value={form.description} onChange={event => update('description', event.target.value)} placeholder="Share useful details: size, what’s included, and any signs of wear."/></label>
      <label className="wide">Pickup / meetup location<input value={form.pickup} onChange={event => update('pickup', event.target.value)} placeholder="e.g. Library entrance, after lectures"/></label>
      <div className="wide photo-field"><span className="field-label">Photos <span className="optional">(optional)</span></span><p className="helper">Up to 3 photos · JPG, PNG or WebP · 1 MB each</p><div className="photo-editor">{form.photos.map((src, index) => <div key={`${src.slice(-30)}-${index}`}><ListingImage src={src} alt={`Listing photo ${index + 1}`}/><button type="button" className="remove-photo" aria-label={`Remove photo ${index + 1}`} disabled={reading} onClick={() => update('photos', form.photos.filter((_, i) => i !== index))}>×</button></div>)}</div><label className="upload-button"><Icon name="plus" size={17}/>{reading ? 'Reading photos…' : 'Add photos'}<input type="file" accept="image/jpeg,image/png,image/webp" multiple disabled={reading || form.photos.length >= 3} onChange={addPhotos}/></label>{photoError && <p className="field-error" role="alert">{photoError}</p>}</div>
      <label className="wide">Seller contact email<input value={currentUser.email} readOnly/><small className="helper">Filled from your demo account. Contact opens the buyer’s email app.</small></label>
      {item && <label className="wide" htmlFor={`${id}-status`}>Listing status<select {...fieldProps('status')} value={form.status} onChange={event => update('status', event.target.value)}><option value="active">Active — available to buy</option><option value="sold">Sold — no longer available</option></select>{fieldError('status')}</label>}
    </div>
    {!!Object.values(errors).filter(Boolean).length && <p role="alert" className="error-banner">Check the highlighted fields before publishing.</p>}
    {saveError && <p role="alert" className="error-banner">{saveError}</p>}
    <div className="modal-footer"><button type="button" className="button secondary" onClick={onClose}>Cancel</button><button type="submit" className="button primary" disabled={reading}>{item ? 'Save changes' : 'Publish listing'}<Icon name="arrow" size={17}/></button></div>
  </form></Modal>;
}

const initialFilters = { query: '', category: 'all', condition: 'all', status: 'active', maxPrice: '', own: false, sort: 'featured' };
const categorySymbols = { all: '✳', textbooks: '▤', electronics: '⌘', furniture: '▱', clothing: '♧', other: '◇' };

export default function App() {
  const [items, setItems] = useState(() => { try { return loadItems(window.localStorage); } catch { return seed; } });
  const [filters, setFilters] = useState(initialFilters);
  const [modal, setModal] = useState(null);
  const [comparison, setComparison] = useState([]);
  const [notice, setNotice] = useState('');
  const [storageError, setStorageError] = useState('');
  const listing = useMemo(() => filterListings(items, filters), [items, filters]);
  const comparedItems = comparison.map(id => items.find(item => item.id === id)).filter(Boolean);
  const selectedItem = modal?.id ? items.find(item => item.id === modal.id) : null;
  const activeCount = items.filter(item => item.status === 'active').length;
  const updateFilter = (key, value) => setFilters(previous => ({ ...previous, [key]: value }));
  function browse(own = false) { setFilters({ ...initialFilters, own, status: own ? 'all' : 'active' }); document.getElementById('discover')?.scrollIntoView({ behavior: 'smooth' }); }
  function persist(next) {
    try { localStorage.setItem(KEY, JSON.stringify(next)); setItems(next); setStorageError(''); return ''; }
    catch { const message = 'Your browser could not save these changes. Storage may be full or disabled. Try fewer photos or enable browser storage, then save again.'; setStorageError(message); return message; }
  }
  function save(id, form) {
    try {
      const next = saveListing(items, id, form);
      const error = persist(next);
      if (error) return error;
      setModal(null); setFilters({ ...initialFilters, own: true, status: 'all' });
      setNotice(id ? 'Changes saved. Your listing is up to date.' : 'Your listing is live! You’ll find it in My listings.');
      // Wait for the editor to close and restore focus before moving to results.
      requestAnimationFrame(() => document.getElementById('discover')?.scrollIntoView({ behavior: 'smooth' }));
      return '';
    } catch (error) { return error.message; }
  }
  function toggleCompare(id) {
    if (comparison.includes(id)) setComparison(previous => previous.filter(value => value !== id));
    else if (comparison.length < 3) setComparison(previous => [...previous, id]);
    else setNotice('You can compare 3 items at a time. Remove one to add another.');
  }
  const filterCount = Number(filters.condition !== 'all') + Number(filters.maxPrice !== '') + Number(filters.status !== (filters.own ? 'all' : 'active'));
  return <div className="market-app">
    <a className="skip-link" href="#discover">Skip to listings</a>
    <div className="utility"><span>Good finds. Smaller footprints.</span><span><span className="status-dot"/> The student marketplace · All prices in EGP</span></div>
    <header className="navigation"><a className="brand" href="#" aria-label="Campus Exchange home" onClick={() => setFilters(initialFilters)}><span className="brand-icon">✳</span><span>campus<span className="brand-sub">exchange</span></span></a><nav aria-label="Main navigation"><button className={!filters.own ? 'nav-active' : ''} onClick={() => browse()}>Discover</button><button className={filters.own ? 'nav-active' : ''} onClick={() => browse(true)}>My listings <span className="nav-count">{items.filter(item => item.owner === 'you').length}</span></button></nav><div className="nav-actions"><span className="avatar" aria-label="Signed in as You">Y</span><button className="button primary" onClick={() => setModal({ type: 'editor' })}><Icon name="plus" size={18}/><span>Sell an item</span></button></div></header>
    <main>
      <section className="hero" aria-labelledby="hero-title"><div className="hero-copy"><p className="eyebrow"><span className="tiny-star">✳</span> LESS SPENDING. MORE LIVING.</p><h1 id="hero-title">Great finds.<br/><span>Right on campus.</span></h1><p className="hero-description">Your next semester essential is someone else’s<br className="desktop-break"/> second-hand gem. Find it here, for a little less.</p><button className="button hero-button" onClick={() => browse()}>Explore the marketplace <Icon name="arrow" size={18}/></button><p className="hero-footnote"><Icon name="pin" size={15}/> Meet nearby. Make it yours.</p></div><div className="hero-art" aria-hidden="true"><span className="orbit orbit-one"/><span className="orbit orbit-two"/><span className="art-star star-one">✳</span><span className="art-star star-two">✧</span><div className="art-card art-book"><span className="art-emoji">📚</span><div><span>A new chapter</span><strong>Textbooks, for less</strong></div></div><div className="art-card art-headphones"><span className="art-emoji">🎧</span><div><span>Less price. More play.</span><strong>Find your next favorite</strong></div></div><div className="art-note"><span>↗</span> A little pre-loved.<br/>A lot to love.</div></div></section>
      <section className="discovery" id="discover" aria-labelledby="discover-title"><div className="section-heading"><div><p className="eyebrow">{filters.own ? 'YOUR CORNER OF CAMPUS' : 'SECOND-HAND. FIRST CHOICE.'}</p><h2 id="discover-title">{filters.own ? 'My listings' : 'Find your next good thing.'}</h2></div><span className="local-label"><Icon name="pin" size={16}/> Around GUC campus</span></div>
        <div className="search-row"><label className="search"><Icon name="search"/><input aria-label="Search listings" type="search" placeholder="Try “textbook” or “headphones”" value={filters.query} onChange={event => updateFilter('query', event.target.value)}/></label><label className="sort-label">Sort by<select value={filters.sort} onChange={event => updateFilter('sort', event.target.value)}><option value="featured">Featured</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option></select></label></div>
        <div className="category-row" role="group" aria-label="Filter by category">{categories.map(category => <button key={category} aria-pressed={filters.category === category} onClick={() => updateFilter('category', category)}><span aria-hidden="true">{categorySymbols[category]}</span>{category === 'all' ? 'All items' : cap(category)}</button>)}</div>
        <div className="filter-bar"><label>Budget <span className="price-input"><span>EGP</span><input aria-label="Maximum price in EGP" type="number" min="0" step="any" placeholder="Max price" value={filters.maxPrice} onChange={event => updateFilter('maxPrice', event.target.value === '' ? '' : String(Math.max(0, Number(event.target.value))))}/></span></label><label>Condition<select value={filters.condition} onChange={event => updateFilter('condition', event.target.value)}><option value="all">Any condition</option>{conditions.map(condition => <option key={condition} value={condition}>{cap(condition)}</option>)}</select></label><label>Availability<select value={filters.status} onChange={event => updateFilter('status', event.target.value)}><option value="active">Available</option><option value="all">All listings</option><option value="sold">Sold</option></select></label>{(filterCount > 0 || filters.query || filters.category !== 'all') && <button className="text-button clear-filters" onClick={() => setFilters({ ...initialFilters, own: filters.own, status: filters.own ? 'all' : 'active' })}>Clear filters <Icon name="close" size={14}/></button>}</div>
        <div className="results-heading"><p role="status"><strong>{listing.length}</strong> {listing.length === 1 ? 'listing' : 'listings'}{filters.own ? ' from you' : ' to explore'}</p><span><Icon name="compare" size={16}/> Pick up to 3 items to compare</span></div>
        <div className="announcements" aria-live="polite">{notice && <div className="notice"><Icon name="check" size={18}/><span>{notice}</span><button className="icon-button" aria-label="Dismiss notification" onClick={() => setNotice('')}><Icon name="close" size={16}/></button></div>}</div>
        {storageError && <p className="error-banner" role="alert">{storageError}</p>}
        <div className="listing-grid">{listing.map(item => <article className={`product ${item.status === 'sold' ? 'product-sold' : ''}`} key={item.id}><button className="product-photo" onClick={() => setModal({ type: 'detail', id: item.id })} aria-label={`View ${item.title}`}><ListingImage src={item.photos?.[0]} alt={item.title} emoji={item.emoji}/><span className={`badge ${item.status === 'sold' ? 'sold' : ''}`}>{item.status === 'sold' ? 'Sold' : cap(item.condition)}</span>{item.owner === 'you' && <span className="owner-badge">Your listing</span>}</button><div className="product-body"><p className="product-category">{cap(item.category)}</p><h3><button onClick={() => setModal({ type: 'detail', id: item.id })}>{item.title}</button></h3><p className="product-price">{money(item.price)}{item.price === 0 && <span>Free to a good home</span>}</p><p className="product-pickup"><Icon name="pin" size={14}/><span>{item.pickup || 'Arrange with seller'}</span></p><div className="product-footer"><span><span className={`status-dot ${item.status}`}/>{item.status === 'sold' ? 'Sold' : 'Available'}</span><button className="compare-button" aria-label={`${comparison.includes(item.id) ? 'Remove' : 'Compare'} ${item.title}${comparison.includes(item.id) ? ' from comparison' : ''}`} aria-pressed={comparison.includes(item.id)} onClick={() => toggleCompare(item.id)}><Icon name={comparison.includes(item.id) ? 'check' : 'plus'} size={15}/>{comparison.includes(item.id) ? 'Added' : 'Compare'}</button></div></div></article>)}</div>
        {listing.length === 0 && <div className="empty-state"><Icon name="search" size={38}/><h3>{filters.own && !items.some(item => item.owner === 'you') ? 'Your first listing starts here.' : 'No finds this time.'}</h3><p>Try a different search, a higher budget or another category.</p><button className="button secondary" onClick={() => setFilters({ ...initialFilters, own: filters.own, status: filters.own ? 'all' : 'active' })}>Clear filters</button>{filters.own && <button className="button primary" onClick={() => setModal({ type: 'editor' })}>Sell an item</button>}</div>}
      </section>
      <section className="selling-banner"><div className="banner-icon" aria-hidden="true">↗</div><div><p className="eyebrow">MAKE ROOM FOR WHAT’S NEXT</p><h2>Done with it? Someone else isn’t.</h2><p>Turn the things you don’t use into someone’s next great find.</p></div><button className="button primary" onClick={() => setModal({ type: 'editor' })}>List your first item <Icon name="arrow" size={17}/></button></section>
    </main>
    <footer><div><a className="footer-brand" href="#">✳ campus exchange</a><p>From one student to the next.</p></div><div className="footer-note"><span>{activeCount} available finds · All prices in EGP</span><span>Standalone demo · Saved in this browser</span><button className="text-button" onClick={() => setModal({ type: 'reset' })}>Reset demo</button></div></footer>
    {comparedItems.length > 0 && <aside className="compare-tray" aria-label="Comparison selection"><div className="tray-summary"><Icon name="compare"/><strong>{comparedItems.length} of 3 selected</strong></div><div className="tray-items">{comparedItems.map(item => <button key={item.id} onClick={() => toggleCompare(item.id)} aria-label={`Remove ${item.title} from comparison`}>{item.title}<Icon name="close" size={14}/></button>)}</div><button className="button primary" disabled={comparedItems.length < 2} onClick={() => setModal({ type: 'compare' })}>Compare{comparedItems.length < 2 ? ' (select 2+)' : ' items'}<Icon name="arrow" size={17}/></button><button className="icon-button" aria-label="Clear comparison" onClick={() => setComparison([])}><Icon name="close" size={18}/></button></aside>}
    {modal?.type === 'detail' && selectedItem && <Detail key={selectedItem.id} item={selectedItem} compared={comparison.includes(selectedItem.id)} onCompare={toggleCompare} onClose={() => setModal(null)} onEdit={item => setModal({ type: 'editor', id: item.id })}/>}
    {modal?.type === 'editor' && <ListingEditor key={modal.id || 'new'} item={selectedItem} onClose={() => setModal(null)} onSave={save}/>}
    {modal?.type === 'compare' && <Modal title="A closer look, side by side." className="comparison-modal" onClose={() => setModal(null)}><p className="modal-intro">Compare the details. Find what works for your budget.</p><div className="table-scroll" tabIndex="0" aria-label="Scrollable item comparison"><table><caption className="sr-only">Selected listing prices, conditions, availability, pickup locations and sellers</caption><thead><tr><th scope="col">The details</th>{comparedItems.map(item => <th scope="col" key={item.id}><div className="comparison-photo"><ListingImage src={item.photos?.[0]} alt={item.title} emoji={item.emoji}/></div><button className="comparison-title" onClick={() => setModal({ type: 'detail', id: item.id })}>{item.title}<Icon name="arrow" size={15}/></button></th>)}</tr></thead><tbody>{[['Price', item => money(item.price)], ['Condition', item => cap(item.condition)], ['Availability', item => item.status === 'active' ? 'Available' : 'Sold'], ['Category', item => cap(item.category)], ['Pickup', item => item.pickup || 'Arrange with seller'], ['Seller', item => item.seller], ['Description', item => item.description || 'No description supplied.']].map(([label, value]) => <tr key={label}><th scope="row">{label}</th>{comparedItems.map(item => <td key={item.id}>{value(item)}</td>)}</tr>)}</tbody></table></div></Modal>}
    {modal?.type === 'reset' && <Modal title="Reset the demo?" className="reset-modal" onClose={() => setModal(null)}><p className="modal-intro">This removes your new listings and changes from this browser and restores the example items.</p><div className="modal-footer"><button className="button secondary" onClick={() => setModal(null)}>Keep my listings</button><button className="button primary" onClick={() => { if (!persist(seed)) { setFilters(initialFilters); setComparison([]); setModal(null); setNotice('Example listings restored.'); } }}>Reset demo</button></div>{storageError && <p className="error-banner" role="alert">{storageError}</p>}</Modal>}
  </div>;
}
