import test from 'node:test';
import assert from 'node:assert/strict';
import { KEY, seed, emptyForm, validate, saveListing, filterListings, loadItems } from './marketplace.js';

const validForm = () => ({ ...emptyForm, title: '  Scientific calculator  ', price: '125.50', category: 'electronics', condition: 'used', description: '  Works well.  ', pickup: '  Library  ', photos: [] });
const storageWith = value => ({ getItem(key) { assert.equal(key, KEY); return value; } });

test('new listings use numeric prices, trimmed text and the current account', () => {
  const original = structuredClone(seed);
  const items = saveListing(seed, null, validForm(), 'new-calculator');
  assert.equal(items.length, seed.length + 1);
  assert.deepEqual(items[0], {
    ...validForm(), id: 'new-calculator', title: 'Scientific calculator', price: 125.5,
    description: 'Works well.', pickup: 'Library', status: 'active',
    owner: 'you', seller: 'You', sellerEmail: 'you@example.com', emoji: '📦',
  });
  assert.deepEqual(seed, original);
});

test('new listings start active, including when a sold status is supplied', () => {
  const [item] = saveListing([], null, { ...validForm(), status: 'sold' }, 'new');
  assert.equal(item.status, 'active');
});

test('zero is a valid price and optional text fields can be blank', () => {
  const form = { ...validForm(), price: '0', description: '', pickup: '' };
  assert.deepEqual(validate(form), {});
  assert.equal(saveListing([], null, form, 'free')[0].price, 0);
});

test('blank, negative and non-finite prices cannot be saved', () => {
  for (const price of ['', ' ', '-1', 'NaN', 'Infinity', '1e999']) {
    const form = { ...validForm(), price };
    assert.ok(validate(form).price, `Expected price error for ${price}`);
    assert.throws(() => saveListing([], null, form, 'invalid'), /Check the listing/);
  }
});

test('required and enumerated fields produce specific field errors', () => {
  const errors = validate({ ...validForm(), title: ' ', category: 'invalid', condition: '', status: 'invalid' });
  assert.deepEqual(Object.keys(errors), ['title', 'category', 'condition', 'status']);
});

test('owners can edit, mark sold and reactivate while preserving listing identity and photos', () => {
  const own = seed.find(item => item.id === 'm1');
  const sold = saveListing(seed, own.id, { ...own, price: '300', status: 'sold' });
  const updated = sold.find(item => item.id === own.id);
  assert.equal(sold.length, seed.length);
  assert.equal(updated.price, 300);
  assert.equal(updated.status, 'sold');
  assert.deepEqual(updated.photos, own.photos);
  assert.ok(!filterListings(sold).some(item => item.id === own.id));
  const reactivated = saveListing(sold, own.id, { ...updated, status: 'active' });
  assert.ok(filterListings(reactivated).some(item => item.id === own.id));
  assert.equal(seed.find(item => item.id === own.id).status, 'active');
});

test('other sellers and missing listings cannot be edited', () => {
  assert.throws(() => saveListing(seed, 'm2', validForm()), /Only the owner/);
  assert.throws(() => saveListing(seed, 'missing', validForm()), /Only the owner/);
});

test('search, category, budget, availability and condition filters work together', () => {
  const results = filterListings(seed, { query: '  TEXTBOOK  ', category: 'textbooks', maxPrice: '320', condition: 'used' });
  assert.deepEqual(results.map(item => item.id), ['m1']);
  assert.deepEqual(filterListings(seed, { maxPrice: '0' }), []);
  assert.equal(filterListings(seed, { maxPrice: '200' }).length, 2);
});

test('price ordering is numeric and does not mutate source records', () => {
  const ids = seed.map(item => item.id);
  const low = filterListings(seed, { sort: 'low' }).map(item => item.price);
  const high = filterListings(seed, { sort: 'high' }).map(item => item.price);
  assert.deepEqual(low, [180, 200, 240, 320, 390, 650, 1450]);
  assert.deepEqual(high, [...low].reverse());
  assert.deepEqual(seed.map(item => item.id), ids);
});

test('My listings can show the owner’s active and sold items', () => {
  assert.deepEqual(filterListings(seed, { own: true, status: 'all' }).map(item => item.id), ['m1', 'm4', 'm7']);
  assert.deepEqual(filterListings(seed, { own: true, status: 'sold' }).map(item => item.id), ['m7']);
});

test('saved records round-trip under the original storage key, including photos and sold status', () => {
  const photo = 'data:image/png;base64,cGhvdG8=';
  const items = saveListing(seed, null, { ...validForm(), photos: [photo] }, 'saved');
  const sold = saveListing(items, 'saved', { ...items[0], status: 'sold' });
  assert.deepEqual(loadItems(storageWith(JSON.stringify(sold))), sold);
  assert.deepEqual(loadItems(storageWith('[]')), []);
});

test('old demo records without pickup or photos remain compatible', () => {
  const legacy = { ...seed[0] };
  delete legacy.pickup;
  delete legacy.photos;
  assert.deepEqual(loadItems(storageWith(JSON.stringify([legacy]))), [legacy]);
});

test('missing, corrupt, malformed and duplicate saved records fall back safely', () => {
  const invalidRecords = [null, '{broken', '{}', '[null]', '[{"title":"broken"}]', JSON.stringify([{ ...seed[0], price: -3 }]), JSON.stringify([{ ...seed[0], photos: [null] }]), JSON.stringify([seed[0], seed[0]])];
  for (const value of invalidRecords) assert.deepEqual(loadItems(storageWith(value)), seed);
  assert.deepEqual(loadItems({ getItem() { throw new Error('Storage disabled'); } }), seed);
});
