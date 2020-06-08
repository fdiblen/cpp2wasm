// this JavaScript snippet stored as src/js/jsonschema-app.js
function App() {
  // this JavaScript snippet is later referred to as <<jsonschema-app>>
  const schema = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$id": "https://nlesc-jcer.github.io/cpp2wasm/NNRequest.json",
    "type": "object",
    "properties": {
      "niter": {
        "title": "niter",
        "type": "number",
        "minimum": 0
      }
    },
    "required": ["niter"],
    "additionalProperties": false
  }
  // this JavaScript snippet is appended to <<jsonschema-app>>
  const Form = JSONSchemaForm.default;
  // this JavaScript snippet is appended to <<jsonschema-app>>
  const [formData, setFormData] = React.useState({
    niter: 500000000
  });

  function handleChange(event) {
    setFormData(event.formData);
  }
  // this JavaScript snippet is appended to <<jsonschema-app>>
  const [pi, setPi] = React.useState(undefined);

  function handleSubmit(submission, event) {
    event.preventDefault();
    const worker = new Worker('worker.js');
    worker.postMessage({
      type: 'CALCULATE',
      payload: submission.formData
    });
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
      { /* this JavaScript snippet is later referred to as <<jsonschema-form>>  */}
      <Form
        schema={schema}
        formData={formData}
        onChange={handleChange}
        onSubmit={handleSubmit}
      />
      <Result pi={pi}/>
    </div>
  );
}

ReactDOM.render(
  <App/>,
  document.getElementById('container')
);
// this JavaScript snippet appended to src/js/jsonschema-app.js
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