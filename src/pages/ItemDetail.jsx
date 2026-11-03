import React, { useEffect, useRef, useState } from 'react';
import { cap, money } from '../data.js';
import { navigate } from '../router.js';
import { useStore } from '../store.jsx';
import { ListingImage } from '../ui.jsx';

export default function ItemDetail({ id }) {
  const { items, setItemStatus } = useStore();
  const item = items.find((x) => x.id === id);
  const [activePhoto, setActivePhoto] = useState(0);
  const headingRef = useRef(null);

  useEffect(() => { setActivePhoto(0); }, [id]);
  useEffect(() => { headingRef.current?.focus(); }, [id]);

  if (!item) {
    return (
      <div className="page">
        <div className="empty-state">
          <p>That listing could not be found.</p>
          <button className="primary" onClick={() => navigate('/listings')}>Back to listings</button>
        </div>
      </div>
    );
  }

  const images = item.photos || [];
  const subject = encodeURIComponent(`Campus Exchange: ${item.title}`);
  const body = encodeURIComponent(`Hi ${item.seller},\n\nI'm interested in your listing "${item.title}" (${money(item.price)}). Is it still available?\n\n`);
  const isOwner = item.owner === 'you';
  const sold = item.status === 'sold';

  const step = (delta) => {
    if (images.length < 2) return;
    setActivePhoto((i) => (i + delta + images.length) % images.length);
  };

  return (
    <div className="page detail">

      <nav className="crumbs" aria-label="Breadcrumb">
        <button className="link" onClick={() => navigate('/listings')}>← Back to listings</button>
        <span className="crumb-sep">/</span>
        <span>{cap(item.category)}</span>
      </nav>

      <div className={`detail-layout${sold ? ' is-sold' : ''}`}>
        <div className="detail-gallery">
          <div className="detail-visual">
            <ListingImage
              src={images[activePhoto] || images[0]}
              alt={`${item.title} photo ${activePhoto + 1}`}
              emoji={item.emoji}
              className="detail-img"
            />
            <span className={`status-pill ${sold ? 'is-sold' : 'is-active'}`}>{sold ? 'SOLD' : 'ACTIVE'}</span>
            {images.length > 1 && (
              <>
                <button className="gallery-nav prev" onClick={() => step(-1)} aria-label="Previous photo">‹</button>
                <button className="gallery-nav next" onClick={() => step(1)} aria-label="Next photo">›</button>
                <span className="gallery-count" aria-live="polite">{activePhoto + 1} / {images.length}</span>
              </>
            )}
          </div>
          {images.length > 1 && (
            <div className="detail-thumbs" aria-label="Item photos">
              {images.map((src, index) => (
                <button
                  type="button"
                  key={index}
                  className={activePhoto === index ? 'thumb active' : 'thumb'}
                  aria-label={`Show photo ${index + 1} of ${images.length}`}
                  aria-pressed={activePhoto === index}
                  onClick={() => setActivePhoto(index)}
                >
                  <ListingImage src={src} alt="" emoji={item.emoji} className="thumb-img" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="detail-info">
          {isOwner && (
            <p className="owner-banner" role="note">
              <span aria-hidden="true">★</span> This is your listing — only you can edit it.
            </p>
          )}
          <p className="section-kicker">{cap(item.category)} · {cap(item.condition)}</p>
          <h1 ref={headingRef} tabIndex={-1}>{item.title}</h1>
          <p className="detail-price">{money(item.price)}</p>

          <ul className="spec-row">
            <li><span>Condition</span><strong>{cap(item.condition)}</strong></li>
            <li><span>Category</span><strong>{cap(item.category)}</strong></li>
            <li><span>Status</span><strong className={sold ? 'soldstatus' : 'instock'}>{cap(item.status)}</strong></li>
          </ul>

          <p className="item-description">{item.description || 'No description supplied.'}</p>

          <div className="detail-meta">
            <p><strong>Pickup</strong><br />{item.pickup || 'Arrange directly with seller'}</p>
            <p><strong>Seller</strong><br />{item.seller}{isOwner && ' (you)'}</p>
          </div>

          <div className="detail-actions">
            {isOwner ? (
              <>
                <button className="primary" onClick={() => navigate(`/edit/${item.id}`)}>Edit your listing</button>
                <button
                  className="ghost"
                  onClick={() => setItemStatus(item.id, sold ? 'active' : 'sold')}
                >
                  {sold ? 'Mark as active again' : 'Mark as sold'}
                </button>
              </>
            ) : sold ? (
              <p className="fineprint">This item is marked as sold.</p>
            ) : (
              <a
                className="primary contact-seller"
                href={`mailto:${item.sellerEmail}?subject=${subject}&body=${body}`}
              >
                ✉ Contact seller
              </a>
            )}
          </div>

          <p className="fineprint">Contacting opens your default email application — nothing is sent from inside the demo.</p>
        </div>
      </div>
    </div>
  );
}
