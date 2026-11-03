import { useEffect, useState } from 'react';

// Tiny hash-based router. Routes:
//   #/                Home (landing page)
//   #/listings        Browse every listing
//   #/item/<id>       Single listing detail
//   #/sell            Publish a new item
//   #/edit/<id>       Edit an existing item
export function parseRoute() {
  const raw = (window.location.hash || '').replace(/^#/, '') || '/';
  const [path, search = ''] = raw.split('?');
  const seg = path.split('/').filter(Boolean);
  const query = new URLSearchParams(search);

  if (seg.length === 0) return { name: 'home', params: {}, query, path };
  if (seg[0] === 'listings') return { name: 'listings', params: {}, query, path };
  if (seg[0] === 'item' && seg[1]) return { name: 'item', params: { id: decodeURIComponent(seg[1]) }, query, path };
  if (seg[0] === 'sell') return { name: 'sell', params: {}, query, path };
  if (seg[0] === 'edit' && seg[1]) return { name: 'edit', params: { id: decodeURIComponent(seg[1]) }, query, path };
  return { name: 'notfound', params: {}, query, path };
}

export function navigate(to) {
  const target = to.startsWith('#') ? to : `#${to}`;
  if (window.location.hash === target) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }
  window.location.hash = target;
}

// Rewrite the listings query string without adding a history entry or firing hashchange,
// so the address bar always reflects the active filters.
export function replaceListingsQuery({ category = 'all', sort = 'featured' } = {}) {
  const params = new URLSearchParams();
  if (category && category !== 'all') params.set('category', category);
  if (sort && sort !== 'featured') params.set('sort', sort);
  const qs = params.toString();
  history.replaceState(null, '', qs ? `#/listings?${qs}` : '#/listings');
}

export function useRoute() {
  const [route, setRoute] = useState(parseRoute);
  useEffect(() => {
    const onChange = () => setRoute(parseRoute());
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return route;
}
