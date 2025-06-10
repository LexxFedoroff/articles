/// <reference types="cypress" />
import App from './App'

describe('App Component', () => {
  beforeEach(() => {
    cy.mount(<App />)
  })

  it('should render the app correctly', () => {
    cy.contains('Vite + React').should('be.visible')
    cy.get('[data-testid="increment-btn"]').should('contain', 'count is 0')
    cy.get('[data-testid="reset-btn"]').should('contain', 'Reset')
  })

  it('should display logos with correct links', () => {
    cy.get('a[href="https://vite.dev"]').should('be.visible')
    cy.get('a[href="https://react.dev"]').should('be.visible')
    cy.get('img[alt="Vite logo"]').should('be.visible')
    cy.get('img[alt="React logo"]').should('be.visible')
  })

  it('should increment counter on button click', () => {
    cy.get('[data-testid="increment-btn"]').should('contain', 'count is 0')
    cy.get('[data-testid="increment-btn"]').click()
    cy.get('[data-testid="increment-btn"]').should('contain', 'count is 1')
    cy.get('[data-testid="increment-btn"]').click()
    cy.get('[data-testid="increment-btn"]').should('contain', 'count is 2')
  })

  it('should reset counter to 0', () => {
    // Increment a few times
    cy.get('[data-testid="increment-btn"]').click()
    cy.get('[data-testid="increment-btn"]').click()
    cy.get('[data-testid="increment-btn"]').click()
    cy.get('[data-testid="increment-btn"]').should('contain', 'count is 3')
    
    // Reset
    cy.get('[data-testid="reset-btn"]').click()
    cy.get('[data-testid="increment-btn"]').should('contain', 'count is 0')
  })

  it('should display even/odd status correctly', () => {
    // Start at 0 (even)
    cy.get('.even-count').should('contain', 'Count is even')
    
    // Click to 1 (odd)
    cy.get('[data-testid="increment-btn"]').click()
    cy.get('.odd-count').should('contain', 'Count is odd')
    
    // Click to 2 (even)
    cy.get('[data-testid="increment-btn"]').click()
    cy.get('.even-count').should('contain', 'Count is even')
    
    // Click to 3 (odd)
    cy.get('[data-testid="increment-btn"]').click()
    cy.get('.odd-count').should('contain', 'Count is odd')
  })

  it('should have correct styling for even/odd states', () => {
    // Even state (0)
    cy.get('.even-count').should('have.css', 'color', 'rgb(74, 222, 128)')
    
    // Odd state (1)
    cy.get('[data-testid="increment-btn"]').click()
    cy.get('.odd-count').should('have.css', 'color', 'rgb(249, 115, 22)')
  })

  it('should show HMR instruction text', () => {
    cy.contains('Edit src/App.tsx and save to test HMR').should('be.visible')
  })

  it('should show learn more text', () => {
    cy.contains('Click on the Vite and React logos to learn more').should('be.visible')
  })
})