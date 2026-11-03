import React, { useEffect, useMemo, useRef, useState } from 'react';

const KEY = 'acl-marketplace-v3';
const categories = ['all', 'textbooks', 'electronics', 'furniture', 'clothing', 'other'];
const conditions = ['new', 'like-new', 'used', 'worn'];
const currentUser = {name: 'You', email: 'you@example.com'}; // Demo account; no login backend
const MAX_PHOTOS = 5;
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
const emptyForm = {title:'', price:'', category:'', condition:'', description:'', pickup:'', status:'active', photos:[]};
const fieldLabels = {title:'Item title', price:'Price', category:'Category', condition:'Condition', status:'Status'};
const fieldOrder = ['title', 'price', 'category', 'condition', 'status'];

function saved(){try {const value=JSON.parse(localStorage.getItem(KEY));return Array.isArray(value)?value:seed;}catch{return seed;}}
const cap = s => s==='like-new'?'Like new':(s||'').replace(/\b\w/g,m=>m.toUpperCase());

// Returns one message per invalid field so the form can say exactly what is missing.
function findErrors(form){
  const errors = {};
  if(!form.title.trim()) errors.title = 'Enter a title for your item.';
  const price = String(form.price).trim();
  if(price==='') errors.price = 'Enter a price (use 0 if it is free).';
  else if(!Number.isFinite(Number(price)) || Number(price)<0) errors.price = 'Price must be a number of 0 or more.';
  if(!categories.slice(1).includes(form.category)) errors.category = 'Choose a category.';
  if(!conditions.includes(form.condition)) errors.condition = 'Choose the item condition.';
  if(!['active','sold'].includes(form.status)) errors.status = 'Choose a valid status.';
  return errors;
}

// Shrinks an uploaded photo so several fit in localStorage.
function readPhoto(file, maxSide = 1000){
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('read'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('decode'));
      img.onload = () => {
        const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

function ListingImage({src, alt, emoji, className=''}) {
  const [broken, setBroken] = useState(false);
  useEffect(() => setBroken(false), [src]);
  return src && !broken
    ? <img className={className} src={src} alt={alt} loading="lazy" onError={() => setBroken(true)} />
    : <span className="item-emoji" aria-label="Photo unavailable">{emoji || '📦'}</span>;
}

export default function App(){
  const [items,setItems] = useState(saved);
  const [query,setQuery] = useState('');
  const [category,setCategory] = useState('all');
  const [sort,setSort] = useState('featured');
  const [selected,setSelected] = useState(null);
  const [editor,setEditor] = useState(null); // null or {id,form}
  const [errors,setErrors] = useState({});
  const [photoError,setPhotoError] = useState('');
  const [activePhoto,setActivePhoto] = useState(0);
  const [notice,setNotice] = useState('');
  const formRef = useRef(null);

  useEffect(()=>{
    try { localStorage.setItem(KEY,JSON.stringify(items)); }
    catch { setNotice('Your browser storage is full, so the latest change will not survive a page reload. Try removing a photo.'); }
  },[items]);
  useEffect(()=>setActivePhoto(0),[selected]);

  // Escape closes whichever dialog is open; the page behind stops scrolling.
  const dialogOpen = Boolean(selected || editor);
  useEffect(()=>{
    if(!dialogOpen) return;
    const onKey = e => { if(e.key==='Escape'){ setEditor(null); setSelected(null); } };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  },[dialogOpen]);

  const listing = useMemo(()=>{
    const q = query.toLowerCase();
    const a = items.filter(x=>(category==='all'||x.category===category)&&`${x.title} ${x.category} ${x.description}`.toLowerCase().includes(q));
    if(sort==='low') a.sort((a,b)=>a.price-b.price);
    if(sort==='high') a.sort((a,b)=>b.price-a.price);
    return a;
  },[items,category,query,sort]);

  function setField(name, value){
    setEditor(s=>({...s,form:{...s.form,[name]:value}}));
    if(errors[name]) setErrors(e=>{const n={...e}; delete n[name]; return n;});
  }

  function startEdit(item){
    if(item&&item.owner!=='you')return;
    setErrors({}); setPhotoError('');
    setEditor({id:item?.id||null,form:item
      ? {title:item.title,price:String(item.price),category:item.category,condition:item.condition,description:item.description,pickup:item.pickup||'',status:item.status,photos:[...(item.photos||[])]}
      : {...emptyForm, photos:[]}});
  }

  async function addPhotos(fileList){
    const files = [...fileList].filter(f=>f.type.startsWith('image/'));
    setPhotoError('');
    if(!files.length){ setPhotoError('Choose an image file (JPG, PNG, WebP…).'); return; }
    const room = MAX_PHOTOS - editor.form.photos.length;
    if(room<=0){ setPhotoError(`You can add up to ${MAX_PHOTOS} photos.`); return; }
    if(files.length>room) setPhotoError(`Only the first ${room} photo${room===1?'':'s'} were added (limit ${MAX_PHOTOS}).`);
    try {
      const urls = await Promise.all(files.slice(0,room).map(f=>readPhoto(f)));
      setEditor(s=>s&&({...s,form:{...s.form,photos:[...s.form.photos,...urls].slice(0,MAX_PHOTOS)}}));
    } catch { setPhotoError('One of those images could not be read. Try a different file.'); }
  }
  function removePhoto(index){
    setPhotoError('');
    setEditor(s=>({...s,form:{...s.form,photos:s.form.photos.filter((_,i)=>i!==index)}}));
  }

  function submit(event){
    event.preventDefault();
    const f=editor.form;
    const errs=findErrors(f);
    if(Object.keys(errs).length){
      setErrors(errs);
      const first = fieldOrder.find(k=>errs[k]);
      requestAnimationFrame(()=>formRef.current?.querySelector(`[name="${first}"]`)?.focus());
      return;
    }
    const original=editor.id?items.find(x=>x.id===editor.id):null;
    const next={...f,title:f.title.trim(),price:Number(f.price),description:f.description.trim(),pickup:f.pickup.trim(),photos:f.photos,emoji:original?.emoji||'📦',owner:'you',seller:currentUser.name,sellerEmail:currentUser.email};
    if(editor.id){setItems(items.map(x=>x.id===editor.id?{...x,...next}:x));setNotice('Changes saved.');}
    else{setItems([{...next,id:`m-${Date.now()}`,status:'active'},...items]);setNotice('Item listed.');}
    setEditor(null);setSelected(null);
  }

  function setStatus(id, status){
    setItems(items.map(x=>x.id===id&&x.owner==='you'?{...x,status}:x));
    setNotice(status==='sold'?'Marked as sold.':'Listing is active again.');
  }
  function clearFilters(){setQuery('');setCategory('all');}
  function reset(){setItems(seed);setSelected(null);setEditor(null);clearFilters();setSort('featured');setNotice('Example items restored.');}

  const errorList = fieldOrder.filter(k=>errors[k]);
  const fieldProps = name => ({
    name,
    id:`f-${name}`,
    'aria-invalid': errors[name] ? 'true' : undefined,
    'aria-describedby': errors[name] ? `f-${name}-err` : undefined,
    className: errors[name] ? 'invalid' : undefined,
  });
  const fieldError = name => errors[name] ? <small className="field-error" id={`f-${name}-err`}>{errors[name]}</small> : null;

  return <div className="market-app">
    <header className="navigation">
      <button className="brand" onClick={()=>{setSelected(null);clearFilters();}} aria-label="Campus Exchange home">
        <span className="brand-icon">✳</span>
        <span className="brand-text">
          <span>CAMPUS<span className="brand-alt">exchange</span></span>
          <small className="brand-tagline">From students, for students · Prices in EGP</small>
        </span>
      </button>
      <div className="nav-actions">
        <span className="usercircle" title={`Signed in as ${currentUser.email}`} aria-label={`Signed in as ${currentUser.name}`}>Y</span>
        <button className="btn btn-primary" onClick={()=>startEdit(null)}>+ Sell an item</button>
      </div>
    </header>

    <main>
      <section className="promo">
        <div className="promo-copy">
          <span className="tag">THE CAMPUS MARKETPLACE</span>
          <h1>Everything you need,<br/><i>right around campus.</i></h1>
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
            <label className="search"><span aria-hidden="true">⌕</span><input type="search" aria-label="Search listings" placeholder="Search listings" value={query} onChange={e=>setQuery(e.target.value)}/></label>
            <label className="sort"><span>Sort</span><select value={sort} onChange={e=>setSort(e.target.value)}><option value="featured">Featured</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option></select></label>
          </div>
        </div>

        <div className="category-row" role="group" aria-label="Filter by category">
          {categories.map(c=><button key={c} onClick={()=>setCategory(c)} className={category===c?'chip on':'chip'} aria-pressed={category===c}>{c==='all'?'All items':cap(c)}</button>)}
        </div>

        <div className="results-bar">
          <span>{listing.length} {listing.length===1?'item':'items'}</span>
          {(query||category!=='all')&&<button className="btn-link" onClick={clearFilters}>Clear filters</button>}
        </div>

        {notice&&<p className="notice" role="status">{notice} <button aria-label="Dismiss message" onClick={()=>setNotice('')}>×</button></p>}

        <div className="listing-grid">
          {listing.map(item=>{
            const sold = item.status==='sold';
            const mine = item.owner==='you';
            return <article className={sold?'product is-sold':'product'} key={item.id}>
              <button className="photo" onClick={()=>setSelected(item.id)} aria-label={`View ${item.title}`}>
                <span className="stamp">{cap(item.condition)}</span>
                {sold&&<span className="sold-badge">Sold</span>}
                <ListingImage src={item.photos?.[0]} alt="" emoji={item.emoji} className="listing-img" />
              </button>
              <div className="prod-details">
                <div className="prod-topline">
                  <span className="muted">{cap(item.category)}</span>
                  {mine&&<span className="mine-badge">Your listing</span>}
                </div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
                <div className="costline">
                  <strong>EGP {item.price.toLocaleString()}</strong>
                  <span>{mine?'You':item.seller}</span>
                </div>
                <button className="btn btn-secondary btn-block" onClick={()=>setSelected(item.id)}>View item <span aria-hidden="true">→</span></button>
              </div>
            </article>;
          })}
          {listing.length===0&&<div className="noresults"><p>No listings match your search.</p><button className="btn btn-secondary" onClick={clearFilters}>Clear filters</button></div>}
        </div>
      </section>

      <footer><strong>CAMPUS exchange</strong><span>From students, for students.</span><button className="btn-link" onClick={reset}>Reset demo</button></footer>
    </main>

    {selected&&(()=>{
      const item=items.find(x=>x.id===selected);if(!item)return null;
      const images=item.photos||[];
      const subject=encodeURIComponent(`Campus Exchange: ${item.title}`);
      const body=encodeURIComponent(`Hi ${item.seller},\n\nI'm interested in your listing "${item.title}" (EGP ${item.price}). Is it still available?\n\n`);
      const sold=item.status==='sold';
      return <div className="overlay" onMouseDown={e=>e.target===e.currentTarget&&setSelected(null)}>
        <section className="detail-panel" role="dialog" aria-modal="true" aria-label="Item details">
          <button className="close" aria-label="Close item details" onClick={()=>setSelected(null)} autoFocus>×</button>
          <div className="detail-scroll">
            <div className="detail-visual">
              <ListingImage src={images[activePhoto]||images[0]} alt={`${item.title} photo ${activePhoto+1}`} emoji={item.emoji} className="detail-img" />
              {sold&&<span className="sold-badge">Sold</span>}
            </div>
            {images.length>1&&<div className="detail-thumbs" aria-label="Item photos">{images.map((src,index)=><button type="button" key={index} className={activePhoto===index?'thumb active':'thumb'} aria-label={`Show photo ${index+1} of ${images.length}`} aria-pressed={activePhoto===index} onClick={()=>setActivePhoto(index)}><ListingImage src={src} alt="" emoji={item.emoji} className="thumb-img" /></button>)}</div>}
            <p className="section-kicker">{cap(item.category)} · {cap(item.condition)}</p>
            <h2>{item.title}</h2>
            <h3>EGP {item.price.toLocaleString()}</h3>
            <p className="item-description">{item.description||'No description supplied.'}</p>
            <div className="detail-meta"><p><strong>Pickup</strong><br/>{item.pickup||'Arrange directly with seller'}</p><p><strong>Seller</strong><br/>{item.seller}</p></div>
            {item.owner==='you'
              ? <div className="detail-actions">
                  <button className="btn btn-primary" onClick={()=>startEdit(item)}>Edit your listing</button>
                  <button className="btn btn-secondary" onClick={()=>setStatus(item.id, sold?'active':'sold')}>{sold?'Mark as available':'Mark as sold'}</button>
                </div>
              : sold
                ? <p className="fineprint">This item has been sold.</p>
                : <div className="detail-actions"><a className="btn btn-primary" href={`mailto:${item.sellerEmail}?subject=${subject}&body=${body}`}>✉ Contact seller</a></div>}
          </div>
        </section>
      </div>;
    })()}

    {editor&&<div className="overlay" onMouseDown={e=>e.target===e.currentTarget&&setEditor(null)}>
      <section className="sell-modal" role="dialog" aria-modal="true" aria-label={editor.id?'Edit item':'Sell item'}>
        <div className="modal-head">
          <div><p className="section-kicker">CAMPUS EXCHANGE</p><h2>{editor.id?'Edit your listing':'Sell an item'}</h2><p>Fields marked * are required.</p></div>
          <button className="close" aria-label="Close form" onClick={()=>setEditor(null)}>×</button>
        </div>
        <form onSubmit={submit} noValidate ref={formRef}>
          {errorList.length>0&&<div className="alert" role="alert">
            <strong>Please fix {errorList.length===1?'this field':`these ${errorList.length} fields`} before publishing:</strong>
            <ul>{errorList.map(k=><li key={k}><a href={`#f-${k}`} onClick={e=>{e.preventDefault();document.getElementById(`f-${k}`)?.focus();}}>{fieldLabels[k]}</a> — {errors[k]}</li>)}</ul>
          </div>}
          <div className="field-grid">
            <div className="wide photos-label" id="photos-label">Photos <em className="optional">(optional, up to {MAX_PHOTOS}; the first one is the cover)</em></div>
            <div className="wide photo-field" role="group" aria-labelledby="photos-label">
              {editor.form.photos.map((src,i)=><div className="photo-tile" key={i}>
                <img src={src} alt={`Photo ${i+1}`}/>
                {i===0&&<span className="cover-tag">Cover</span>}
                <button type="button" className="photo-remove" aria-label={`Remove photo ${i+1}`} onClick={()=>removePhoto(i)}>×</button>
              </div>)}
              {editor.form.photos.length<MAX_PHOTOS&&<label className="photo-drop" onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();addPhotos(e.dataTransfer.files);}}>
                <input type="file" accept="image/*" multiple onChange={e=>{addPhotos(e.target.files);e.target.value='';}}/>
                <span className="photo-drop-icon" aria-hidden="true">＋</span>
                <span>Add photos</span>
              </label>}
              {photoError&&<small className="field-error photo-error">{photoError}</small>}
            </div>
            <label><span>Item title *</span><input {...fieldProps('title')} value={editor.form.title} onChange={e=>setField('title',e.target.value)} placeholder="What are you selling?"/>{fieldError('title')}</label>
            <label><span>Price (EGP) *</span><input {...fieldProps('price')} type="number" min="0" step="0.01" inputMode="decimal" value={editor.form.price} onChange={e=>setField('price',e.target.value)} placeholder="e.g. 250"/>{fieldError('price')}</label>
            <label><span>Category *</span><select {...fieldProps('category')} value={editor.form.category} onChange={e=>setField('category',e.target.value)}><option value="">Select a category</option>{categories.slice(1).map(c=><option value={c} key={c}>{cap(c)}</option>)}</select>{fieldError('category')}</label>
            <label><span>Condition *</span><select {...fieldProps('condition')} value={editor.form.condition} onChange={e=>setField('condition',e.target.value)}><option value="">Select a condition</option>{conditions.map(c=><option value={c} key={c}>{cap(c)}</option>)}</select>{fieldError('condition')}</label>
            <label className="wide"><span>Description</span><textarea value={editor.form.description} onChange={e=>setField('description',e.target.value)} placeholder="Size, age, any wear or missing parts…" rows="5"/></label>
            <label className="wide"><span>Pickup / meetup location</span><input value={editor.form.pickup} onChange={e=>setField('pickup',e.target.value)} placeholder="e.g. Library entrance or arrange on campus" /></label>
            <label className="wide"><span>Seller contact email</span><input value={currentUser.email} readOnly aria-readonly="true" className="readonly-input"/><small className="email-helper">Taken from your registered account, so buyers can contact you about this item.</small></label>
            {editor.id&&<label><span>Status</span><select {...fieldProps('status')} value={editor.form.status} onChange={e=>setField('status',e.target.value)}><option value="active">Active</option><option value="sold">Sold</option></select>{fieldError('status')}</label>}
          </div>
          <div className="modal-foot">
            <button type="button" className="btn btn-secondary" onClick={()=>setEditor(null)}>Cancel</button>
            <button className="btn btn-primary" type="submit">{editor.id?'Save changes':'Publish item'}</button>
          </div>
        </form>
      </section>
    </div>}
  </div>;
}
