const request = require('supertest');
const express = require('express');
const fs = require('fs').promises;
const statsRouter = require('../src/routes/stats');

// Мокаем модуль fs, чтобы контролировать его в тестах
jest.mock('fs', () => ({
  promises: {
    readFile: jest.fn(),
    stat: jest.fn(),
  },
}));

const app = express();
app.use('/api/stats', statsRouter);

describe('Stats API', () => {
  const mockItems = [
    { id: 1, category: 'Electronics', price: 100 },
    { id: 2, category: 'Books', price: 20 },
    { id: 3, category: 'Electronics', price: 150 },
  ];

  beforeEach(() => {
    // Сбрасываем моки перед каждым тестом
    fs.readFile.mockReset();
    fs.stat.mockReset();
    // Сбрасываем кеш, импортируя его заново для каждого теста
    jest.resetModules();
  });

  it('should calculate stats on first call', async () => {
    fs.stat.mockResolvedValue({ mtime: new Date() });
    fs.readFile.mockResolvedValue(JSON.stringify(mockItems));

    const res = await request(app).get('/api/stats');

    expect(res.statusCode).toEqual(200);
    expect(res.body.totalItems).toBe(3);
    expect(res.body.numberOfCategories).toBe(2);
    expect(res.body.averagePrice).toBe(90);
    expect(fs.readFile).toHaveBeenCalledTimes(1);
  });

  it('should return cached stats on second call if file is unchanged', async () => {
    const fileMtime = new Date();
    fs.stat.mockResolvedValue({ mtime: fileMtime });
    fs.readFile.mockResolvedValue(JSON.stringify(mockItems));

    // Первый вызов для заполнения кеша
    await request(app).get('/api/stats');
    expect(fs.readFile).toHaveBeenCalledTimes(1);

    // Второй вызов
    const res = await request(app).get('/api/stats');
    expect(res.statusCode).toEqual(200);
    // Проверяем, что readFile не был вызван снова
    expect(fs.readFile).toHaveBeenCalledTimes(1);
  });
});