/* 1366x768 is the most common desktop screen resolution according to the following sources:
 * https://www.w3schools.com/browsers/browsers_display.asp
 * http://gs.statcounter.com/screen-resolution-stats/desktop/worldwide
 */
export const defaultViewportDimensions = {
  width: 1366,
  height: 768,
};

export const nodeTypes = {
  task: 'processmaker-modeler-task',
  endEvent:'processmaker-modeler-end-event',
  scriptTask:'processmaker-modeler-script-task',
  exclusiveGateway: 'processmaker-modeler-exclusive-gateway',
  parallelGateway: 'processmaker-modeler-parallel-gateway',
  inclusiveGateway: 'processmaker-modeler-inclusive-gateway',
  eventBasedGateway: 'processmaker-modeler-event-based-gateway',
  textAnnotation: 'processmaker-modeler-text-annotation',
  pool:'processmaker-modeler-pool',
  startTimerEvent: 'processmaker-modeler-start-timer-event',
  intermediateCatchEvent: 'processmaker-modeler-intermediate-catch-timer-event',
  intermediateMessageCatchEvent: 'processmaker-modeler-intermediate-message-catch-event',
  callActivity: 'processmaker-modeler-call-activity',
};
