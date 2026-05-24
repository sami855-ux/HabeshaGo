describe("Login Page", () => {
  it("logs in successfully", () => {
    cy.visit("/login")

    cy.get('input[name="email"]').type("admin@gmail.com")
    cy.get('input[name="password"]').type("123456")

    cy.get('button[type="submit"]').click()

    cy.url().should("include", "/dashboard")
  })
})
