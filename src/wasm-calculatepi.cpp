// this C++ snippet is stored as src/wasm-calculatepi.cpp
#include <emscripten/bind.h>

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

using namespace emscripten;

EMSCRIPTEN_BINDINGS(calculatepiwasm) {
  class_<pirng::PiCalculate>("PiCalculate")
    .constructor<double>()
    .function("calculate", &pirng::PiCalculate::calculate)
    ;
}