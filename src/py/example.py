# this Python snippet is stored as src/py/example.py
from calculatepipy import PiCalculate

pifinder = PiCalculate(niter=500000000)
pi = pifinder.calculate()
print(pi)