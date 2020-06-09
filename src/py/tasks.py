# this Python snippet is stored as src/py/tasks.py
import time

# this Python code snippet is later referred to as <<celery-config>>
from celery import Celery
capp = Celery('tasks', broker='redis://localhost:6379', backend='redis://localhost:6379')

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