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
const emptyForm = {title:'', price:'', category:'', condition:'', description:'', pickup:'', status:'active', sellerEmail:'', photos:[]};
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
function Dialog({children,onClose,label,panelClass}){
 const ref=useRef(null);const close=useRef(onClose);close.current=onClose;
 useEffect(()=>{const previous=document.activeElement;const d=ref.current;const overflow=document.body.style.overflow;d.showModal();document.body.style.overflow='hidden';return ()=>{d.close();document.body.style.overflow=overflow;if(previous?.isConnected)previous.focus();};},[]);
 return <dialog ref={ref} className="app-dialog" aria-label={label} onCancel={e=>{e.preventDefault();close.current();}} onClick={e=>{if(e.target===e.currentTarget)close.current();}}><section className={panelClass}>{children}</section></dialog>;
}
async function readPhoto(file){
 if(!['image/jpeg','image/png','image/webp'].includes(file.type))throw new Error('Choose JPG, PNG or WebP images.');
 if(file.size>10*1024*1024)throw new Error('Each image must be smaller than 10 MB.');
 const image=await createImageBitmap(file);try{const scale=Math.min(1,1000/Math.max(image.width,image.height));const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(image.width*scale));canvas.height=Math.max(1,Math.round(image.height*scale));canvas.getContext('2d').drawImage(image,0,0,canvas.width,canvas.height);return canvas.toDataURL('image/jpeg',0.75);}finally{image.close();}
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
 const [activeTab,setActiveTab]=useState('home');
 const [accountOpen,setAccountOpen]=useState(false);
 const [signedIn,setSignedIn]=useState(()=>{try{return sessionStorage.getItem('campus-signed-out')!=='true';}catch{return true;}});
 const accountRef=useRef(null);
 const accountButton=useRef(null);
 useEffect(()=>{
  if(!accountOpen)return;
  const outside=e=>{if(!accountRef.current?.contains(e.target))setAccountOpen(false);};
  const escape=e=>{if(e.key==='Escape'){setAccountOpen(false);accountButton.current?.focus();}};
  document.addEventListener('pointerdown',outside);document.addEventListener('keydown',escape);
  return ()=>{document.removeEventListener('pointerdown',outside);document.removeEventListener('keydown',escape);};
 },[accountOpen]);
 function demoSignIn(){setSignedIn(true);try{sessionStorage.removeItem('campus-signed-out');}catch{}setAccountOpen(false);}
 function signOut(){setSignedIn(false);try{sessionStorage.setItem('campus-signed-out','true');}catch{}setAccountOpen(false);setSelected(null);setEditor(null);openTab('home');}
 function showMyItems(){setCategory('all');setQuery('');setAvailability('all');setSort('featured');openTab('mine');}

 function openTab(tab){setAccountOpen(false);setActiveTab(tab);setSelected(null);window.scrollTo({top:0,behavior:'instant'});}
 const [sort,setSort] = useState('featured');
 const [selected,setSelected] = useState(null);
 const [editor,setEditor] = useState(null); // null or {id,form}
 const [error,setError] = useState('');
 const [availability,setAvailability]=useState('active');
 const [uploading,setUploading]=useState(false);
 const uploadVersion=useRef(0);
 const [activePhoto,setActivePhoto] = useState(0);
 const [notice,setNotice] = useState('');
 useEffect(()=>{
  if(!editor || (!uploading && JSON.stringify(editor.form)===editor.initial))return;
  const warn=event=>{event.preventDefault();event.returnValue='';};
  window.addEventListener('beforeunload',warn);
  return ()=>window.removeEventListener('beforeunload',warn);
 },[editor,uploading]);

 useEffect(()=>setActivePhoto(0),[selected]);
 const listing = useMemo(()=>{let a=items.filter(x=>(activeTab!=='mine'||(signedIn&&x.owner==='you'))&&(availability==='all'||x.status===availability)&&(category==='all'||x.category===category)&&`${x.title} ${x.category} ${x.description}`.toLowerCase().includes(query.toLowerCase()));if(sort==='low')a.sort((a,b)=>a.price-b.price);if(sort==='high')a.sort((a,b)=>b.price-a.price);return a;},[items,category,query,sort,availability,activeTab,signedIn]);
 function startEdit(item){
 if(!signedIn){setAccountOpen(true);return;}if(item&&item.owner!=='you')return;setError('');
 const form=item?{title:item.title,price:String(item.price),category:item.category,condition:item.condition,description:item.description,pickup:item.pickup||'',status:item.status,sellerEmail:item.sellerEmail==='you@example.com'?'':item.sellerEmail||'',photos:[...(item.photos||[])]}:{...emptyForm,photos:[]};
 setEditor({id:item?.id||null,form,initial:JSON.stringify(form)});
 }
 function closeEditor(){if((uploading||JSON.stringify(editor.form)!==editor.initial)&&!window.confirm('Discard your unsaved listing changes?'))return;uploadVersion.current++;setUploading(false);setEditor(null);}
 async function uploadPhotos(event){
 const files=Array.from(event.target.files);event.target.value='';if(!files.length)return;
 if(editor.form.photos.length+files.length>4){setError('You can add up to four photos.');return;}
 const version=++uploadVersion.current;setUploading(true);setError('');
 try{const photos=await Promise.all(files.map(readPhoto));if(version===uploadVersion.current)setEditor(s=>s?{...s,form:{...s.form,photos:[...s.form.photos,...photos]}}:s);}catch(err){if(version===uploadVersion.current)setError(err.message||'Could not read the image. Try another file.');}finally{if(version===uploadVersion.current)setUploading(false);}
 }
 function submit(event){event.preventDefault();if(uploading)return;const f=editor.form;let err=findError(f);let field=!f.title.trim()?'title':f.price.trim()===''||!Number.isFinite(Number(f.price))||Number(f.price)<0?'price':!categories.slice(1).includes(f.category)?'category':!conditions.includes(f.condition)?'condition':null;
 if(!err&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.sellerEmail.trim())){err='Enter a valid contact email.';field='sellerEmail';}
 if(err){setError(err);const input=event.currentTarget.elements.namedItem(field);input?.setAttribute('aria-invalid','true');input?.focus();return;}
 const original=editor.id?items.find(x=>x.id===editor.id):null;const next={...f,title:f.title.trim(),price:Number(f.price),description:f.description.trim(),pickup:f.pickup.trim(),sellerEmail:f.sellerEmail.trim(),emoji:original?.emoji||'📦',owner:'you',seller:currentUser.name};
 const updated=editor.id?items.map(x=>x.id===editor.id?{...x,...next}:x):[{...next,id:'m-'+Date.now(),status:'active'},...items];
 try{localStorage.setItem(KEY,JSON.stringify(updated));}catch{setError('Could not save on this device. Storage may be full. Remove a photo and try again.');return;}
 setItems(updated);setNotice(editor.id?'Changes saved.':'Item listed.');setEditor(null);setSelected(null);
 }
 function reset(){setActiveTab('home');try{localStorage.setItem(KEY,JSON.stringify(seed));}catch{setNotice('Could not reset device storage.');return;}setItems(seed);setSelected(null);setEditor(null);setQuery('');setCategory('all');setSort('featured');setAvailability('active');setNotice('Example items restored.');}
 return <div className="market-app">
  <div className="utility"><span>Campus Exchange</span><span>Trusted by students • All prices in EGP</span></div>
  <header className="navigation"><button className="brand" onClick={()=>openTab('home')}><span className="brand-icon">✳</span> CAMPUS<span className="brand-alt">exchange</span></button><nav aria-label="Main navigation">{[['home','Home'],['explore','Explore items']].map(([tab,label])=><button key={tab} className={activeTab===tab?'nav-active':''} aria-current={activeTab===tab?'page':undefined} onClick={()=>openTab(tab)}>{label}</button>)}</nav><div className="nav-actions"><div className="account-control" ref={accountRef} onBlur={e=>{if(!e.currentTarget.contains(e.relatedTarget))setAccountOpen(false);}}><button ref={accountButton} className="usercircle" aria-label="Open account" aria-expanded={accountOpen} aria-controls="account-box" onClick={()=>setAccountOpen(value=>!value)}>{signedIn?'Y':<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/></svg>}</button>{accountOpen&&<section id="account-box" className="account-box" aria-label="Your account">{signedIn?<><div className="member-info"><span className="member-avatar" aria-hidden="true">Y</span><div><h2>{currentUser.name}</h2><p>{currentUser.email}</p><span className="member-badge">Demo member</span></div></div><button className="account-link" onClick={showMyItems}><span>My items</span><span className="account-count">{items.filter(item=>item.owner==='you').length}</span></button><button className="account-link signout" onClick={signOut}>Sign out <span aria-hidden="true">↗</span></button></>:<div className="signed-out-info"><h2>You're signed out</h2><p>Browse freely, or enter the demo account to manage your items.</p><button className="sell-cta" onClick={demoSignIn}>Enter demo account</button></div>}</section>}</div><button className="sell-cta" onClick={()=>startEdit(null)}>+ Sell an item</button></div></header>
  <main className={activeTab==='home'?'home-view':'explore-view'}>
   {activeTab==='home'&&<section className="promo" aria-label="Welcome to Campus Exchange"><div className="promo-copy"><span className="tag">THE CAMPUS MARKETPLACE</span><h1>Everything you need,<br/><i>right around campus.</i></h1><p>Browse little finds, big essentials and almost everything in between.</p><button onClick={()=>openTab('explore')}>Explore listings <span>↗</span></button></div><div className="promo-art" aria-hidden="true"><span>📚</span><span>💡</span><span>🎧</span><span>🛋️</span></div></section>}
   {(activeTab==='explore'||(activeTab==='mine'&&signedIn))&&<section className="discovery" id="discover" aria-label={activeTab==='mine'?'My items':'Explore items'}><div className="discover-top"><div><p className="section-kicker">CURATED FOR YOUR CAMPUS</p><h2>{activeTab==='mine'?'My items.':'Explore items.'}</h2><p>{activeTab==='mine'?'Manage your listings, including available and sold items.':'Find your next campus essential.'}</p></div><div className="discover-right"><label className="search"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4 4"/></svg><input aria-label="Search listings" placeholder="Search textbooks, electronics and more" value={query} onChange={e=>setQuery(e.target.value)}/>{query&&<button type="button" className="clear-search" aria-label="Clear search" onClick={()=>setQuery('')}>×</button>}</label></div></div>
    <div className="filter-panel"><div className="filter-controls"><label className="availability">Show <select aria-label="Listing availability" value={availability} onChange={e=>setAvailability(e.target.value)}><option value="active">Available items</option><option value="all">All items, including sold</option><option value="sold">Sold items</option></select></label><label className="sort"><span>Sort</span><select value={sort} onChange={e=>setSort(e.target.value)}><option value="featured">Featured</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option></select></label></div><div className="category-row" aria-label="Item categories">{categories.map(c=><button key={c} onClick={()=>setCategory(c)} aria-pressed={category===c} className={category===c?'on':''}>{c==='all'?'All items':cap(c)}</button>)}</div></div>
    {notice&&<p className="notice" role="status">{notice} <button aria-label="Dismiss notification" onClick={()=>setNotice('')}>×</button></p>}
    <div className="results-summary"><p role="status"><strong>{listing.length}</strong> {listing.length===1?'item':'items'}{category!=='all'?` in ${cap(category)}`:' to explore'}{query?` matching “${query}”`:''}</p>{(query||category!=='all'||availability!=='active')&&<button onClick={()=>{setQuery('');setCategory('all');setAvailability('active');}}>Clear filters <span aria-hidden="true">×</span></button>}</div><div className="listing-grid">{listing.map(item=><article className="product" key={item.id}><button className={`photo illustration-${item.category}`} aria-label={`View ${item.title}`} onClick={()=>setSelected(item.id)}><span className="stamp">{cap(item.condition)}</span><ListingImage src={item.photos?.[0]} alt={item.title} emoji={item.emoji || ({textbooks:'📚',electronics:'🎧',furniture:'🪑',clothing:'👕',other:'🎨'}[item.category])} className="listing-img" />{item.photos?.length>1&&<span className="photo-count"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><rect x="3" y="5" width="18" height="15" rx="3"/><circle cx="12" cy="12.5" r="3.5"/><path d="m8 5 1-2h6l1 2"/></svg>{item.photos.length} photos</span>}</button><div className="prod-details"><div className="prod-topline"><span className="muted">{cap(item.category)}</span><span className={item.status==='sold'?'soldstatus':'instock'}>{item.status==='sold'?'Sold':'Available'}</span></div><h3><button className="product-title" onClick={()=>setSelected(item.id)}>{item.title}</button></h3><div className="card-location"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M20 10c0 6-8 11-8 11S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></svg><span>{item.pickup || 'Arrange pickup with seller'}</span></div><div className="card-seller"><span className="seller-avatar" aria-hidden="true">{item.seller.slice(0,1)}</span><span>{item.owner==='you'?'Your listing':`Listed by ${item.seller}`}</span></div><div className="costline"><strong><small>EGP</small> {item.price.toLocaleString()}</strong></div><button className="details-button" onClick={()=>setSelected(item.id)}>View item <span aria-hidden="true">→</span></button></div></article>)}{listing.length===0&&<div className="noresults"><span className="empty-icon" aria-hidden="true">⌕</span><h3>{activeTab==='mine'?'No matching listings':'No items found'}</h3><p>Try another search or clear your filters to explore available items.</p></div>}</div>
   </section>}
   <footer><strong>CAMPUS exchange</strong><span>From students, for students.</span><button onClick={reset}>Reset demo</button></footer>
  </main>
  {selected&&(()=>{
   const item=items.find(x=>x.id===selected);if(!item)return null;
   const images=item.photos || [];
   const subject=encodeURIComponent(`Campus Exchange: ${item.title}`);
   const body=encodeURIComponent(`Hi ${item.seller},\n\nI'm interested in your listing "${item.title}" (EGP ${item.price}). Is it still available?\n\n`);
   return <Dialog label="Item details" panelClass="detail-panel" onClose={()=>setSelected(null)}>
     <button className="close" aria-label="Close item details" onClick={()=>setSelected(null)}>×</button>
     <div className={`detail-visual illustration-${item.category}`}>
      <ListingImage src={images[activePhoto] || images[0]} alt={`${item.title} photo ${activePhoto+1}`} emoji={item.emoji} className="detail-img" />
     </div>
     {images.length>1&&<div className="detail-thumbs" aria-label="Item photos">{images.map((src,index)=><button type="button" key={index} className={activePhoto===index?'thumb active':'thumb'} aria-label={`Show photo ${index+1} of ${images.length}`} aria-pressed={activePhoto===index} onClick={()=>setActivePhoto(index)}><ListingImage src={src} alt="" emoji={item.emoji} className="thumb-img" /></button>)}</div>}
     <p className="section-kicker">{cap(item.category)} · {cap(item.condition)}</p>
     <h2>{item.title}</h2>
     <h3>EGP {item.price.toLocaleString()}</h3>
     <p className="item-description">{item.description||'No description supplied.'}</p>
     <div className="detail-meta"><p><strong>Pickup</strong><br/>{item.pickup || 'Arrange directly with seller'}</p><p><strong>Seller</strong><br/>{item.seller}</p></div>
     <p className="muted">Status: {item.status}</p>
     {item.owner==='you'&&signedIn
       ? <button className="sell-cta" onClick={()=>startEdit(item)}>Edit your listing</button>
       : item.status==='sold'
         ? <p className="fineprint">This item is marked as sold.</p>
         : <div><p className="contact-help">Opens your email app. You can also copy the address below. Example listings use demo addresses.</p><p className="seller-email">{item.sellerEmail}</p><a className="sell-cta contact-seller" href={`mailto:${item.sellerEmail}?subject=${subject}&body=${body}`}>✉ Email seller</a></div>}
   </Dialog>;
  })()}
  {editor&&<Dialog label={editor.id?'Edit item':'Sell item'} panelClass="sell-modal" onClose={closeEditor}><div className="modal-head"><div><p className="section-kicker">CAMPUS EXCHANGE</p><h2>{editor.id?'Edit your listing':'Sell an item'}</h2><p>Add the details and we'll take care of the rest.</p></div><button className="close" aria-label="Close listing form" onClick={closeEditor}>×</button></div><form noValidate onSubmit={submit} onChange={e=>e.target.removeAttribute("aria-invalid")}><div className="field-grid"><label><span>Item title *</span><input name="title" required aria-describedby={error?"form-error":undefined} value={editor.form.title} onChange={e=>setEditor(s=>({...s,form:{...s.form,title:e.target.value}}))} placeholder="What are you selling?"/></label><label><span>Price (EGP) *</span><input type="number" min="0" step="0.01" name="price" required aria-describedby={error?"form-error":undefined} value={editor.form.price} onChange={e=>setEditor(s=>({...s,form:{...s.form,price:e.target.value}}))} placeholder="Price"/></label><label><span>Category *</span><select name="category" required aria-describedby={error?"form-error":undefined} value={editor.form.category} onChange={e=>setEditor(s=>({...s,form:{...s.form,category:e.target.value}}))}><option value="">Select</option>{categories.slice(1).map(c=><option value={c} key={c}>{cap(c)}</option>)}</select></label><label><span>Condition *</span><select name="condition" required aria-describedby={error?"form-error":undefined} value={editor.form.condition} onChange={e=>setEditor(s=>({...s,form:{...s.form,condition:e.target.value}}))}><option value="">Select</option>{conditions.map(c=><option value={c} key={c}>{cap(c)}</option>)}</select></label><label className="wide"><span>Description</span><textarea value={editor.form.description} onChange={e=>setEditor(s=>({...s,form:{...s.form,description:e.target.value}}))} placeholder="Description" rows="5"/></label><label className="wide"><span>Pickup / meetup location</span><input value={editor.form.pickup} onChange={e=>setEditor(s=>({...s,form:{...s.form,pickup:e.target.value}}))} placeholder="e.g. Library entrance or arrange on campus" /></label><label className="wide"><span>Seller contact email *</span><input type="email" name="sellerEmail" required aria-describedby={error?"email-help form-error":"email-help"} value={editor.form.sellerEmail} onChange={e=>setEditor(s=>({...s,form:{...s.form,sellerEmail:e.target.value}}))}/><small className="email-helper" id="email-help">Enter the email buyers should use. It will be visible with your listing. This demo has no registered accounts.</small></label><div className="wide photo-field"><label><span>Item photos (up to 4)</span><input type="file" accept="image/jpeg,image/png,image/webp" multiple disabled={uploading||editor.form.photos.length>=4} onChange={uploadPhotos}/><small>JPG, PNG or WebP, up to 10 MB each. First photo is the cover.</small></label>{uploading&&<p role="status">Preparing photos…</p>}<div className="upload-previews">{editor.form.photos.map((src,index)=><div key={index}><img src={src} alt={'Listing photo '+(index+1)}/><button type="button" disabled={uploading} aria-label={'Remove photo '+(index+1)} onClick={()=>setEditor(s=>({...s,form:{...s.form,photos:s.form.photos.filter((_,i)=>i!==index)}}))}>Remove</button></div>)}</div></div>{editor.id&&<label><span>Status</span><select value={editor.form.status} onChange={e=>setEditor(s=>({...s,form:{...s.form,status:e.target.value}}))}><option value="active">Active</option><option value="sold">Sold</option></select></label>}</div>{error&&<p className="alert" id="form-error" role="alert">{error}</p>}<div className="modal-foot"><button type="button" onClick={closeEditor}>Cancel</button><button className="sell-cta" type="submit" disabled={uploading}>{editor.id?'Save changes':'Publish item'}</button></div></form></Dialog>}
 </div>;
}
