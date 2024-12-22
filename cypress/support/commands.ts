/// <reference types="cypress" />
import { STAFF_STORAGE_KEY } from '../../src/constants/app-constants'

declare global {
  namespace Cypress {
    interface Chainable<Subject = any> {
      seedStaff(fixture: '0staff' | '1staff' | '4staffWithError' | '6staff' | '7staff'): Chainable<void>
    }
  }
}

Cypress.Commands.add('seedStaff', (fixture: '0staff' | '1staff' | '4staffWithError' | '6staff' | '7staff') => {
  return cy.fixture(fixture).then((staff) => {
    localStorage.setItem(STAFF_STORAGE_KEY, JSON.stringify(staff))
  })
})