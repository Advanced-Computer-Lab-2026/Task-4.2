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
const sortLabels = {featured:'Featured', low:'Price: low to high', high:'Price: high to low'};
// Closes a popover on Escape or on a mousedown outside the element matching `selector`.
function useDismiss(open, close, selector){useEffect(()=>{if(!open)return;const h=e=>{if(e.type==='keydown'?e.key==='Escape':!e.target.closest(selector))close();};document.addEventListener('mousedown',h);document.addEventListener('keydown',h);return()=>{document.removeEventListener('mousedown',h);document.removeEventListener('keydown',h);};},[open]);}
const noFilters ={available:false, conditions:[], min:'', max:''};
const emptyForm ={title:'', price:'', category:'', condition:'', description:'', pickup:'', status:'active'};
function highlight(text, query){const q=query.trim();const i=q?text.toLowerCase().indexOf(q.toLowerCase()):-1;return i<0?text:<>{text.slice(0,i)}<mark>{text.slice(i,i+q.length)}</mark>{text.slice(i+q.length)}</>;}
const viewFromHash =() => window.location.hash==='#/my-items'?'mine':'browse';
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
 const [view,setView] = useState(viewFromHash);
 const [menuOpen,setMenuOpen] = useState(false);
 useEffect(()=>localStorage.setItem(KEY,JSON.stringify(items)),[items]);
 useEffect(()=>{const onHash=()=>{setView(viewFromHash());setMenuOpen(false);};window.addEventListener('hashchange',onHash);return()=>window.removeEventListener('hashchange',onHash);},[]);
 const scrollToResults = useRef(false);
 useEffect(()=>{document.title=view==='mine'?'My items | Campus Marketplace':'Campus Marketplace | ACL UI/UX';if(scrollToResults.current){scrollToResults.current=false;document.getElementById('discover')?.scrollIntoView({behavior:'smooth'});}else window.scrollTo(0,0);},[view]);
 useDismiss(menuOpen,()=>setMenuOpen(false),'.profile');
 const mine = useMemo(()=>items.filter(x=>x.owner==='you'),[items]);
 const [suggestOpen,setSuggestOpen] = useState(false);
 const [activeSuggestion,setActiveSuggestion] = useState(-1);
 // Title matches rank first (start of title, then start of a word, then anywhere), then category; sold items sink below active ones.
 const suggestions = useMemo(()=>{const q=query.trim().toLowerCase();if(!q)return [];const score=x=>{const t=x.title.toLowerCase();const s=t.startsWith(q)?0:t.split(/\s+/).some(w=>w.startsWith(q))?1:t.includes(q)?2:x.category.includes(q)?3:-1;return s<0?s:s+(x.status==='sold'?4:0);};return items.map(x=>[score(x),x]).filter(([s])=>s>=0).sort((a,b)=>a[0]-b[0]).slice(0,6).map(([,x])=>x);},[items,query]);
 const showSuggestions = suggestOpen && query.trim()!=='';
 function pickSuggestion(item){setSelected(item.id);setSuggestOpen(false);setActiveSuggestion(-1);}
 function onSearchKey(e){if(e.key==='Escape'){setSuggestOpen(false);return;}if(!showSuggestions||!suggestions.length)return;if(e.key==='ArrowDown'){e.preventDefault();setActiveSuggestion(i=>(i+1)%suggestions.length);}else if(e.key==='ArrowUp'){e.preventDefault();setActiveSuggestion(i=>i<=0?suggestions.length-1:i-1);}else if(e.key==='Enter'&&activeSuggestion>=0){e.preventDefault();pickSuggestion(suggestions[activeSuggestion]);}}
 function goBrowse(){if(view!=='browse')window.location.hash='/';}
 function showResults(){if(view==='browse')document.getElementById('discover')?.scrollIntoView({behavior:'smooth'});else{scrollToResults.current=true;goBrowse();}}
 useEffect(()=>setActivePhoto(0),[selected]);
 const [filters,setFilters] = useState(noFilters);
 const [filterOpen,setFilterOpen] = useState(false);
 useDismiss(filterOpen,()=>setFilterOpen(false),'.filter-dd');
 const [sortOpen,setSortOpen] = useState(false);
 useDismiss(sortOpen,()=>setSortOpen(false),'.sort-dd');
 const filterCount = (filters.available?1:0)+(filters.conditions.length?1:0)+(filters.min!==''||filters.max!==''?1:0);
 const toggleCondition = c=>setFilters(f=>({...f,conditions:f.conditions.includes(c)?f.conditions.filter(x=>x!==c):[...f.conditions,c]}));
 const listing = useMemo(()=>{const min=filters.min===''?-Infinity:Number(filters.min),max=filters.max===''?Infinity:Number(filters.max);let a=items.filter(x=>(category==='all'||x.category===category)&&`${x.title} ${x.category} ${x.description}`.toLowerCase().includes(query.toLowerCase())&&(!filters.available||x.status==='active')&&(!filters.conditions.length||filters.conditions.includes(x.condition))&&x.price>=min&&x.price<=max);if(sort==='low')a.sort((a,b)=>a.price-b.price);if(sort==='high')a.sort((a,b)=>b.price-a.price);return a;},[items,category,query,sort,filters]);
 function startEdit(item){if(item&&item.owner!=='you')return;setError('');setEditor({id:item?.id||null,form:item?{title:item.title,price:String(item.price),category:item.category,condition:item.condition,description:item.description,pickup:item.pickup || '',status:item.status}:{...emptyForm}});}
 function submit(event){event.preventDefault();const f=editor.form;const err=findError(f);if(err){setError('Unable to save item. Check the form.');return;}const original=editor.id?items.find(x=>x.id===editor.id):null;const next={...f, title:f.title.trim(),price:Number(f.price),description:f.description.trim(),pickup:f.pickup.trim(),photos:original?.photos || [],emoji:original?.emoji || '📦',owner:'you',seller:currentUser.name,sellerEmail:currentUser.email};
 if(editor.id){setItems(items.map(x=>x.id===editor.id?{...x,...next}:x));setNotice('Changes saved.');}else{setItems([{...next,id:`m-${Date.now()}`,status:'active'},...items]);setNotice('Item listed.');}setEditor(null);setSelected(null);}
 const card = item=><article className={item.status==='sold'?'product sold':'product'} key={item.id}><button className="photo" onClick={()=>setSelected(item.id)}><span className="stamp">{cap(item.condition)}</span><ListingImage src={item.photos?.[0]} alt={item.title} emoji={item.emoji} className="listing-img" />{item.status==='sold'&&<span className="sold-banner">Sold</span>}<span className="category-caption">{cap(item.category)}</span></button><div className="prod-details"><div className="prod-topline"><span className="muted">{item.category}</span><span className={item.status==='sold'?'soldstatus':'instock'}>{item.status.toUpperCase()}</span></div><h3>{item.title}</h3><p>{item.description}</p><div className="costline"><strong>EGP {item.price.toLocaleString()}</strong><span>{item.condition}</span></div><button className="details-button" onClick={()=>setSelected(item.id)}>View item <span>↗</span></button></div></article>;
 const noticeBar = notice&&<p className="notice" role="status">{notice} <button onClick={()=>setNotice('')}>×</button></p>;
 function reset(){setItems(seed);setSelected(null);setEditor(null);setQuery('');setCategory('all');setSort('featured');setFilters(noFilters);setNotice('Example items restored.');}
 return <div className="market-app">
  <div className="utility"><span>Campus Exchange</span><span>Trusted by students • All prices in EGP</span></div>
  <header className="navigation"><button className="brand" onClick={()=>{setSelected(null);setCategory('all');goBrowse();}}><span className="brand-icon">✳</span> CAMPUS<span className="brand-alt">exchange</span></button><form className="header-search" role="search" onSubmit={e=>{e.preventDefault();setSuggestOpen(false);showResults();}}><span aria-hidden="true">⌕</span><input type="search" role="combobox" autoComplete="off" aria-label="Search listings" aria-autocomplete="list" aria-controls="search-suggestions" aria-expanded={showSuggestions} aria-activedescendant={showSuggestions&&activeSuggestion>=0?`suggestion-${suggestions[activeSuggestion]?.id}`:undefined} placeholder="Search textbooks, electronics, furniture…" value={query} onFocus={()=>setSuggestOpen(true)} onBlur={()=>setSuggestOpen(false)} onKeyDown={onSearchKey} onChange={e=>{setQuery(e.target.value);setSuggestOpen(true);setActiveSuggestion(-1);if(view!=='browse')showResults();}}/>
   {showSuggestions&&<div className="suggestions" onMouseDown={e=>e.preventDefault()}><ul id="search-suggestions" role="listbox" aria-label="Matching items">{suggestions.map((x,i)=><li key={x.id} id={`suggestion-${x.id}`} role="option" aria-selected={i===activeSuggestion} className={i===activeSuggestion?'active':''} onMouseEnter={()=>setActiveSuggestion(i)} onClick={()=>pickSuggestion(x)}><span className="suggestion-thumb"><ListingImage src={x.photos?.[0]} alt="" emoji={x.emoji} className="suggestion-img"/></span><span className="suggestion-text"><strong>{highlight(x.title,query)}</strong><small>{cap(x.category)} · {cap(x.condition)}</small></span>{x.status==='sold'&&<span className="suggestion-sold">Sold</span>}</li>)}</ul>{suggestions.length?<p className="suggestion-hint">↑↓ to choose · Enter to open · or press Enter to see all results</p>:<p className="suggestion-empty">No items match “{query.trim()}”</p>}</div>}
  </form><div className="nav-actions"><div className={menuOpen?'profile open':'profile'}><button className="usercircle" aria-label="Account menu" aria-haspopup="menu" aria-expanded={menuOpen} onClick={()=>setMenuOpen(o=>!o)}>Y</button><div className="profile-menu" role="menu"><p className="profile-name">{currentUser.name}<small>{currentUser.email}</small></p><a role="menuitem" href="#/my-items" className={view==='mine'?'current':''} onClick={()=>setMenuOpen(false)}>My items <span>{mine.length}</span></a><button type="button" role="menuitem" onClick={()=>{setMenuOpen(false);startEdit(null);}}>+ Sell an item</button></div></div></div></header>
  <main>
   {view==='mine'?<section className="discovery my-items"><a className="back-link" href="#/"><span aria-hidden="true">←</span> Back to browsing</a><div className="discover-top"><div><p className="section-kicker">YOUR ACCOUNT</p><h1>My items</h1><p>{mine.length} {mine.length===1?'listing':'listings'} · {mine.filter(x=>x.status==='active').length} active · {mine.filter(x=>x.status==='sold').length} sold</p></div></div>
    {noticeBar}
    <div className="listing-grid">{mine.map(card)}{mine.length===0&&<p className="noresults">You haven't listed any items yet.</p>}</div>
   </section>:<>
   <section className="promo"><div className="promo-copy"><span className="tag">THE CAMPUS MARKETPLACE</span><h1>Everything you need,<br/><i>right around campus.</i></h1><p>Browse little finds, big essentials and almost everything in between.</p><button onClick={()=>document.getElementById('discover')?.scrollIntoView({behavior:'smooth'})}>Explore listings <span>↗</span></button></div><div className="promo-art"><span>📚</span><span>💡</span><span>🎧</span><span>🛋️</span></div></section>
   <section className="discovery" id="discover"><div className="discover-top"><div><p className="section-kicker">CURATED FOR YOUR CAMPUS</p><h2>Find something good.</h2><p>Items listed by people around you.</p></div><div className="discover-right"><div className="dropdown filter-dd"><button type="button" className={filterCount?'sort filter-toggle on':'sort filter-toggle'} aria-haspopup="dialog" aria-expanded={filterOpen} aria-controls="filter-panel" onClick={()=>setFilterOpen(o=>!o)}><span>Filter</span><b>{filterCount?<>Applied <em>{filterCount}</em></>:'All'}</b><svg aria-hidden="true" viewBox="0 0 12 12"><path d="M2.5 4.5 6 8l3.5-3.5"/></svg></button>
     {filterOpen&&<div className="filter-panel" id="filter-panel" role="dialog" aria-label="Filter listings">
      <div className="filter-head"><strong>Filters</strong><button type="button" onClick={()=>setFilters(noFilters)} disabled={!filterCount}>Clear all</button></div>
      <fieldset><legend>Availability</legend><label className="filter-check"><input type="checkbox" checked={filters.available} onChange={e=>setFilters(f=>({...f,available:e.target.checked}))}/> Hide sold items</label></fieldset>
      <fieldset><legend>Price (EGP)</legend><div className="filter-price"><label><span>Min</span><input type="number" min="0" inputMode="numeric" aria-label="Minimum price" placeholder="0" value={filters.min} onChange={e=>setFilters(f=>({...f,min:e.target.value}))}/></label><i aria-hidden="true">–</i><label><span>Max</span><input type="number" min="0" inputMode="numeric" aria-label="Maximum price" placeholder="Any" value={filters.max} onChange={e=>setFilters(f=>({...f,max:e.target.value}))}/></label></div></fieldset>
      <fieldset><legend>Condition</legend><div className="filter-chips">{conditions.map(c=><button type="button" key={c} aria-pressed={filters.conditions.includes(c)} className={filters.conditions.includes(c)?'on':''} onClick={()=>toggleCondition(c)}>{cap(c)}</button>)}</div></fieldset>
      <div className="filter-foot"><button type="button" className="sell-cta" onClick={()=>setFilterOpen(false)}>Show {listing.length} {listing.length===1?'item':'items'}</button></div>
     </div>}</div>
     <div className="dropdown sort-dd"><button type="button" className={sort!=='featured'?'sort filter-toggle on':'sort filter-toggle'} aria-haspopup="menu" aria-expanded={sortOpen} onClick={()=>setSortOpen(o=>!o)}><span>Sort</span><b>{sortLabels[sort]}</b><svg aria-hidden="true" viewBox="0 0 12 12"><path d="M2.5 4.5 6 8l3.5-3.5"/></svg></button>
      {sortOpen&&<div className="filter-panel sort-panel" role="menu" aria-label="Sort listings"><div className="filter-head"><strong>Sort by</strong></div><div className="sort-options">{Object.entries(sortLabels).map(([value,label])=><button type="button" role="menuitemradio" aria-checked={sort===value} key={value} className={sort===value?'on':''} onClick={()=>{setSort(value);setSortOpen(false);}}>{label}<svg aria-hidden="true" viewBox="0 0 12 12"><path d="M2.5 6.2 5 8.5l4.5-5"/></svg></button>)}</div></div>}
     </div></div></div>
    <div className="category-row">{categories.map(c=><button key={c} onClick={()=>setCategory(c)} className={category===c?'on':''}>{c==='all'?'All items':cap(c)}</button>)}</div>
    {noticeBar}
    <div className="listing-grid">{listing.map(card)}{listing.length===0&&<p className="noresults">No listings match your search.</p>}</div>
   </section></>}
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
     <div className={item.status==='sold'?'detail-visual sold':'detail-visual'}>
      <ListingImage src={images[activePhoto] || images[0]} alt={`${item.title} photo ${activePhoto+1}`} emoji={item.emoji} className="detail-img" />
      {item.status==='sold'&&<span className="sold-banner">Sold</span>}
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
  {editor&&<div className="overlay" onMouseDown={e=>e.target===e.currentTarget&&setEditor(null)}><section className="sell-modal" role="dialog" aria-modal="true" aria-label={editor.id?'Edit item':'Sell item'}><div className="modal-head"><div><p className="section-kicker">CAMPUS EXCHANGE</p><h2>{editor.id?'Edit your listing':'Sell an item'}</h2><p>Add the details and we'll take care of the rest.</p></div><button className="close" onClick={()=>setEditor(null)}>×</button></div><form onSubmit={submit}><div className="field-grid"><label><span>Item title *</span><input value={editor.form.title} onChange={e=>setEditor(s=>({...s,form:{...s.form,title:e.target.value}}))} placeholder="What are you selling?"/></label><label><span>Price (EGP) *</span><input type="number" min="0" step="0.01" value={editor.form.price} onChange={e=>setEditor(s=>({...s,form:{...s.form,price:e.target.value}}))} placeholder="Price"/></label><label><span>Category *</span><select value={editor.form.category} onChange={e=>setEditor(s=>({...s,form:{...s.form,category:e.target.value}}))}><option value="">Select</option>{categories.slice(1).map(c=><option value={c} key={c}>{cap(c)}</option>)}</select></label><label><span>Condition *</span><select value={editor.form.condition} onChange={e=>setEditor(s=>({...s,form:{...s.form,condition:e.target.value}}))}><option value="">Select</option>{conditions.map(c=><option value={c} key={c}>{cap(c)}</option>)}</select></label><label className="wide"><span>Description</span><textarea value={editor.form.description} onChange={e=>setEditor(s=>({...s,form:{...s.form,description:e.target.value}}))} placeholder="Description" rows="5"/></label><label className="wide"><span>Pickup / meetup location</span><input value={editor.form.pickup} onChange={e=>setEditor(s=>({...s,form:{...s.form,pickup:e.target.value}}))} placeholder="e.g. Library entrance or arrange on campus" /></label><label className="wide"><span>Seller contact email</span><input value={currentUser.email} readOnly aria-readonly="true" className="readonly-input"/><small className="email-helper">Taken from your registered account, so buyers can contact you about this item.</small></label>{editor.id&&<label><span>Status</span><select value={editor.form.status} onChange={e=>setEditor(s=>({...s,form:{...s.form,status:e.target.value}}))}><option value="active">Active</option><option value="sold">Sold</option></select></label>}</div>{error&&<p className="alert" role="alert">{error}</p>}<div className="modal-foot"><button type="button" onClick={()=>setEditor(null)}>Cancel</button><button className="sell-cta" type="submit">{editor.id?'Save changes':'Publish item'}</button></div></form></section></div>}
 </div>;
}
