export const KEY = 'acl-marketplace-v3';
export const categories = ['all', 'textbooks', 'electronics', 'furniture', 'clothing', 'other'];
export const conditions = ['new', 'like-new', 'used', 'worn'];
export const currentUser = {name: 'You', email: 'you@example.com'}; // Demo account; no login backend
const photo = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=82`;
export const seed = [
  {id:'m1', title:'Calculus II textbook', category:'textbooks', condition:'used', price:320, description:'Second-year calculus textbook, complete with all chapters. A few highlighted sections and notes in pencil, but no missing or torn pages. Useful for the midterm and final revision sessions. You can inspect it before deciding.', status:'active', owner:'you', seller:'You', sellerEmail:currentUser.email, pickup:'GUC student area, near the main cafeteria', photos:[photo('photo-1544947950-fa07a98d237f'),photo('photo-1494438639946-1ebd1d20bf85')], emoji:'📚'},
  {id:'m2', title:'Student desk lamp', category:'furniture', condition:'like-new', price:240, description:'Compact study lamp with warm light, adjustable position and a USB power cable. Used for one semester only. The cable and light both work. Great for a dorm desk or a small workspace.', status:'active', owner:'other', seller:'Mariam', sellerEmail:'mariam.seller@example.com', pickup:'GUC library entrance, weekdays after 1 PM', photos:[photo('photo-1555475384-a0aefc775412')], emoji:'💡'},
  {id:'m3', title:'Bluetooth headphones', category:'electronics', condition:'used', price:650, description:'Wireless over-ear headphones in good working condition. They connect with Bluetooth and include the original carrying pouch and charging cable. The battery lasts about six hours based on my usage. There are a few cosmetic scratches near one hinge; see the photos. Happy to let you test sound and pairing before buying.', status:'active', owner:'other', seller:'Omar', sellerEmail:'omar.seller@example.com', pickup:'Arrange a meetup at GUC Gate 3', photos:[photo('photo-1599955051125-571f47e04316'),photo('photo-1505740420928-5e560c06d30e'),photo('photo-1546435770-a3e426bf472b')], emoji:'🎧'},
  {id:'m4', title:'Engineering lab coat', category:'clothing', condition:'new', price:200, description:'White engineering lab coat, medium size, bought for a lab but never worn. Still clean and folded. Suitable for laboratory practical sessions. Please check your required size before arranging pickup.', status:'active', owner:'you', seller:'You', sellerEmail:currentUser.email, pickup:'Meet at GUC main entrance, mornings', photos:[photo('photo-1542058186993-286fdce0b580')], emoji:'🥼'},
  {id:'m5', title:'Drawing tablet', category:'electronics', condition:'like-new', price:1450, description:'Small USB drawing tablet with pressure-sensitive pen and protective sleeve. Used for a few class illustrations; fully functional. Works with common creative software after installing the manufacturer driver. You are welcome to try the pen and pressure sensitivity on my laptop before buying.', status:'active', owner:'other', seller:'Nour', sellerEmail:'nour.seller@example.com', pickup:'GUC design building reception', photos:[photo('photo-1671087709820-274fdd9ac67a')], emoji:'✏️'},
  {id:'m6', title:'Used storage shelf', category:'furniture', condition:'worn', price:390, description:'Light wooden storage shelf. Stable and usable, though there are visible scratches from moving rooms. The shelves are best for books, stationery and small storage boxes, not very heavy appliances. Buyer should arrange a way to transport it from near campus.', status:'active', owner:'other', seller:'Youssef', sellerEmail:'youssef.seller@example.com', pickup:'Collect from a public pickup point near GUC, by arrangement', photos:[photo('photo-1692195321701-1a454c79ab02'),photo('photo-1758279746549-d24f3784879d')], emoji:'🗄️'},
  {id:'m7', title:'MATH 201 workbook', category:'textbooks', condition:'used', price:140, description:'Workbook with practice problems, solutions and lecture notes. All pages present and in readable condition. Some exercises have answers written in pencil. Already sold to another student.', status:'sold', owner:'you', seller:'You', sellerEmail:currentUser.email, pickup:'GUC campus (previous listing)', photos:[photo('photo-1544947950-fa07a98d237f')], emoji:'📖'},
  {id:'m8', title:'Sketching kit', category:'other', condition:'like-new', price:180, description:'Charcoal pencils, graphite pencils, blending tools and an A5 sketch pad. Some pencils have been lightly used, but the set still has plenty of material for design practice and drawing assignments.', status:'active', owner:'other', seller:'Salma', sellerEmail:'salma.seller@example.com', pickup:'Meet outside the GUC architecture studios', photos:[photo('photo-1758521232691-613561977b6a'),photo('photo-1771366629879-8b3128ee62ca')], emoji:'🎨'},
];

export const emptyForm = { title: '', price: '', category: '', condition: '', description: '', pickup: '', status: 'active', photos: [] };
export const cap = value => value === 'like-new' ? 'Like new' : (value || '').replace(/\b\w/g, letter => letter.toUpperCase());
export const money = value => `EGP ${value.toLocaleString('en-EG', { maximumFractionDigits: 2 })}`;

export function validate(form) {
  const errors = {};
  if (!form.title.trim()) errors.title = 'Give your item a title.';
  if (String(form.price).trim() === '' || !Number.isFinite(Number(form.price)) || Number(form.price) < 0) errors.price = 'Enter a price of 0 EGP or more.';
  if (!categories.slice(1).includes(form.category)) errors.category = 'Choose a category.';
  if (!conditions.includes(form.condition)) errors.condition = 'Choose the item’s condition.';
  if (!['active', 'sold'].includes(form.status)) errors.status = 'Choose Active or Sold.';
  return errors;
}

export function saveListing(items, id, form, newId = `m-${crypto.randomUUID()}`) {
  const original = id ? items.find(item => item.id === id) : null;
  if (id && (!original || original.owner !== 'you')) throw new Error('Only the owner can edit this listing.');
  if (Object.keys(validate(form)).length) throw new Error('Check the listing details.');
  const next = { ...original, ...form, id: id || newId, title: form.title.trim(), price: Number(form.price), description: form.description.trim(), pickup: form.pickup.trim(), status: id ? form.status : 'active', owner: 'you', seller: currentUser.name, sellerEmail: currentUser.email, emoji: original?.emoji || '📦' };
  return id ? items.map(item => item.id === id ? next : item) : [next, ...items];
}

export function filterListings(items, { query = '', category = 'all', condition = 'all', status = 'active', maxPrice = '', own = false, sort = 'featured' } = {}) {
  const normalizedQuery = query.trim().toLowerCase();
  const results = items.filter(item =>
    (category === 'all' || item.category === category) &&
    (condition === 'all' || item.condition === condition) &&
    (status === 'all' || item.status === status) &&
    (!own || item.owner === 'you') &&
    (maxPrice === '' || item.price <= Number(maxPrice)) &&
    `${item.title} ${item.category} ${item.description}`.toLowerCase().includes(normalizedQuery)
  );
  if (sort === 'low') results.sort((a, b) => a.price - b.price);
  if (sort === 'high') results.sort((a, b) => b.price - a.price);
  return results;
}

export function loadItems(storage) {
  try {
    const items = JSON.parse(storage.getItem(KEY));
    // Keep the original storage key and existing browser listings compatible.
    if (!Array.isArray(items) || !items.every(item =>
      item && typeof item.id === 'string' && typeof item.title === 'string' &&
      typeof item.price === 'number' && Number.isFinite(item.price) && item.price >= 0 &&
      categories.slice(1).includes(item.category) && conditions.includes(item.condition) &&
      ['active', 'sold'].includes(item.status) && ['you', 'other'].includes(item.owner) &&
      typeof item.description === 'string' &&
      (!item.photos || (Array.isArray(item.photos) && item.photos.every(src => typeof src === 'string')))
    ) || new Set(items.map(item => item.id)).size !== items.length) return seed;
    return items;
  } catch { return seed; }
}
