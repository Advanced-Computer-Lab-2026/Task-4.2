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
const budgets = [200, 500, 1000];
function saved(){try {const value=JSON.parse(localStorage.getItem(KEY));return Array.isArray(value)?value:seed;}catch{return seed;}}
const cap = s => s==='like-new'?'Like new':(s||'').replace(/\b\w/g,m=>m.toUpperCase());
const egp = n => `EGP ${n.toLocaleString()}`;
function findErrors(form){
 const e={};
 if(!form.title.trim())e.title='Enter an item title.';
 if(form.price.trim()===''||!Number.isFinite(Number(form.price))||Number(form.price)<0)e.price='Enter a price of 0 or more.';
 if(!categories.slice(1).includes(form.category))e.category='Choose a category.';
 if(!conditions.includes(form.condition))e.condition='Choose a condition.';
 if(!['active','sold'].includes(form.status))e.status='Choose a valid status.';
 return e;
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
 const [condition,setCondition] = useState('all');
 const [maxPrice,setMaxPrice] = useState('');
 const [hideSold,setHideSold] = useState(true);
 const [mineOnly,setMineOnly] = useState(false);
 const [sort,setSort] = useState('featured');
 const [selected,setSelected] = useState(null);
 const [editor,setEditor] = useState(null); // null or {id,form}
 const [errors,setErrors] = useState({});
 const [activePhoto,setActivePhoto] = useState(0);
 const [notice,setNotice] = useState('');
 const [compare,setCompare] = useState([]);
 const [showCompare,setShowCompare] = useState(false);
 useEffect(()=>{try{localStorage.setItem(KEY,JSON.stringify(items));}catch{}},[items]);
 useEffect(()=>setActivePhoto(0),[selected]);
 useEffect(()=>{const h=e=>{if(e.key==='Escape'){if(editor)setEditor(null);else if(showCompare)setShowCompare(false);else setSelected(null);}};window.addEventListener('keydown',h);return()=>window.removeEventListener('keydown',h);},[editor,showCompare]);
 const limit = maxPrice.trim()===''||!Number.isFinite(Number(maxPrice))?Infinity:Number(maxPrice);
 const listing = useMemo(()=>{
  let a=items.filter(x=>(category==='all'||x.category===category)
   &&(condition==='all'||x.condition===condition)
   &&x.price<=limit
   &&(!hideSold||mineOnly||x.status!=='sold')
   &&(!mineOnly||x.owner==='you')
   &&`${x.title} ${x.category} ${x.description} ${x.pickup||''}`.toLowerCase().includes(query.toLowerCase()));
  if(sort==='low')a.sort((a,b)=>a.price-b.price);if(sort==='high')a.sort((a,b)=>b.price-a.price);return a;
 },[items,category,condition,limit,hideSold,mineOnly,query,sort]);
 const lowestId = useMemo(()=>{const act=listing.filter(x=>x.status==='active');return act.length>1?act.reduce((m,x)=>x.price<m.price?x:m).id:null;},[listing]);
 const compared = compare.map(id=>items.find(x=>x.id===id)).filter(Boolean);
 const bestPrice = compared.length?Math.min(...compared.map(x=>x.price)):0;
 const filtersOn = query||category!=='all'||condition!=='all'||maxPrice||mineOnly||!hideSold;
 function clearFilters(){setQuery('');setCategory('all');setCondition('all');setMaxPrice('');setMineOnly(false);setHideSold(true);}
 function toggleCompare(id){
  if(compare.includes(id)){setCompare(compare.filter(x=>x!==id));return;}
  if(compare.length>=3){setNotice('You can compare up to 3 items. Remove one first.');return;}
  setCompare([...compare,id]);
 }
 function markSold(item){if(item.owner!=='you')return;setItems(items.map(x=>x.id===item.id?{...x,status:'sold'}:x));setSelected(null);setNotice(`“${item.title}” marked as sold.`);}
 function startEdit(item){if(item&&item.owner!=='you')return;setErrors({});setEditor({id:item?.id||null,form:item?{title:item.title,price:String(item.price),category:item.category,condition:item.condition,description:item.description,pickup:item.pickup || '',status:item.status}:{...emptyForm}});}
 function setField(k,v){setEditor(s=>({...s,form:{...s.form,[k]:v}}));if(errors[k])setErrors(e=>({...e,[k]:undefined}));}
 function submit(event){event.preventDefault();const f=editor.form;const errs=findErrors(f);if(Object.keys(errs).length){setErrors(errs);return;}const original=editor.id?items.find(x=>x.id===editor.id):null;if(original&&original.owner!=='you')return;const next={...f, title:f.title.trim(),price:Number(f.price),description:f.description.trim(),pickup:f.pickup.trim(),photos:original?.photos || [],emoji:original?.emoji || '📦',owner:'you',seller:currentUser.name,sellerEmail:currentUser.email};
 if(editor.id){setItems(items.map(x=>x.id===editor.id?{...x,...next}:x));setNotice('Changes saved.');}else{setItems([{...next,id:`m-${Date.now()}`,status:'active'},...items]);setNotice('Item listed. It now appears at the top of Browse.');clearFilters();}setEditor(null);setSelected(null);}
 function reset(){setItems(seed);setSelected(null);setEditor(null);setCompare([]);clearFilters();setSort('featured');setNotice('Example items restored.');}
 return <div className="market-app">
  <div className="utility"><span>Campus Exchange</span><span>Trusted by students • All prices in EGP</span></div>
  <header className="navigation"><button className="brand" onClick={()=>{setSelected(null);clearFilters();}}><span className="brand-icon">✳</span> CAMPUS<span className="brand-alt">exchange</span></button><nav><a href="#discover">Browse items</a><button onClick={()=>setMineOnly(m=>!m)}>{mineOnly?'All listings':'My listings'}</button></nav><div className="nav-actions"><span className="usercircle">Y</span><button className="sell-cta" onClick={()=>startEdit(null)}>+ Sell an item</button></div></header>
  <main>
   <section className="promo"><div className="promo-copy"><span className="tag">THE CAMPUS MARKETPLACE</span><h1>Everything you need, <i>right around campus.</i></h1><p>Set a budget, compare up to three items, then meet on campus.</p></div><div className="promo-art"><span>📚</span><span>💡</span><span>🎧</span><span>🛋️</span></div></section>
   <section className="discovery" id="discover"><div className="discover-top"><div><p className="section-kicker">CURATED FOR YOUR CAMPUS</p><h2>Find something good.</h2></div><div className="discover-right"><label className="search"><span>⌕</span><input aria-label="Search listings" placeholder="Search listings" value={query} onChange={e=>setQuery(e.target.value)}/></label><label className="sort"><span>Sort</span><select value={sort} onChange={e=>setSort(e.target.value)}><option value="featured">Featured</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option></select></label></div></div>
    <div className="category-row">{categories.map(c=><button key={c} onClick={()=>setCategory(c)} className={category===c?'on':''} aria-pressed={category===c}>{c==='all'?'All items':cap(c)}</button>)}</div>
    <div className="filter-bar" aria-label="Budget and filters">
     <div className="budget"><span className="fl">Budget</span>{budgets.map(b=><button key={b} className={limit===b?'on':''} aria-pressed={limit===b} onClick={()=>setMaxPrice(limit===b?'':String(b))}>Under {b}</button>)}<label className="maxbox"><span>Max EGP</span><input type="number" min="0" inputMode="numeric" value={maxPrice} onChange={e=>setMaxPrice(e.target.value)} placeholder="Any"/></label></div>
     <label className="sort"><span>Condition</span><select value={condition} onChange={e=>setCondition(e.target.value)}><option value="all">Any</option>{conditions.map(c=><option key={c} value={c}>{cap(c)}</option>)}</select></label>
     <label className="check"><input type="checkbox" checked={hideSold} onChange={e=>setHideSold(e.target.checked)}/> Hide sold</label>
     <label className="check"><input type="checkbox" checked={mineOnly} onChange={e=>setMineOnly(e.target.checked)}/> My listings</label>
    </div>
    <p className="resultline" aria-live="polite"><strong>{listing.length}</strong> {listing.length===1?'item':'items'}{limit!==Infinity&&<> up to {egp(limit)}</>}{filtersOn&&<button className="linkbtn" onClick={clearFilters}>Clear filters</button>}</p>
    {notice&&<p className="notice" role="status">{notice} <button aria-label="Dismiss" onClick={()=>setNotice('')}>×</button></p>}
    <div className="listing-grid">{listing.map(item=><article className={`product${item.status==='sold'?' is-sold':''}`} key={item.id}><button className="photo" aria-label={`View ${item.title}`} onClick={()=>setSelected(item.id)}><span className="stamp">{cap(item.condition)}</span>{item.id===lowestId&&<span className="best-badge">Lowest price</span>}<ListingImage src={item.photos?.[0]} alt="" emoji={item.emoji} className="listing-img" /><span className="category-caption">{cap(item.category)}</span></button><div className="prod-details"><div className="prod-topline"><span className="muted">{item.category}</span><span className={item.status==='sold'?'soldstatus':'instock'}>{item.status.toUpperCase()}</span></div><h3>{item.title}</h3><p className="pickup-line">📍 {item.pickup||'Arrange with seller'}</p><div className="costline"><strong>{item.price===0?'Free':egp(item.price)}</strong><span>{cap(item.condition)}</span></div><div className="card-actions"><button className="details-button" onClick={()=>setSelected(item.id)}>View item <span>↗</span></button><label className={`cmp${compare.includes(item.id)?' on':''}`}><input type="checkbox" checked={compare.includes(item.id)} onChange={()=>toggleCompare(item.id)}/> Compare</label></div>{item.owner==='you'&&<div className="owner-row"><button onClick={()=>startEdit(item)}>Edit</button>{item.status==='active'&&<button onClick={()=>markSold(item)}>Mark sold</button>}</div>}</div></article>)}{listing.length===0&&<div className="noresults"><p>No listings match these filters.</p>{filtersOn&&<button className="sell-cta" onClick={clearFilters}>Clear filters</button>}</div>}</div>
   </section>
   <footer><strong>CAMPUS exchange</strong><span>From students, for students.</span><button onClick={reset}>Reset demo</button></footer>
  </main>
  {compare.length>0&&<div className="compare-bar" role="region" aria-label="Compare tray"><span>{compare.length} selected <small>(max 3)</small></span><button className="sell-cta" disabled={compare.length<2} onClick={()=>setShowCompare(true)}>{compare.length<2?'Pick 1 more':'Compare now'}</button><button className="ghost" onClick={()=>setCompare([])}>Clear</button></div>}
  {showCompare&&<div className="overlay" onMouseDown={e=>e.target===e.currentTarget&&setShowCompare(false)}><section className="sell-modal compare-modal" role="dialog" aria-modal="true" aria-label="Compare items"><button className="close" aria-label="Close comparison" onClick={()=>setShowCompare(false)}>×</button><p className="section-kicker">SIDE BY SIDE</p><h2>Compare items</h2><div className="table-wrap"><table><thead><tr><th></th>{compared.map(x=><th key={x.id}>{x.title}<button className="linkbtn" onClick={()=>setCompare(compare.filter(i=>i!==x.id))}>Remove</button></th>)}</tr></thead><tbody>
   <tr><th>Price</th>{compared.map(x=><td key={x.id} className={x.price===bestPrice&&compared.length>1?'best':''}><strong>{x.price===0?'Free':egp(x.price)}</strong>{x.price===bestPrice&&compared.length>1&&<small> lowest</small>}</td>)}</tr>
   <tr><th>Condition</th>{compared.map(x=><td key={x.id}>{cap(x.condition)}</td>)}</tr>
   <tr><th>Category</th>{compared.map(x=><td key={x.id}>{cap(x.category)}</td>)}</tr>
   <tr><th>Pickup</th>{compared.map(x=><td key={x.id}>{x.pickup||'Arrange with seller'}</td>)}</tr>
   <tr><th>Seller</th>{compared.map(x=><td key={x.id}>{x.seller}</td>)}</tr>
   <tr><th>Status</th>{compared.map(x=><td key={x.id}>{cap(x.status)}</td>)}</tr>
   <tr><th></th>{compared.map(x=><td key={x.id}><button className="details-button" onClick={()=>{setShowCompare(false);setSelected(x.id);}}>View item <span>↗</span></button></td>)}</tr></tbody></table></div></section></div>}
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
     <h3>{item.price===0?'Free':egp(item.price)}</h3>
     <p className="item-description">{item.description||'No description supplied.'}</p>
     <div className="detail-meta"><p><strong>Pickup</strong><br/>{item.pickup || 'Arrange directly with seller'}</p><p><strong>Seller</strong><br/>{item.seller}</p></div>
     <p className="muted">Status: {cap(item.status)}</p>
     {item.owner==='you'
       ? <div className="detail-actions"><button className="sell-cta" onClick={()=>startEdit(item)}>Edit your listing</button>{item.status==='active'&&<button className="ghost" onClick={()=>markSold(item)}>Mark as sold</button>}</div>
       : item.status==='sold'
         ? <p className="fineprint">This item is marked as sold.</p>
         : <><a className="sell-cta contact-seller" href={`mailto:${item.sellerEmail}?subject=${subject}&body=${body}`}>✉ Contact seller</a><p className="fineprint">Opens your email app. Nothing is sent inside this demo.</p></>}
    </section>
   </div>;
  })()}
  {editor&&<div className="overlay" onMouseDown={e=>e.target===e.currentTarget&&setEditor(null)}><section className="sell-modal" role="dialog" aria-modal="true" aria-label={editor.id?'Edit item':'Sell item'}><div className="modal-head"><div><p className="section-kicker">CAMPUS EXCHANGE</p><h2>{editor.id?'Edit your listing':'Sell an item'}</h2><p>Fields marked * are required. New listings start as active.</p></div><button className="close" aria-label="Close form" onClick={()=>setEditor(null)}>×</button></div><form onSubmit={submit} noValidate><div className="field-grid">
   <label className="wide"><span>Item title *</span><input autoFocus aria-invalid={!!errors.title} value={editor.form.title} onChange={e=>setField('title',e.target.value)} placeholder="What are you selling?"/>{errors.title&&<small className="field-err" role="alert">{errors.title}</small>}</label>
   <label><span>Price (EGP) *</span><input type="number" min="0" step="0.01" inputMode="decimal" aria-invalid={!!errors.price} value={editor.form.price} onChange={e=>setField('price',e.target.value)} placeholder="0 for free"/>{errors.price&&<small className="field-err" role="alert">{errors.price}</small>}</label>
   <label><span>Category *</span><select aria-invalid={!!errors.category} value={editor.form.category} onChange={e=>setField('category',e.target.value)}><option value="">Select</option>{categories.slice(1).map(c=><option value={c} key={c}>{cap(c)}</option>)}</select>{errors.category&&<small className="field-err" role="alert">{errors.category}</small>}</label>
   <label><span>Condition *</span><select aria-invalid={!!errors.condition} value={editor.form.condition} onChange={e=>setField('condition',e.target.value)}><option value="">Select</option>{conditions.map(c=><option value={c} key={c}>{cap(c)}</option>)}</select>{errors.condition&&<small className="field-err" role="alert">{errors.condition}</small>}</label>
   {editor.id?<label><span>Status</span><select value={editor.form.status} onChange={e=>setField('status',e.target.value)}><option value="active">Active</option><option value="sold">Sold</option></select></label>:<label><span>Status</span><input className="readonly-input" value="Active" readOnly aria-readonly="true"/></label>}
   <label className="wide"><span>Pickup / meetup location</span><input value={editor.form.pickup} onChange={e=>setField('pickup',e.target.value)} placeholder="e.g. Library entrance or arrange on campus" /></label>
   <label className="wide"><span>Description</span><textarea value={editor.form.description} onChange={e=>setField('description',e.target.value)} placeholder="Condition details, what’s included…" rows="4"/></label>
   <label className="wide"><span>Seller contact email</span><input value={currentUser.email} readOnly aria-readonly="true" className="readonly-input"/><small className="email-helper">Taken from your registered account, so buyers can contact you about this item.</small></label></div>
   {Object.values(errors).some(Boolean)&&<p className="alert" role="alert">Please fix the highlighted fields.</p>}<div className="modal-foot"><button type="button" onClick={()=>setEditor(null)}>Cancel</button><button className="sell-cta" type="submit">{editor.id?'Save changes':'Publish item'}</button></div></form></section></div>}
 </div>;
}