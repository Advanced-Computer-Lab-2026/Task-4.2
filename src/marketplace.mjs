export function validateListing(form) {
  const errors = {};
  if (!form.title.trim()) errors.title = 'Enter an item title.';
  if (String(form.price).trim() === '' || !Number.isFinite(Number(form.price)) || Number(form.price) < 0) {
    errors.price = 'Enter a price of zero or more.';
  }
  if (!['textbooks', 'electronics', 'furniture', 'clothing', 'other'].includes(form.category)) errors.category = 'Choose a category.';
  if (!['new', 'like-new', 'used', 'worn'].includes(form.condition)) errors.condition = 'Choose an item condition.';
  if (!['active', 'sold'].includes(form.status)) errors.status = 'Choose a valid status.';
  return errors;
}

export function filterListings(items, { category = 'all', query = '', sort = 'featured', maxPrice = '', onlyMine = false } = {}) {
  const budget = String(maxPrice).trim() === '' ? Infinity : Number(maxPrice);
  const hasBudget = Number.isFinite(budget) && budget >= 0;
  const result = items.filter(item =>
    (category === 'all' || item.category === category) &&
    `${item.title} ${item.category} ${item.description}`.toLowerCase().includes(query.toLowerCase()) &&
    (!onlyMine || item.owner === 'you') &&
    (!hasBudget || item.price <= budget)
  );
  if (sort === 'low') result.sort((a, b) => a.price - b.price);
  if (sort === 'high') result.sort((a, b) => b.price - a.price);
  return result;
}
