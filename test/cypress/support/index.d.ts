declare namespace Cypress {
  interface Chainable {
    login(email: string): Chainable<void>
  }
}
