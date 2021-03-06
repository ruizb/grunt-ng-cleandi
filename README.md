# grunt-ng-cleandi

> Clean unused dependency injections from your AngularJS components.

## Getting started

This plugin requires Grunt `~0.4.0`.

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Right now, this Grunt plugin is not deployed on the [npm registry](https://www.npmjs.org/), so add the following line to your `devDependencies` object in the `package.json` file:

```
"grunt-ng-cleandi": "git://github.com/ruizb/grunt-ng-cleandi.git"
```

To install the plugin, just run `npm install` in the terminal in your project directory.

Once the plugin has been installed, it may be enabled inside your Gruntfile with the following line:

```
grunt.loadNpmTasks('grunt-ng-cleandi');
```

## CleanDI task

*Run this task with the `grunt cleandi` command.*

### Settings

#### files

Type: `Array`

Contains string patterns of the files that will be processed.

##### Example

```
files: ['src/app/**/*.js']
```

#### comments

Type: `Boolean`

If true, the algorithm will remove unused dependency injections from AngularJS components even if these dependencies are used in some comments. If false, only the uncommented dependencies will be counted in the algorithm. Default value is `false`.

##### Example

```
angular
  .module('my.module')
  .controller('MyCtrl', function (dep1, dep2) {
    // dep1.doSomething();
    dep2.doSomething();
  });
```

If comments is `true`, the output will be:

```
angular
  .module('my.module')
  /*.controller('MyCtrl', function (dep1, dep2) {*/
  .controller('MyCtrl', function (dep2) {
    // dep1.doSomething();
    dep2.doSomething();
  });
```

If comments is `false`, the output will stay the same as the input (because there is atleast 2 occurrences in the file (dependency injection + commented line)).

There are 3 ways to pass in the option to the task:

```
grunt cleandi:myFile --comments
```

```
  // somewhere in the Gruntfile
  cleandi: {
    comments: true
  }
```

```
  // somewhere in the Gruntfile
  cleandi: {
    options: {
      comments: true
    }
  }
```

## Plugin not working?

Right now, this Grunt plugin only works if you follow specific conventions for writing your AngularJS components. The *head* of the file must be like one of these 2 examples:

```
angular
  .module('myModule')
  .component('MyComponent', function (dep1, dep2) {
    // ...
  });
```

```
angular
  .module('myModule')
  .component('MyComponent', ['dep1', 'dep2', function (dep1, dep2) {
    // ...
  }]);
```

Otherwise, the plugin might not work as expected. You are free to contribute to this project by forking it and adding regular expressions that handle other conventions! :) 

You can run the task in the terminal with the option `--debug` to have more details on the task execution.

## Release History

| Date       | Tag    | Description   |
|------------|--------|---------------|
| 2014-07-26 | v0.1.0 | First release |

***

Task submitted by [Benoit Ruiz](http://linkedin.com/in/ruizbenoit/).