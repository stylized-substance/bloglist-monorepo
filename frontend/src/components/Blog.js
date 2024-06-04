import { useState } from 'react'

const Blog = ({ blog, handleLike, handleRemove, user }) => {
  const [visible, setVisible] = useState(false)

  const toggleVisibility = () => {
    setVisible(!visible)
  }

  const blogStyle = {
    paddingTop: 10,
    paddingLeft: 2,
    border: 'solid',
    borderWidth: 1,
    marginBottom: 5
  }

  const LikeButton = ({ id, handleLike, title }) => {
    return (
      <button onClick={() => handleLike(id, title)} className="like-button">
        Like
      </button>
    )
  }

  const RemoveButton = ({ id, handleRemove, title }) => {
    if (blog.user.username === user) {
      return (
        <button className="remove-button" onClick={() => handleRemove(id, title)}>
        Remove
        </button>
      )
    }
  }
  return (
    <div className="blog" style={blogStyle}>
      <div className="title">
        {blog.title}
      </div>
      <div className="author">
        {blog.author}
      </div>
      {!visible && (
        <div>
          <button onClick={toggleVisibility} className="more-button">
            More
          </button>
        </div>
      )}
      {visible && (
        <div className="moreinfo">
          <div className="url">
            {blog.url}
          </div>
          <div className="likes">
            Likes: {blog.likes}
          </div>
          <div>
            Added by: {blog.user.name}
          </div>
          <div>
            <button onClick={toggleVisibility}>
              Less
            </button>
          </div>
          <div>
            <LikeButton id={blog.id} handleLike={handleLike} title={blog.title} />
            <RemoveButton id={blog.id} handleRemove={handleRemove} title={blog.title} />
          </div>
        </div>
      )}
    </div>
  )
}

export default Blog