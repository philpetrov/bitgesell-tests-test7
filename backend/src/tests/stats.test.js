const request = require('supertest');
const express = require('express');
const fs = require('fs').promises;
const statsRouter = require('../routes/stats');

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
    fs.readFile.mockReset();
    fs.stat.mockReset();
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

    await request(app).get('/api/stats');
    expect(fs.readFile).toHaveBeenCalledTimes(1);

    const res = await request(app).get('/api/stats');
    expect(res.statusCode).toEqual(200);
    expect(fs.readFile).toHaveBeenCalledTimes(1);
  });
});