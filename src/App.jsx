import React, { useEffect, useMemo, useState } from 'react';

const KEY = 'acl-marketplace-v3';
const categories = ['all', 'textbooks', 'electronics', 'furniture', 'clothing', 'other'];
const conditions = ['new', 'like-new', 'used', 'worn'];
const currentUser = { name: 'You', email: 'you@example.com' };
const photo = id => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=82`;
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
const cap = value => value === 'like-new' ? 'Like new' : (value || '').replace(/\b\w/g, letter => letter.toUpperCase());
const formatPrice = price => Number(price).toLocaleString('en');

function findError(form) {
  if (!form.title.trim()) return 'Please complete the item title.';
  if (form.price.trim() === '' || !Number.isFinite(Number(form.price)) || Number(form.price) < 0) return 'Enter a price of zero or more.';
  if (!categories.slice(1).includes(form.category)) return 'Choose a category.';
  if (!conditions.includes(form.condition)) return 'Choose an item condition.';
  if (!['active', 'sold'].includes(form.status)) return 'Choose a valid status.';
  return '';
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
  const [budget, setBudget] = useState('');
  const [selected, setSelected] = useState(null);
  const [editor, setEditor] = useState(null);
  const [error, setError] = useState('');
  const [activePhoto, setActivePhoto] = useState(0);
  const [notice, setNotice] = useState('');

  useEffect(() => localStorage.setItem(KEY, JSON.stringify(items)), [items]);
  useEffect(() => setActivePhoto(0), [selected]);

  const listing = useMemo(() => {
    const matching = items.filter(item => {
      const matchesCategory = category === 'all' || item.category === category;
      const matchesQuery = `${item.title} ${item.category} ${item.description}`.toLowerCase().includes(query.toLowerCase());
      const matchesBudget = budget === '' || item.price <= Number(budget);
      return matchesCategory && matchesQuery && matchesBudget;
    });
    if (sort === 'low') matching.sort((a, b) => a.price - b.price);
    if (sort === 'high') matching.sort((a, b) => b.price - a.price);
    return matching;
  }, [items, category, query, sort, budget]);

  function startEdit(item) {
    if (item && item.owner !== 'you') return;
    setError('');
    setEditor({
      id: item?.id || null,
      form: item
        ? { title: item.title, price: String(item.price), category: item.category, condition: item.condition, description: item.description, pickup: item.pickup || '', status: item.status }
        : { ...emptyForm },
    });
  }

  function submit(event) {
    event.preventDefault();
    const form = editor.form;
    const validationError = findError(form);
    if (validationError) {
      setError(validationError);
      return;
    }

    const original = editor.id ? items.find(item => item.id === editor.id && item.owner === 'you') : null;
    if (editor.id && !original) {
      setError('You can only edit your own listings.');
      return;
    }
    const next = {
      ...form,
      title: form.title.trim(),
      price: Number(form.price),
      description: form.description.trim(),
      pickup: form.pickup.trim(),
      photos: original?.photos || [],
      emoji: original?.emoji || '📦',
      owner: 'you',
      seller: currentUser.name,
      sellerEmail: currentUser.email,
    };

    if (editor.id) {
      setItems(items.map(item => item.id === editor.id ? { ...item, ...next } : item));
      setNotice('Changes saved.');
    } else {
      setItems([{ ...next, id: `m-${Date.now()}`, status: 'active' }, ...items]);
      setNotice('Item listed. It is now active.');
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
    setBudget('');
    setNotice('Example items restored.');
  }

  return (
    <div className="market-app">
      <div className="utility">
        <span>GUC campus community</span>
        <span>Buy better. Keep it on campus. <b>All prices in EGP</b></span>
      </div>
      <header className="navigation">
        <a className="brand" href="#" onClick={() => { setSelected(null); setCategory('all'); }}>
          <span className="brand-icon">c</span><span>campus<span className="brand-alt">swap</span></span>
        </a>
        <nav aria-label="Main navigation">
          <a href="#discover">Explore</a>
          <button onClick={() => { setCategory('textbooks'); document.getElementById('discover')?.scrollIntoView({ behavior: 'smooth' }); }}>Textbooks</button>
          <button onClick={() => { setCategory('electronics'); document.getElementById('discover')?.scrollIntoView({ behavior: 'smooth' }); }}>Electronics</button>
        </nav>
        <div className="nav-actions">
          <span className="account-label"><span className="usercircle">Y</span> You</span>
          <button className="sell-cta" onClick={() => startEdit(null)}><span aria-hidden="true">＋</span> Sell an item</button>
        </div>
      </header>

      <main>
        <section className="promo">
          <div className="promo-copy">
            <span className="tag"><span className="live-dot" /> GOOD FINDS, AROUND THE CORNER</span>
            <h1>Campus life,<br /><em>second-hand first.</em></h1>
            <p>Find what you need from students nearby. Give good things another go.</p>
            <div className="hero-actions">
              <button className="hero-primary" onClick={() => document.getElementById('discover')?.scrollIntoView({ behavior: 'smooth' })}>Explore listings <span>↓</span></button>
              <button className="hero-secondary" onClick={() => startEdit(null)}>Have something to sell? <b>List it →</b></button>
            </div>
            <div className="community-note"><span className="avatar-stack"><i>Y</i><i>M</i><i>O</i></span><span>Student-to-student, right here on campus</span></div>
          </div>
          <div className="promo-art" aria-label="Books, a lamp, headphones and a chair">
            <div className="art-note"><span>THE GOOD<br />STUFF IS<br /><b>ALREADY HERE.</b></span><i>✳</i></div>
            <span className="art-item art-book">📚</span><span className="art-item art-lamp">💡</span>
            <span className="art-item art-headphones">🎧</span><span className="art-item art-chair">🪑</span>
            <span className="art-spark spark-one">✳</span><span className="art-spark spark-two">✦</span>
          </div>
        </section>

        <section className="discovery" id="discover">
          <div className="discover-top">
            <div>
              <p className="section-kicker">THE CAMPUS FINDS</p>
              <h2>Find your next favorite.</h2>
              <p className="section-subtitle">A little more life for the things already here.</p>
            </div>
            <div className="discover-note"><span>✳</span> Thoughtfully passed on, never far away</div>
          </div>
          <div className="toolbar">
            <label className="search"><span aria-hidden="true">⌕</span><input aria-label="Search listings" placeholder="Search for textbooks, lamps, ..." value={query} onChange={event => setQuery(event.target.value)} /><kbd>⌘ K</kbd></label>
            <label className="budget-filter"><span>Under</span><span className="currency">EGP</span><input aria-label="Maximum price in EGP" inputMode="decimal" type="number" min="0" placeholder="Any price" value={budget} onChange={event => setBudget(event.target.value)} /></label>
            <label className="sort"><span>Sort by</span><select value={sort} onChange={event => setSort(event.target.value)}><option value="featured">Featured</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option></select><span className="select-chevron">⌄</span></label>
          </div>
          <div className="category-row" aria-label="Filter by category">
            {categories.map(value => <button key={value} onClick={() => setCategory(value)} className={category === value ? 'on' : ''}>{value === 'all' ? 'Everything' : cap(value)}{value === 'all' && <span className="category-count">{items.length}</span>}</button>)}
          </div>
          {notice && <p className="notice" role="status">{notice}<button aria-label="Dismiss notification" onClick={() => setNotice('')}>×</button></p>}
          <div className="results-heading"><p><strong>{listing.length}</strong> {listing.length === 1 ? 'good find' : 'good finds'} <span>to browse</span></p><span>Prices in EGP · Meet on campus</span></div>
          <div className="listing-grid">
            {listing.map((item, index) => (
              <article className="product" key={item.id}>
                <button className={`photo photo-tone-${index % 4}`} onClick={() => setSelected(item.id)} aria-label={`View ${item.title}`}>
                  <ListingImage src={item.photos?.[0]} alt={item.title} emoji={item.emoji} className="listing-img" />
                  <span className="stamp">{cap(item.condition)}</span>
                  {item.status === 'sold' && <span className="sold-stamp">Passed on</span>}
                  <span className="photo-arrow" aria-hidden="true">↗</span>
                </button>
                <div className="prod-details">
                  <div className="prod-topline"><span>{cap(item.category)}</span><span className={item.status === 'sold' ? 'soldstatus' : 'instock'}><i />{item.status === 'sold' ? 'SOLD' : 'AVAILABLE'}</span></div>
                  <h3>{item.title}</h3>
                  <p className="pickup-preview"><span aria-hidden="true">⌖</span> {item.pickup || 'Arrange a campus meetup'}</p>
                  <div className="costline"><strong><small>EGP</small> {formatPrice(item.price)}</strong><button onClick={() => setSelected(item.id)} aria-label={`See details for ${item.title}`}>View details <span>↗</span></button></div>
                </div>
              </article>
            ))}
            {listing.length === 0 && <div className="noresults"><span>⌕</span><h3>No finds just yet.</h3><p>Try a different search or widen your budget.</p><button onClick={() => { setQuery(''); setCategory('all'); setBudget(''); }}>Clear filters</button></div>}
          </div>
        </section>
        <section className="sell-banner">
          <div><span className="section-kicker">MAKE ROOM FOR SOMETHING NEW</span><h2>Someone else might need what you don't.</h2><p>List your item in a few steps and keep the good stuff moving.</p></div>
          <button className="sell-cta" onClick={() => startEdit(null)}>List an item <span>↗</span></button>
          <span className="banner-spark" aria-hidden="true">✳</span>
        </section>
        <footer><a className="footer-brand" href="#discover">campus<span>swap</span></a><span>Good things go around.</span><button onClick={reset}>Reset demo</button></footer>
      </main>

      {selected && (() => {
        const item = items.find(value => value.id === selected);
        if (!item) return null;
        const images = item.photos || [];
        const subject = encodeURIComponent(`Campus Exchange: ${item.title}`);
        const body = encodeURIComponent(`Hi ${item.seller},\n\nI'm interested in your listing "${item.title}" (EGP ${item.price}). Is it still available?\n\n`);
        return (
          <div className="overlay" onMouseDown={event => event.target === event.currentTarget && setSelected(null)}>
            <section className="detail-panel" role="dialog" aria-modal="true" aria-label="Item details">
              <button className="close" aria-label="Close item details" onClick={() => setSelected(null)}>×</button>
              <div className="detail-visual"><ListingImage src={images[activePhoto] || images[0]} alt={`${item.title} photo ${activePhoto + 1}`} emoji={item.emoji} className="detail-img" /></div>
              {images.length > 1 && <div className="detail-thumbs" aria-label="Item photos">{images.map((src, index) => <button type="button" key={index} className={activePhoto === index ? 'thumb active' : 'thumb'} aria-label={`Show photo ${index + 1} of ${images.length}`} aria-pressed={activePhoto === index} onClick={() => setActivePhoto(index)}><ListingImage src={src} alt="" emoji={item.emoji} className="thumb-img" /></button>)}</div>}
              <p className="section-kicker">{cap(item.category)} · {cap(item.condition)}</p>
              <h2>{item.title}</h2>
              <h3 className="detail-price">EGP {formatPrice(item.price)}</h3>
              <p className="item-description">{item.description || 'No description supplied.'}</p>
              <div className="detail-meta"><p><strong>Pickup</strong><br />{item.pickup || 'Arrange directly with seller'}</p><p><strong>Seller</strong><br />{item.seller}</p></div>
              <p className={`detail-status ${item.status === 'sold' ? 'soldstatus' : 'instock'}`}>{item.status === 'sold' ? 'This item has been passed on.' : 'Available · Arrange a campus meetup'}</p>
              {item.owner === 'you'
                ? <button className="sell-cta detail-action" onClick={() => startEdit(item)}>Edit your listing</button>
                : item.status === 'sold'
                  ? <p className="fineprint">This item is marked as sold.</p>
                  : <a className="sell-cta contact-seller" href={`mailto:${item.sellerEmail}?subject=${subject}&body=${body}`}>✉ Contact seller</a>}
            </section>
          </div>
        );
      })()}

      {editor && (
        <div className="overlay" onMouseDown={event => event.target === event.currentTarget && setEditor(null)}>
          <section className="sell-modal" role="dialog" aria-modal="true" aria-label={editor.id ? 'Edit item' : 'Sell item'}>
            <div className="modal-head"><div><p className="section-kicker">CAMPUSSWAP · YOUR LISTING</p><h2>{editor.id ? 'Edit your listing' : 'Pass something on.'}</h2><p>{editor.id ? 'Keep your item details up to date.' : 'A few details are all it takes to find your item a new home.'}</p></div><button className="close" aria-label="Close form" onClick={() => setEditor(null)}>×</button></div>
            <form onSubmit={submit}>
              <div className="field-grid">
                <label><span>Item title <b>*</b></span><input required value={editor.form.title} onChange={event => setEditor(state => ({ ...state, form: { ...state.form, title: event.target.value } }))} placeholder="What are you selling?" /></label>
                <label><span>Price (EGP) <b>*</b></span><input required type="number" min="0" step="0.01" value={editor.form.price} onChange={event => setEditor(state => ({ ...state, form: { ...state.form, price: event.target.value } }))} placeholder="0.00" /></label>
                <label><span>Category <b>*</b></span><select required value={editor.form.category} onChange={event => setEditor(state => ({ ...state, form: { ...state.form, category: event.target.value } }))}><option value="">Choose a category</option>{categories.slice(1).map(value => <option value={value} key={value}>{cap(value)}</option>)}</select></label>
                <label><span>Condition <b>*</b></span><select required value={editor.form.condition} onChange={event => setEditor(state => ({ ...state, form: { ...state.form, condition: event.target.value } }))}><option value="">Choose a condition</option>{conditions.map(value => <option value={value} key={value}>{cap(value)}</option>)}</select></label>
                <label className="wide"><span>Description <small>Optional</small></span><textarea value={editor.form.description} onChange={event => setEditor(state => ({ ...state, form: { ...state.form, description: event.target.value } }))} placeholder="Share a little about the item's condition or what makes it useful." rows="4" /></label>
                <label className="wide"><span>Pickup / meetup location</span><input value={editor.form.pickup} onChange={event => setEditor(state => ({ ...state, form: { ...state.form, pickup: event.target.value } }))} placeholder="e.g. Library entrance or arrange on campus" /></label>
                <label className="wide"><span>Seller contact email</span><input value={currentUser.email} readOnly aria-readonly="true" className="readonly-input" /><small className="email-helper">Filled from your demo account. Buyers can use this to contact you.</small></label>
                {editor.id && <label><span>Listing status</span><select value={editor.form.status} onChange={event => setEditor(state => ({ ...state, form: { ...state.form, status: event.target.value } }))}><option value="active">Active</option><option value="sold">Sold</option></select></label>}
              </div>
              {error && <p className="alert" role="alert">{error}</p>}
              <div className="modal-foot"><button type="button" onClick={() => setEditor(null)}>Cancel</button><button className="sell-cta" type="submit">{editor.id ? 'Save changes' : 'Publish listing'} <span>↗</span></button></div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
