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
function findErrors(form){
 const errors={};
 if(!form.title.trim())errors.title='Please complete the item title.';
 if(form.price.trim()==='' || !Number.isFinite(Number(form.price)) || Number(form.price)<0)errors.price='Enter a price of zero or more.';
 if(!categories.slice(1).includes(form.category))errors.category='Choose a category.';
 if(!conditions.includes(form.condition))errors.condition='Choose an item condition.';
 if(!['active','sold'].includes(form.status))errors.status='Choose a valid status.';
 return errors;
}
const MAX_PHOTOS = 4;
// Uploaded photos are scaled down to JPEG data URLs so they fit in localStorage
function shrinkPhoto(file){return new Promise((resolve,reject)=>{const url=URL.createObjectURL(file);const img=new Image();img.onload=()=>{const scale=Math.min(1,900/Math.max(img.width,img.height));const canvas=document.createElement('canvas');canvas.width=Math.round(img.width*scale);canvas.height=Math.round(img.height*scale);canvas.getContext('2d').drawImage(img,0,0,canvas.width,canvas.height);URL.revokeObjectURL(url);resolve(canvas.toDataURL('image/jpeg',0.8));};img.onerror=()=>{URL.revokeObjectURL(url);reject(new Error('Unreadable image'));};img.src=url;});}
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
 const [showSold,setShowSold] = useState(false); // sold items hidden unless asked for
 const [mineOnly,setMineOnly] = useState(false); // "My listings" view: all your items, sold included
 const [selected,setSelected] = useState(null);
 const [editor,setEditor] = useState(null); // null or {id,form,photos,initial,photoNote,confirmDiscard}
 const [errors,setErrors] = useState({});
 const [activePhoto,setActivePhoto] = useState(0);
 const [notice,setNotice] = useState('');
 useEffect(()=>{try{localStorage.setItem(KEY,JSON.stringify(items));}catch{setNotice('Browser storage is full. Try fewer or smaller photos; your latest change may be lost after a reload.');}},[items]);
 useEffect(()=>setActivePhoto(0),[selected]);
 // Detail view gets its own history entry, so the browser back button closes it instead of leaving the site
 useEffect(()=>{if(window.history.state?.detail)window.history.replaceState(null,'');const onPop=e=>setSelected(e.state?.detail||null);window.addEventListener('popstate',onPop);return()=>window.removeEventListener('popstate',onPop);},[]);
 useEffect(()=>{if(!editor)return;const onKey=e=>{if(e.key!=='Escape')return;if(editor.confirmDiscard)setEditor(s=>({...s,confirmDiscard:false}));else closeEditor();};window.addEventListener('keydown',onKey);return()=>window.removeEventListener('keydown',onKey);},[editor]);
 useEffect(()=>{if(!selected||editor)return;const onKey=e=>{if(e.key==='Escape')closeDetail();};window.addEventListener('keydown',onKey);return()=>window.removeEventListener('keydown',onKey);},[selected,editor]);
 const listing = useMemo(()=>{let a=items.filter(x=>(mineOnly?x.owner==='you':showSold||x.status!=='sold')&&(category==='all'||x.category===category)&&`${x.title} ${x.category} ${x.description}`.toLowerCase().includes(query.toLowerCase()));if(sort==='low')a.sort((a,b)=>a.price-b.price);if(sort==='high')a.sort((a,b)=>b.price-a.price);return a;},[items,category,query,sort,showSold,mineOnly]);
 const myCount = items.filter(x=>x.owner==='you').length;
 function startEdit(item){if(item&&item.owner!=='you')return;setErrors({});const form=item?{title:item.title,price:String(item.price),category:item.category,condition:item.condition,description:item.description,pickup:item.pickup || '',status:item.status}:{...emptyForm};const photos=item?.photos||[];setEditor({id:item?.id||null,form,photos,initial:JSON.stringify({form,photos}),photoNote:'',confirmDiscard:false});}
 // Closing a form with unsaved changes asks first instead of silently throwing the work away
 function closeEditor(){setEditor(s=>s&&JSON.stringify({form:s.form,photos:s.photos})!==s.initial?{...s,confirmDiscard:true}:null);}
 function setField(key,value){setEditor(s=>({...s,form:{...s.form,[key]:value}}));setErrors(e=>({...e,[key]:''}));}
 const fieldProps = key => ({id:`field-${key}`,value:editor.form[key],onChange:e=>setField(key,e.target.value),'aria-invalid':errors[key]?true:undefined,'aria-describedby':errors[key]?`error-${key}`:undefined});
 const fieldError = key => errors[key]&&<small className="field-error" id={`error-${key}`}>{errors[key]}</small>;
 async function addPhotos(event){const files=[...event.target.files].filter(f=>f.type.startsWith('image/'));event.target.value='';const room=MAX_PHOTOS-editor.photos.length;const picked=files.slice(0,room);const results=await Promise.allSettled(picked.map(shrinkPhoto));const added=results.filter(r=>r.status==='fulfilled').map(r=>r.value);setEditor(s=>({...s,photos:[...s.photos,...added],photoNote:files.length>room?`You can add up to ${MAX_PHOTOS} photos per listing.`:added.length<picked.length?'Some files could not be read as images.':''}));}
 function removePhoto(index){setEditor(s=>({...s,photos:s.photos.filter((_,i)=>i!==index),photoNote:''}));}
 function toggleSold(item){const sold=item.status!=='sold';setItems(items.map(x=>x.id===item.id?{...x,status:sold?'sold':'active'}:x));setNotice(sold?`"${item.title}" marked as sold.${!mineOnly&&!showSold?' Find it under My listings.':''}`:`"${item.title}" is active again.`);}
 function openItem(id){window.history.pushState({detail:id},'');setSelected(id);}
 function closeDetail(){if(window.history.state?.detail)window.history.back();else setSelected(null);}
 function submit(event){event.preventDefault();const f=editor.form;const found=findErrors(f);const first=Object.keys(found)[0];if(first){setErrors(found);document.getElementById(`field-${first}`)?.focus();return;}const original=editor.id?items.find(x=>x.id===editor.id):null;const next={...f, title:f.title.trim(),price:Number(f.price),description:f.description.trim(),pickup:f.pickup.trim(),photos:editor.photos,emoji:original?.emoji || '📦',owner:'you',seller:currentUser.name,sellerEmail:currentUser.email};
 if(editor.id){setItems(items.map(x=>x.id===editor.id?{...x,...next}:x));setNotice('Changes saved.');}else{setItems([{...next,id:`m-${Date.now()}`,status:'active'},...items]);setNotice('Item listed.');}setEditor(null);if(selected)closeDetail();}
 function reset(){setItems(seed);if(selected)closeDetail();setEditor(null);setQuery('');setCategory('all');setSort('featured');setShowSold(false);setMineOnly(false);setNotice('Example items restored.');}
 return <div className="market-app">
  <div className="utility"><span>Campus Exchange</span><span>Trusted by students • All prices in EGP</span></div>
  <header className="navigation"><button className="brand" onClick={()=>{if(selected)closeDetail();setCategory('all');setMineOnly(false)}}><span className="brand-icon">✳</span> CAMPUS<span className="brand-alt">exchange</span></button><div className="nav-actions"><button className={mineOnly?'nav-mine on':'nav-mine'} aria-pressed={mineOnly} onClick={()=>{if(selected)closeDetail();setMineOnly(m=>!m);setCategory('all')}}>★ My listings ({myCount})</button><span className="usercircle">Y</span><button className="sell-cta" onClick={()=>startEdit(null)}>+ Sell an item</button></div></header>
  <main>
   <section className="discovery" id="discover"><div className="discover-top">{mineOnly
     ? <div><p className="section-kicker">MY LISTINGS</p><h2>Your listings</h2><p>Everything you've listed, including sold items. <button className="link-button" onClick={()=>setMineOnly(false)}>← Back to all listings</button></p></div>
     : <div><p className="section-kicker">CURATED FOR YOUR CAMPUS</p><h2>Find something good.</h2><p>Items listed by people around you.</p></div>}<div className="discover-right"><label className="search"><span>⌕</span><input aria-label="Search listings" placeholder="Search listings" value={query} onChange={e=>setQuery(e.target.value)}/></label><label className="sort"><span>Sort</span><select value={sort} onChange={e=>setSort(e.target.value)}><option value="featured">Featured</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option></select></label><label className="filter-toggle" title={mineOnly?'My listings always shows all your items':undefined}><input type="checkbox" checked={showSold} disabled={mineOnly} onChange={e=>setShowSold(e.target.checked)}/><span>Show sold</span></label></div></div>
    <div className="category-row">{categories.map(c=><button key={c} onClick={()=>{setCategory(c);setMineOnly(false)}} className={!mineOnly&&category===c?'on':''}>{c==='all'?'All items':cap(c)}</button>)}</div>
    {notice&&<p className="notice" role="status">{notice} <button onClick={()=>setNotice('')}>×</button></p>}
    <div className="listing-grid">{listing.map(item=><article className={['product',item.status==='sold'&&'sold',item.owner==='you'&&'mine'].filter(Boolean).join(' ')} key={item.id}><button className="photo" onClick={()=>openItem(item.id)}><span className="stamp">{cap(item.condition)}</span>{item.owner==='you'&&<span className="mine-badge">Your listing</span>}{item.status==='sold'&&<span className="sold-banner">Sold</span>}<ListingImage src={item.photos?.[0]} alt={item.title} emoji={item.emoji} className="listing-img" /></button><div className="prod-details"><h3>{item.title}</h3><strong className="price">EGP {item.price.toLocaleString()}</strong><p title={item.description}>{item.description}</p><button className="details-button" onClick={()=>openItem(item.id)}>View item <span>↗</span></button>{item.owner==='you'&&<div className="owner-actions"><button onClick={()=>startEdit(item)}>✎ Edit</button><button onClick={()=>toggleSold(item)}>{item.status==='sold'?'↺ Relist':'✓ Mark as sold'}</button></div>}</div></article>)}{listing.length===0&&(mineOnly&&myCount===0
     ? <p className="noresults">You haven't listed anything yet. <button className="sell-cta" onClick={()=>startEdit(null)}>+ Sell an item</button></p>
     : <p className="noresults">No listings match your search.</p>)}</div>
   </section>
   <footer><strong>CAMPUS exchange</strong><span>From students, for students.</span><button onClick={reset}>Reset demo</button></footer>
  </main>
  {selected&&(()=>{
   const item=items.find(x=>x.id===selected);if(!item)return null;
   const images=item.photos || [];
   const subject=encodeURIComponent(`Campus Exchange: ${item.title}`);
   const body=encodeURIComponent(`Hi ${item.seller},\n\nI'm interested in your listing "${item.title}" (EGP ${item.price}). Is it still available?\n\n`);
   return <div className="overlay" onMouseDown={e=>e.target===e.currentTarget&&closeDetail()}>
    <section className="detail-panel" role="dialog" aria-modal="true" aria-label="Item details">
     <button className="back-link" autoFocus onClick={closeDetail}>← Back to listings</button>
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
  {editor&&<div className="overlay"><section className="sell-modal" role="dialog" aria-modal="true" aria-label={editor.id?'Edit item':'Sell item'}>
   <div className="modal-head"><div><p className="section-kicker">CAMPUS EXCHANGE</p><h2>{editor.id?'Edit your listing':'Sell an item'}</h2><p>Fields marked * are required.</p></div><button type="button" className="close" aria-label="Close form" onClick={closeEditor}>×</button></div>
   <form onSubmit={submit} noValidate><div className="field-grid">
    <div className="photo-field"><span>Photos <small>Up to {MAX_PHOTOS}. The first one is the cover.</small></span>
     <div className="photo-picker">
      {editor.photos.map((src,index)=><div className="photo-preview" key={index}><img src={src} alt={`Photo ${index+1}`}/>{index===0&&<span className="cover-tag">Cover</span>}<button type="button" aria-label={`Remove photo ${index+1}`} onClick={()=>removePhoto(index)}>×</button></div>)}
      {editor.photos.length<MAX_PHOTOS&&<label className="photo-add"><input type="file" accept="image/*" multiple onChange={addPhotos}/><span aria-hidden="true">＋</span>Add photos</label>}
     </div>
     {editor.photoNote&&<small className="field-error">{editor.photoNote}</small>}
    </div>
    <label className={errors.title?'has-error':''}><span>Item title *</span><input {...fieldProps('title')} placeholder="What are you selling?"/>{fieldError('title')}</label>
    <label className={errors.price?'has-error':''}><span>Price (EGP) *</span><input type="number" min="0" step="0.01" {...fieldProps('price')} placeholder="Price"/>{fieldError('price')}</label>
    <label className={errors.category?'has-error':''}><span>Category *</span><select {...fieldProps('category')}><option value="">Select</option>{categories.slice(1).map(c=><option value={c} key={c}>{cap(c)}</option>)}</select>{fieldError('category')}</label>
    <label className={errors.condition?'has-error':''}><span>Condition *</span><select {...fieldProps('condition')}><option value="">Select</option>{conditions.map(c=><option value={c} key={c}>{cap(c)}</option>)}</select>{fieldError('condition')}</label>
    <label className="wide"><span>Description</span><textarea {...fieldProps('description')} placeholder="Description" rows="5"/></label>
    <label className="wide"><span>Pickup / meetup location</span><input {...fieldProps('pickup')} placeholder="e.g. Library entrance or arrange on campus" /></label>
    <label className="wide"><span>Seller contact email</span><input value={currentUser.email} readOnly aria-readonly="true" className="readonly-input"/><small className="email-helper">Taken from your registered account, so buyers can contact you about this item.</small></label>
    {editor.id&&<label className={errors.status?'has-error':''}><span>Status</span><select {...fieldProps('status')}><option value="active">Active</option><option value="sold">Sold</option></select>{fieldError('status')}</label>}
   </div>
   {Object.values(errors).some(Boolean)&&<p className="alert" role="alert">Please fix the highlighted fields.</p>}
   <div className="modal-foot">{editor.confirmDiscard
    ? <><span className="discard-question" role="alert">Discard your changes?</span><button type="button" autoFocus onClick={()=>setEditor(s=>({...s,confirmDiscard:false}))}>Keep editing</button><button type="button" className="danger" onClick={()=>setEditor(null)}>Discard</button></>
    : <><button type="button" onClick={closeEditor}>Cancel</button><button className="sell-cta" type="submit">{editor.id?'Save changes':'Publish item'}</button></>}
   </div></form></section></div>}
 </div>;
}
