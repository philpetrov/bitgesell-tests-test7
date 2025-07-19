const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const router = express.Router();

const DATA_PATH = path.join(__dirname, '../../../data/items.json');

const cache = {
  stats: null,
  mtime: null,
};

async function getStats() {
  const fileStats = await fs.stat(DATA_PATH);

  if (cache.mtime && cache.mtime.getTime() === fileStats.mtime.getTime()) {
    return cache.stats;
  }

  const raw = await fs.readFile(DATA_PATH);
  const items = JSON.parse(raw);

  const totalItems = items.length;
  const categories = new Set(items.map((i) => i.category));
  const totalValue = items.reduce((sum, i) => sum + i.price, 0);
  const averagePrice = totalItems > 0 ? totalValue / totalItems : 0;

  cache.stats = {
    totalItems,
    numberOfCategories: categories.size,
    averagePrice: parseFloat(averagePrice.toFixed(2)),
  };
  cache.mtime = fileStats.mtime;

  return cache.stats;
}

router.get('/', async (req, res, next) => {
  try {
    const stats = await getStats();
    res.json(stats);
  } catch (err) {
    next(err);
  }
});

module.exports = router;