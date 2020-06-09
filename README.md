# Benchmarking for cpp2wasm

This is an example which uses [cpp2wasm](https://github.com/NLESC-JCER/cpp2wasm) guide. In this example, the algorithm calculates pi instead of finding the root of an equation. Please read the `cpp2wasm` guide to understand each step in this example.

## The C++ code

```{.cpp file=src/calculatepi.hpp}
// this C++ snippet is stored as src/calculatepi.hpp
#ifndef H_PICALC_H
#define H_PICALC_H

namespace pirng {
  class PiCalculate {
    public:
      PiCalculate(double niter);
      double calculate();
    private:
      int niter;
  };
}

#endif
```

```{.cpp #algorithm}
// this C++ code snippet is later referred to as <<algorithm>>
#include <iostream>
#include <math.h>
#include "calculatepi.hpp"
#define SEED 35791246

namespace pirng
{

PiCalculate::PiCalculate(double niter) : niter(niter) {}

// Function to calculate PI
double PiCalculate::calculate()
{
  srand(SEED);

  double x, y;
  int i, count = 0;
  double z;

  std::cout << "Iterations : " << niter << std::endl;

  for ( i = 0; i < niter; i++) {
    x = (double)rand()/RAND_MAX;
    y = (double)rand()/RAND_MAX;
    z = x*x + y*y;
    if (z <= 1) count++;
  }
  return (double)count/niter*4;
};


} // namespace pirng
```

The simple CLI program.

```{.cpp file=src/cli-calculatepi.cpp}
// this C++ snippet is stored as src/calculatepi.cpp
#include<bits/stdc++.h>
#include <iostream>

<<algorithm>>

// Driver program to test above
int main()
{
  int niter = 5e8;
  pirng::PiCalculate pifinder(niter);
  double pi = pifinder.calculate();

  std::cout << "The value of the pi is : " << pi << std::endl;
  return 0;
}
```

Compile with

```{.awk #build-cli}
g++ src/cli-calculatepi.cpp -o bin/calculatepi.exe
```

Run with

```{.awk #test-cli}
./bin/calculatepi.exe
```

Should output

```shell
Iterations : 500000000
The value of the pi is : 3.14154
```


## JSON schema

An example of JSON schema:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://nlesc-jcer.github.io/cpp2wasm/NNRequest.json",
  "type": "object",
  "properties": {
    "niter": {
      "title": "Number of interations",
      "type": "number",
      "minimum": 0
    }
  },
  "required": ["niter"],
  "additionalProperties": false
}
```

And a valid document:

```json
{
  "niter": 1000000
}
```

## CGI script

```{.cpp file=src/cgi-calculatepi.cpp}
// this C++ snippet is stored as src/cgi-calculatepi.hpp
#include <string>
#include <iostream>
#include <nlohmann/json.hpp>

<<algorithm>>

int main(int argc, char *argv[])
{
  std::cout << "Content-type: application/json" << std::endl << std::endl;

  // Retrieve niter from request body
  nlohmann::json request(nlohmann::json::parse(std::cin));
  double niter = request["niter"];

  // Calculate PI
  pirng::PiCalculate pifinder(niter);
  double pi = pifinder.calculate();

  // Assemble response
  nlohmann::json response;
  response["niter"] = niter;
  response["pi"] = pi;
  std::cout << response.dump(2) << std::endl;
  return 0;
}
```

This can be compiled with

```{.awk #build-cgi}
g++ -Ideps src/cgi-calculatepi.cpp -o apache2/cgi-bin/calculatepi
```

The CGI script can be tested directly with

```{.awk #test-cgi}
echo '{"niter": 500000000}' | apache2/cgi-bin/calculatepi
```

It should output

```shell
Content-type: application/json

{
  "niter": 500000000,
  "pi": 3.14154
}
```

```{.python file=apache2/apache2.conf}
# this Apache2 configuration snippet is stored as apache2/apache2.conf
ServerName 127.0.0.1
Listen 8080
LoadModule mpm_event_module /usr/lib/apache2/modules/mod_mpm_event.so
LoadModule authz_core_module /usr/lib/apache2/modules/mod_authz_core.so
LoadModule alias_module /usr/lib/apache2/modules/mod_alias.so
LoadModule cgi_module /usr/lib/apache2/modules/mod_cgi.so
ErrorLog httpd_error_log
PidFile httpd.pid

ScriptAlias "/cgi-bin/" "cgi-bin/"
```

Start Apache httpd web server using

```shell
/usr/sbin/apache2 -X -d ./apache2
```

And in another shell call CGI script using curl

```shell
curl --header "Content-Type: application/json" \
  --request POST \
  --data '{"niter":500000000}' \
  http://localhost:8080/cgi-bin/calculatepi
```

Should return the following JSON document as a response

```json
{
  "niter": 500000000,
  "pi":3.14154
}
```

## Python


### Accessing C++ function from Python

To use pybind11, it must installed with pip

```{.awk #pip-pybind11}
pip install pybind11
```

For example the bindings of `calculatepi.hpp:NewtonRaphson` class would look like:

```{.cpp file=src/py-calculatepi.cpp}
// this C++ snippet is stored as src/py-calculatepi.cpp
#include <pybind11/pybind11.h>
#include <pybind11/stl.h>

<<algorithm>>

namespace py = pybind11;

PYBIND11_MODULE(calculatepipy, m) {
    py::class_<pirng::PiCalculate>(m, "PiCalculate")
        .def(py::init<int>(), py::arg("niter"))
        .def("calculate",
             &pirng::PiCalculate::calculate,
             "Caulculate pi for given number of iterations"
        )
    ;
}
```

Compile with

```{.awk #build-py}
g++ -O3 -Wall -shared -std=c++14 -fPIC `python3 -m pybind11 --includes` \
src/py-calculatepi.cpp -o src/py/calculatepipy`python3-config --extension-suffix`
```

In Python it can be used:

```{.python file=src/py/example.py}
# this Python snippet is stored as src/py/example.py
from calculatepipy import PiCalculate

pifinder = PiCalculate(niter=500000000)
pi = pifinder.calculate()
print(pi)
```

The Python example can be run with

```{.awk #test-py}
python src/py/example.py
```

It will output something like

```shell
3.14154
```

### Web application

The Flask Python library can be installed with

```{.awk #pip-flask}
pip install flask
```

The first page with the form and submit button is defined as a function returning a HTML form.

```{.python #py-form}
# this Python code snippet is later referred to as <<py-form>>
@app.route('/', methods=['GET'])
def form():
  return '''<!doctype html>
    <form method="POST">
      <label for="niter">Iterations</label>
      <input type="number" name="niter" value="500000000">
      <button type="submit">Submit</button>
    </form>'''
```

```{.python #py-calculate}
# this Python code snippet is later referred to as <<py-calculate>>
@app.route('/', methods=['POST'])
def calculate():
  niter = int(request.form['niter'])

  from calculatepipy import PiCalculate
  pifinder = PiCalculate(niter)
  pi = pifinder.calculate()

  return f'''<!doctype html>
    <p>With {niter} iterations calculated pi is {pi}.</p>'''
```

```{.python #py-calculate}
  # this Python code snippet is appended to <<py-calculate>>
```

Putting it all together in

```{.python file=src/py/webapp.py}
# this Python snippet is stored as src/py/webapp.py
from flask import Flask, request
app = Flask(__name__)

<<py-form>>

<<py-calculate>>

app.run(port=5001)
```

And running it with

```{.awk #run-webapp}
python src/py/webapp.py
```

To test we can visit [http://localhost:5001](http://localhost:5001) fill the form and press submit to get the result.

### Long-running tasks

Redis can be started with the following command

```{.awk #start-redis}
docker run --rm -d -p 6379:6379 --name some-redis redis
```

To use Celery we must install the redis flavored version with

```{.awk #pip-celery}
pip install celery[redis]
```
First configure Celery to use the Redis database.

```{.python #celery-config}
# this Python code snippet is later referred to as <<celery-config>>
from celery import Celery
capp = Celery('tasks', broker='redis://localhost:6379', backend='redis://localhost:6379')
```

```{.python file=src/py/tasks.py}
# this Python snippet is stored as src/py/tasks.py
import time

<<celery-config>>

@capp.task(bind=True)
def calculate(self, niter):
  if not self.request.called_directly:
    self.update_state(state='INITIALIZING')
  time.sleep(5)
  from calculatepipy import PiCalculate
  pifinder = PiCalculate(niter)
  if not self.request.called_directly:
    self.update_state(state='FINDING')
  time.sleep(5)
  pi = pifinder.calculate()
  return {'pi': pi, 'niter': niter}
```

```{.python #py-submit}
# this Python code snippet is later referred to as <<py-submit>>
@app.route('/', methods=['POST'])
def submit():
  niter = int(request.form['niter'])
  from tasks import calculate
  job = calculate.delay(niter)
  return redirect(url_for('result', jobid=job.id))
```

The last method is to ask the Celery task queue what the status is of the job and return the result when it is succesful.

```{.python #py-result}
# this Python code snippet is later referred to as <<py-result>>
@app.route('/result/<jobid>')
def result(jobid):
  from tasks import capp
  job = capp.AsyncResult(jobid)
  job.maybe_throw()
  if job.successful():
    result = job.get()
    niter = result['niter']
    pi = result['pi']
    return f'''<!doctype html>
      <p>With {niter} iterations calculated pi is {pi}.</p>'''
  else:
    return f'''<!doctype html>
      <p>{job.status}<p>'''
```

Putting it all together

```{.python file=src/py/webapp-celery.py}
# this Python snippet is stored as src/py/webapp-celery.py
from flask import Flask, render_template, request, redirect, url_for

app = Flask(__name__)

<<py-form>>

<<py-submit>>

<<py-result>>

if __name__ == '__main__':
  app.run(port=5000)
```

Start the web application like before with

```{.awk #run-celery-webapp}
python src/py/webapp-celery.py
```

Tasks will be run by the Celery worker. The worker can be started with

```{.awk #run-celery-worker}
PYTHONPATH=src/py celery worker -A tasks
```

(The PYTHONPATH environment variable is set so the Celery worker can find the `tasks.py` and `calculatepipy.*.so` files in the `src/py/` directory)

To test the web service

1. Go to [http://localhost:5000](http://localhost:5000),
2. Submit form,
3. Refresh result page until progress states are replaced with result.

The redis server can be shut down with

```{.awk #stop-redis}
docker stop some-redis
```

### Web service


```{.yaml file=src/py/openapi.yaml}
# this yaml snippet is stored as src/py/openapi.yaml
openapi: 3.0.0
info:
  title: PI Calculator
  license:
    name: Apache-2.0
    url: https://www.apache.org/licenses/LICENSE-2.0.html
  version: 0.1.0
paths:
  /api/calculatepi:
    post:
      description: Calculate PI using random numbers
      operationId: api.calculate
      requestBody:
        content:
          'application/json':
            schema:
              $ref: '#/components/schemas/NRRequest'
            example:
              niter: 500000000
      responses:
        '200':
          description: PI calculated
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/NRResponse'
components:
  schemas:
    NRRequest:
      type: object
      properties:
        niter:
          type: number
          minimum: 0
      required:
        - niter
      additionalProperties: false
    NRResponse:
      type: object
      properties:
        pi:
          type: number
      required:
        - pi
      additionalProperties: false
```

```{.python file=src/py/api.py}
# this Python snippet is stored as src/py/api.py
def calculate(body):
  niter = body['niter']
  from calculatepipy import PiCalculate
  pifinder = PiCalculate(niter)
  pi = pifinder.calculate()
  return {'pi': pi}
```

To provide the `calculate` method as a web service we must install Connexion Python library (with the Swagger UI for later testing)

```{.awk #pip-connexion}
pip install connexion[swagger-ui]
```

To run the web service we have to to tell Connexion which specification it should expose.

```{.python file=src/py/webservice.py}
# this Python snippet is stored as src/py/webservice.py
import connexion

app = connexion.App(__name__)
app.add_api('openapi.yaml', validate_responses=True)
app.run(port=8080)
```

The web service can be started with

```{.awk #run-webservice}
python src/py/webservice.py
```

We can try out the web service using the Swagger UI at [http://localhost:8080/ui/](http://localhost:8080/ui/).
Or by running a ``curl`` command like

```{.awk #test-webservice}
curl -X POST "http://localhost:8080/api/calculatepi" -H "accept: application/json" -H "Content-Type: application/json" -d "{\"niter\":500000000}"
```

## JavaScript


### Accessing C++ function from JavaScript in web browser

The binding of the C++ code will be

```{.cpp file=src/wasm-calculatepi.cpp}
// this C++ snippet is stored as src/wasm-calculatepi.cpp
#include <emscripten/bind.h>

<<algorithm>>

using namespace emscripten;

EMSCRIPTEN_BINDINGS(calculatepiwasm) {
  class_<pirng::PiCalculate>("PiCalculate")
    .constructor<double>()
    .function("calculate", &pirng::PiCalculate::calculate)
    ;
}
```

The algorithm and binding can be compiled into a WebAssembly module with the Emscripten compiler called `emcc`.
To make live easier we configure the compile command to generate a `src/js/calculatepiwasm.js` file which exports the `createModule` function.

```{.awk #build-wasm}
emcc --bind -o src/js/calculatepiwasm.js -s MODULARIZE=1 -s EXPORT_NAME=createModule src/wasm-calculatepi.cpp
```

The compilation also generates a `src/js/calculatepiwasm.wasm` file which will be loaded with the `createModule` function.

The WebAssembly module must be loaded and initialized by calling the `createModule` function and waiting for the JavaScript promise to resolve.

```{.js #wasm-promise}
// this JavaScript snippet is later referred to as <<wasm-promise>>
createModule().then((module) => {
  <<wasm-calculate>>
  <<render-answer>>
});
```

The `module` variable contains the `PiCalculate` class we defined in the binding above.

```{.js #wasm-calculate}
// this JavaScript snippet is later referred to as <<wasm-calculate>>
const niter = 500000000;
const pifinder = new module.PiCalculate(niter);
const pi = pifinder.calculate();
```

```{.js #render-answer}
document.getElementById('answer').innerHTML = pi.toFixed(4);
```

To run the JavaScript in a web browser a HTML page is needed.
To be able to use the `createModule` function, we will import the `calculatepiwasm.js` with a script tag.

```{.html file=src/js/example.html}
<!doctype html>
<!-- this HTML page is stored as src/js/example.html -->
<html lang="en">
  <head>
    <title>Example</title>
    <script type="text/javascript" src="calculatepiwasm.js"></script>
    <script>
      <<wasm-promise>>
    </script>
  </head>
  <body>
    <span id="answer"> </span>
  </body>
</html>
```

Python ships with a built-in web server, we will use it to host the all files of the repository on port 8000.

```{.awk #host-files}
python3 -m http.server 8000
```

Visit [http://localhost:8000/src/js/example.html](http://localhost:8000/src/js/example.html) to see the result of the calculation.
Embedded below is the example hosted on [GitHub pages](https://nlesc-jcer.github.io/cpp2wasm/src/js/example.html)

[https://nlesc-jcer.github.io/cpp2wasm/src/js/example.html](https://nlesc-jcer.github.io/cpp2wasm/src/js/example.html ':include :type=iframe width=100% height=60px').

### Executing long running methods in JavaScript

We need to instantiate a web worker which we will implement later in `src/js/worker.js`.

```{.js #worker-consumer}
// this JavaScript snippet is later referred to as <<worker-consumer>>
const worker = new Worker('worker.js');
```

We need to send the worker a message with description for the work it should do.

```{.js #worker-consumer}
// this JavaScript snippet is appended to <<worker-consumer>>
worker.postMessage({
  type: 'CALCULATE',
  payload: { niter: 500000000}
});
```

In the web worker we need to listen for incoming messages.

```{.js #worker-provider-onmessage}
// this JavaScript snippet is later referred to as <<worker-provider-onmessage>>
onmessage = function(message) {
  <<handle-message>>
};
```

Before we can handle the message we need to import the WebAssembly module.

```{.js file=src/js/worker.js}
// this JavaScript snippet is stored as src/js/worker.js
importScripts('calculatepiwasm.js');

<<worker-provider-onmessage>>
```

We can handle the `CALCULATE` message only after the WebAssembly module is loaded and initialized.

```{.js #handle-message}
// this JavaScript snippet is before referred to as <<handle-message>>
if (message.data.type === 'CALCULATE') {
  createModule().then((module) => {
    <<perform-calc-in-worker>>
    <<post-result>>
  });
}
```

```{.js #perform-calc-in-worker}
// this JavaScript snippet is before referred to as <<perform-calc-in-worker>>
const niter = message.data.payload.niter;
const pifinder = new module.PiCalculate(niter);
const pi = pifinder.calculate();
```

And send the result back to the web worker consumer as a outgoing message.

```{.js #post-result}
// this JavaScript snippet is before referred to as <<post-result>>
postMessage({
  type: 'RESULT',
  payload: {
    pi: pi
  }
});
```

Listen for messages from worker and when a result message is received put the result in the HTML page like we did before.

```{.js #worker-consumer}
// this JavaScript snippet is appended to <<worker-consumer>>
worker.onmessage = function(message) {
  if (message.data.type === 'RESULT') {
    const pi = message.data.payload.pi;
    <<render-answer>>
  }
}
```

Like before we need a HTML page to run the JavaScript, but now we don't need to import the `calculatepiwasm.js` file here as it is imported in the `worker.js` file.

```{.html file=src/js/example-web-worker.html}
<!doctype html>
<!-- this HTML page is stored as src/js/example-web-worker.html -->
<html lang="en">
  <head>
    <title>Example web worker</title>
    <script>
      <<worker-consumer>>
    </script>
  </head>
  <body>
    <span id="answer"> </span>
  </body>
</html>
```

Like before we also need to host the files in a web server with

```shell
python3 -m http.server 8000
```

Visit [http://localhost:8000/src/js/example-web-worker.html](http://localhost:8000/src/js/example-web-worker.html) to see the result of the calculation.
Embedded below is the example hosted on [GitHub pages](https://nlesc-jcer.github.io/cpp2wasm/src/js/example-web-worker.html)

<iframe width="100%" height="60" src="https://nlesc-jcer.github.io/cpp2wasm/src/js/example-web-worker.html" /></iframe>


## Single page application

**The calculation will be done in the web browser on the end users machine instead of a server**.

### React component

```{.html file=src/js/example-app.html}
<!doctype html>
<!-- this HTML page is stored as src/js/example-app.html -->
<html lang="en">
  <head>
    <title>Example React application</title>
    <<imports>>
  </head>
  <div id="container"></div>

  <script type="text/babel" src="app.js"></script>
</html>
```

To use React we need to import the React library.

```{.html #imports}
<!-- this HTML snippet is before and later referred to as <<imports>> -->
<script src="https://unpkg.com/react@16/umd/react.development.js" crossorigin></script>
<script src="https://unpkg.com/react-dom@16/umd/react-dom.development.js" crossorigin></script>
```

A React application is constructed from React components. The simplest React component is a function which returns a HTML tag with a variable inside.

```{.jsx #heading-component}
// this JavaScript snippet is later referred to as <<heading-component>>
function Heading() {
  const title = 'PI Calculation web application';
  return <h1>{title}</h1>
}
```

A component can be rendered using

```jsx
ReactDOM.render(
  <Heading/>,
  document.getElementById('container')
);
```

The `Heading` React component would render to the following HTML.

```html
<h1>PI calculation web application</h1>;
```

The `<h1>{title}</h1>` looks like HTML, but is actually called [JSX](https://reactjs.org/docs/introducing-jsx.html).
A transformer like [Babel](https://babeljs.io/docs/en/next/babel-standalone.html) can convert JSX to valid JavaScript code. The transformed Heading component will look like.

```js
function Heading() {
  const title = 'PI Calculation web application';
  return React.createElement('h1', null, `{title}`);
}
```

To transform JSX we need to import Babel.

```{.html #imports}
<!-- this HTML snippet is appended to <<imports>> -->
<script src="https://unpkg.com/babel-standalone@6/babel.min.js"></script>
```

The form in JSX can be written in the following way:

```{.jsx #react-form}
{ /* this JavaScript snippet is later referred to as <<react-form>> */ }
<form onSubmit={handleSubmit}>
  <label>
    Number of iterations:
    <input name="niter" type="number" value={niter} onChange={onNiterChange}/>
  </label>
  <input type="submit" value="Submit" />
</form>
```

```{.js #react-state}
// this JavaScript snippet is later referred to as <<react-state>>
const [niter, setNiter] = React.useState(500000000);
```

```{.js #react-state}
// this JavaScript snippet is appended to <<react-state>>
function onNiterChange(event) {
  setNiter(Number(event.target.value));
}
```

```{.jsx #handle-submit}
// this JavaScript snippet is later referred to as <<handle-submit>>
event.preventDefault();
```

Like we did in the previous chapter we have to construct a web worker.

```{.jsx #handle-submit}
// this JavaScript snippet is appended to <<handle-submit>>
const worker = new Worker('worker.js');
```

We have to post a message to the worker with the values from the form.

```{.jsx #handle-submit}
// this JavaScript snippet is appended to <<handle-submit>>
worker.postMessage({
  type: 'CALCULATE',
  payload: { niter: niter}
});
```

```{.js #react-state}
// this JavaScript snippet is appended to <<react-state>>
const [pi, setPi] = React.useState(undefined);
```

```{.jsx #handle-submit}
// this JavaScript snippet is appended to <<handle-submit>>
worker.onmessage = function(message) {
    if (message.data.type === 'RESULT') {
      const result = message.data.payload.pi;
      setPi(result);
      worker.terminate();
  }
};
```

```{.jsx #result-component}
// this JavaScript snippet is later referred to as <<result-component>>
function Result(props) {
  const pi = props.pi;
  let message = 'Not submitted';
  if (pi !== undefined) {
    message = 'PI = ' + pi;
  }
  return <div id="answer">{message}</div>;
}
```

```{.jsx file=src/js/app.js}
<<heading-component>>
<<result-component>>

// this JavaScript snippet appenended to src/js/app.js
function App() {
  <<react-state>>

  function handleSubmit(event) {
    <<handle-submit>>
  }

  return (
    <div>
      <Heading/>
      <<react-form>>
      <Result pi={pi}/>
    </div>
  );
}
```

```{.jsx file=src/js/app.js}
// this JavaScript snippet appenended to src/js/app.js
ReactDOM.render(
  <App/>,
  document.getElementById('container')
);
```

Like before we also need to host the files in a web server with

```shell
python3 -m http.server 8000
```

Visit [http://localhost:8000/src/js/example-app.html](http://localhost:8000/src/js/example-app.html) to see the pi answer.
Embedded below is the example app hosted on [GitHub pages](https://nlesc-jcer.github.io/cpp2wasm/src/js/example-app.html)

<iframe width="100%" height="160" src="https://nlesc-jcer.github.io/cpp2wasm/src/js/example-app.html" /></iframe>

### JSON schema powered form

```{.js #jsonschema-app}
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
```

To render the application we need a HTML page. We will reuse the imports we did in the previous chapter.

```{.html file=src/js/example-jsonschema-form.html}
<!doctype html>
<!-- this HTML page is stored as src/jsexample-jsonschema-form.html -->
<html lang="en">
  <head>
    <title>Example JSON schema powered form</title>
    <<imports>>
  </head>
  <div id="container"></div>

  <script type="text/babel" src="jsonschema-app.js"></script>
</html>
```

To use the [react-jsonschema-form](https://github.com/rjsf-team/react-jsonschema-form) React component we need to import it.

```{.html #imports}
<!-- this HTML snippet is appended to <<imports>>  -->
<script src="https://unpkg.com/@rjsf/core/dist/react-jsonschema-form.js"></script>
```

The form component is exported as `JSONSchemaForm.default` and can be aliases to `Form` for easy use with

```{.js #jsonschema-app}
// this JavaScript snippet is appended to <<jsonschema-app>>
const Form = JSONSchemaForm.default;
```

The form [by default](https://react-jsonschema-form.readthedocs.io/en/latest/usage/themes/) uses the [Bootstrap 3](https://getbootstrap.com/docs/3.4/) theme. The theme injects class names into the HTML tags. The styles associated with the class names must be imported from the Bootstrap CSS file.

```{.html #imports}
<!-- this HTML snippet is appended to <<imports>>  -->
<link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/3.4.1/css/bootstrap.min.css" integrity="sha384-HSMxcRTRxnN+Bdg0JdbxYKrThecOKuH5zCYotlSAcp1+c8xmyTe9GYg1l9a69psu" crossorigin="anonymous">
```

The values in the form must be initialized and updated whenever the form changes.

```{.js #jsonschema-app}
// this JavaScript snippet is appended to <<jsonschema-app>>
const [formData, setFormData] = React.useState({
  niter: 500000000
});

function handleChange(event) {
  setFormData(event.formData);
}
```

The form can be rendered with

```{.jsx #jsonschema-form}
{ /* this JavaScript snippet is later referred to as <<jsonschema-form>>  */}
<Form
  schema={schema}
  formData={formData}
  onChange={handleChange}
  onSubmit={handleSubmit}
/>
```

The `handleSubmit` function recieves the form input values and use the web worker we created earlier to perform the calculation and render the result.

```{.js #jsonschema-app}
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
```

The App component can be defined and rendered with.

```{.jsx file=src/js/jsonschema-app.js}
// this JavaScript snippet stored as src/js/jsonschema-app.js
function App() {
  <<jsonschema-app>>

  return (
    <div>
      <Heading/>
      <<jsonschema-form>>
      <Result pi={pi}/>
    </div>
  );
}

ReactDOM.render(
  <App/>,
  document.getElementById('container')
);
```

The `Heading` and `Result` React component can be reused.

```{.jsx file=src/js/jsonschema-app.js}
// this JavaScript snippet appended to src/js/jsonschema-app.js
<<heading-component>>
<<result-component>>
```

Like before we also need to host the files in a web server with

```shell
python3 -m http.server 8000
```

Visit [http://localhost:8000/src/js/example-jsonschema-form.html](http://localhost:8000/src/js/example-jsonschema-form.html) to see the pi answer.
Embedded below is the example app hosted on [GitHub pages](https://nlesc-jcer.github.io/cpp2wasm/src/js/example-app.html)

<iframe width="100%" height="320" src="https://nlesc-jcer.github.io/cpp2wasm/src/js/example-jsonschema-form.html" /></iframe>

### Visualization

```{.js #plot-app}
// this JavaScript snippet is later referred to as <<jsonschema-app>>
const schema = {
  "type": "object",
  "properties": {
    "niter": {
      "title": "niter",
      "type": "object",
      "properties": {
        "min": {
          "type": "number",
          "minimum": 0,
          "default":100000000
        },
        "max": {
          "type": "number",
          "minimum": 0,
          "default": 10000000000
        },
        "step": {
          "type": "number",
          "minimum": 0,
          "default": 100000000
        }
      },
      "required": ["min", "max", "step"],
      "additionalProperties": false
    }
  },
  "required": ["niter"],
  "additionalProperties": false
}
```

We need to rewrite the worker to perform a parameter sweep.
The worker will recieve a payload like

```json
{
  "niter": {
    "min": 100000000,
    "max": 10000000000,
    "step": 100000000
  }
}
```

The worker will send back an array containing objects with the pi result, the input parameters and the duration in milliseconds.

```json
[{
  "niter": 500000000,
  "pi": 3.14154,
  "duration": 1297
}]
```

To perform the sweep we will first unpack the payload.

```{.js #calculate-sweep}
// this JavaScript snippet is later referred to as <<calculate-sweep>>
const {min, max, step} = message.data.payload.niter;
```

The result array needs to be initialized.

```{.js #calculate-sweep}
// this JavaScript snippet appended to <<calculate-sweep>>
const pis = [];
```

Lets use a [classic for loop](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for) to iterate over requested the iterations.

```{.js #calculate-sweep}
// this JavaScript snippet appended to <<calculate-sweep>>
for (let niter = min; niter <= max; niter += step) {
```

To measure the duration of a calculation we use the [performance.now()](https://developer.mozilla.org/en-US/docs/Web/API/Performance/now) method which returns a timestamp in milliseconds.

```{.js #calculate-sweep}
  // this JavaScript snippet appended to <<calculate-sweep>>
  const t0 = performance.now();
  const pifinder = new module.PiCalculate(niter);
  const pi = pifinder.calculate();
  const duration = performance.now() - t0;
```

```{.js #calculate-sweep}
  // this JavaScript snippet appended to <<calculate-sweep>>
  pis.push({
    niter,
    pi,
    duration
  });
```

To complete the sweep calculation we need to close the for loop and post the result.

```{.js #calculate-sweep}
  // this JavaScript snippet appended to <<calculate-sweep>>
}
postMessage({
  type: 'RESULT',
  payload: {
    pis
  }
});
```

The sweep calculation snippet (`<<calculate-sweep>>`) must be run in a new web worker called `worker-sweep.js`.
Like before we need to wait for the WebAssembly module to be initialized before we can start the calculation.

```{.js file=src/js/worker-sweep.js}
// this JavaScript snippet stored as src/js/worker-sweep.js
importScripts('calculatepiwasm.js');

onmessage = function(message) {
  if (message.data.type === 'CALCULATE') {
    createModule().then((module) => {
      <<calculate-sweep>>
    });
  }
};
```

```{.js #plot-app}
// this JavaScript snippet is appended to <<plot-app>>
const [pis, setPis] = React.useState([]);

function handleSubmit(submission, event) {
  event.preventDefault();
  const worker = new Worker('worker-sweep.js');
  worker.postMessage({
    type: 'CALCULATE',
    payload: submission.formData
  });
  worker.onmessage = function(message) {
      if (message.data.type === 'RESULT') {
        const result = message.data.payload.pis;
        setPis(result);
        worker.terminate();
    }
  };
}
```

The specification for a scatter plot of the `niter` against the `duration` looks like.

```{.js #vega-lite-spec}
// this JavaScript snippet is later referred to as <<vega-lite-spec>>
const spec = {
  "$schema": "https://vega.github.io/schema/vega-lite/v4.json",
  "data": { "values": pis },
  "mark": "point",
  "encoding": {
    "x": { "field": "niter", "type": "quantitative" },
    "y": { "field": "duration", "type": "quantitative", "title": "Duration (ms)" }
  },
  "width": 800,
  "height": 600
};
```

To render the spec we use the [vegaEmbed](https://github.com/vega/vega-embed) module. The Vega-Lite specification is a simplification of the [Vega specification](https://vega.github.io/vega/docs/specification/) so wil first import `vega` then `vega-lite` and lastly `vega-embed`.

```{.html #imports}
<script src="https://cdn.jsdelivr.net/npm/vega@5.13.0"></script>
<script src="https://cdn.jsdelivr.net/npm/vega-lite@4.13.0"></script>
<script src="https://cdn.jsdelivr.net/npm/vega-embed@6.8.0"></script>
```

The `vegaEmbed()` function needs a DOM element to render the plot in.
In React we must use the [useRef](https://reactjs.org/docs/hooks-reference.html#useref) hook to get a reference to a DOM element. As the DOM element needs time to initialize we need to use the [useEffect](https://reactjs.org/docs/hooks-effect.html) hook to only embed the plot when the DOM element is ready. The `Plot` React component can be written as

```{.jsx #plot-component}
// this JavaScript snippet is later referred to as <<plot-component>>
function Plot({pis}) {
  const container = React.useRef(null);

  function didUpdate() {
    if (container.current === null) {
      return;
    }
    <<vega-lite-spec>>
    vegaEmbed(container.current, spec);
  }
  const dependencies = [container, pis];
  React.useEffect(didUpdate, dependencies);

  return <div ref={container}/>;
}
```

The App component can be defined and rendered with.

```{.jsx file=src/js/plot-app.js}
// this JavaScript snippet stored as src/js/plot-app.js
<<heading-component>>

<<plot-component>>

function App() {
  const Form = JSONSchemaForm.default;
  const uiSchema = {
    "niter": {
      "ui:widget": "range"
    }
  }
  const [formData, setFormData] = React.useState({

  });

  function handleChange(event) {
    setFormData(event.formData);
  }

  <<plot-app>>

  return (
    <div>
      <Heading/>
      <<jsonschema-form>>
      <Plot pis={pis}/>
    </div>
  );
}

ReactDOM.render(
  <App/>,
  document.getElementById('container')
);
```

The HTML page should look like

```{.html file=src/js/example-plot.html}
<!doctype html>
<!-- this HTML page is stored as src/js/plot-form.html -->
<html lang="en">
  <head>
    <title>Example plot</title>
    <<imports>>
  <head>
  <body>
    <div id="container"></div>

    <script type="text/babel" src="plot-app.js"></script>
  </body>
</html>
```

Like before we also need to host the files in a web server with

```shell
python3 -m http.server 8000
```

Visit [http://localhost:8000/src/js/example-plot.html](http://localhost:8000/src/js/example-plot.html) to see the niter/duration plot.

Embedded below is the example app hosted on [GitHub pages](https://nlesc-jcer.github.io/cpp2wasm/src/js/example-plot.html)

<iframe width="100%" height="1450" src="https://nlesc-jcer.github.io/cpp2wasm/src/js/example-plot.html" /></iframe>

After the submit button is pressed the plot should show that the first calculation took a bit longer then the rest.
