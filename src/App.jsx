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
const emptyForm = {title:'', price:'', category:'', condition:'', description:'', pickup:'', status:'active', photos:[]};
const MAX_PHOTOS = 4;
function saved(){try {const value=JSON.parse(localStorage.getItem(KEY));return Array.isArray(value)?value:seed;}catch{return seed;}}
const cap = s => s==='like-new'?'Like new':(s||'').replace(/\b\w/g,m=>m.toUpperCase());

// Same rules as before, but reported per field so the form can point at the problem.
function findErrors(form){
 const e={};
 if(!form.title.trim())e.title='Enter an item title.';
 if(form.price.trim()==='' || !Number.isFinite(Number(form.price)) || Number(form.price)<0)e.price='Enter a price of zero or more.';
 if(!categories.slice(1).includes(form.category))e.category='Choose a category.';
 if(!conditions.includes(form.condition))e.condition='Choose the item condition.';
 if(!['active','sold'].includes(form.status))e.status='Choose a valid status.';
 return e;
}

// Downscale uploaded photos so several of them still fit in localStorage.
function fileToDataUrl(file){
 return new Promise((resolve,reject)=>{
  const url=URL.createObjectURL(file);
  const img=new Image();
  img.onload=()=>{
   const scale=Math.min(1,900/Math.max(img.width,img.height));
   const canvas=document.createElement('canvas');
   canvas.width=Math.round(img.width*scale);canvas.height=Math.round(img.height*scale);
   canvas.getContext('2d').drawImage(img,0,0,canvas.width,canvas.height);
   URL.revokeObjectURL(url);
   resolve(canvas.toDataURL('image/jpeg',0.8));
  };
  img.onerror=()=>{URL.revokeObjectURL(url);reject(new Error('bad image'));};
  img.src=url;
 });
}

// Modal behaviour: move focus in, trap Tab, close on Escape, give focus back on close.
function useDialog(onClose){
 const ref=useRef(null);
 const closeRef=useRef(onClose);
 closeRef.current=onClose;
 useEffect(()=>{
  const node=ref.current;const previous=document.activeElement;
  const focusables=()=>[...node.querySelectorAll('a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled])')];
  (node.querySelector('[data-autofocus]')||focusables()[0]||node).focus();
  function onKey(e){
   if(e.key==='Escape'){e.stopPropagation();closeRef.current();return;}
   if(e.key!=='Tab')return;
   const list=focusables();if(!list.length){e.preventDefault();return;}
   const first=list[0],last=list[list.length-1];
   if(e.shiftKey&&(document.activeElement===first||!node.contains(document.activeElement))){e.preventDefault();last.focus();}
   else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
  }
  document.addEventListener('keydown',onKey);
  return()=>{document.removeEventListener('keydown',onKey);if(previous&&document.contains(previous))previous.focus();};
 },[]);
 return ref;
}

function ListingImage({src, alt, emoji, className=''}) {
 const [broken, setBroken] = useState(false);
 useEffect(() => setBroken(false), [src]);
 return src && !broken
   ? <img className={className} src={src} alt={alt} loading="lazy" onError={() => setBroken(true)} />
   : <span className="item-emoji" role="img" aria-label="Photo unavailable">{emoji || '📦'}</span>;
}

function DetailDialog({item, onClose, onEdit}){
 const ref=useDialog(onClose);
 const [activePhoto,setActivePhoto]=useState(0);
 const images=item.photos || [];
 const subject=encodeURIComponent(`Campus Exchange: ${item.title}`);
 const body=encodeURIComponent(`Hi ${item.seller},\n\nI'm interested in your listing "${item.title}" (EGP ${item.price}). Is it still available?\n\n`);
 return <div className="overlay" onMouseDown={e=>e.target===e.currentTarget&&onClose()}>
  <section ref={ref} tabIndex={-1} className="detail-panel" role="dialog" aria-modal="true" aria-label="Item details">
   <button className="close" aria-label="Close item details" onClick={onClose}>×</button>
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
     ? <button className="sell-cta" onClick={()=>onEdit(item)}>Edit your listing</button>
     : item.status==='sold'
       ? <p className="fineprint">This item is marked as sold.</p>
       : <a className="sell-cta contact-seller" href={`mailto:${item.sellerEmail}?subject=${subject}&body=${body}`}>✉ Contact seller</a>}
  </section>
 </div>;
}

function FieldError({id, message}){return message?<small className="field-error" id={id}>{message}</small>:null;}

function SellDialog({editor, setEditor, onClose, onSubmit}){
 const ref=useDialog(onClose);
 const fileRef=useRef(null);
 const [errors,setErrors]=useState({});
 const [photoMsg,setPhotoMsg]=useState('');
 const f=editor.form;
 const set=(key,value)=>{
  setEditor(s=>({...s,form:{...s.form,[key]:value}}));
  setErrors(prev=>{if(!prev[key])return prev;const {[key]:_removed,...rest}=prev;return rest;});
 };
 function handleSubmit(event){
  event.preventDefault();
  const found=findErrors(f);
  setErrors(found);
  const first=['title','price','category','condition','status'].find(k=>found[k]);
  if(first){document.getElementById(`field-${first}`)?.focus();return;}
  onSubmit();
 }
 async function addPhotos(event){
  const files=[...event.target.files];event.target.value='';
  if(!files.length)return;
  const room=MAX_PHOTOS-f.photos.length;
  const picked=files.filter(x=>x.type.startsWith('image/')).slice(0,Math.max(room,0));
  setPhotoMsg(files.length>picked.length?`Only images are accepted, up to ${MAX_PHOTOS} photos per listing.`:'');
  try{
   const urls=await Promise.all(picked.map(fileToDataUrl));
   setEditor(s=>({...s,form:{...s.form,photos:[...s.form.photos,...urls].slice(0,MAX_PHOTOS)}}));
  }catch{setPhotoMsg('One of the files could not be read as an image.');}
 }
 const removePhoto=i=>setEditor(s=>({...s,form:{...s.form,photos:s.form.photos.filter((_,idx)=>idx!==i)}}));
 const errorCount=Object.keys(errors).length;
 const field=(key)=>({id:`field-${key}`,'aria-invalid':errors[key]?'true':undefined,'aria-describedby':errors[key]?`err-${key}`:undefined,'aria-required':key==='status'?undefined:'true',className:errors[key]?'invalid':undefined});
 return <div className="overlay" onMouseDown={e=>e.target===e.currentTarget&&onClose()}>
  <section ref={ref} tabIndex={-1} className="sell-modal" role="dialog" aria-modal="true" aria-label={editor.id?'Edit item':'Sell item'}>
   <div className="modal-head"><div><p className="section-kicker">CAMPUS EXCHANGE</p><h2>{editor.id?'Edit your listing':'Sell an item'}</h2><p>Add the details and we'll take care of the rest. Fields marked * are required.</p></div><button type="button" className="close" aria-label="Close form" onClick={onClose}>×</button></div>
   <form onSubmit={handleSubmit} noValidate>
    <div className="field-grid">
     <label><span>Item title *</span><input data-autofocus {...field('title')} value={f.title} onChange={e=>set('title',e.target.value)} placeholder="What are you selling?"/><FieldError id="err-title" message={errors.title}/></label>
     <label><span>Price (EGP) *</span><input {...field('price')} type="number" inputMode="decimal" min="0" step="0.01" value={f.price} onChange={e=>set('price',e.target.value)} placeholder="Price"/><FieldError id="err-price" message={errors.price}/></label>
     <label><span>Category *</span><select {...field('category')} value={f.category} onChange={e=>set('category',e.target.value)}><option value="">Select</option>{categories.slice(1).map(c=><option value={c} key={c}>{cap(c)}</option>)}</select><FieldError id="err-category" message={errors.category}/></label>
     <label><span>Condition *</span><select {...field('condition')} value={f.condition} onChange={e=>set('condition',e.target.value)}><option value="">Select</option>{conditions.map(c=><option value={c} key={c}>{cap(c)}</option>)}</select><FieldError id="err-condition" message={errors.condition}/></label>
     <label className="wide"><span>Description</span><textarea value={f.description} onChange={e=>set('description',e.target.value)} placeholder="Description" rows="4"/></label>
     <label className="wide"><span>Pickup / meetup location</span><input value={f.pickup} onChange={e=>set('pickup',e.target.value)} placeholder="e.g. Library entrance or arrange on campus" /></label>
     <div className="wide photo-field">
      <span className="photo-label" id="photo-label">Photos (optional, up to {MAX_PHOTOS})</span>
      <input ref={fileRef} type="file" accept="image/*" multiple hidden aria-labelledby="photo-label" onChange={addPhotos}/>
      <div className="photo-previews">
       {f.photos.map((src,i)=><div className="photo-preview" key={i}><img src={src} alt={`Preview of photo ${i+1}`}/>{i===0&&<em>Cover</em>}<button type="button" aria-label={`Remove photo ${i+1}`} onClick={()=>removePhoto(i)}>×</button></div>)}
       {f.photos.length<MAX_PHOTOS&&<button type="button" className="photo-add" onClick={()=>fileRef.current?.click()}><span aria-hidden="true">＋</span>Add photo</button>}
      </div>
      <small className="email-helper" role="status">{photoMsg||'A clear first photo helps buyers choose your listing. The first photo is the cover.'}</small>
     </div>
     <label className="wide"><span>Seller contact email</span><input value={currentUser.email} readOnly aria-readonly="true" className="readonly-input"/><small className="email-helper">Taken from your registered account, so buyers can contact you about this item.</small></label>
     {editor.id&&<label><span>Status</span><select {...field('status')} value={f.status} onChange={e=>set('status',e.target.value)}><option value="active">Active</option><option value="sold">Sold</option></select><FieldError id="err-status" message={errors.status}/></label>}
    </div>
    {errorCount>0&&<p className="alert" role="alert">Please fix {errorCount} {errorCount===1?'field':'fields'} before saving: {Object.values(errors).join(' ')}</p>}
    <div className="modal-foot"><button type="button" onClick={onClose}>Cancel</button><button className="sell-cta" type="submit">{editor.id?'Save changes':'Publish item'}</button></div>
   </form>
  </section>
 </div>;
}

export default function App(){
 const [items,setItems] = useState(saved);
 const [query,setQuery] = useState('');
 const [category,setCategory] = useState('all');
 const [sort,setSort] = useState('featured');
 const [maxPrice,setMaxPrice] = useState('');
 const [condition,setCondition] = useState('all');
 const [hideSold,setHideSold] = useState(false);
 const [selected,setSelected] = useState(null);
 const [editor,setEditor] = useState(null); // null or {id,form}
 const [notice,setNotice] = useState('');
 useEffect(()=>{try{localStorage.setItem(KEY,JSON.stringify(items));}catch{setNotice('Your changes could not be stored in this browser (storage is full). They will be lost on reload.');}},[items]);
 const limit = maxPrice.trim()==='' ? null : Number(maxPrice);
 const filtersActive = query!==''||category!=='all'||condition!=='all'||limit!==null||hideSold;
 const listing = useMemo(()=>{let a=items.filter(x=>(category==='all'||x.category===category)&&(condition==='all'||x.condition===condition)&&(limit===null||!Number.isFinite(limit)||x.price<=limit)&&(!hideSold||x.status!=='sold')&&`${x.title} ${x.category} ${x.description}`.toLowerCase().includes(query.toLowerCase()));if(sort==='low')a.sort((a,b)=>a.price-b.price);if(sort==='high')a.sort((a,b)=>b.price-a.price);return a;},[items,category,condition,limit,hideSold,query,sort]);
 function clearFilters(){setQuery('');setCategory('all');setCondition('all');setMaxPrice('');setHideSold(false);}
 function startEdit(item){if(item&&item.owner!=='you')return;setEditor({id:item?.id||null,form:item?{title:item.title,price:String(item.price),category:item.category,condition:item.condition,description:item.description,pickup:item.pickup || '',status:item.status,photos:[...(item.photos||[])]}:{...emptyForm,photos:[]}});}
 function submit(){const f=editor.form;const original=editor.id?items.find(x=>x.id===editor.id):null;const next={title:f.title.trim(),price:Number(f.price),category:f.category,condition:f.condition,status:f.status,description:f.description.trim(),pickup:f.pickup.trim(),photos:f.photos,emoji:original?.emoji || '📦',owner:'you',seller:currentUser.name,sellerEmail:currentUser.email};
 if(editor.id){setItems(items.map(x=>x.id===editor.id?{...x,...next}:x));setNotice('Changes saved.');}else{setItems([{...next,id:`m-${Date.now()}`,status:'active'},...items]);setNotice('Item listed.');}setEditor(null);setSelected(null);}
 function reset(){setItems(seed);setSelected(null);setEditor(null);clearFilters();setSort('featured');setNotice('Example items restored.');}
 const selectedItem = selected ? items.find(x=>x.id===selected) : null;
 return <div className="market-app">
  <div className="utility"><span>Campus Exchange</span><span>Trusted by students • All prices in EGP</span></div>
  <header className="navigation"><button className="brand" onClick={()=>{setSelected(null);setCategory('all')}}><span className="brand-icon">✳</span> CAMPUS<span className="brand-alt">exchange</span></button><nav><a href="#discover">Browse items</a><button onClick={()=>setCategory('textbooks')}>Textbooks</button><button onClick={()=>setCategory('electronics')}>Electronics</button></nav><div className="nav-actions"><span className="usercircle">Y</span><button className="sell-cta" onClick={()=>startEdit(null)}>+ Sell an item</button></div></header>
  <main>
   <section className="promo"><div className="promo-copy"><span className="tag">THE CAMPUS MARKETPLACE</span><h1>Everything you need,<br/><i>right around campus.</i></h1><p>Browse little finds, big essentials and almost everything in between.</p><button onClick={()=>document.getElementById('discover')?.scrollIntoView({behavior:'smooth'})}>Explore listings <span>↗</span></button></div><div className="promo-art"><span>📚</span><span>💡</span><span>🎧</span><span>🛋️</span></div></section>
   <section className="discovery" id="discover"><div className="discover-top"><div><p className="section-kicker">CURATED FOR YOUR CAMPUS</p><h2>Find something good.</h2><p>Items listed by people around you.</p></div><div className="discover-right"><label className="search"><span aria-hidden="true">⌕</span><input aria-label="Search listings" placeholder="Search listings" value={query} onChange={e=>setQuery(e.target.value)}/></label><label className="sort"><span>Sort</span><select value={sort} onChange={e=>setSort(e.target.value)}><option value="featured">Featured</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option></select></label></div></div>
    <div className="category-row">{categories.map(c=><button key={c} onClick={()=>setCategory(c)} aria-pressed={category===c} className={category===c?'on':''}>{c==='all'?'All items':cap(c)}</button>)}</div>
    <div className="filter-bar">
     <label className="filter"><span>Max price (EGP)</span><input type="number" min="0" inputMode="numeric" placeholder="Any" value={maxPrice} onChange={e=>setMaxPrice(e.target.value)}/></label>
     <label className="filter"><span>Condition</span><select value={condition} onChange={e=>setCondition(e.target.value)}><option value="all">Any condition</option>{conditions.map(c=><option key={c} value={c}>{cap(c)}</option>)}</select></label>
     <label className="filter check"><input type="checkbox" checked={hideSold} onChange={e=>setHideSold(e.target.checked)}/><span>Hide sold items</span></label>
     {filtersActive&&<button type="button" className="clear-filters" onClick={clearFilters}>Clear filters</button>}
     <p className="result-count" role="status" aria-live="polite">{listing.length} {listing.length===1?'listing':'listings'}{filtersActive?' match your filters':''}</p>
    </div>
    {notice&&<p className="notice" role="status">{notice} <button aria-label="Dismiss message" onClick={()=>setNotice('')}>×</button></p>}
    <div className="listing-grid">{listing.map(item=><article className={item.status==='sold'?'product is-sold':'product'} key={item.id}><button className="photo" aria-label={`View ${item.title}`} onClick={()=>setSelected(item.id)}><span className="stamp">{cap(item.condition)}</span>{item.status==='sold'&&<span className="sold-ribbon">SOLD</span>}<ListingImage src={item.photos?.[0]} alt="" emoji={item.emoji} className="listing-img" /><span className="category-caption">{cap(item.category)}</span></button><div className="prod-details"><div className="price-line"><strong className="price">EGP {item.price.toLocaleString()}</strong><span className={item.status==='sold'?'soldstatus':'instock'}>{item.status.toUpperCase()}</span></div><h3>{item.title}</h3><p>{item.description}</p>{item.pickup&&<p className="pickup-line">📍 {item.pickup}</p>}<button className="details-button" onClick={()=>setSelected(item.id)}>View item <span aria-hidden="true">↗</span></button></div></article>)}{listing.length===0&&<div className="noresults"><p>No listings match your search and filters.</p>{filtersActive&&<button type="button" className="clear-filters" onClick={clearFilters}>Clear all filters</button>}</div>}</div>
   </section>
   <footer><strong>CAMPUS exchange</strong><span>From students, for students.</span><button onClick={reset}>Reset demo</button></footer>
  </main>
  {selectedItem&&<DetailDialog key={selectedItem.id} item={selectedItem} onClose={()=>setSelected(null)} onEdit={startEdit}/>}
  {editor&&<SellDialog editor={editor} setEditor={setEditor} onClose={()=>setEditor(null)} onSubmit={submit}/>}
 </div>;
}
