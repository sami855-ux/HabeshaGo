Cypress.Commands.add("login", (email: string) => {
  cy.visit("/login")

  cy.get("#email").type(email)

  cy.contains("Continue with Email").click()

  cy.url().should("include", "/verify-request")
})
