import {
  dragFromSourceToDest,
  typeIntoTextInput,
  connectNodesWithFlow,
  waitToRenderAllShapes,
  getElementAtPosition,
} from '../support/utils';

import { nodeTypes } from '../support/constants';

describe('Inclusive Gateway', () => {
  beforeEach(() => {
    cy.loadModeler();
  });

  it('Update inclusive gateway name', () => {
    const inclusivePosition = { x: 250, y: 250 };
    dragFromSourceToDest(nodeTypes.inclusiveGateway, inclusivePosition);

    waitToRenderAllShapes();
    getElementAtPosition(inclusivePosition).click();

    const testString = 'testing';
    typeIntoTextInput('[name=name]', testString);
    cy.get('[name=name]').should('have.value', testString);

    waitToRenderAllShapes();
  });

  it('Detects gateway direction of converging or diverging', () => {
    const inclusivePosition = { x: 250, y: 250 };
    dragFromSourceToDest(nodeTypes.inclusiveGateway, inclusivePosition);

    const startEventPosition = { x: 150, y: 150 };

    connectNodesWithFlow('sequence-flow-button', startEventPosition, inclusivePosition);

    const divergingString = 'gatewayDirection="diverging"';
    cy.get('[data-test=downloadXMLBtn]').click();
    cy.window()
      .its('xml')
      .then(xml => xml.trim()).should('have', divergingString);

    const taskPosition = { x: 350, y: 350 };
    dragFromSourceToDest(nodeTypes.task, taskPosition);

    waitToRenderAllShapes();
    connectNodesWithFlow('sequence-flow-button', taskPosition, inclusivePosition);

    getElementAtPosition(taskPosition).click();

    const convergingString = 'gatewayDirection="converging"';
    cy.get('[data-test=downloadXMLBtn]').click();
    cy.window()
      .its('xml')
      .then(xml => xml.trim()).should('to.contain', convergingString);
  });
});
