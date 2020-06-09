// Cypress.config('defaultCommandTimeout', 300000);
describe('src/js/example-jsonschema-form.html', () => {
  it('should render 3.14', () => {
    cy.visit('http://localhost:8000/src/js/example-jsonschema-form.html');
    // The JSON schema powered form uses a hierarchy of identifiers for each input field starting with `root`
    // As the `niter` input field is a direct child of root, it has `root_niter` as an identifier
    const input_selector = 'input[id=root_niter]';
    // In initial niter input field we replace the default value with 10000000
    cy.get(input_selector).type('{selectall}10000000');
    cy.contains('Submit').click();
    cy.get('#answer').contains('3.14');
  });
});