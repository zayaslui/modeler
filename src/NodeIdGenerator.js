const nodeIdPrefix = 'node_';

export default class NodeIdGenerator {
  constructor(definitions) {
    this.counter = 1;
    this.definitions = definitions;
  }

  generateUniqueNodeId() {
    let id = this.generateNewNodeId();

    while (!this.isIdUnique(id)) {
      id = this.generateNewNodeId();
    }

    return id;
  }

  generateNewNodeId() {
    const id = nodeIdPrefix + this.counter;
    this.counter++;

    return id;
  }

  isIdUnique(id) {
    const planeElements = this.definitions.diagrams[0].plane.get('planeElement');

    return planeElements.every(planeElement => id !== planeElement.get('bpmnElement').id);
  }
}
