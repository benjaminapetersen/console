import './commands';

// Must be declared global to be detected by typescript (allows import/export)
// eslint-disable @typescript/interface-name
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace,no-redeclare
  namespace Cypress {
    interface Chainable<Subject> {
      getTestElement(selector: string, timeout?: number): Chainable<Element>;
      getTestAction(selector: string): Chainable<Element>;
      createTestProject(testName: string): Chainable<Element>;
      deleteTestProject(testName: string): Chainable<Element>;
      clickNavLink(path: [string, string]): Chainable<Element>;
      filterListPageByName(name: string): Chainable<Element>;
      clickDetailsPageAction(actionID: string): Chainable<Element>;
    }
  }
}
