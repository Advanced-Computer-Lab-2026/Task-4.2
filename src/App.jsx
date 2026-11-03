import React, { useEffect, useMemo, useState } from 'react';

const KEY = 'acl-marketplace-v3';
const FAVORITES_KEY = 'acl-marketplace-favorites-v1';
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
function savedFavorites(){try {const value=JSON.parse(localStorage.getItem(FAVORITES_KEY));return Array.isArray(value)?value:[];}catch{return [];}}
const cap = s => s==='like-new'?'Like new':(s||'').replace(/\b\w/g,m=>m.toUpperCase());
function formErrors(form){
 const errors={};
 if(!form.title.trim())errors.title='Add a clear item title.';
 if(form.price.trim()==='' || !Number.isFinite(Number(form.price)) || Number(form.price)<0)errors.price='Enter a price of zero or more.';
 if(!categories.slice(1).includes(form.category))errors.category='Choose a category.';
 if(!conditions.includes(form.condition))errors.condition='Choose a condition.';
 if(!['active','sold'].includes(form.status))errors.status='Choose a valid status.';
 return errors;
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
 const [view,setView] = useState('browse');
 const [favoriteIds,setFavoriteIds] = useState(savedFavorites);
 const [query,setQuery] = useState('');
 const [category,setCategory] = useState('all');
 const [condition,setCondition] = useState('all');
 const [availability,setAvailability] = useState('active');
 const [maxPrice,setMaxPrice] = useState('');
 const [sort,setSort] = useState('featured');
 const [selected,setSelected] = useState(null);
 const [editor,setEditor] = useState(null); // null or {id,form}
 const [errors,setErrors] = useState({});
 const [activePhoto,setActivePhoto] = useState(0);
 const [notice,setNotice] = useState('');
 useEffect(()=>localStorage.setItem(KEY,JSON.stringify(items)),[items]);
 useEffect(()=>localStorage.setItem(FAVORITES_KEY,JSON.stringify(favoriteIds)),[favoriteIds]);
 useEffect(()=>setActivePhoto(0),[selected]);
 useEffect(()=>{
  const modalOpen=Boolean(selected||editor);
  if(!modalOpen)return;
  const previous=document.body.style.overflow;
  document.body.style.overflow='hidden';
  const closeOnEscape=event=>{if(event.key==='Escape'){setSelected(null);setEditor(null);}};
  window.addEventListener('keydown',closeOnEscape);
  return ()=>{document.body.style.overflow=previous;window.removeEventListener('keydown',closeOnEscape);};
 },[selected,editor]);
 const listing = useMemo(()=>{let a=items.filter(x=>(view==='browse'||(view==='mine'&&x.owner==='you')||(view==='favorites'&&favoriteIds.includes(x.id)))&&(category==='all'||x.category===category)&&(condition==='all'||x.condition===condition)&&(availability==='all'||x.status===availability)&&(maxPrice===''||x.price<=Number(maxPrice))&&`${x.title} ${x.category} ${x.description} ${x.pickup}`.toLowerCase().includes(query.trim().toLowerCase()));if(sort==='low')a.sort((a,b)=>a.price-b.price);if(sort==='high')a.sort((a,b)=>b.price-a.price);if(sort==='newest')a.reverse();return a;},[items,view,favoriteIds,category,condition,availability,maxPrice,query,sort]);
 const filterCount=[category!=='all',condition!=='all',availability!=='active',maxPrice!=='',query.trim()!==''].filter(Boolean).length;
 function startEdit(item){if(item&&item.owner!=='you')return;setErrors({});setEditor({id:item?.id||null,form:item?{title:item.title,price:String(item.price),category:item.category,condition:item.condition,description:item.description,pickup:item.pickup || '',status:item.status}:{...emptyForm}});}
 function updateForm(field,value){setEditor(s=>({...s,form:{...s.form,[field]:value}}));setErrors(s=>({...s,[field]:undefined}));}
 function submit(event){event.preventDefault();const f=editor.form;const nextErrors=formErrors(f);if(Object.keys(nextErrors).length){setErrors(nextErrors);return;}const original=editor.id?items.find(x=>x.id===editor.id):null;const next={...f, title:f.title.trim(),price:Number(f.price),description:f.description.trim(),pickup:f.pickup.trim(),photos:original?.photos || [],emoji:original?.emoji || '📦',owner:'you',seller:currentUser.name,sellerEmail:currentUser.email};
 if(editor.id){setItems(items.map(x=>x.id===editor.id?{...x,...next}:x));setNotice('Changes saved.');}else{setItems([{...next,id:`m-${Date.now()}`,status:'active'},...items]);setNotice('Item listed.');}setEditor(null);setSelected(null);}
 function clearFilters(){setQuery('');setCategory('all');setCondition('all');setAvailability('active');setMaxPrice('');setSort('featured');}
 function selectView(next){setView(next);setAvailability(next==='browse'?'active':'all');document.getElementById('discover')?.scrollIntoView({behavior:'smooth'});}
 function toggleFavorite(id){setFavoriteIds(current=>current.includes(id)?current.filter(value=>value!==id):[...current,id]);}
 function reset(){if(!window.confirm('Reset your listings, favorites and restore the original example items?'))return;setItems(seed);setFavoriteIds([]);setView('browse');setSelected(null);setEditor(null);clearFilters();setNotice('Example items restored.');}
 return <div className="market-app">
  <div className="utility"><span>Campus Exchange</span><span>Trusted by students • All prices in EGP</span></div>
  <header className="navigation"><button className="brand" onClick={()=>{setSelected(null);setView('browse');clearFilters()}} aria-label="Campus Exchange home"><span className="brand-icon">✳</span> CAMPUS<span className="brand-alt">exchange</span></button><nav aria-label="Main navigation"><button className={view==='browse'?'nav-current':''} onClick={()=>selectView('browse')}>Browse items</button><button className={view==='mine'?'nav-current':''} onClick={()=>selectView('mine')}>My listings</button><button className={view==='favorites'?'nav-current':''} onClick={()=>selectView('favorites')}>Favorites{favoriteIds.length>0?` (${favoriteIds.length})`:''}</button></nav><div className="nav-actions"><span className="usercircle" title="Signed in as You" aria-label="Signed in as You">Y</span><button className="sell-cta" onClick={()=>startEdit(null)}>+ Sell an item</button></div></header>
  <main>
   <section className="promo"><div className="promo-copy"><span className="tag">THE CAMPUS MARKETPLACE</span><h1>Everything you need,<br/><i>right around campus.</i></h1><p>Browse trusted student listings, save your favorites and arrange pickup on campus.</p><div className="hero-actions"><button onClick={()=>selectView('browse')}>Explore listings <span>↗</span></button><button className="hero-secondary" onClick={()=>startEdit(null)}>+ Add item</button></div><div className="trust-row" aria-label="Marketplace highlights"><span><strong>{items.filter(x=>x.status==='active').length}</strong> active items</span><span><strong>Campus</strong> pickup</span><span><strong>Student</strong> sellers</span></div></div><div className="promo-art" aria-hidden="true"><span>📚</span><span>💡</span><span>🎧</span><span>🛋️</span></div></section>
   <section className="discovery" id="discover"><div className="discover-top"><div><p className="section-kicker">CURATED FOR YOUR CAMPUS</p><h2>Find something good.</h2><p>Items listed by people around you.</p></div><div className="discover-right"><label className="search"><span>⌕</span><input aria-label="Search listings" placeholder="Search items or pickup spots" value={query} onChange={e=>setQuery(e.target.value)}/></label><label className="sort"><span>Sort</span><select value={sort} onChange={e=>setSort(e.target.value)}><option value="featured">Featured</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option><option value="newest">Recently added</option></select></label></div></div>
    <div className="view-tabs" aria-label="Marketplace views"><button className={view==='browse'?'on':''} onClick={()=>selectView('browse')}><span aria-hidden="true">▦</span> Browse <strong>{items.filter(x=>x.status==='active').length}</strong></button><button className={view==='mine'?'on':''} onClick={()=>selectView('mine')}><span aria-hidden="true">▣</span> My listings <strong>{items.filter(x=>x.owner==='you').length}</strong></button><button className={view==='favorites'?'on':''} onClick={()=>selectView('favorites')}><span aria-hidden="true">♥</span> Favorites <strong>{favoriteIds.length}</strong></button></div>
    <div className="category-row">{categories.map(c=><button key={c} onClick={()=>setCategory(c)} className={category===c?'on':''}>{c==='all'?'All items':cap(c)}</button>)}</div>
    <div className="filter-bar" aria-label="Listing filters"><label><span>Condition</span><select value={condition} onChange={e=>setCondition(e.target.value)}><option value="all">Any condition</option>{conditions.map(c=><option value={c} key={c}>{cap(c)}</option>)}</select></label><label><span>Availability</span><select value={availability} onChange={e=>setAvailability(e.target.value)}><option value="active">Available now</option><option value="all">All listings</option><option value="sold">Sold</option></select></label><label><span>Maximum price</span><div className="price-input"><span>EGP</span><input type="number" min="0" step="50" inputMode="numeric" value={maxPrice} onChange={e=>setMaxPrice(e.target.value)} placeholder="Any price" aria-label="Maximum price in EGP"/></div></label><button className="clear-filters" onClick={clearFilters} disabled={!filterCount}>Clear filters{filterCount>0?` (${filterCount})`:''}</button></div>
    {notice&&<p className="notice" role="status">{notice} <button onClick={()=>setNotice('')} aria-label="Dismiss message">×</button></p>}
    <div className="results-heading"><p><strong>{listing.length}</strong> {listing.length===1?'item':'items'} found</p></div>
    <div className="listing-grid">{listing.map(item=>{const favorite=favoriteIds.includes(item.id);return <article className={`product ${item.status==='sold'?'is-sold':''}`} key={item.id}><button className="photo" onClick={()=>setSelected(item.id)} aria-label={`View ${item.title}`}><span className="stamp">{cap(item.condition)}</span>{item.owner==='you'&&<span className="owner-badge">Your listing</span>}<ListingImage src={item.photos?.[0]} alt={item.title} emoji={item.emoji} className="listing-img" /><span className="category-caption">{cap(item.category)}</span></button><div className="prod-details"><div className="prod-topline"><span className="muted">{cap(item.category)}</span><span className={item.status==='sold'?'soldstatus':'instock'}>{item.status==='sold'?'Sold':'Available'}</span></div><h3>{item.title}</h3><p>{item.description}</p><div className="pickup-line" title={item.pickup}>⌖ {item.pickup||'Arrange with seller'}</div><div className="costline"><strong>EGP {item.price.toLocaleString()}</strong><span>{cap(item.condition)}</span></div><div className="card-actions"><button className="details-button" onClick={()=>setSelected(item.id)}>View item <span>↗</span></button><button className={`favorite-button ${favorite?'selected':''}`} onClick={()=>toggleFavorite(item.id)} aria-pressed={favorite} aria-label={favorite?`Remove ${item.title} from favorites`:`Save ${item.title} to favorites`} title={favorite?'Remove from favorites':'Save to favorites'}>{favorite?'♥':'♡'}</button></div></div></article>})}{listing.length===0&&<div className="noresults"><span aria-hidden="true">{view==='favorites'?'♡':view==='mine'?'▣':'🔎'}</span><h3>{view==='favorites'?'No favorites yet':view==='mine'?'No listings in this view':'No matching listings'}</h3><p>{view==='favorites'?'Save items with the heart button and they will appear here.':view==='mine'?'Add an item or adjust the filters to see your listings.':'Try a broader search or remove one of your filters.'}</p><button onClick={view==='browse'?clearFilters:()=>selectView('browse')}>{view==='browse'?'Show all available items':'Browse marketplace'}</button></div>}</div>
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
     <div className="detail-actions"><button className={`favorite-button labeled ${favoriteIds.includes(item.id)?'selected':''}`} onClick={()=>toggleFavorite(item.id)} aria-pressed={favoriteIds.includes(item.id)}>{favoriteIds.includes(item.id)?'♥ Saved':'♡ Save'}</button>
     {item.owner==='you'
       ? <button className="sell-cta" onClick={()=>startEdit(item)}>Edit your listing</button>
       : item.status==='sold'
         ? <p className="fineprint">This item is marked as sold.</p>
         : <a className="sell-cta contact-seller" href={`mailto:${item.sellerEmail}?subject=${subject}&body=${body}`}>✉ Contact seller</a>}</div>
    </section>
   </div>;
  })()}
  {editor&&<div className="overlay" onMouseDown={e=>e.target===e.currentTarget&&setEditor(null)}><section className="sell-modal" role="dialog" aria-modal="true" aria-label={editor.id?'Edit item':'Sell item'}><div className="modal-head"><div><p className="section-kicker">CAMPUS EXCHANGE</p><h2>{editor.id?'Edit your listing':'Sell an item'}</h2><p>Add honest details so another student can decide with confidence.</p></div><button className="close" aria-label="Close listing form" onClick={()=>setEditor(null)}>×</button></div><form onSubmit={submit} noValidate><div className="field-grid"><label><span>Item title *</span><input value={editor.form.title} onChange={e=>updateForm('title',e.target.value)} placeholder="e.g. Calculus II textbook" aria-invalid={Boolean(errors.title)} aria-describedby={errors.title?'title-error':undefined}/>{errors.title&&<small className="field-error" id="title-error">{errors.title}</small>}</label><label><span>Price (EGP) *</span><input type="number" min="0" step="0.01" value={editor.form.price} onChange={e=>updateForm('price',e.target.value)} placeholder="0.00" aria-invalid={Boolean(errors.price)} aria-describedby={errors.price?'price-error':undefined}/>{errors.price&&<small className="field-error" id="price-error">{errors.price}</small>}</label><label><span>Category *</span><select value={editor.form.category} onChange={e=>updateForm('category',e.target.value)} aria-invalid={Boolean(errors.category)} aria-describedby={errors.category?'category-error':undefined}><option value="">Select a category</option>{categories.slice(1).map(c=><option value={c} key={c}>{cap(c)}</option>)}</select>{errors.category&&<small className="field-error" id="category-error">{errors.category}</small>}</label><label><span>Condition *</span><select value={editor.form.condition} onChange={e=>updateForm('condition',e.target.value)} aria-invalid={Boolean(errors.condition)} aria-describedby={errors.condition?'condition-error':undefined}><option value="">Select a condition</option>{conditions.map(c=><option value={c} key={c}>{cap(c)}</option>)}</select>{errors.condition&&<small className="field-error" id="condition-error">{errors.condition}</small>}</label><label className="wide"><span>Description</span><textarea value={editor.form.description} onChange={e=>updateForm('description',e.target.value)} placeholder="Mention wear, included accessories and anything a buyer should know." rows="5"/><small className="email-helper">A specific description helps buyers make a confident decision.</small></label><label className="wide"><span>Pickup / meetup location</span><input value={editor.form.pickup} onChange={e=>updateForm('pickup',e.target.value)} placeholder="e.g. Library entrance, weekdays after 1 PM" /></label><label className="wide"><span>Seller contact email</span><input value={currentUser.email} readOnly aria-readonly="true" className="readonly-input"/><small className="email-helper">Taken from your demo account, so buyers can contact you about this item.</small></label>{editor.id&&<label><span>Status</span><select value={editor.form.status} onChange={e=>updateForm('status',e.target.value)}><option value="active">Active</option><option value="sold">Sold</option></select></label>}</div>{Object.keys(errors).length>0&&<p className="alert" role="alert">Review the highlighted fields before publishing.</p>}<div className="modal-foot"><button type="button" onClick={()=>setEditor(null)}>Cancel</button><button className="sell-cta" type="submit">{editor.id?'Save changes':'Publish item'}</button></div></form></section></div>}
 </div>;
}
