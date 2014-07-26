module.exports = function (grunt) {

  grunt.loadTasks('tasks');
  
  var initConfig = {

    pkg: grunt.file.readJSON('package.json')

  };

  grunt.initConfig(initConfig);

};