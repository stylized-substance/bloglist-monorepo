const Blog = require('../models/blog');
const User = require('../models/user')

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
  // eslint-disable-next-line
  const blog = new Blog({ title: thiswillbedeleted });
  await blog.save();
  await blog.deleteOne();

  return blog._id.toString();
};

const blogsInDb = async () => {
  const blogs = await Blog.find({});
  return blogs
};

const usersInDb = async () => {
  const users = await User.find({})
  return users
}

module.exports = {
  initialBlogs, nonExistingId, blogsInDb, usersInDb
};
