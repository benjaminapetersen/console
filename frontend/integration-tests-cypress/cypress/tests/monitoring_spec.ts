import { timeouts, testName, submitButton, errorMessage } from '../support/utils';

const testDetailsPage = (pageTitle: string, sectionHeading: string, testLabel = true) => {
  cy.getTestElement('resource-title', timeouts.pageLoad).contains(pageTitle); // long timeout for detail page to load
  cy.getTestElement('section-heading')
    .first()
    .should('have.text', sectionHeading);
  if (testLabel) {
    cy.get('.co-m-label')
      .first()
      .contains(`alertname=${pageTitle}`);
  }
};

describe('Monitoring: Alerts', () => {
  // TODO: need to move these to before/after all specs run,
  //  not just before/after this spec
  before(() => {
    cy.createTestProject(testName);
  });
  after(() => {
    cy.deleteTestProject(testName);
  });

  it('displays the Alerts list page', () => {
    cy.clickNavLink(['Monitoring', 'Alerting']);
    cy.getTestElement('resource-title').should('have.text', 'Alerting');
  });

  it('does not have a namespace dropdown', () => {
    cy.getTestElement('namespace-bar-dropdown').should('not.exist');
  });

  it('filters Alerts by name', () => {
    cy.filterListPageByName('Watchdog  pipe'); // needed 'pipe' for more specificity for fuzzy search
    cy.getTestElement('alert-resource-link')
      .should('have.length', 1)
      .should('have.text', 'Watchdog');
  });

  it('displays Alert details page', () => {
    cy.getTestElement('alert-resource-link')
      .first()
      .should('have.text', 'Watchdog')
      .click();
    testDetailsPage('Watchdog', 'Alert Details');
  });

  it('links to the Alerting Rule details page', () => {
    cy.getTestElement('alert-rules-detail-resource-link')
      .contains('Watchdog')
      .click();
    testDetailsPage('Watchdog', 'Alerting Rule Details', false);
    // Active Alerts list should contain a link back to the Alert details page
    cy.getTestElement('active-alerts')
      .first()
      .click();
    testDetailsPage('Watchdog', 'Alert Details');
  });

  it('creates a new Silence from an existing alert', () => {
    // After creating the Silence, should be redirected to its details page
    cy.contains('Silence Alert').click();
    cy.get(submitButton).click();
    cy.get(errorMessage).should('not.exist');
    testDetailsPage('Watchdog', 'Silence Details');
  });

  it('shows the silenced Alert in the Silenced Alerts list', () => {
    // Click the link to navigate back to the Alert details link
    cy.getTestElement('firing-alerts')
      .first()
      .should('have.text', 'Watchdog')
      .click();
    testDetailsPage('Watchdog', 'Alert Details');
  });

  it('shows the newly created Silence in the Silenced By list', () => {
    // Click the link to navigate back to the Silence details page
    cy.getTestElement('silence-resource-link')
      .first()
      .should('have.text', 'Watchdog')
      .click();
    testDetailsPage('Watchdog', 'Silence Details');
  });

  it('expires the Silence', () => {
    cy.clickDetailsPageAction('Expire Silence');
    cy.get(submitButton).click();
    cy.get(errorMessage).should('not.exist');
    // wait for expiredSilenceIcon
    cy.get('.co-m-pane__details [data-test-id="ban-icon"]', { timeout: timeouts.pageLoad }).should(
      'exist',
    );
  });
});
