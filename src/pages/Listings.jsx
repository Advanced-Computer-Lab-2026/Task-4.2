import React, { useEffect, useMemo, useState } from 'react';
import { cap, categories, money } from '../data.js';
import { navigate, replaceListingsQuery, useRoute } from '../router.js';
import { useStore } from '../store.jsx';
import { ListingCard } from '../ui.jsx';

const sortOptions = [
  { value: 'featured', label: 'Featured' },
  { value: 'low', label: 'Price: low to high' },
  { value: 'high', label: 'Price: high to low' },
  { value: 'condition', label: 'Condition: new → worn' },
  { value: 'condition-desc', label: 'Condition: worn → new' },
];

export default function Listings() {
  const { items } = useStore();
  const route = useRoute();
  const routeKey = `${route.path}?${route.query.toString()}`;

  const [query, setQuery] = useState('');
  const [category, setCategory] = useState(() => route.query.get('category') || 'all');
  const [sort, setSort] = useState(() => route.query.get('sort') || 'featured');

  // Keep the visible filters in step with the URL (e.g. links from the home page or header).
  useEffect(() => {
    setCategory(route.query.get('category') || 'all');
    setSort(route.query.get('sort') || 'featured');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeKey]);

  function pickCategory(next) {
    setCategory(next);
    replaceListingsQuery({ category: next, sort });
  }
  function pickSort(next) {
    setSort(next);
    replaceListingsQuery({ category, sort: next });
  }
  function clearFilters() {
    setQuery('');
    setCategory('all');
    setSort('featured');
    replaceListingsQuery({ category: 'all', sort: 'featured' });
  }

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    let list = items.filter((x) =>
      (category === 'all' || x.category === category) &&
      `${x.title} ${x.category} ${x.description}`.toLowerCase().includes(needle)
    );
    if (sort === 'low') list = list.slice().sort((a, b) => a.price - b.price);
    else if (sort === 'high') list = list.slice().sort((a, b) => b.price - a.price);
    else if (sort === 'condition') list = list.slice().sort((a, b) => (conditionRankOf(a) - conditionRankOf(b)) || (a.price - b.price));
    else if (sort === 'condition-desc') list = list.slice().sort((a, b) => (conditionRankOf(b) - conditionRankOf(a)) || (a.price - b.price));
    return list;
  }, [items, category, query, sort]);

  const prices = results.map((r) => Number(r.price)).filter((n) => Number.isFinite(n));
  const range = prices.length ? `${money(Math.min(...prices))} – ${money(Math.max(...prices))}` : '';
  const filtersOn = query.trim() !== '' || category !== 'all' || sort !== 'featured';

  return (
    <div className="page listings">
      <header className="page-head">
        <div>
          <p className="section-kicker">ALL LISTINGS</p>
          <h1>Browse items</h1>
          <p className="page-sub">{items.length} items from students around campus.</p>
        </div>
        <button className="primary" onClick={() => navigate('/sell')}>+ Sell an item</button>
      </header>

      <div className="filter-bar">
        <label className="search">
          <span aria-hidden="true">⌕</span>
          <input
            aria-label="Search listings"
            placeholder="Search listings"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && <button type="button" className="clear-input" onClick={() => setQuery('')} aria-label="Clear search">×</button>}
        </label>
        <label className="sort">
          <span>Sort by</span>
          <select value={sort} onChange={(e) => pickSort(e.target.value)}>
            {sortOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </label>
      </div>

      <div className="category-row" role="group" aria-label="Filter by category">
        {categories.map((c) => (
          <button
            key={c}
            className={category === c ? 'on' : ''}
            aria-pressed={category === c}
            onClick={() => pickCategory(c)}
          >
            {c === 'all' ? 'All items' : cap(c)}
          </button>
        ))}
      </div>

      <p className="result-summary" role="status">
        {results.length === 0
          ? 'No listings match your filters.'
          : <>Showing <strong>{results.length}</strong> of {items.length} listings{range && <> · {range}</>}</>}
        {filtersOn && <button className="link" onClick={clearFilters}>Clear filters</button>}
      </p>

      <div className="listing-grid">
        {results.map((item) => <ListingCard key={item.id} item={item} />)}
      </div>

      {results.length === 0 && items.length > 0 && (
        <div className="empty-state">
          <p>Nothing matched {query.trim() ? `“${query.trim()}”` : 'these filters'}{category !== 'all' ? ` in ${cap(category)}` : ''}.</p>
          <button className="ghost" onClick={clearFilters}>Reset filters</button>
        </div>
      )}
      {items.length === 0 && (
        <div className="empty-state">
          <p>There are no listings yet.</p>
          <button className="primary" onClick={() => navigate('/sell')}>Publish the first item</button>
        </div>
      )}
    </div>
  );
}

function conditionRankOf(item) {
  const order = { 'new': 0, 'like-new': 1, 'used': 2, 'worn': 3 };
  return order[item.condition] ?? 9;
}
