import {
  dragFromSourceToDest,
  getElementAtPosition,
  getGraphElements,
  getCrownButtonForElement,
  connectNodesWithFlow,
  getLinksConnectedToElement,
  typeIntoTextInput,
  waitToRenderAllShapes,
} from '../support/utils';
import { saveDebounce } from '../../../src/components/inspectors/inspectorConstants';

import { nodeTypes } from '../support/constants';

describe('Undo/redo', () => {
  beforeEach(() => {
    cy.loadModeler();
  });

  it('Can undo and redo sequence flow condition expression', () => {
    const exclusiveGatewayPosition = { x: 250, y: 250 };
    dragFromSourceToDest(nodeTypes.exclusiveGateway, exclusiveGatewayPosition);

    const taskPosition = { x: 400, y: 500 };
    dragFromSourceToDest(nodeTypes.task, taskPosition);

    connectNodesWithFlow('sequence-flow-button', exclusiveGatewayPosition, taskPosition);

    getElementAtPosition(exclusiveGatewayPosition)
      .then(getLinksConnectedToElement)
      .then($links => $links[0])
      .click({ force: true });

    const defaultExpressionValue = '';
    const testString = 'foo > 7';

    cy.get('[name="conditionExpression.body"]').should('have.value', defaultExpressionValue);
    typeIntoTextInput('[name="conditionExpression.body"]', testString);
    cy.get('[name="conditionExpression.body"]').should('have.value', testString);

    cy.get('.paper-container').click({ force: true });
    cy.get('[data-test=undo]').click();

    waitToRenderAllShapes();

    getElementAtPosition(taskPosition)
      .then(getLinksConnectedToElement)
      .then($links => $links[0])
      .click({ force: true });

    cy.get('[name="conditionExpression.body"]').should('have.value', defaultExpressionValue);

    cy.get('[data-test=redo]').click();

    waitToRenderAllShapes();

    getElementAtPosition(exclusiveGatewayPosition)
      .then(getLinksConnectedToElement)
      .then($links => $links[0])
      .click({ force: true });

    cy.get('[name="conditionExpression.body"]').should('have.value', testString);
  });

  it('Can undo and redo adding a task', () => {
    const taskPosition = { x: 300, y: 500 };

    dragFromSourceToDest(nodeTypes.task, taskPosition);

    cy.get('[data-test=undo]').click();

    /* Only the start element should remain */
    getGraphElements().should('have.length', 1);

    cy.get('[data-test=redo]').click();

    /* The task should now be re-added */
    getGraphElements().should('have.length', 2);
  });

  it('Can undo and redo deleting a task', () => {
    const taskPosition = { x: 300, y: 500 };

    dragFromSourceToDest(nodeTypes.task, taskPosition);

    waitToRenderAllShapes();

    getElementAtPosition(taskPosition)
      .click()
      .then($task => {
        getCrownButtonForElement($task, 'delete-button').click();
      });

    /* Only the start element should remain */
    getGraphElements().should('have.length', 1);

    cy.get('[data-test=undo]').click();

    waitToRenderAllShapes();

    /* The task should now be re-added */
    getGraphElements().should('have.length', 2);
  });

  it('Can undo position changes', () => {
    const startEventPosition = { x: 150, y: 150 };
    const startEventMoveToPosition = { x: 300, y: 300 };

    cy.get('[data-test=undo]')
      .should('be.disabled');

    waitToRenderAllShapes();

    getElementAtPosition(startEventPosition)
      .moveTo(startEventMoveToPosition.x, startEventMoveToPosition.y)
      .should(position => {
        expect(position).to.not.deep.equal(startEventPosition);
      });

    cy.get('[data-test=undo]')
      .should('not.be.disabled')
      .click();

    waitToRenderAllShapes();

    getElementAtPosition(startEventPosition).should('exist');
    getElementAtPosition(startEventMoveToPosition).should('not.exist');

    const taskPosition1 = { x: 50, y: 400 };
    const taskPosition2 = { x: taskPosition1.x + 200, y: taskPosition1.y };
    const taskPosition3 = { x: taskPosition2.x + 200, y: taskPosition2.y };
    dragFromSourceToDest(nodeTypes.task, taskPosition1);

    waitToRenderAllShapes();

    getElementAtPosition(taskPosition1)
      .moveTo(taskPosition2.x, taskPosition2.y)
      .moveTo(taskPosition3.x, taskPosition3.y);

    cy.get('[data-test=undo]').click();

    waitToRenderAllShapes();

    getElementAtPosition(taskPosition2).should('exist');
    getElementAtPosition(taskPosition3).should('not.exist');
  });

  it('Can undo and redo adding message flows', () => {
    const pool1Position = { x: 250, y: 250 };
    dragFromSourceToDest(nodeTypes.pool, pool1Position);

    const pool2Position = { x: 250, y: 500 };
    dragFromSourceToDest(nodeTypes.pool, pool2Position);

    connectNodesWithFlow('message-flow-button', pool1Position, pool2Position);

    getGraphElements().then(elements => {
      const numberOfElements = elements.length;

      cy.get('[data-test=undo]').click();
      waitToRenderAllShapes();
      getGraphElements().should('have.length', numberOfElements - 1);

      cy.get('[data-test=redo]').click();
      waitToRenderAllShapes();
      getGraphElements().should('have.length', numberOfElements);
    });
  });

  it('Does not include intermediate message flow definition in XML', () => {
    const validMessageFlowXML = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" id="Definitions_03dabax" targetNamespace="http://bpmn.io/schema/bpmn" exporter="ProcessMaker Modeler" exporterVersion="1.0">
  <bpmn:process id="Process_1" isExecutable="true">
    <bpmn:startEvent id="node_1" name="Start Event" />
  </bpmn:process>
  <bpmn:collaboration id="collaboration_0">
    <bpmn:participant id="node_2" name="New Pool" processRef="Process_1" />
  </bpmn:collaboration>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="collaboration_0">
      <bpmndi:BPMNShape id="node_1_di" bpmnElement="node_1">
        <dc:Bounds x="150" y="150" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="node_2_di" bpmnElement="node_2">
        <dc:Bounds x="100" y="130" width="600" height="300" />
      </bpmndi:BPMNShape>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`;

    const poolPosition = { x: 250, y: 250 };
    dragFromSourceToDest(nodeTypes.pool, poolPosition);

    waitToRenderAllShapes();

    connectNodesWithFlow('message-flow-button', poolPosition, poolPosition);

    waitToRenderAllShapes();

    cy.get('[data-test=downloadXMLBtn]').click();
    cy.window()
      .its('xml')
      .then(xml => xml.trim()).should('eq', validMessageFlowXML.trim());
  });

  it('Can update start event name after undo', () => {
    const startEventPosition = { x: 150, y: 150 };
    const testString = 'foo bar';

    waitToRenderAllShapes();
    getElementAtPosition(startEventPosition)
      .moveTo(startEventPosition.x + 50, startEventPosition.y + 50);
    cy.get('[data-test=undo]').click();

    getElementAtPosition(startEventPosition).click();
    typeIntoTextInput('[name=name]', testString);
    cy.get('[name=name]').should('have.value', testString);
  });

  it('Can update two properties at the same time', () => {
    const startEventPosition = { x: 150, y: 150 };

    waitToRenderAllShapes();
    getElementAtPosition(startEventPosition).click();

    const newId = '1234';
    const newName = 'foobar';
    cy.get('[name=id]').clear().type(newId);
    cy.get('[name=name]').clear().type(newName);

    cy.wait(saveDebounce);

    cy.get('[name=id]').should('have.value', newId);
    cy.get('[name=name]').should('have.value', newName);
  });
});
