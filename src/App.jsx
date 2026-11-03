import React, { useEffect, useMemo, useRef, useState } from 'react';

const KEY = 'acl-marketplace-v3';
const categories = ['all', 'textbooks', 'electronics', 'furniture', 'clothing', 'other'];
const conditions = ['new', 'like-new', 'used', 'worn'];
const currentUser = {name: 'You', email: 'you@example.com'}; // Demo account; no login backend
const photo = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=82`;
const seed = [
  {id:'m1', title:'Calculus II textbook', category:'textbooks', condition:'used', price:320, description:'Second-year calculus textbook, complete with all chapters. A few highlighted sections and notes in pencil, but no missing or torn pages. Useful for the midterm and final revision sessions. You can inspect it before deciding.', status:'active', owner:'you', seller:'You', sellerEmail:currentUser.email, pickup:'GUC student area, near the main cafeteria', photos:[photo('photo-1544947950-fa07a98d237f'),photo('photo-1494438639946-1ebd1d20bf85')], emoji:'📚'},
  {id:'m2', title:'Student desk lamp', category:'furniture', condition:'like-new', price:240, description:'Compact study lamp with warm light, adjustable position and a USB power cable. Used for one semester only. The cable and light both work. Great for a dorm desk or a small workspace.', status:'active', owner:'other', seller:'Mariam', sellerEmail:'mariam.seller@example.com', pickup:'GUC library entrance, weekdays after 1 PM', photos:[photo('photo-1555475384-a0aefc775412')], emoji:'💡'},
  {id:'m3', title:'Bluetooth headphones', category:'electronics', condition:'used', price:650, description:'Wireless over-ear headphones in good working condition. They connect with Bluetooth and include the original carrying pouch and charging cable. The battery lasts about six hours based on my usage. There are a few cosmetic scratches near one hinge; see the photos. Happy to let you test sound and pairing before buying.', status:'active', owner:'other', seller:'Omar', sellerEmail:'omar.seller@example.com', pickup:'Arrange a meetup at GUC Gate 3', photos:[photo('photo-1599955051125-571f47e04316'),photo('photo-1505740420928-5e560c06d30e'),photo('photo-1546435770-a3e426bf472b')], emoji:'🎧'},
  {id:'m4', title:'Engineering lab coat', category:'clothing', condition:'new', price:200, description:'White engineering lab coat, medium size, bought for a lab but never worn. Still clean and folded. Suitable for laboratory practical sessions. Please check your required size before arranging pickup.', status:'active', owner:'you', seller:'You', sellerEmail:currentUser.email, pickup:'Meet at GUC main entrance, mornings', photos:[photo('photo-1542058186993-286fdce0b580')], emoji:'🥼'},
  {id:'m5', title:'Drawing tablet', category:'electronics', condition:'like-new', price:1450, description:'Small USB drawing tablet with pressure-sensitive pen and protective sleeve. Used for a few class illustrations; fully functional. Works with common creative software after installing the manufacturer driver. You are welcome to try the pen and pressure sensitivity on my laptop before buying.', status:'active', owner:'other', seller:'Nour', sellerEmail:'nour.seller@example.com', pickup:'GUC design building reception', photos:[photo('photo-1671087709820-274fdd9ac67a')], emoji:'✏️'},
  {id:'m6', title:'Used storage shelf', category:'furniture', condition:'worn', price:390, description:'Light wooden storage shelf. Stable and usable, though there are visible scratches from moving rooms. The shelves are best for books, stationery and small storage boxes, not very heavy appliances. Buyer should arrange a way to transport it from near campus.', status:'active', owner:'other', seller:'Youssef', sellerEmail:'youssef.seller@example.com', pickup:'Collect from a public pickup point near GUC, by arrangement', photos:[photo('photo-1692195321701-1a454c79ab02'),photo('photo-1758279746549-d24f3784879d')], emoji:'🗄️'},
  {id:'m7', title:'MATH 201 workbook', category:'textbooks', condition:'used', price:140, description:'Workbook with practice problems, solutions and lecture notes. All pages present and in readable condition. Some exercises have answers written in pencil. Already sold to another student.', status:'sold', owner:'you', seller:'You', sellerEmail:currentUser.email, pickup:'GUC campus (previous listing)', photos:[photo('photo-1544947950-fa07a98d237f')], emoji:'📖'},
  {id:'m8', title:'Sketching kit', category:'other', condition:'like-new', price:180, description:'Charcoal pencils, graphite pencils, blending tools and an A5 sketch pad. Some pencils have been lightly used, but the set still has plenty of material for design practice and drawing assignments.', status:'active', owner:'other', seller:'Salma', sellerEmail:'salma.seller@example.com', pickup:'Meet outside the GUC architecture studios', photos:[photo('photo-1758521232691-613561977b6a'),photo('photo-1771366629879-8b3128ee62ca')], emoji:'🎨'},
];
const emptyForm = { title: '', price: '', category: '', condition: '', description: '', pickup: '', status: 'active' };
const conditionHelp = { new: 'Unused, in original condition.', 'like-new': 'Lightly used, with almost no visible wear.', used: 'Works as expected, with some signs of use.', worn: 'Noticeable wear; describe any faults below.' };
const money = value => `EGP ${value.toLocaleString('en-EG', { maximumFractionDigits: 2 })}`;
const cap = s => s === 'like-new' ? 'Like new' : (s || '').replace(/\b\w/g, m => m.toUpperCase());
function saved() {
  try { const value = JSON.parse(localStorage.getItem(KEY)); return Array.isArray(value) ? value : seed; }
  catch { return seed; }
}
function validate(form) {
  const errors = {};
  if (!form.title.trim()) errors.title = 'Enter an item title.';
  if (form.price.trim() === '' || !Number.isFinite(Number(form.price)) || Number(form.price) < 0)
    errors.price = 'Enter a numeric price of zero or more.';
  if (!categories.slice(1).includes(form.category)) errors.category = 'Choose a category.';
  if (!conditions.includes(form.condition)) errors.condition = 'Choose the item’s condition.';
  if (!['active', 'sold'].includes(form.status)) errors.status = 'Choose a valid status.';
  return errors;
}
function ListingImage({ src, alt, emoji, className = '' }) {
  const [broken, setBroken] = useState(false);
  useEffect(() => setBroken(false), [src]);
  return src && !broken
    ? <img className={className} src={src} alt={alt} loading="lazy" onError={() => setBroken(true)} />
    : <span className="item-emoji" role="img" aria-label={`${alt || 'Item'}: photo unavailable`}>{emoji || '📦'}</span>;
}

// One dialog at a time: focus stays inside and returns to the triggering control.
function Dialog({ title, onClose, children, className = '', initialFocus }) {
  const panel = useRef(null);
  const close = useRef(onClose);
  close.current = onClose;
  useEffect(() => {
    const previous = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const root = document.querySelector('.market-content');
    if (root) root.inert = true;
    const box = panel.current;
    (box.querySelector(initialFocus || '[data-close]') || box).focus();
    function keydown(event) {
      if (event.key === 'Escape') { event.preventDefault(); close.current(); }
      if (event.key !== 'Tab') return;
      const controls = [...box.querySelectorAll('button, a[href], input, select, textarea, [tabindex="0"]')].filter(el => !el.disabled && el.getClientRects().length);
      const first = controls[0], last = controls[controls.length - 1];
      if (!first) { event.preventDefault(); box.focus(); }
      else if (event.shiftKey && (document.activeElement === first || document.activeElement === box)) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
    document.addEventListener('keydown', keydown);
    return () => {
      document.removeEventListener('keydown', keydown);
      document.body.style.overflow = overflow;
      if (root) root.inert = false;
      if (previous?.isConnected) previous.focus();
      else document.getElementById('sell-button')?.focus();
    };
  }, []);
  return <div className="overlay" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
    <section ref={panel} className={className} role="dialog" aria-modal="true" aria-label={title} tabIndex={-1}>
      <button type="button" data-close className="close" aria-label={`Close ${title.toLowerCase()}`} onClick={onClose}>×</button>
      {children}
    </section>
  </div>;
}

export default function App() {
  const [items, setItems] = useState(saved);
  const [view, setView] = useState('browse');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [condition, setCondition] = useState('all');
  const [budget, setBudget] = useState('');
  const [availability, setAvailability] = useState('active');
  const [sort, setSort] = useState('featured');
  const [selected, setSelected] = useState(null);
  const [editor, setEditor] = useState(null);
  const [errors, setErrors] = useState({});
  const [activePhoto, setActivePhoto] = useState(0);
  const [notice, setNotice] = useState(null);
  const [resetOpen, setResetOpen] = useState(false);
  const [storageError, setStorageError] = useState('');
  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(items)); setStorageError(''); }
    catch { setStorageError('Your browser could not save these changes. Keep this page open; updates may be lost after refreshing.'); }
  }, [items]);
  useEffect(() => setActivePhoto(0), [selected]);
  const budgetInvalid = budget !== '' && (!Number.isFinite(Number(budget)) || Number(budget) < 0);
  const hasFilters = query !== '' || category !== 'all' || condition !== 'all' || budget !== '' || availability !== (view === 'mine' ? 'all' : 'active') || sort !== 'featured';
  const listing = useMemo(() => {
    const result = items.filter(item =>
      (view !== 'mine' || item.owner === 'you') &&
      (category === 'all' || item.category === category) &&
      (condition === 'all' || item.condition === condition) &&
      (availability === 'all' || item.status === availability) &&
      (budget === '' || budgetInvalid || item.price <= Number(budget)) &&
      `${item.title} ${item.category} ${item.description}`.toLowerCase().includes(query.trim().toLowerCase()));
    if (sort === 'low') result.sort((a, b) => a.price - b.price);
    if (sort === 'high') result.sort((a, b) => b.price - a.price);
    return result;
  }, [items, view, category, condition, availability, budget, budgetInvalid, query, sort]);
  const ownedCount = items.filter(item => item.owner === 'you').length;
  function clearFilters(nextView = view) {
    setQuery(''); setCategory('all'); setCondition('all'); setBudget('');
    setAvailability(nextView === 'mine' ? 'all' : 'active'); setSort('featured');
  }
  function navigate(nextView) { setView(nextView); clearFilters(nextView); setSelected(null); }
  function startEdit(item) {
    if (item && item.owner !== 'you') return;
    setSelected(null); setErrors({});
    setEditor({ id: item?.id || null, form: item ? { title: item.title, price: String(item.price), category: item.category, condition: item.condition, description: item.description || '', pickup: item.pickup || '', status: item.status } : { ...emptyForm } });
  }
  function update(field, value) {
    setEditor(current => ({ ...current, form: { ...current.form, [field]: value } }));
    setErrors(current => ({ ...current, [field]: undefined }));
  }
  function submit(event) {
    event.preventDefault();
    const form = editor.form;
    const nextErrors = validate(form);
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      document.getElementById(`field-${Object.keys(nextErrors)[0]}`)?.focus();
      return;
    }
    const original = editor.id ? items.find(item => item.id === editor.id) : null;
    if (editor.id && (!original || original.owner !== 'you')) return;
    const next = { ...form, title: form.title.trim(), price: Number(form.price), description: form.description.trim(), pickup: form.pickup.trim(), photos: original?.photos || [], emoji: original?.emoji || '📦', owner: 'you', seller: currentUser.name, sellerEmail: currentUser.email };
    if (original) {
      setItems(current => current.map(item => item.id === original.id ? { ...item, ...next } : item));
      setNotice({ text: 'Changes saved. Your updated listing is in My listings.' });
    } else {
      setItems(current => [{ ...next, id: `m-${crypto.randomUUID()}`, status: 'active' }, ...current]);
      setNotice({ text: 'Your item is published and available to buyers.' });
    }
    setEditor(null); navigate('mine');
  }
  function markSold(item) {
    if (item.owner !== 'you' || item.status !== 'active') return;
    setItems(current => current.map(book => book.id === item.id && book.owner === 'you' ? { ...book, status: 'sold' } : book));
    setNotice({ text: `“${item.title}” marked as sold.`, undoId: item.id });
  }
  function undoSold() {
    setItems(current => current.map(item => item.id === notice.undoId && item.owner === 'you' ? { ...item, status: 'active' } : item));
    setNotice({ text: 'Listing restored to active.' });
  }
  function reset() {
    setItems(seed); setResetOpen(false); navigate('browse');
    setNotice({ text: 'Example items restored.' });
  }
  function fieldProps(field) {
    return { id: `field-${field}`, name: field, value: editor.form[field], onChange: event => update(field, event.target.value), 'aria-invalid': !!errors[field], 'aria-describedby': [errors[field] && `error-${field}`, field === 'condition' && 'condition-help', field === 'price' && 'price-help'].filter(Boolean).join(' ') || undefined };
  }
  const fieldError = field => errors[field] ? <small className="field-error" id={`error-${field}`}>{errors[field]}</small> : null;
  const item = items.find(entry => entry.id === selected);
  return <div className="market-app">
    <div className="market-content">
      <a className="skip-link" href="#discover">Skip to listings</a>
      <div className="utility"><span>Campus Exchange</span><span>From students, for students • All prices in EGP</span></div>
      <header className="navigation">
        <button className="brand" onClick={() => navigate('browse')} aria-label="Campus Exchange home"><span className="brand-icon">✳</span> CAMPUS<span className="brand-alt">exchange</span></button>
        <nav aria-label="Main navigation">
          <button className={view === 'browse' ? 'nav-current' : ''} aria-current={view === 'browse' ? 'page' : undefined} onClick={() => navigate('browse')}>Browse items</button>
          <button className={view === 'mine' ? 'nav-current' : ''} aria-current={view === 'mine' ? 'page' : undefined} onClick={() => navigate('mine')}>My listings <span className="count-pill">{ownedCount}</span></button>
        </nav>
        <div className="nav-actions"><span className="usercircle" aria-label="Signed in as You">Y</span><button id="sell-button" className="sell-cta" onClick={() => startEdit(null)}>+ Sell an item</button></div>
      </header>
      <main>
        {view === 'browse' && <section className="promo">
          <div className="promo-copy"><span className="tag">THE CAMPUS MARKETPLACE</span><h1>Good finds.<br/><i>Student-friendly prices.</i></h1><p>Find your next campus essential, or give yours a second home.</p><button onClick={() => { document.getElementById('discover')?.scrollIntoView({ behavior: 'smooth' }); document.getElementById('search-listings')?.focus({ preventScroll: true }); }}>Find an item <span>↗</span></button></div>
          <div className="promo-art" aria-hidden="true"><span>📚</span><span>💡</span><span>🎧</span><span>🛋️</span></div>
        </section>}
        <section className="discovery" id="discover" tabIndex={-1}>
          <div className="discover-top"><div><p className="section-kicker">{view === 'mine' ? 'YOUR CAMPUS SHOP' : 'SECOND-HAND, FIRST CHOICE'}</p><h2>{view === 'mine' ? 'My listings' : 'Find something good.'}</h2><p>{view === 'mine' ? 'Manage your items, edit details and update availability.' : 'Compare prices, check the condition and arrange a campus pickup.'}</p></div>
            <label className="search" htmlFor="search-listings"><span aria-hidden="true">⌕</span><input id="search-listings" type="search" placeholder="Search items or keywords" value={query} onChange={event => setQuery(event.target.value)} /><span className="sr-only">Search listings</span></label>
          </div>
          <div className="category-row" aria-label="Filter by category">{categories.map(value => <button key={value} aria-pressed={category === value} className={category === value ? 'on' : ''} onClick={() => setCategory(value)}>{value === 'all' ? 'All categories' : cap(value)}</button>)}</div>
          <div className="filter-bar">
            <label><span>Maximum price (EGP)</span><input type="number" min="0" step="any" placeholder="Any budget" value={budget} onChange={event => setBudget(event.target.value)} aria-invalid={budgetInvalid} aria-describedby={budgetInvalid ? 'budget-error' : undefined}/></label>
            <label><span>Condition</span><select aria-label="Condition" value={condition} onChange={event => setCondition(event.target.value)}><option value="all">Any condition</option>{conditions.map(value => <option key={value} value={value}>{cap(value)}</option>)}</select></label>
            <label><span>Availability</span><select aria-label="Availability" value={availability} onChange={event => setAvailability(event.target.value)}><option value="active">Available items</option><option value="all">Available & sold</option><option value="sold">Sold items</option></select></label>
            <label><span>Sort by</span><select aria-label="Sort by" value={sort} onChange={event => setSort(event.target.value)}><option value="featured">Default order</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option></select></label>
            <button className="text-button clear-filters" disabled={!hasFilters} onClick={() => clearFilters()}>Clear filters</button>
          </div>
          {budgetInvalid && <p className="field-error" id="budget-error" role="alert">Enter a maximum price of zero or more. The budget filter is not applied until corrected.</p>}
          <div className="results-heading"><p role="status">{listing.length} {listing.length === 1 ? 'item' : 'items'} {view === 'mine' ? 'in your listings' : 'found'}</p>{availability === 'active' && <span>Showing available items</span>}</div>
          {storageError && <p className="alert" role="alert">{storageError}</p>}
          {notice && <div className="notice"><span role="status">{notice.text}</span><div>{notice.undoId && <button className="text-button" onClick={undoSold}>Undo</button>}<button className="dismiss" aria-label="Dismiss notification" onClick={() => setNotice(null)}>×</button></div></div>}
          <div className="listing-grid">{listing.map(entry => <article className={`product ${entry.status === 'sold' ? 'product-sold' : ''}`} key={entry.id}>
            <button className="photo" onClick={() => setSelected(entry.id)} aria-label={`View ${entry.title}`}><ListingImage src={entry.photos?.[0]} alt={entry.title} emoji={entry.emoji} className="listing-img"/><span className="stamp">{cap(entry.condition)}</span>{entry.status === 'sold' && <span className="sold-ribbon">Sold</span>}</button>
            <div className="prod-details"><div className="prod-topline"><span>{cap(entry.category)}</span><span className={entry.status === 'sold' ? 'soldstatus' : 'instock'}>{entry.status === 'sold' ? 'Sold' : 'Available'}</span></div><h3>{entry.title}</h3><strong className="item-price">{money(entry.price)}</strong><p className="pickup-preview" title={entry.pickup || 'Arrange with seller'}>Pickup: {entry.pickup || 'Arrange with seller'}</p><p className="seller-line">{entry.owner === 'you' ? <span className="owner-badge">Your listing</span> : `Listed by ${entry.seller}`}</p><button className="details-button" onClick={() => setSelected(entry.id)}>View item <span aria-hidden="true">↗</span></button>
              {entry.owner === 'you' && <div className="owner-actions"><button onClick={() => startEdit(entry)} aria-label={`Edit ${entry.title}`}>Edit</button>{entry.status === 'active' && <button onClick={() => markSold(entry)} aria-label={`Mark ${entry.title} as sold`}>Mark as sold</button>}</div>}
            </div>
          </article>)}</div>
          {listing.length === 0 && <div className="empty-state"><span aria-hidden="true">{view === 'mine' && ownedCount === 0 ? '📦' : '⌕'}</span><h3>{view === 'mine' && ownedCount === 0 ? 'Give an item a second home.' : 'No items match these filters.'}</h3><p>{view === 'mine' && ownedCount === 0 ? 'Publish your first listing to start selling on campus.' : 'Try a different search, a larger budget or fewer filters.'}</p>{view === 'mine' && ownedCount === 0 ? <button className="sell-cta" onClick={() => startEdit(null)}>Sell your first item</button> : <button className="sell-cta" onClick={() => clearFilters()}>Clear filters</button>}</div>}
        </section>
        <footer><strong>CAMPUS exchange</strong><span>From students, for students.</span><button onClick={() => setResetOpen(true)}>Reset demo</button></footer>
      </main>
    </div>
    {item && !editor && <Dialog title="Item details" onClose={() => setSelected(null)} className="detail-panel">
      <div className="detail-visual"><ListingImage src={item.photos?.[activePhoto] || item.photos?.[0]} alt={`${item.title} photo ${activePhoto + 1}`} emoji={item.emoji} className="detail-img"/></div>
      {item.photos?.length > 1 && <div className="detail-thumbs" aria-label="Item photos">{item.photos.map((src, index) => <button type="button" key={index} className={activePhoto === index ? 'thumb active' : 'thumb'} aria-label={`Show photo ${index + 1} of ${item.photos.length}`} aria-pressed={activePhoto === index} onClick={() => setActivePhoto(index)}><ListingImage src={src} alt="" emoji={item.emoji} className="thumb-img"/></button>)}</div>}
      <p className="section-kicker">{cap(item.category)} · {cap(item.condition)}</p><h2>{item.title}</h2><h3>{money(item.price)}</h3><span className={`status-badge ${item.status === 'sold' ? 'soldstatus' : 'instock'}`}>{item.status === 'sold' ? 'Sold' : 'Available'}</span><p className="item-description">{item.description || 'No description supplied.'}</p>
      <div className="detail-meta"><p><strong>Pickup</strong><br/>{item.pickup || 'Arrange directly with seller'}</p><p><strong>Seller</strong><br/>{item.seller}{item.owner === 'you' ? ' (your listing)' : ''}</p></div>
      {item.owner === 'you' ? <div className="detail-actions"><button className="sell-cta" onClick={() => startEdit(item)}>Edit your listing</button>{item.status === 'active' && <button className="secondary-button" onClick={() => { markSold(item); setSelected(null); }}>Mark as sold</button>}</div> : item.status === 'sold' ? <p className="fineprint">This item has been sold and is no longer available.</p> : <><a className="sell-cta contact-seller" href={`mailto:${item.sellerEmail}?subject=${encodeURIComponent(`Campus Exchange: ${item.title}`)}&body=${encodeURIComponent(`Hi ${item.seller},\n\nI'm interested in your listing "${item.title}" (${money(item.price)}). Is it still available?\n\n`)}`}>✉ Contact seller</a><p className="fineprint">Opens your default email app with a draft. This demo uses sample email addresses.</p></>}
    </Dialog>}
    {editor && <Dialog title={editor.id ? 'Edit item' : 'Sell item'} onClose={() => setEditor(null)} className="sell-modal" initialFocus="#field-title">
      <div className="modal-head"><p className="section-kicker">CAMPUS EXCHANGE</p><h2>{editor.id ? 'Edit your listing' : 'Sell an item'}</h2><p>{editor.id ? 'Keep your details and availability up to date.' : 'Add your item details. New listings are available immediately.'}</p></div>
      <form onSubmit={submit} noValidate><p className="form-note">Fields marked * are required.</p><h3 className="form-section-title">Item essentials</h3><div className="field-grid">
        <label className="wide"><span>Item title *</span><input {...fieldProps('title')} required placeholder="e.g. Calculus II textbook"/>{fieldError('title')}</label>
        <label><span>Price (EGP) *</span><input {...fieldProps('price')} type="number" min="0" step="any" required placeholder="e.g. 250"/><small id="price-help">Enter 0 if you are giving it away for free.</small>{fieldError('price')}</label>
        <label><span>Category *</span><select {...fieldProps('category')} required><option value="">Choose a category</option>{categories.slice(1).map(value => <option key={value} value={value}>{cap(value)}</option>)}</select>{fieldError('category')}</label>
        <label className="wide"><span>Condition *</span><select {...fieldProps('condition')} required><option value="">Choose a condition</option>{conditions.map(value => <option key={value} value={value}>{cap(value)} — {conditionHelp[value]}</option>)}</select><small id="condition-help">{conditionHelp[editor.form.condition] || 'Choose the description that best matches your item.'}</small>{fieldError('condition')}</label>
      </div><h3 className="form-section-title">Details & pickup</h3><div className="field-grid">
        <label className="wide"><span>Description <span className="optional">(optional)</span></span><textarea {...fieldProps('description')} placeholder="Mention size, included accessories, wear or any faults." rows="4"/></label>
        <label className="wide"><span>Pickup / meetup location <span className="optional">(optional)</span></span><input {...fieldProps('pickup')} placeholder="e.g. Library entrance, weekdays after 1 PM"/><small>Leave blank to arrange directly with the buyer.</small></label>
        <label className="wide"><span>Seller contact email</span><input value={currentUser.email} readOnly aria-readonly="true" className="readonly-input"/><small className="email-helper">Filled from your demo account. Buyers contact you through their email app.</small></label>
        {editor.id && <label className="wide"><span>Availability</span><select {...fieldProps('status')}><option value="active">Active — available to buyers</option><option value="sold">Sold — no longer available</option></select>{fieldError('status')}</label>}
      </div>{Object.values(errors).some(Boolean) && <p className="alert" role="alert">Please correct the highlighted fields before saving.</p>}<div className="modal-foot"><button type="button" onClick={() => setEditor(null)}>Cancel</button><button className="sell-cta" type="submit">{editor.id ? 'Save changes' : 'Publish item'}</button></div></form>
    </Dialog>}
    {resetOpen && <Dialog title="Reset demo" onClose={() => setResetOpen(false)} className="reset-modal"><p className="section-kicker">START FRESH</p><h2>Reset the demo?</h2><p>This removes your new listings and edits, and restores the original example items. This cannot be undone.</p><div className="modal-foot"><button autoFocus onClick={() => setResetOpen(false)}>Keep my changes</button><button className="sell-cta" onClick={reset}>Reset demo</button></div></Dialog>}
  </div>;
}
