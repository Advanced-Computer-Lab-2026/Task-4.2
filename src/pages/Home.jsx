import React, { useMemo } from 'react';
import { cap, categories, money } from '../data.js';
import { navigate } from '../router.js';
import { useStore } from '../store.jsx';
import { ListingCard } from '../ui.jsx';

export default function Home() {
  const { items } = useStore();

  // Cheapest active listings first: this is the "affordable" shortcut.
  const budgetPicks = useMemo(
    () => items.filter((i) => i.status === 'active').slice().sort((a, b) => a.price - b.price).slice(0, 4),
    [items]
  );
  const activeCount = useMemo(() => items.filter((i) => i.status === 'active').length, [items]);

  return (
    <div className="page home">
      <section className="hero">
        <div className="hero-copy">
          <span className="tag">THE CAMPUS MARKETPLACE</span>
          <h1>Everything you need,<br /><i>right around campus.</i></h1>
          <p>Browse little finds, big essentials and almost everything in between. {activeCount} active listings from students around you.</p>
          <div className="hero-actions">
            <button className="primary" onClick={() => navigate('/listings')}>Explore listings <span>↗</span></button>
            <button className="ghost" onClick={() => navigate('/sell')}>Sell an item</button>
          </div>
        </div>
        <div className="hero-art" aria-hidden="true">
          <span>📚</span><span>💡</span><span>🎧</span><span>🛋️</span>
        </div>
      </section>

      <section className="quick-row" aria-label="Shop by category">
        <p className="section-kicker">BROWSE BY CATEGORY</p>
        <div className="quick-links">
          {categories.slice(1).map((c) => (
            <button key={c} onClick={() => navigate(`/listings?category=${c}`)}>{cap(c)}</button>
          ))}
        </div>
      </section>

      <section className="home-section">
        <div className="section-head">
          <div>
            <p className="section-kicker">ON A BUDGET</p>
            <h2>Cheapest right now.</h2>
          </div>
          <button className="link" onClick={() => navigate('/listings?sort=low')}>See all listings <span>↗</span></button>
        </div>
        <div className="listing-grid">
          {budgetPicks.map((item) => <ListingCard key={item.id} item={item} />)}
        </div>
        <p className="fineprint">Prices shown in EGP. {money(budgetPicks[budgetPicks.length - 1]?.price ?? 0)} is the lowest active listing right now.</p>
      </section>

      <section className="cta-band">
        <div>
          <h2>Have something to sell?</h2>
          <p>Publish it in under a minute — the demo email is filled in for you.</p>
        </div>
        <button className="primary" onClick={() => navigate('/sell')}>+ Sell an item</button>
      </section>
    </div>
  );
}
