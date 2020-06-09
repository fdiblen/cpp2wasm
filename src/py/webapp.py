# this Python snippet is stored as src/py/webapp.py
from flask import Flask, request
app = Flask(__name__)

# this Python code snippet is later referred to as <<py-form>>
@app.route('/', methods=['GET'])
def form():
  return '''<!doctype html>
    <form method="POST">
      <label for="niter">Number of iterations</label>
      <input type="number" name="niter" value="500000000">
      <button type="submit">Submit</button>
    </form>'''

# this Python code snippet is later referred to as <<py-calculate>>
@app.route('/', methods=['POST'])
def calculate():
  niter = int(request.form['niter'])

  from calculatepipy import PiCalculate
  pifinder = PiCalculate(niter)
  pi = pifinder.calculate()

  return f'''<!doctype html>
    <p>With {niter} iterations calculated pi is {pi}.</p>'''
  # this Python code snippet is appended to <<py-calculate>>

app.run(port=5001)