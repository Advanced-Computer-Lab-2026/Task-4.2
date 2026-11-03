import React, { useEffect, useRef, useState } from 'react';
import { cap, categories, conditions, currentUser, emojiChoices, emptyForm, money, validate } from '../data.js';
import { navigate } from '../router.js';
import { useStore } from '../store.jsx';
import { ListingImage } from '../ui.jsx';

export default function Sell({ id }) {
  const { items, createItem, updateItem } = useStore();
  const editing = Boolean(id);
  const original = editing ? items.find((x) => x.id === id) : null;

  const [form, setForm] = useState(() => (original
    ? {
        title: original.title,
        price: String(original.price),
        category: original.category,
        condition: original.condition,
        description: original.description || '',
        pickup: original.pickup || '',
        status: original.status,
        emoji: original.emoji || '📦',
      }
    : { ...emptyForm }));
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const firstInvalidRef = useRef(null);

  const set = (field) => (event) => {
    const value = event.target.value;
    setForm((f) => ({ ...f, [field]: value }));
    if (submitted) setErrors((e) => ({ ...e, [field]: validate({ ...form, [field]: value })[field] }));
  };

  // An edit page opened for a listing we do not own (or that no longer exists).
  if (editing && (!original || original.owner !== 'you')) {
    return (
      <div className="page">
        <div className="empty-state">
          <p>{original ? 'Only the owner can edit this listing.' : 'That listing could not be found.'}</p>
          <button className="primary" onClick={() => navigate('/listings')}>Back to listings</button>
        </div>
      </div>
    );
  }

  const isSold = form.status === 'sold';
  const preview = {
    title: form.title.trim() || 'Your item title',
    price: Number(form.price) || 0,
    category: form.category || 'category',
    condition: form.condition || 'condition',
    description: form.description.trim(),
    status: isSold ? 'sold' : 'active',
    emoji: form.emoji,
    photos: original?.photos || [],
  };

  function submit(event) {
    event.preventDefault();
    setSubmitted(true);
    const found = validate(form);
    setErrors(found);
    const first = ['title', 'price', 'category', 'condition', 'status'].find((k) => found[k]);
    if (first) {
      firstInvalidRef.current?.querySelector(`[data-field="${first}"] input, [data-field="${first}"] select, [data-field="${first}"] textarea`)?.focus();
      return;
    }
    if (editing) {
      updateItem(original.id, form);
      navigate(`/item/${original.id}`);
    } else {
      const created = createItem(form);
      navigate(`/item/${created.id}`);
    }
  }

  const err = (field) => (submitted && errors[field] ? errors[field] : '');

  return (
    <div className="page sell">
      <nav className="crumbs" aria-label="Breadcrumb">
        <button className="link" onClick={() => navigate(editing ? `/item/${original.id}` : '/listings')}>
          {editing ? '← Back to listing' : '← Back to listings'}
        </button>
      </nav>

      <header className="page-head">
        <div>
          <p className="section-kicker">CAMPUS EXCHANGE</p>
          <h1>{editing ? 'Edit your listing' : 'Sell an item'}</h1>
          <p className="page-sub">
            {editing ? 'Update the details and save your changes.' : 'Add the details and we will take care of the rest.'}
          </p>
        </div>
      </header>

      <div className="sell-layout">
        <form className="sell-form" ref={firstInvalidRef} onSubmit={submit} noValidate>
          <label className={err('title') ? 'field invalid' : 'field'} data-field="title">
            <span>Item title *</span>
            <input
              value={form.title}
              onChange={set('title')}
              placeholder="What are you selling?"
              aria-invalid={Boolean(err('title'))}
              aria-describedby={err('title') ? 'err-title' : undefined}
            />
            {err('title') && <small className="field-error" id="err-title">{err('title')}</small>}
          </label>

          <div className="two-up">
            <label className={err('price') ? 'field invalid' : 'field'} data-field="price">
              <span>Price (EGP) *</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={set('price')}
                placeholder="0"
                aria-invalid={Boolean(err('price'))}
                aria-describedby={err('price') ? 'err-price' : undefined}
              />
              {err('price') && <small className="field-error" id="err-price">{err('price')}</small>}
            </label>

            <label className={err('status') ? 'field invalid' : 'field'} data-field="status">
              <span>Status</span>
              <select
                value={form.status}
                onChange={set('status')}
                disabled={!editing}
                aria-invalid={Boolean(err('status'))}
              >
                <option value="active">Active</option>
                <option value="sold">Sold</option>
              </select>
              {!editing && <small className="field-help">New listings always start as active.</small>}
              {err('status') && <small className="field-error" id="err-status">{err('status')}</small>}
            </label>
          </div>

          <div className="two-up">
            <label className={err('category') ? 'field invalid' : 'field'} data-field="category">
              <span>Category *</span>
              <select value={form.category} onChange={set('category')} aria-invalid={Boolean(err('category'))}>
                <option value="">Select</option>
                {categories.slice(1).map((c) => <option value={c} key={c}>{cap(c)}</option>)}
              </select>
              {err('category') && <small className="field-error" id="err-category">{err('category')}</small>}
            </label>

            <label className={err('condition') ? 'field invalid' : 'field'} data-field="condition">
              <span>Condition *</span>
              <select value={form.condition} onChange={set('condition')} aria-invalid={Boolean(err('condition'))}>
                <option value="">Select</option>
                {conditions.map((c) => <option value={c} key={c}>{cap(c)}</option>)}
              </select>
              {err('condition') && <small className="field-error" id="err-condition">{err('condition')}</small>}
            </label>
          </div>

          <label className="field" data-field="description">
            <span>Description</span>
            <textarea value={form.description} onChange={set('description')} placeholder="Condition, size, why you are selling it…" rows="5" />
          </label>

          <label className="field" data-field="pickup">
            <span>Pickup / meetup location</span>
            <input value={form.pickup} onChange={set('pickup')} placeholder="e.g. Library entrance or arrange on campus" />
          </label>

          <fieldset className="field emoji-field">
            <legend>Item icon</legend>
            <p className="field-help">Photo upload is not part of this demo — pick the icon buyers will see instead.</p>
            <div className="emoji-row" role="radiogroup" aria-label="Item icon">
              {emojiChoices.map((e) => (
                <button
                  type="button"
                  key={e}
                  role="radio"
                  aria-checked={form.emoji === e}
                  className={form.emoji === e ? 'emoji on' : 'emoji'}
                  onClick={() => setForm((f) => ({ ...f, emoji: e }))}
                >
                  {e}
                </button>
              ))}
            </div>
          </fieldset>

          <label className="field" data-field="email">
            <span>Seller contact email</span>
            <input value={currentUser.email} readOnly aria-readonly="true" className="readonly-input" />
            <small className="field-help">Taken from your registered account, so buyers can contact you about this item.</small>
          </label>

          <div className="form-foot">
            <button type="button" className="ghost" onClick={() => navigate(editing ? `/item/${original.id}` : '/listings')}>
              Cancel
            </button>
            <button className="primary" type="submit">{editing ? 'Save changes' : 'Publish item'}</button>
          </div>
        </form>

        <aside className="sell-preview" aria-label="Listing preview">
          <p className="section-kicker">LIVE PREVIEW</p>
          <p className="preview-note">This is how your listing appears in the browse page.</p>
          <article className="product preview-card">
            <div className="photo">
              <span className="stamp">{form.condition ? cap(form.condition) : 'Condition'}</span>
              <ListingImage src={preview.photos[0]} alt="" emoji={preview.emoji} className="listing-img" />
              <span className="category-caption">{preview.category === 'category' ? 'Category' : cap(preview.category)}</span>
            </div>
            <div className="prod-details">
              <div className="prod-topline">
                <span className="muted">{preview.category}</span>
                <span className={preview.status === 'sold' ? 'soldstatus' : 'instock'}>{preview.status.toUpperCase()}</span>
              </div>
              <h3>{preview.title}</h3>
              <p>{preview.description || 'Your description will show up here.'}</p>
              <div className="costline">
                <strong>{money(preview.price)}</strong>
                <span>{preview.condition === 'condition' ? '' : cap(preview.condition)}</span>
              </div>
            </div>
          </article>
        </aside>
      </div>
    </div>
  );
}
