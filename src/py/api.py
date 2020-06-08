# this Python snippet is stored as src/py/api.py
def calculate(body):
  niter = body['niter']
  from calculatepipy import PiCalculate
  pifinder = PiCalculate(niter)
  pi = pifinder.calculate()
  return {'pi': pi}