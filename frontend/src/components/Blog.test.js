import React from 'react'
import '@testing-library/jest-dom/extend-expect'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Blog from './Blog'
import CreateForm from './CreateForm'

test('title and author are rendered, but not url and likes', () => {
  const blog = {
    title: 'TestTitle',
    author: 'TestAuthor',
    url: 'TestUrl',
    likes: 1,
    user: {
      username: 'TestUser'
    }
  }

  const { container } = render(<Blog blog={blog} />)

  const title = container.querySelector('.title')
  const author = container.querySelector('.author')
  const url = container.querySelector('.url')
  const likes = container.querySelector('.likes')

  expect(title).toHaveTextContent(blog.title)
  expect(author).toHaveTextContent(blog.author)
  expect(url).not.toBeInTheDocument()
  expect(likes).not.toBeInTheDocument()
})

test('url and likes are shown after pressing more-button', async () => {
  const blog = {
    title: 'TestTitle',
    author: 'TestAuthor',
    url: 'TestUrl',
    likes: 1,
    user: {
      username: 'TestUser'
    }
  }

  const { container } = render(<Blog blog={blog} />)

  const user = userEvent.setup()
  const button = screen.getByText('More')
  await user.click(button)

  const url = container.querySelector('.url')
  const likes = container.querySelector('.likes')

  expect(url).toBeInTheDocument()
  expect(likes).toBeInTheDocument()
})

test('clicking like twice calls event handler twice', async () => {
  const blog = {
    title: 'TestTitle',
    author: 'TestAuthor',
    url: 'TestUrl',
    likes: 1,
    user: {
      username: 'TestUser'
    }
  }

  const mockHandler = jest.fn()

  render(<Blog blog={blog} handleLike={mockHandler} />)

  const user = userEvent.setup()

  const moreButton = screen.getByText('More')
  await user.click(moreButton)

  const likeButton = screen.getByText('Like')
  await user.click(likeButton)
  await user.click(likeButton)

  expect(mockHandler.mock.calls).toHaveLength(2)

})

test('CreateForm calls event handler with right details when blog is created', async () => {
  const createBlog = jest.fn()
  const user = userEvent.setup()

  const { container } = render(<CreateForm createBlog={createBlog} />)

  const titleInput = container.querySelector('#title-input')
  const authorInput = container.querySelector('#author-input')
  const urlInput = container.querySelector('#url-input')
  const submitButton = container.querySelector('#submit-button')

  await user.type(titleInput, 'testing title..')
  await user.type(authorInput, 'testing author..')
  await user.type(urlInput, 'testing url..')

  await user.click(submitButton)

  expect(createBlog.mock.calls).toHaveLength(1)
  expect(createBlog.mock.calls[0][0].title).toBe('testing title..')
  expect(createBlog.mock.calls[0][0].author).toBe('testing author..')
  expect(createBlog.mock.calls[0][0].url).toBe('testing url..')
})