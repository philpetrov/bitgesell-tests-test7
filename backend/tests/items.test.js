const request = require('supertest');
const express = require('express');
const fs = require('fs').promises;
const itemsRouter = require('../src/routes/items');

// Mock the fs.promises module
jest.mock('fs', () => ({
  promises: {
    readFile: jest.fn(),
    writeFile: jest.fn(),
  },
}));

const app = express();
app.use(express.json());
app.use('/api/items', itemsRouter);
// Add a generic error handler for testing purposes
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({ error: err.message });
});

describe('Items API', () => {
  const mockItems = [
    { id: 1, name: 'Laptop Pro', category: 'Electronics', price: 2499 },
    { id: 2, name: 'Headphones', category: 'Electronics', price: 399 },
  ];

  beforeEach(() => {
    // Reset mocks before each test
    fs.readFile.mockReset();
    fs.writeFile.mockReset();
  });

  describe('GET /api/items', () => {
    it('should return all items successfully', async () => {
      fs.readFile.mockResolvedValue(JSON.stringify(mockItems));

      const res = await request(app).get('/api/items');

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('items');
      expect(res.body).toHaveProperty('totalPages');
      expect(res.body).toHaveProperty('currentPage');
      expect(res.body.items).toEqual(mockItems);
      expect(res.body.currentPage).toBe(1);
      expect(fs.readFile).toHaveBeenCalledTimes(1);
    });

    it('should handle file read errors', async () => {
      fs.readFile.mockRejectedValue(new Error('File read error'));

      const res = await request(app).get('/api/items');

      expect(res.statusCode).toEqual(500);
      expect(res.body.error).toEqual('File read error');
    });
  });

  describe('GET /api/items/:id', () => {
    it('should return a single item if found', async () => {
      fs.readFile.mockResolvedValue(JSON.stringify(mockItems));

      const res = await request(app).get('/api/items/1');

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(mockItems[0]);
    });

    it('should return 404 if item is not found', async () => {
      fs.readFile.mockResolvedValue(JSON.stringify(mockItems));

      const res = await request(app).get('/api/items/999');

      expect(res.statusCode).toEqual(404);
      expect(res.body.error).toEqual('Item not found');
    });
  });

  describe('POST /api/items', () => {
    it('should add a new item and return it with an ID', async () => {
      const newItem = { name: 'New Gadget', category: 'Tech', price: 199 };
      fs.readFile.mockResolvedValue(JSON.stringify(mockItems));
      fs.writeFile.mockResolvedValue(); // Mock a successful write

      const res = await request(app).post('/api/items').send(newItem);

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.name).toEqual(newItem.name);

      // Verify that fs.writeFile was called correctly
      expect(fs.writeFile).toHaveBeenCalledTimes(1);
      const writtenData = JSON.parse(fs.writeFile.mock.calls[0][1]);

      expect(writtenData.length).toBe(3);
      expect(writtenData[2].name).toBe('New Gadget');
    });
  });
});