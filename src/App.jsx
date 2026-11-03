import React, { useEffect, useMemo, useState, useRef } from 'react';

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

const emptyForm = { title: '', price: '', category: '', condition: '', description: '', pickup: '', status: 'active', photoUrl: '', emoji: '📦' };

function saved() {
  try {
    const value = JSON.parse(localStorage.getItem(KEY));
    return Array.isArray(value) ? value : seed;
  } catch {
    return seed;
  }
}

const cap = (s) => (s === 'like-new' ? 'Like new' : (s || '').replace(/\b\w/g, (m) => m.toUpperCase()));

function validateFields(form) {
  const errors = {};
  if (!form.title || !form.title.trim()) {
    errors.title = 'Please enter an item title.';
  }
  if (form.price === '' || form.price === undefined || form.price === null || !Number.isFinite(Number(form.price)) || Number(form.price) < 0) {
    errors.price = 'Enter a valid price of zero or more EGP.';
  }
  if (!form.category || !categories.slice(1).includes(form.category)) {
    errors.category = 'Please choose a category.';
  }
  if (!form.condition || !conditions.includes(form.condition)) {
    errors.condition = 'Please choose an item condition.';
  }
  if (!['active', 'sold'].includes(form.status)) {
    errors.status = 'Choose a valid status (active or sold).';
  }
  return errors;
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
  const [maxPrice, setMaxPrice] = useState('');
  const [conditionFilter, setConditionFilter] = useState('all');
  const [hideSold, setHideSold] = useState(false);
  const [onlyMyListings, setOnlyMyListings] = useState(false);

  const [selected, setSelected] = useState(null);
  const [editor, setEditor] = useState(null); // null or { id, form }
  const [fieldErrors, setFieldErrors] = useState({});
  const [formTouched, setFormTouched] = useState({});
  const [confirmDiscard, setConfirmDiscard] = useState(false);

  const [activePhoto, setActivePhoto] = useState(0);
  const [notice, setNotice] = useState('');

  // Multi-item comparison state
  const [compareIds, setCompareIds] = useState([]);
  const [showCompare, setShowCompare] = useState(false);

  const formFirstInputRef = useRef(null);

  // Persistence
  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    setActivePhoto(0);
  }, [selected]);

  // Keyboard accessibility: Escape closes open dialogs safely
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        if (confirmDiscard) {
          setConfirmDiscard(false);
        } else if (editor) {
          handleAttemptCloseEditor();
        } else if (showCompare) {
          setShowCompare(false);
        } else if (selected) {
          setSelected(null);
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editor, confirmDiscard, showCompare, selected]);

  // Check if editor has unsaved user edits (dirty checking)
  const isFormDirty = useMemo(() => {
    if (!editor) return false;
    const original = editor.id ? items.find((x) => x.id === editor.id) : null;
    const base = original
      ? {
          title: original.title,
          price: String(original.price),
          category: original.category,
          condition: original.condition,
          description: original.description || '',
          pickup: original.pickup || '',
          status: original.status,
          photoUrl: original.photos?.[0] || '',
          emoji: original.emoji || '📦',
        }
      : emptyForm;
    return Object.keys(base).some((k) => (editor.form[k] || '') !== (base[k] || ''));
  }, [editor, items]);

  // Filtered and sorted listings
  const listing = useMemo(() => {
    let result = items.filter((x) => {
      // Category filter
      if (category !== 'all' && x.category !== category) return false;
      // My listings filter
      if (onlyMyListings && x.owner !== 'you') return false;
      // Condition filter
      if (conditionFilter !== 'all' && x.condition !== conditionFilter) return false;
      // Hide sold filter
      if (hideSold && x.status === 'sold') return false;
      // Max price filter (affordability)
      if (maxPrice !== '' && !isNaN(Number(maxPrice)) && x.price > Number(maxPrice)) return false;
      // Search query (matches title, category, description, pickup)
      const q = query.trim().toLowerCase();
      if (q) {
        const text = `${x.title} ${x.category} ${x.description || ''} ${x.pickup || ''} ${x.seller || ''}`.toLowerCase();
        if (!text.includes(q)) return false;
      }
      return true;
    });

    if (sort === 'low') result.sort((a, b) => a.price - b.price);
    if (sort === 'high') result.sort((a, b) => b.price - a.price);
    return result;
  }, [items, category, onlyMyListings, conditionFilter, hideSold, maxPrice, query, sort]);

  // Compare selection management
  function toggleCompare(id, e) {
    if (e) e.stopPropagation();
    setCompareIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      }
      if (prev.length >= 3) {
        setNotice('You can compare up to 3 items at a time.');
        return prev;
      }
      return [...prev, id];
    });
  }

  function clearCompare() {
    setCompareIds([]);
    setShowCompare(false);
  }

  // Fast Status Toggle for owners (mark sold / relist)
  function toggleItemStatus(item, e) {
    if (e) e.stopPropagation();
    if (item.owner !== 'you') return;
    const nextStatus = item.status === 'active' ? 'sold' : 'active';
    setItems((prev) => prev.map((x) => (x.id === item.id ? { ...x, status: nextStatus } : x)));
    setNotice(`"${item.title}" marked as ${nextStatus}.`);
  }

  function startEdit(item) {
    if (item && item.owner !== 'you') return;
    setFieldErrors({});
    setFormTouched({});
    setConfirmDiscard(false);
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
            photoUrl: item.photos?.[0] || '',
            emoji: item.emoji || '📦',
          }
        : { ...emptyForm },
    });
  }

  function handleAttemptCloseEditor() {
    if (isFormDirty) {
      setConfirmDiscard(true);
    } else {
      setEditor(null);
      setFieldErrors({});
    }
  }

  function handleFieldChange(field, value) {
    setEditor((s) => ({ ...s, form: { ...s.form, [field]: value } }));
    setFormTouched((prev) => ({ ...prev, [field]: true }));
    // Clear field-specific error as user edits
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
    const errors = validateFields(f);

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setFormTouched({ title: true, price: true, category: true, condition: true, status: true });
      return;
    }

    const original = editor.id ? items.find((x) => x.id === editor.id) : null;
    const customPhotos = f.photoUrl.trim()
      ? [f.photoUrl.trim(), ...(original?.photos?.filter((p) => p !== f.photoUrl.trim()) || [])]
      : original?.photos || [];

    const next = {
      ...f,
      title: f.title.trim(),
      price: Number(f.price),
      description: f.description.trim(),
      pickup: f.pickup.trim(),
      photos: customPhotos,
      emoji: f.emoji || original?.emoji || '📦',
      owner: 'you',
      seller: currentUser.name,
      sellerEmail: currentUser.email,
    };

    if (editor.id) {
      setItems(items.map((x) => (x.id === editor.id ? { ...x, ...next } : x)));
      setNotice('Changes saved successfully.');
    } else {
      setItems([{ ...next, id: `m-${Date.now()}`, status: 'active' }, ...items]);
      setNotice('New item listed successfully on Campus Exchange!');
    }

    setEditor(null);
    setSelected(null);
    setFieldErrors({});
  }

  function reset() {
    setItems(seed);
    setSelected(null);
    setEditor(null);
    setQuery('');
    setCategory('all');
    setSort('featured');
    setMaxPrice('');
    setConditionFilter('all');
    setHideSold(false);
    setOnlyMyListings(false);
    setCompareIds([]);
    setShowCompare(false);
    setNotice('Example campus items and filters restored.');
  }

  const activeFiltersCount = (category !== 'all' ? 1 : 0) + (onlyMyListings ? 1 : 0) + (conditionFilter !== 'all' ? 1 : 0) + (hideSold ? 1 : 0) + (maxPrice !== '' ? 1 : 0) + (query ? 1 : 0);

  const compareItems = useMemo(() => {
    return compareIds.map((id) => items.find((x) => x.id === id)).filter(Boolean);
  }, [compareIds, items]);

  const minComparePrice = useMemo(() => {
    if (compareItems.length === 0) return null;
    return Math.min(...compareItems.map((i) => i.price));
  }, [compareItems]);

  return (
    <div className="market-app">
      {/* Top Banner */}
      <div className="utility">
        <span>Campus Exchange • Student Marketplace</span>
        <span>Trusted peer-to-peer campus trading • All prices in EGP</span>
      </div>

      {/* Main Header */}
      <header className="navigation">
        <button
          className="brand"
          onClick={() => {
            setSelected(null);
            setCategory('all');
            setOnlyMyListings(false);
          }}
          title="Return to all listings"
        >
          <span className="brand-icon">✳</span> CAMPUS<span className="brand-alt">exchange</span>
        </button>

        <nav aria-label="Main Navigation">
          <a
            href="#discover"
            className={category === 'all' && !onlyMyListings ? 'nav-active' : ''}
            onClick={() => {
              setCategory('all');
              setOnlyMyListings(false);
            }}
          >
            Browse all
          </a>
          <button
            className={category === 'textbooks' && !onlyMyListings ? 'nav-active' : ''}
            onClick={() => {
              setCategory('textbooks');
              setOnlyMyListings(false);
              document.getElementById('discover')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            Textbooks
          </button>
          <button
            className={category === 'electronics' && !onlyMyListings ? 'nav-active' : ''}
            onClick={() => {
              setCategory('electronics');
              setOnlyMyListings(false);
              document.getElementById('discover')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            Electronics
          </button>
          <button
            className={onlyMyListings ? 'nav-active my-listings-nav' : 'my-listings-nav'}
            onClick={() => {
              setOnlyMyListings(!onlyMyListings);
              document.getElementById('discover')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            👤 My Listings ({items.filter((x) => x.owner === 'you').length})
          </button>
        </nav>

        <div className="nav-actions">
          <button
            className={`my-account-pill ${onlyMyListings ? 'active' : ''}`}
            onClick={() => setOnlyMyListings(!onlyMyListings)}
            title="Filter to listings owned by You"
          >
            <span className="usercircle">Y</span>
            <span className="user-label">You</span>
          </button>
          <button className="sell-cta" onClick={() => startEdit(null)}>
            + Sell an item
          </button>
        </div>
      </header>

      <main>
        {/* Hero Promotion */}
        <section className="promo">
          <div className="promo-copy">
            <span className="tag">THE CAMPUS MARKETPLACE</span>
            <h1>
              Everything you need,<br />
              <i>right around campus.</i>
            </h1>
            <p>Compare student listings, discover affordable textbooks & tech, and trade sustainably on campus.</p>
            <div className="promo-actions">
              <button
                className="promo-btn primary"
                onClick={() => document.getElementById('discover')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Explore listings <span>↗</span>
              </button>
              <button className="promo-btn secondary" onClick={() => startEdit(null)}>
                + Publish an item
              </button>
            </div>
          </div>
          <div className="promo-art" aria-hidden="true">
            <span>📚</span>
            <span>💡</span>
            <span>🎧</span>
            <span>🛋️</span>
          </div>
        </section>

        {/* Discovery & Search & Filter Section */}
        <section className="discovery" id="discover">
          <div className="discover-top">
            <div>
              <p className="section-kicker">CURATED FOR YOUR CAMPUS</p>
              <h2>Find something good.</h2>
              <p>Compare prices, check meetup locations, and connect with fellow students.</p>
            </div>

            <div className="discover-right">
              {/* Search with Clear Button */}
              <div className="search-wrapper">
                <label className="search">
                  <span className="search-icon" aria-hidden="true">⌕</span>
                  <input
                    aria-label="Search listings by title, category, description, or pickup location"
                    placeholder="Search by title, location..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                  {query && (
                    <button
                      type="button"
                      className="clear-search-btn"
                      onClick={() => setQuery('')}
                      aria-label="Clear search"
                    >
                      ×
                    </button>
                  )}
                </label>
              </div>

              {/* Sort Order */}
              <label className="sort">
                <span>Sort</span>
                <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort listings">
                  <option value="featured">Featured</option>
                  <option value="low">Price: low to high</option>
                  <option value="high">Price: high to low</option>
                </select>
              </label>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="category-row" role="tablist" aria-label="Categories">
            {categories.map((c) => (
              <button
                key={c}
                role="tab"
                aria-selected={category === c && !onlyMyListings}
                onClick={() => {
                  setCategory(c);
                  setOnlyMyListings(false);
                }}
                className={category === c && !onlyMyListings ? 'on' : ''}
              >
                {c === 'all' ? 'All items' : cap(c)}
              </button>
            ))}
            <button
              role="tab"
              aria-selected={onlyMyListings}
              onClick={() => setOnlyMyListings(!onlyMyListings)}
              className={onlyMyListings ? 'on my-pill-btn' : 'my-pill-btn'}
            >
              ⭐ My Listings ({items.filter((x) => x.owner === 'you').length})
            </button>
          </div>

          {/* Affordability & Refinement Filter Bar */}
          <div className="refinement-bar">
            <div className="refinement-group">
              <span className="filter-label">Affordability:</span>
              <div className="budget-input-wrapper">
                <span className="currency-prefix">Max EGP</span>
                <input
                  type="number"
                  min="0"
                  step="50"
                  placeholder="Any budget"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  aria-label="Filter by maximum price in EGP"
                  className="budget-input"
                />
                {maxPrice !== '' && (
                  <button className="clear-filter-mini" onClick={() => setMaxPrice('')} title="Clear budget limit">
                    ×
                  </button>
                )}
              </div>
              <div className="budget-shortcuts">
                <button
                  type="button"
                  className={maxPrice === '250' ? 'shortcut active' : 'shortcut'}
                  onClick={() => setMaxPrice(maxPrice === '250' ? '' : '250')}
                >
                  ≤ 250 EGP
                </button>
                <button
                  type="button"
                  className={maxPrice === '500' ? 'shortcut active' : 'shortcut'}
                  onClick={() => setMaxPrice(maxPrice === '500' ? '' : '500')}
                >
                  ≤ 500 EGP
                </button>
              </div>
            </div>

            <div className="refinement-group">
              <span className="filter-label">Condition:</span>
              <select
                value={conditionFilter}
                onChange={(e) => setConditionFilter(e.target.value)}
                aria-label="Filter by condition"
                className="condition-select"
              >
                <option value="all">All Conditions</option>
                {conditions.map((cond) => (
                  <option value={cond} key={cond}>
                    {cap(cond)}
                  </option>
                ))}
              </select>
            </div>

            <div className="refinement-group toggles">
              <label className="checkbox-toggle" title="Hide items that have already been sold">
                <input
                  type="checkbox"
                  checked={hideSold}
                  onChange={(e) => setHideSold(e.target.checked)}
                />
                <span>Available only (hide sold)</span>
              </label>
            </div>

            {activeFiltersCount > 0 && (
              <button
                type="button"
                className="reset-filters-btn"
                onClick={() => {
                  setCategory('all');
                  setOnlyMyListings(false);
                  setMaxPrice('');
                  setConditionFilter('all');
                  setHideSold(false);
                  setQuery('');
                }}
              >
                Reset filters ({activeFiltersCount})
              </button>
            )}
          </div>

          {/* User Feedback Toast Notice */}
          {notice && (
            <p className="notice" role="status">
              <span>{notice}</span>
              <button onClick={() => setNotice('')} aria-label="Dismiss notice">
                ×
              </button>
            </p>
          )}

          {/* Listing Grid */}
          <div className="listing-grid">
            {listing.map((item) => {
              const isOwner = item.owner === 'you';
              const isComparing = compareIds.includes(item.id);
              const isSold = item.status === 'sold';

              return (
                <article className={`product ${isSold ? 'product-sold' : ''} ${isOwner ? 'product-own' : ''}`} key={item.id}>
                  {/* Photo & Stamp Header */}
                  <div className="photo-container">
                    <button
                      className="photo"
                      onClick={() => setSelected(item.id)}
                      aria-label={`View details for ${item.title}`}
                    >
                      <span className="stamp">{cap(item.condition)}</span>
                      <ListingImage
                        src={item.photos?.[0]}
                        alt={item.title}
                        emoji={item.emoji}
                        className="listing-img"
                      />
                      <span className="category-caption">{cap(item.category)}</span>
                    </button>

                    {/* Compare Checkbox Button on Card */}
                    <button
                      type="button"
                      className={`card-compare-btn ${isComparing ? 'active' : ''}`}
                      onClick={(e) => toggleCompare(item.id, e)}
                      title={isComparing ? 'Remove from comparison' : 'Add to side-by-side compare'}
                      aria-pressed={isComparing}
                    >
                      <span className="compare-icon">⚖️</span>
                      {isComparing ? 'Comparing' : '+ Compare'}
                    </button>

                    {/* Owner Badge */}
                    {isOwner && (
                      <span className="owner-badge" title="You are the seller of this listing">
                        👤 Your listing
                      </span>
                    )}

                    {/* Prominent Sold Banner */}
                    {isSold && (
                      <div className="sold-watermark" aria-hidden="true">
                        SOLD
                      </div>
                    )}
                  </div>

                  {/* Product Details Body */}
                  <div className="prod-details">
                    <div className="prod-topline">
                      <span className="muted">{item.category}</span>
                      <span className={isSold ? 'soldstatus' : 'instock'}>
                        {isSold ? '● SOLD' : '● AVAILABLE'}
                      </span>
                    </div>

                    <h3 className="prod-title" title={item.title}>
                      {item.title}
                    </h3>
                    <p className="prod-desc">{item.description || 'No description supplied.'}</p>

                    {/* Meetup / Pickup location on card for student transparency */}
                    <div className="prod-pickup" title={`Pickup: ${item.pickup || 'Arrange with seller'}`}>
                      <span className="pickup-icon" aria-hidden="true">📍</span>
                      <span className="pickup-text">{item.pickup || 'Arrange on campus'}</span>
                    </div>

                    {/* Price and Condition */}
                    <div className="costline">
                      <div>
                        <strong>EGP {item.price.toLocaleString()}</strong>
                        <span className="seller-subline"> · Seller: {item.seller}</span>
                      </div>
                      <span className="condition-tag">{cap(item.condition)}</span>
                    </div>

                    {/* Action Buttons */}
                    <div className="card-actions">
                      <button
                        className="details-button"
                        onClick={() => setSelected(item.id)}
                      >
                        <span>View details</span> <span>↗</span>
                      </button>

                      {/* Fast Owner Status Toggle right from card */}
                      {isOwner && (
                        <button
                          type="button"
                          className={`owner-quick-toggle ${isSold ? 'relist-btn' : 'sold-btn'}`}
                          onClick={(e) => toggleItemStatus(item, e)}
                          title={isSold ? 'Mark this listing active again' : 'Mark as sold'}
                        >
                          {isSold ? 'Relist' : 'Mark sold'}
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}

            {listing.length === 0 && (
              <div className="noresults-card">
                <span className="noresults-icon">🔍</span>
                <h3>No listings match your criteria</h3>
                <p>Try adjusting your search keywords, budget slider, or clearing the condition and status filters.</p>
                <button
                  type="button"
                  className="sell-cta"
                  onClick={() => {
                    setQuery('');
                    setCategory('all');
                    setSort('featured');
                    setMaxPrice('');
                    setConditionFilter('all');
                    setHideSold(false);
                    setOnlyMyListings(false);
                  }}
                >
                  Reset all filters
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Footer */}
        <footer>
          <div>
            <strong>CAMPUS exchange</strong>
            <span> — Practical peer-to-peer marketplace from students, for students.</span>
          </div>
          <button onClick={reset} title="Reset demo records to original defaults">
            Reset demo data
          </button>
        </footer>
      </main>

      {/* FLOATING COMPARISON BAR (Shows when items are selected) */}
      {compareIds.length > 0 && (
        <aside className="compare-bar" aria-label="Comparison dock">
          <div className="compare-bar-content">
            <div className="compare-info">
              <span className="compare-dock-icon">⚖️</span>
              <div>
                <strong>Compare items ({compareIds.length} of 3)</strong>
                <p>Select up to 3 listings to compare price, condition & meetup spots</p>
              </div>
            </div>

            <div className="compare-chips">
              {compareItems.map((ci) => (
                <div key={ci.id} className="compare-chip">
                  <span className="chip-emoji">{ci.emoji || '📦'}</span>
                  <span className="chip-title">{ci.title}</span>
                  <span className="chip-price">EGP {ci.price}</span>
                  <button
                    type="button"
                    onClick={() => toggleCompare(ci.id)}
                    aria-label={`Remove ${ci.title} from comparison`}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            <div className="compare-bar-actions">
              <button
                type="button"
                className="sell-cta compare-launch-btn"
                disabled={compareIds.length < 2}
                onClick={() => setShowCompare(true)}
              >
                Compare Side-by-Side {compareIds.length >= 2 ? '↗' : '(Select 1 more)'}
              </button>
              <button type="button" className="compare-clear-btn" onClick={clearCompare}>
                Clear
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* SIDE-BY-SIDE COMPARISON MODAL */}
      {showCompare && (
        <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && setShowCompare(false)}>
          <section className="compare-modal" role="dialog" aria-modal="true" aria-label="Compare listings side by side">
            <div className="modal-head">
              <div>
                <p className="section-kicker">CAMPUS EXCHANGE · COMPARISON TOOL</p>
                <h2>Side-by-Side Item Comparison</h2>
                <p>Evaluating {compareItems.length} student items for the best value and convenient campus meetup.</p>
              </div>
              <button className="close" onClick={() => setShowCompare(false)} aria-label="Close comparison">
                ×
              </button>
            </div>

            <div className="compare-grid" style={{ gridTemplateColumns: `repeat(${compareItems.length}, minmax(240px, 1fr))` }}>
              {compareItems.map((item) => {
                const isBestPrice = item.price === minComparePrice && compareItems.length > 1;
                const isOwner = item.owner === 'you';
                const subject = encodeURIComponent(`Campus Exchange: Inquiry about ${item.title}`);
                const body = encodeURIComponent(`Hi ${item.seller},\n\nI'm interested in your listing "${item.title}" (EGP ${item.price}). Is it still available for campus meetup?\n\n`);

                return (
                  <div key={item.id} className={`compare-column ${isBestPrice ? 'best-value' : ''}`}>
                    {isBestPrice && <div className="value-ribbon">⭐ Lowest Price</div>}

                    <div className="compare-photo-wrap">
                      <ListingImage
                        src={item.photos?.[0]}
                        alt={item.title}
                        emoji={item.emoji}
                        className="compare-photo-img"
                      />
                    </div>

                    <h3 className="compare-title">{item.title}</h3>
                    <div className="compare-price-tag">
                      <strong>EGP {item.price.toLocaleString()}</strong>
                      <span className={`status-pill ${item.status}`}>{item.status.toUpperCase()}</span>
                    </div>

                    <dl className="compare-specs">
                      <div>
                        <dt>Condition</dt>
                        <dd><strong>{cap(item.condition)}</strong></dd>
                      </div>
                      <div>
                        <dt>Category</dt>
                        <dd>{cap(item.category)}</dd>
                      </div>
                      <div>
                        <dt>Pickup Location</dt>
                        <dd className="spec-pickup">📍 {item.pickup || 'Arrange directly'}</dd>
                      </div>
                      <div>
                        <dt>Seller</dt>
                        <dd>{item.seller} {isOwner && '(You)'}</dd>
                      </div>
                      <div className="desc-row">
                        <dt>Description</dt>
                        <dd>{item.description || 'No description supplied.'}</dd>
                      </div>
                    </dl>

                    <div className="compare-actions">
                      {isOwner ? (
                        <button
                          className="sell-cta"
                          onClick={() => {
                            setShowCompare(false);
                            startEdit(item);
                          }}
                        >
                          Edit your listing
                        </button>
                      ) : item.status === 'sold' ? (
                        <p className="fineprint">This item is sold.</p>
                      ) : (
                        <a
                          className="sell-cta contact-seller"
                          href={`mailto:${item.sellerEmail}?subject=${subject}&body=${body}`}
                        >
                          ✉ Contact seller
                        </a>
                      )}
                      <button
                        type="button"
                        className="remove-compare-btn"
                        onClick={() => toggleCompare(item.id)}
                      >
                        Remove from comparison
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="modal-foot">
              <button type="button" onClick={() => setShowCompare(false)}>
                Back to browsing
              </button>
              <button type="button" className="compare-clear-btn" onClick={clearCompare}>
                Clear comparison
              </button>
            </div>
          </section>
        </div>
      )}

      {/* SINGLE ITEM DETAILS MODAL */}
      {selected &&
        (() => {
          const item = items.find((x) => x.id === selected);
          if (!item) return null;
          const images = item.photos || [];
          const isOwner = item.owner === 'you';
          const isSold = item.status === 'sold';
          const subject = encodeURIComponent(`Campus Exchange: ${item.title}`);
          const body = encodeURIComponent(
            `Hi ${item.seller},\n\nI'm interested in your listing "${item.title}" (EGP ${item.price}). Is it still available?\n\n`
          );

          return (
            <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && setSelected(null)}>
              <section className="detail-panel" role="dialog" aria-modal="true" aria-label="Item details">
                <button className="close" aria-label="Close item details" onClick={() => setSelected(null)}>
                  ×
                </button>
                <div className="detail-visual">
                  <ListingImage
                    src={images[activePhoto] || images[0]}
                    alt={`${item.title} photo ${activePhoto + 1}`}
                    emoji={item.emoji}
                    className="detail-img"
                  />
                  {isSold && <span className="detail-sold-stamp">SOLD</span>}
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
                  <span className={`status-pill ${item.status}`}>{item.status.toUpperCase()}</span>
                </div>

                <h2>{item.title}</h2>
                <h3 className="detail-price">EGP {item.price.toLocaleString()}</h3>
                <p className="item-description">{item.description || 'No description supplied.'}</p>

                <div className="detail-meta">
                  <p>
                    <strong>📍 Campus Pickup</strong>
                    <br />
                    {item.pickup || 'Arrange directly with seller'}
                  </p>
                  <p>
                    <strong>👤 Seller</strong>
                    <br />
                    {item.seller} {isOwner && '(You)'}
                  </p>
                </div>

                {/* Compare toggle button in details */}
                <div className="detail-compare-action">
                  <button
                    type="button"
                    className={`detail-compare-btn ${compareIds.includes(item.id) ? 'active' : ''}`}
                    onClick={() => toggleCompare(item.id)}
                  >
                    <span>⚖️</span>{' '}
                    {compareIds.includes(item.id) ? 'In your comparison list (Remove)' : 'Add to side-by-side compare'}
                  </button>
                </div>

                {/* Primary Contact or Owner Actions */}
                <div className="detail-actions">
                  {isOwner ? (
                    <div className="owner-detail-btns">
                      <button className="sell-cta" onClick={() => startEdit(item)}>
                        ✏️ Edit your listing
                      </button>
                      <button
                        type="button"
                        className={`owner-status-btn ${isSold ? 'relist' : 'sold'}`}
                        onClick={() => toggleItemStatus(item)}
                      >
                        {isSold ? '🔄 Relist as Active' : '✓ Mark as Sold'}
                      </button>
                    </div>
                  ) : isSold ? (
                    <p className="fineprint">This item is marked as sold. Keep browsing for other campus listings.</p>
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

      {/* PUBLISH / EDIT MODAL (With field-level validation and dirty confirmation) */}
      {editor && (
        <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && handleAttemptCloseEditor()}>
          <section className="sell-modal" role="dialog" aria-modal="true" aria-label={editor.id ? 'Edit item' : 'Sell item'}>
            <div className="modal-head">
              <div>
                <p className="section-kicker">CAMPUS EXCHANGE</p>
                <h2>{editor.id ? 'Edit your listing' : 'Sell an item'}</h2>
                <p>Provide accurate details so student buyers can quickly evaluate and pick up your item.</p>
              </div>
              <button className="close" onClick={handleAttemptCloseEditor} aria-label="Close dialog">
                ×
              </button>
            </div>

            {/* Error summary alert */}
            {Object.keys(fieldErrors).length > 0 && (
              <div className="alert-summary" role="alert">
                <strong>Please fix the {Object.keys(fieldErrors).length} error{Object.keys(fieldErrors).length > 1 ? 's' : ''} below before submitting:</strong>
                <ul>
                  {Object.entries(fieldErrors).map(([key, msg]) => (
                    <li key={key}>{msg}</li>
                  ))}
                </ul>
              </div>
            )}

            <form onSubmit={submit} noValidate>
              <div className="field-grid">
                {/* Item Title */}
                <label className={fieldErrors.title ? 'has-error' : ''}>
                  <div className="label-row">
                    <span>Item title *</span>
                    {fieldErrors.title && <span className="field-error-msg">{fieldErrors.title}</span>}
                  </div>
                  <input
                    ref={formFirstInputRef}
                    value={editor.form.title}
                    onChange={(e) => handleFieldChange('title', e.target.value)}
                    placeholder="e.g. Calculus II Stewart 9th Edition"
                    aria-invalid={Boolean(fieldErrors.title)}
                    aria-required="true"
                    className={fieldErrors.title ? 'input-error' : ''}
                  />
                </label>

                {/* Price (EGP) */}
                <label className={fieldErrors.price ? 'has-error' : ''}>
                  <div className="label-row">
                    <span>Price (EGP) *</span>
                    {fieldErrors.price && <span className="field-error-msg">{fieldErrors.price}</span>}
                  </div>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={editor.form.price}
                    onChange={(e) => handleFieldChange('price', e.target.value)}
                    placeholder="e.g. 250"
                    aria-invalid={Boolean(fieldErrors.price)}
                    aria-required="true"
                    className={fieldErrors.price ? 'input-error' : ''}
                  />
                </label>

                {/* Category */}
                <label className={fieldErrors.category ? 'has-error' : ''}>
                  <div className="label-row">
                    <span>Category *</span>
                    {fieldErrors.category && <span className="field-error-msg">{fieldErrors.category}</span>}
                  </div>
                  <select
                    value={editor.form.category}
                    onChange={(e) => handleFieldChange('category', e.target.value)}
                    aria-invalid={Boolean(fieldErrors.category)}
                    aria-required="true"
                    className={fieldErrors.category ? 'input-error' : ''}
                  >
                    <option value="">Select a category</option>
                    {categories.slice(1).map((c) => (
                      <option value={c} key={c}>
                        {cap(c)}
                      </option>
                    ))}
                  </select>
                </label>

                {/* Condition */}
                <label className={fieldErrors.condition ? 'has-error' : ''}>
                  <div className="label-row">
                    <span>Condition *</span>
                    {fieldErrors.condition && <span className="field-error-msg">{fieldErrors.condition}</span>}
                  </div>
                  <select
                    value={editor.form.condition}
                    onChange={(e) => handleFieldChange('condition', e.target.value)}
                    aria-invalid={Boolean(fieldErrors.condition)}
                    aria-required="true"
                    className={fieldErrors.condition ? 'input-error' : ''}
                  >
                    <option value="">Select item condition</option>
                    {conditions.map((c) => (
                      <option value={c} key={c}>
                        {cap(c)}
                      </option>
                    ))}
                  </select>
                </label>

                {/* Description */}
                <label className="wide">
                  <div className="label-row">
                    <span>Description (optional)</span>
                    <small className="char-count">{editor.form.description.length}/500</small>
                  </div>
                  <textarea
                    maxLength={500}
                    value={editor.form.description}
                    onChange={(e) => handleFieldChange('description', e.target.value)}
                    placeholder="Describe the item condition, edition, accessories included, and any cosmetic flaws..."
                    rows="4"
                  />
                </label>

                {/* Pickup Location */}
                <label className="wide">
                  <span>Campus Pickup / Meetup location</span>
                  <input
                    value={editor.form.pickup}
                    onChange={(e) => handleFieldChange('pickup', e.target.value)}
                    placeholder="e.g. GUC Gate 3, Library entrance, or Main cafeteria"
                  />
                  <small className="field-helper">Specify a safe public spot on or around campus for exchange.</small>
                </label>

                {/* Photo URL or Emoji Icon */}
                <label>
                  <span>Photo URL (optional)</span>
                  <input
                    type="url"
                    value={editor.form.photoUrl || ''}
                    onChange={(e) => handleFieldChange('photoUrl', e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                  />
                </label>

                <label>
                  <span>Listing Emoji / Icon</span>
                  <select
                    value={editor.form.emoji || '📦'}
                    onChange={(e) => handleFieldChange('emoji', e.target.value)}
                  >
                    <option value="📦">📦 Box / General</option>
                    <option value="📚">📚 Textbook / Notes</option>
                    <option value="💻">💻 Laptop / Tech</option>
                    <option value="🎧">🎧 Audio / Electronics</option>
                    <option value="💡">💡 Desk / Lamp</option>
                    <option value="🥼">🥼 Lab coat / Apparel</option>
                    <option value="✏️">✏️ Stationery / Art</option>
                    <option value="🎒">🎒 Bag / Backpack</option>
                    <option value="🗄️">🗄️ Furniture / Organizer</option>
                  </select>
                </label>

                {/* Seller email (readonly) */}
                <label className="wide">
                  <span>Seller contact email</span>
                  <input value={currentUser.email} readOnly aria-readonly="true" className="readonly-input" />
                  <small className="email-helper">Taken from your registered account, so buyers can contact you about this item.</small>
                </label>

                {/* Status dropdown if editing */}
                {editor.id && (
                  <label className="wide">
                    <span>Listing Status</span>
                    <select
                      value={editor.form.status}
                      onChange={(e) => handleFieldChange('status', e.target.value)}
                    >
                      <option value="active">Active (Available for purchase)</option>
                      <option value="sold">Sold (Mark as completed)</option>
                    </select>
                  </label>
                )}
              </div>

              {/* Modal footer */}
              <div className="modal-foot">
                <button type="button" onClick={handleAttemptCloseEditor}>
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

      {/* CONFIRM DISCARD CHANGES DIALOG (Accidental loss prevention) */}
      {confirmDiscard && (
        <div className="overlay confirm-overlay" onMouseDown={(e) => e.target === e.currentTarget && setConfirmDiscard(false)}>
          <div className="confirm-modal" role="alertdialog" aria-modal="true" aria-labelledby="discard-title" aria-describedby="discard-desc">
            <span className="warning-icon" aria-hidden="true">⚠️</span>
            <h3 id="discard-title">Discard unsaved changes?</h3>
            <p id="discard-desc">You have edited listing details that haven't been saved yet. Leaving now will lose your draft.</p>
            <div className="confirm-actions">
              <button
                type="button"
                className="confirm-keep-btn"
                onClick={() => setConfirmDiscard(false)}
              >
                Keep editing
              </button>
              <button
                type="button"
                className="confirm-discard-btn"
                onClick={() => {
                  setConfirmDiscard(false);
                  setEditor(null);
                  setFieldErrors({});
                }}
              >
                Discard changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
