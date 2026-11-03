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
function ListingCard({item, onOpen, allowSoldOpen=false}) {
 const sold = item.status==='sold';
 return <button type="button" className={sold?'product is-sold':'product'} disabled={sold&&!allowSoldOpen} aria-disabled={sold||undefined} onClick={() => onOpen(item.id)}>
  <span className="photo">
   <ListingImage src={item.photos?.[0]} alt="" emoji={item.emoji} className="listing-img" />
   <span className={sold?'status-tag sold':'status-tag active'}>{sold?'Sold':'Active'}</span>
  </span>
  <span className="prod-details">
   <span className="tile-meta">{cap(item.category)} · {cap(item.condition)}</span>
   <h3>{item.title}</h3>
   <strong className="tile-price">EGP {item.price.toLocaleString()}</strong>
  </span>
 </button>;
}
export default function App(){
 const [items,setItems] = useState(saved);
 const [page,setPage] = useState('vision');
 const [query,setQuery] = useState('');
 const [category,setCategory] = useState('all');
 const [sort,setSort] = useState('featured');
 const [selected,setSelected] = useState(null);
 const [editor,setEditor] = useState(null); // null or {id,form}
 const [error,setError] = useState('');
 const [activePhoto,setActivePhoto] = useState(0);
 const [notice,setNotice] = useState('');
 useEffect(()=>localStorage.setItem(KEY,JSON.stringify(items)),[items]);
 useEffect(()=>setActivePhoto(0),[selected]);
 const listing = useMemo(()=>{let a=items.filter(x=>x.owner!=='you'&&(category==='all'||x.category===category)&&`${x.title} ${x.category} ${x.description}`.toLowerCase().includes(query.toLowerCase()));if(sort==='low')a.sort((a,b)=>a.price-b.price);if(sort==='high')a.sort((a,b)=>b.price-a.price);return a;},[items,category,query,sort]);
 const mine = useMemo(()=>items.filter(x=>x.owner==='you'),[items]);
 function openPage(next){setPage(next);setSelected(null);setEditor(null);window.scrollTo({top:0,behavior:'smooth'});}
 function startEdit(item){if(item&&item.owner!=='you')return;setError('');setSelected(null);setEditor({id:item?.id||null,form:item?{title:item.title,price:String(item.price),category:item.category,condition:item.condition,description:item.description,pickup:item.pickup || '',status:item.status}:{...emptyForm}});setPage('sell');window.scrollTo({top:0,behavior:'smooth'});}
 function submit(event){event.preventDefault();const f=editor.form;const err=findError(f);if(err){setError('Unable to save item. Check the form.');return;}const original=editor.id?items.find(x=>x.id===editor.id):null;const next={...f, title:f.title.trim(),price:Number(f.price),description:f.description.trim(),pickup:f.pickup.trim(),photos:original?.photos || [],emoji:original?.emoji || '📦',owner:'you',seller:currentUser.name,sellerEmail:currentUser.email};
 if(editor.id){setItems(items.map(x=>x.id===editor.id?{...x,...next}:x));setNotice('Changes saved.');}else{setItems([{...next,id:`m-${Date.now()}`,status:'active'},...items]);setNotice('Item listed for exchange.');}setPage('exchange');setEditor(null);setSelected(null);}
 function reset(){setItems(seed);setSelected(null);setEditor(null);setQuery('');setCategory('all');setSort('featured');setNotice('Example items restored.');setPage(current=>current==='sell'?'exchange':current);}
 return <div className={page==='vision'?'market-app home-view':'market-app'}>
  <header className="navigation">
   <button className="brand" onClick={()=>openPage('vision')}><span className="brand-icon">✳</span> CAMPUS<span className="brand-alt">exchange</span></button>
   <nav>
    <button className={page==='vision'?'on':''} aria-current={page==='vision'?'page':undefined} onClick={()=>openPage('vision')}>Home</button>
    <button className={page==='listings'?'on':''} aria-current={page==='listings'?'page':undefined} onClick={()=>openPage('listings')}>All listings</button>
    <button className={page==='exchange'||page==='sell'?'on':''} aria-current={page==='exchange'||page==='sell'?'page':undefined} onClick={()=>openPage('exchange')}>Exchange</button>
   </nav>
   <div className="nav-actions"><span className="usercircle">Y</span></div>
  </header>
  <main>
   {notice&&<p className="notice" role="status">{notice} <button onClick={()=>setNotice('')}>×</button></p>}
   {page==='vision'&&<section className="page-vision"><div className="promo"><div className="promo-copy"><span className="tag">THE CAMPUS MARKETPLACE</span><div className="promo-lead"><h1>Everything you need,<br/><i>right around campus.</i></h1><p>Browse little finds, big essentials and almost everything in between.</p></div><div className="promo-actions"><button onClick={()=>openPage('listings')}>Explore listings <span>↗</span></button><button className="promo-exchange" onClick={()=>openPage('exchange')}>Put my item for Exchange</button></div></div><div className="promo-art"><span>📚</span><span>💡</span><span>🎧</span><span>🛋️</span></div></div></section>}
   {page==='listings'&&<section className="discovery"><div className="discover-top"><div><p className="section-kicker">CURATED FOR YOUR CAMPUS</p><h2>Find something good.</h2><p>Items listed by people around you.</p></div><div className="discover-right"><label className="search"><span>⌕</span><input aria-label="Search listings" placeholder="Search listings" value={query} onChange={e=>setQuery(e.target.value)}/></label><label className="sort"><span>Sort</span><select value={sort} onChange={e=>setSort(e.target.value)}><option value="featured">Featured</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option></select></label></div></div>
    <div className="category-row">{categories.map(c=><button key={c} onClick={()=>setCategory(c)} className={category===c?'on':''}>{c==='all'?'All items':cap(c)}</button>)}</div>
    <div className="listing-grid">{listing.map(item=><ListingCard key={item.id} item={item} onOpen={setSelected} />)}{listing.length===0&&<p className="noresults">No listings match your search.</p>}</div>
   </section>}
   {page==='sell'&&editor&&<section className="discovery sell-page" aria-label={editor.id?'Edit item':'Put item for exchange'}><div className="sell-panel"><div className="modal-head"><div><p className="section-kicker">CAMPUS EXCHANGE</p><h2>{editor.id?'Edit your listing':'Put item for exchange'}</h2><p>Add the details and we'll take care of the rest.</p></div></div><form onSubmit={submit}><div className="field-grid"><label><span>Item title *</span><input value={editor.form.title} onChange={e=>setEditor(s=>({...s,form:{...s.form,title:e.target.value}}))} placeholder="What are you offering?"/></label><label><span>Price (EGP) *</span><input type="number" min="0" step="0.01" value={editor.form.price} onChange={e=>setEditor(s=>({...s,form:{...s.form,price:e.target.value}}))} placeholder="Price"/></label><label><span>Category *</span><select value={editor.form.category} onChange={e=>setEditor(s=>({...s,form:{...s.form,category:e.target.value}}))}><option value="">Select</option>{categories.slice(1).map(c=><option value={c} key={c}>{cap(c)}</option>)}</select></label><label><span>Condition *</span><select value={editor.form.condition} onChange={e=>setEditor(s=>({...s,form:{...s.form,condition:e.target.value}}))}><option value="">Select</option>{conditions.map(c=><option value={c} key={c}>{cap(c)}</option>)}</select></label><label className="wide"><span>Description</span><textarea value={editor.form.description} onChange={e=>setEditor(s=>({...s,form:{...s.form,description:e.target.value}}))} placeholder="Description" rows="3"/></label><label><span>Pickup / meetup location</span><input value={editor.form.pickup} onChange={e=>setEditor(s=>({...s,form:{...s.form,pickup:e.target.value}}))} placeholder="e.g. Library entrance or arrange on campus" /></label><label><span>Seller contact email</span><input value={currentUser.email} readOnly aria-readonly="true" className="readonly-input"/><small className="email-helper">Taken from your registered account, so buyers can contact you about this item.</small></label>{editor.id&&<label><span>Status</span><select value={editor.form.status} onChange={e=>setEditor(s=>({...s,form:{...s.form,status:e.target.value}}))}><option value="active">Active</option><option value="sold">Sold</option></select></label>}</div>{error&&<p className="alert" role="alert">{error}</p>}<div className="modal-foot"><button type="button" onClick={()=>openPage('exchange')}>Cancel</button><button className="sell-cta" type="submit">{editor.id?'Save changes':'Put item for exchange'}</button></div></form></div></section>}
   {page==='exchange'&&<section className="discovery exchange-page"><div className="discover-top"><div><p className="section-kicker">YOUR EXCHANGE</p><h2>Your items for exchange.</h2><p>Put an item up for exchange, then see everything you have already listed.</p></div><button className="sell-cta" onClick={()=>startEdit(null)}>+ item for exchange</button></div>
    <div className="listing-grid">{mine.map(item=><ListingCard key={item.id} item={item} onOpen={setSelected} allowSoldOpen />)}{mine.length===0&&<p className="noresults">You have not put any items up for exchange yet.</p>}</div>
   </section>}
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
     <div className="detail-layout">
      <div className="detail-gallery">
       <div className="detail-visual">
        <ListingImage src={images[activePhoto] || images[0]} alt={`${item.title} photo ${activePhoto+1}`} emoji={item.emoji} className="detail-img" />
       </div>
       {images.length>1&&<div className="detail-thumbs" aria-label="Item photos">{images.map((src,index)=><button type="button" key={index} className={activePhoto===index?'thumb active':'thumb'} aria-label={`Show photo ${index+1} of ${images.length}`} aria-pressed={activePhoto===index} onClick={()=>setActivePhoto(index)}><ListingImage src={src} alt="" emoji={item.emoji} className="thumb-img" /></button>)}</div>}
      </div>
      <div className="detail-main">
       <p className="section-kicker">{cap(item.category)} · {cap(item.condition)}</p>
       <h2>{item.title}</h2>
       <h3>EGP {item.price.toLocaleString()}</h3>
       <p className="item-description">{item.description||'No description supplied.'}</p>
       <div className="detail-meta">
        <p><strong>Pickup</strong><br/>{item.pickup || 'Arrange directly with seller'}</p>
        <p><strong>Seller</strong><br/>{item.seller}</p>
        {item.owner==='you'
         ? <button className="sell-cta" onClick={()=>startEdit(item)}>Edit your listing</button>
         : item.status==='sold'
           ? <p className="fineprint">This item is marked as sold.</p>
           : <a className="sell-cta contact-seller" href={`mailto:${item.sellerEmail}?subject=${subject}&body=${body}`}>✉ Contact seller</a>}
       </div>
      </div>
     </div>
    </section>
   </div>;
  })()}
 </div>;
}
