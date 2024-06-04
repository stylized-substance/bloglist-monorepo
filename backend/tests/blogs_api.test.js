const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');
const helper = require('../utils/test_helper');

const api = supertest(app);
const Blog = require('../models/blog');
const bcrypt = require('bcrypt');
const User = require('../models/user');

describe('misc tests', () => {
  let token;
  beforeEach(async () => {
    // Empty out database

    await Blog.deleteMany({});

    // Create user

    await User.deleteMany({});

    const user = {
      username: 'root',
      password: 'secretpassword',
    };

    const passwordHash = await bcrypt.hash(user.password, 10);
    const userObject = new User({ username: user.username, passwordHash });
    await userObject.save();

    // Acquire bearer token

    const loginInfo = {
      username: 'root',
      password: 'secretpassword',
    };

    const result = await api
      .post('/api/login')
      .send(loginInfo);

    token = result.body.token;
  });

  test('a valid blog can be added', async () => {
    const newBlog = {
      title: 'testblogtitle',
      author: 'testblogauthor',
      url: 'testblogURL',
      likes: 99,
    };

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/);

    const blogsAtEnd = await helper.blogsInDb();
    expect(blogsAtEnd).toHaveLength(1);
    const titles = blogsAtEnd.map((r) => r.title);
    expect(titles).toContain(
      'testblogtitle',
    );
  });

  test('missing blog title gets response 400', async () => {
    const newBlog = {
      author: 'testblogauthor',
      url: 'testblogURL',
      likes: 99,
    };

    const response = await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlog)
      .expect(400)
      .expect('Content-Type', /application\/json/);
    expect(response.body).toContain('blog title missing');
  });

  test('missing url property gets response 400', async () => {
    const newBlog = {
      title: 'testblogtitle',
      author: 'testblogauthor',
      likes: 99,
    };

    const response = await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlog)
      .expect(400)
      .expect('Content-Type', /application\/json/);
    expect(response.body).toContain('blog url missing');
  });

  test('missing likes property defaults to 0', async () => {
    const newBlog = {
      title: 'testblogtitle',
      author: 'testblogauthor',
      url: 'testblogURL',
    };

    const response = await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/);
    expect(response.body.likes === 0);
  });

  describe('when there are blogs saved initially', () => {
    beforeEach(async () => {
      await Blog.deleteMany({});
      let blogObject = new Blog(helper.initialBlogs[0]);
      await blogObject.save();
      blogObject = new Blog(helper.initialBlogs[1]);
      await blogObject.save();
    });

    test('all blogs are returned as json', async () => {
      const response = await api
        .get('/api/blogs')
        .expect(200)
        .expect('Content-Type', /application\/json/);
      expect(response.body).toHaveLength(helper.initialBlogs.length);
    });

    test('blog posts unique ID is named id', async () => {
      const response = await api
        .get('/api/blogs')
        .expect(200);
      const { body } = response;
      body.forEach((blog) => {
        expect(blog.id).toBeDefined();
      });
    });

    test('there are two blogs', async () => {
      const response = await api
        .get('/api/blogs')
        .expect(200);
      expect(response.body).toHaveLength(2);
    });

    test('the first blog is titled testblogtitle', async () => {
      const response = await api
        .get('/api/blogs')
        .expect(200);
      expect(response.body[0].title).toBe('testblogtitle');
    });

    test('a blog titled testblogtitle is within the returned blogs', async () => {
      const response = await api
        .get('/api/blogs')
        .expect(200);
      const contents = response.body.map((blog) => blog.title);
      expect(contents).toContain(
        'testblogtitle',
      );
    });

    test('blog likes can be updated by Id', async () => {
      const response = await api
        .get('/api/blogs');
      const { id } = response.body[0];

      const update = {
        likes: 100,
      }

      const putResponse = await api
        .put(`/api/blogs/${id}`)
        .send(update)
        .expect(200)
        .expect('Content-Type', /application\/json/)
      expect(putResponse.body.likes).toEqual(update.likes)
    });
  });
});

describe('when there are initially two users in db', () => {
  beforeEach(async () => {
    await User.deleteMany({});

    const users = [{
      username: 'root',
      password: 'secretpassword',
    },
    {
      username: 'wronguser',
      password: 'secretpassword',
    }];

    for await (user of users) {
      const passwordHash = await bcrypt.hash(user.password, 10);
      const userObject = new User({ username: user.username, passwordHash });
      await userObject.save();
    }
  });

  test('creation succeeds with a fresh username', async () => {
    const usersAtStart = await helper.usersInDb();

    const newUser = {
      username: 'testuser',
      name: 'test user',
      password: 'secret',
    };

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/);

    const usersAtEnd = await helper.usersInDb();
    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1);

    const usernames = usersAtEnd.map((user) => user.username);
    expect(usernames).toContain(newUser.username);
  });

  test('creation fails if username is already taken', async () => {
    const usersAtStart = await helper.usersInDb();

    const newUser = {
      username: 'root',
      name: 'root user',
      password: 'secretpassword',
    };

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/);

    expect(result.body.error).toContain('username is already taken');

    const usersAtEnd = await helper.usersInDb();
    expect(usersAtEnd).toEqual(usersAtStart);
  });

  test('logging in fails with wrong password', async () => {
    const loginInfo = {
      username: 'root',
      password: 'wrongpassword',
    };

    const result = await api
      .post('/api/login')
      .send(loginInfo)
      .expect(401)
      .expect('Content-Type', /application\/json/);
  });

  test('posting a blog works after logging in', async () => {
    const loginInfo = {
      username: 'root',
      password: 'secretpassword',
    };

    const result = await api
      .post('/api/login')
      .send(loginInfo);

    const { token } = result.body;

    const newBlog = {
      title: 'testblogtitle',
      author: 'testblogauthor',
      url: 'testblogURL',
      likes: 99,
    };

    const postResult = await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/);
  });

  test('posting a blog fails without login', async () => {
    const newBlog = {
      title: 'testblogtitle',
      author: 'testblogauthor',
      url: 'testblogURL',
      likes: 99,
    };

    const postResult = await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(401)
      .expect('Content-Type', /application\/json/);
  })

  describe('a blog can be deleted by ID (only by the user who added the blog)', () => {
    test('deleting a blog works by user who created it', async () => {
      const loginInfo = {
        username: 'root',
        password: 'secretpassword',
      };

      const result = await api
        .post('/api/login')
        .send(loginInfo);

      const { token } = result.body;

      const newBlog = {
        title: 'testblogtitle',
        author: 'testblogauthor',
        url: 'testblogURL',
        likes: 99,
      };

      const postResult = await api
        .post('/api/blogs')
        .set('Authorization', `Bearer ${token}`)
        .send(newBlog);

      const blogId = postResult.body.id;

      const deleteResult = await api
        .delete(`/api/blogs/${blogId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(204);
    });

    test('deleting a blog doesnt work if deleting user is not the creator', async () => {
      // Login as a user and post a blog

      let loginInfo = {
        username: 'root',
        password: 'secretpassword',
      };

      let result = await api
        .post('/api/login')
        .send(loginInfo);

      let { token } = result.body;

      const newBlog = {
        title: 'testblogtitle',
        author: 'testblogauthor',
        url: 'testblogURL',
        likes: 99,
      };

      const postResult = await api
        .post('/api/blogs')
        .set('Authorization', `Bearer ${token}`)
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/);
      expect(postResult.body.user.username).toEqual(loginInfo.username)

      const blogId = postResult.body.id;

      // Login as another user and try to delete previous users's blog

      loginInfo = {
        username: 'wronguser',
        password: 'secretpassword',
      };

      result = await api
        .post('/api/login')
        .send(loginInfo);

      token = result.body.token;

      const deleteResult = await api
        .delete(`/api/blogs/${blogId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(401);
    });
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});
