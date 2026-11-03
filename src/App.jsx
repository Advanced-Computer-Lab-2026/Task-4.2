import React, { useEffect, useMemo, useState } from 'react';

const KEY = 'acl-marketplace-v3';
const categories = ['all', 'textbooks', 'electronics', 'furniture', 'clothing', 'other'];
const conditions = ['new', 'like-new', 'used', 'worn'];
const currentUser = {name: 'You', email: 'you@example.com'};
const photo = id => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=82`;
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
const emptyForm = {title:'', price:'', category:'', condition:'', description:'', pickup:'', status:'active'};

function saved() {
  try {
    const value = JSON.parse(localStorage.getItem(KEY));
    return Array.isArray(value) ? value : seed;
  } catch {
    return seed;
  }
}

function routeFromHash(hash=window.location.hash) {
  const match = hash.match(/^#\/(sell|item)\/?([^/]*)$/);
  return match
    ? {page:match[1], id:match[2] ? decodeURIComponent(match[2]) : null}
    : {page:'home', id:null};
}

const cap = value => value === 'like-new'
  ? 'Like new'
  : (value || '').replace(/\b\w/g, letter => letter.toUpperCase());

function findError(form) {
  if (!form.title.trim()) return 'Please complete the item title.';
  if (form.price.trim() === '' || !Number.isFinite(Number(form.price)) || Number(form.price) < 0) return 'Enter a price of zero or more.';
  if (!categories.slice(1).includes(form.category)) return 'Choose a category.';
  if (!conditions.includes(form.condition)) return 'Choose an item condition.';
  if (!['active', 'sold'].includes(form.status)) return 'Choose a valid status.';
  return '';
}

function ListingImage({src, alt, emoji, className=''}) {
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
  const [route, setRoute] = useState(() => routeFromHash());
  const [editor, setEditor] = useState(null);
  const [error, setError] = useState('');
  const [activePhoto, setActivePhoto] = useState(0);
  const [notice, setNotice] = useState('');

  useEffect(() => localStorage.setItem(KEY, JSON.stringify(items)), [items]);
  useEffect(() => {
    const syncRoute = () => setRoute(routeFromHash());
    window.addEventListener('hashchange', syncRoute);
    window.addEventListener('popstate', syncRoute);
    return () => {
      window.removeEventListener('hashchange', syncRoute);
      window.removeEventListener('popstate', syncRoute);
    };
  }, []);
  useEffect(() => setActivePhoto(0), [route]);
  useEffect(() => {
    if (route.page !== 'sell') return;
    const item = route.id ? items.find(entry => entry.id === route.id) : null;
    if (route.id && !item) {
      setEditor(null);
      return;
    }
    setEditor(current => current?.id === (item?.id || null)
      ? current
      : {
          id:item?.id || null,
          form:item
            ? {title:item.title, price:String(item.price), category:item.category, condition:item.condition, description:item.description, pickup:item.pickup || '', status:item.status}
            : {...emptyForm},
        });
  }, [route, items]);

  function navigate(hash) {
    window.location.hash = hash;
    setRoute(routeFromHash(hash));
    window.scrollTo(0, 0);
  }

  function goHome() {
    window.history.pushState(null, '', window.location.pathname + window.location.search);
    setRoute({page:'home', id:null});
    setEditor(null);
    window.scrollTo(0, 0);
  }

  const listing = useMemo(() => {
    const matches = items.filter(item =>
      (category === 'all' || item.category === category) &&
      `${item.title} ${item.category} ${item.description}`.toLowerCase().includes(query.toLowerCase()));
    if (sort === 'low') matches.sort((a, b) => a.price - b.price);
    if (sort === 'high') matches.sort((a, b) => b.price - a.price);
    return matches;
  }, [items, category, query, sort]);

  function startEdit(item) {
    if (item && item.owner !== 'you') return;
    setError('');
    setEditor({
      id:item?.id || null,
      form:item
        ? {title:item.title, price:String(item.price), category:item.category, condition:item.condition, description:item.description, pickup:item.pickup || '', status:item.status}
        : {...emptyForm},
    });
    navigate(item ? `#/sell/${encodeURIComponent(item.id)}` : '#/sell');
  }

  function submit(event) {
    event.preventDefault();
    const form = editor.form;
    if (findError(form)) {
      setError('Unable to save item. Check the form.');
      return;
    }
    const original = editor.id ? items.find(item => item.id === editor.id) : null;
    const next = {
      ...form,
      title:form.title.trim(),
      price:Number(form.price),
      description:form.description.trim(),
      pickup:form.pickup.trim(),
      photos:original?.photos || [],
      emoji:original?.emoji || '📦',
      owner:'you',
      seller:currentUser.name,
      sellerEmail:currentUser.email,
    };
    if (editor.id) {
      setItems(items.map(item => item.id === editor.id ? {...item, ...next} : item));
      setNotice('Changes saved.');
    } else {
      setItems([{...next, id:`m-${Date.now()}`, status:'active'}, ...items]);
      setNotice('Item listed.');
    }
    goHome();
  }

  function reset() {
    setItems(seed);
    setQuery('');
    setCategory('all');
    setSort('featured');
    setNotice('Example items restored.');
    goHome();
  }

  const item = route.page === 'item' ? items.find(entry => entry.id === route.id) : null;
  const subject = item ? encodeURIComponent(`Campus Exchange: ${item.title}`) : '';
  const body = item ? encodeURIComponent(`Hi ${item.seller},\n\nI'm interested in your listing "${item.title}" (EGP ${item.price}). Is it still available?\n\n`) : '';

  return <div className="market-app">
    <div className="utility"><span>Campus Exchange</span><span>Trusted by students • All prices in EGP</span></div>
    <header className="navigation">
      <button className="brand" onClick={() => {setCategory('all'); goHome();}}>
        <span className="brand-icon">✳</span> CAMPUS<span className="brand-alt">exchange</span>
      </button>
      <div className="nav-actions">
        <span className="usercircle">Y</span>
        <button className="sell-cta" onClick={() => startEdit(null)}>+ Sell an item</button>
      </div>
    </header>
    <main>
      {route.page === 'home' && <section className="discovery" id="discover">
        <div className="discover-top">
          <div>
            <p className="section-kicker">CURATED FOR YOUR CAMPUS</p>
            <h2>Find something good.</h2>
            <p>Items listed by people around you.</p>
          </div>
        </div>
        <div className="filter-toolbar">
          <div className="category-row">
            {categories.map(value => <button key={value} onClick={() => setCategory(value)} className={category === value ? 'on' : ''}>
              {value === 'all' ? 'All items' : cap(value)}
            </button>)}
          </div>
          <div className="discover-right">
            <label className="search"><span>⌕</span>
              <input aria-label="Search listings" placeholder="Search listings" value={query} onChange={event => setQuery(event.target.value)} />
            </label>
            <label className="sort"><span>Sort</span>
              <select value={sort} onChange={event => setSort(event.target.value)}>
                <option value="featured">Featured</option>
                <option value="low">Price: low to high</option>
                <option value="high">Price: high to low</option>
              </select>
            </label>
          </div>
        </div>
        {notice && <p className="notice" role="status">{notice} <button onClick={() => setNotice('')}>×</button></p>}
        <div className="listing-grid">
          {listing.map(entry => <article
            className="product"
            key={entry.id}
            role="link"
            tabIndex={0}
            onClick={() => navigate(`#/item/${encodeURIComponent(entry.id)}`)}
            onKeyDown={event => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                navigate(`#/item/${encodeURIComponent(entry.id)}`);
              }
            }}>
            <div className="photo">
              <span className="stamp">{cap(entry.condition)}</span>
              <ListingImage src={entry.photos?.[0]} alt={entry.title} emoji={entry.emoji} className="listing-img" />
              <span className="category-caption">{cap(entry.category)}</span>
            </div>
            <div className="prod-details">
              <div className="prod-topline">
                <span className="muted">{entry.category}</span>
                {entry.status === 'sold' && <span className="soldstatus">Sold out</span>}
              </div>
              <h3>{entry.title}</h3>
              <p>{entry.description}</p>
              <div className="costline"><strong>EGP {entry.price.toLocaleString()}</strong><span>{cap(entry.condition)}</span></div>
            </div>
          </article>)}
          {listing.length === 0 && <p className="noresults">No listings match your search.</p>}
        </div>
      </section>}

      {route.page === 'item' && (item
        ? <section className="item-page" aria-label="Item details">
            <button className="back-link" onClick={goHome}>← Back to listings</button>
            <div className="item-page-grid">
              <div className="item-gallery">
                <div className="detail-visual">
                  <ListingImage src={item.photos?.[activePhoto] || item.photos?.[0]} alt={`${item.title} photo ${activePhoto + 1}`} emoji={item.emoji} className="detail-img" />
                </div>
                {item.photos?.length > 1 && <div className="detail-thumbs" aria-label="Item photos">
                  {item.photos.map((src, index) => <button type="button" key={index} className={activePhoto === index ? 'thumb active' : 'thumb'}
                    aria-label={`Show photo ${index + 1} of ${item.photos.length}`} aria-pressed={activePhoto === index} onClick={() => setActivePhoto(index)}>
                    <ListingImage src={src} alt="" emoji={item.emoji} className="thumb-img" />
                  </button>)}
                </div>}
              </div>
              <div className="item-information">
                <p className="section-kicker">{cap(item.category)} · {cap(item.condition)}</p>
                <h1>{item.title}</h1>
                <h2>EGP {item.price.toLocaleString()}</h2>
                {item.status === 'sold' && <p className="soldstatus soldstatus-large">Sold out</p>}
                <p className="item-description">{item.description || 'No description supplied.'}</p>
                <div className="detail-meta">
                  <p><strong>Pickup</strong><br />{item.pickup || 'Arrange directly with seller'}</p>
                  <p><strong>Seller</strong><br />{item.seller}</p>
                </div>
                {item.owner === 'you'
                  ? <button className="sell-cta" onClick={() => startEdit(item)}>Edit your listing</button>
                  : item.status === 'sold'
                    ? <p className="fineprint">This item is marked as sold.</p>
                    : <a className="sell-cta contact-seller" href={`mailto:${item.sellerEmail}?subject=${subject}&body=${body}`}>✉ Contact seller</a>}
              </div>
            </div>
          </section>
        : <section className="page-shell"><p>This listing could not be found.</p><button className="back-link" onClick={goHome}>← Back to listings</button></section>)}

      {route.page === 'sell' && (editor
        ? <section className="sell-page" aria-label={editor.id ? 'Edit item' : 'Sell item'}>
            <button className="back-link" onClick={goHome}>← Back to listings</button>
            <div className="sell-page-card">
              <div className="page-heading">
                <p className="section-kicker">CAMPUS EXCHANGE</p>
                <h1>{editor.id ? 'Edit your listing' : 'Sell an item'}</h1>
                <p>Add the details and we'll take care of the rest.</p>
              </div>
              <form onSubmit={submit}>
                <div className="field-grid">
                  <label><span>Item title *</span><input value={editor.form.title} onChange={event => setEditor(state => ({...state, form:{...state.form, title:event.target.value}}))} placeholder="What are you selling?" /></label>
                  <label><span>Price (EGP) *</span><input type="number" min="0" step="0.01" value={editor.form.price} onChange={event => setEditor(state => ({...state, form:{...state.form, price:event.target.value}}))} placeholder="Price" /></label>
                  <label><span>Category *</span><select value={editor.form.category} onChange={event => setEditor(state => ({...state, form:{...state.form, category:event.target.value}}))}>
                    <option value="">Select</option>{categories.slice(1).map(value => <option value={value} key={value}>{cap(value)}</option>)}
                  </select></label>
                  <label><span>Condition *</span><select value={editor.form.condition} onChange={event => setEditor(state => ({...state, form:{...state.form, condition:event.target.value}}))}>
                    <option value="">Select</option>{conditions.map(value => <option value={value} key={value}>{cap(value)}</option>)}
                  </select></label>
                  <label className="wide"><span>Description</span><textarea value={editor.form.description} onChange={event => setEditor(state => ({...state, form:{...state.form, description:event.target.value}}))} placeholder="Description" rows="5" /></label>
                  <label className="wide"><span>Pickup / meetup location</span><input value={editor.form.pickup} onChange={event => setEditor(state => ({...state, form:{...state.form, pickup:event.target.value}}))} placeholder="e.g. Library entrance or arrange on campus" /></label>
                  <label className="wide"><span>Seller contact email</span><input value={currentUser.email} readOnly aria-readonly="true" className="readonly-input" /><small className="email-helper">Taken from your registered account, so buyers can contact you about this item.</small></label>
                  {editor.id && <label><span>Status</span><select value={editor.form.status} onChange={event => setEditor(state => ({...state, form:{...state.form, status:event.target.value}}))}>
                    <option value="active">Active</option><option value="sold">Sold</option>
                  </select></label>}
                </div>
                {error && <p className="alert" role="alert">{error}</p>}
                <div className="modal-foot">
                  <button type="button" onClick={goHome}>Cancel</button>
                  <button className="sell-cta" type="submit">{editor.id ? 'Save changes' : 'Publish item'}</button>
                </div>
              </form>
            </div>
          </section>
        : <section className="page-shell"><p>This listing could not be found.</p><button className="back-link" onClick={goHome}>← Back to listings</button></section>)}
    </main>
    <footer><strong>CAMPUS exchange</strong><span>From students, for students.</span><button onClick={reset}>Reset demo</button></footer>
  </div>;
}
