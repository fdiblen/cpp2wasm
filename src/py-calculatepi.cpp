// this C++ snippet is stored as src/py-calculatepi.cpp
#include <pybind11/pybind11.h>
#include <pybind11/stl.h>

// this C++ code snippet is later referred to as <<algorithm>>
#include<stdc++.h>
#include <math.h>
#include "calculatepi.hpp"

#define SEED 35791246

namespace pirng
{

PiCalculate::PiCalculate(double niter) : niter(niter) {}

// Function to find the root
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