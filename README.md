# Morpheus

Morpheus is a visualization tool with the focus on visualization the the form and function of a test suite.

## Running the visualization

Before the visualization can be run, we need to setup the [backend](https://github.com/kajdreef/spidertools). 

- `yarn install`: download all the dependencies to run the visualization.
- `yarn start`: Runs the app in the development mode. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.
- `yarn build`: Builds the app for production to the `build` folder.

## Environment Variables:

| Variable Name              | Goal           | Example        |
|----------------------------|----------------|----------------|
| REACT_APP_API_ENDPOINT     | Configure the endpoint during compile time. | http://api.kajdreef.com |


For example, to change the endpoint for the visualization when running in development mode, run the following command:

`$ REACT_APP_API_ENDPOINT=http://api.kajdreef.com yarn start`