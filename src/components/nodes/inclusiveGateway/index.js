import component from './inclusiveGateway.vue';
import { gatewayDirection } from '../gateway/gatewayConfig';

export default {
  id: 'processmaker-modeler-inclusive-gateway',
  component,
  bpmnType: 'bpmn:InclusiveGateway',
  control: true,
  category: 'BPMN',
  icon: require('@/assets/toolpanel/inclusive-gateway.svg'),
  label: 'Inclusive Gateway',
  definition(moddle) {
    return moddle.create('bpmn:InclusiveGateway', {
      name: null,
      gatewayDirection: gatewayDirection.diverging,
    });
  },
  diagram(moddle) {
    return moddle.create('bpmndi:BPMNShape', {
      bounds: moddle.create('dc:Bounds', {
        height: 36,
        width: 36,
      }),
    });
  },
  inspectorConfig: [
    {
      name: 'Inclusive Gateway',
      items: [
        {
          component: 'FormText',
          config: {
            label: 'Inclusive Gateway',
            fontSize: '2em',
          },
        },
        {
          component: 'FormAccordion',
          container: true,
          config: {
            initiallyOpen: true,
            label: 'Configuration',
            icon: 'cog',
            name: 'confifuration',
          },
          items: [
            {
              component: 'FormInput',
              config: {
                label: 'Identifier',
                helper: 'The id field should be unique across all elements in the diagram',
                name: 'id',
              },
            },
            {
              component: 'FormInput',
              config: {
                label: 'Name',
                helper: 'The Name of the Gateway',
                name: 'name',
              },
            },
          ],
        },
        {
          component: 'FormSelect',
          config: {
            label: 'Direction',
            helper: 'Select direction of gateway',
            name: 'gatewayDirection',
            options: [
              { value: gatewayDirection.diverging , content: 'Diverging' },
              { value: gatewayDirection.converging , content: 'Converging' },
            ],
          },
        },
      ],
    },
  ],
};
