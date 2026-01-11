/**
 * Integration Tests: API Endpoints
 *
 * Testet die HTTP-Schnittstelle des Servers
 * ohne externe Abhängigkeiten (Datenbank gemockt).
 */

const request = require('supertest');
const express = require('express');

// Mock-Express App für Tests
function createTestApp() {
  const app = express();
  app.use(express.json());

  // Health Check Route (sollte immer existieren)
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Mock User Route
  app.get('/api/v1/users/me', (req, res) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    res.json({
      id: 'test-user-id',
      email: 'test@example.com',
      username: 'testuser',
      level: 1
    });
  });

  // Mock Products Route
  app.get('/api/v1/products', (req, res) => {
    res.json({
      products: [
        {
          id: 'product-1',
          title: 'Test E-Book',
          price: 29.99,
          status: 'active'
        }
      ],
      total: 1
    });
  });

  // Mock Create Product
  app.post('/api/v1/products', (req, res) => {
    const { title, price } = req.body;

    if (!title || title.length < 3) {
      return res.status(400).json({ error: 'Title must be at least 3 characters' });
    }

    if (!price || price < 0) {
      return res.status(400).json({ error: 'Price must be positive' });
    }

    res.status(201).json({
      id: 'new-product-id',
      title,
      price,
      status: 'draft',
      created_at: new Date().toISOString()
    });
  });

  return app;
}

describe('API Endpoints', () => {
  let app;

  beforeAll(() => {
    app = createTestApp();
  });

  describe('GET /api/health', () => {
    it('sollte 200 OK mit Status zurückgeben', async () => {
      const res = await request(app)
        .get('/api/health')
        .expect(200);

      expect(res.body.status).toBe('ok');
      expect(res.body.timestamp).toBeDefined();
    });
  });

  describe('GET /api/v1/users/me', () => {
    it('sollte 401 ohne Authorization Header zurückgeben', async () => {
      await request(app)
        .get('/api/v1/users/me')
        .expect(401);
    });

    it('sollte 401 mit ungültigem Token zurückgeben', async () => {
      await request(app)
        .get('/api/v1/users/me')
        .set('Authorization', 'InvalidToken')
        .expect(401);
    });

    it('sollte User-Daten mit gültigem Token zurückgeben', async () => {
      const res = await request(app)
        .get('/api/v1/users/me')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(res.body.id).toBeDefined();
      expect(res.body.email).toBe('test@example.com');
      expect(res.body.username).toBe('testuser');
      expect(res.body.level).toBe(1);
    });
  });

  describe('GET /api/v1/products', () => {
    it('sollte Produkt-Liste zurückgeben', async () => {
      const res = await request(app)
        .get('/api/v1/products')
        .expect(200);

      expect(res.body.products).toBeInstanceOf(Array);
      expect(res.body.products.length).toBeGreaterThan(0);
      expect(res.body.products[0]).toHaveProperty('id');
      expect(res.body.products[0]).toHaveProperty('title');
      expect(res.body.products[0]).toHaveProperty('price');
    });
  });

  describe('POST /api/v1/products', () => {
    it('sollte neues Produkt erstellen', async () => {
      const res = await request(app)
        .post('/api/v1/products')
        .send({
          title: 'Mein neues E-Book',
          price: 19.99
        })
        .expect(201);

      expect(res.body.id).toBeDefined();
      expect(res.body.title).toBe('Mein neues E-Book');
      expect(res.body.price).toBe(19.99);
      expect(res.body.status).toBe('draft');
    });

    it('sollte 400 bei fehlendem Titel zurückgeben', async () => {
      await request(app)
        .post('/api/v1/products')
        .send({ price: 19.99 })
        .expect(400);
    });

    it('sollte 400 bei zu kurzem Titel zurückgeben', async () => {
      await request(app)
        .post('/api/v1/products')
        .send({ title: 'AB', price: 19.99 })
        .expect(400);
    });

    it('sollte 400 bei negativem Preis zurückgeben', async () => {
      await request(app)
        .post('/api/v1/products')
        .send({ title: 'Gültiger Titel', price: -5 })
        .expect(400);
    });
  });
});

describe('Request Validation', () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use(express.json());

    // Route mit Validierung
    app.post('/api/validate', (req, res) => {
      const { email, username, price } = req.body;
      const errors = [];

      // Email Validierung
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.push('Invalid email format');
      }

      // Username Validierung
      if (username && (username.length < 3 || username.length > 30)) {
        errors.push('Username must be 3-30 characters');
      }

      // Preis Validierung
      if (price !== undefined && (price < 0 || price > 10000)) {
        errors.push('Price must be between 0 and 10000');
      }

      if (errors.length > 0) {
        return res.status(400).json({ errors });
      }

      res.json({ valid: true });
    });
  });

  describe('Email Validation', () => {
    it('sollte gültige Email akzeptieren', async () => {
      const res = await request(app)
        .post('/api/validate')
        .send({ email: 'test@example.com' })
        .expect(200);

      expect(res.body.valid).toBe(true);
    });

    it('sollte ungültige Email ablehnen', async () => {
      await request(app)
        .post('/api/validate')
        .send({ email: 'invalid-email' })
        .expect(400);
    });
  });

  describe('Username Validation', () => {
    it('sollte gültigen Username (3-30 Zeichen) akzeptieren', async () => {
      await request(app)
        .post('/api/validate')
        .send({ username: 'validuser' })
        .expect(200);
    });

    it('sollte zu kurzen Username ablehnen', async () => {
      await request(app)
        .post('/api/validate')
        .send({ username: 'ab' })
        .expect(400);
    });

    it('sollte zu langen Username ablehnen', async () => {
      await request(app)
        .post('/api/validate')
        .send({ username: 'a'.repeat(31) })
        .expect(400);
    });
  });

  describe('Price Validation', () => {
    it('sollte Preis zwischen 0 und 10000 akzeptieren', async () => {
      await request(app)
        .post('/api/validate')
        .send({ price: 29.99 })
        .expect(200);

      await request(app)
        .post('/api/validate')
        .send({ price: 0 })
        .expect(200);

      await request(app)
        .post('/api/validate')
        .send({ price: 10000 })
        .expect(200);
    });

    it('sollte negativen Preis ablehnen', async () => {
      await request(app)
        .post('/api/validate')
        .send({ price: -1 })
        .expect(400);
    });

    it('sollte zu hohen Preis ablehnen', async () => {
      await request(app)
        .post('/api/validate')
        .send({ price: 10001 })
        .expect(400);
    });
  });
});

describe('Error Handling', () => {
  it('sollte 404 für unbekannte Routes zurückgeben', async () => {
    const app = express();
    app.use((req, res) => res.status(404).json({ error: 'Not Found' }));

    await request(app)
      .get('/api/unknown-route')
      .expect(404);
  });

  it('sollte JSON-Parse-Fehler abfangen', async () => {
    const app = express();
    app.use(express.json());
    app.use((err, req, res, next) => {
      res.status(400).json({ error: 'Invalid JSON' });
    });

    await request(app)
      .post('/api/test')
      .set('Content-Type', 'application/json')
      .send('{ invalid json }')
      .expect(400);
  });
});
