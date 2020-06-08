// this JavaScript snippet stored as src/js/worker-sweep.js
importScripts('newtonraphsonwasm.js');

onmessage = function(message) {
  if (message.data.type === 'CALCULATE') {
    createModule().then((module) => {
      // this JavaScript snippet is later referred to as <<calculate-sweep>>
      const {min, max, step} = message.data.payload.niter;
      // this JavaScript snippet appended to <<calculate-sweep>>
      const pis = [];
      // this JavaScript snippet appended to <<calculate-sweep>>
      for (let niter = min; niter <= max; niter += step) {
        // this JavaScript snippet appended to <<calculate-sweep>>
        const t0 = performance.now();
        const pifinder = new module.PiCalculate(niter);
        const pi = pifinder.calculate();
        const duration = performance.now() - t0;
        // this JavaScript snippet appended to <<calculate-sweep>>
        pis.push({
          niter,
          pi,
          duration
        });
        // this JavaScript snippet appended to <<calculate-sweep>>
      }
      postMessage({
        type: 'RESULT',
        payload: {
          pis
        }
      });
    });
  }
};