// this JavaScript snippet is stored as src/js/worker.js
importScripts('calculatepiwasm.js');

// this JavaScript snippet is later referred to as <<worker-provider-onmessage>>
onmessage = function(message) {
  // this JavaScript snippet is before referred to as <<handle-message>>
  if (message.data.type === 'CALCULATE') {
    createModule().then((module) => {
      // this JavaScript snippet is before referred to as <<perform-calc-in-worker>>
      const niter = message.data.payload.niter;
      const pifinder = new module.PiCalculate(niter);
      const pi = pifinder.calculate();
      // this JavaScript snippet is before referred to as <<post-result>>
      postMessage({
        type: 'RESULT',
        payload: {
          pi: pi
        }
      });
    });
  }
};