/// <reference types="cypress" />
import './commands'
import '@testing-library/cypress/add-commands'

declare global {
  namespace Cypress {
    interface Chainable<Subject = any> {
      seedStaff(fixture: '0staff' | '1staff' | '4staffWithError' | '6staff' | '7staff'): Chainable<void>
      resetDatabase(): Chainable<void>
    }
  }
}

// Prevent uncaught exceptions from failing tests
Cypress.on('uncaught:exception', (err, runnable) => {
  // returning false here prevents Cypress from failing the test
  return false
})

// Add custom command to reset the database state
Cypress.Commands.add('resetDatabase', () => {
  cy.window().then((win) => {
    win.localStorage.clear()
  })
})