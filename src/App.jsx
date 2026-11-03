import React, { useEffect, useMemo, useRef, useState } from 'react';

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
const MAX_PHOTOS = 4;
const TITLE_MAX = 80;
const DESCRIPTION_MAX = 1000;
const emptyForm = {title:'', price:'', category:'', condition:'', description:'', pickup:'', status:'active', photos:[]};
const fieldOrder = ['title', 'price', 'category', 'condition', 'status'];
const focusable = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';
function saved(){try {const value=JSON.parse(localStorage.getItem(KEY));return Array.isArray(value)?value:seed;}catch{return seed;}}
const cap = s => s==='like-new'?'Like new':(s||'').replace(/\b\w/g,m=>m.toUpperCase());
const money = new Intl.NumberFormat('en-US', {maximumFractionDigits: 2});
const formatPrice = price => Number(price)===0 ? 'Free' : `EGP ${money.format(price)}`;
const prefersReducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
function scrollToListings(){document.getElementById('discover')?.scrollIntoView({behavior: prefersReducedMotion() ? 'auto' : 'smooth'});}

function validate(form){
 const errors = {};
 const price = String(form.price).trim();
 if(!form.title.trim()) errors.title = 'Enter a title for your item.';
 if(price==='') errors.price = 'Enter a price. Use 0 if you are giving the item away.';
 else if(!Number.isFinite(Number(price)) || Number(price)<0) errors.price = 'Price must be a number of 0 or more.';
 if(!categories.slice(1).includes(form.category)) errors.category = 'Choose a category.';
 if(!conditions.includes(form.condition)) errors.condition = 'Choose the item condition.';
 if(!['active','sold'].includes(form.status)) errors.status = 'Choose a valid status.';
 return errors;
}

// Shrinks an uploaded photo so several fit in localStorage.
function readPhoto(file){
 return new Promise((resolve, reject) => {
  const url = URL.createObjectURL(file);
  const img = new Image();
  img.onload = () => {
   const scale = Math.min(1, 900 / Math.max(img.width, img.height));
   const canvas = document.createElement('canvas');
   canvas.width = Math.round(img.width * scale);
   canvas.height = Math.round(img.height * scale);
   canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
   URL.revokeObjectURL(url);
   resolve(canvas.toDataURL('image/jpeg', 0.72));
  };
  img.onerror = () => {URL.revokeObjectURL(url);reject(new Error('Unreadable image'));};
  img.src = url;
 });
}

function ListingImage({src, alt, emoji, className=''}) {
 const [broken, setBroken] = useState(false);
 useEffect(() => setBroken(false), [src]);
 return src && !broken
   ? <img className={className} src={src} alt={alt} loading="lazy" onError={() => setBroken(true)} />
   : <span className="item-emoji" role={alt?'img':undefined} aria-label={alt?`${alt} (photo unavailable)`:undefined} aria-hidden={alt?undefined:true}>{emoji || '📦'}</span>;
}

// Accessible dialog: moves focus in, traps Tab, closes on Escape, restores focus and locks page scroll.
let openDialogs = 0;
function Modal({labelledBy, onClose, className, initialFocus, children}){
 const ref = useRef(null);
 const closeRef = useRef(onClose);
 closeRef.current = onClose;
 useEffect(() => {
  const previous = document.activeElement;
  openDialogs++;
  document.body.style.overflow = 'hidden';
  const node = ref.current;
  ((initialFocus && node.querySelector(initialFocus)) || node.querySelector(focusable) || node).focus();
  return () => {
   openDialogs--;
   if(!openDialogs) document.body.style.overflow = '';
   if(previous?.isConnected) previous.focus();
  };
 }, []);
 function onKeyDown(e){
  if(e.key==='Escape'){e.stopPropagation();closeRef.current();return;}
  if(e.key!=='Tab') return;
  const nodes = [...ref.current.querySelectorAll(focusable)].filter(n => n.offsetParent!==null || n.matches('input[type=file]'));
  if(!nodes.length) return;
  const first = nodes[0], last = nodes[nodes.length-1];
  if(e.shiftKey && document.activeElement===first){e.preventDefault();last.focus();}
  else if(!e.shiftKey && document.activeElement===last){e.preventDefault();first.focus();}
 }
 return <div className="overlay" onMouseDown={e=>e.target===e.currentTarget&&onClose()}>
  <section ref={ref} className={className} role="dialog" aria-modal="true" aria-labelledby={labelledBy} tabIndex={-1} onKeyDown={onKeyDown}>{children}</section>
 </div>;
}

function Field({id, label, required, hint, error, wide, children}){
 return <div className={`field${wide?' wide':''}${error?' has-error':''}`}>
  <label htmlFor={id}>{label}{required&&<span className="req" aria-hidden="true"> *</span>}</label>
  {children}
  {hint&&<small id={`${id}-hint`} className="hint">{hint}</small>}
  {error&&<small id={`${id}-error`} className="field-error"><span aria-hidden="true">⚠ </span>{error}</small>}
 </div>;
}
const describedBy = (id, hint, error) => [hint&&`${id}-hint`, error&&`${id}-error`].filter(Boolean).join(' ') || undefined;

export default function App(){
 const [items,setItems] = useState(saved);
 const [query,setQuery] = useState('');
 const [category,setCategory] = useState('all');
 const [condition,setCondition] = useState('all');
 const [minPrice,setMinPrice] = useState('');
 const [maxPrice,setMaxPrice] = useState('');
 const [showSold,setShowSold] = useState(false);
 const [sort,setSort] = useState('newest');
 const [view,setView] = useState('all'); // 'all' or 'mine'
 const [selected,setSelected] = useState(null);
 const [editor,setEditor] = useState(null); // null or {id,form,initial}
 const [errors,setErrors] = useState({});
 const [photoError,setPhotoError] = useState('');
 const [activePhoto,setActivePhoto] = useState(0);
 const [notice,setNotice] = useState('');
 const [confirm,setConfirm] = useState(null); // null or {title,message,confirmLabel,cancelLabel,onConfirm}

 useEffect(()=>{try{localStorage.setItem(KEY,JSON.stringify(items));}catch{setNotice('Could not save in this browser — storage may be full. Try removing a photo.');}},[items]);
 useEffect(()=>setActivePhoto(0),[selected]);
 useEffect(()=>{if(!notice)return;const t=setTimeout(()=>setNotice(''),6000);return()=>clearTimeout(t);},[notice]);

 const myCount = items.filter(x=>x.owner==='you').length;
 const min = minPrice==='' ? null : Number(minPrice);
 const max = maxPrice==='' ? null : Number(maxPrice);
 const rangeInvalid = min!==null && max!==null && min>max;
 const filtersActive = query!=='' || category!=='all' || condition!=='all' || minPrice!=='' || maxPrice!=='';
 const listing = useMemo(()=>{
  const q = query.trim().toLowerCase();
  const result = items.filter(x=>{
   if(view==='mine'){if(x.owner!=='you')return false;}
   else if(!showSold && x.status==='sold') return false;
   if(category!=='all' && x.category!==category) return false;
   if(condition!=='all' && x.condition!==condition) return false;
   if(min!==null && x.price<min) return false;
   if(max!==null && x.price>max) return false;
   return !q || `${x.title} ${x.category} ${x.description} ${x.pickup} ${x.seller}`.toLowerCase().includes(q);
  });
  const soldRank = x => x.status==='sold' ? 1 : 0;
  return [...result].sort((a,b)=>soldRank(a)-soldRank(b) || (sort==='low'?a.price-b.price:sort==='high'?b.price-a.price:0));
 },[items,view,showSold,category,condition,min,max,query,sort]);
 const hiddenSold = view==='all' && !showSold ? items.filter(x=>x.status==='sold').length : 0;

 function clearFilters(){setQuery('');setCategory('all');setCondition('all');setMinPrice('');setMaxPrice('');}
 function showView(next){setView(next);scrollToListings();}
 function goHome(){clearFilters();setSort('newest');setView('all');window.scrollTo({top:0,behavior:prefersReducedMotion()?'auto':'smooth'});}

 function startEdit(item){
  if(item&&item.owner!=='you')return;
  const form = item ? {title:item.title,price:String(item.price),category:item.category,condition:item.condition,description:item.description||'',pickup:item.pickup||'',status:item.status,photos:item.photos||[]} : {...emptyForm};
  setErrors({});setPhotoError('');
  setEditor({id:item?.id||null,form,initial:JSON.stringify(form)});
 }
 function setField(name,value){
  setEditor(s=>({...s,form:{...s.form,[name]:value}}));
  if(errors[name])setErrors(e=>{const next={...e};delete next[name];return next;});
 }
 function requestCloseEditor(){
  if(JSON.stringify(editor.form)===editor.initial){setEditor(null);return;}
  setConfirm({title:'Discard your changes?',message:'The details you entered for this listing will be lost.',confirmLabel:'Discard changes',cancelLabel:'Keep editing',onConfirm:()=>setEditor(null)});
 }
 async function addPhotos(event){
  const files = [...event.target.files].slice(0, MAX_PHOTOS - editor.form.photos.length);
  event.target.value = '';
  setPhotoError('');
  try{
   const urls = await Promise.all(files.map(readPhoto));
   setEditor(s=>s&&({...s,form:{...s.form,photos:[...s.form.photos,...urls].slice(0,MAX_PHOTOS)}}));
  }catch{setPhotoError('One of those files could not be read. Please choose a JPG, PNG or WebP image.');}
 }
 function removePhoto(index){setEditor(s=>({...s,form:{...s.form,photos:s.form.photos.filter((_,i)=>i!==index)}}));}

 function submit(event){
  event.preventDefault();
  const f = editor.form;
  const found = validate(f);
  if(Object.keys(found).length){
   setErrors(found);
   requestAnimationFrame(()=>document.getElementById(`f-${fieldOrder.find(k=>found[k])}`)?.focus());
   return;
  }
  const original = editor.id ? items.find(x=>x.id===editor.id) : null;
  const next = {...f,title:f.title.trim(),price:Number(f.price),description:f.description.trim(),pickup:f.pickup.trim(),emoji:original?.emoji||'📦',owner:'you',seller:currentUser.name,sellerEmail:currentUser.email};
  if(editor.id){
   setItems(items.map(x=>x.id===editor.id?{...x,...next}:x));
   setNotice('Changes saved.');
  }else{
   const id = `m-${Date.now()}`;
   setItems([{...next,id,status:'active'},...items]);
   setNotice(`“${next.title}” is now listed for buyers.`);
   setSelected(id);
  }
  setEditor(null);
 }
 function toggleSold(item){
  const status = item.status==='sold' ? 'active' : 'sold';
  setItems(items.map(x=>x.id===item.id?{...x,status}:x));
  setNotice(status==='sold' ? `“${item.title}” marked as sold.` : `“${item.title}” is available again.`);
 }
 function askReset(){
  setConfirm({title:'Reset demo data?',message:'This removes every listing you added or changed in this browser and restores the example items. It cannot be undone.',confirmLabel:'Reset demo data',onConfirm:()=>{setItems(seed);setSelected(null);setEditor(null);clearFilters();setSort('newest');setView('all');setShowSold(false);setNotice('Example items restored.');}});
 }

 const resultText = `${listing.length} ${listing.length===1?'item':'items'}${view==='all'&&!showSold?' available':''}`;
 const errorCount = Object.keys(errors).length;

 return <div className="market-app">
  <a className="skip-link" href="#discover">Skip to listings</a>
  <div className="utility"><span>Campus Exchange — the student marketplace</span><span>All prices in Egyptian pounds (EGP)</span></div>
  <header className="navigation">
   <button className="brand" onClick={goHome} aria-label="Campus Exchange, back to start"><span className="brand-icon" aria-hidden="true">✳</span> Campus<span className="brand-alt">Exchange</span></button>
   <nav aria-label="Main">
    <button className={view==='all'?'on':''} aria-pressed={view==='all'} onClick={()=>showView('all')}>Browse items</button>
    <button className={view==='mine'?'on':''} aria-pressed={view==='mine'} onClick={()=>showView('mine')}>My listings <span className="count">{myCount}</span></button>
   </nav>
   <button className="sell-cta" onClick={()=>startEdit(null)}><span aria-hidden="true">+ </span>Sell an item</button>
  </header>
  <main>
   <section className="promo" aria-labelledby="promo-title">
    <div className="promo-copy">
     <p className="tag">The campus marketplace</p>
     <h1 id="promo-title">Buy and sell student essentials, <i>right around campus.</i></h1>
     <p>Compare second-hand textbooks, electronics, furniture and more from students near you — or list something you no longer need.</p>
     <div className="promo-actions"><button className="sell-cta" onClick={scrollToListings}>Browse listings</button><button className="ghost" onClick={()=>startEdit(null)}>Sell an item</button></div>
    </div>
    <div className="promo-art" aria-hidden="true"><span>📚</span><span>💡</span><span>🎧</span><span>🛋️</span></div>
   </section>

   <section className="discovery" id="discover" aria-labelledby="discover-title" tabIndex={-1}>
    <div className="discover-top">
     <h2 id="discover-title">{view==='mine'?'Your listings':'Browse listings'}</h2>
     <p>{view==='mine'?'Open a listing to edit it or mark it as sold.':'Items listed by students around campus. Use the filters to compare prices and condition.'}</p>
    </div>
    <div className="filters" role="search" aria-label="Filter listings">
     <div className="search">
      <label htmlFor="search-input" className="filter-label">Search</label>
      <div className="search-box">
       <span className="search-icon" aria-hidden="true">⌕</span>
       <input id="search-input" type="search" placeholder="Item, seller or pickup place" value={query} onChange={e=>setQuery(e.target.value)}/>
       {query&&<button type="button" className="clear-search" aria-label="Clear search" onClick={()=>{setQuery('');document.getElementById('search-input').focus();}}>×</button>}
      </div>
     </div>
     <div className="filter-field">
      <label htmlFor="condition-filter" className="filter-label">Condition</label>
      <select id="condition-filter" value={condition} onChange={e=>setCondition(e.target.value)}><option value="all">Any condition</option>{conditions.map(c=><option value={c} key={c}>{cap(c)}</option>)}</select>
     </div>
     <fieldset className="price-range">
      <legend className="filter-label">Price (EGP)</legend>
      <div className="range-inputs">
       <input type="number" min="0" inputMode="numeric" placeholder="Min" aria-label="Minimum price in EGP" value={minPrice} onChange={e=>setMinPrice(e.target.value)} onWheel={e=>e.currentTarget.blur()} aria-invalid={rangeInvalid||undefined} aria-describedby={rangeInvalid?'range-error':undefined}/>
       <span aria-hidden="true">–</span>
       <input type="number" min="0" inputMode="numeric" placeholder="Max" aria-label="Maximum price in EGP" value={maxPrice} onChange={e=>setMaxPrice(e.target.value)} onWheel={e=>e.currentTarget.blur()} aria-invalid={rangeInvalid||undefined} aria-describedby={rangeInvalid?'range-error':undefined}/>
      </div>
     </fieldset>
     <div className="filter-field">
      <label htmlFor="sort-select" className="filter-label">Sort by</label>
      <select id="sort-select" value={sort} onChange={e=>setSort(e.target.value)}><option value="newest">Newest first</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option></select>
     </div>
    </div>
    {rangeInvalid&&<p className="range-error" id="range-error">The minimum price is higher than the maximum, so nothing can match.</p>}
    <div className="category-row" role="group" aria-label="Category">{categories.map(c=><button key={c} onClick={()=>setCategory(c)} className={category===c?'on':''} aria-pressed={category===c}>{c==='all'?'All categories':cap(c)}</button>)}</div>
    <div className="results-bar">
     <p className="result-count" aria-live="polite">{resultText}</p>
     <div className="results-actions">
      {view==='all'&&<label className="check"><input type="checkbox" checked={showSold} onChange={e=>setShowSold(e.target.checked)}/> Show sold items</label>}
      {filtersActive&&<button className="link-button" onClick={clearFilters}>Clear filters</button>}
     </div>
    </div>
    {listing.length>0
     ? <div className="listing-grid">{listing.map(item=>{
        const sold = item.status==='sold';
        return <article className={`product${sold?' is-sold':''}`} key={item.id}>
         <div className="photo" onClick={()=>setSelected(item.id)}>
          <ListingImage src={item.photos?.[0]} alt="" emoji={item.emoji} className="listing-img" />
          <div className="badges">{sold&&<span className="badge badge-sold">Sold</span>}{item.owner==='you'&&<span className="badge badge-mine">Your listing</span>}</div>
         </div>
         <div className="prod-details">
          <p className="prod-meta">{cap(item.category)} · {cap(item.condition)}</p>
          <h3>{item.title}</h3>
          <p className="prod-price">{formatPrice(item.price)}</p>
          <p className="prod-desc">{item.description||'No description provided.'}</p>
          <p className="prod-pickup"><span aria-hidden="true">📍 </span><span className="visually-hidden">Pickup: </span>{item.pickup||'Arrange with seller'}</p>
          <button className="details-button" onClick={()=>setSelected(item.id)} aria-label={`View details: ${item.title}${sold?' (sold)':''}`}>View details</button>
         </div>
        </article>;
       })}</div>
     : <div className="empty-state">
        {view==='mine'&&myCount===0
         ? <><h3>You haven’t listed anything yet</h3><p>Sell something you no longer need to another student.</p><button className="sell-cta" onClick={()=>startEdit(null)}>Sell an item</button></>
         : <><h3>No items match your filters</h3><p>Try a different search, widen the price range or choose another category.{hiddenSold>0&&' Sold items are currently hidden.'}</p><div className="empty-actions">{filtersActive&&<button className="sell-cta" onClick={clearFilters}>Clear filters</button>}{hiddenSold>0&&<button className="ghost" onClick={()=>setShowSold(true)}>Show sold items</button>}</div></>}
       </div>}
   </section>
  </main>
  <footer>
   <div><strong>Campus Exchange</strong><span>From students, for students.</span></div>
   <div className="demo-tools"><span>Demo data is saved in this browser only.</span><button className="ghost small" onClick={askReset}>Reset demo data</button></div>
  </footer>

  {selected&&(()=>{
   const item=items.find(x=>x.id===selected);if(!item)return null;
   const images=item.photos || [];
   const sold=item.status==='sold';
   const subject=encodeURIComponent(`Campus Exchange: ${item.title}`);
   const body=encodeURIComponent(`Hi ${item.seller},\n\nI'm interested in your listing "${item.title}" (${formatPrice(item.price)}). Is it still available?\n\n`);
   const step=d=>setActivePhoto(i=>(i+d+images.length)%images.length);
   return <Modal labelledBy="detail-title" onClose={()=>setSelected(null)} className="detail-panel">
    <button className="close" aria-label="Close item details" onClick={()=>setSelected(null)}>×</button>
    <div className="detail-visual">
     <ListingImage src={images[activePhoto] || images[0]} alt={images.length>1?`${item.title}, photo ${activePhoto+1} of ${images.length}`:item.title} emoji={item.emoji} className="detail-img" />
     {images.length>1&&<><button className="photo-nav prev" aria-label="Previous photo" onClick={()=>step(-1)}>‹</button><button className="photo-nav next" aria-label="Next photo" onClick={()=>step(1)}>›</button><span className="photo-count" aria-hidden="true">{activePhoto+1} / {images.length}</span></>}
    </div>
    {images.length>1&&<div className="detail-thumbs" role="group" aria-label="Choose photo">{images.map((src,index)=><button type="button" key={index} className={activePhoto===index?'thumb active':'thumb'} aria-label={`Show photo ${index+1} of ${images.length}`} aria-pressed={activePhoto===index} onClick={()=>setActivePhoto(index)}><ListingImage src={src} alt="" emoji={item.emoji} className="thumb-img" /></button>)}</div>}
    <p className="section-kicker">{cap(item.category)} · {cap(item.condition)}</p>
    <h2 id="detail-title">{item.title}</h2>
    <div className="detail-price-row"><p className="detail-price">{formatPrice(item.price)}</p><span className={`status-pill${sold?' sold':''}`}>{sold?'Sold':'Available'}</span></div>
    <p className="item-description">{item.description||'No description provided.'}</p>
    <dl className="detail-meta"><div><dt>Pickup / meetup</dt><dd>{item.pickup || 'Arrange directly with the seller'}</dd></div><div><dt>Seller</dt><dd>{item.owner==='you'?'You':item.seller}</dd></div></dl>
    {item.owner==='you'
      ? <div className="detail-actions"><button className="sell-cta" onClick={()=>startEdit(item)}>Edit listing</button><button className="ghost" onClick={()=>toggleSold(item)}>{sold?'Mark as available':'Mark as sold'}</button></div>
      : sold
        ? <p className="fineprint">This item has been sold and is no longer available.</p>
        : <div className="contact"><a className="sell-cta" href={`mailto:${item.sellerEmail}?subject=${subject}&body=${body}`}><span aria-hidden="true">✉ </span>Email the seller</a><p className="fineprint">Opens your email app with a message ready to send to <strong>{item.sellerEmail}</strong>.</p></div>}
   </Modal>;
  })()}

  {editor&&<Modal labelledBy="editor-title" onClose={requestCloseEditor} className="sell-modal" initialFocus="#f-title">
   <div className="modal-head">
    <div><h2 id="editor-title">{editor.id?'Edit your listing':'Sell an item'}</h2><p>Buyers see these details on your listing. Fields marked <span className="req">*</span> are required.</p></div>
    <button className="close" aria-label="Close form" onClick={requestCloseEditor}>×</button>
   </div>
   <form onSubmit={submit} noValidate>
    {errorCount>0&&<div className="alert" role="alert"><strong>Please fix {errorCount===1?'this problem':`these ${errorCount} problems`} before saving:</strong><ul>{fieldOrder.filter(k=>errors[k]).map(k=><li key={k}><a href={`#f-${k}`} onClick={e=>{e.preventDefault();document.getElementById(`f-${k}`)?.focus();}}>{errors[k]}</a></li>)}</ul></div>}
    <div className="field-grid">
     <Field id="f-title" label="Item title" required wide error={errors.title}>
      <input id="f-title" value={editor.form.title} maxLength={TITLE_MAX} required aria-invalid={!!errors.title} aria-describedby={describedBy('f-title',null,errors.title)} onChange={e=>setField('title',e.target.value)} placeholder="e.g. Calculus II textbook"/>
     </Field>
     <Field id="f-price" label="Price (EGP)" required hint="Use 0 to give it away for free." error={errors.price}>
      <input id="f-price" type="number" min="0" step="0.01" inputMode="decimal" required value={editor.form.price} aria-invalid={!!errors.price} aria-describedby={describedBy('f-price',true,errors.price)} onWheel={e=>e.currentTarget.blur()} onChange={e=>setField('price',e.target.value)} placeholder="e.g. 250"/>
     </Field>
     <Field id="f-category" label="Category" required error={errors.category}>
      <select id="f-category" required value={editor.form.category} aria-invalid={!!errors.category} aria-describedby={describedBy('f-category',null,errors.category)} onChange={e=>setField('category',e.target.value)}><option value="">Choose a category</option>{categories.slice(1).map(c=><option value={c} key={c}>{cap(c)}</option>)}</select>
     </Field>
     <Field id="f-condition" label="Condition" required error={errors.condition}>
      <select id="f-condition" required value={editor.form.condition} aria-invalid={!!errors.condition} aria-describedby={describedBy('f-condition',null,errors.condition)} onChange={e=>setField('condition',e.target.value)}><option value="">Choose a condition</option>{conditions.map(c=><option value={c} key={c}>{cap(c)}</option>)}</select>
     </Field>
     {editor.id
      ? <Field id="f-status" label="Availability" hint="Sold items stay visible but buyers can’t contact you." error={errors.status}>
         <select id="f-status" value={editor.form.status} aria-invalid={!!errors.status} aria-describedby={describedBy('f-status',true,errors.status)} onChange={e=>setField('status',e.target.value)}><option value="active">Available</option><option value="sold">Sold</option></select>
        </Field>
      : <p className="status-note">New listings are published as <strong>Available</strong>. You can mark them as sold later.</p>}
     <div className="field wide">
      <span className="field-label" id="photos-label">Photos</span>
      <div className="photo-picker" role="group" aria-labelledby="photos-label">
       {editor.form.photos.map((src,i)=><div className="photo-tile" key={i}><img src={src} alt={`Photo ${i+1}${i===0?' (cover)':''}`}/>{i===0&&<span className="cover-tag" aria-hidden="true">Cover</span>}<button type="button" aria-label={`Remove photo ${i+1}`} onClick={()=>removePhoto(i)}>×</button></div>)}
       {editor.form.photos.length<MAX_PHOTOS&&<label className="photo-add"><input type="file" accept="image/*" multiple className="visually-hidden" aria-describedby="photos-hint" onChange={addPhotos}/><span aria-hidden="true">＋</span>Add photo</label>}
      </div>
      <small id="photos-hint" className="hint">Optional, up to {MAX_PHOTOS} photos. The first one is the cover buyers see.</small>
      {photoError&&<small className="field-error" role="alert">{photoError}</small>}
     </div>
     <Field id="f-description" label="Description" wide hint={`${editor.form.description.length}/${DESCRIPTION_MAX} characters`}>
      <textarea id="f-description" rows="5" maxLength={DESCRIPTION_MAX} value={editor.form.description} aria-describedby="f-description-hint" onChange={e=>setField('description',e.target.value)} placeholder="What’s included, how much it was used, any flaws buyers should know about"/>
     </Field>
     <Field id="f-pickup" label="Pickup / meetup location" wide hint="A public place on or near campus is safest.">
      <input id="f-pickup" value={editor.form.pickup} aria-describedby="f-pickup-hint" onChange={e=>setField('pickup',e.target.value)} placeholder="e.g. Library entrance, weekdays after 1 PM"/>
     </Field>
     <p className="contact-note wide">Buyers will contact you at <strong>{currentUser.email}</strong>, the email on your account.</p>
    </div>
    <div className="modal-foot"><button type="button" className="ghost" onClick={requestCloseEditor}>Cancel</button><button className="sell-cta" type="submit">{editor.id?'Save changes':'Publish item'}</button></div>
   </form>
  </Modal>}

  {confirm&&<Modal labelledBy="confirm-title" onClose={()=>setConfirm(null)} className="confirm-modal" initialFocus=".confirm-cancel">
   <h2 id="confirm-title">{confirm.title}</h2>
   <p>{confirm.message}</p>
   <div className="modal-foot"><button className="ghost confirm-cancel" onClick={()=>setConfirm(null)}>{confirm.cancelLabel||'Cancel'}</button><button className="danger" onClick={()=>{confirm.onConfirm();setConfirm(null);}}>{confirm.confirmLabel}</button></div>
  </Modal>}

  <div className="toast-region" role="status" aria-live="polite">{notice&&<div className="toast"><span>{notice}</span><button aria-label="Dismiss message" onClick={()=>setNotice('')}>×</button></div>}</div>
 </div>;
}
