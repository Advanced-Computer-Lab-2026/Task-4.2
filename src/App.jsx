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
const TITLE_MAX = 80;
const DESCRIPTION_MAX = 1000;
const PICKUP_MAX = 120;
const fieldOrder = ['title', 'price', 'category', 'condition', 'description', 'pickup', 'status'];
function saved(){try {const value=JSON.parse(localStorage.getItem(KEY));return Array.isArray(value)?value:seed;}catch{return seed;}}
const cap = s => s==='like-new'?'Like new':(s||'').replace(/\b\w/g,m=>m.toUpperCase());

// Returns an object of {field: message}. An empty object means the form is valid.
function validate(form){
 const errors = {};
 const title = form.title.trim();
 if(!title) errors.title = 'Enter a title for your item.';
 else if(title.length < 3) errors.title = 'Title must be at least 3 characters.';
 else if(title.length > TITLE_MAX) errors.title = `Title must be ${TITLE_MAX} characters or fewer.`;

 const price = String(form.price).trim();
 if(price === '') errors.price = 'Enter a price. Use 0 if you are giving it away.';
 else if(!Number.isFinite(Number(price))) errors.price = 'Enter a number, e.g. 250 or 99.50.';
 else if(Number(price) < 0) errors.price = 'Price cannot be negative.';
 else if(!/^\d+(\.\d{1,2})?$/.test(price)) errors.price = 'Use at most 2 decimal places, e.g. 99.50.';

 if(!categories.slice(1).includes(form.category)) errors.category = 'Choose a category.';
 if(!conditions.includes(form.condition)) errors.condition = 'Choose the item condition.';
 if(form.description.trim().length > DESCRIPTION_MAX) errors.description = `Description must be ${DESCRIPTION_MAX} characters or fewer.`;
 if(form.pickup.trim().length > PICKUP_MAX) errors.pickup = `Pickup location must be ${PICKUP_MAX} characters or fewer.`;
 if(!['active','sold'].includes(form.status)) errors.status = 'Choose a valid status.';
 return errors;
}

function ListingImage({src, alt, emoji, className=''}) {
 const [broken, setBroken] = useState(false);
 useEffect(() => setBroken(false), [src]);
 return src && !broken
   ? <img className={className} src={src} alt={alt} loading="lazy" onError={() => setBroken(true)} />
   : <span className="item-emoji" role="img" aria-label="Photo unavailable">{emoji || '📦'}</span>;
}

function StatusBadge({status}){
 return <span className={`status-badge ${status==='sold'?'sold':'active'}`}><span className="dot" aria-hidden="true"></span>{status==='sold'?'Sold':'Available'}</span>;
}

// Label + control + inline error message. `children` receives the props the control needs.
function Field({name, label, required, error, wide, hint, children}){
 const id = `f-${name}`;
 const describedBy = [error && `${id}-error`, hint && `${id}-hint`].filter(Boolean).join(' ') || undefined;
 return <div className={`field${wide?' wide':''}${error?' has-error':''}`}>
  <label htmlFor={id}>{label}{required&&<span className="req" aria-hidden="true"> *</span>}</label>
  {children({id, name, 'aria-invalid': error ? true : undefined, 'aria-describedby': describedBy, 'aria-required': required || undefined})}
  {hint&&<small id={`${id}-hint`} className="field-hint">{hint}</small>}
  {error&&<small id={`${id}-error`} className="field-error">{error}</small>}
 </div>;
}

export default function App(){
 const [items,setItems] = useState(saved);
 const [tab,setTab] = useState('browse'); // 'browse' = other people's items, 'mine' = your listings
 const [query,setQuery] = useState('');
 const [category,setCategory] = useState('all');
 const [sort,setSort] = useState('featured');
 const [condition,setCondition] = useState('all');
 const [selected,setSelected] = useState(null);
 const [editor,setEditor] = useState(null); // null or {id, form, touched, submitted}
 const [activePhoto,setActivePhoto] = useState(0);
 const [notice,setNotice] = useState(null); // {text, id} toast shown at the top
 const notify = text => setNotice({text, id: Date.now()});
 useEffect(()=>{if(!notice)return;const t=setTimeout(()=>setNotice(null),3500);return ()=>clearTimeout(t);},[notice]);
 useEffect(()=>localStorage.setItem(KEY,JSON.stringify(items)),[items]);
 useEffect(()=>setActivePhoto(0),[selected]);

 const mineCount = items.filter(x=>x.owner==='you').length;
 const browseCount = items.length - mineCount;
 const listing = useMemo(()=>{
  const q = query.toLowerCase();
  let a = items.filter(x=>(tab==='mine' ? x.owner==='you' : x.owner!=='you')
   && (category==='all' || x.category===category)
   && (condition==='all' || x.condition===condition)
   && `${x.title} ${x.category} ${x.description}`.toLowerCase().includes(q));
  if(sort==='low') a.sort((a,b)=>a.price-b.price);
  if(sort==='high') a.sort((a,b)=>b.price-a.price);
  return a;
 },[items,tab,category,condition,query,sort]);

 function startEdit(item){
  if(item&&item.owner!=='you')return;
  setEditor({
   id:item?.id||null,
   form:item?{title:item.title,price:String(item.price),category:item.category,condition:item.condition,description:item.description||'',pickup:item.pickup||'',status:item.status}:{...emptyForm},
   touched:{}, submitted:false,
  });
 }
 const setField = (key,value) => setEditor(s=>({...s,form:{...s.form,[key]:value}}));
 const touch = key => setEditor(s=>s&&({...s,touched:{...s.touched,[key]:true}}));

 function submit(event){
  event.preventDefault();
  const f=editor.form;
  const errors=validate(f);
  const firstInvalid=fieldOrder.find(k=>errors[k]);
  if(firstInvalid){
   setEditor(s=>({...s,submitted:true}));
   document.getElementById(`f-${firstInvalid}`)?.focus();
   return;
  }
  const original=editor.id?items.find(x=>x.id===editor.id):null;
  const next={...f,title:f.title.trim(),price:Number(f.price),description:f.description.trim(),pickup:f.pickup.trim(),photos:original?.photos||[],emoji:original?.emoji||'📦',owner:'you',seller:currentUser.name,sellerEmail:currentUser.email};
  if(editor.id){setItems(items.map(x=>x.id===editor.id?{...x,...next}:x));notify('Changes saved.');}
  else{setItems([{...next,id:`m-${Date.now()}`,status:'active'},...items]);notify('Item listed.');}
  setTab('mine');setEditor(null);setSelected(null);
 }
 function reset(){setItems(seed);setSelected(null);setEditor(null);setTab('browse');setQuery('');setCategory('all');setCondition('all');setSort('featured');notify('Example items restored.');}

 function setStatus(id,status){
  const item=items.find(x=>x.id===id);
  if(!item||item.owner!=='you')return;
  setItems(items.map(x=>x.id===id?{...x,status}:x));
  notify(status==='sold'?`"${item.title}" marked as sold.`:`"${item.title}" is available again.`);
 }
 const statusButton = item => item.status==='sold'
  ? <button className="status-button relist" onClick={()=>setStatus(item.id,'active')}>↺ Relist</button>
  : <button className="status-button" onClick={()=>setStatus(item.id,'sold')}>✓ Mark as sold</button>;
 const sellButton =<button className="sell-cta" onClick={()=>startEdit(null)}>+ Sell an item</button>;
 const formErrors = editor ? validate(editor.form) : {};
 const shownError = key => (editor?.submitted || editor?.touched[key]) ? formErrors[key] : undefined;

 return <div className="market-app">
  <header className="navigation"><button className="brand" onClick={()=>{setSelected(null);setTab('browse');setCategory('all')}}><span className="brand-icon">✳</span> CAMPUS<span className="brand-alt">exchange</span></button><div className="nav-actions"><button className={`nav-mine${tab==='mine'?' on':''}`} aria-current={tab==='mine'?'page':undefined} onClick={()=>{setSelected(null);setTab('mine');document.getElementById('discover')?.scrollIntoView({behavior:'smooth'});}}>My listings</button><span className="usercircle" title={currentUser.email}>Y</span></div></header>
  <div className="toast-region" aria-live="polite" role="status">{notice&&<div className="toast" key={notice.id}><span className="toast-icon" aria-hidden="true">✓</span><span>{notice.text}</span><button aria-label="Dismiss notification" onClick={()=>setNotice(null)}>×</button></div>}</div>
  <main>
   <section className="promo"><div className="promo-copy"><span className="tag">THE CAMPUS MARKETPLACE</span><h1>Everything you need,<br/><i>right around campus.</i></h1><p>Browse little finds, big essentials and almost everything in between.</p></div><div className="promo-art" aria-hidden="true"><span>📚</span><span>💡</span><span>🎧</span><span>🛋️</span></div></section>
   <section className="discovery" id="discover">
    <div className="tabs" role="tablist" aria-label="Listings">
     <button role="tab" id="tab-browse" aria-selected={tab==='browse'} aria-controls="listing-panel" className={tab==='browse'?'on':''} onClick={()=>setTab('browse')}>All items <span className="tab-count">{browseCount}</span></button>
     <button role="tab" id="tab-mine" aria-selected={tab==='mine'} aria-controls="listing-panel" className={tab==='mine'?'on':''} onClick={()=>setTab('mine')}>My listings <span className="tab-count">{mineCount}</span></button>
    </div>
    <div id="listing-panel" role="tabpanel" aria-labelledby={tab==='mine'?'tab-mine':'tab-browse'}>
    <div className="discover-top">
     {tab==='mine'
      ? <div><p className="section-kicker">YOUR SHOP</p><h2>My listings</h2><p>Items you are selling. Open one to edit it or mark it sold.</p></div>
      : <div><p className="section-kicker">CURATED FOR YOUR CAMPUS</p><h2>Find something good.</h2><p>Items listed by people around you.</p></div>}
     <div className="discover-right">
      <label className="search"><span aria-hidden="true">⌕</span><input aria-label="Search listings" placeholder={tab==='mine'?'Search your listings':'Search listings'} value={query} onChange={e=>setQuery(e.target.value)}/></label>
      <label className="sort"><span>Condition</span><select value={condition} onChange={e=>setCondition(e.target.value)}><option value="all">Any condition</option>{conditions.map(c=><option value={c} key={c}>{cap(c)}</option>)}</select></label>
      <label className="sort"><span>Price</span><select value={sort} onChange={e=>setSort(e.target.value)} aria-label="Sort by price"><option value="featured">Any order</option><option value="low">Low to high</option><option value="high">High to low</option></select></label>
      {tab==='mine'&&sellButton}
     </div>
    </div>
    <div className="category-row">{categories.map(c=><button key={c} onClick={()=>setCategory(c)} className={category===c?'on':''} aria-pressed={category===c}>{c==='all'?'All categories':cap(c)}</button>)}</div>
    <div className="listing-grid">{listing.map(item=><article className={`product${item.status==='sold'?' is-sold':''}`} key={item.id}><button className="photo" onClick={()=>setSelected(item.id)} aria-label={`View ${item.title}`}><span className="stamp">{cap(item.condition)}</span><ListingImage src={item.photos?.[0]} alt="" emoji={item.emoji} className="listing-img" /><span className="photo-status"><StatusBadge status={item.status}/></span>{item.status==='sold'&&<span className="sold-overlay" aria-hidden="true">Sold</span>}</button><div className="prod-details"><h3>{item.title}</h3><div className="costline"><strong>EGP {item.price.toLocaleString()}</strong></div>{tab==='mine'
      ? <div className="owner-actions"><button className="details-button" onClick={()=>setSelected(item.id)}>View / edit</button>{statusButton(item)}</div>
      : <button className="details-button" onClick={()=>setSelected(item.id)}>View item <span>↗</span></button>}</div></article>)}
     {listing.length===0&&(tab==='mine'&&mineCount===0
      ? <div className="noresults"><p>You haven't listed anything yet.</p>{sellButton}</div>
      : <div className="noresults"><p>No listings match your search.</p>{(query||category!=='all'||condition!=='all')&&<button className="details-button clear-filters" onClick={()=>{setQuery('');setCategory('all');setCondition('all');}}>Clear filters</button>}</div>)}
    </div>
    </div>
   </section>
   <footer><strong>CAMPUS exchange</strong><span>From students, for students.</span><button onClick={reset}>Reset demo</button></footer>
  </main>
  <div className="utility"><span>Campus Exchange</span><span>Trusted by students • All prices in EGP</span></div>
  {selected&&(()=>{
   const item=items.find(x=>x.id===selected);if(!item)return null;
   const images=item.photos || [];
   const subject=encodeURIComponent(`Campus Exchange: ${item.title}`);
   const body=encodeURIComponent(`Hi ${item.seller},\n\nI'm interested in your listing "${item.title}" (EGP ${item.price}). Is it still available?\n\n`);
   return <div className="overlay" onMouseDown={e=>e.target===e.currentTarget&&setSelected(null)}>
    <section className="detail-panel" role="dialog" aria-modal="true" aria-label="Item details">
     <button className="close" aria-label="Close item details" onClick={()=>setSelected(null)}>×</button>
     <div className="detail-visual">
      <ListingImage src={images[activePhoto] || images[0]} alt={`${item.title} photo ${activePhoto+1}`} emoji={item.emoji} className="detail-img" />
     </div>
     {images.length>1&&<div className="detail-thumbs" aria-label="Item photos">{images.map((src,index)=><button type="button" key={index} className={activePhoto===index?'thumb active':'thumb'} aria-label={`Show photo ${index+1} of ${images.length}`} aria-pressed={activePhoto===index} onClick={()=>setActivePhoto(index)}><ListingImage src={src} alt="" emoji={item.emoji} className="thumb-img" /></button>)}</div>}
     <p className="section-kicker">{cap(item.category)} · {cap(item.condition)}</p>
     <h2>{item.title}</h2>
     <div className="price-row"><h3>EGP {item.price.toLocaleString()}</h3><StatusBadge status={item.status}/></div>
     <p className="item-description">{item.description||'No description supplied.'}</p>
     <div className="detail-meta"><p><strong>Pickup</strong><br/>{item.pickup || 'Arrange directly with seller'}</p><p><strong>Seller</strong><br/>{item.seller}</p></div>
     {item.owner==='you'
       ? <div className="owner-actions detail"><button className="sell-cta" onClick={()=>startEdit(item)}>Edit your listing</button>{statusButton(item)}</div>
       : item.status==='sold'
         ? <p className="sold-note">This item has already been sold, so the seller can no longer be contacted about it.</p>
         : <a className="sell-cta contact-seller" href={`mailto:${item.sellerEmail}?subject=${subject}&body=${body}`}>✉ Contact seller</a>}
    </section>
   </div>;
  })()}
  {editor&&<div className="overlay" onMouseDown={e=>e.target===e.currentTarget&&setEditor(null)}><section className="sell-modal" role="dialog" aria-modal="true" aria-labelledby="editor-title">
   <div className="modal-head"><div><p className="section-kicker">CAMPUS EXCHANGE</p><h2 id="editor-title">{editor.id?'Edit your listing':'Sell an item'}</h2><p>Fields marked <span className="req">*</span> are required.</p></div><button className="close" aria-label="Close form" onClick={()=>setEditor(null)}>×</button></div>
   <form onSubmit={submit} noValidate><div className="field-grid">
    <Field name="title" label="Item title" required error={shownError('title')} hint={`${editor.form.title.trim().length}/${TITLE_MAX}`}>{p=><input {...p} value={editor.form.title} onChange={e=>setField('title',e.target.value)} onBlur={()=>touch('title')} placeholder="e.g. Calculus II textbook"/>}</Field>
    <Field name="price" label="Price (EGP)" required error={shownError('price')}>{p=><input {...p} type="number" inputMode="decimal" min="0" step="0.01" value={editor.form.price} onChange={e=>setField('price',e.target.value)} onBlur={()=>touch('price')} onKeyDown={e=>['e','E','+','-'].includes(e.key)&&e.preventDefault()} placeholder="e.g. 250"/>}</Field>
    <Field name="category" label="Category" required error={shownError('category')}>{p=><select {...p} value={editor.form.category} onChange={e=>{setField('category',e.target.value);touch('category');}} onBlur={()=>touch('category')}><option value="">Select a category</option>{categories.slice(1).map(c=><option value={c} key={c}>{cap(c)}</option>)}</select>}</Field>
    <Field name="condition" label="Condition" required error={shownError('condition')}>{p=><select {...p} value={editor.form.condition} onChange={e=>{setField('condition',e.target.value);touch('condition');}} onBlur={()=>touch('condition')}><option value="">Select a condition</option>{conditions.map(c=><option value={c} key={c}>{cap(c)}</option>)}</select>}</Field>
    <Field name="description" label="Description" wide error={shownError('description')} hint={`Optional · ${editor.form.description.trim().length}/${DESCRIPTION_MAX}`}>{p=><textarea {...p} value={editor.form.description} onChange={e=>setField('description',e.target.value)} onBlur={()=>touch('description')} placeholder="Size, defects, what's included…" rows="5"/>}</Field>
    <Field name="pickup" label="Pickup / meetup location" wide error={shownError('pickup')} hint="Optional">{p=><input {...p} value={editor.form.pickup} onChange={e=>setField('pickup',e.target.value)} onBlur={()=>touch('pickup')} placeholder="e.g. Library entrance or arrange on campus"/>}</Field>
    <Field name="email" label="Seller contact email" wide hint="Taken from your registered account, so buyers can contact you about this item.">{p=><input {...p} value={currentUser.email} readOnly aria-readonly="true" className="readonly-input"/>}</Field>
    {editor.id&&<Field name="status" label="Status" error={shownError('status')}>{p=><select {...p} value={editor.form.status} onChange={e=>setField('status',e.target.value)}><option value="active">Available</option><option value="sold">Sold</option></select>}</Field>}
   </div>
   {editor.submitted&&Object.keys(formErrors).length>0&&<p className="alert" role="alert">Please fix the {Object.keys(formErrors).length===1?'highlighted field':`${Object.keys(formErrors).length} highlighted fields`} before saving.</p>}
   <div className="modal-foot"><button type="button" onClick={()=>setEditor(null)}>Cancel</button><button className="sell-cta" type="submit">{editor.id?'Save changes':'Publish item'}</button></div></form></section></div>}
 </div>;
}
