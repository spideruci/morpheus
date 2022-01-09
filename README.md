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
| REACT_APP_REST_API         | Configure to use the REST api instead of static files  | true |
| REACT_APP_API_ENDPOINT     | Configure the endpoint during compile time. | http://api.kajdreef.com |

For example, to change the endpoint for the visualization when running in development mode, run the following command:
`$ REACT_APP_REST_API=true yarn start`

## Coverage data:

By default it will request files that are placed in `public/data/`. As a result the directory structure looks as following:

```
public/data
├── coverage
│   └── projects
│       ├── 1
│       │   ├── commits
│       │   ├── methods
│       │   └── tests
│       └── 2
│           ├── commits
│           ├── methods
│           └── tests
└── projects
    ├── 1
    └── 2
```

At the moment, one dataset is provided in the `datasets` folder. Using the `setup-data.sh` script you can unzip the files and put them in the right place.

```
// Run this from the root directory of the project
$ ./setup-data.sh -d datasets/2021110101-jpacman-commons-io.zip
```

| dataset | projects | notes   |
|---------|----------|---------|
| 2021110101.zip | jpacman-framework | Only contains the coverage data of the last 10 release of jpacman. |

## Convert svg to pdf
The svg files can be downloaded by clicking the download button at the bottom of the toolbar. These svg files can then be converted to pdf using inkscape as following: 
```
inkscape commons-cli_3f150ee.svg --export-area-drawing --batch-process --export-type=pdf --export-filename=output.pdf
````