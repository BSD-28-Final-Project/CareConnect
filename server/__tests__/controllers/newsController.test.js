import { describe, test, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import request from 'supertest';
import app from '../../testApp.js';
import { setupTestDB, teardownTestDB, clearDatabase } from '../helpers/testHelper.js';
import { ObjectId } from 'mongodb';

let db;
let token;
let adminToken;
let activityId;

beforeAll(async () => {
  const testDb = await setupTestDB();
  db = testDb.db;
  global.testDb = db;
});

afterAll(async () => {
  await teardownTestDB();
});

beforeEach(async () => {
  await clearDatabase();
  
  // Create regular user
  await request(app)
    .post('/api/users/register')
    .send({
      name: 'Regular User',
      email: 'user@example.com',
      password: 'password123',
      role: 'user'
    });

  const userLogin = await request(app)
    .post('/api/users/login')
    .send({
      email: 'user@example.com',
      password: 'password123'
    });

  token = userLogin.body.token;

  // Create admin user
  await request(app)
    .post('/api/users/register')
    .send({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'password123',
      role: 'admin'
    });

  const adminLogin = await request(app)
    .post('/api/users/login')
    .send({
      email: 'admin@example.com',
      password: 'password123'
    });

  adminToken = adminLogin.body.token;

  // Create test activity
  const activities = db.collection('activities');
  const activityResult = await activities.insertOne({
    title: 'Test Activity',
    description: 'Test description',
    category: 'environment',
    targetMoney: 10000000,
    collectedMoney: 5000000,
    collectedVolunteer: 0,
    images: [],
    listVolunteer: [],
    createdAt: new Date(),
    updatedAt: new Date()
  });
  activityId = activityResult.insertedId.toString();
});

describe('News Controller - Create News', () => {
  test('should create news successfully as admin', async () => {
    const newsData = {
      activityId: activityId,
      title: 'Activity Update',
      content: 'We have made great progress on the beach cleanup!',
      images: ['image1.jpg', 'image2.jpg']
    };

    const response = await request(app)
      .post('/api/news')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(newsData)
      .expect(201);

    expect(response.body).toHaveProperty('message', 'News created successfully');
    expect(response.body).toHaveProperty('data');
    expect(response.body.data).toHaveProperty('title', 'Activity Update');
    expect(response.body.data).toHaveProperty('content', newsData.content);
    expect(response.body.data).toHaveProperty('images');
    expect(response.body.data.images.length).toBe(2);
  });

  test('should create news without images', async () => {
    const newsData = {
      activityId: activityId,
      title: 'Activity Update',
      content: 'We have made great progress!'
    };

    const response = await request(app)
      .post('/api/news')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(newsData)
      .expect(201);

    expect(response.body.data).toHaveProperty('images');
    expect(response.body.data.images).toEqual([]);
  });

  test('should create news with authentication', async () => {
    const newsData = {
      activityId: activityId,
      title: 'Activity Update',
      content: 'We have made great progress!'
    };

    const response = await request(app)
      .post('/api/news')
      .set('Authorization', `Bearer ${token}`)
      .send(newsData)
      .expect(201);

    expect(response.body).toHaveProperty('message', 'News created successfully');
  });

  test('should fail when activityId is missing', async () => {
    const newsData = {
      title: 'Activity Update',
      content: 'We have made great progress!'
    };

    const response = await request(app)
      .post('/api/news')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(newsData)
      .expect(400);

    expect(response.body).toHaveProperty('message', 'activityId, title, and content are required');
  });

  test('should fail when title is missing', async () => {
    const newsData = {
      activityId: activityId,
      content: 'We have made great progress!'
    };

    const response = await request(app)
      .post('/api/news')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(newsData)
      .expect(400);

    expect(response.body).toHaveProperty('message', 'activityId, title, and content are required');
  });

  test('should fail when content is missing', async () => {
    const newsData = {
      activityId: activityId,
      title: 'Activity Update'
    };

    const response = await request(app)
      .post('/api/news')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(newsData)
      .expect(400);

    expect(response.body).toHaveProperty('message', 'activityId, title, and content are required');
  });

  test('should fail with invalid activityId', async () => {
    const newsData = {
      activityId: 'invalidid',
      title: 'Activity Update',
      content: 'We have made great progress!'
    };

    const response = await request(app)
      .post('/api/news')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(newsData)
      .expect(400);

    expect(response.body).toHaveProperty('message', 'Invalid activityId format');
  });

  test('should fail when activity does not exist', async () => {
    const fakeActivityId = new ObjectId().toString();
    const newsData = {
      activityId: fakeActivityId,
      title: 'Activity Update',
      content: 'We have made great progress!'
    };

    const response = await request(app)
      .post('/api/news')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(newsData)
      .expect(404);

    expect(response.body).toHaveProperty('message', 'Activity not found');
  });

  test('should trim title and content whitespace', async () => {
    const newsData = {
      activityId: activityId,
      title: '  Activity Update  ',
      content: '  We have made great progress!  '
    };

    const response = await request(app)
      .post('/api/news')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(newsData)
      .expect(201);

    expect(response.body.data.title).toBe('Activity Update');
    expect(response.body.data.content).toBe('We have made great progress!');
  });
});

describe('News Controller - Get All News', () => {
  let activityId2;

  beforeEach(async () => {
    const { ObjectId } = await import('mongodb');
    
    // Create second activity
    const activities = db.collection('activities');
    const activityResult2 = await activities.insertOne({
      title: 'Second Activity',
      description: 'Second description',
      category: 'social',
      targetMoney: 5000000,
      collectedMoney: 0,
      collectedVolunteer: 0,
      images: [],
      listVolunteer: [],
      createdAt: new Date(),
      updatedAt: new Date()
    });
    activityId2 = activityResult2.insertedId.toString();

    // Insert test news directly to database - PENTING: collection name harus 'activityNews'
    const newsCollection = db.collection('activityNews');
    const insertResult = await newsCollection.insertMany([
      {
        activityId: new ObjectId(activityId),
        title: 'First Update',
        content: 'Content 1',
        images: [],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        activityId: new ObjectId(activityId),
        title: 'Second Update',
        content: 'Content 2',
        images: ['image1.jpg'],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        activityId: new ObjectId(activityId2),
        title: 'Third Update',
        content: 'Content 3',
        images: [],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);

    // Verify data inserted
    const count = await newsCollection.countDocuments();
    if (count !== 3) {
      throw new Error(`Expected 3 news items in Get All News, but got ${count}`);
    }
  });

  test('should get all news', async () => {
    // Verify data exists before test
    const newsCollection = db.collection('activityNews');
    const count = await newsCollection.countDocuments();
    
    const response = await request(app)
      .get('/api/news')
      .expect(200);

    expect(response.body).toHaveProperty('data');
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBe(count); // Should match database count
    expect(response.body).toHaveProperty('total', count);
  });

  test('should filter news by activityId', async () => {
    const response = await request(app)
      .get(`/api/news?activityId=${activityId}`)
      .expect(200);

    expect(response.body).toHaveProperty('data');
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.total).toBeGreaterThanOrEqual(0);
    if (response.body.total > 0) {
      expect(response.body.data.every(n => n.activityId.toString() === activityId)).toBe(true);
    }
  });

  test('should return empty array when no news match filter', async () => {
    const fakeId = new ObjectId().toString();
    const response = await request(app)
      .get(`/api/news?activityId=${fakeId}`)
      .expect(200);

    expect(response.body).toHaveProperty('total', 0);
    expect(response.body.data.length).toBe(0);
  });

  test('should fail with invalid activityId format', async () => {
    const response = await request(app)
      .get('/api/news?activityId=invalidid')
      .expect(400);

    expect(response.body).toHaveProperty('message', 'Invalid activityId format');
  });
});

describe('News Controller - Get News By Activity', () => {
  beforeEach(async () => {
    const newsCollection = db.collection('activityNews');
    const { ObjectId } = await import('mongodb');
    await newsCollection.insertMany([
      {
        activityId: new ObjectId(activityId),
        title: 'First Update',
        content: 'Content 1',
        images: [],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        activityId: new ObjectId(activityId),
        title: 'Second Update',
        content: 'Content 2',
        images: ['image1.jpg'],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  });

  test('should get news for specific activity', async () => {
    const response = await request(app)
      .get(`/api/news/activity/${activityId}`)
      .expect(200);

    expect(response.body).toHaveProperty('data');
    expect(response.body).toHaveProperty('total');
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.total).toBeGreaterThanOrEqual(0);
    if (response.body.total > 0) {
      expect(response.body.data.every(n => n.activityId.toString() === activityId)).toBe(true);
    }
  });

  test('should return empty array for activity with no news', async () => {
    const fakeId = new ObjectId().toString();
    const response = await request(app)
      .get(`/api/news/activity/${fakeId}`)
      .expect(200);

    expect(response.body).toHaveProperty('total', 0);
  });

  test('should fail with invalid activityId', async () => {
    const response = await request(app)
      .get('/api/news/activity/invalidid')
      .expect(400);

    expect(response.body).toHaveProperty('message', 'Invalid activityId format');
  });
});

describe('News Controller - Get News By ID', () => {
  let newsId;

  beforeEach(async () => {
    const newsCollection = db.collection('activityNews');
    const { ObjectId } = await import('mongodb');
    const result = await newsCollection.insertOne({
      activityId: new ObjectId(activityId),
      title: 'Test News',
      content: 'Test content',
      images: [],
      createdAt: new Date(),
      updatedAt: new Date()
    });
    newsId = result.insertedId.toString();
  });

  test('should get news by valid ID', async () => {
    const response = await request(app)
      .get(`/api/news/${newsId}`)
      .expect(200);

    expect(response.body).toHaveProperty('data');
    expect(response.body.data).toHaveProperty('title', 'Test News');
    expect(response.body.data).toHaveProperty('content', 'Test content');
  });

  test('should return 404 for non-existent news', async () => {
    const fakeId = new ObjectId().toString();
    const response = await request(app)
      .get(`/api/news/${fakeId}`)
      .expect(404);

    expect(response.body).toHaveProperty('message', 'News not found');
  });

  test('should return 400 for invalid ID format', async () => {
    const response = await request(app)
      .get('/api/news/invalidid')
      .expect(400);

    expect(response.body).toHaveProperty('message', 'Invalid news ID format');
  });
});

describe('News Controller - Update News', () => {
  let newsId;

  beforeEach(async () => {
    const newsCollection = db.collection('activityNews');
    const { ObjectId } = await import('mongodb');
    const result = await newsCollection.insertOne({
      activityId: new ObjectId(activityId),
      title: 'Original Title',
      content: 'Original content',
      images: [],
      createdAt: new Date(),
      updatedAt: new Date()
    });
    newsId = result.insertedId.toString();
  });

  test('should update news', async () => {
    const updateData = {
      title: 'Updated Title',
      content: 'Updated content',
      images: ['newimage.jpg']
    };

    const response = await request(app)
      .put(`/api/news/${newsId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send(updateData)
      .expect(200);

    expect(response.body).toHaveProperty('message', 'News updated successfully');
  });

  test('should return 404 for non-existent news', async () => {
    const fakeId = new ObjectId().toString();
    const response = await request(app)
      .put(`/api/news/${fakeId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ title: 'Updated' })
      .expect(404);

    expect(response.body).toHaveProperty('message', 'News not found');
  });
});

describe('News Controller - Delete News', () => {
  let newsId;

  beforeEach(async () => {
    const newsCollection = db.collection('activityNews');
    const { ObjectId } = await import('mongodb');
    const result = await newsCollection.insertOne({
      activityId: new ObjectId(activityId),
      title: 'To Be Deleted',
      content: 'Test content',
      images: [],
      createdAt: new Date(),
      updatedAt: new Date()
    });
    newsId = result.insertedId.toString();
  });

  test('should delete news', async () => {
    const response = await request(app)
      .delete(`/api/news/${newsId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(response.body).toHaveProperty('message', 'News deleted successfully');
  });

  test('should return 404 for non-existent news', async () => {
    const { ObjectId } = await import('mongodb');
    const fakeId = new ObjectId().toString();
    const response = await request(app)
      .delete(`/api/news/${fakeId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(404);

    expect(response.body).toHaveProperty('message', 'News not found');
  });
});

describe('News Controller - Additional Coverage Tests', () => {
  beforeEach(async () => {
    await clearDatabase();
    
    // Insert test activity
    const { ObjectId } = await import('mongodb');
    const activities = db.collection('activities');
    await activities.insertOne({
      _id: new ObjectId(activityId),
      title: 'Test Activity',
      description: 'Test Description',
      category: 'education',
      targetMoney: 5000000,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  });

  test('should return 400 for invalid news ID format on get by id', async () => {
    const response = await request(app)
      .get('/api/news/invalid-id')
      .expect(400);

    expect(response.body).toHaveProperty('message', 'Invalid news ID format');
  });

  test('should return 400 for invalid news ID format on update', async () => {
    const response = await request(app)
      .put('/api/news/invalid-id')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ title: 'Updated' })
      .expect(400);

    expect(response.body).toHaveProperty('message', 'Invalid news ID format');
  });

  test('should return 400 for invalid news ID format on delete', async () => {
    const response = await request(app)
      .delete('/api/news/invalid-id')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(400);

    expect(response.body).toHaveProperty('message', 'Invalid news ID format');
  });

  test('should return 400 for invalid activityId in query filter', async () => {
    const response = await request(app)
      .get('/api/news?activityId=invalid-id')
      .expect(400);

    expect(response.body).toHaveProperty('message', 'Invalid activityId format');
  });

  test('should return 400 for invalid activityId in getNewsByActivity', async () => {
    const response = await request(app)
      .get('/api/news/activity/invalid-id')
      .expect(400);

    expect(response.body).toHaveProperty('message', 'Invalid activityId format');
  });

  test('should return empty array for activity with no news', async () => {
    const { ObjectId } = await import('mongodb');
    const fakeActivityId = new ObjectId().toString();
    
    // Create activity without news
    const activities = db.collection('activities');
    await activities.insertOne({
      _id: new ObjectId(fakeActivityId),
      title: 'Activity Without News',
      description: 'Test',
      category: 'social',
      targetMoney: 1000000,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const response = await request(app)
      .get(`/api/news/activity/${fakeActivityId}`)
      .expect(200);

    expect(response.body).toHaveProperty('data');
    expect(response.body.data).toHaveLength(0);
    expect(response.body).toHaveProperty('total', 0);
  });

  test('should update only title in news', async () => {
    const newsCollection = db.collection('activityNews');
    const { ObjectId } = await import('mongodb');
    const newsResult = await newsCollection.insertOne({
      activityId: new ObjectId(activityId),
      title: 'Original Title',
      content: 'Original Content',
      images: [],
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const response = await request(app)
      .put(`/api/news/${newsResult.insertedId.toString()}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ title: 'Updated Title Only' })
      .expect(200);

    expect(response.body.data.title).toBe('Updated Title Only');
    expect(response.body.data.content).toBe('Original Content');
  });

  test('should update only content in news', async () => {
    const newsCollection = db.collection('activityNews');
    const { ObjectId } = await import('mongodb');
    const newsResult = await newsCollection.insertOne({
      activityId: new ObjectId(activityId),
      title: 'Original Title',
      content: 'Original Content',
      images: [],
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const response = await request(app)
      .put(`/api/news/${newsResult.insertedId.toString()}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ content: 'Updated Content Only' })
      .expect(200);

    expect(response.body.data.title).toBe('Original Title');
    expect(response.body.data.content).toBe('Updated Content Only');
  });

  test('should update images in news', async () => {
    const newsCollection = db.collection('activityNews');
    const { ObjectId } = await import('mongodb');
    const newsResult = await newsCollection.insertOne({
      activityId: new ObjectId(activityId),
      title: 'News with Images',
      content: 'Content',
      images: ['old1.jpg'],
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const response = await request(app)
      .put(`/api/news/${newsResult.insertedId.toString()}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ images: ['new1.jpg', 'new2.jpg'] })
      .expect(200);

    expect(response.body.data.images).toEqual(['new1.jpg', 'new2.jpg']);
  });

  test('should handle news with images array in create', async () => {
    const newsData = {
      activityId: activityId,
      title: 'News with Images',
      content: 'Some content',
      images: ['image1.jpg', 'image2.jpg', 'image3.jpg']
    };

    const response = await request(app)
      .post('/api/news')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(newsData)
      .expect(201);

    expect(response.body.data.images).toEqual(['image1.jpg', 'image2.jpg', 'image3.jpg']);
  });

  test('should return 404 when updating non-existent news', async () => {
    const { ObjectId } = await import('mongodb');
    const fakeId = new ObjectId().toString();
    
    const response = await request(app)
      .put(`/api/news/${fakeId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ title: 'Updated' })
      .expect(404);

    expect(response.body).toHaveProperty('message', 'News not found');
  });
});

describe('News Controller - Get Latest News', () => {
  beforeEach(async () => {
    await clearDatabase();
    
    const { ObjectId } = await import('mongodb');
    const activities = db.collection('activities');
    await activities.insertOne({
      _id: new ObjectId(activityId),
      title: 'Test Activity',
      description: 'Test',
      category: 'education',
      targetMoney: 5000000,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Insert multiple news with different dates
    const newsCollection = db.collection('activityNews');
    await newsCollection.insertMany([
      {
        activityId: new ObjectId(activityId),
        title: 'News 1',
        content: 'Content 1',
        images: [],
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      },
      {
        activityId: new ObjectId(activityId),
        title: 'News 2',
        content: 'Content 2',
        images: [],
        createdAt: new Date('2024-01-02'),
        updatedAt: new Date('2024-01-02')
      },
      {
        activityId: new ObjectId(activityId),
        title: 'News 3',
        content: 'Content 3',
        images: [],
        createdAt: new Date('2024-01-03'),
        updatedAt: new Date('2024-01-03')
      }
    ]);
  });

  test('should get latest news with default limit', async () => {
    const response = await request(app)
      .get('/api/news/latest')
      .expect(200);

    expect(response.body).toHaveProperty('data');
    expect(response.body).toHaveProperty('total');
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  test('should get latest news with custom limit', async () => {
    const response = await request(app)
      .get('/api/news/latest?limit=2')
      .expect(200);

    expect(response.body).toHaveProperty('data');
    expect(response.body.data.length).toBeLessThanOrEqual(2);
  });

  test('should return 400 for invalid limit (negative)', async () => {
    const response = await request(app)
      .get('/api/news/latest?limit=-5')
      .expect(400);

    expect(response.body).toHaveProperty('message', 'Invalid limit parameter');
  });

  test('should return 400 for invalid limit (zero)', async () => {
    const response = await request(app)
      .get('/api/news/latest?limit=0')
      .expect(400);

    expect(response.body).toHaveProperty('message', 'Invalid limit parameter');
  });

  test('should return 400 for invalid limit (not a number)', async () => {
    const response = await request(app)
      .get('/api/news/latest?limit=abc')
      .expect(400);

    expect(response.body).toHaveProperty('message', 'Invalid limit parameter');
  });

  test('should return news sorted by createdAt descending', async () => {
    const response = await request(app)
      .get('/api/news/latest?limit=10')
      .expect(200);

    if (response.body.data.length > 1) {
      // Check if sorted descending
      const dates = response.body.data.map(n => new Date(n.createdAt).getTime());
      for (let i = 0; i < dates.length - 1; i++) {
        expect(dates[i]).toBeGreaterThanOrEqual(dates[i + 1]);
      }
    }
  });
});
