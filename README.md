# ASA React

A React application for viewing American Soccer Analysis data, including goals added statistics for NWSL and MLS players.

## Features

- **League Selection**: Switch between NWSL and MLS data
- **View Types**: Three different views for each league:
  - **Players**: Individual player statistics with goals added data
  - **Teams**: Team-level analytics (coming soon)
  - **Goalkeepers**: Goalkeeper-specific statistics (coming soon)
- **Year Filter**: Select different seasons (2020-2025) - disabled when using date filters
- **Team Filter**: Filter players by specific teams
- **Player Name Filter**: Search for players by name
- **Minimum Minutes Filter**: Filter players who have played at least a specified number of minutes
- **Date Range Filter**: Filter data by start and end dates (overrides year selection)
- **Clear Filters**: Reset all filters with one click
- **Sortable Data Grid**: Sort by any column including goals added totals and action types

**Note**: You can filter by either season (year) OR date range, but not both simultaneously. Date filters will override the year selection. When using a start date, an end date is required and will default to the current date if not specified. The table displays player names, teams, minutes played, total goals added, and breakdown by action types.

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
