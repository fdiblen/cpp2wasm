// this C++ snippet is stored as src/calculatepi.cpp
#include<bits/stdc++.h>
#include <iostream>

// this C++ code snippet is later referred to as <<algorithm>>
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

// Driver program to test above
int main()
{
  int niter = 5e8;
  pirng::PiCalculate pifinder(niter);
  double pi = pifinder.calculate();

  std::cout << "The value of the pi is : " << pi << std::endl;
  return 0;
}