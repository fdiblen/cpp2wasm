// this JavaScript snippet is later referred to as <<heading-component>>
function Heading() {
  const title = 'PI Calculation web application';
  return <h1>{title}</h1>
}
// this JavaScript snippet is later referred to as <<result-component>>
function Result(props) {
  const pi = props.pi;
  let message = 'Not submitted';
  if (pi !== undefined) {
    message = 'PI = ' + pi;
  }
  return <div id="answer">{message}</div>;
}

// this JavaScript snippet appenended to src/js/app.js
function App() {
  // this JavaScript snippet is later referred to as <<react-state>>
  const [niter, setNiter] = React.useState(500000000);
  // this JavaScript snippet is appended to <<react-state>>
  function onNiterChange(event) {
    setNiter(Number(event.target.value));
  }
  // this JavaScript snippet is appended to <<react-state>>
  const [pi, setPi] = React.useState(undefined);

  function handleSubmit(event) {
    // this JavaScript snippet is later referred to as <<handle-submit>>
    event.preventDefault();
    // this JavaScript snippet is appended to <<handle-submit>>
    const worker = new Worker('worker.js');
    // this JavaScript snippet is appended to <<handle-submit>>
    worker.postMessage({
      type: 'CALCULATE',
      payload: { niter: niter}
    });
    // this JavaScript snippet is appended to <<handle-submit>>
    worker.onmessage = function(message) {
        if (message.data.type === 'RESULT') {
          const result = message.data.payload.pi;
          setPi(result);
          worker.terminate();
      }
    };
  }

  return (
    <div>
      <Heading/>
      { /* this JavaScript snippet is later referred to as <<react-form>> */ }
      <form onSubmit={handleSubmit}>
        <label>
          Number of iterations:
          <input name="niter" type="number" value={niter} onChange={onNiterChange}/>
        </label>
        <input type="submit" value="Submit" />
      </form>
      <Result pi={pi}/>
    </div>
  );
}
// this JavaScript snippet appenended to src/js/app.js
ReactDOM.render(
  <App/>,
  document.getElementById('container')
);