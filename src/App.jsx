import React, { useEffect, useMemo, useState } from 'react';

const KEY = 'acl-marketplace-v3';
const categories = ['all', 'textbooks', 'electronics', 'furniture', 'clothing', 'other'];
const conditions = ['new', 'like-new', 'used', 'worn'];
const currentUser = { name: 'You', email: 'you@example.com' }; // Demo account; no login backend
const photo = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=82`;
const seed = [
  { id: 'm1', title: 'Calculus II textbook', category: 'textbooks', condition: 'used', price: 320, description: 'Second-year calculus textbook, complete with all chapters. A few highlighted sections and notes in pencil, but no missing or torn pages. Useful for the midterm and final revision sessions. You can inspect it before deciding.', status: 'active', owner: 'you', seller: 'You', sellerEmail: currentUser.email, pickup: 'GUC student area, near the main cafeteria', photos: [photo('photo-1544947950-fa07a98d237f'), photo('photo-1494438639946-1ebd1d20bf85')], emoji: '📚' },
  { id: 'm2', title: 'Student desk lamp', category: 'furniture', condition: 'like-new', price: 240, description: 'Compact study lamp with warm light, adjustable position and a USB power cable. Used for one semester only. The cable and light both work. Great for a dorm desk or a small workspace.', status: 'active', owner: 'other', seller: 'Mariam', sellerEmail: 'mariam.seller@example.com', pickup: 'GUC library entrance, weekdays after 1 PM', photos: [photo('photo-1555475384-a0aefc775412')], emoji: '💡' },
  { id: 'm3', title: 'Bluetooth headphones', category: 'electronics', condition: 'used', price: 650, description: 'Wireless over-ear headphones in good working condition. They connect with Bluetooth and include the original carrying pouch and charging cable. The battery lasts about six hours based on my usage. There are a few cosmetic scratches near one hinge; see the photos. Happy to let you test sound and pairing before buying.', status: 'active', owner: 'other', seller: 'Omar', sellerEmail: 'omar.seller@example.com', pickup: 'Arrange a meetup at GUC Gate 3', photos: [photo('photo-1599955051125-571f47e04316'), photo('photo-1505740420928-5e560c06d30e'), photo('photo-1546435770-a3e426bf472b')], emoji: '🎧' },
  { id: 'm4', title: 'Engineering lab coat', category: 'clothing', condition: 'new', price: 200, description: 'White engineering lab coat, medium size, bought for a lab but never worn. Still clean and folded. Suitable for laboratory practical sessions. Please check your required size before arranging pickup.', status: 'active', owner: 'you', seller: 'You', sellerEmail: currentUser.email, pickup: 'Meet at GUC main entrance, mornings', photos: [photo('photo-1542058186993-286fdce0b580')], emoji: '🥼' },
  { id: 'm5', title: 'Drawing tablet', category: 'electronics', condition: 'like-new', price: 1450, description: 'Small USB drawing tablet with pressure-sensitive pen and protective sleeve. Used for a few class illustrations; fully functional. Works with common creative software after installing the manufacturer driver. You are welcome to try the pen and pressure sensitivity on my laptop before buying.', status: 'active', owner: 'other', seller: 'Nour', sellerEmail: 'nour.seller@example.com', pickup: 'GUC design building reception', photos: [photo('photo-1671087709820-274fdd9ac67a')], emoji: '✏️' },
  { id: 'm6', title: 'Used storage shelf', category: 'furniture', condition: 'worn', price: 390, description: 'Light wooden storage shelf. Stable and usable, though there are visible scratches from moving rooms. The shelves are best for books, stationery and small storage boxes, not very heavy appliances. Buyer should arrange a way to transport it from near campus.', status: 'active', owner: 'other', seller: 'Youssef', sellerEmail: 'youssef.seller@example.com', pickup: 'Collect from a public pickup point near GUC, by arrangement', photos: [photo('photo-1692195321701-1a454c79ab02'), photo('photo-1758279746549-d24f3784879d')], emoji: '🗄️' },
  { id: 'm7', title: 'MATH 201 workbook', category: 'textbooks', condition: 'used', price: 140, description: 'Workbook with practice problems, solutions and lecture notes. All pages present and in readable condition. Some exercises have answers written in pencil. Already sold to another student.', status: 'sold', owner: 'you', seller: 'You', sellerEmail: currentUser.email, pickup: 'GUC campus (previous listing)', photos: [photo('photo-1544947950-fa07a98d237f')], emoji: '📖' },
  { id: 'm8', title: 'Sketching kit', category: 'other', condition: 'like-new', price: 180, description: 'Charcoal pencils, graphite pencils, blending tools and an A5 sketch pad. Some pencils have been lightly used, but the set still has plenty of material for design practice and drawing assignments.', status: 'active', owner: 'other', seller: 'Salma', sellerEmail: 'salma.seller@example.com', pickup: 'Meet outside the GUC architecture studios', photos: [photo('photo-1758521232691-613561977b6a'), photo('photo-1771366629879-8b3128ee62ca')], emoji: '🎨' },
];
const emptyForm = { title: '', price: '', category: '', condition: '', description: '', pickup: '', status: 'active' };
function saved() { try { const value = JSON.parse(localStorage.getItem(KEY)); return Array.isArray(value) ? value : seed; } catch { return seed; } }
const cap = s => s === 'like-new' ? 'Like new' : (s || '').replace(/\b\w/g, m => m.toUpperCase());

// Per-field validation: each key maps to the message shown under that field.
function validate(form) {
  const errors = {};
  if (!form.title.trim()) errors.title = 'Enter a title for your item.';
  const raw = String(form.price).trim();
  if (raw === '') errors.price = 'Enter a price (0 or more).';
  else if (!Number.isFinite(Number(raw))) errors.price = 'Price must be a number.';
  else if (Number(raw) < 0) errors.price = 'Price cannot be negative.';
  if (!categories.slice(1).includes(form.category)) errors.category = 'Choose a category.';
  if (!conditions.includes(form.condition)) errors.condition = 'Choose an item condition.';
  if (!['active', 'sold'].includes(form.status)) errors.status = 'Choose a valid status.';
  return errors;
}

function ListingImage({ src, alt, emoji, className = '' }) {
  const [broken, setBroken] = useState(false);
  useEffect(() => setBroken(false), [src]);
  return src && !broken
    ? <img className={className} src={src} alt={alt} loading="lazy" onError={() => setBroken(true)} />
    : <span className="item-emoji" aria-label="Photo unavailable">{emoji || '📦'}</span>;
}

export default function App() {
  const [items, setItems] = useState(saved);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState('featured');
  const [selected, setSelected] = useState(null);
  const [editor, setEditor] = useState(null); // null or {id,form}
  const [errors, setErrors] = useState({});
  const [activePhoto, setActivePhoto] = useState(0);
  const [notice, setNotice] = useState('');
  const [accountOpen, setAccountOpen] = useState(false);
  useEffect(() => localStorage.setItem(KEY, JSON.stringify(items)), [items]);
  useEffect(() => setActivePhoto(0), [selected]);
  useEffect(() => {
    if (!accountOpen) return;
    const onDown = e => { if (!e.target.closest('.account-wrap')) setAccountOpen(false); };
    const onKey = e => { if (e.key === 'Escape') setAccountOpen(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey); };
  }, [accountOpen]);

  // Sold items always sink to the bottom, then the chosen sort is applied inside each group.
  const listing = useMemo(() => {
    const filtered = items.filter(x => (category === 'all' || x.category === category) && `${x.title} ${x.category} ${x.description}`.toLowerCase().includes(query.toLowerCase()));
    const active = filtered.filter(x => x.status !== 'sold');
    const sold = filtered.filter(x => x.status === 'sold');
    if (sort === 'low' || sort === 'high') {
      const cmp = (a, b) => sort === 'low' ? a.price - b.price : b.price - a.price;
      active.sort(cmp); sold.sort(cmp);
    }
    return [...active, ...sold];
  }, [items, category, query, sort]);

  const myActive = items.filter(x => x.owner === 'you' && x.status !== 'sold').length;
  const mySold = items.filter(x => x.owner === 'you' && x.status === 'sold').length;

  function startEdit(item) {
    if (item && item.owner !== 'you') return;
    setErrors({});
    setEditor({ id: item?.id || null, form: item ? { title: item.title, price: String(item.price), category: item.category, condition: item.condition, description: item.description, pickup: item.pickup || '', status: item.status } : { ...emptyForm } });
  }
  function updateField(field, value) {
    setEditor(s => ({ ...s, form: { ...s.form, [field]: value } }));
    setErrors(prev => {
      if (!prev[field]) return prev;
      const next = { ...prev }; delete next[field]; return next;
    });
  }
  function submit(event) {
    event.preventDefault();
    const f = editor.form;
    const found = validate(f);
    if (Object.keys(found).length) {
      setErrors(found);
      // Move focus to the first invalid control so the message is announced.
      requestAnimationFrame(() => document.querySelector('.sell-modal [aria-invalid="true"]')?.focus());
      return;
    }
    const original = editor.id ? items.find(x => x.id === editor.id) : null;
    const next = { ...f, title: f.title.trim(), price: Number(f.price), description: f.description.trim(), pickup: f.pickup.trim(), photos: original?.photos || [], emoji: original?.emoji || '📦', owner: 'you', seller: currentUser.name, sellerEmail: currentUser.email };
    if (editor.id) {
      setItems(items.map(x => x.id === editor.id ? { ...x, ...next } : x));
      setNotice('Changes saved.');
    } else {
      setItems([{ ...next, id: `m-${Date.now()}`, status: 'active' }, ...items]);
      setNotice('Item listed.');
    }
    setEditor(null); setSelected(null); setErrors({});
  }
  function reset() {
    setItems(seed); setSelected(null); setEditor(null); setErrors({});
    setQuery(''); setCategory('all'); setSort('featured'); setNotice('Example items restored.');
  }

  return <div className="market-app">
    <div className="utility"><span>Trusted by students</span><span>All prices in EGP</span></div>
    <header className="navigation">
      <button className="brand" onClick={() => { setSelected(null); setCategory('all'); }}><span className="brand-icon">✳</span> CAMPUS<span className="brand-alt">exchange</span></button>
      <div className="nav-actions">
        <span className="nav-user">Signed in as <strong>You</strong></span>
        <div className="account-wrap">
          <button
            className="usercircle"
            aria-label="Account information"
            aria-haspopup="true"
            aria-expanded={accountOpen}
            onClick={() => setAccountOpen(o => !o)}
          >Y</button>
          {accountOpen && <div className="account-pop" role="dialog" aria-label="Account information">
            <p className="section-kicker">YOUR ACCOUNT</p>
            <h3>{currentUser.name}</h3>
            <p className="account-email">{currentUser.email}</p>
            <dl className="account-stats">
              <div><dt>Active listings</dt><dd>{myActive}</dd></div>
              <div><dt>Items sold</dt><dd>{mySold}</dd></div>
            </dl>
            <button className="sell-cta account-action" onClick={() => { setAccountOpen(false); startEdit(null); }}>Sell an item</button>
          </div>}
        </div>
      </div>
    </header>
    <main>
      <section className="promo">
        <div className="promo-copy">
          <span className="tag">THE CAMPUS MARKETPLACE</span>
          <h1>Everything you need,<br /><i>right around campus.</i></h1>
          <p>Browse little finds, big essentials and almost everything in between.</p>
          <div className="hero-actions">
            <button className="hero-btn primary" onClick={() => startEdit(null)}>Sell an item</button>
            <button className="hero-btn ghost" onClick={() => document.getElementById('discover')?.scrollIntoView({ behavior: 'smooth' })}>Explore listings</button>
          </div>
        </div>
        <div className="promo-art" aria-hidden="true"><span>📚</span><span>💡</span><span>🎧</span><span>🛋️</span></div>
      </section>

      <section className="discovery" id="discover">
        <div className="discover-top">
          <div><p className="section-kicker">CURATED FOR YOUR CAMPUS</p><h2>Find something good.</h2><p>Items listed by people around you.</p></div>
          <div className="discover-right">
            <label className="search"><span>⌕</span><input aria-label="Search listings" placeholder="Search listings" value={query} onChange={e => setQuery(e.target.value)} /></label>
            <label className="sort"><span>Sort</span><select value={sort} onChange={e => setSort(e.target.value)}><option value="featured">Featured</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option></select></label>
          </div>
        </div>
        <div className="category-row">{categories.map(c => <button key={c} onClick={() => setCategory(c)} className={category === c ? 'on' : ''}>{c === 'all' ? 'All items' : cap(c)}</button>)}</div>
        {notice && <p className="notice" role="status">{notice} <button aria-label="Dismiss message" onClick={() => setNotice('')}>×</button></p>}
        <div className="listing-grid">
          {listing.map(item => <article className={item.status === 'sold' ? 'product is-sold' : 'product'} key={item.id}>
            <button className="photo" onClick={() => setSelected(item.id)} aria-label={`View ${item.title}`}>
              <ListingImage src={item.photos?.[0]} alt={item.title} emoji={item.emoji} className="listing-img" />
              <span className={`badge badge-${item.condition}`}>{cap(item.condition)}</span>
              {item.status === 'sold' && <span className="sold-overlay"><span>Sold</span></span>}
            </button>
            <div className="prod-details">
              <div className="prod-title-row">
                <h3>{item.title}</h3>
                <span className="prod-category">{cap(item.category)}</span>
              </div>
              <p>{item.description || 'No description supplied.'}</p>
              <div className="costline"><strong>EGP {item.price.toLocaleString()}</strong></div>
            </div>
          </article>)}
          {listing.length === 0 && <p className="noresults">No listings match your search.</p>}
        </div>
      </section>

      <footer><strong>CAMPUS exchange</strong><span>From students, for students.</span><button onClick={reset}>Reset demo</button></footer>
    </main>

    {selected && (() => {
      const item = items.find(x => x.id === selected); if (!item) return null;
      const images = item.photos || [];
      const subject = encodeURIComponent(`Campus Exchange: ${item.title}`);
      const body = encodeURIComponent(`Hi ${item.seller},\n\nI'm interested in your listing "${item.title}" (EGP ${item.price}). Is it still available?\n\n`);
      return <div className="overlay" onMouseDown={e => e.target === e.currentTarget && setSelected(null)}>
        <section className="detail-panel" role="dialog" aria-modal="true" aria-label="Item details">
          <button className="close" aria-label="Close item details" onClick={() => setSelected(null)}>×</button>
          <div className="detail-visual">
            <ListingImage src={images[activePhoto] || images[0]} alt={`${item.title} photo ${activePhoto + 1}`} emoji={item.emoji} className="detail-img" />
            {item.status === 'sold' && <span className="sold-overlay"><span>Sold</span></span>}
          </div>
          {images.length > 1 && <div className="detail-thumbs" aria-label="Item photos">{images.map((src, index) => <button type="button" key={index} className={activePhoto === index ? 'thumb active' : 'thumb'} aria-label={`Show photo ${index + 1} of ${images.length}`} aria-pressed={activePhoto === index} onClick={() => setActivePhoto(index)}><ListingImage src={src} alt="" emoji={item.emoji} className="thumb-img" /></button>)}</div>}
          <p className="section-kicker">{cap(item.category)} · {cap(item.condition)}</p>
          <h2>{item.title}</h2>
          <h3>EGP {item.price.toLocaleString()}</h3>
          <p className="item-description">{item.description || 'No description supplied.'}</p>
          <div className="detail-meta"><p><strong>Pickup</strong><br />{item.pickup || 'Arrange directly with seller'}</p><p><strong>Seller</strong><br />{item.seller}</p></div>
          {item.owner === 'you'
            ? <button className="sell-cta detail-action" onClick={() => startEdit(item)}>Edit your listing</button>
            : item.status === 'sold'
              ? <p className="fineprint sold-note">This item is marked as sold.</p>
              : <a className="sell-cta contact-seller" href={`mailto:${item.sellerEmail}?subject=${subject}&body=${body}`}>✉ Contact seller</a>}
        </section>
      </div>;
    })()}

    {editor && <div className="overlay" onMouseDown={e => e.target === e.currentTarget && setEditor(null)}>
      <section className="sell-modal" role="dialog" aria-modal="true" aria-label={editor.id ? 'Edit item' : 'Sell item'}>
        <div className="modal-head">
          <div><p className="section-kicker">CAMPUS EXCHANGE</p><h2>{editor.id ? 'Edit your listing' : 'Sell an item'}</h2><p>Add the details and we'll take care of the rest.</p></div>
          <button className="close" aria-label="Close form" onClick={() => setEditor(null)}>×</button>
        </div>
        <form onSubmit={submit} noValidate>
          <div className="field-grid">
            <label>
              <span>Item title *</span>
              <input value={editor.form.title} onChange={e => updateField('title', e.target.value)} placeholder="What are you selling?" aria-invalid={Boolean(errors.title)} aria-describedby={errors.title ? 'err-title' : undefined} />
              {errors.title && <small className="field-error" id="err-title" role="alert">{errors.title}</small>}
            </label>
            <label>
              <span>Price (EGP) *</span>
              <input type="number" min="0" step="0.01" value={editor.form.price} onChange={e => updateField('price', e.target.value)} placeholder="Price" aria-invalid={Boolean(errors.price)} aria-describedby={errors.price ? 'err-price' : undefined} />
              {errors.price && <small className="field-error" id="err-price" role="alert">{errors.price}</small>}
            </label>
            <label>
              <span>Category *</span>
              <select value={editor.form.category} onChange={e => updateField('category', e.target.value)} aria-invalid={Boolean(errors.category)} aria-describedby={errors.category ? 'err-category' : undefined}>
                <option value="">Select</option>
                {categories.slice(1).map(c => <option value={c} key={c}>{cap(c)}</option>)}
              </select>
              {errors.category && <small className="field-error" id="err-category" role="alert">{errors.category}</small>}
            </label>
            <label>
              <span>Condition *</span>
              <select value={editor.form.condition} onChange={e => updateField('condition', e.target.value)} aria-invalid={Boolean(errors.condition)} aria-describedby={errors.condition ? 'err-condition' : undefined}>
                <option value="">Select</option>
                {conditions.map(c => <option value={c} key={c}>{cap(c)}</option>)}
              </select>
              {errors.condition && <small className="field-error" id="err-condition" role="alert">{errors.condition}</small>}
            </label>
            <label className="wide">
              <span>Description</span>
              <textarea value={editor.form.description} onChange={e => updateField('description', e.target.value)} placeholder="Description" rows="5" />
            </label>
            <label className="wide">
              <span>Pickup / meetup location</span>
              <input value={editor.form.pickup} onChange={e => updateField('pickup', e.target.value)} placeholder="e.g. Library entrance or arrange on campus" />
            </label>
            <label className="wide">
              <span>Seller contact email</span>
              <input value={currentUser.email} readOnly aria-readonly="true" className="readonly-input" />
              <small className="email-helper">Taken from your registered account, so buyers can contact you about this item.</small>
            </label>
            {editor.id && <label>
              <span>Status</span>
              <select value={editor.form.status} onChange={e => updateField('status', e.target.value)} aria-invalid={Boolean(errors.status)} aria-describedby={errors.status ? 'err-status' : undefined}>
                <option value="active">Active</option>
                <option value="sold">Sold</option>
              </select>
              {errors.status && <small className="field-error" id="err-status" role="alert">{errors.status}</small>}
            </label>}
          </div>
          <div className="modal-foot">
            <button type="button" className="cancel-btn" onClick={() => setEditor(null)}>Cancel</button>
            <button className="sell-cta" type="submit">{editor.id ? 'Save changes' : 'Publish item'}</button>
          </div>
        </form>
      </section>
    </div>}
  </div>;
}