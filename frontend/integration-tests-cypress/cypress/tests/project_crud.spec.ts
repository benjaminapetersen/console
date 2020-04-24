import { 
  appHost, 
  timeouts 
} from '../support/utils';

const getElemByDataId = dataId => cy.get(`[data-test-id="${dataId}"]`);

// helpers other actions can use to build more complex actions
const genericActions = {
  clickActionMenuItemByText: (text) => {
    getElemByDataId('actions-menu-button').click();
    cy.get(`[data-test-action="${text}"]:not(.pf-m-disabled)`).click();
  },
}

// namespaced sets of helpers, seem to need 3 things:
// - visit to go to pages
// - actions to do things on pages
// - asserts to pass/fail the test
const project = {
  detailsPage: {
    visit: (name) => cy.visit(`${appHost}/k8s/cluster/projects/${name}`),  
    actions: {
      // easier than list page
      deleteProject: (name) => {
        genericActions.clickActionMenuItemByText("Delete Project");        
        getElemByDataId('confirm-action').should('be', 'disabled');
        getElemByDataId('project-name-input').type(name);
        getElemByDataId('confirm-action').should('not.be', 'disabled');
        getElemByDataId('confirm-action').click();
      }
    },
    assert: {
      titleShouldBe: (text) => getElemByDataId('resource-title').should('have.text', text)
    }    
  },
  listPage: {
    visit: () => cy.visit(`${appHost}/k8s/cluster/projects`),
    // list page requires finding project row before clicking delete project
    actions: {
      createByName: (name) => {    
        getElemByDataId('yaml-create').click();    
        getElemByDataId('input-name').type(name);
        getElemByDataId('confirm-action')
          .click()
          .should('be', 'disabled');
      },
      deleteProjectByName: (projectRowName) => {},
    },
    assert: {
      rowShouldExit: (projectName) => cy
          .get(`tr .co-resource-item__resource-name[data-test-id="${projectName}"]`)
          .should('exist'),      
      rowShouldNotExit: (projectName) => cy
          .get(`tr .co-resource-item__resource-name[data-test-id="${projectName}"]`)
          .should('not.exist'),
    }
  }
}

describe("Project: CRUD", () => {
  before(() => {
    // nothing, yet
  })
  after(() => {
    // nothing, yet
  }); 
  // TODO: make sure we deal with the VirtualizedTable & scrolling with the 
  // chosen name and selectors.  Migth need a scrollToName() function.
  const projectName = 'aaa-some-project-crud';
  
  it('Can create a project and then delete a project', () => {
    project.listPage.visit();
    project.listPage.actions.createByName(projectName);
    // assertions should be obvious in the test itself, if possible
    // - the cy.get().should('have.something')  or
    // - some helper that indicates a "should" or "assert"
    //   we want to be able to scan for asserts to find breakage points 
    //   (for example, if the test over 10 lines makes 3 assertions, i want that 
    //   to be obvious when i have to come debut the test 6 months from now).
    project.detailsPage.assert.titleShouldBe(projectName);
  });

  // this is actually a bad test.
  // every it() should be atomic, should not require ordering.
  it('Can delete a project', () => {
    project.detailsPage.visit(projectName);
    project.detailsPage.actions.deleteProject(projectName);    
    project.listPage.assert.rowShouldNotExit(projectName);
  });
});