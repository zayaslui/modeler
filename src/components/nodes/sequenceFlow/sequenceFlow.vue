<template>
  <div/>
</template>

<script>
import joint from 'jointjs';
import crownConfig from '@/mixins/crownConfig';
import linkConfig from '@/mixins/linkConfig';
import get from 'lodash/get';
import { id as laneId } from '../poolLane';
import { expressionPosition } from './sequenceFlowConfig';

export default {
  props: ['graph', 'node', 'id', 'moddle', 'nodeRegistry'],
  mixins: [crownConfig, linkConfig],
  data() {
    return {
      shape: null,
    };
  },
  computed: {
    isValidConnection() {
      return this.isValidTarget() && this.isValidSource();
    },
    targetType() {
      return get(this.target, 'component.node.type');
    },
  },
  watch: {
    'node.definition.conditionExpression.body'(conditionExpression) {
      this.shape.label(0, {
        attrs: {
          text: {
            text: conditionExpression,
          },
        },
      });
    },
  },
  methods: {
    updateRouter() {
      if (this.isSourceElementGateway()) {
        this.shape.router('manhattan',{
          excludeEnds: ['source'],
          excludeTypes: ['standard.EmbeddedImage'],
          padding: 20,
        });
      }
    },
    updateDefinitionLinks() {
      const targetShape = this.shape.getTargetElement();

      this.node.definition.targetRef = targetShape.component.node.definition;
      this.sourceShape.component.node.definition.get('outgoing').push(this.node.definition);
      targetShape.component.node.definition.get('incoming').push(this.node.definition);
    },
    isValidSource() {
      return this.validateIncoming();
    },
    validateIncoming() {
      return this.targetConfig.validateIncoming == null ||
        this.targetConfig.validateIncoming(this.sourceNode);
    },
    isValidTarget() {
      return this.hasTargetType() &&
        this.targetIsNotALane() &&
        this.targetIsInSamePool() &&
        this.targetIsNotSource() &&
        this.validateOutgoing() &&
        this.eventBasedGatewayTarget() &&
        this.validateIntermediateCatchEvent();
    },
    validateIntermediateCatchEvent() {
      const isSourceIntermediateCatchEvent = this.targetNode.definition.$type === 'bpmn:IntermediateCatchEvent';

      return !isSourceIntermediateCatchEvent || !this.invalidIntermediateCatchEventSources();
    },
    eventBasedGatewayTarget() {
      const isSourceEventBasedGateway = this.sourceNode.definition.$type === 'bpmn:EventBasedGateway';
      const isTargetEventBasedGateway = this.targetNode.definition.$type === 'bpmn:EventBasedGateway';
      const isTargetIntermediateCatchEvent = this.targetNode.definition.$type === 'bpmn:IntermediateCatchEvent';
      const isOneIncomingFlow = isTargetEventBasedGateway && this.targetNode.definition.get('incoming').length > 0;

      return (!isSourceEventBasedGateway && !isOneIncomingFlow ) || isTargetIntermediateCatchEvent;
    },
    hasTargetType() {
      return !!this.targetType;
    },
    targetIsNotALane() {
      return this.targetType !== laneId;
    },
    targetIsInSamePool() {
      const targetPool = this.target.component.node.pool;
      const sourcePool = this.sourceShape.component.node.pool;

      return !sourcePool || sourcePool === targetPool;
    },
    targetIsNotSource() {
      return this.targetNode.definition.id !== this.sourceNode.definition.id;
    },
    validateOutgoing() {
      return this.sourceConfig.validateOutgoing == null ||
        this.sourceConfig.validateOutgoing(this.targetNode);
    },
    renderConditionExpression() {
      return !this.node.definition.conditionExpression.body ? '' : this.node.definition.conditionExpression.body;
    },
    invalidIntermediateCatchEventSources() {
      const sourceShape = this.shape.getSourceElement();
      const invalidSources = [
        'bpmn:CallActivity',
      ].includes(sourceShape.component.node.definition.$type);

      return invalidSources;
    },
    isSourceElementGateway() {
      const sourceShape = this.shape.getSourceElement();
      return [
        'bpmn:ExclusiveGateway',
        'bpmn:ParallelGateway',
        'bpmn:InclusiveGateway',
        'bpmn:EventBasedGateway',
      ].includes(sourceShape.component.node.definition.$type);
    },
    createLabel() {
      if (!this.node.definition.conditionExpression) {
        return;
      }

      this.shape.labels([{
        attrs: {
          text: {
            text: this.renderConditionExpression(),
          },
        },
        position: expressionPosition,
      }]);
    },
  },
  mounted() {
    this.shape = new joint.shapes.standard.Link({
      router: {
        name: 'orthogonal',
      },
    });
    this.createLabel();
  },
};
</script>
