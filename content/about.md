# About...

## the project:

**The goal** of the project is help developers gain a better understanding of their test suite by:

1. providing insight into the structure of the test suite, and
2. create bidirectional traceability between test and production code.

The infrastructure consists of multiple componenets:
- [**Morpheus**](https://github.com/spideruci/morpheus): A matrix the developer can search/filter to show relationships between the executed tests and what was being executed.
- [**Tacoco**](https://github.com/spideruci/tacoco/): A test runner that allows instrumenting individual test cases, making it possible to get dynamic information for each individual test case.
- [**SpiderTools/backend**](https://github.com/spideruci/morpheus-backend/): Converts the coverage data from *tacoco* into method coverage and creates a mapping between test and production code including historical data.
- [**Experiment Reproduction Package**](https://1drv.ms/u/s!Ap3ztrSCwwsXgd8utbrBigqEcA80dA?e=Kp3wSO): A package to reproduce the emperical experiment performed as part of the Morpheus paper publication to VISSOFT'21: "Global Overviews of Granular Test Coverage with Matrix Visualizations", Dreef et. al.

## the authors:

- **Kaj Dreef**: 
- **Vijay Krishna Palepu**:
- **James A. Jones**:
