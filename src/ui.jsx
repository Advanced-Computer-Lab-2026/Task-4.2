import React, { useEffect, useState } from 'react';
import { cap, money } from './data.js';
import { navigate } from './router.js';

// Remote stock photos need an internet connection; an icon fallback appears if one cannot load.
export function ListingImage({ src, alt, emoji, className = '' }) {
  const [broken, setBroken] = useState(false);
  useEffect(() => setBroken(false), [src]);
  return src && !broken
    ? <img className={className} src={src} alt={alt} loading="lazy" onError={() => setBroken(true)} />
    : <span className="item-emoji" aria-label="Photo unavailable">{emoji || '📦'}</span>;
}

export function ListingCard({ item }) {
  const open = () => navigate(`/item/${item.id}`);
  const mine = item.owner === 'you';
  const sold = item.status === 'sold';
  const classes = ['product', mine && 'is-mine', sold && 'is-sold'].filter(Boolean).join(' ');

  return (
    <article className={classes}>
      <button className="photo" onClick={open} aria-label={`View ${item.title}`}>
        {sold && <span className="sold-ribbon" aria-hidden="true">SOLD</span>}
        <span className="stamp">{cap(item.condition)}</span>
        <ListingImage src={item.photos?.[0]} alt={item.title} emoji={item.emoji} className="listing-img" />
        <span className="category-caption">{cap(item.category)}</span>
        {mine && <span className="ownertag">Yours</span>}
      </button>

      <div className="prod-details">
        <div className="prod-topline">
          <span className="muted">{item.category}</span>
          <span className={sold ? 'soldstatus' : 'instock'}>{sold ? 'SOLD' : 'ACTIVE'}</span>
        </div>
        <h3>
          <button className="title-link" onClick={open}>{item.title}</button>
        </h3>
        <p>{item.description}</p>
        <div className="costline">
          <strong className={sold ? 'price-sold' : ''}>{money(item.price)}</strong>
          <span>{cap(item.condition)}</span>
        </div>
        <button className="details-button" onClick={open}>
          {sold ? 'View sold item' : 'View item'} <span>↗</span>
        </button>
      </div>
    </article>
  );
}

export function Notice({ message, onDismiss }) {
  if (!message) return null;
  return (
    <p className="notice" role="status">
      {message}
      <button onClick={onDismiss} aria-label="Dismiss message">×</button>
    </p>
  );
}
