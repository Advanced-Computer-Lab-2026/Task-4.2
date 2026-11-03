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
function fieldErrors(form){
 const e={};
 if(!form.title.trim())e.title='Enter an item title.';
 if(form.price.trim()===''||!Number.isFinite(Number(form.price))||Number(form.price)<0)e.price='Enter a price of zero or more.';
 if(!categories.slice(1).includes(form.category))e.category='Choose a category.';
 if(!conditions.includes(form.condition))e.condition='Choose a condition.';
 if(!['active','sold'].includes(form.status))e.status='Choose a valid status.';
 return e;
}
function readPhoto(file){
 return new Promise((resolve,reject)=>{
  const url=URL.createObjectURL(file),img=new Image();
  img.onload=()=>{const r=Math.min(1,900/Math.max(img.width,img.height)),c=document.createElement('canvas');c.width=Math.round(img.width*r);c.height=Math.round(img.height*r);c.getContext('2d').drawImage(img,0,0,c.width,c.height);URL.revokeObjectURL(url);resolve(c.toDataURL('image/jpeg',.8));};
  img.onerror=()=>{URL.revokeObjectURL(url);reject();};
  img.src=url;
 });
}
const MAX_PHOTOS=3;
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
 const [error,setError] = useState('');
 const [activePhoto,setActivePhoto] = useState(0);
 const [notice,setNotice] = useState('');
 const [maxPrice,setMaxPrice] = useState('');
 const [availableOnly,setAvailableOnly] = useState(true);
 const [mineOnly,setMineOnly] = useState(false);
 const [fieldErr,setFieldErr] = useState({});
 const [photoMsg,setPhotoMsg] = useState('');
 useEffect(()=>localStorage.setItem(KEY,JSON.stringify(items)),[items]);
 useEffect(()=>setActivePhoto(0),[selected]);
 useEffect(()=>{const h=e=>{if(e.key!=='Escape')return;if(editor)setEditor(null);else if(selected)setSelected(null);};window.addEventListener('keydown',h);return()=>window.removeEventListener('keydown',h);},[editor,selected]);
 const listing = useMemo(()=>{const q=query.trim().toLowerCase(),cap$=maxPrice===''?Infinity:Number(maxPrice);let a=items.filter(x=>(category==='all'||x.category===category)&&`${x.title} ${x.category} ${x.description}`.toLowerCase().includes(q)&&x.price<=cap$&&(!availableOnly||x.status==='active')&&(!mineOnly||x.owner==='you'));if(sort==='low')a.sort((a,b)=>a.price-b.price);if(sort==='high')a.sort((a,b)=>b.price-a.price);return a;},[items,category,query,sort,maxPrice,availableOnly,mineOnly]);
 const filtersOn=query||category!=='all'||maxPrice!==''||!availableOnly||mineOnly;
 const cheapest=listing.filter(x=>x.status==='active').reduce((m,x)=>m===null||x.price<m?x.price:m,null);
 function clearFilters(){setQuery('');setCategory('all');setMaxPrice('');setAvailableOnly(true);setMineOnly(false);}
 async function addPhotos(files){
  setPhotoMsg('');
  const room=MAX_PHOTOS-(editor.form.photos||[]).length,picked=[...files].filter(f=>f.type.startsWith('image/')).slice(0,room);
  if(files.length>picked.length)setPhotoMsg(`Only image files, up to ${MAX_PHOTOS} photos.`);
  const out=[];for(const f of picked){try{out.push(await readPhoto(f));}catch{setPhotoMsg('One photo could not be read.');}}
  setEditor(s=>({...s,form:{...s.form,photos:[...(s.form.photos||[]),...out]}}));
 }
 function startEdit(item){if(item&&item.owner!=='you')return;setError('');setFieldErr({});setPhotoMsg('');setEditor({id:item?.id||null,form:item?{title:item.title,price:String(item.price),category:item.category,condition:item.condition,description:item.description,pickup:item.pickup || '',status:item.status,photos:item.photos||[]}:{...emptyForm,photos:[]}});}
 function submit(event){event.preventDefault();const f=editor.form;const fe=fieldErrors(f);if(Object.keys(fe).length){setFieldErr(fe);setError('Please fix the highlighted fields.');return;}const original=editor.id?items.find(x=>x.id===editor.id):null;const next={...f, title:f.title.trim(),price:Number(f.price),description:f.description.trim(),pickup:f.pickup.trim(),photos:f.photos||[],emoji:original?.emoji || '📦',owner:'you',seller:currentUser.name,sellerEmail:currentUser.email};
 if(editor.id){setItems(items.map(x=>x.id===editor.id?{...x,...next}:x));setNotice('Changes saved.');}else{setItems([{...next,id:`m-${Date.now()}`,status:'active'},...items]);setNotice('Item listed.');setAvailableOnly(true);setMineOnly(false);}setEditor(null);setSelected(null);}
 function reset(){setItems(seed);setSelected(null);setEditor(null);clearFilters();setSort('featured');setNotice('Example items restored.');}
 return <div className="market-app">
  <div className="utility"><span>Campus Exchange</span><span>Trusted by students • All prices in EGP</span></div>
  <header className="navigation"><button className="brand" onClick={()=>{setSelected(null);setCategory('all')}}><span className="brand-icon">✳</span> CAMPUS<span className="brand-alt">exchange</span></button><nav><a href="#discover">Browse items</a><button onClick={()=>setCategory('textbooks')}>Textbooks</button><button onClick={()=>setCategory('electronics')}>Electronics</button></nav><div className="nav-actions"><span className="usercircle">Y</span><button className="sell-cta" onClick={()=>startEdit(null)}>+ Sell an item</button></div></header>
  <main>
   
   <section className="promo"><div className="promo-copy"><span className="tag">THE CAMPUS MARKETPLACE</span><h1>Everything you need,<br/><i>right around campus.</i></h1><p>Browse little finds, big essentials and almost everything in between.</p><button onClick={()=>document.getElementById('discover')?.scrollIntoView({behavior:'smooth'})}>Explore listings <span>↗</span></button></div><div className="promo-art"><span>📚</span><span>💡</span><span>🎧</span><span>🛋️</span></div></section>
   <section className="discovery" id="discover"><div className="discover-top"><div><p className="section-kicker">CURATED FOR YOUR CAMPUS</p><h2>Find something good.</h2><p>Items listed by people around you.</p></div><div className="discover-right"><label className="search"><span>⌕</span><input aria-label="Search listings" placeholder="Search listings" value={query} onChange={e=>setQuery(e.target.value)}/></label><label className="sort"><span>Sort</span><select value={sort} onChange={e=>setSort(e.target.value)}><option value="featured">Featured</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option></select></label></div></div>
    <div className="category-row">{categories.map(c=><button key={c} onClick={()=>setCategory(c)} className={category===c?'on':''}>{c==='all'?'All items':cap(c)}</button>)}</div>
    <div className="filter-bar"><label className="price-cap"><span>Max price (EGP)</span><input type="number" min="0" inputMode="numeric" placeholder="Any" value={maxPrice} onChange={e=>setMaxPrice(e.target.value)}/></label><div className="quick-prices" role="group" aria-label="Quick price limits">{[200,500,1000].map(v=><button key={v} type="button" className={maxPrice===String(v)?'on':''} aria-pressed={maxPrice===String(v)} onClick={()=>setMaxPrice(maxPrice===String(v)?'':String(v))}>Under {v}</button>)}</div><label className="check"><input type="checkbox" checked={availableOnly} onChange={e=>setAvailableOnly(e.target.checked)}/> Available only</label><label className="check"><input type="checkbox" checked={mineOnly} onChange={e=>setMineOnly(e.target.checked)}/> My listings</label>{filtersOn&&<button type="button" className="link-btn" onClick={clearFilters}>Clear filters</button>}</div>
    <p className="result-count" role="status">{listing.length} {listing.length===1?'listing':'listings'}{cheapest!==null&&sort!=='low'?` · cheapest available EGP ${cheapest.toLocaleString()}`:''}</p>
    {notice&&<p className="notice" role="status">{notice} <button onClick={()=>setNotice('')}>×</button></p>}
    <div className="listing-grid">{listing.map(item=><article className={`product${item.status==='sold'?' is-sold':''}`} key={item.id}><button className="photo" aria-label={`View ${item.title}`} onClick={()=>setSelected(item.id)}><span className="stamp">{cap(item.condition)}</span><ListingImage src={item.photos?.[0]} alt="" emoji={item.emoji} className="listing-img" />{item.status==='sold'&&<span className="sold-band">SOLD</span>}</button><div className="prod-details"><div className="prod-topline"><span className="muted">{cap(item.category)}</span>{item.owner==='you'&&<span className="yours">Yours</span>}</div><strong className="price">EGP {item.price.toLocaleString()}</strong><h3>{item.title}</h3><p className="pickup-line">📍 {item.pickup||'Arrange with seller'}</p><div className="card-actions"><button className="details-button" onClick={()=>setSelected(item.id)}>View item</button></div></div></article>)}{listing.length===0&&<p className="noresults">No listings match your filters. <button className="link-btn" onClick={clearFilters}>Clear filters</button></p>}</div>
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
  {editor&&<div className="overlay" onMouseDown={e=>e.target===e.currentTarget&&setEditor(null)}><section className="sell-modal" role="dialog" aria-modal="true" aria-label={editor.id?'Edit item':'Sell item'}><div className="modal-head"><div><p className="section-kicker">CAMPUS EXCHANGE</p><h2>{editor.id?'Edit your listing':'Sell an item'}</h2><p>Add the details and we'll take care of the rest.</p></div><button className="close" onClick={()=>setEditor(null)}>×</button></div><form onSubmit={submit}><div className="field-grid"><label><span>Item title *</span><input value={editor.form.title} aria-invalid={!!fieldErr.title} aria-describedby={fieldErr.title?"err-title":undefined} onChange={e=>setEditor(s=>({...s,form:{...s.form,title:e.target.value}}))} placeholder="What are you selling?"/>{fieldErr.title&&<small className="field-error" id="err-title">{fieldErr.title}</small>}</label><label><span>Price (EGP) *</span><input type="number" min="0" step="0.01" value={editor.form.price} aria-invalid={!!fieldErr.price} aria-describedby={fieldErr.price?"err-price":undefined} onChange={e=>setEditor(s=>({...s,form:{...s.form,price:e.target.value}}))} placeholder="0"/>{fieldErr.price&&<small className="field-error" id="err-price">{fieldErr.price}</small>}</label><label><span>Category *</span><select value={editor.form.category} aria-invalid={!!fieldErr.category} aria-describedby={fieldErr.category?"err-category":undefined} onChange={e=>setEditor(s=>({...s,form:{...s.form,category:e.target.value}}))}><option value="">Select</option>{categories.slice(1).map(c=><option value={c} key={c}>{cap(c)}</option>)}</select>{fieldErr.category&&<small className="field-error" id="err-category">{fieldErr.category}</small>}</label><label><span>Condition *</span><select value={editor.form.condition} aria-invalid={!!fieldErr.condition} aria-describedby={fieldErr.condition?"err-condition":undefined} onChange={e=>setEditor(s=>({...s,form:{...s.form,condition:e.target.value}}))}><option value="">Select</option>{conditions.map(c=><option value={c} key={c}>{cap(c)}</option>)}</select>{fieldErr.condition&&<small className="field-error" id="err-condition">{fieldErr.condition}</small>}</label><label className="wide"><span>Description (optional)</span><textarea value={editor.form.description} onChange={e=>setEditor(s=>({...s,form:{...s.form,description:e.target.value}}))} placeholder="Condition details, what is included, why you are selling" rows="4"/>{fieldErr.description&&<small className="field-error" id="err-description">{fieldErr.description}</small>}</label><label className="wide"><span>Pickup / meetup location</span><input value={editor.form.pickup} onChange={e=>setEditor(s=>({...s,form:{...s.form,pickup:e.target.value}}))} placeholder="e.g. Library entrance or arrange on campus" />{fieldErr.pickup&&<small className="field-error" id="err-pickup">{fieldErr.pickup}</small>}</label><div className="wide photo-field"><span className="field-label">Photos (optional, up to {MAX_PHOTOS})</span><div className="photo-previews">{(editor.form.photos||[]).map((src,i)=><div className="photo-preview" key={i}><img src={src} alt={`Photo ${i+1}`}/><button type="button" aria-label={`Remove photo ${i+1}`} onClick={()=>setEditor(s=>({...s,form:{...s.form,photos:s.form.photos.filter((_,j)=>j!==i)}}))}>×</button></div>)}{(editor.form.photos||[]).length<MAX_PHOTOS&&<label className="photo-add"><input type="file" accept="image/*" multiple onChange={e=>{addPhotos(e.target.files);e.target.value='';}}/><span>+ Add photo</span></label>}</div>{photoMsg&&<small className="field-error">{photoMsg}</small>}</div><label className="wide"><span>Seller contact email</span><input value={currentUser.email} readOnly aria-readonly="true" className="readonly-input"/><small className="email-helper">Taken from your registered account, so buyers can contact you about this item.</small></label>{editor.id&&<label><span>Status</span><select value={editor.form.status} onChange={e=>setEditor(s=>({...s,form:{...s.form,status:e.target.value}}))}><option value="active">Active</option><option value="sold">Sold</option></select></label>}</div>{error&&<p className="alert" role="alert">{error}</p>}<div className="modal-foot"><button type="button" onClick={()=>setEditor(null)}>Cancel</button><button className="sell-cta" type="submit">{editor.id?'Save changes':'Publish item'}</button></div></form></section></div>}
 </div>;
}
