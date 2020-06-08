// this C++ snippet is stored as src/cgi-calculatepi.hpp
#include <string>
#include <iostream>
#include <nlohmann/json.hpp>

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