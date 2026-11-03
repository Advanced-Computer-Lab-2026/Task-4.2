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
async function preparePhoto(file){
 if(!['image/jpeg','image/png','image/webp','image/gif'].includes(file.type))throw new Error('Choose a JPG, PNG, WEBP, or GIF image.');
 if(file.size>10*1024*1024)throw new Error('Choose an image smaller than 10 MB.');
 const source=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>typeof reader.result==='string'?resolve(reader.result):reject(new Error('Unable to read this image.'));reader.onerror=()=>reject(new Error('Unable to read this image.'));reader.readAsDataURL(file);});
 const image=new Image();
 await new Promise((resolve,reject)=>{image.onload=resolve;image.onerror=()=>reject(new Error('This image could not be opened.'));image.src=source;});
 const scale=Math.min(1,1200/Math.max(image.naturalWidth,image.naturalHeight));
 const canvas=document.createElement('canvas');
 canvas.width=Math.max(1,Math.round(image.naturalWidth*scale));
 canvas.height=Math.max(1,Math.round(image.naturalHeight*scale));
 const context=canvas.getContext('2d');
 if(!context)throw new Error('Your browser could not process this image.');
 context.fillStyle='#fff';
 context.fillRect(0,0,canvas.width,canvas.height);
 context.drawImage(image,0,0,canvas.width,canvas.height);
 return canvas.toDataURL('image/jpeg',0.78);
}
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
 const [listingView,setListingView] = useState('all');
 const [sort,setSort] = useState('featured');
 const [signedIn,setSignedIn] = useState(true);
 const [selected,setSelected] = useState(null);
 const [editor,setEditor] = useState(null); // null or {id,form}
 const [error,setError] = useState('');
 const [activePhoto,setActivePhoto] = useState(0);
 const [notice,setNotice] = useState('');
 const [photoBusy,setPhotoBusy] = useState(false);
 useEffect(()=>localStorage.setItem(KEY,JSON.stringify(items)),[items]);
 useEffect(()=>setActivePhoto(0),[selected]);
 const listing = useMemo(()=>{let a=items.filter(x=>(listingView==='mine'?x.owner==='you':x.status!=='sold')&&(category==='all'||x.category===category)&&`${x.title} ${x.category} ${x.description}`.toLowerCase().includes(query.toLowerCase()));if(sort==='low')a.sort((a,b)=>a.price-b.price);if(sort==='high')a.sort((a,b)=>b.price-a.price);return a;},[items,listingView,category,query,sort]);
 function startEdit(item){if(!signedIn||(item&&item.owner!=='you'))return;setSelected(null);setError('');setPhotoBusy(false);setEditor({id:item?.id||null,form:item?{title:item.title,price:String(item.price),category:item.category,condition:item.condition,description:item.description,pickup:item.pickup || '',status:item.status,photo:item.photos?.[0] || ''}:{...emptyForm,photo:''}});}
 async function selectPhoto(event){const file=event.target.files?.[0];event.target.value='';if(!file)return;setError('');setPhotoBusy(true);try{const photoData=await preparePhoto(file);setEditor(current=>current?{...current,form:{...current.form,photo:photoData}}:current);}catch(cause){setError(cause instanceof Error?cause.message:'Unable to process this image.');}finally{setPhotoBusy(false);}}
 function submit(event){event.preventDefault();if(photoBusy)return;const f=editor.form;const err=findError(f);if(err){setError('Unable to save item. Check the form.');return;}const original=editor.id?items.find(x=>x.id===editor.id):null;const photos=original&&f.photo===original.photos?.[0]?original.photos:(f.photo?[f.photo]:[]);const next={...f, title:f.title.trim(),price:Number(f.price),description:f.description.trim(),pickup:f.pickup.trim(),photos,emoji:original?.emoji || '📦',owner:'you',seller:currentUser.name,sellerEmail:currentUser.email};delete next.photo;
 if(editor.id){setItems(items.map(x=>x.id===editor.id?{...x,...next}:x));setNotice('Changes saved.');}else{setItems([{...next,id:`m-${Date.now()}`,status:'active'},...items]);setNotice('Item listed.');}setEditor(null);setSelected(null);document.getElementById('discover')?.scrollIntoView({behavior:'smooth'});}
 function handleAccountAction(){if(signedIn){setSignedIn(false);setEditor(null);setSelected(null);setListingView('all');setCategory('all');setQuery('');setNotice('Logged out of the demo account. Your listings are unchanged.');}else{setSignedIn(true);setNotice('Signed in as You.');}}
 function reset(){setItems(seed);setSelected(null);setEditor(null);setQuery('');setCategory('all');setListingView('all');setSort('featured');setNotice('Example items restored.');}
 return <div className="market-app">
  <header className="navigation"><button className="brand" disabled={Boolean(editor)} onClick={()=>{setSelected(null);setCategory('all');setListingView('all')}}><span className="brand-icon">✳</span> CAMPUS<span className="brand-alt">exchange</span></button><nav aria-label="Main navigation"><button disabled={Boolean(editor)} className={listingView==='all'?'nav-current':''} aria-pressed={listingView==='all'} onClick={()=>{setListingView('all');setCategory('all');setQuery('');document.getElementById('discover')?.scrollIntoView({behavior:'smooth'})}}>All listings</button>{signedIn&&<button disabled={Boolean(editor)} className={listingView==='mine'?'nav-current':''} aria-pressed={listingView==='mine'} onClick={()=>{setListingView('mine');setCategory('all');setQuery('');document.getElementById('discover')?.scrollIntoView({behavior:'smooth'})}}>My listings</button>}</nav><div className="nav-actions">{signedIn&&<span className="usercircle" aria-label="Signed in as You">Y</span>}<button className="account-action" disabled={Boolean(editor)} onClick={handleAccountAction}>{signedIn?'Log out':'Log in as You'}</button></div></header>
  <main>
   {editor?<section className="sell-page" aria-labelledby="editor-title">
    <button className="back-link" type="button" onClick={()=>{setEditor(null);setError('');setPhotoBusy(false)}} disabled={photoBusy}>← Back to listings</button>
    <div className="sell-page-heading"><p className="section-kicker">CAMPUS EXCHANGE</p><h1 id="editor-title">{editor.id?'Edit your listing':'Sell an item'}</h1><p>Add the details below to {editor.id?'update your listing':'list your item for students on campus'}.</p></div>
    <form className="sell-page-form" onSubmit={submit}>
     <div className="field-grid">
      <label><span>Item title *</span><input value={editor.form.title} onChange={e=>setEditor(s=>({...s,form:{...s.form,title:e.target.value}}))} placeholder="What are you selling?"/></label>
      <label><span>Price (EGP) *</span><input type="number" min="0" step="0.01" value={editor.form.price} onChange={e=>setEditor(s=>({...s,form:{...s.form,price:e.target.value}}))} placeholder="Price"/></label>
      <label><span>Category *</span><select value={editor.form.category} onChange={e=>setEditor(s=>({...s,form:{...s.form,category:e.target.value}}))}><option value="">Select</option>{categories.slice(1).map(c=><option value={c} key={c}>{cap(c)}</option>)}</select></label>
      <label><span>Condition *</span><select value={editor.form.condition} onChange={e=>setEditor(s=>({...s,form:{...s.form,condition:e.target.value}}))}><option value="">Select</option>{conditions.map(c=><option value={c} key={c}>{cap(c)}</option>)}</select></label>
      <div className="photo-field wide"><label htmlFor="listing-photo">Item photo</label><input id="listing-photo" type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={selectPhoto}/><small>JPG, PNG, WEBP, or GIF. Images are resized for the listing.</small>{photoBusy&&<small role="status">Processing photo…</small>}{editor.form.photo&&<div className="photo-preview"><img src={editor.form.photo} alt="Selected item preview"/><button type="button" onClick={()=>setEditor(s=>({...s,form:{...s.form,photo:''}}))}>Remove photo</button></div>}</div>
      <label className="wide"><span>Description</span><textarea value={editor.form.description} onChange={e=>setEditor(s=>({...s,form:{...s.form,description:e.target.value}}))} placeholder="Description" rows="5"/></label>
      <label className="wide"><span>Pickup / meetup location</span><input value={editor.form.pickup} onChange={e=>setEditor(s=>({...s,form:{...s.form,pickup:e.target.value}}))} placeholder="e.g. Library entrance or arrange on campus" /></label>
      <label className="wide"><span>Seller contact email</span><input value={currentUser.email} readOnly aria-readonly="true" className="readonly-input"/><small className="email-helper">Taken from your registered account, so buyers can contact you about this item.</small></label>
      {editor.id&&<label><span>Status</span><select value={editor.form.status} onChange={e=>setEditor(s=>({...s,form:{...s.form,status:e.target.value}}))}><option value="active">Active</option><option value="sold">Sold</option></select></label>}
     </div>
     {error&&<p className="alert" role="alert">{error}</p>}
     <div className="sell-page-actions"><button type="button" className="secondary-button" onClick={()=>{setEditor(null);setError('')}} disabled={photoBusy}>Cancel</button><button className="sell-cta" type="submit" disabled={photoBusy}>{photoBusy?'Processing photo…':editor.id?'Save changes':'Publish item'}</button></div>
    </form>
   </section>:<>
   <section className="promo"><div className="promo-copy"><span className="tag">THE CAMPUS MARKETPLACE</span><h1>Everything you need,<br/><i>right around campus.</i></h1><p>Browse little finds, big essentials and almost everything in between.</p><button className="hero-sell-button" onClick={()=>signedIn?startEdit(null):handleAccountAction()}>{signedIn?'+ List an item':'Sign in to sell'}</button></div><div className="promo-art"><span>📚</span><span>💡</span><span>🎧</span><span>🛋️</span></div></section>
   <section className="discovery" id="discover"><div className="discover-top"><div><p className="section-kicker">{listingView==='mine'?'YOUR CAMPUS LISTINGS':'CURATED FOR YOUR CAMPUS'}</p><h2>{listingView==='mine'?'Your listings.':'Find something good.'}</h2><p>{listingView==='mine'?'Manage your active and sold items.':'Items listed by people around you.'}</p></div><div className="discover-right"><label className="search"><span>⌕</span><input aria-label="Search listings" placeholder="Search listings" value={query} onChange={e=>setQuery(e.target.value)}/></label><label className="sort"><span>Sort</span><select value={sort} onChange={e=>setSort(e.target.value)}><option value="featured">Featured</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option></select></label></div></div>
    <div className="category-row">{categories.map(c=><button key={c} onClick={()=>setCategory(c)} className={category===c?'on':''}>{c==='all'?'All items':cap(c)}</button>)}</div>
    {notice&&<p className="notice" role="status">{notice} <button onClick={()=>setNotice('')}>×</button></p>}
    <div className="listing-grid">{listing.map(item=><article className="product" key={item.id}><button className="photo" onClick={()=>setSelected(item.id)}><span className="stamp">{cap(item.condition)}</span><ListingImage src={item.photos?.[0]} alt={item.title} emoji={item.emoji} className="listing-img" /><span className="category-caption">{cap(item.category)}</span></button><div className="prod-details"><div className="prod-topline"><span className="muted">{item.category}</span><span className={item.status==='sold'?'soldstatus':'instock'}>{item.status.toUpperCase()}</span></div><h3>{item.title}</h3><p>{item.description}</p><div className="costline"><strong>EGP {item.price.toLocaleString()}</strong><span>{item.condition}</span></div><button className="details-button" onClick={()=>setSelected(item.id)}>View item <span>↗</span></button></div></article>)}{listing.length===0&&<p className="noresults">{listingView==='mine'?'You have no listings matching your search.':'No active listings match your search.'}</p>}</div>
   </section>
   <footer><strong>CAMPUS exchange</strong><span>From students, for students.</span><button onClick={reset}>Reset demo</button></footer>
   </>}
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
     {item.owner==='you'&&signedIn
       ? <button className="sell-cta" onClick={()=>startEdit(item)}>Edit your listing</button>
       : item.status==='sold'
         ? <p className="fineprint">This item is marked as sold.</p>
         : <a className="sell-cta contact-seller" href={`mailto:${item.sellerEmail}?subject=${subject}&body=${body}`}>✉ Contact seller</a>}
    </section>
   </div>;
  })()}
 </div>;
}
