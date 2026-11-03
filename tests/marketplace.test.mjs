import test from 'node:test';
import assert from 'node:assert/strict';
import { validateListing, filterListings } from '../src/marketplace.mjs';

const valid = { title: 'Book', price: '0', category: 'textbooks', condition: 'used', status: 'active' };
const items = [
  { id: 1, title: 'Calculus book', description: 'Notes', category: 'textbooks', price: 320, owner: 'you', status: 'active' },
  { id: 2, title: 'Desk lamp', description: 'Light', category: 'furniture', price: 240, owner: 'other', status: 'active' },
  { id: 3, title: 'Workbook', description: 'Calculus notes', category: 'textbooks', price: 140, owner: 'you', status: 'sold' },
  { id: 4, title: 'Free book', description: '', category: 'textbooks', price: 0, owner: 'other', status: 'active' },
];

test('validation reports all required fields and accepts zero and sold status', () => {
  assert.deepEqual(validateListing(valid), {});
  assert.deepEqual(validateListing({ ...valid, status: 'sold' }), {});
  assert.deepEqual(Object.keys(validateListing({ title: ' ', price: '', category: '', condition: '', status: 'invalid' })), ['title', 'price', 'category', 'condition', 'status']);
  for (const price of ['-1', 'abc', 'Infinity', ' ']) assert.ok(validateListing({ ...valid, price }).price);
  assert.deepEqual(validateListing({ ...valid, price: '10.50' }), {});
});

test('budget is inclusive, supports free items and no limit', () => {
  assert.deepEqual(filterListings(items, { maxPrice: '240' }).map(x => x.id), [2, 3, 4]);
  assert.deepEqual(filterListings(items, { maxPrice: '0' }).map(x => x.id), [4]);
  for (const maxPrice of ['', '-1', 'invalid']) assert.equal(filterListings(items, { maxPrice }).length, 4);
});

test('ownership filter includes active and sold listings and combines with discovery controls', () => {
  assert.deepEqual(filterListings(items, { onlyMine: true }).map(x => x.id), [1, 3]);
  assert.deepEqual(filterListings(items, { onlyMine: true, category: 'textbooks', query: 'CALCULUS', maxPrice: '200', sort: 'low' }).map(x => x.id), [3]);
  assert.equal(filterListings(items, { onlyMine: true, category: 'furniture' }).length, 0);
});

test('sorting preserves the stored order and default view restores all records', () => {
  assert.deepEqual(filterListings(items, { sort: 'low' }).map(x => x.id), [4, 3, 2, 1]);
  assert.deepEqual(filterListings(items, { sort: 'high' }).map(x => x.id), [1, 2, 3, 4]);
  assert.deepEqual(filterListings(items).map(x => x.id), [1, 2, 3, 4]);
});
