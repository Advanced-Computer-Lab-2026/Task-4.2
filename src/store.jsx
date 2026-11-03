import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { currentUser, loadItems, saveItems, seed } from './data.js';

const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  const [items, setItems] = useState(loadItems);
  const [notice, setNotice] = useState('');
  const timer = useRef(null);

  useEffect(() => saveItems(items), [items]);

  const notify = useCallback((message) => {
    setNotice(message);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setNotice(''), 5000);
  }, []);

  useEffect(() => () => clearTimeout(timer.current), []);

  const createItem = useCallback((form) => {
    const item = {
      id: `m-${Date.now()}`,
      title: form.title.trim(),
      price: Number(form.price),
      category: form.category,
      condition: form.condition,
      description: form.description.trim(),
      pickup: form.pickup.trim(),
      status: 'active', // a new listing always starts active
      owner: 'you',
      seller: currentUser.name,
      sellerEmail: currentUser.email,
      photos: [],
      emoji: form.emoji || '📦',
    };
    setItems((prev) => [item, ...prev]);
    notify('Item listed.');
    return item;
  }, [notify]);

  const updateItem = useCallback((id, form) => {
    setItems((prev) => prev.map((x) => (x.id === id ? {
      ...x,
      title: form.title.trim(),
      price: Number(form.price),
      category: form.category,
      condition: form.condition,
      description: form.description.trim(),
      pickup: form.pickup.trim(),
      status: form.status,
      emoji: form.emoji || x.emoji || '📦',
    } : x)));
    notify('Changes saved.');
  }, [notify]);

  const setItemStatus = useCallback((id, status) => {
    setItems((prev) => prev.map((x) => (x.id === id ? { ...x, status: status === 'sold' ? 'sold' : 'active' } : x)));
    notify(status === 'sold' ? 'Marked as sold.' : 'Listing is active again.');
  }, [notify]);

  const resetDemo = useCallback(() => {
    setItems(seed);
    notify('Example items restored.');
  }, [notify]);

  const value = { items, notice, dismissNotice: () => setNotice(''), notify, createItem, updateItem, setItemStatus, resetDemo };
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside StoreProvider');
  return ctx;
}
