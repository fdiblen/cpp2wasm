describe('src/js/example-app.html', () => {
  it('should render 3.14', () => {
    cy.visit('http://localhost:8000/src/js/example-app.html');
    // We append 0 to the initial value of the niter input field
    cy.get('input[name=niter]').type('0');
    cy.contains('Submit').click();
    cy.get('#answer').contains('3.14');
  });
});