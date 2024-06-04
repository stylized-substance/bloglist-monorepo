describe('bloglist app', function() {
  beforeEach(function() {
    cy.request('POST', 'http://localhost:3000/api/testing/reset')
    const user = {
      name: 'superuser',
      username: 'root',
      password: 'secretpassword'
    }
    const user2 = {
      name: 'anotheruser',
      username: 'toor',
      password: 'anotherpassword'
    }
    cy.request('POST', 'http://localhost:3000/api/users/', user)
    cy.request('POST', 'http://localhost:3000/api/users/', user2)
    cy.visit('http://localhost:3000')
  })

  it('login form is shown by default', function() {
    cy.contains('Log in to application')
    cy.get('#username-input')
    cy.get('#password-input')
    cy.get('#login-button')
  })

  describe('login', function() {
    it('works with correct credentials', function () {
      cy.get('#username-input').type('root')
      cy.get('#password-input').type('secretpassword')
      cy.get('#login-button').click()

      cy.contains('superuser logged in')
    })

    it('fails with wrong credentials', function() {
      cy.get('#username-input').type('root')
      cy.get('#password-input').type('wrongpassword')
      cy.get('#login-button').click()

      cy.get('.error').contains('Invalid credentials')
      cy.get('.error').should('have.css', 'color', 'rgb(255, 0, 0)')
    })
  })

  describe('when logged in', function() {
    beforeEach(function() {
      cy.request('POST', 'http://localhost:3003/api/login', {
        username: 'root',
        password: 'secretpassword'
      }).then(response => {
        cy.log(response.headers)
        localStorage.setItem('loggedOnUser', JSON.stringify(response.body))
        cy.request({
          method: 'POST',
          url: 'http://localhost:3003/api/blogs',
          body: {
            'title': 'least likes',
            'author': 'testblogauthor',
            'url': 'testblogurl',
            'likes': 1
          },
          'auth': {
            'bearer': response.body.token
          }
        })
        cy.request({
          method: 'POST',
          url: 'http://localhost:3003/api/blogs',
          body: {
            'title': 'second most likes',
            'author': 'testblogauthor',
            'url': 'testblogurl',
            'likes': 2
          },
          'auth': {
            'bearer': response.body.token
          }
        })
        cy.request({
          method: 'POST',
          url: 'http://localhost:3003/api/blogs',
          body: {
            'title': 'most likes',
            'author': 'testblogauthor',
            'url': 'testblogurl',
            'likes': 3
          },
          'auth': {
            'bearer': response.body.token
          }
        })
      })
      cy.visit('http://localhost:3000')
    })

    it('a new blog can be created', function() {
      cy.contains('Create blog').click()
      cy.get('#title-input').type('testing title')
      cy.get('#submit-button').click()
      cy.contains('testing title')
    })

    it('user can like posts', function() {
      cy.get('.more-button').first().click()
      cy.get('.like-button').first().click()
      cy.get('.likes').should('contain', 4)
    })

    it('user can remove a blog', function() {
      cy.get('.more-button').first().click()
      cy.get('.remove-button').click()
      cy.get('.blog').first().should('not.contain', 'least likes')
    })

    it('blog remove button is visible to the blog creator', function() {
      cy.get('.more-button').first().click()
      cy.get('.remove-button').should('be.visible')
    })

    it('blog remove button is not visible if not logged on as blog creator', function() {
      cy.get('#logout-button').click()
      cy.get('#username-input').type('toor')
      cy.get('#password-input').type('anotherpassword')
      cy.get('#login-button').click()
      cy.get('.more-button').first().click()
      cy.get('.remove-button').should('not.exist')
    })

    it('blogs are sorted by number of likes', function() {
      cy.get('.more-button').first().click()
      cy.get('.more-button').first().click()
      cy.get('.more-button').first().click()
      cy.get('.blog').eq(0).should('contain', 'most likes')
      cy.get('.blog').eq(1).should('contain', 'second most likes')
      cy.get('.blog').eq(2).should('contain', 'least likes')
    })
  })
})