# grunt-clean-dep

> Clean unused dependency injections from your AngularJS components.

## Getting started

This plugin requires Grunt `~0.4.0`.

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Right now, this Grunt plugin is not deployed on the [npm registry](https://www.npmjs.org/), so add the following line to your `devDependencies` object in the `package.json` file:

```
"grunt-clean-dep": "git://github.com/ruizb/grunt-clean-dep.git"
```

To install the plugin, just run `npm install` in the terminal in your project directory.

Once the plugin has been installed, it may be enabled inside your Gruntfile with the following line:

```
grunt.loadNpmTasks('grunt-clean-dep');
```

## Cleandep task

*Run this task with the `grunt cleandep` command.*

### Settings

For now, there is only one option available.

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
grunt cleandep:myFile --comments
```

```
  // somewhere in the Gruntfile
  cleandep: {
    comments: true
  }
```

```
  // somewhere in the Gruntfile
  cleandep: {
    options: {
      comments: true
    }
  }
```

## Release History

| Date       | Tag    | Description               |
|------------|--------|---------------------------|
| 2014-07-26 | v0.1.0 | First release of the task |

***

Task submitted by [Benoit Ruiz](linkedin.com/in/ruizbenoit/).