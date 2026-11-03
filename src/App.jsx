import React, { useEffect, useMemo, useState } from 'react';

const KEY = 'acl-marketplace-v3';
const categories = ['all', 'textbooks', 'electronics', 'furniture', 'clothing', 'other'];
const conditions = ['new', 'like-new', 'used', 'worn'];
const priceRanges = [
  { id: 'all', label: 'Any price' },
  { id: 'under250', label: '< 250 EGP' },
  { id: 'under500', label: '< 500 EGP' },
  { id: 'over500', label: '500+ EGP' },
];

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

function saved() {
  try {
    const value = JSON.parse(localStorage.getItem(KEY));
    return Array.isArray(value) ? value : seed;
  } catch {
    return seed;
  }
}

const cap = (s) => (s === 'like-new' ? 'Like new' : (s || '').replace(/\b\w/g, (m) => m.toUpperCase()));

function validateForm(form) {
  const errors = {};
  if (!form.title || !form.title.trim()) {
    errors.title = 'Please enter an item title.';
  }
  if (
    form.price === '' ||
    form.price === undefined ||
    form.price === null ||
    !Number.isFinite(Number(form.price)) ||
    Number(form.price) < 0
  ) {
    errors.price = 'Enter a valid price of zero or more.';
  }
  if (!categories.slice(1).includes(form.category)) {
    errors.category = 'Please choose a category.';
  }
  if (!conditions.includes(form.condition)) {
    errors.condition = 'Please choose an item condition.';
  }
  if (!['active', 'sold'].includes(form.status)) {
    errors.status = 'Please choose a valid status.';
  }
  return errors;
}

function CloseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
      <path d="M1 1l12 12M13 1L1 13" />
    </svg>
  );
}

function ListingImage({ src, alt, emoji, className = '' }) {
  const [broken, setBroken] = useState(false);
  useEffect(() => setBroken(false), [src]);
  return src && !broken ? (
    <img className={className} src={src} alt={alt} loading="lazy" onError={() => setBroken(true)} />
  ) : (
    <span className="item-emoji" aria-label="Photo unavailable">
      {emoji || '📦'}
    </span>
  );
}

export default function App() {
  const [items, setItems] = useState(saved);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState('featured');
  const [selected, setSelected] = useState(null);
  const [editor, setEditor] = useState(null); // null or {id,form}
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [activePhoto, setActivePhoto] = useState(0);
  const [notice, setNotice] = useState('');

  // Quick filters state
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [onlyMine, setOnlyMine] = useState(false);
  const [priceFilter, setPriceFilter] = useState('all');
  const [conditionFilter, setConditionFilter] = useState('all');

  useEffect(() => localStorage.setItem(KEY, JSON.stringify(items)), [items]);
  useEffect(() => setActivePhoto(0), [selected]);

  // Keyboard accessibility: close open modals with Escape key
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        if (selected) setSelected(null);
        if (editor) setEditor(null);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selected, editor]);

  const hasActiveFilters =
    category !== 'all' ||
    query.trim() !== '' ||
    onlyAvailable ||
    onlyMine ||
    priceFilter !== 'all' ||
    conditionFilter !== 'all';

  function clearAllFilters() {
    setCategory('all');
    setQuery('');
    setOnlyAvailable(false);
    setOnlyMine(false);
    setPriceFilter('all');
    setConditionFilter('all');
    setSort('featured');
  }

  const listing = useMemo(() => {
    let a = items.filter((x) => {
      // Category filter
      if (category !== 'all' && x.category !== category) return false;
      // Search query
      if (query.trim()) {
        const hay = `${x.title} ${x.category} ${x.condition} ${x.description || ''} ${x.pickup || ''}`.toLowerCase();
        if (!hay.includes(query.trim().toLowerCase())) return false;
      }
      // Quick filter: Available only (hide sold items)
      if (onlyAvailable && x.status === 'sold') return false;
      // Quick filter: My items only
      if (onlyMine && x.owner !== 'you') return false;
      // Quick filter: Condition
      if (conditionFilter !== 'all' && x.condition !== conditionFilter) return false;
      // Quick filter: Price
      if (priceFilter === 'under250' && x.price >= 250) return false;
      if (priceFilter === 'under500' && x.price >= 500) return false;
      if (priceFilter === 'over500' && x.price < 500) return false;
      return true;
    });

    if (sort === 'low') a.sort((a, b) => a.price - b.price);
    if (sort === 'high') a.sort((a, b) => b.price - a.price);
    return a;
  }, [items, category, query, sort, onlyAvailable, onlyMine, conditionFilter, priceFilter]);

  function startEdit(item) {
    if (item && item.owner !== 'you') return;
    setError('');
    setFieldErrors({});
    setEditor({
      id: item?.id || null,
      form: item
        ? {
            title: item.title,
            price: String(item.price),
            category: item.category,
            condition: item.condition,
            description: item.description || '',
            pickup: item.pickup || '',
            status: item.status,
          }
        : { ...emptyForm },
    });
  }

  function handleFieldChange(field, value) {
    setEditor((s) => ({ ...s, form: { ...s.form, [field]: value } }));
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  }

  function submit(event) {
    event.preventDefault();
    const f = editor.form;
    const errors = validateForm(f);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError('Please fill in all required fields highlighted in red.');
      return;
    }
    const original = editor.id ? items.find((x) => x.id === editor.id) : null;
    const next = {
      ...f,
      title: f.title.trim(),
      price: Number(f.price),
      description: f.description.trim(),
      pickup: f.pickup.trim(),
      photos: original?.photos || [],
      emoji: original?.emoji || '📦',
      owner: 'you',
      seller: currentUser.name,
      sellerEmail: currentUser.email,
    };
    if (editor.id) {
      setItems(items.map((x) => (x.id === editor.id ? { ...x, ...next } : x)));
      setNotice('Changes saved.');
    } else {
      setItems([{ ...next, id: `m-${Date.now()}`, status: 'active' }, ...items]);
      setNotice('Item listed.');
    }
    setEditor(null);
    setSelected(null);
  }

  function reset() {
    setItems(seed);
    setSelected(null);
    setEditor(null);
    clearAllFilters();
    setNotice('Example items restored.');
  }

  return (
    <div className="market-app">
      <div className="utility">
        <span>Campus Exchange</span>
        <span>Trusted by students • All prices in EGP</span>
      </div>

      <header className="navigation">
        <button
          className="brand"
          onClick={() => {
            setSelected(null);
            clearAllFilters();
          }}
        >
          <span className="brand-icon">✳</span> CAMPUS<span className="brand-alt">exchange</span>
        </button>
        <nav>
          <a href="#discover">Browse items</a>
          <button
            onClick={() => {
              setCategory('textbooks');
              document.getElementById('discover')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            Textbooks
          </button>
          <button
            onClick={() => {
              setCategory('electronics');
              document.getElementById('discover')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            Electronics
          </button>
        </nav>
        <div className="nav-actions">
          <span className="usercircle" title="Signed in as You">
            Y
          </span>
          <button className="sell-cta" onClick={() => startEdit(null)}>
            + Sell an item
          </button>
        </div>
      </header>

      <main>
        <section className="promo">
          <div className="promo-copy">
            <span className="tag">THE CAMPUS MARKETPLACE</span>
            <h1>
              Everything you need,
              <br />
              <i>right around campus.</i>
            </h1>
            <p>Browse little finds, big essentials and almost everything in between.</p>
            <button onClick={() => document.getElementById('discover')?.scrollIntoView({ behavior: 'smooth' })}>
              Explore listings <span>↗</span>
            </button>
          </div>
          <div className="promo-art">
            <span>📚</span>
            <span>💡</span>
            <span>🎧</span>
            <span>🛋️</span>
          </div>
        </section>

        <section className="discovery" id="discover">
          <div className="discover-top">
            <div>
              <p className="section-kicker">CURATED FOR YOUR CAMPUS</p>
              <h2>Find something good.</h2>
              <p>Items listed by people around you.</p>
            </div>
            <div className="discover-right">
              <label className="search">
                <span>⌕</span>
                <input
                  aria-label="Search listings"
                  placeholder="Search listings..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </label>
              <label className="sort">
                <span>Sort</span>
                <select value={sort} onChange={(e) => setSort(e.target.value)}>
                  <option value="featured">Featured</option>
                  <option value="low">Price: low to high</option>
                  <option value="high">Price: high to low</option>
                </select>
              </label>
            </div>
          </div>

          {/* Quick Filters toolbar */}
          <div className="quick-filters-bar" aria-label="Quick filters">
            <div className="filter-group-inline">
              <span className="filter-label">Quick filters:</span>

              <button
                type="button"
                className={`filter-chip ${onlyAvailable ? 'active' : ''}`}
                onClick={() => setOnlyAvailable(!onlyAvailable)}
                title="Hide items already marked as sold"
              >
                <span className="chip-indicator">🟢</span> Available only
              </button>

              <button
                type="button"
                className={`filter-chip ${onlyMine ? 'active' : ''}`}
                onClick={() => setOnlyMine(!onlyMine)}
                title="Show only items you listed"
              >
                <span className="chip-indicator">👤</span> My items
              </button>

              <div className="filter-dropdown-wrapper">
                <select
                  aria-label="Filter by price range"
                  value={priceFilter}
                  onChange={(e) => setPriceFilter(e.target.value)}
                  className={`filter-select ${priceFilter !== 'all' ? 'active' : ''}`}
                >
                  {priceRanges.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-dropdown-wrapper">
                <select
                  aria-label="Filter by condition"
                  value={conditionFilter}
                  onChange={(e) => setConditionFilter(e.target.value)}
                  className={`filter-select ${conditionFilter !== 'all' ? 'active' : ''}`}
                >
                  <option value="all">All conditions</option>
                  {conditions.map((c) => (
                    <option key={c} value={c}>
                      {cap(c)}
                    </option>
                  ))}
                </select>
              </div>

              {hasActiveFilters && (
                <button type="button" className="clear-filters-btn" onClick={clearAllFilters} title="Reset all filters">
                  ✕ Clear filters
                </button>
              )}
            </div>

            <div className="listing-count-tag">
              Showing <strong>{listing.length}</strong> of <strong>{items.length}</strong> items
            </div>
          </div>

          {/* Category tabs */}
          <div className="category-row">
            {categories.map((c) => (
              <button key={c} onClick={() => setCategory(c)} className={category === c ? 'on' : ''}>
                {c === 'all' ? 'All categories' : cap(c)}
              </button>
            ))}
          </div>

          {notice && (
            <p className="notice" role="status">
              {notice} <button onClick={() => setNotice('')}>×</button>
            </p>
          )}

          <div className="listing-grid">
            {listing.map((item) => (
              <article className={`product ${item.status === 'sold' ? 'product-sold' : ''}`} key={item.id}>
                <button className="photo" onClick={() => setSelected(item.id)}>
                  <span className="stamp">{cap(item.condition)}</span>
                  {item.owner === 'you' && <span className="owner-badge">Your item</span>}
                  <ListingImage src={item.photos?.[0]} alt={item.title} emoji={item.emoji} className="listing-img" />
                  <span className="category-caption">{cap(item.category)}</span>
                </button>
                <div className="prod-details">
                  <div className="prod-topline">
                    <span className="muted">{item.category}</span>
                    <span className={item.status === 'sold' ? 'soldstatus' : 'instock'}>
                      {item.status.toUpperCase()}
                    </span>
                  </div>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                  <div className="costline">
                    <strong>EGP {item.price.toLocaleString()}</strong>
                    <span>{cap(item.condition)}</span>
                  </div>
                  <button className="details-button" onClick={() => setSelected(item.id)}>
                    View item <span>↗</span>
                  </button>
                </div>
              </article>
            ))}
            {listing.length === 0 && (
              <div className="noresults-box">
                <p className="noresults">No listings match your current filters or search.</p>
                {hasActiveFilters && (
                  <button className="reset-filters-cta" onClick={clearAllFilters}>
                    Clear all filters
                  </button>
                )}
              </div>
            )}
          </div>
        </section>

        <footer>
          <strong>CAMPUS exchange</strong>
          <span>From students, for students.</span>
          <button onClick={reset}>Reset demo</button>
        </footer>
      </main>

      {/* Item Details Expanded Modal */}
      {selected &&
        (() => {
          const item = items.find((x) => x.id === selected);
          if (!item) return null;
          const images = item.photos || [];
          const subject = encodeURIComponent(`Campus Exchange: ${item.title}`);
          const body = encodeURIComponent(
            `Hi ${item.seller},\n\nI'm interested in your listing "${item.title}" (EGP ${item.price}). Is it still available?\n\n`
          );
          return (
            <div
              className="overlay"
              onMouseDown={(e) => {
                if (e.target === e.currentTarget) setSelected(null);
              }}
            >
              <section className="detail-panel" role="dialog" aria-modal="true" aria-label="Item details">
                {/* Robust, glitch-free Close Button */}
                <button
                  type="button"
                  className="close"
                  aria-label="Close item details"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelected(null);
                  }}
                >
                  <CloseIcon />
                </button>

                <div className="detail-visual">
                  <ListingImage
                    src={images[activePhoto] || images[0]}
                    alt={`${item.title} photo ${activePhoto + 1}`}
                    emoji={item.emoji}
                    className="detail-img"
                  />
                  {item.status === 'sold' && <div className="detail-sold-banner">SOLD</div>}
                </div>

                {images.length > 1 && (
                  <div className="detail-thumbs" aria-label="Item photos">
                    {images.map((src, index) => (
                      <button
                        type="button"
                        key={index}
                        className={activePhoto === index ? 'thumb active' : 'thumb'}
                        aria-label={`Show photo ${index + 1} of ${images.length}`}
                        aria-pressed={activePhoto === index}
                        onClick={() => setActivePhoto(index)}
                      >
                        <ListingImage src={src} alt="" emoji={item.emoji} className="thumb-img" />
                      </button>
                    ))}
                  </div>
                )}

                <div className="detail-header-row">
                  <p className="section-kicker">
                    {cap(item.category)} · {cap(item.condition)}
                  </p>
                  {item.owner === 'you' && <span className="owner-pill">Your listing</span>}
                </div>

                <h2>{item.title}</h2>
                <h3 className="detail-price">EGP {item.price.toLocaleString()}</h3>
                <p className="item-description">{item.description || 'No description supplied.'}</p>

                <div className="detail-meta">
                  <p>
                    <strong>📍 Pickup location</strong>
                    <br />
                    {item.pickup || 'Arrange directly with seller'}
                  </p>
                  <p>
                    <strong>👤 Seller</strong>
                    <br />
                    {item.seller}
                  </p>
                </div>

                <div className="detail-footer-action">
                  <p className="muted">
                    Status: <span className={item.status === 'sold' ? 'soldstatus' : 'instock'}>{cap(item.status)}</span>
                  </p>
                  {item.owner === 'you' ? (
                    <button
                      type="button"
                      className="sell-cta edit-btn"
                      onClick={() => {
                        setSelected(null);
                        startEdit(item);
                      }}
                    >
                      ✏️ Edit your listing
                    </button>
                  ) : item.status === 'sold' ? (
                    <p className="fineprint">This item has been marked as sold.</p>
                  ) : (
                    <a className="sell-cta contact-seller" href={`mailto:${item.sellerEmail}?subject=${subject}&body=${body}`}>
                      ✉ Contact seller
                    </a>
                  )}
                </div>
              </section>
            </div>
          );
        })()}

      {/* Sell / Edit Modal with Red Highlighting on Missing Required Fields */}
      {editor && (
        <div
          className="overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setEditor(null);
          }}
        >
          <section className="sell-modal" role="dialog" aria-modal="true" aria-label={editor.id ? 'Edit item' : 'Sell item'}>
            <button
              type="button"
              className="close"
              aria-label="Close form"
              onClick={(e) => {
                e.stopPropagation();
                setEditor(null);
              }}
            >
              <CloseIcon />
            </button>

            <div className="modal-head">
              <div>
                <p className="section-kicker">CAMPUS EXCHANGE</p>
                <h2>{editor.id ? 'Edit your listing' : 'Sell an item'}</h2>
                <p>Fields marked with * are required.</p>
              </div>
            </div>

            <form onSubmit={submit} noValidate>
              <div className="field-grid">
                {/* Title field */}
                <label className={`form-group ${fieldErrors.title ? 'has-error' : ''}`}>
                  <span>Item title *</span>
                  <input
                    value={editor.form.title}
                    onChange={(e) => handleFieldChange('title', e.target.value)}
                    placeholder="What are you selling?"
                    className={fieldErrors.title ? 'input-error' : ''}
                    aria-invalid={!!fieldErrors.title}
                  />
                  {fieldErrors.title && <span className="field-error-msg">{fieldErrors.title}</span>}
                </label>

                {/* Price field */}
                <label className={`form-group ${fieldErrors.price ? 'has-error' : ''}`}>
                  <span>Price (EGP) *</span>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={editor.form.price}
                    onChange={(e) => handleFieldChange('price', e.target.value)}
                    placeholder="e.g. 250"
                    className={fieldErrors.price ? 'input-error' : ''}
                    aria-invalid={!!fieldErrors.price}
                  />
                  {fieldErrors.price && <span className="field-error-msg">{fieldErrors.price}</span>}
                </label>

                {/* Category field */}
                <label className={`form-group ${fieldErrors.category ? 'has-error' : ''}`}>
                  <span>Category *</span>
                  <select
                    value={editor.form.category}
                    onChange={(e) => handleFieldChange('category', e.target.value)}
                    className={fieldErrors.category ? 'input-error' : ''}
                    aria-invalid={!!fieldErrors.category}
                  >
                    <option value="">Select category</option>
                    {categories.slice(1).map((c) => (
                      <option value={c} key={c}>
                        {cap(c)}
                      </option>
                    ))}
                  </select>
                  {fieldErrors.category && <span className="field-error-msg">{fieldErrors.category}</span>}
                </label>

                {/* Condition field */}
                <label className={`form-group ${fieldErrors.condition ? 'has-error' : ''}`}>
                  <span>Condition *</span>
                  <select
                    value={editor.form.condition}
                    onChange={(e) => handleFieldChange('condition', e.target.value)}
                    className={fieldErrors.condition ? 'input-error' : ''}
                    aria-invalid={!!fieldErrors.condition}
                  >
                    <option value="">Select condition</option>
                    {conditions.map((c) => (
                      <option value={c} key={c}>
                        {cap(c)}
                      </option>
                    ))}
                  </select>
                  {fieldErrors.condition && <span className="field-error-msg">{fieldErrors.condition}</span>}
                </label>

                {/* Description (optional) */}
                <label className="wide form-group">
                  <span>Description (optional)</span>
                  <textarea
                    value={editor.form.description}
                    onChange={(e) => handleFieldChange('description', e.target.value)}
                    placeholder="Provide details about condition, textbook edition, included parts..."
                    rows="4"
                  />
                </label>

                {/* Pickup location */}
                <label className="wide form-group">
                  <span>Pickup / meetup location</span>
                  <input
                    value={editor.form.pickup}
                    onChange={(e) => handleFieldChange('pickup', e.target.value)}
                    placeholder="e.g. GUC Library entrance or arrange on campus"
                  />
                </label>

                {/* Contact Email (readonly) */}
                <label className="wide form-group">
                  <span>Seller contact email</span>
                  <input value={currentUser.email} readOnly aria-readonly="true" className="readonly-input" />
                  <small className="email-helper">
                    Taken from your registered account, so buyers can contact you directly.
                  </small>
                </label>

                {/* Status (when editing) */}
                {editor.id && (
                  <label className={`form-group ${fieldErrors.status ? 'has-error' : ''}`}>
                    <span>Status</span>
                    <select
                      value={editor.form.status}
                      onChange={(e) => handleFieldChange('status', e.target.value)}
                      className={fieldErrors.status ? 'input-error' : ''}
                    >
                      <option value="active">Active (Available)</option>
                      <option value="sold">Sold</option>
                    </select>
                    {fieldErrors.status && <span className="field-error-msg">{fieldErrors.status}</span>}
                  </label>
                )}
              </div>

              {error && (
                <div className="alert-box" role="alert">
                  <span className="alert-icon">⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              <div className="modal-foot">
                <button type="button" onClick={() => setEditor(null)}>
                  Cancel
                </button>
                <button className="sell-cta" type="submit">
                  {editor.id ? 'Save changes' : 'Publish item'}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
