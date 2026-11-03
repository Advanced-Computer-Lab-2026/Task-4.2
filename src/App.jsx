import React, { useEffect, useMemo, useState, useCallback } from 'react';

// ─── Constants ───────────────────────────────────────────────────────────────
const KEY = 'acl-marketplace-v3';
const categories = ['all', 'textbooks', 'electronics', 'furniture', 'clothing', 'other'];
const conditions = ['new', 'like-new', 'used', 'worn'];
const currentUser = { name: 'You', email: 'you@example.com' };
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

// ─── Helpers ─────────────────────────────────────────────────────────────────
function saved() {
  try {
    const value = JSON.parse(localStorage.getItem(KEY));
    return Array.isArray(value) ? value : seed;
  } catch {
    return seed;
  }
}

const cap = s => s === 'like-new' ? 'Like new' : (s || '').replace(/\b\w/g, m => m.toUpperCase());

function findError(form) {
  if (!form.title.trim()) return 'Please complete the item title.';
  if (form.price.trim() === '' || !Number.isFinite(Number(form.price)) || Number(form.price) < 0)
    return 'Enter a price of zero or more.';
  if (!categories.slice(1).includes(form.category)) return 'Choose a category.';
  if (!conditions.includes(form.condition)) return 'Choose an item condition.';
  if (!['active', 'sold'].includes(form.status)) return 'Choose a valid status.';
  return '';
}

const conditionColor = { 'new': '#1a8b67', 'like-new': '#2d7ab5', 'used': '#8c6e2f', 'worn': '#9e4b4b' };
const conditionBg = { 'new': '#edfaf4', 'like-new': '#e8f4fd', 'used': '#fdf6e3', 'worn': '#fdf0f0' };

// ─── Sub-components ──────────────────────────────────────────────────────────
function ListingImage({ src, alt, emoji, className = '' }) {
  const [broken, setBroken] = useState(false);
  useEffect(() => setBroken(false), [src]);
  return src && !broken
    ? <img className={className} src={src} alt={alt} loading="lazy" onError={() => setBroken(true)} />
    : <span className="item-emoji" aria-label="Photo unavailable">{emoji || '📦'}</span>;
}

function ConditionBadge({ condition }) {
  return (
    <span className="condition-badge" style={{
      background: conditionBg[condition] || '#f5f5f5',
      color: conditionColor[condition] || '#555',
    }}>
      {cap(condition)}
    </span>
  );
}

function PriceRangeFilter({ items, priceRange, setPriceRange }) {
  const allPrices = items.map(i => i.price).filter(p => typeof p === 'number');
  const min = allPrices.length ? Math.min(...allPrices) : 0;
  const max = allPrices.length ? Math.max(...allPrices) : 5000;

  return (
    <div className="price-range-filter">
      <span className="filter-label">Price range</span>
      <div className="price-inputs">
        <input
          type="number"
          aria-label="Minimum price"
          min={0}
          max={priceRange[1]}
          value={priceRange[0]}
          onChange={e => setPriceRange([Math.max(0, Number(e.target.value)), priceRange[1]])}
          placeholder="Min"
        />
        <span className="price-dash">–</span>
        <input
          type="number"
          aria-label="Maximum price"
          min={priceRange[0]}
          value={priceRange[1]}
          onChange={e => setPriceRange([priceRange[0], Math.max(priceRange[0], Number(e.target.value))])}
          placeholder="Max"
        />
        <span className="price-currency">EGP</span>
      </div>
    </div>
  );
}

function WishlistButton({ itemId, wishlist, toggleWishlist }) {
  const saved = wishlist.includes(itemId);
  return (
    <button
      className={`wishlist-btn${saved ? ' saved' : ''}`}
      aria-label={saved ? 'Remove from saved' : 'Save item'}
      title={saved ? 'Remove from saved' : 'Save for later'}
      onClick={e => { e.stopPropagation(); toggleWishlist(itemId); }}
    >
      {saved ? '♥' : '♡'}
    </button>
  );
}

function CompareToggle({ itemId, compareList, toggleCompare }) {
  const inCompare = compareList.includes(itemId);
  const full = compareList.length >= 3 && !inCompare;
  return (
    <button
      className={`compare-btn${inCompare ? ' in-compare' : ''}${full ? ' disabled' : ''}`}
      aria-label={inCompare ? 'Remove from comparison' : 'Add to compare'}
      title={full ? 'Compare up to 3 items' : (inCompare ? 'Remove from compare' : 'Compare')}
      onClick={e => { e.stopPropagation(); if (!full) toggleCompare(itemId); }}
      aria-pressed={inCompare}
    >
      {inCompare ? '✓ Comparing' : '⇄ Compare'}
    </button>
  );
}

function CompareBar({ compareList, items, onView, onRemove, onClear }) {
  if (!compareList.length) return null;
  const compareItems = compareList.map(id => items.find(x => x.id === id)).filter(Boolean);
  return (
    <div className="compare-bar" role="region" aria-label="Comparison tray">
      <div className="compare-bar-inner">
        <span className="compare-bar-label">Comparing {compareList.length} item{compareList.length !== 1 ? 's' : ''}</span>
        <div className="compare-chips">
          {compareItems.map(item => (
            <span key={item.id} className="compare-chip">
              {item.title.length > 22 ? item.title.slice(0, 20) + '…' : item.title}
              <button aria-label={`Remove ${item.title} from compare`} onClick={() => onRemove(item.id)}>×</button>
            </span>
          ))}
        </div>
        <div className="compare-bar-actions">
          <button className="compare-clear-btn" onClick={onClear}>Clear</button>
          {compareList.length >= 2 && (
            <button className="compare-view-btn" onClick={onView}>View comparison →</button>
          )}
        </div>
      </div>
    </div>
  );
}

function CompareModal({ compareList, items, onClose, onRemove, setSelected }) {
  const compareItems = compareList.map(id => items.find(x => x.id === id)).filter(Boolean);
  const fields = [
    { label: 'Price', key: 'price', render: item => `EGP ${item.price.toLocaleString()}` },
    { label: 'Category', key: 'category', render: item => cap(item.category) },
    { label: 'Condition', key: 'condition', render: item => cap(item.condition) },
    { label: 'Pickup', key: 'pickup', render: item => item.pickup || 'Arrange with seller' },
    { label: 'Seller', key: 'seller', render: item => item.seller },
    { label: 'Status', key: 'status', render: item => cap(item.status) },
  ];

  // Find the lowest price
  const minPrice = Math.min(...compareItems.map(i => i.price));

  return (
    <div className="overlay" onMouseDown={e => e.target === e.currentTarget && onClose()}>
      <section className="compare-modal" role="dialog" aria-modal="true" aria-label="Compare items">
        <div className="compare-modal-head">
          <h2>Compare Items</h2>
          <button className="close" aria-label="Close comparison" onClick={onClose}>×</button>
        </div>
        <div className="compare-table-wrap">
          <table className="compare-table">
            <thead>
              <tr>
                <th className="compare-field-col">Field</th>
                {compareItems.map(item => (
                  <th key={item.id} className="compare-item-col">
                    <div className="compare-item-head">
                      <div className="compare-item-img-wrap">
                        <ListingImage
                          src={item.photos?.[0]}
                          alt={item.title}
                          emoji={item.emoji}
                          className="compare-item-img"
                        />
                      </div>
                      <span className="compare-item-title">{item.title}</span>
                      <button
                        className="compare-remove-btn"
                        onClick={() => onRemove(item.id)}
                        aria-label={`Remove ${item.title}`}
                      >Remove</button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {fields.map(field => (
                <tr key={field.key}>
                  <td className="compare-field-label">{field.label}</td>
                  {compareItems.map(item => (
                    <td
                      key={item.id}
                      className={`compare-cell${field.key === 'price' && item.price === minPrice && compareItems.length > 1 ? ' best-price' : ''}`}
                    >
                      {field.render(item)}
                      {field.key === 'price' && item.price === minPrice && compareItems.length > 1 && (
                        <span className="best-label">Best price</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
              <tr>
                <td className="compare-field-label">Description</td>
                {compareItems.map(item => (
                  <td key={item.id} className="compare-cell compare-desc">
                    {item.description || 'No description.'}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="compare-field-label"></td>
                {compareItems.map(item => (
                  <td key={item.id} className="compare-cell compare-action-cell">
                    <button
                      className="view-detail-btn"
                      onClick={() => { setSelected(item.id); onClose(); }}
                    >View listing</button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function MyListingsPanel({ items, onEdit, onSelect, onClose, wishlist, toggleWishlist }) {
  const myItems = items.filter(x => x.owner === 'you');
  return (
    <div className="overlay" onMouseDown={e => e.target === e.currentTarget && onClose()}>
      <section className="my-listings-modal" role="dialog" aria-modal="true" aria-label="My listings">
        <div className="modal-head">
          <div>
            <p className="section-kicker">MY ACCOUNT</p>
            <h2>My Listings</h2>
            <p>{myItems.length} listing{myItems.length !== 1 ? 's' : ''}</p>
          </div>
          <button className="close" aria-label="Close" onClick={onClose}>×</button>
        </div>
        {myItems.length === 0 ? (
          <p className="no-listings">You haven't listed anything yet.</p>
        ) : (
          <ul className="my-listings-list">
            {myItems.map(item => (
              <li key={item.id} className="my-listing-row">
                <div className="my-listing-img-wrap">
                  <ListingImage
                    src={item.photos?.[0]}
                    alt={item.title}
                    emoji={item.emoji}
                    className="my-listing-img"
                  />
                </div>
                <div className="my-listing-info">
                  <div className="my-listing-top">
                    <span className="my-listing-title">{item.title}</span>
                    <span className={item.status === 'sold' ? 'soldstatus' : 'instock'}>
                      {item.status.toUpperCase()}
                    </span>
                  </div>
                  <span className="my-listing-price">EGP {item.price.toLocaleString()}</span>
                  <span className="my-listing-cat">{cap(item.category)} · {cap(item.condition)}</span>
                </div>
                <div className="my-listing-actions">
                  <button className="my-listing-view-btn" onClick={() => { onSelect(item.id); onClose(); }}>View</button>
                  <button className="my-listing-edit-btn" onClick={() => { onEdit(item); onClose(); }}>Edit</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

// ─── Main App ────────────────────────────────────────────────────────────────
export default function App() {
  const [items, setItems] = useState(saved);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState('featured');
  const [selected, setSelected] = useState(null);
  const [editor, setEditor] = useState(null);
  const [error, setError] = useState('');
  const [activePhoto, setActivePhoto] = useState(0);
  const [notice, setNotice] = useState('');
  const [wishlist, setWishlist] = useState(() => {
    try { return JSON.parse(localStorage.getItem('acl-wishlist-v1')) || []; } catch { return []; }
  });
  const [compareList, setCompareList] = useState([]);
  const [showCompare, setShowCompare] = useState(false);
  const [showMyListings, setShowMyListings] = useState(false);
  const [showSavedOnly, setShowSavedOnly] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 99999]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => localStorage.setItem(KEY, JSON.stringify(items)), [items]);
  useEffect(() => localStorage.setItem('acl-wishlist-v1', JSON.stringify(wishlist)), [wishlist]);
  useEffect(() => setActivePhoto(0), [selected]);

  const toggleWishlist = useCallback((id) => {
    setWishlist(w => w.includes(id) ? w.filter(x => x !== id) : [...w, id]);
  }, []);

  const toggleCompare = useCallback((id) => {
    setCompareList(c => c.includes(id) ? c.filter(x => x !== id) : [...c, id]);
  }, []);

  const listing = useMemo(() => {
    let a = items.filter(x =>
      (category === 'all' || x.category === category) &&
      `${x.title} ${x.category} ${x.description}`.toLowerCase().includes(query.toLowerCase()) &&
      x.price >= priceRange[0] && x.price <= priceRange[1] &&
      (!showSavedOnly || wishlist.includes(x.id))
    );
    if (sort === 'low') a.sort((a, b) => a.price - b.price);
    if (sort === 'high') a.sort((a, b) => b.price - a.price);
    return a;
  }, [items, category, query, sort, priceRange, showSavedOnly, wishlist]);

  function startEdit(item) {
    if (item && item.owner !== 'you') return;
    setError('');
    setEditor({
      id: item?.id || null,
      form: item
        ? { title: item.title, price: String(item.price), category: item.category, condition: item.condition, description: item.description, pickup: item.pickup || '', status: item.status }
        : { ...emptyForm }
    });
  }

  function submit(event) {
    event.preventDefault();
    const f = editor.form;
    const err = findError(f);
    if (err) { setError('Unable to save item. Check the form.'); return; }
    const original = editor.id ? items.find(x => x.id === editor.id) : null;
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
      setItems(items.map(x => x.id === editor.id ? { ...x, ...next } : x));
      setNotice('Changes saved.');
    } else {
      setItems([{ ...next, id: `m-${Date.now()}`, status: 'active' }, ...items]);
      setNotice('Item listed successfully!');
    }
    setEditor(null);
    setSelected(null);
  }

  function reset() {
    setItems(seed);
    setSelected(null);
    setEditor(null);
    setQuery('');
    setCategory('all');
    setSort('featured');
    setWishlist([]);
    setCompareList([]);
    setPriceRange([0, 99999]);
    setShowSavedOnly(false);
    setNotice('Example items restored.');
  }

  const allPrices = items.map(i => i.price);
  const globalMax = allPrices.length ? Math.max(...allPrices) : 5000;

  // ── Detail panel ──────────────────────────────────────────────────────────
  const detailPanel = (() => {
    if (!selected) return null;
    const item = items.find(x => x.id === selected);
    if (!item) return null;
    const images = item.photos || [];
    const subject = encodeURIComponent(`Campus Exchange: ${item.title}`);
    const body = encodeURIComponent(`Hi ${item.seller},\n\nI'm interested in your listing "${item.title}" (EGP ${item.price}). Is it still available?\n\n`);

    return (
      <div className="overlay" onMouseDown={e => e.target === e.currentTarget && setSelected(null)}>
        <section className="detail-panel" role="dialog" aria-modal="true" aria-label="Item details">
          <button className="close" aria-label="Close item details" onClick={() => setSelected(null)}>×</button>

          <div className="detail-visual">
            <ListingImage
              src={images[activePhoto] || images[0]}
              alt={`${item.title} photo ${activePhoto + 1}`}
              emoji={item.emoji}
              className="detail-img"
            />
            {item.owner !== 'you' && (
              <WishlistButton itemId={item.id} wishlist={wishlist} toggleWishlist={toggleWishlist} />
            )}
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

          <div className="detail-badges">
            <span className="section-kicker">{cap(item.category)}</span>
            <ConditionBadge condition={item.condition} />
            <span className={item.status === 'sold' ? 'soldstatus status-badge' : 'instock status-badge'}>
              {item.status.toUpperCase()}
            </span>
          </div>

          <h2>{item.title}</h2>
          <h3 className="detail-price">EGP {item.price.toLocaleString()}</h3>
          <p className="item-description">{item.description || 'No description supplied.'}</p>

          <div className="detail-meta">
            <div className="detail-meta-item">
              <span className="detail-meta-icon">📍</span>
              <div>
                <strong>Pickup</strong>
                <p>{item.pickup || 'Arrange directly with seller'}</p>
              </div>
            </div>
            <div className="detail-meta-item">
              <span className="detail-meta-icon">👤</span>
              <div>
                <strong>Seller</strong>
                <p>{item.seller}</p>
              </div>
            </div>
          </div>

          <div className="detail-actions">
            {item.owner === 'you'
              ? <button className="sell-cta full-width" onClick={() => startEdit(item)}>✏️ Edit your listing</button>
              : item.status === 'sold'
                ? <p className="fineprint">This item is marked as sold and is no longer available.</p>
                : (
                  <>
                    <a
                      className="sell-cta full-width contact-seller"
                      href={`mailto:${item.sellerEmail}?subject=${subject}&body=${body}`}
                    >
                      ✉ Contact seller
                    </a>
                    {!compareList.includes(item.id) && compareList.length < 3 && (
                      <button
                        className="outline-btn full-width"
                        onClick={() => { toggleCompare(item.id); setNotice('Added to comparison.'); }}
                      >
                        ⇄ Add to compare
                      </button>
                    )}
                  </>
                )
            }
          </div>
        </section>
      </div>
    );
  })();

  // ── Sell / edit modal ────────────────────────────────────────────────────
  const sellModal = editor && (
    <div className="overlay" onMouseDown={e => e.target === e.currentTarget && setEditor(null)}>
      <section className="sell-modal" role="dialog" aria-modal="true" aria-label={editor.id ? 'Edit item' : 'Sell item'}>
        <div className="modal-head">
          <div>
            <p className="section-kicker">CAMPUS EXCHANGE</p>
            <h2>{editor.id ? 'Edit your listing' : 'Sell an item'}</h2>
            <p>Add the details and we'll take care of the rest.</p>
          </div>
          <button className="close" aria-label="Close form" onClick={() => setEditor(null)}>×</button>
        </div>

        <form onSubmit={submit}>
          <div className="field-grid">
            <label>
              <span>Item title <abbr title="required">*</abbr></span>
              <input
                value={editor.form.title}
                onChange={e => setEditor(s => ({ ...s, form: { ...s.form, title: e.target.value } }))}
                placeholder="What are you selling?"
              />
            </label>

            <label>
              <span>Price (EGP) <abbr title="required">*</abbr></span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={editor.form.price}
                onChange={e => setEditor(s => ({ ...s, form: { ...s.form, price: e.target.value } }))}
                placeholder="0"
              />
            </label>

            <label>
              <span>Category <abbr title="required">*</abbr></span>
              <select
                value={editor.form.category}
                onChange={e => setEditor(s => ({ ...s, form: { ...s.form, category: e.target.value } }))}
              >
                <option value="">Select category</option>
                {categories.slice(1).map(c => <option value={c} key={c}>{cap(c)}</option>)}
              </select>
            </label>

            <label>
              <span>Condition <abbr title="required">*</abbr></span>
              <select
                value={editor.form.condition}
                onChange={e => setEditor(s => ({ ...s, form: { ...s.form, condition: e.target.value } }))}
              >
                <option value="">Select condition</option>
                {conditions.map(c => <option value={c} key={c}>{cap(c)}</option>)}
              </select>
            </label>

            <label className="wide">
              <span>Description</span>
              <textarea
                value={editor.form.description}
                onChange={e => setEditor(s => ({ ...s, form: { ...s.form, description: e.target.value } }))}
                placeholder="Describe the item — condition details, reason for selling, etc."
                rows="4"
              />
            </label>

            <label className="wide">
              <span>Pickup / meetup location</span>
              <input
                value={editor.form.pickup}
                onChange={e => setEditor(s => ({ ...s, form: { ...s.form, pickup: e.target.value } }))}
                placeholder="e.g. Library entrance or arrange on campus"
              />
            </label>

            <label className="wide">
              <span>Seller contact email</span>
              <input value={currentUser.email} readOnly aria-readonly="true" className="readonly-input" />
              <small className="email-helper">Taken from your registered account, so buyers can contact you about this item.</small>
            </label>

            {editor.id && (
              <label>
                <span>Status</span>
                <select
                  value={editor.form.status}
                  onChange={e => setEditor(s => ({ ...s, form: { ...s.form, status: e.target.value } }))}
                >
                  <option value="active">Active</option>
                  <option value="sold">Sold</option>
                </select>
              </label>
            )}
          </div>

          {error && <p className="alert" role="alert">{error}</p>}

          <div className="modal-foot">
            <button type="button" onClick={() => setEditor(null)}>Cancel</button>
            <button className="sell-cta" type="submit">
              {editor.id ? '✓ Save changes' : '+ Publish item'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );

  return (
    <div className="market-app">
      {/* ── Utility bar ───────────────────────────────────────────────────── */}
      <div className="utility">
        <span>Campus Exchange</span>
        <span>Trusted by students · All prices in EGP</span>
      </div>

      {/* ── Navigation ───────────────────────────────────────────────────── */}
      <header className="navigation">
        <button className="brand" onClick={() => { setSelected(null); setCategory('all'); setShowSavedOnly(false); }}>
          <span className="brand-icon">✳</span> CAMPUS<span className="brand-alt">exchange</span>
        </button>

        <nav>
          <a href="#discover">Browse items</a>
          <button onClick={() => setCategory('textbooks')}>Textbooks</button>
          <button onClick={() => setCategory('electronics')}>Electronics</button>
        </nav>

        <div className="nav-actions">
          <button
            className={`nav-icon-btn${showSavedOnly ? ' active-filter' : ''}`}
            aria-label={`Saved items (${wishlist.length})`}
            title="Saved items"
            onClick={() => setShowSavedOnly(s => !s)}
          >
            ♥{wishlist.length > 0 && <span className="nav-badge">{wishlist.length}</span>}
          </button>
          <button
            className="nav-icon-btn"
            aria-label="My listings"
            title="My listings"
            onClick={() => setShowMyListings(true)}
          >
            👤
          </button>
          <button className="sell-cta" onClick={() => startEdit(null)}>+ Sell an item</button>
        </div>
      </header>

      <main>
        {/* ── Hero / promo section ─────────────────────────────────────── */}
        <section className="promo">
          <div className="promo-copy">
            <span className="tag">THE CAMPUS MARKETPLACE</span>
            <h1>Everything you need,<br /><i>right around campus.</i></h1>
            <p>Browse little finds, big essentials and almost everything in between.</p>
            <button onClick={() => document.getElementById('discover')?.scrollIntoView({ behavior: 'smooth' })}>
              Explore listings <span>↗</span>
            </button>
          </div>
          <div className="promo-art">
            <span>📚</span><span>💡</span><span>🎧</span><span>🛋️</span>
          </div>
        </section>

        {/* ── Discovery section ────────────────────────────────────────── */}
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
                  placeholder="Search listings…"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                />
                {query && (
                  <button className="search-clear" aria-label="Clear search" onClick={() => setQuery('')}>×</button>
                )}
              </label>

              <label className="sort">
                <span>Sort</span>
                <select value={sort} onChange={e => setSort(e.target.value)}>
                  <option value="featured">Featured</option>
                  <option value="low">Price: low → high</option>
                  <option value="high">Price: high → low</option>
                </select>
              </label>

              <button
                className={`filter-toggle-btn${showFilters ? ' active' : ''}`}
                aria-expanded={showFilters}
                onClick={() => setShowFilters(s => !s)}
                aria-label="Toggle price filter"
              >
                ⚙ Filters{showFilters ? ' ▲' : ' ▼'}
              </button>
            </div>
          </div>

          {showFilters && (
            <div className="filter-panel">
              <PriceRangeFilter items={items} priceRange={priceRange} setPriceRange={setPriceRange} />
              <button
                className={`saved-filter-btn${showSavedOnly ? ' active' : ''}`}
                onClick={() => setShowSavedOnly(s => !s)}
                aria-pressed={showSavedOnly}
              >
                {showSavedOnly ? '♥ Showing saved' : '♡ Saved items only'}
              </button>
              <button className="reset-filters-btn" onClick={() => { setPriceRange([0, 99999]); setShowSavedOnly(false); }}>
                Reset filters
              </button>
            </div>
          )}

          {/* ── Category pills ──────────────────────────────────────────── */}
          <div className="category-row">
            {categories.map(c => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={category === c ? 'on' : ''}
                aria-pressed={category === c}
              >
                {c === 'all' ? 'All items' : cap(c)}
              </button>
            ))}
          </div>

          {/* ── Active filter summary ───────────────────────────────────── */}
          {(showSavedOnly || priceRange[0] > 0 || priceRange[1] < 99999) && (
            <div className="active-filters-row">
              <span className="active-filter-label">Active filters:</span>
              {showSavedOnly && (
                <span className="active-filter-chip">
                  Saved only <button aria-label="Remove saved filter" onClick={() => setShowSavedOnly(false)}>×</button>
                </span>
              )}
              {(priceRange[0] > 0 || priceRange[1] < 99999) && (
                <span className="active-filter-chip">
                  EGP {priceRange[0].toLocaleString()} – {priceRange[1] < 99999 ? priceRange[1].toLocaleString() : '∞'}
                  <button aria-label="Remove price filter" onClick={() => setPriceRange([0, 99999])}>×</button>
                </span>
              )}
            </div>
          )}

          {/* ── Notice ─────────────────────────────────────────────────── */}
          {notice && (
            <p className="notice" role="status">
              {notice} <button onClick={() => setNotice('')}>×</button>
            </p>
          )}

          {/* ── Listing grid ────────────────────────────────────────────── */}
          <div className="listing-grid">
            {listing.map(item => (
              <article className="product" key={item.id}>
                <button className="photo" onClick={() => setSelected(item.id)} aria-label={`View ${item.title}`}>
                  <ConditionBadge condition={item.condition} />
                  <ListingImage src={item.photos?.[0]} alt={item.title} emoji={item.emoji} className="listing-img" />
                  <span className="category-caption">{cap(item.category)}</span>
                  {item.owner !== 'you' && (
                    <WishlistButton itemId={item.id} wishlist={wishlist} toggleWishlist={toggleWishlist} />
                  )}
                  {item.owner === 'you' && (
                    <span className="owner-badge">Yours</span>
                  )}
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

                  <div className="card-actions">
                    <button className="details-button" onClick={() => setSelected(item.id)}>
                      View item <span>↗</span>
                    </button>
                    {item.owner !== 'you' && item.status === 'active' && (
                      <CompareToggle itemId={item.id} compareList={compareList} toggleCompare={toggleCompare} />
                    )}
                  </div>
                </div>
              </article>
            ))}
            {listing.length === 0 && (
              <div className="noresults">
                <span className="noresults-icon">🔍</span>
                <p>No listings match your search.</p>
                <button
                  className="outline-btn"
                  onClick={() => { setQuery(''); setCategory('all'); setPriceRange([0, 99999]); setShowSavedOnly(false); }}
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </section>

        {/* ── Footer ──────────────────────────────────────────────────────── */}
        <footer>
          <strong>CAMPUS exchange</strong>
          <span>From students, for students.</span>
          <button onClick={reset}>Reset demo</button>
        </footer>
      </main>

      {/* ── Compare bar (sticky bottom) ───────────────────────────────────── */}
      <CompareBar
        compareList={compareList}
        items={items}
        onView={() => setShowCompare(true)}
        onRemove={id => setCompareList(c => c.filter(x => x !== id))}
        onClear={() => setCompareList([])}
      />

      {/* ── Modals ───────────────────────────────────────────────────────── */}
      {detailPanel}
      {sellModal}
      {showCompare && (
        <CompareModal
          compareList={compareList}
          items={items}
          onClose={() => setShowCompare(false)}
          onRemove={id => { setCompareList(c => c.filter(x => x !== id)); if (compareList.length <= 1) setShowCompare(false); }}
          setSelected={setSelected}
        />
      )}
      {showMyListings && (
        <MyListingsPanel
          items={items}
          onEdit={startEdit}
          onSelect={setSelected}
          onClose={() => setShowMyListings(false)}
          wishlist={wishlist}
          toggleWishlist={toggleWishlist}
        />
      )}
    </div>
  );
}
