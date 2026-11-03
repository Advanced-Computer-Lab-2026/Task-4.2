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
const fieldLabels = {title:'Item title', price:'Price', category:'Category', condition:'Condition', status:'Status'};
// Every problem at once, keyed by field, so the form can mark each one.
function findErrors(form){
 const e={};
 if(!form.title.trim())e.title='Enter an item title.';
 if(form.price.trim()==='' || !Number.isFinite(Number(form.price)))e.price="Enter a price (use 0 if it's free).";
 else if(Number(form.price)<0)e.price="Price can't be negative.";
 if(!categories.slice(1).includes(form.category))e.category='Choose a category.';
 if(!conditions.includes(form.condition))e.condition="Choose the item's condition.";
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
 const [errors,setErrors] = useState({});
 const [tried,setTried] = useState(false); // errors show only after the first publish attempt
 const [activePhoto,setActivePhoto] = useState(0);
 const [notice,setNotice] = useState('');
 useEffect(()=>localStorage.setItem(KEY,JSON.stringify(items)),[items]);
 useEffect(()=>setActivePhoto(0),[selected]);
 const [maxPrice,setMaxPrice] = useState('');
 const [availableOnly,setAvailableOnly] = useState(false);
 const priceCap = maxPrice.trim()!=='' && Number.isFinite(Number(maxPrice)) ? Number(maxPrice) : null;
 const filtersActive = query!=='' || category!=='all' || priceCap!==null || availableOnly;
 const listing = useMemo(()=>{let a=items.filter(x=>(category==='all'||x.category===category)&&(priceCap===null||x.price<=priceCap)&&(!availableOnly||x.status!=='sold')&&`${x.title} ${x.category} ${x.description}`.toLowerCase().includes(query.toLowerCase()));if(sort==='low')a.sort((a,b)=>a.price-b.price);if(sort==='high')a.sort((a,b)=>b.price-a.price);a.sort((a,b)=>(a.status==='sold')-(b.status==='sold'));return a;},[items,category,query,sort,priceCap,availableOnly]); // sold items always last; sort is stable
 function clearFilters(){setQuery('');setCategory('all');setMaxPrice('');setAvailableOnly(false);}
 function startEdit(item){if(item&&item.owner!=='you')return;setErrors({});setTried(false);setEditor({id:item?.id||null,form:item?{title:item.title,price:String(item.price),category:item.category,condition:item.condition,description:item.description,pickup:item.pickup || '',status:item.status}:{...emptyForm}});}
 function setField(name,value){const form={...editor.form,[name]:value};setEditor({...editor,form});if(tried)setErrors(findErrors(form));}
 function focusField(name){document.getElementById(`f-${name}`)?.focus();}
 function submit(event){event.preventDefault();const f=editor.form;const errs=findErrors(f);if(Object.keys(errs).length){setErrors(errs);setTried(true);focusField(Object.keys(errs)[0]);return;}const original=editor.id?items.find(x=>x.id===editor.id):null;const next={...f, title:f.title.trim(),price:Number(f.price),description:f.description.trim(),pickup:f.pickup.trim(),photos:original?.photos || [],emoji:original?.emoji || '📦',owner:'you',seller:currentUser.name,sellerEmail:currentUser.email};
 if(editor.id){setItems(items.map(x=>x.id===editor.id?{...x,...next}:x));setNotice('Changes saved.');}else{setItems([{...next,id:`m-${Date.now()}`,status:'active'},...items]);setNotice('Item listed.');}setEditor(null);setSelected(null);}
 function reset(){setItems(seed);setSelected(null);setEditor(null);clearFilters();setSort('featured');setNotice('Example items restored.');}
 return <div className="market-app">
  <header className="navigation"><button className="brand" aria-label="Campus Exchange home" onClick={()=>{setSelected(null);clearFilters();window.scrollTo({top:0,behavior:'smooth'});}}><span className="brand-icon" aria-hidden="true">✳</span> CAMPUS<span className="brand-alt">exchange</span></button><div className="nav-actions"><span className="usercircle">Y</span><button className="sell-cta" onClick={()=>startEdit(null)}>+ Sell an item</button></div></header>
  <main>
   <section className="welcome"><div><span className="tag">THE CAMPUS MARKETPLACE</span><h1>Second-hand finds from students around campus.</h1><p>Compare prices and condition, then meet the seller on campus. All prices in EGP.</p></div></section>
   <section className="discovery" id="discover"><div className="discover-top"><div><p className="section-kicker">CURATED FOR YOUR CAMPUS</p><h2>Find something good.</h2><p>Items listed by people around you.</p></div><div className="discover-right"><label className="search"><span>⌕</span><input aria-label="Search listings" placeholder="Search listings" value={query} onChange={e=>setQuery(e.target.value)}/></label><label className="sort"><span>Sort</span><select value={sort} onChange={e=>setSort(e.target.value)}><option value="featured">Featured</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option></select></label><label className="sort price-cap"><span>Max EGP</span><input type="number" min="0" inputMode="numeric" placeholder="Any" value={maxPrice} onChange={e=>setMaxPrice(e.target.value)}/></label><label className="sort available-toggle"><input type="checkbox" checked={availableOnly} onChange={e=>setAvailableOnly(e.target.checked)}/><span>Available only</span></label></div></div>
    <div className="category-row">{categories.map(c=><button key={c} onClick={()=>setCategory(c)} className={category===c?'on':''}>{c==='all'?'All items':cap(c)}</button>)}</div>
    {notice&&<p className="notice" role="status">{notice} <button onClick={()=>setNotice('')}>×</button></p>}
    <div className="results-bar"><p aria-live="polite">{filtersActive?`Showing ${listing.length} of ${items.length} items`:`${items.length} items`}</p>{filtersActive&&<button onClick={clearFilters}>Clear filters</button>}</div>
    <div className="listing-grid">{listing.map(item=><article className={item.status==='sold'?'product is-sold':'product'} key={item.id}><button className="photo" aria-label={`View ${item.title}${item.owner==='you'?' (your listing)':''}`} onClick={()=>setSelected(item.id)}>{item.status==='sold'&&<span className="stamp">Sold</span>}{item.owner==='you'&&<span className="own-tag">Your listing</span>}<ListingImage src={item.photos?.[0]} alt={item.title} emoji={item.emoji} className="listing-img" /></button><div className="prod-details"><h3>{item.title}</h3><strong className="card-price">{item.price===0?'Free':`EGP ${item.price.toLocaleString()}`}</strong><p className="card-meta">{cap(item.condition)} · {cap(item.category)}</p><p className="card-pickup" title={item.pickup||undefined}><span aria-hidden="true">📍</span> {item.pickup||'Arrange with seller'}</p><button className="details-button" onClick={()=>setSelected(item.id)}>View item <span aria-hidden="true">→</span></button></div></article>)}{listing.length===0&&<div className="noresults">{filtersActive?<><p><strong>No listings match these filters.</strong></p><p>Try a higher max price or clear the filters.</p><button onClick={clearFilters}>Clear filters</button></>:<p>No listings yet. Use Sell an item to post the first one.</p>}</div>}</div>
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
  {editor&&<div className="overlay" onMouseDown={e=>e.target===e.currentTarget&&setEditor(null)}><section className="sell-modal" role="dialog" aria-modal="true" aria-label={editor.id?'Edit item':'Sell item'}><div className="modal-head"><div><p className="section-kicker">CAMPUS EXCHANGE</p><h2>{editor.id?'Edit your listing':'Sell an item'}</h2><p>Add the details and we'll take care of the rest. Fields marked * are required.</p></div><button className="close" aria-label="Close form" onClick={()=>setEditor(null)}>×</button></div><form onSubmit={submit} noValidate>{tried&&Object.keys(errors).length>0&&<div className="alert error-summary" role="alert"><strong>{Object.keys(errors).length===1?'1 thing needs':`${Object.keys(errors).length} things need`} fixing before you can {editor.id?'save':'publish'}:</strong><ul>{Object.entries(errors).map(([name,msg])=><li key={name}><a href={`#f-${name}`} onClick={e=>{e.preventDefault();focusField(name);}}>{fieldLabels[name]}: {msg}</a></li>)}</ul></div>}<div className="field-grid"><label><span>Item title *</span><input id="f-title" aria-invalid={!!errors.title} value={editor.form.title} onChange={e=>setField('title',e.target.value)} placeholder="What are you selling?"/>{errors.title&&<small className="field-error">{errors.title}</small>}</label><label><span>Price (EGP) *</span><input id="f-price" aria-invalid={!!errors.price} type="number" min="0" step="0.01" value={editor.form.price} onChange={e=>setField('price',e.target.value)} placeholder="Price"/>{errors.price&&<small className="field-error">{errors.price}</small>}</label><label><span>Category *</span><select id="f-category" aria-invalid={!!errors.category} value={editor.form.category} onChange={e=>setField('category',e.target.value)}><option value="">Select</option>{categories.slice(1).map(c=><option value={c} key={c}>{cap(c)}</option>)}</select>{errors.category&&<small className="field-error">{errors.category}</small>}</label><label><span>Condition *</span><select id="f-condition" aria-invalid={!!errors.condition} value={editor.form.condition} onChange={e=>setField('condition',e.target.value)}><option value="">Select</option>{conditions.map(c=><option value={c} key={c}>{cap(c)}</option>)}</select>{errors.condition&&<small className="field-error">{errors.condition}</small>}</label><label className="wide"><span>Description</span><textarea value={editor.form.description} onChange={e=>setField('description',e.target.value)} placeholder="Description" rows="5"/></label><label className="wide"><span>Pickup / meetup location</span><input value={editor.form.pickup} onChange={e=>setField('pickup',e.target.value)} placeholder="e.g. Library entrance or arrange on campus" /></label><label className="wide"><span>Seller contact email</span><input value={currentUser.email} readOnly aria-readonly="true" className="readonly-input"/><small className="email-helper">Taken from your registered account, so buyers can contact you about this item.</small></label>{editor.id&&<label><span>Status</span><select id="f-status" aria-invalid={!!errors.status} value={editor.form.status} onChange={e=>setField('status',e.target.value)}><option value="active">Active</option><option value="sold">Sold</option></select>{errors.status&&<small className="field-error">{errors.status}</small>}</label>}</div><div className="modal-foot"><button type="button" onClick={()=>setEditor(null)}>Cancel</button><button className="sell-cta" type="submit">{editor.id?'Save changes':'Publish item'}</button></div></form></section></div>}
 </div>;
}
