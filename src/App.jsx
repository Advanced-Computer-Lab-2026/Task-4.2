import React, { useEffect, useMemo, useState } from 'react';

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
const emptyForm = {title:'', price:'', category:'', condition:'', description:'', pickup:'', status:'active'};
function saved(){try {const value=JSON.parse(localStorage.getItem(KEY));return Array.isArray(value)?value:seed;}catch{return seed;}}
const cap = s => s==='like-new'?'Like new':(s||'').replace(/\b\w/g,m=>m.toUpperCase());
function findErrors(form) {
 const errors = {};

 if (!form.title.trim()) {
  errors.title = 'Enter an item title.';
 }

 if (
  String(form.price).trim() === '' ||
  !Number.isFinite(Number(form.price)) ||
  Number(form.price) < 0
 ) {
  errors.price = 'Enter a price of zero or greater.';
 }

 if (!categories.slice(1).includes(form.category)) {
  errors.category = 'Choose a category.';
 }

 if (!conditions.includes(form.condition)) {
  errors.condition = 'Choose an item condition.';
 }

 if (!['active', 'sold'].includes(form.status)) {
  errors.status = 'Choose a valid availability.';
 }

 return errors;
}
function ListingImage({src, alt, emoji, className=''}) {
 const [broken, setBroken] = useState(false);
 useEffect(() => setBroken(false), [src]);
 return src && !broken
   ? <img className={className} src={src} alt={alt} loading="lazy" onError={() => setBroken(true)} />
   : <span className="item-emoji" aria-label="Photo unavailable">{emoji || '📦'}</span>;
}
export default function App(){
  const [fieldErrors, setFieldErrors] = useState({});
const [zoomed, setZoomed] = useState(false);
const [photoBusy, setPhotoBusy] = useState(false);
const [photoError, setPhotoError] = useState('');
 const [items,setItems] = useState(saved);
 const [query,setQuery] = useState('');
 const [category,setCategory] = useState('all');
 const [sort,setSort] = useState('featured');
 const [selected,setSelected] = useState(null);
 const [editor,setEditor] = useState(null); // null or {id,form}
 const [error,setError] = useState('');
 const [activePhoto,setActivePhoto] = useState(0);
 const [notice,setNotice] = useState('');
 useEffect(()=>setActivePhoto(0),[selected]);
 const listing = useMemo(()=>{let a=items.filter(x=>(category==='all'||x.category===category)&&`${x.title} ${x.category} ${x.description}`.toLowerCase().includes(query.toLowerCase()));if(sort==='low')a.sort((a,b)=>a.price-b.price);if(sort==='high')a.sort((a,b)=>b.price-a.price);return a;},[items,category,query,sort]);
 function startEdit(item) {
 if (item && item.owner !== 'you') return;

 setError('');
 setFieldErrors({});
 setPhotoError('');
 setZoomed(false);

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
      photos: [...(item.photos || [])]
     }
   : {...emptyForm, photos: []}
 });
}

function updateField(name, value) {
 setEditor(previous => ({
  ...previous,
  form: {...previous.form, [name]: value}
 }));

 setFieldErrors(previous => {
  const next = {...previous};
  delete next[name];
  return next;
 });

 setError('');
}

// Resize uploaded photos before storing them in this browser.
function preparePhoto(file) {
 return new Promise((resolve, reject) => {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
   reject(new Error('Choose JPG, PNG, or WebP photos.'));
   return;
  }

  if (file.size > 5 * 1024 * 1024) {
   reject(new Error('Each photo must be 5 MB or smaller.'));
   return;
  }

  const url = URL.createObjectURL(file);
  const image = new Image();

  image.onload = () => {
   try {
    const scale = Math.min(
     1,
     1200 / Math.max(image.naturalWidth, image.naturalHeight)
    );

    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));

    const context = canvas.getContext('2d');
    if (!context) throw new Error('Photo processing is unavailable.');

    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    resolve(canvas.toDataURL('image/jpeg', 0.78));
   } catch {
    reject(new Error('Could not process this photo. Try another image.'));
   } finally {
    URL.revokeObjectURL(url);
   }
  };

  image.onerror = () => {
   URL.revokeObjectURL(url);
   reject(new Error('Could not open this photo. Try another image.'));
  };

  image.src = url;
 });
}

async function addPhotos(event) {
 const files = Array.from(event.target.files || []);
 event.target.value = '';

 if (!files.length || photoBusy) return;

 setPhotoError('');

 if (editor.form.photos.length + files.length > 4) {
  setPhotoError('You can add up to 4 photos. Remove one before adding more.');
  return;
 }

 setPhotoBusy(true);

 try {
  const photos = await Promise.all(files.map(preparePhoto));

  setEditor(previous => previous
   ? {
      ...previous,
      form: {
       ...previous.form,
       photos: [...previous.form.photos, ...photos]
      }
     }
   : previous
  );
 } catch (err) {
  setPhotoError(err.message);
 } finally {
  setPhotoBusy(false);
 }
}

function submit(event) {
 event.preventDefault();
 if (photoBusy) return;

 const form = editor.form;
 const errors = findErrors(form);
 setFieldErrors(errors);
 setError('');

 if (Object.keys(errors).length) {
  setError('Please correct the highlighted fields.');

  requestAnimationFrame(() => {
   document.getElementById(`field-${Object.keys(errors)[0]}`)?.focus();
  });
  return;
 }

 const original = editor.id
  ? items.find(item => item.id === editor.id)
  : null;

 // Preserve the owner-only editing rule.
 if (editor.id && (!original || original.owner !== 'you')) {
  setError('You can only edit your own listings.');
  return;
 }

 const next = {
  ...form,
  title: form.title.trim(),
  price: Number(form.price),
  description: form.description.trim(),
  pickup: form.pickup.trim(),
  photos: form.photos || [],
  emoji: original?.emoji || '📦',
  owner: 'you',
  seller: currentUser.name,
  sellerEmail: currentUser.email
 };

 const updated = editor.id
  ? items.map(item => item.id === editor.id ? {...item, ...next} : item)
  : [{
     ...next,
     id: `m-${Date.now()}`,
     status: 'active'
    }, ...items];

 try {
  localStorage.setItem(KEY, JSON.stringify(updated));
 } catch {
  setError(
   'This browser could not save the listing. Your form is still here. ' +
   'Try removing a photo or freeing browser storage, then save again.'
  );
  return;
 }

 setItems(updated);
 setNotice(editor.id ? 'Changes saved.' : 'Item listed.');
 setEditor(null);
 setSelected(null);
 setZoomed(false);
}

function reset() {
 try {
  localStorage.setItem(KEY, JSON.stringify(seed));
 } catch {
  setNotice('Could not reset the demo because browser storage is unavailable.');
  return;
 }

 setItems(seed);
 setSelected(null);
 setEditor(null);
 setZoomed(false);
 setQuery('');
 setCategory('all');
 setSort('featured');
 setNotice('Example items restored.');
}
 return <div className="market-app">
  <div className="utility"><span>Campus Exchange</span><span>Trusted by students • All prices in EGP</span></div>
  <header className="navigation"><button className="brand" onClick={()=>{setSelected(null);setCategory('all')}}><span className="brand-icon">✳</span> CAMPUS<span className="brand-alt">exchange</span></button><nav><a href="#discover">Browse items</a><button onClick={()=>setCategory('textbooks')}>Textbooks</button><button onClick={()=>setCategory('electronics')}>Electronics</button></nav><div className="nav-actions"><span className="usercircle">Y</span><button className="sell-cta" onClick={()=>startEdit(null)}>+ Sell an item</button></div></header>
  <main>
   <section className="promo"><div className="promo-copy"><span className="tag">THE CAMPUS MARKETPLACE</span><h1>Everything you need,<br/><i>right around campus.</i></h1><p>Browse little finds, big essentials and almost everything in between.</p><button onClick={()=>document.getElementById('discover')?.scrollIntoView({behavior:'smooth'})}>Explore listings <span>↗</span></button></div><div className="promo-art"><span>📚</span><span>💡</span><span>🎧</span><span>🛋️</span></div></section>
   <section className="discovery" id="discover"><div className="discover-top"><div><p className="section-kicker">CURATED FOR YOUR CAMPUS</p><h2>Find something good.</h2><p>Items listed by people around you.</p></div><div className="discover-right"><label className="search"><span>⌕</span><input aria-label="Search listings" placeholder="Search listings" value={query} onChange={e=>setQuery(e.target.value)}/></label><label className="sort"><span>Sort</span><select value={sort} onChange={e=>setSort(e.target.value)}><option value="featured">Featured</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option></select></label></div></div>
    <div className="category-row">{categories.map(c=><button key={c} onClick={()=>setCategory(c)} className={category===c?'on':''}>{c==='all'?'All items':cap(c)}</button>)}</div>
    {notice&&<p className="notice" role="status">{notice} <button onClick={()=>setNotice('')}>×</button></p>}
<div className="listing-grid">
 {listing.map(item => (
  <article className="product" key={item.id}>
   <button
    type="button"
    className="product-open"
    onClick={() => {
     setSelected(item.id);
     setZoomed(false);
    }}
    aria-label={`View ${item.title}, EGP ${item.price.toLocaleString()}${
     item.status === 'sold' ? ', sold' : ''
    }`}
   >
    <div className="photo">
     <ListingImage
      src={item.photos?.[0]}
      alt={item.title}
      emoji={item.emoji}
      className="listing-img"
     />

     {item.status === 'sold' && (
      <span className="stamp sold-badge">Sold</span>
     )}
    </div>

    <div className="prod-details">
     <div className="prod-topline">
      <span className="muted">{cap(item.category)}</span>
      <span className={`condition-label condition-${item.condition}`}>
       {cap(item.condition)}
      </span>
     </div>

     <h3>{item.title}</h3>
     <p>{item.description}</p>

     <div className="costline">
      <strong>EGP {item.price.toLocaleString()}</strong>
      <span className="view-hint" aria-hidden="true">View item ↗</span>
     </div>
    </div>
   </button>
  </article>
 ))}

 {listing.length === 0 && (
  <p className="noresults">No listings match your search.</p>
 )}
</div>
   </section>
   <footer><strong>CAMPUS exchange</strong><span>From students, for students.</span><button onClick={reset}>Reset demo</button></footer>
  </main>
  {selected&&(()=>{
   const item=items.find(x=>x.id===selected);if(!item)return null;
   const images=item.photos || [];
   const subject=encodeURIComponent(`Campus Exchange: ${item.title}`);
   const body=encodeURIComponent(`Hi ${item.seller},\n\nI'm interested in your listing "${item.title}" (EGP ${item.price}). Is it still available?\n\n`);
   return <div className="overlay" onMouseDown={e=>e.target===e.currentTarget&&setSelected(null)}>
    <section className="detail-panel" role="dialog" aria-modal="true" aria-label="Item details">
     <button className="close" aria-label="Close item details" onClick={()=>setSelected(null)}>×</button>
     <button
 type="button"
 className="detail-visual zoom-trigger"
 disabled={!images.length}
 onClick={() => setZoomed(true)}
 aria-label={`Enlarge photo of ${item.title}`}
>
 <ListingImage
  src={images[activePhoto] || images[0]}
  alt={`${item.title} photo ${activePhoto + 1}`}
  emoji={item.emoji}
  className="detail-img"
 />
 {images.length > 0 && (
  <span className="zoom-hint">Click to enlarge ⤢</span>
 )}
</button>
     {images.length>1&&<div className="detail-thumbs" aria-label="Item photos">{images.map((src,index)=><button type="button" key={index} className={activePhoto===index?'thumb active':'thumb'} aria-label={`Show photo ${index+1} of ${images.length}`} aria-pressed={activePhoto===index} onClick={()=>setActivePhoto(index)}><ListingImage src={src} alt="" emoji={item.emoji} className="thumb-img" /></button>)}</div>}
<div className="detail-labels">
 <span className="section-kicker">{cap(item.category)}</span>
 <span className={`condition-label condition-${item.condition}`}>
  {cap(item.condition)}
 </span>
 <span className={`availability-badge ${
  item.status === 'sold' ? 'is-sold' : 'is-available'
 }`}>
  {item.status === 'sold' ? 'Sold' : 'Available'}
 </span>
</div>
     <h2>{item.title}</h2>
     <h3>EGP {item.price.toLocaleString()}</h3>
     <p className="item-description">{item.description||'No description supplied.'}</p>
     <div className="detail-meta"><p><strong>Pickup</strong><br/>{item.pickup || 'Arrange directly with seller'}</p><p><strong>Seller</strong><br/>{item.seller}</p></div>
     {item.owner==='you'
       ? <button className="sell-cta" onClick={()=>startEdit(item)}>Edit your listing</button>
       : item.status==='sold'
         ? <p className="fineprint">This item is marked as sold.</p>
         : <a className="sell-cta contact-seller" href={`mailto:${item.sellerEmail}?subject=${subject}&body=${body}`}>✉ Contact seller</a>}
    </section>
   </div>;
  })()}
{zoomed && selected && (() => {
 const item = items.find(value => value.id === selected);
 const src = item?.photos?.[activePhoto] || item?.photos?.[0];

 if (!src) return null;

 return (
  <div
   className="overlay image-overlay"
   onMouseDown={event => {
    if (event.target === event.currentTarget) setZoomed(false);
   }}
  >
   <section
    className="image-viewer"
    role="dialog"
    aria-modal="true"
    aria-label={`Enlarged photo of ${item.title}`}
   >
    <button
     type="button"
     className="close"
     autoFocus
     aria-label="Close enlarged photo"
     onClick={() => setZoomed(false)}
     onKeyDown={event => {
      if (event.key === 'Escape') setZoomed(false);
      if (event.key === 'Tab') event.preventDefault();
     }}
    >
     ×
    </button>

    <ListingImage
     src={src}
     alt={item.title}
     emoji={item.emoji}
     className="enlarged-img"
    />
   </section>
  </div>
 );
})()}

{editor && (
 <div className="overlay">
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
     <p>Fields marked * are required. Photos are optional.</p>
    </div>

    <button
     type="button"
     className="close"
     aria-label="Close listing form"
     disabled={photoBusy}
     onClick={() => setEditor(null)}
    >
     ×
    </button>
   </div>

   <form onSubmit={submit} noValidate>
    <div className="field-grid">
     <label>
      <span>Item title *</span>
      <input
       id="field-title"
       required
       value={editor.form.title}
       onChange={event => updateField('title', event.target.value)}
       placeholder="What are you selling?"
       aria-invalid={Boolean(fieldErrors.title)}
       aria-describedby={fieldErrors.title ? 'error-title' : undefined}
      />
      {fieldErrors.title && (
       <small id="error-title" className="field-error">
        {fieldErrors.title}
       </small>
      )}
     </label>

     <label>
      <span>Price (EGP) *</span>
      <input
       id="field-price"
       type="number"
       min="0"
       step="any"
       required
       value={editor.form.price}
       onChange={event => updateField('price', event.target.value)}
       placeholder="e.g. 250"
       aria-invalid={Boolean(fieldErrors.price)}
       aria-describedby={fieldErrors.price ? 'error-price' : undefined}
      />
      {fieldErrors.price && (
       <small id="error-price" className="field-error">
        {fieldErrors.price}
       </small>
      )}
     </label>

     <label>
      <span>Category *</span>
      <select
       id="field-category"
       required
       value={editor.form.category}
       onChange={event => updateField('category', event.target.value)}
       aria-invalid={Boolean(fieldErrors.category)}
       aria-describedby={fieldErrors.category ? 'error-category' : undefined}
      >
       <option value="">Choose a category</option>
       {categories.slice(1).map(value => (
        <option value={value} key={value}>{cap(value)}</option>
       ))}
      </select>
      {fieldErrors.category && (
       <small id="error-category" className="field-error">
        {fieldErrors.category}
       </small>
      )}
     </label>

     <label>
      <span>Condition *</span>
      <select
       id="field-condition"
       required
       value={editor.form.condition}
       onChange={event => updateField('condition', event.target.value)}
       aria-invalid={Boolean(fieldErrors.condition)}
       aria-describedby={fieldErrors.condition ? 'error-condition' : undefined}
      >
       <option value="">Choose a condition</option>
       {conditions.map(value => (
        <option value={value} key={value}>{cap(value)}</option>
       ))}
      </select>
      {fieldErrors.condition && (
       <small id="error-condition" className="field-error">
        {fieldErrors.condition}
       </small>
      )}
     </label>

     <div className="photo-upload wide">
      <label htmlFor="item-photos">Item photos</label>
      <p id="photo-help">
       Add up to 4 photos. JPG, PNG or WebP, up to 5 MB each.
       The first photo is the cover.
      </p>

      <input
       id="item-photos"
       type="file"
       accept="image/jpeg,image/png,image/webp"
       multiple
       disabled={photoBusy || editor.form.photos.length >= 4}
       aria-describedby="photo-help photo-feedback"
       onChange={addPhotos}
      />

      <div id="photo-feedback" aria-live="polite">
       {photoBusy && <p>Preparing photos…</p>}
       {photoError && <p className="field-error">{photoError}</p>}
      </div>

      {editor.form.photos.length > 0 && (
       <div className="upload-previews">
        {editor.form.photos.map((src, index) => (
         <div className="upload-preview" key={`${index}-${src.slice(-20)}`}>
          <ListingImage
           src={src}
           alt={`Listing photo ${index + 1}`}
           emoji="📦"
           className="preview-img"
          />
          {index === 0 && <span className="cover-label">Cover</span>}
          <button
           type="button"
           disabled={photoBusy}
           aria-label={`Remove photo ${index + 1}`}
           onClick={() => updateField(
            'photos',
            editor.form.photos.filter((_, position) => position !== index)
           )}
          >
           Remove
          </button>
         </div>
        ))}
       </div>
      )}
     </div>

     <label className="wide">
      <span>Description</span>
      <textarea
       value={editor.form.description}
       onChange={event => updateField('description', event.target.value)}
       placeholder="Describe the item, its features and any signs of wear."
       rows="4"
      />
     </label>

     <label className="wide">
      <span>Pickup / meetup location</span>
      <input
       value={editor.form.pickup}
       onChange={event => updateField('pickup', event.target.value)}
       placeholder="e.g. Library entrance or arrange on campus"
      />
     </label>

     <label className="wide">
      <span>Seller contact email</span>
      <input
       value={currentUser.email}
       readOnly
       aria-readonly="true"
       className="readonly-input"
      />
      <small className="email-helper">
       Taken from your registered account, so buyers can contact you.
      </small>
     </label>

     {editor.id && (
      <label>
       <span>Availability</span>
       <select
        id="field-status"
        value={editor.form.status}
        onChange={event => updateField('status', event.target.value)}
        aria-invalid={Boolean(fieldErrors.status)}
        aria-describedby={fieldErrors.status ? 'error-status' : undefined}
       >
        <option value="active">Available</option>
        <option value="sold">Sold</option>
       </select>
       {fieldErrors.status && (
        <small id="error-status" className="field-error">
         {fieldErrors.status}
        </small>
       )}
      </label>
     )}
    </div>

    {error && <p className="alert" role="alert">{error}</p>}

    <div className="modal-foot">
     <button
      type="button"
      disabled={photoBusy}
      onClick={() => setEditor(null)}
     >
      Cancel
     </button>
     <button className="sell-cta" type="submit" disabled={photoBusy}>
      {photoBusy
       ? 'Preparing photos…'
       : editor.id ? 'Save changes' : 'Publish item'}
     </button>
    </div>
   </form>
  </section>
 </div>
)}
 </div>;
}
