import { appHost, timeouts } from './utils';

Cypress.Commands.add('getTestElement', (selector, timeout = timeouts.default) =>
  cy.get(`[data-test-id="${selector}"]`, { timeout }),
);
Cypress.Commands.add('getTestAction', (selector) =>
  cy.get(`[data-test-action="${selector}"]:not(.pf-m-disabled)`),
);
Cypress.Commands.add('createTestProject', (testName) => {
  /* TODO: need to implement params in Cypress
    const resource = browser.params.openshift === 'true' ? 'projects' : 'namespaces';
    await browser.get(`${appHost}/k8s/cluster/${resource}`);
  */
  cy.visit(`${appHost}/k8s/cluster/projects`);
  cy.getTestElement('yaml-create').click();
  cy.getTestElement('input-name').type(testName);
  cy.getTestElement('confirm-action')
    .click()
    .should('be', 'disabled');
  cy.getTestElement('resource-title').should('have.text', testName);
});

Cypress.Commands.add('deleteTestProject', (testName) => {
  cy.visit(`${appHost}/k8s/cluster/projects/${testName}`);
  cy.clickDetailsPageAction('Delete Project');
  cy.getTestElement('confirm-action').should('be', 'disabled');
  cy.getTestElement('project-name-input').type(testName);
  cy.getTestElement('confirm-action').should('not.be', 'disabled');
  cy.getTestElement('confirm-action').click();
});

Cypress.Commands.add('clickNavLink', (path) => {
  cy.get('.pf-c-nav > .pf-c-nav__list > .pf-c-nav__item').within(() => {
    // within pf-c-nav__items, find first el containing top menu, ie. "Monitoring", click it
    cy.contains(path[0]).click(); // opens/expands top menu
    // within pf-c-nav__items, find first el containing sub menu, ie. "Alerting", click it
    cy.contains(path[1]).click();
    // this assumes nav menu names are all unique
    // TODO: make this more selective, should just search through 'pf-m-current .pf-c-nav__subnav'
  });
});

Cypress.Commands.add('filterListPageByName', (name) => {
  cy.getTestElement('item-filter').type(name);
});

Cypress.Commands.add('clickDetailsPageAction', (actionID) => {
  cy.getTestElement('actions-menu-button').click();
  cy.getTestAction(actionID).click();
});

// Convert this to a module instead of script (allows import/export)
export {};
