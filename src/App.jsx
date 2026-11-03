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
const MAX_PRICE = 1000000;
const fieldLabels = {title:'Item title', price:'Price', category:'Category', condition:'Condition', status:'Status'};
function fieldErrors(form){
 const e={};
 if(!form.title.trim())e.title='Item title is required.';
 if(form.price.trim()==='')e.price='Price is required. Enter 0 if it is free.';
 else if(!Number.isFinite(Number(form.price)) || Number(form.price)<0)e.price='Enter a price of zero or more.';
 else if(Number(form.price)>MAX_PRICE)e.price=`Enter a price up to EGP ${MAX_PRICE.toLocaleString()}.`;
 if(!categories.slice(1).includes(form.category))e.category='Choose a category.';
 if(!conditions.includes(form.condition))e.condition='Choose the item condition.';
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
 const [sort,setSort] = useState('featured');
 const [selected,setSelected] = useState(null);
 const [editor,setEditor] = useState(null); // null or {id,form}
 const [tried,setTried] = useState(false); // show field errors after the first submit
 const [activePhoto,setActivePhoto] = useState(0);
 const [notice,setNotice] = useState('');
 const [condition,setCondition] = useState('all');
 const [minPrice,setMinPrice] = useState('');
 const [maxPrice,setMaxPrice] = useState('');
 const [compare,setCompare] = useState([]); // up to 2 item ids
 const [showCompare,setShowCompare] = useState(false);
 const [showFilters,setShowFilters] = useState(false);
 const filterRef = useRef(null);
 const activeFilters = (category!=='all')+(condition!=='all')+(minPrice!=='')+(maxPrice!=='');
 useEffect(()=>localStorage.setItem(KEY,JSON.stringify(items)),[items]);
 useEffect(()=>setActivePhoto(0),[selected]);
 useEffect(()=>{if(!showFilters)return;const close=e=>{if(e.key==='Escape'||(e.type==='mousedown'&&!filterRef.current?.contains(e.target)))setShowFilters(false);};document.addEventListener('mousedown',close);document.addEventListener('keydown',close);return()=>{document.removeEventListener('mousedown',close);document.removeEventListener('keydown',close);};},[showFilters]);
 const listing = useMemo(()=>{let a=items.filter(x=>(category==='all'||x.category===category)&&(condition==='all'||x.condition===condition)&&(minPrice===''||x.price>=Number(minPrice))&&(maxPrice===''||x.price<=Number(maxPrice))&&`${x.title} ${x.category} ${x.description}`.toLowerCase().includes(query.toLowerCase()));if(sort==='low')a.sort((a,b)=>a.price-b.price);if(sort==='high')a.sort((a,b)=>b.price-a.price);return a;},[items,category,condition,minPrice,maxPrice,query,sort]);
 function startEdit(item){if(item&&item.owner!=='you')return;setTried(false);setEditor({id:item?.id||null,form:item?{title:item.title,price:String(item.price),category:item.category,condition:item.condition,description:item.description,pickup:item.pickup || '',status:item.status}:{...emptyForm}});}
 function submit(event){event.preventDefault();const f=editor.form;if(Object.keys(fieldErrors(f)).length){setTried(true);return;}const original=editor.id?items.find(x=>x.id===editor.id):null;const next={...f, title:f.title.trim(),price:Number(f.price),description:f.description.trim(),pickup:f.pickup.trim(),photos:original?.photos || [],emoji:original?.emoji || '📦',owner:'you',seller:currentUser.name,sellerEmail:currentUser.email};
 if(editor.id){setItems(items.map(x=>x.id===editor.id?{...x,...next}:x));setNotice('Changes saved.');}else{setItems([{...next,id:`m-${Date.now()}`,status:'active'},...items]);setNotice('Item listed.');}setEditor(null);setSelected(null);}
 const errs = editor&&tried?fieldErrors(editor.form):{};
 function remove(item){if(item.owner!=='you'||!window.confirm(`Delete "${item.title}"? This cannot be undone.`))return;setItems(items.filter(x=>x.id!==item.id));setCompare(c=>c.filter(id=>id!==item.id));setSelected(null);setNotice('Item deleted.');}
 function toggleCompare(id){setCompare(c=>c.includes(id)?c.filter(x=>x!==id):c.length>=2?[c[1],id]:[...c,id]);}
 function closeEditor(){const original=editor.id?items.find(x=>x.id===editor.id):null;const base=original?{title:original.title,price:String(original.price),category:original.category,condition:original.condition,description:original.description,pickup:original.pickup||'',status:original.status}:emptyForm;const dirty=Object.keys(base).some(k=>(editor.form[k]??'')!==(base[k]??''));if(dirty&&!window.confirm('Discard your unsaved changes?'))return;setEditor(null);}
 function clearFilters(){setQuery('');setCategory('all');setCondition('all');setMinPrice('');setMaxPrice('');}
 function reset(){setItems(seed);setCompare([]);setCondition('all');setMinPrice('');setMaxPrice('');setSelected(null);setEditor(null);setQuery('');setCategory('all');setSort('featured');setNotice('Example items restored.');}
 return <div className="market-app">
  <div className="utility"><span>Campus Exchange</span><span>Trusted by students • All prices in EGP</span></div>
  <header className="navigation"><button className="brand" onClick={()=>{setSelected(null);setCategory('all')}}><span className="brand-icon">✳</span> CAMPUS<span className="brand-alt">exchange</span></button><nav><a href="#discover">Browse items</a></nav><div className="nav-actions"><span className="usercircle">Y</span><button className="sell-cta" onClick={()=>startEdit(null)}>+ Sell an item</button></div></header>
  <main>
   <section className="promo"><div className="promo-copy"><span className="tag">THE CAMPUS MARKETPLACE</span><h1>Everything you need,<br/><i>right around campus.</i></h1><p>Browse little finds, big essentials and almost everything in between.</p><button onClick={()=>document.getElementById('discover')?.scrollIntoView({behavior:'smooth'})}>Explore listings <span>↗</span></button></div><div className="promo-art"><span>📚</span><span>💡</span><span>🎧</span><span>🛋️</span></div></section>
   <section className="discovery" id="discover"><div className="discover-top"><div><p className="section-kicker">CURATED FOR YOUR CAMPUS</p><h2>Find something good.</h2><p>Items listed by people around you.</p></div><div className="discover-right"><label className="search"><span>⌕</span><input aria-label="Search listings" placeholder="Search by title, category or description" value={query} onChange={e=>setQuery(e.target.value)}/>{query&&<button type="button" className="search-clear" aria-label="Clear search" onClick={()=>setQuery('')}>×</button>}</label><div className="filter-wrap" ref={filterRef}><button type="button" className={activeFilters?'filter-toggle on':'filter-toggle'} aria-expanded={showFilters} aria-label="Filters" onClick={()=>setShowFilters(v=>!v)}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 5h18l-7 8.5V19l-4 2v-7.5z"/></svg>Filters{activeFilters>0&&<span className="filter-count">{activeFilters}</span>}</button>{showFilters&&<div className="filter-pop" role="dialog" aria-label="Filter listings"><div className="filter-bar"><label><span>Category</span><select value={category} onChange={e=>setCategory(e.target.value)}>{categories.map(c=><option value={c} key={c}>{c==='all'?'All':cap(c)}</option>)}</select></label><label><span>Condition</span><select value={condition} onChange={e=>setCondition(e.target.value)}><option value="all">All</option>{conditions.map(c=><option value={c} key={c}>{cap(c)}</option>)}</select></label><label><span>Min price (EGP)</span><input type="number" min="0" value={minPrice} onChange={e=>setMinPrice(e.target.value)} placeholder="0"/></label><label><span>Max price (EGP)</span><input type="number" min="0" value={maxPrice} onChange={e=>setMaxPrice(e.target.value)} placeholder="Any"/></label><button type="button" onClick={clearFilters}>Clear filters</button></div></div>}</div><label className="sort"><span>Sort</span><select value={sort} onChange={e=>setSort(e.target.value)}><option value="featured">Featured</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option></select></label></div></div>
    <div className="category-row">{categories.map(c=><button key={c} onClick={()=>setCategory(c)} className={category===c?'on':''}>{c==='all'?'All items':cap(c)}</button>)}</div>
    {notice&&<p className="notice" role="status">{notice} <button onClick={()=>setNotice('')}>×</button></p>}
    <div className="listing-grid">{listing.map(item=><article className="product" key={item.id}><button className="photo" onClick={()=>setSelected(item.id)}><span className="stamp">{cap(item.condition)}</span><ListingImage src={item.photos?.[0]} alt={item.title} emoji={item.emoji} className="listing-img" /><span className="category-caption">{cap(item.category)}</span></button><div className="prod-details"><div className="prod-topline"><span className="muted">{item.category}</span><span className={item.status==='sold'?'soldstatus':'instock'}>{item.status.toUpperCase()}</span></div><h3>{item.title}</h3><p>{item.description}</p><div className="costline"><strong>EGP {item.price.toLocaleString()}</strong><span>{item.condition}</span></div><button className="details-button" onClick={()=>setSelected(item.id)}>View item <span>↗</span></button><div className="card-actions"><label className="compare-check"><input type="checkbox" checked={compare.includes(item.id)} onChange={()=>toggleCompare(item.id)}/> Compare</label>{item.owner==='you'&&<><button onClick={()=>startEdit(item)}>Edit</button><button className="danger" onClick={()=>remove(item)}>Delete</button></>}</div></div></article>)}{listing.length===0&&<p className="noresults">No listings match your search. <button onClick={clearFilters}>Clear filters</button></p>}</div>
   </section>
   {compare.length>0&&<div className="compare-bar" role="status"><span>{compare.length===1?'Select one more item to compare':'2 items selected'}</span><button onClick={()=>setCompare([])}>Clear</button><button className="sell-cta" disabled={compare.length<2} onClick={()=>setShowCompare(true)}>Compare items</button></div>}
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
       ? <div className="owner-actions"><button className="sell-cta" onClick={()=>startEdit(item)}>Edit your listing</button><button className="danger" onClick={()=>remove(item)}>Delete listing</button></div>
       : item.status==='sold'
         ? <p className="fineprint">This item is marked as sold.</p>
         : <a className="sell-cta contact-seller" href={`mailto:${item.sellerEmail}?subject=${subject}&body=${body}`}>✉ Contact seller</a>}
    </section>
   </div>;
  })()}
  {showCompare&&compare.length===2&&(()=>{const pair=compare.map(id=>items.find(x=>x.id===id)).filter(Boolean);if(pair.length<2)return null;const cheaper=pair[0].price===pair[1].price?null:pair[0].price<pair[1].price?0:1;const rows=[['Price',x=>`EGP ${x.price.toLocaleString()}`],['Category',x=>cap(x.category)],['Condition',x=>cap(x.condition)],['Status',x=>cap(x.status)],['Seller',x=>x.seller],['Pickup',x=>x.pickup||'Arrange directly with seller'],['Description',x=>x.description||'No description supplied.']];
   return <div className="overlay" onMouseDown={e=>e.target===e.currentTarget&&setShowCompare(false)}><section className="detail-panel compare-panel" role="dialog" aria-modal="true" aria-label="Compare items"><button className="close" aria-label="Close comparison" onClick={()=>setShowCompare(false)}>×</button><p className="section-kicker">COMPARE</p><h2>Side by side</h2><table className="compare-table"><thead><tr><th></th>{pair.map((x,i)=><th key={x.id}><div className="compare-img"><ListingImage src={x.photos?.[0]} alt={x.title} emoji={x.emoji} className="detail-img"/></div>{x.title}{cheaper===i&&<span className="cheaper">Cheaper</span>}</th>)}</tr></thead><tbody>{rows.map(([label,get])=><tr key={label}><th>{label}</th>{pair.map(x=><td key={x.id}>{get(x)}</td>)}</tr>)}<tr><th></th>{pair.map(x=><td key={x.id}><button className="details-button" onClick={()=>{setShowCompare(false);setSelected(x.id);}}>View item <span>↗</span></button></td>)}</tr></tbody></table></section></div>;})()}
  {editor&&<div className="overlay"><section className="sell-modal" role="dialog" aria-modal="true" aria-label={editor.id?'Edit item':'Sell item'}><div className="modal-head"><div><p className="section-kicker">CAMPUS EXCHANGE</p><h2>{editor.id?'Edit your listing':'Sell an item'}</h2><p>Add the details and we'll take care of the rest. Fields marked * are required.</p></div><button className="close" aria-label="Close form" onClick={closeEditor}>×</button></div><form onSubmit={submit}><div className="field-grid"><label><span>Item title *</span><input value={editor.form.title} onChange={e=>setEditor(s=>({...s,form:{...s.form,title:e.target.value}}))} placeholder="What are you selling?"/>{errs.title&&<small className="field-error">{errs.title}</small>}</label><label><span>Price (EGP) *</span><input type="number" min="0" step="0.01" value={editor.form.price} onChange={e=>setEditor(s=>({...s,form:{...s.form,price:e.target.value}}))} placeholder="e.g. 250"/>{errs.price&&<small className="field-error">{errs.price}</small>}</label><label><span>Category *</span><select value={editor.form.category} onChange={e=>setEditor(s=>({...s,form:{...s.form,category:e.target.value}}))}><option value="">Select</option>{categories.slice(1).map(c=><option value={c} key={c}>{cap(c)}</option>)}</select>{errs.category&&<small className="field-error">{errs.category}</small>}</label><label><span>Condition *</span><select value={editor.form.condition} onChange={e=>setEditor(s=>({...s,form:{...s.form,condition:e.target.value}}))}><option value="">Select</option>{conditions.map(c=><option value={c} key={c}>{cap(c)}</option>)}</select>{errs.condition&&<small className="field-error">{errs.condition}</small>}</label><label className="wide"><span>Description</span><textarea value={editor.form.description} onChange={e=>setEditor(s=>({...s,form:{...s.form,description:e.target.value}}))} placeholder="Description" rows="5"/></label><label className="wide"><span>Pickup / meetup location</span><input value={editor.form.pickup} onChange={e=>setEditor(s=>({...s,form:{...s.form,pickup:e.target.value}}))} placeholder="e.g. Library entrance or arrange on campus" /></label><label className="wide"><span>Seller contact email</span><input value={currentUser.email} readOnly aria-readonly="true" className="readonly-input"/><small className="email-helper">Taken from your registered account, so buyers can contact you about this item.</small></label>{editor.id&&<label><span>Status</span><select value={editor.form.status} onChange={e=>setEditor(s=>({...s,form:{...s.form,status:e.target.value}}))}><option value="active">Active</option><option value="sold">Sold</option></select></label>}</div>{Object.keys(errs).length>0&&<p className="alert" role="alert">Please complete the required fields: {Object.keys(errs).map(k=>fieldLabels[k]).join(', ')}.</p>}<div className="modal-foot"><button type="button" onClick={closeEditor}>Cancel</button><button className="sell-cta" type="submit">{editor.id?'Save changes':'Publish item'}</button></div></form></section></div>}
 </div>;
}
