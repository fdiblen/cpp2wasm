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