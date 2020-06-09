// this JavaScript snippet is run by cypress and is stored as cypress/integration/example_spec.js
// Cypress.config('defaultCommandTimeout', 300000);

describe('src/js/example.html', () => {
  it('should render 3.14', () => {
    cy.visit('http://localhost:8000/src/js/example.html');
    cy.get('#answer').contains('3.14');
  });
});