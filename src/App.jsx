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
const emptyForm = {title:'', price:'', category:'', condition:'', description:'', pickup:'', status:'active'};
function saved(){try {const value=JSON.parse(localStorage.getItem(KEY));return Array.isArray(value)?value:seed;}catch{return seed;}}
const cap = s => s==='like-new'?'Like new':(s||'').replace(/\b\w/g,m=>m.toUpperCase());
function findError(form){
 if(!form.title.trim())return 'Please complete the item title.';
 if(form.price.trim()==='' || !Number.isFinite(Number(form.price)) || Number(form.price)<0)return 'Enter a price of zero or more.';
 if(!categories.slice(1).includes(form.category))return 'Choose a category.';
 if(!conditions.includes(form.condition))return 'Choose an item condition.';
 if(!['active','sold'].includes(form.status))return 'Choose a valid status.';
 return '';
}
const MAX_PHOTOS = 6;
async function preparePhoto(file) {
 if (!['image/jpeg','image/png','image/webp'].includes(file.type)) throw new Error('Choose a JPG, PNG or WebP image.');
 if (file.size > 10 * 1024 * 1024) throw new Error('Each photo must be 10 MB or smaller.');
 const bitmap = await createImageBitmap(file).catch(() => { throw new Error('This image could not be opened. Try another file.'); });
 const scale = Math.min(1, 1000 / Math.max(bitmap.width, bitmap.height));
 const canvas = document.createElement('canvas');
 canvas.width = Math.max(1, Math.round(bitmap.width * scale));
 canvas.height = Math.max(1, Math.round(bitmap.height * scale));
 const ctx = canvas.getContext('2d');
 ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, canvas.width, canvas.height);
 ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height); bitmap.close();
 return canvas.toDataURL('image/jpeg', .75);
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
 const [minPrice,setMinPrice] = useState('');
 const [maxPrice,setMaxPrice] = useState('');
 const [selected,setSelected] = useState(null);
 const [editor,setEditor] = useState(null); // null or {id,form}
 const [error,setError] = useState('');
 const [activePhoto,setActivePhoto] = useState(0);
 const [notice,setNotice] = useState('');
 const [view,setView] = useState('browse');
 const [photoError,setPhotoError] = useState('');
 const [uploading,setUploading] = useState(false);
 const uploadVersion = useRef(0);
 const modalOpen = Boolean(selected || editor);
 useEffect(()=>{
  if (!modalOpen) return;
  const previous = document.activeElement;
  const oldOverflow = document.body.style.overflow;
  document.body.style.overflow = 'hidden';
  const dialog = document.querySelector('[role="dialog"]');
  dialog?.querySelector('button')?.focus();
  function keydown(e) {
   if(e.key==='Escape'){e.preventDefault();closeModal();}
   if(e.key==='Tab'){
    const controls = [...dialog.querySelectorAll('button, a[href], input, select, textarea')].filter(el=>!el.disabled && el.getClientRects().length);
    const first = controls[0], last = controls[controls.length-1];
    if(e.shiftKey && document.activeElement===first){e.preventDefault();last?.focus();}
    else if(!e.shiftKey && document.activeElement===last){e.preventDefault();first?.focus();}
   }
  }
  document.addEventListener('keydown',keydown);
  return ()=>{document.body.style.overflow=oldOverflow;document.removeEventListener('keydown',keydown);if(previous?.isConnected)previous.focus();};
 },[modalOpen,Boolean(editor)]);
 function closeModal(){uploadVersion.current++;setUploading(false);setEditor(null);setSelected(null);}
 function clearFilters(){setQuery('');setCategory('all');setSort('featured');setMinPrice('');setMaxPrice('');}
 function navigate(next){setView(next);clearFilters();closeModal();document.getElementById('discover')?.scrollIntoView({behavior:'smooth'});}
 async function uploadPhotos(event, replaceIndex=null){
  const files = [...event.target.files]; event.target.value='';
  if(!files.length)return;
  setPhotoError('');
  if(replaceIndex===null && editor.form.photos.length+files.length>MAX_PHOTOS){setPhotoError('You can add up to 6 photos. Remove a photo to add another.');return;}
  const version=++uploadVersion.current;setUploading(true);
  try{
   const photos=await Promise.all(files.map(preparePhoto));
   if(version!==uploadVersion.current)return;
   setEditor(s=>s?{...s,form:{...s.form,photos:replaceIndex===null?[...s.form.photos,...photos]:s.form.photos.map((src,i)=>i===replaceIndex?photos[0]:src)}}:s);
  }catch(err){if(version===uploadVersion.current)setPhotoError(err.message);}
  finally{if(version===uploadVersion.current)setUploading(false);}
 }
 function persist(next){try{localStorage.setItem(KEY,JSON.stringify(next));setItems(next);return true;}catch{setError('There is not enough browser storage to save. Remove some photos and try again.');return false;}}

 useEffect(()=>setActivePhoto(0),[selected]);
 const priceError = [minPrice,maxPrice].some(value=>value!==''&&(!Number.isFinite(Number(value))||Number(value)<0))
  ? 'Enter prices of zero or more.'
  : minPrice!==''&&maxPrice!==''&&Number(minPrice)>Number(maxPrice)
    ? 'Minimum price must be less than or equal to maximum price.' : '';
 const filtersActive = query!==''||category!=='all'||sort!=='featured'||minPrice!==''||maxPrice!=='';
 const listing = useMemo(()=>{if(priceError)return [];let a=items.filter(x=>(view==='browse'||x.owner==='you')&&(category==='all'||x.category===category)&&(minPrice===''||x.price>=Number(minPrice))&&(maxPrice===''||x.price<=Number(maxPrice))&&`${x.title} ${x.category} ${x.description}`.toLowerCase().includes(query.toLowerCase()));if(sort==='low')a.sort((a,b)=>a.price-b.price);if(sort==='high')a.sort((a,b)=>b.price-a.price);return a;},[items,category,query,sort,view,minPrice,maxPrice,priceError]);
 function startEdit(item){if(item&&item.owner!=='you')return;setError('');setPhotoError('');setEditor({id:item?.id||null,form:item?{title:item.title,price:String(item.price),category:item.category,condition:item.condition,description:item.description,pickup:item.pickup || '',status:item.status,photos:[...(item.photos||[])]}:{...emptyForm,photos:[]}});}
 function submit(event){event.preventDefault();if(uploading)return;const f=editor.form;const err=findError(f);if(err){setError('Unable to save item. Check the form.');return;}const original=editor.id?items.find(x=>x.id===editor.id):null;const next={...f, title:f.title.trim(),price:Number(f.price),description:f.description.trim(),pickup:f.pickup.trim(),photos:f.photos,emoji:original?.emoji || '📦',owner:'you',seller:currentUser.name,sellerEmail:currentUser.email};
 if(editor.id){if(!persist(items.map(x=>x.id===editor.id?{...x,...next}:x)))return;setNotice('Changes saved.');}else{if(!persist([{...next,id:`m-${Date.now()}`,status:'active'},...items]))return;clearFilters();setNotice('Item listed.');}setEditor(null);setSelected(null);}
 function reset(){if(!persist(seed))return;setView('browse');setSelected(null);setEditor(null);clearFilters();setNotice('Example items restored.');}
 return <div className="market-app">
  <div className="utility"><span>Campus Exchange</span><span>Trusted by students • All prices in EGP</span></div>
  <header className="navigation"><button className="brand" onClick={()=>navigate('browse')}><span className="brand-icon">✳</span> CAMPUS<span className="brand-alt">exchange</span></button><nav aria-label="Main navigation"><button aria-current={view==='browse'?'page':undefined} onClick={()=>navigate('browse')}>Browse items</button><button aria-current={view==='mine'?'page':undefined} onClick={()=>navigate('mine')}>My listings</button></nav><div className="nav-actions"><span className="usercircle">Y</span><button className="sell-cta" onClick={()=>startEdit(null)}>+ Sell an item</button></div></header>
  <main>
   <section className="promo"><div className="promo-copy"><span className="tag">THE CAMPUS MARKETPLACE</span><h1>Everything you need,<br/><i>right around campus.</i></h1><p>Browse little finds, big essentials and almost everything in between.</p><button onClick={()=>navigate('browse')}>Explore listings <span>↗</span></button></div><div className="promo-art"><span>📚</span><span>💡</span><span>🎧</span><span>🛋️</span></div></section>
   <section className="discovery" id="discover"><div className="discover-top"><div><p className="section-kicker">CURATED FOR YOUR CAMPUS</p><h2>{view==='mine'?'My listings':'Find something good.'}</h2><p>{view==='mine'?'Manage your items, photos and availability.':'Items listed by people around you.'}</p></div><div className="discover-right"><label className="search"><span>⌕</span><input aria-label="Search listings" placeholder="Search listings" value={query} onChange={e=>setQuery(e.target.value)}/></label><label className="sort"><span>Sort</span><select value={sort} onChange={e=>setSort(e.target.value)}><option value="featured">Featured</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option></select></label></div></div>
    <div className="category-row">{categories.map(c=><button key={c} onClick={()=>setCategory(c)} aria-pressed={category===c} className={category===c?'on':''}>{c==='all'?'All items':cap(c)}</button>)}</div>
    <div className="budget-toolbar">
     <fieldset className="budget-fields"><legend>Price range (EGP)</legend>
      <label htmlFor="min-price">Minimum<input id="min-price" type="number" min="0" step="0.01" inputMode="decimal" placeholder="No minimum" value={minPrice} aria-invalid={Boolean(priceError)} aria-describedby={priceError?'budget-error':undefined} onChange={e=>setMinPrice(e.target.value)}/></label>
      <span className="budget-separator" aria-hidden="true">–</span>
      <label htmlFor="max-price">Maximum<input id="max-price" type="number" min="0" step="0.01" inputMode="decimal" placeholder="No maximum" value={maxPrice} aria-invalid={Boolean(priceError)} aria-describedby={priceError?'budget-error':undefined} onChange={e=>setMaxPrice(e.target.value)}/></label>
     </fieldset>
     <div className="filter-summary"><p role="status" aria-live="polite" aria-atomic="true">{listing.length} matching {listing.length===1?'listing':'listings'}</p><button type="button" className="clear-filters" disabled={!filtersActive} onClick={clearFilters}>Clear filters</button></div>
    </div>
    {priceError&&<p id="budget-error" className="budget-error" role="alert">{priceError}</p>}
    {notice&&<p className="notice" role="status">{notice} <button onClick={()=>setNotice('')}>×</button></p>}
    <div className="listing-grid">{listing.map(item=><article className="product" key={item.id}><button className="photo" onClick={()=>setSelected(item.id)}><span className="stamp">{cap(item.condition)}</span><ListingImage src={item.photos?.[0]} alt={item.title} emoji={item.emoji} className="listing-img" /><span className="category-caption">{cap(item.category)}</span></button><div className="prod-details"><div className="prod-topline"><span className="muted">{item.category}</span>{item.status==='sold'&&<span className="soldstatus">SOLD</span>}</div><h3>{item.title}</h3><p>{item.description}</p><div className="costline"><strong>EGP {item.price.toLocaleString()}</strong><span>{item.condition}</span></div><button className="details-button" onClick={()=>view==='mine'?startEdit(item):setSelected(item.id)}>{view==='mine'?'Edit listing':'View item'} <span>↗</span></button></div></article>)}{listing.length===0&&<p className="noresults">{priceError?'Adjust the price range to see matching listings.':view==='mine'?'No matching listings of your own. Try another filter or sell an item.':'No listings match your filters. Try a different budget or clear the filters.'}</p>}</div>
   </section>
   <footer><strong>CAMPUS exchange</strong><span>From students, for students.</span><button onClick={reset}>Reset demo</button></footer>
  </main>
  {selected&&!editor&&(()=>{
   const item=items.find(x=>x.id===selected);if(!item)return null;
   const images=item.photos || [];
   const subject=encodeURIComponent(`Campus Exchange: ${item.title}`);
   const body=encodeURIComponent(`Hi ${item.seller},\n\nI'm interested in your listing "${item.title}" (EGP ${item.price}). Is it still available?\n\n`);
   return <div className="overlay" onMouseDown={e=>e.target===e.currentTarget&&closeModal()}>
    <section className="detail-panel" role="dialog" aria-modal="true" aria-label="Item details">
     <div className="dialog-bar"><strong>Item details</strong><button className="close" aria-label="Close item details" onClick={closeModal}>×</button></div>
     <div className="detail-visual">
      <ListingImage src={images[activePhoto] || images[0]} alt={`${item.title} photo ${activePhoto+1}`} emoji={item.emoji} className="detail-img" />
     </div>
     {images.length>1&&<div className="detail-thumbs" aria-label="Item photos">{images.map((src,index)=><button type="button" key={index} className={activePhoto===index?'thumb active':'thumb'} aria-label={`Show photo ${index+1} of ${images.length}`} aria-pressed={activePhoto===index} onClick={()=>setActivePhoto(index)}><ListingImage src={src} alt="" emoji={item.emoji} className="thumb-img" /></button>)}</div>}
     <p className="section-kicker">{cap(item.category)} · {cap(item.condition)}</p>
     <h2>{item.title}</h2>
     <h3>EGP {item.price.toLocaleString()}</h3>
     <p className="item-description">{item.description||'No description supplied.'}</p>
     <div className="detail-meta"><p><strong>Pickup</strong><br/>{item.pickup || 'Arrange directly with seller'}</p><p><strong>Seller</strong><br/>{item.seller}</p></div>
     <p className="muted">Status: {item.status}</p>
     {item.owner==='you'
       ? <button className="sell-cta" onClick={()=>startEdit(item)}>Edit your listing</button>
       : item.status==='sold'
         ? <p className="fineprint">This item is marked as sold.</p>
         : <a className="sell-cta contact-seller" href={`mailto:${item.sellerEmail}?subject=${subject}&body=${body}`}>✉ Contact seller</a>}
    </section>
   </div>;
  })()}
  {editor&&<div className="overlay" onMouseDown={e=>e.target===e.currentTarget&&closeModal()}><section className="sell-modal" role="dialog" aria-modal="true" aria-label={editor.id?'Edit item':'Sell item'}><div className="dialog-bar"><strong>{editor.id?'Edit your listing':'Sell an item'}</strong><button className="close" aria-label="Close listing form" onClick={closeModal}>×</button></div><div className="modal-head"><div><p className="section-kicker">CAMPUS EXCHANGE</p><h2>{editor.id?'Edit your listing':'Sell an item'}</h2><p>Add the details and we'll take care of the rest.</p></div></div><form onSubmit={submit}>
    <fieldset className="photo-editor" disabled={uploading}>
     <legend>Item photos</legend>
     <p id="photo-help">Add up to 6 photos. JPG, PNG or WebP, up to 10 MB each. The cover appears in listings.</p>
     <label className="upload-button">+ Add photos<input type="file" accept="image/jpeg,image/png,image/webp" multiple aria-label="Add photos" aria-describedby="photo-help" onChange={e=>uploadPhotos(e)}/></label>
     {editor.form.photos.length===0&&<p className="photo-empty">No photos yet. You can publish without photos and add them later.</p>}
     <div className="photo-previews">{editor.form.photos.map((src,index)=><div className="photo-preview" key={index}>
      <img src={src} alt={`Listing photo ${index+1}`}/>
      {index===0?<span className="cover-badge">Cover photo</span>:<button type="button" onClick={()=>setEditor(s=>({...s,form:{...s.form,photos:[src,...s.form.photos.filter((_,i)=>i!==index)]}}))}>Make cover<span className="sr-only"> photo {index+1}</span></button>}
      <div className="photo-actions"><label className="upload-button">Replace<input type="file" accept="image/jpeg,image/png,image/webp" aria-label={`Replace photo ${index+1}`} onChange={e=>uploadPhotos(e,index)}/></label><button type="button" aria-label={`Remove photo ${index+1}`} onClick={()=>setEditor(s=>({...s,form:{...s.form,photos:s.form.photos.filter((_,i)=>i!==index)}}))}>Remove</button></div>
     </div>)}</div>
    </fieldset>
    {uploading&&<p role="status">Preparing photos…</p>}{photoError&&<p className="alert" role="alert">{photoError}</p>}
    <div className="field-grid"><label><span>Item title *</span><input value={editor.form.title} onChange={e=>setEditor(s=>({...s,form:{...s.form,title:e.target.value}}))} placeholder="What are you selling?"/></label><label><span>Price (EGP) *</span><input type="number" min="0" step="0.01" value={editor.form.price} onChange={e=>setEditor(s=>({...s,form:{...s.form,price:e.target.value}}))} placeholder="Price"/></label><label><span>Category *</span><select value={editor.form.category} onChange={e=>setEditor(s=>({...s,form:{...s.form,category:e.target.value}}))}><option value="">Select</option>{categories.slice(1).map(c=><option value={c} key={c}>{cap(c)}</option>)}</select></label><label><span>Condition *</span><select value={editor.form.condition} onChange={e=>setEditor(s=>({...s,form:{...s.form,condition:e.target.value}}))}><option value="">Select</option>{conditions.map(c=><option value={c} key={c}>{cap(c)}</option>)}</select></label><label className="wide"><span>Description</span><textarea value={editor.form.description} onChange={e=>setEditor(s=>({...s,form:{...s.form,description:e.target.value}}))} placeholder="Description" rows="5"/></label><label className="wide"><span>Pickup / meetup location</span><input value={editor.form.pickup} onChange={e=>setEditor(s=>({...s,form:{...s.form,pickup:e.target.value}}))} placeholder="e.g. Library entrance or arrange on campus" /></label><label className="wide"><span>Seller contact email</span><input value={currentUser.email} readOnly aria-readonly="true" className="readonly-input"/><small className="email-helper">Taken from your registered account, so buyers can contact you about this item.</small></label>{editor.id&&<label><span>Status</span><select value={editor.form.status} onChange={e=>setEditor(s=>({...s,form:{...s.form,status:e.target.value}}))}><option value="active">Active</option><option value="sold">Sold</option></select></label>}</div>{error&&<p className="alert" role="alert">{error}</p>}<div className="modal-foot"><button type="button" onClick={closeModal}>Cancel</button><button className="sell-cta" type="submit" disabled={uploading}>{editor.id?'Save changes':'Publish item'}</button></div></form></section></div>}
 </div>;
}
