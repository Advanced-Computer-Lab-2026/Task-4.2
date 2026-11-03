import React, { useEffect, useMemo, useRef, useState } from 'react';

const KEY = 'acl-marketplace-v3';
const MAX_PHOTOS = 4;
const MAX_PHOTO_SIZE = 10 * 1024 * 1024;
const categories = ['all', 'textbooks', 'electronics', 'furniture', 'clothing', 'other'];
const conditions = ['new', 'like-new', 'used', 'worn'];
const conditionFilterOrder = ['new', 'like-new', 'worn', 'used'];
const currentUser = { name: 'You', email: 'you@example.com' }; // Demo account; no login backend
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
const emptyForm = { title: '', price: '', category: '', condition: '', description: '', pickup: '', status: 'active', photos: [] };

function saved() {
  try {
    const value = JSON.parse(localStorage.getItem(KEY));
    return Array.isArray(value) ? value : seed;
  } catch {
    return seed;
  }
}

const cap = (value) => value === 'like-new' ? 'Like new' : (value || '').replace(/\b\w/g, (letter) => letter.toUpperCase());

function validateForm(form) {
  const errors = {};
  if (!form.title.trim()) errors.title = 'Enter an item title.';
  if (form.price.trim() === '' || !Number.isFinite(Number(form.price)) || Number(form.price) < 0) {
    errors.price = 'Enter a valid price of zero or more.';
  }
  if (!categories.slice(1).includes(form.category)) errors.category = 'Choose a category.';
  if (!conditions.includes(form.condition)) errors.condition = 'Choose an item condition.';
  if (!['active', 'sold'].includes(form.status)) errors.status = 'Choose a valid status.';
  return errors;
}

function compressPhoto(file) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const url = URL.createObjectURL(file);
    image.onload = () => {
      try {
        const scale = Math.min(1, 1200 / Math.max(image.naturalWidth, image.naturalHeight));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(image.naturalWidth * scale);
        canvas.height = Math.round(image.naturalHeight * scale);
        const context = canvas.getContext('2d');
        if (!context) throw new Error('Image processing is unavailable.');
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.78));
      } catch {
        reject(new Error(`Could not process "${file.name}". Try another image.`));
      } finally {
        URL.revokeObjectURL(url);
      }
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(`Could not read "${file.name}". Try another image.`));
    };
    image.src = url;
  });
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
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [condition, setCondition] = useState('all');
  const [status, setStatus] = useState('all');
  const [selected, setSelected] = useState(null);
  const [editor, setEditor] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [photoError, setPhotoError] = useState('');
  const [activePhoto, setActivePhoto] = useState(0);
  const [notice, setNotice] = useState('');
  const dialogRef = useRef(null);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
    } catch {
      setNotice('Your changes are shown, but could not be saved in this browser. Remove some stored data and try again.');
    }
  }, [items]);

  useEffect(() => setActivePhoto(0), [selected]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return undefined;
    const previousFocus = document.activeElement;
    const focusable = () => [...dialog.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    )].filter((element) => element.getClientRects().length > 0);
    const initialFocus = dialog.querySelector('[data-dialog-initial-focus]') || focusable()[0];
    initialFocus?.focus();

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        event.preventDefault();
        if (editor) setEditor(null);
        else setSelected(null);
        return;
      }
      if (event.key !== 'Tab') return;
      const elements = focusable();
      if (!elements.length) {
        event.preventDefault();
        return;
      }
      const first = elements[0];
      const last = elements[elements.length - 1];
      if (event.shiftKey && (document.activeElement === first || !dialog.contains(document.activeElement))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (document.activeElement === last || !dialog.contains(document.activeElement))) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus();
    };
  }, [Boolean(selected), Boolean(editor)]);

  const matchingFilters = useMemo(() => {
    const minimum = minPrice === '' ? null : Number(minPrice);
    const maximum = maxPrice === '' ? null : Number(maxPrice);
    return items.filter((item) => {
      const matchesText = `${item.title} ${item.category} ${item.description}`.toLowerCase().includes(query.toLowerCase());
      const matchesCategory = category === 'all' || item.category === category;
      const matchesMinimum = minimum === null || !Number.isFinite(minimum) || item.price >= minimum;
      const matchesMaximum = maximum === null || !Number.isFinite(maximum) || item.price <= maximum;
      return matchesText && matchesCategory && matchesMinimum && matchesMaximum;
    });
  }, [items, category, query, minPrice, maxPrice]);

  const availableConditions = useMemo(
    () => conditionFilterOrder.filter((value) => matchingFilters.some((item) =>
      (status === 'all' || item.status === status) && item.condition === value)),
    [matchingFilters, status],
  );

  useEffect(() => {
    if (condition !== 'all' && !availableConditions.includes(condition)) setCondition('all');
  }, [condition, availableConditions]);

  useEffect(() => {
    if (status !== 'all' && !matchingFilters.some((item) => item.status === status)) setStatus('all');
  }, [status, matchingFilters]);

  const listing = useMemo(() => {
    const filtered = matchingFilters.filter((item) =>
      (condition === 'all' || item.condition === condition) &&
      (status === 'all' || item.status === status));
    if (sort === 'low') filtered.sort((a, b) => a.price - b.price);
    if (sort === 'high') filtered.sort((a, b) => b.price - a.price);
    return filtered;
  }, [matchingFilters, sort, condition, status]);

  function updateForm(field, value) {
    setEditor((current) => ({ ...current, form: { ...current.form, [field]: value } }));
    setFormErrors((current) => ({ ...current, [field]: undefined }));
  }

  function startEdit(item) {
    if (item && item.owner !== 'you') return;
    setFormErrors({});
    setPhotoError('');
    setSelected(null);
    setEditor({
      id: item?.id || null,
      form: item
        ? { title: item.title, price: String(item.price), category: item.category, condition: item.condition, description: item.description, pickup: item.pickup || '', status: item.status, photos: item.photos || [] }
        : { ...emptyForm },
    });
  }

  async function addPhotos(event) {
    const files = [...event.target.files];
    event.target.value = '';
    if (!files.length) return;
    const currentCount = editor.form.photos.length;
    if (currentCount + files.length > MAX_PHOTOS) {
      setPhotoError(`You can add up to ${MAX_PHOTOS} photos per listing.`);
      return;
    }
    const invalidFile = files.find((file) => !file.type.startsWith('image/') || file.size > MAX_PHOTO_SIZE);
    if (invalidFile) {
      setPhotoError(invalidFile.size > MAX_PHOTO_SIZE
        ? `"${invalidFile.name}" is over 10 MB. Choose a smaller image.`
        : `"${invalidFile.name}" is not a supported image.`);
      return;
    }
    try {
      const photos = await Promise.all(files.map(compressPhoto));
      setEditor((current) => current && ({
        ...current,
        form: { ...current.form, photos: [...current.form.photos, ...photos] },
      }));
      setPhotoError('');
    } catch (error) {
      setPhotoError(error.message);
    }
  }

  function submit(event) {
    event.preventDefault();
    const errors = validateForm(editor.form);
    setFormErrors(errors);
    const firstInvalid = Object.keys(errors)[0];
    if (firstInvalid) {
      document.getElementById(`listing-${firstInvalid}`)?.focus();
      return;
    }

    const original = editor.id ? items.find((item) => item.id === editor.id) : null;
    const next = {
      ...editor.form,
      title: editor.form.title.trim(),
      price: Number(editor.form.price),
      description: editor.form.description.trim(),
      pickup: editor.form.pickup.trim(),
      photos: editor.form.photos,
      emoji: original?.emoji || '📦',
      owner: 'you',
      seller: currentUser.name,
      sellerEmail: currentUser.email,
    };
    if (editor.id) {
      setItems(items.map((item) => item.id === editor.id ? { ...item, ...next } : item));
      setNotice('Changes saved.');
    } else {
      setItems([{ ...next, id: `m-${Date.now()}`, status: 'active' }, ...items]);
      setNotice('Item listed.');
    }
    setEditor(null);
    setSelected(null);
  }

  function clearFilters() {
    setQuery('');
    setCategory('all');
    setCondition('all');
    setStatus('all');
    setMinPrice('');
    setMaxPrice('');
    setSort('featured');
  }

  function reset() {
    setItems(seed);
    setSelected(null);
    setEditor(null);
    clearFilters();
    setNotice('Example items restored.');
  }

  return (
    <div className="market-app">
      <div className="utility"><span>Campus Exchange</span><span>Trusted by students • All prices in EGP</span></div>
      <header className="navigation">
        <button className="brand" aria-label="Campus Exchange home" onClick={() => { setSelected(null); setCategory('all'); }}>
          <span className="brand-icon">✳</span> CAMPUS<span className="brand-alt">exchange</span>
        </button>
        <div className="nav-actions">
          <span className="usercircle" aria-label="Signed in as You">Y</span>
          <button className="sell-cta" onClick={() => startEdit(null)}>+ Sell an item</button>
        </div>
      </header>
      <main>
        <section className="promo">
          <div className="promo-copy">
            <span className="tag">THE CAMPUS MARKETPLACE</span>
            <h1>Everything you need,<br /><i>right around campus.</i></h1>
            <p>Browse little finds, big essentials and almost everything in between.</p>
          </div>
          <div className="promo-art" aria-hidden="true"><span>📚</span><span>💡</span><span>🎧</span><span>🛋️</span></div>
        </section>
        <section className="discovery" id="discover">
          <div className="discover-top">
            <div>
              <p className="section-kicker">CURATED FOR YOUR CAMPUS</p>
              <h2>Find something good.</h2>
              <p>Items listed by people around you.</p>
            </div>
            <div className="discover-right">
              <label className="search"><span aria-hidden="true">⌕</span><input aria-label="Search listings" placeholder="Search listings" value={query} onChange={(event) => setQuery(event.target.value)} /></label>
              <label className="sort"><span>Sort</span><select aria-label="Sort listings" value={sort} onChange={(event) => setSort(event.target.value)}><option value="featured">Featured</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option></select></label>
              <label className="sort"><span>Status</span><select aria-label="Filter by status" value={status} onChange={(event) => setStatus(event.target.value)}><option value="all">All items</option><option value="active">Active</option><option value="sold">Sold</option></select></label>
            </div>
          </div>
          <div className="category-row" aria-label="Filter by category">
            {categories.map((value) => <button key={value} onClick={() => setCategory(value)} className={category === value ? 'on' : ''} aria-pressed={category === value}>{value === 'all' ? 'All items' : cap(value)}</button>)}
          </div>
          <div className="category-row condition-row" aria-label="Filter by condition">
            <span className="filter-label">Condition</span>
            <button onClick={() => setCondition('all')} className={condition === 'all' ? 'on' : ''} aria-pressed={condition === 'all'}>All conditions</button>
            {availableConditions.map((value) => (
              <button key={value} onClick={() => setCondition(value)} className={condition === value ? 'on' : ''} aria-pressed={condition === value}>
                {cap(value)} ({matchingFilters.filter((item) => item.condition === value).length})
              </button>
            ))}
          </div>
          <div className="filter-row">
            <span className="filter-label">Price range (EGP)</span>
            <label>From <input aria-label="Minimum price" type="number" min="0" placeholder="Any" value={minPrice} onChange={(event) => setMinPrice(event.target.value)} /></label>
            <label>To <input aria-label="Maximum price" type="number" min="0" placeholder="Any" value={maxPrice} onChange={(event) => setMaxPrice(event.target.value)} /></label>
          </div>
          <p className="results-count" role="status">Showing {listing.length} of {items.length} {items.length === 1 ? 'listing' : 'listings'}</p>
          {notice && <p className="notice" role="status">{notice} <button aria-label="Dismiss message" onClick={() => setNotice('')}>×</button></p>}
          <div className="listing-grid">
            {listing.map((item) => (
              <article className="product" key={item.id}>
                <button className="photo" aria-label={`View ${item.title}`} onClick={() => setSelected(item.id)}>
                  <span className="stamp">{cap(item.condition)}</span>
                  <ListingImage src={item.photos?.[0]} alt={item.title} emoji={item.emoji} className="listing-img" />
                  <span className="category-caption">{cap(item.category)}</span>
                </button>
                <div className="prod-details">
                  <div className="prod-topline"><span className="muted">{item.category}</span><span className={item.status === 'sold' ? 'soldstatus' : 'instock'}>{item.status.toUpperCase()}</span></div>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                  <div className="costline"><strong>EGP {item.price.toLocaleString()}</strong><span>{item.condition}</span></div>
                  <button className="details-button" onClick={() => setSelected(item.id)}>View item <span aria-hidden="true">↗</span></button>
                </div>
              </article>
            ))}
            {listing.length === 0 && <div className="noresults"><p>No listings match these filters.</p><button type="button" onClick={clearFilters}>Clear filters</button></div>}
          </div>
        </section>
        <footer><strong>CAMPUS exchange</strong><span>From students, for students.</span><button onClick={reset}>Reset demo</button></footer>
      </main>
      {selected && (() => {
        const item = items.find((entry) => entry.id === selected);
        if (!item) return null;
        const images = item.photos || [];
        const subject = encodeURIComponent(`Campus Exchange: ${item.title}`);
        const body = encodeURIComponent(`Hi ${item.seller},\n\nI'm interested in your listing "${item.title}" (EGP ${item.price}). Is it still available?\n\n`);
        return (
          <div className="overlay" onMouseDown={(event) => event.target === event.currentTarget && setSelected(null)}>
            <section className="detail-panel" role="dialog" aria-modal="true" aria-labelledby="item-dialog-title" ref={dialogRef}>
              <button className="close" aria-label="Close item details" data-dialog-initial-focus onClick={() => setSelected(null)}>×</button>
              <div className="detail-visual"><ListingImage src={images[activePhoto] || images[0]} alt={`${item.title} photo ${activePhoto + 1}`} emoji={item.emoji} className="detail-img" /></div>
              {images.length > 1 && <div className="detail-thumbs" aria-label="Item photos">{images.map((src, index) => <button type="button" key={index} className={activePhoto === index ? 'thumb active' : 'thumb'} aria-label={`Show photo ${index + 1} of ${images.length}`} aria-pressed={activePhoto === index} onClick={() => setActivePhoto(index)}><ListingImage src={src} alt="" emoji={item.emoji} className="thumb-img" /></button>)}</div>}
              <p className="section-kicker">{cap(item.category)} · {cap(item.condition)}</p>
              <h2 id="item-dialog-title">{item.title}</h2>
              <h3>EGP {item.price.toLocaleString()}</h3>
              <p className="item-description">{item.description || 'No description supplied.'}</p>
              <div className="detail-meta"><p><strong>Pickup</strong><br />{item.pickup || 'Arrange directly with seller'}</p><p><strong>Seller</strong><br />{item.seller}</p></div>
              <p className="muted">Status: {item.status}</p>
              {item.owner === 'you'
                ? <button className="sell-cta" onClick={() => startEdit(item)}>Edit your listing</button>
                : item.status === 'sold'
                  ? <p className="fineprint">This item is marked as sold.</p>
                  : <a className="sell-cta contact-seller" href={`mailto:${item.sellerEmail}?subject=${subject}&body=${body}`}>✉ Contact seller</a>}
            </section>
          </div>
        );
      })()}
      {editor && (
        <div className="overlay" onMouseDown={(event) => event.target === event.currentTarget && setEditor(null)}>
          <section className="sell-modal" role="dialog" aria-modal="true" aria-labelledby="listing-dialog-title" ref={dialogRef}>
            <div className="modal-head">
              <div><p className="section-kicker">CAMPUS EXCHANGE</p><h2 id="listing-dialog-title">{editor.id ? 'Edit your listing' : 'Sell an item'}</h2><p>Add the details and we'll take care of the rest.</p></div>
              <button className="close" aria-label="Close listing form" onClick={() => setEditor(null)}>×</button>
            </div>
            <form onSubmit={submit} noValidate>
              <div className="field-grid">
                <label>
                  <span>Item title *</span>
                  <input id="listing-title" data-dialog-initial-focus required aria-invalid={Boolean(formErrors.title)} aria-describedby={formErrors.title ? 'listing-title-error' : undefined} value={editor.form.title} onChange={(event) => updateForm('title', event.target.value)} placeholder="What are you selling?" />
                  {formErrors.title && <small className="field-error" id="listing-title-error">{formErrors.title}</small>}
                </label>
                <label>
                  <span>Price (EGP) *</span>
                  <input id="listing-price" required type="number" min="0" step="0.01" aria-invalid={Boolean(formErrors.price)} aria-describedby={formErrors.price ? 'listing-price-error' : undefined} value={editor.form.price} onChange={(event) => updateForm('price', event.target.value)} placeholder="Price" />
                  {formErrors.price && <small className="field-error" id="listing-price-error">{formErrors.price}</small>}
                </label>
                <label>
                  <span>Category *</span>
                  <select id="listing-category" required aria-invalid={Boolean(formErrors.category)} aria-describedby={formErrors.category ? 'listing-category-error' : undefined} value={editor.form.category} onChange={(event) => updateForm('category', event.target.value)}><option value="">Select</option>{categories.slice(1).map((value) => <option value={value} key={value}>{cap(value)}</option>)}</select>
                  {formErrors.category && <small className="field-error" id="listing-category-error">{formErrors.category}</small>}
                </label>
                <label>
                  <span>Condition *</span>
                  <select id="listing-condition" required aria-invalid={Boolean(formErrors.condition)} aria-describedby={formErrors.condition ? 'listing-condition-error' : undefined} value={editor.form.condition} onChange={(event) => updateForm('condition', event.target.value)}><option value="">Select</option>{conditions.map((value) => <option value={value} key={value}>{cap(value)}</option>)}</select>
                  {formErrors.condition && <small className="field-error" id="listing-condition-error">{formErrors.condition}</small>}
                </label>
                <label className="wide"><span>Description</span><textarea value={editor.form.description} onChange={(event) => updateForm('description', event.target.value)} placeholder="Description" rows="4" /></label>
                <label className="wide"><span>Pickup / meetup location</span><input value={editor.form.pickup} onChange={(event) => updateForm('pickup', event.target.value)} placeholder="e.g. Library entrance or arrange on campus" /></label>
                <label className="wide">
                  <span>Photos</span>
                  <input type="file" accept="image/*" multiple onChange={addPhotos} disabled={editor.form.photos.length >= MAX_PHOTOS} aria-describedby="photo-help" />
                  <small id="photo-help" className="email-helper">Add up to {MAX_PHOTOS} photos. Images are resized for this browser-stored demo.</small>
                  {photoError && <small className="field-error" role="alert">{photoError}</small>}
                  {editor.form.photos.length > 0 && <div className="photo-previews">{editor.form.photos.map((src, index) => <div className="photo-preview" key={`${index}-${src.slice(0, 30)}`}><img src={src} alt={`Listing photo ${index + 1}`} /><button type="button" aria-label={`Remove photo ${index + 1}`} onClick={() => updateForm('photos', editor.form.photos.filter((_, photoIndex) => photoIndex !== index))}>×</button></div>)}</div>}
                </label>
                <label className="wide"><span>Seller contact email</span><input value={currentUser.email} readOnly aria-readonly="true" className="readonly-input" /><small className="email-helper">Taken from your registered account, so buyers can contact you about this item.</small></label>
                {editor.id && <label><span>Status</span><select value={editor.form.status} onChange={(event) => updateForm('status', event.target.value)}><option value="active">Active</option><option value="sold">Sold</option></select></label>}
              </div>
              <div className="modal-foot"><button type="button" onClick={() => setEditor(null)}>Cancel</button><button className="sell-cta" type="submit">{editor.id ? 'Save changes' : 'Publish item'}</button></div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
