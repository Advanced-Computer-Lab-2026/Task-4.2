import React, { useEffect, useMemo, useRef, useState } from 'react';

const KEY = 'acl-marketplace-v3';
const categories = ['all', 'textbooks', 'electronics', 'furniture', 'clothing', 'other'];
const conditions = ['new', 'like-new', 'used', 'worn'];
const quickEmojis = ['📚', '💡', '🎧', '🥼', '✏️', '🗄️', '🎨', '📱', '💻', '🎒', '📦'];
const categoryIcons = {
  all: '✨',
  textbooks: '📚',
  electronics: '🎧',
  furniture: '🛋️',
  clothing: '🥼',
  other: '🎨',
};
const popularSearches = [
  { label: 'Calculus', type: 'query', value: 'Calculus' },
  { label: 'Headphones', type: 'query', value: 'Headphones' },
  { label: 'Desk lamp', type: 'query', value: 'Desk lamp' },
  { label: '≤ 250 EGP', type: 'budget', value: '250' },
  { label: 'Like-new', type: 'condition', value: 'like-new' },
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

const emptyForm = {
  title: '',
  price: '',
  category: '',
  condition: '',
  description: '',
  pickup: '',
  status: 'active',
  photoUrl: '',
  emoji: '📦',
};

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
  if (!form.title.trim()) {
    errors.title = 'Please enter an item title.';
  }
  if (form.price === '' || form.price === undefined || !Number.isFinite(Number(form.price)) || Number(form.price) < 0) {
    errors.price = 'Please enter a valid price of zero or more.';
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
  const [conditionFilter, setConditionFilter] = useState('all');
  const [sort, setSort] = useState('featured');
  const [maxPrice, setMaxPrice] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [hideSold, setHideSold] = useState(false);

  const [selected, setSelected] = useState(null);
  const [editor, setEditor] = useState(null); // null or { id, form }
  const [fieldErrors, setFieldErrors] = useState({});
  const [activePhoto, setActivePhoto] = useState(0);
  const [notice, setNotice] = useState('');
  const [copiedEmail, setCopiedEmail] = useState(false);

  // Comparison feature state (up to 3 items)
  const [comparedIds, setComparedIds] = useState([]);
  const [showCompareModal, setShowCompareModal] = useState(false);

  const searchInputRef = useRef(null);

  // Global hotkey: press "/" to focus search
  useEffect(() => {
    function handleKeyDown(e) {
      if (
        e.key === '/' &&
        document.activeElement.tagName !== 'INPUT' &&
        document.activeElement.tagName !== 'TEXTAREA' &&
        !editor &&
        !selected &&
        !showCompareModal
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editor, selected, showCompareModal]);

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    setActivePhoto(0);
    setCopiedEmail(false);
  }, [selected]);

  // Clean comparison list if an item is deleted/reset
  useEffect(() => {
    setComparedIds((prev) => prev.filter((id) => items.some((item) => item.id === id)));
  }, [items]);

  // Calculate live item counts per category
  const categoryCounts = useMemo(() => {
    const counts = { all: items.length };
    categories.slice(1).forEach((cat) => {
      counts[cat] = items.filter((it) => it.category === cat).length;
    });
    return counts;
  }, [items]);

  // Enhanced multi-token keyword search and multi-criteria filtering
  const listing = useMemo(() => {
    const tokens = query.trim().toLowerCase().split(/\s+/).filter(Boolean);

    let a = items.filter((x) => {
      const matchesCategory = category === 'all' || x.category === category;
      const matchesCondition = conditionFilter === 'all' || x.condition === conditionFilter;

      // Smart multi-word search across title, category, condition, seller, pickup, and description
      const searchableBlob = `${x.title} ${x.category} ${x.condition} ${x.description || ''} ${x.pickup || ''} ${x.seller || ''}`.toLowerCase();
      const matchesQuery = tokens.length === 0 || tokens.every((token) => searchableBlob.includes(token));

      const matchesMinPrice = minPrice === '' || Number(x.price) >= Number(minPrice);
      const matchesMaxPrice = maxPrice === '' || Number(x.price) <= Number(maxPrice);
      const matchesStatus = !hideSold || x.status === 'active';

      return matchesCategory && matchesCondition && matchesQuery && matchesMinPrice && matchesMaxPrice && matchesStatus;
    });

    if (sort === 'low') a.sort((a, b) => a.price - b.price);
    if (sort === 'high') a.sort((a, b) => b.price - a.price);
    if (sort === 'newest') a.sort((a, b) => (b.id > a.id ? 1 : -1));
    if (sort === 'condition') {
      const conditionRank = { new: 1, 'like-new': 2, used: 3, worn: 4 };
      a.sort((a, b) => (conditionRank[a.condition] || 99) - (conditionRank[b.condition] || 99));
    }
    return a;
  }, [items, category, conditionFilter, query, sort, minPrice, maxPrice, hideSold]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (category !== 'all') count++;
    if (conditionFilter !== 'all') count++;
    if (query.trim() !== '') count++;
    if (minPrice !== '') count++;
    if (maxPrice !== '') count++;
    if (hideSold) count++;
    if (sort !== 'featured') count++;
    return count;
  }, [category, conditionFilter, query, minPrice, maxPrice, hideSold, sort]);

  function resetFilters() {
    setCategory('all');
    setConditionFilter('all');
    setQuery('');
    setMinPrice('');
    setMaxPrice('');
    setHideSold(false);
    setSort('featured');
    setNotice('All search filters reset.');
  }

  function handleQuickSearch(suggestion) {
    if (suggestion.type === 'query') setQuery(suggestion.value);
    if (suggestion.type === 'budget') setMaxPrice(suggestion.value);
    if (suggestion.type === 'condition') setConditionFilter(suggestion.value);
  }

  function toggleCompare(id) {
    if (comparedIds.includes(id)) {
      setComparedIds(comparedIds.filter((itemId) => itemId !== id));
    } else {
      if (comparedIds.length >= 3) {
        setNotice('You can compare up to 3 items at a time. Remove one to add another.');
        return;
      }
      setComparedIds([...comparedIds, id]);
    }
  }

  function startEdit(item) {
    if (item && item.owner !== 'you') return;
    setFieldErrors({});
    setEditor({
      id: item?.id || null,
      form: item
        ? {
            title: item.title,
            price: String(item.price),
            category: item.category,
            condition: item.condition,
            description: item.description,
            pickup: item.pickup || '',
            status: item.status,
            photoUrl: item.photos?.[0] || '',
            emoji: item.emoji || '📦',
          }
        : { ...emptyForm },
    });
  }

  function closeEditorSafely() {
    if (!editor) return;
    const f = editor.form;
    const hasData = f.title.trim() || f.price.trim() || f.description.trim() || f.pickup.trim() || f.photoUrl.trim();
    if (hasData) {
      const confirmClose = window.confirm('You have unsaved changes. Discard and close?');
      if (!confirmClose) return;
    }
    setEditor(null);
    setFieldErrors({});
  }

  function submit(event) {
    event.preventDefault();
    const f = editor.form;
    const errors = validateForm(f);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    const original = editor.id ? items.find((x) => x.id === editor.id) : null;
    const customPhotos = f.photoUrl.trim()
      ? [f.photoUrl.trim(), ...(original?.photos?.slice(1) || [])]
      : original?.photos || [];

    const next = {
      title: f.title.trim(),
      price: Number(f.price),
      category: f.category,
      condition: f.condition,
      description: f.description.trim(),
      pickup: f.pickup.trim(),
      status: f.status,
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
      setItems([{ ...next, id: `m-${Date.now()}` }, ...items]);
      setNotice('Your item was published successfully.');
    }
    setEditor(null);
    setSelected(null);
    setFieldErrors({});
  }

  function reset() {
    setItems(seed);
    setSelected(null);
    setEditor(null);
    setComparedIds([]);
    setShowCompareModal(false);
    resetFilters();
    setNotice('Example items restored.');
  }

  function copyToClipboard(text) {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        setCopiedEmail(true);
        setTimeout(() => setCopiedEmail(false), 2200);
      });
    }
  }

  const comparedItems = useMemo(() => {
    return items.filter((it) => comparedIds.includes(it.id));
  }, [items, comparedIds]);

  const lowestPriceAmongCompared = useMemo(() => {
    if (comparedItems.length < 2) return null;
    return Math.min(...comparedItems.map((i) => i.price));
  }, [comparedItems]);

  return (
    <div className="market-app">
      <div className="utility">
        <span>Campus Exchange • Student Marketplace</span>
        <span>Trusted by students • All prices in EGP • Current User: You</span>
      </div>

      <header className="navigation">
        <button
          className="brand"
          onClick={() => {
            setSelected(null);
            setCategory('all');
          }}
        >
          <span className="brand-icon">✳</span> CAMPUS<span className="brand-alt">exchange</span>
        </button>
        <nav>
          <a href="#discover">Browse items</a>
          <button onClick={() => setCategory('textbooks')} className={category === 'textbooks' ? 'active-link' : ''}>
            Textbooks ({categoryCounts.textbooks})
          </button>
          <button onClick={() => setCategory('electronics')} className={category === 'electronics' ? 'active-link' : ''}>
            Electronics ({categoryCounts.electronics})
          </button>
          {comparedIds.length > 0 && (
            <button className="nav-compare-badge" onClick={() => setShowCompareModal(true)}>
              ⚖ Compare ({comparedIds.length})
            </button>
          )}
        </nav>
        <div className="nav-actions">
          <span className="usercircle" title="Logged in as You (you@example.com)">
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
            <p>Compare second-hand essentials, find budget-friendly items, or turn your unused gear into cash.</p>
            <div className="promo-buttons">
              <button onClick={() => document.getElementById('discover')?.scrollIntoView({ behavior: 'smooth' })}>
                Explore listings <span>↗</span>
              </button>
              <button className="promo-sell-btn" onClick={() => startEdit(null)}>
                Sell your item now <span>+</span>
              </button>
            </div>
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
              <p>Search across titles, condition, sellers, and pickup spots. Press <code>/</code> to search.</p>
            </div>

            <div className="discover-right">
              {/* Search Bar with clear button and keyboard hint */}
              <label className="search">
                <span className="search-icon">⌕</span>
                <input
                  ref={searchInputRef}
                  aria-label="Search listings"
                  placeholder="Search keywords, seller, location... (Press /)"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                {query ? (
                  <button className="clear-search-btn" onClick={() => setQuery('')} title="Clear search">
                    ×
                  </button>
                ) : (
                  <kbd className="search-kbd-hint">/</kbd>
                )}
              </label>

              {/* Sorting */}
              <label className="sort">
                <span>Sort by</span>
                <select value={sort} onChange={(e) => setSort(e.target.value)}>
                  <option value="featured">Featured</option>
                  <option value="low">Price: Low to High</option>
                  <option value="high">Price: High to Low</option>
                  <option value="condition">Condition: Best First</option>
                  <option value="newest">Newest First</option>
                </select>
              </label>
            </div>
          </div>

          {/* Popular / Quick Searches Bar */}
          <div className="quick-searches-row">
            <span className="quick-label">Quick filters:</span>
            {popularSearches.map((s) => (
              <button
                key={s.label}
                type="button"
                className="quick-search-pill"
                onClick={() => handleQuickSearch(s)}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Master Filters Toolbar: Category, Condition, Budget & Availability */}
          <div className="filters-toolbar">
            {/* Category Pills with Live Item Counts and Emojis */}
            <div className="category-row">
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={category === c ? 'on' : ''}
                  aria-pressed={category === c}
                >
                  <span className="cat-icon">{categoryIcons[c] || '📦'}</span>
                  <span>{c === 'all' ? 'All items' : cap(c)}</span>
                  <span className="cat-badge">{categoryCounts[c] ?? 0}</span>
                </button>
              ))}
            </div>

            {/* Condition & Budget Toolbar */}
            <div className="affordability-controls">
              {/* Condition Filter */}
              <div className="filter-group">
                <span className="control-label">Condition:</span>
                <select
                  value={conditionFilter}
                  onChange={(e) => setConditionFilter(e.target.value)}
                  className="filter-select"
                  aria-label="Filter by item condition"
                >
                  <option value="all">All Conditions</option>
                  {conditions.map((cond) => (
                    <option value={cond} key={cond}>
                      {cap(cond)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Budget / Price Range Group */}
              <div className="budget-group">
                <span className="control-label">Price Range (EGP):</span>
                <div className="budget-inputs-wrap">
                  <input
                    type="number"
                    min="0"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    aria-label="Filter by minimum price"
                    className="custom-budget-input"
                  />
                  <span className="budget-dash">–</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    aria-label="Filter by maximum price"
                    className="custom-budget-input"
                  />
                </div>

                <div className="budget-chips">
                  <button
                    type="button"
                    className={`budget-chip ${maxPrice === '200' && minPrice === '' ? 'active' : ''}`}
                    onClick={() => {
                      setMinPrice('');
                      setMaxPrice('200');
                    }}
                  >
                    ≤ 200 EGP
                  </button>
                  <button
                    type="button"
                    className={`budget-chip ${maxPrice === '500' && minPrice === '' ? 'active' : ''}`}
                    onClick={() => {
                      setMinPrice('');
                      setMaxPrice('500');
                    }}
                  >
                    ≤ 500 EGP
                  </button>
                  <button
                    type="button"
                    className={`budget-chip ${maxPrice === '1000' && minPrice === '' ? 'active' : ''}`}
                    onClick={() => {
                      setMinPrice('');
                      setMaxPrice('1000');
                    }}
                  >
                    ≤ 1,000 EGP
                  </button>
                </div>
              </div>

              {/* Hide Sold Items Toggle */}
              <label className="hide-sold-toggle">
                <input
                  type="checkbox"
                  checked={hideSold}
                  onChange={(e) => setHideSold(e.target.checked)}
                />
                <span>Hide sold items</span>
              </label>
            </div>

            {/* Active Filter Chips / Removable Pills */}
            {activeFiltersCount > 0 && (
              <div className="active-filters-chips-row">
                <span className="active-chips-label">Active filters:</span>
                {category !== 'all' && (
                  <span className="active-filter-tag">
                    Category: <strong>{cap(category)}</strong>
                    <button onClick={() => setCategory('all')} aria-label="Clear category filter">
                      ×
                    </button>
                  </span>
                )}
                {conditionFilter !== 'all' && (
                  <span className="active-filter-tag">
                    Condition: <strong>{cap(conditionFilter)}</strong>
                    <button onClick={() => setConditionFilter('all')} aria-label="Clear condition filter">
                      ×
                    </button>
                  </span>
                )}
                {query.trim() !== '' && (
                  <span className="active-filter-tag">
                    Keyword: <strong>"{query}"</strong>
                    <button onClick={() => setQuery('')} aria-label="Clear search keyword">
                      ×
                    </button>
                  </span>
                )}
                {minPrice !== '' && (
                  <span className="active-filter-tag">
                    Min: <strong>{minPrice} EGP</strong>
                    <button onClick={() => setMinPrice('')} aria-label="Clear minimum price filter">
                      ×
                    </button>
                  </span>
                )}
                {maxPrice !== '' && (
                  <span className="active-filter-tag">
                    Max: <strong>{maxPrice} EGP</strong>
                    <button onClick={() => setMaxPrice('')} aria-label="Clear maximum price filter">
                      ×
                    </button>
                  </span>
                )}
                {hideSold && (
                  <span className="active-filter-tag">
                    <strong>Active only</strong>
                    <button onClick={() => setHideSold(false)} aria-label="Show sold items">
                      ×
                    </button>
                  </span>
                )}
                <button className="reset-filters-btn" onClick={resetFilters}>
                  Clear all filters ({activeFiltersCount})
                </button>
              </div>
            )}
          </div>

          <div className="discovery-status-bar">
            <span className="results-count">
              Showing <strong>{listing.length}</strong> {listing.length === 1 ? 'item' : 'items'}
              {category !== 'all' && ` in ${cap(category)}`}
              {conditionFilter !== 'all' && ` (${cap(conditionFilter)})`}
              {minPrice !== '' && ` from EGP ${Number(minPrice).toLocaleString()}`}
              {maxPrice !== '' && ` up to EGP ${Number(maxPrice).toLocaleString()}`}
              {hideSold && ' • Active listings only'}
            </span>
          </div>

          {notice && (
            <div className="notice" role="status">
              <span>{notice}</span>
              <button onClick={() => setNotice('')} aria-label="Dismiss notice">
                ×
              </button>
            </div>
          )}

          <div className="listing-grid">
            {listing.map((item) => {
              const isCompared = comparedIds.includes(item.id);
              const isOwner = item.owner === 'you';
              return (
                <article className={`product ${item.status === 'sold' ? 'item-sold' : ''}`} key={item.id}>
                  <div className="photo-container">
                    <button className="photo" onClick={() => setSelected(item.id)}>
                      <span className="stamp">{cap(item.condition)}</span>
                      <ListingImage src={item.photos?.[0]} alt={item.title} emoji={item.emoji} className="listing-img" />
                      <span className="category-caption">{cap(item.category)}</span>
                    </button>
                    {isOwner && <span className="owner-badge">Your Listing</span>}
                  </div>

                  <div className="prod-details">
                    <div className="prod-topline">
                      <span className="muted">{item.category}</span>
                      <span className={item.status === 'sold' ? 'soldstatus' : 'instock'}>
                        {item.status.toUpperCase()}
                      </span>
                    </div>

                    <h3>{item.title}</h3>
                    <p>{item.description || 'No additional description provided.'}</p>

                    <div className="costline">
                      <strong>EGP {item.price.toLocaleString()}</strong>
                      <span className="pickup-preview" title={item.pickup || 'Campus meetup'}>
                        📍 {item.pickup || 'On-campus'}
                      </span>
                    </div>

                    <div className="card-actions">
                      <button className="details-button" onClick={() => setSelected(item.id)}>
                        View details <span>↗</span>
                      </button>
                      <button
                        type="button"
                        className={`compare-toggle-btn ${isCompared ? 'compared' : ''}`}
                        onClick={() => toggleCompare(item.id)}
                        aria-label={isCompared ? `Remove ${item.title} from comparison` : `Compare ${item.title}`}
                        title={isCompared ? 'Remove from comparison' : 'Add to side-by-side comparison'}
                      >
                        {isCompared ? '✓ Compared' : '+ Compare'}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}

            {listing.length === 0 && (
              <div className="noresults-box">
                <span className="noresults-icon">🔍</span>
                <h3>No items match your criteria</h3>
                <p>Try clearing your search query, adjusting your budget range, or resetting filters.</p>
                <button className="sell-cta" onClick={resetFilters}>
                  Reset all filters
                </button>
              </div>
            )}
          </div>
        </section>

        <footer>
          <strong>CAMPUS exchange</strong>
          <span>From students, for students. Safe on-campus meetups.</span>
          <button onClick={reset}>Reset demo data</button>
        </footer>
      </main>

      {/* Floating Comparison Tray (Sticky Dock) */}
      {comparedIds.length > 0 && (
        <aside className="compare-dock" aria-label="Item comparison tray">
          <div className="compare-dock-inner">
            <div className="compare-dock-info">
              <strong>⚖ Compare Items ({comparedIds.length}/3)</strong>
              <div className="compare-thumbnails">
                {comparedItems.map((cItem) => (
                  <div key={cItem.id} className="compare-thumb-pill">
                    <span>{cItem.emoji}</span>
                    <span className="thumb-title">{cItem.title}</span>
                    <button
                      type="button"
                      className="thumb-remove"
                      onClick={() => toggleCompare(cItem.id)}
                      aria-label={`Remove ${cItem.title}`}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div className="compare-dock-actions">
              <button className="compare-clear-btn" onClick={() => setComparedIds([])}>
                Clear
              </button>
              <button className="compare-launch-btn" onClick={() => setShowCompareModal(true)}>
                Compare Now ({comparedIds.length})
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* Side-by-Side Comparison Modal */}
      {showCompareModal && (
        <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && setShowCompareModal(false)}>
          <section className="compare-modal" role="dialog" aria-modal="true" aria-label="Compare listings side by side">
            <div className="modal-head">
              <div>
                <p className="section-kicker">CAMPUS EXCHANGE • COMPARISON</p>
                <h2>Compare Second-Hand Items</h2>
                <p>Review key attributes, condition, price, and pickup location side-by-side.</p>
              </div>
              <button className="close" onClick={() => setShowCompareModal(false)} aria-label="Close comparison">
                ×
              </button>
            </div>

            {comparedItems.length === 0 ? (
              <div className="empty-compare">
                <p>No items selected for comparison.</p>
                <button className="sell-cta" onClick={() => setShowCompareModal(false)}>
                  Back to listings
                </button>
              </div>
            ) : (
              <div className="compare-table-container">
                <table className="compare-table">
                  <thead>
                    <tr>
                      <th className="feature-col">Feature</th>
                      {comparedItems.map((item) => (
                        <th key={item.id} className="item-col">
                          <div className="compare-head-card">
                            <div className="compare-img-wrap">
                              <ListingImage
                                src={item.photos?.[0]}
                                alt={item.title}
                                emoji={item.emoji}
                                className="compare-head-img"
                              />
                            </div>
                            <h4>{item.title}</h4>
                            <button
                              type="button"
                              className="remove-from-table-btn"
                              onClick={() => toggleCompare(item.id)}
                            >
                              Remove
                            </button>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="feature-col">Price</td>
                      {comparedItems.map((item) => {
                        const isCheapest = lowestPriceAmongCompared && item.price === lowestPriceAmongCompared;
                        return (
                          <td key={item.id} className="price-cell">
                            <strong>EGP {item.price.toLocaleString()}</strong>
                            {isCheapest && <span className="best-price-badge">★ Lowest Price</span>}
                          </td>
                        );
                      })}
                    </tr>
                    <tr>
                      <td className="feature-col">Condition</td>
                      {comparedItems.map((item) => (
                        <td key={item.id}>
                          <span className={`condition-tag condition-${item.condition}`}>{cap(item.condition)}</span>
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="feature-col">Category</td>
                      {comparedItems.map((item) => (
                        <td key={item.id}>{cap(item.category)}</td>
                      ))}
                    </tr>
                    <tr>
                      <td className="feature-col">Pickup Location</td>
                      {comparedItems.map((item) => (
                        <td key={item.id}>
                          📍 {item.pickup || <span className="muted">Arrange on campus</span>}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="feature-col">Status</td>
                      {comparedItems.map((item) => (
                        <td key={item.id}>
                          <span className={item.status === 'sold' ? 'soldstatus' : 'instock'}>
                            {item.status.toUpperCase()}
                          </span>
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="feature-col">Seller</td>
                      {comparedItems.map((item) => (
                        <td key={item.id}>{item.seller}</td>
                      ))}
                    </tr>
                    <tr>
                      <td className="feature-col">Description</td>
                      {comparedItems.map((item) => (
                        <td key={item.id} className="compare-desc-cell">
                          {item.description || 'No description provided.'}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="feature-col">Action</td>
                      {comparedItems.map((item) => (
                        <td key={item.id}>
                          <button
                            className="sell-cta compare-action-btn"
                            onClick={() => {
                              setShowCompareModal(false);
                              setSelected(item.id);
                            }}
                          >
                            View Item Details
                          </button>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      )}

      {/* Item Detail Modal */}
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
                <p className="section-kicker">
                  {cap(item.category)} · {cap(item.condition)}
                </p>
                <h2>{item.title}</h2>
                <h3 className="detail-price">EGP {item.price.toLocaleString()}</h3>
                <p className="item-description">{item.description || 'No description supplied.'}</p>
                <div className="detail-meta">
                  <p>
                    <strong>Pickup / Meetup</strong>
                    <br />
                    {item.pickup || 'Arrange directly on campus with seller'}
                  </p>
                  <p>
                    <strong>Seller</strong>
                    <br />
                    {item.seller} ({item.sellerEmail})
                  </p>
                </div>
                <p className="muted">
                  Status:{' '}
                  <span className={item.status === 'sold' ? 'soldstatus' : 'instock'}>
                    {item.status.toUpperCase()}
                  </span>
                </p>

                <div className="detail-actions">
                  {item.owner === 'you' ? (
                    <button className="sell-cta" onClick={() => startEdit(item)}>
                      Edit your listing
                    </button>
                  ) : item.status === 'sold' ? (
                    <p className="fineprint">This item is marked as sold.</p>
                  ) : (
                    <div className="contact-button-group">
                      <a
                        className="sell-cta contact-seller"
                        href={`mailto:${item.sellerEmail}?subject=${subject}&body=${body}`}
                      >
                        ✉ Contact seller via email
                      </a>
                      <button
                        type="button"
                        className="copy-email-btn"
                        onClick={() => copyToClipboard(item.sellerEmail)}
                        title="Copy seller's email address to clipboard"
                      >
                        {copiedEmail ? '✓ Copied to clipboard!' : '📋 Copy seller email'}
                      </button>
                    </div>
                  )}

                  <button
                    type="button"
                    className={`detail-compare-toggle ${comparedIds.includes(item.id) ? 'active' : ''}`}
                    onClick={() => toggleCompare(item.id)}
                  >
                    {comparedIds.includes(item.id) ? '✓ In comparison' : '+ Add to comparison'}
                  </button>
                </div>
              </section>
            </div>
          );
        })()}

      {/* Sell / Edit Listing Modal with Inline Validation & Image/Emoji Selector */}
      {editor && (
        <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && closeEditorSafely()}>
          <section
            className="sell-modal"
            role="dialog"
            aria-modal="true"
            aria-label={editor.id ? 'Edit item' : 'Sell item'}
          >
            <div className="modal-head">
              <div>
                <p className="section-kicker">CAMPUS EXCHANGE</p>
                <h2>{editor.id ? 'Edit your listing' : 'Sell an item'}</h2>
                <p>Provide accurate details so fellow students can easily find and evaluate your item.</p>
              </div>
              <button className="close" onClick={closeEditorSafely} aria-label="Cancel and close">
                ×
              </button>
            </div>

            <form onSubmit={submit} noValidate>
              <div className="field-grid">
                {/* Item Title */}
                <label className="wide">
                  <span>Item title *</span>
                  <input
                    value={editor.form.title}
                    onChange={(e) => {
                      setEditor((s) => ({ ...s, form: { ...s.form, title: e.target.value } }));
                      if (fieldErrors.title) setFieldErrors((prev) => ({ ...prev, title: '' }));
                    }}
                    placeholder="e.g. Calculus Early Transcendentals, Desk Fan, Scientific Calculator"
                    className={fieldErrors.title ? 'input-error' : ''}
                    aria-invalid={Boolean(fieldErrors.title)}
                  />
                  {fieldErrors.title && <span className="field-error-text">⚠ {fieldErrors.title}</span>}
                </label>

                {/* Price */}
                <label>
                  <span>Price (EGP) *</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={editor.form.price}
                    onChange={(e) => {
                      setEditor((s) => ({ ...s, form: { ...s.form, price: e.target.value } }));
                      if (fieldErrors.price) setFieldErrors((prev) => ({ ...prev, price: '' }));
                    }}
                    placeholder="0 for free, or price in EGP"
                    className={fieldErrors.price ? 'input-error' : ''}
                    aria-invalid={Boolean(fieldErrors.price)}
                  />
                  {fieldErrors.price && <span className="field-error-text">⚠ {fieldErrors.price}</span>}
                </label>

                {/* Category */}
                <label>
                  <span>Category *</span>
                  <select
                    value={editor.form.category}
                    onChange={(e) => {
                      setEditor((s) => ({ ...s, form: { ...s.form, category: e.target.value } }));
                      if (fieldErrors.category) setFieldErrors((prev) => ({ ...prev, category: '' }));
                    }}
                    className={fieldErrors.category ? 'input-error' : ''}
                    aria-invalid={Boolean(fieldErrors.category)}
                  >
                    <option value="">Select category</option>
                    {categories.slice(1).map((c) => (
                      <option value={c} key={c}>
                        {cap(c)}
                      </option>
                    ))}
                  </select>
                  {fieldErrors.category && <span className="field-error-text">⚠ {fieldErrors.category}</span>}
                </label>

                {/* Condition */}
                <label>
                  <span>Condition *</span>
                  <select
                    value={editor.form.condition}
                    onChange={(e) => {
                      setEditor((s) => ({ ...s, form: { ...s.form, condition: e.target.value } }));
                      if (fieldErrors.condition) setFieldErrors((prev) => ({ ...prev, condition: '' }));
                    }}
                    className={fieldErrors.condition ? 'input-error' : ''}
                    aria-invalid={Boolean(fieldErrors.condition)}
                  >
                    <option value="">Select condition</option>
                    {conditions.map((c) => (
                      <option value={c} key={c}>
                        {cap(c)}
                      </option>
                    ))}
                  </select>
                  {fieldErrors.condition && <span className="field-error-text">⚠ {fieldErrors.condition}</span>}
                </label>

                {/* Status (if editing) */}
                {editor.id && (
                  <label>
                    <span>Listing Status *</span>
                    <select
                      value={editor.form.status}
                      onChange={(e) =>
                        setEditor((s) => ({ ...s, form: { ...s.form, status: e.target.value } }))
                      }
                    >
                      <option value="active">Active (Available)</option>
                      <option value="sold">Sold</option>
                    </select>
                  </label>
                )}

                {/* Photo URL Input */}
                <label className="wide">
                  <span>Photo URL (Optional)</span>
                  <input
                    type="url"
                    value={editor.form.photoUrl}
                    onChange={(e) =>
                      setEditor((s) => ({ ...s, form: { ...s.form, photoUrl: e.target.value } }))
                    }
                    placeholder="https://images.unsplash.com/... (paste image web link)"
                  />
                  <small className="email-helper">Paste an image URL, or choose a representative item emoji below.</small>
                </label>

                {/* Emoji Representation Picker */}
                <label className="wide">
                  <span>Item Icon / Emoji</span>
                  <div className="emoji-picker-row">
                    {quickEmojis.map((em) => (
                      <button
                        type="button"
                        key={em}
                        className={`emoji-btn ${editor.form.emoji === em ? 'selected' : ''}`}
                        onClick={() => setEditor((s) => ({ ...s, form: { ...s.form, emoji: em } }))}
                      >
                        {em}
                      </button>
                    ))}
                  </div>
                </label>

                {/* Description */}
                <label className="wide">
                  <span>Description</span>
                  <textarea
                    value={editor.form.description}
                    onChange={(e) =>
                      setEditor((s) => ({ ...s, form: { ...s.form, description: e.target.value } }))
                    }
                    placeholder="Describe item condition, edition, included accessories, or reasons for selling..."
                    rows="4"
                  />
                </label>

                {/* Pickup Location */}
                <label className="wide">
                  <span>Pickup / Meetup Location on Campus</span>
                  <input
                    value={editor.form.pickup}
                    onChange={(e) =>
                      setEditor((s) => ({ ...s, form: { ...s.form, pickup: e.target.value } }))
                    }
                    placeholder="e.g. GUC Library entrance, Main Cafeteria, Gate 3"
                  />
                </label>

                {/* Seller Contact Email (Readonly) */}
                <label className="wide">
                  <span>Seller contact email</span>
                  <input value={currentUser.email} readOnly aria-readonly="true" className="readonly-input" />
                  <small className="email-helper">
                    Taken automatically from your registered campus account so buyers can reach you.
                  </small>
                </label>
              </div>

              {Object.keys(fieldErrors).length > 0 && (
                <div className="alert" role="alert">
                  Please fix the highlighted fields above before saving your listing.
                </div>
              )}

              <div className="modal-foot">
                <button type="button" onClick={closeEditorSafely}>
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
