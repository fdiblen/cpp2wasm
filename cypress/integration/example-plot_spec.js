// Cypress.config('defaultCommandTimeout', 300000);
describe('src/js/example-plot.html', () => {
  it('should render 3.14', () => {
    cy.visit('http://localhost:8000/src/js/example-plot.html');
    cy.contains('Submit').click();
    // TODO assert plot has been plotted, see https://github.com/NLESC-JCER/cpp2wasm/issues/55
  });
});