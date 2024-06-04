const Blog = require('../models/blog');
const User = require('../models/user')

const newBlog = {
  title: 'testblogtitle',
  author: 'testblogauthor',
  url: 'testblogURL',
  likes: 99,
};

const initialBlogs = [
  {
    title: 'testblogtitle',
    author: 'testblogauthor',
    url: 'testblogURL',
    likes: 99,
  },
  {
    title: 'testblogtitle2',
    author: 'testblogauthor2',
    url: 'testblogURL2',
    likes: 99,
  },
];

const nonExistingId = async () => {
  const blog = new Blog({ title: thiswillbedeleted });
  await blog.save();
  await blog.deleteOne();

  return blog._id.toString();
};

const blogsInDb = async () => {
  const blogs = await Blog.find({});
  return blogs
  // return blogs.map((blog) => blog.toJSON());
  // return JSON.stringify(blogs)
  // return Object.keys(blogs).map(blog => [blog.title, blog[blog.title]]);

};

const usersInDb = async () => {
  const users = await User.find({})
  return users
}

module.exports = {
  initialBlogs, nonExistingId, blogsInDb, usersInDb
};
