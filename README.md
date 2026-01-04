# EventsRegisterAppAngular

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 16.2.5.

## AWS Amplify Setup

This application uses AWS Amplify for authentication and backend services. To set up AWS Amplify:

1. Install the Amplify CLI globally:
   ```bash
   npm install -g @aws-amplify/cli
   ```

2. Pull the Amplify configuration from the cloud:
   ```bash
   amplify pull
   ```
   This will generate the `src/aws-exports.js` file with the actual AWS resource configuration.

3. If you don't have access to the Amplify project, contact the project administrator.

**Note**: The repository includes a stub `src/aws-exports.js` file with placeholder values to allow the build to succeed. However, authentication features will not work until you run `amplify pull` to fetch the actual AWS resource configuration.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.
