module.exports = function (grunt) {

  /**
   * Escapes the string given in param to pass it to the RegExp constructor
   * @param  {string} string 
   * @return {string}        
   */
  function escapeRegExp(string) {
    return string.replace(/([.*+?^${}()|\[\]\/\\])/g, "\\$1");
  }
  
  /**
   * Grunt task
   * @param  {string} target A file name or a directory name
   */
  grunt.registerTask('cleandi', 'Clean the unused dependency injections of your AngularJS components', function (target) {

    var self = this;

    // list of files the task will clean
    var files = grunt.config([self.name, 'files']) || 
                grunt.config([self.name, 'options', 'files']);

    if (!files && typeof target !== 'string') {
      grunt.fatal('You must specify a list of files in your Gruntfile or a (file|dir)name as a task parameter to run this task.\nUsage: grunt cleandi:file_or_dir_name');
    }

    // parameter overrides the config
    if (typeof target === 'string') {
      if (grunt.file.isDir(target)) {
        files = grunt.file.expand(target + '/**/*.js');
      }
      else if (grunt.file.isFile(target)) {
        files.push(target);
      }
      else {
        grunt.log.writeln('No file or directory "' + target + '" was found. Checking Gruntfile config...');
        if (!files) {
          grunt.fatal('Gruntfile config "files" or "options.files" not found. Task aborted.');
        }
        else {
          files = grunt.file.expand(files);
        }
      }
    }
    else {
      files = grunt.file.expand(files);
    }

    grunt.log.debug('CleanDI task will be run on ' + files.length + ' files:\n\t' + files.join(',\n\t'));

    ///////////////////////////////////////////////////////////////
    // REGEX: captures the dependencies of the Angular component //
    ///////////////////////////////////////////////////////////////
    var depRegex = /(?!\/\*)\.(?:controller|directive|factory|service|provider|filter)\((?:'|")(?:.+)(?:'|"),\s*\[?(?:(?:'(?:.+),\s*),\s*)?function\s*\((.*(?:,\s*)?)\)\s*{(?!\*\/)/;

    ///////////////////////////////////////////////////////////////
    // REGEX: detects if a component has been declared for ngMin //
    ///////////////////////////////////////////////////////////////
    var minFormRegex = /\.(?:controller|directive|factory|service|provider|filter)\((?:'|")(?:.+)(?:'|"),\s*(\[){1}/;

    /////////////////////////////////////////////////////////////
    // REGEX: captures the content of the comments in the file //
    /////////////////////////////////////////////////////////////
    var commentRegex = /(?:\/\*([^*]+|[\r\n]|(?:\*+(?:[^*\/]|[\r\n])))*\*+\/)|(?:\/\/\s*(.*))/g;

    // if the user wants to clean a dependency even if it's in some comments
    var checkComments = grunt.option('comments') || 
                        grunt.config([self.name, 'comments']) || 
                        grunt.config([self.name, 'options', 'comments']) || 
                        false;

    // if there are files to clean
    if (files.length > 0) {

      var isFullFormForMin, // true if the component is declared for ngMin, false otherwise
          fileContent, // original content of the file
          inComments; // array containing the content of all the file comments

      files.forEach(function (file) {

        inComments = [];

        if (grunt.file.isFile(file)) {

          grunt.log.debug('\n');
          grunt.log.debug('FILE  ' + file);
          grunt.log.debug('-----------------------------------------------------');
          fileContent = grunt.file.read(file);

          if (!fileContent) {
            grunt.fatal('Could not read the file "' + file + '".');
          }

          isFullFormForMin = minFormRegex.test(fileContent);

          // get all the comments of the file
          while ((matches = commentRegex.exec(fileContent)) !== null) {
            inComments.push(matches[1] || matches[2] || '');
          }

          ///////////////////////////////////////////////////////////////
          // REGEX: captures the component declaration in order to put //
          // it as a comment juste above the cleaned declaration       //
          ///////////////////////////////////////////////////////////////
          var regexComponentDeclaration = new RegExp('(' + escapeRegExp(fileContent.match(depRegex)[0]) + ')');
          var fileContentWithComment = fileContent.replace(regexComponentDeclaration, '/*\$1*/' + grunt.util.linefeed + '  \$1');

          // array of dependencies
          var dependencies = depRegex.exec(fileContent)[1].replace(/\s+/g, '').split(',');
          // if there wasn't any dependency, clear the array
          dependencies = dependencies[0] === '' ? [] : dependencies;

          
          var tmpRegex, // catch the dependency in the file
              matches, // matches of the dependency in the file
              total, // total of occurrences of the dependency in the file
              base = (isFullFormForMin ? 2 : 1), // 2 occurrences for ngMin form, 1 for normal form
              replaceOccurrencesRegex, // regex to clean the dependency injections
              removedDependencies = []; // array of soon-to-be removed dependencies

          dependencies.forEach(function (dep) {
            grunt.log.debug('  START check ' + dep + '...');

            total = 0;

            ////////////////////////////////////////////////////////////////////////////
            // REGEX: captures the occurrences of 'dep' in the dependency injections  //
            ////////////////////////////////////////////////////////////////////////////
            replaceOccurrencesRegex = new RegExp("((?:(?:'|\")?" + escapeRegExp(dep) + "(?:'|\")?,\\s*)|(?:,\\s*(?:'|\")?" + escapeRegExp(dep) + "(?!\\w+)(?:'|\")?))(?!(?:.+)\\*\\/)", 'g');

            ////////////////////////////////////////////////
            // REGEX: catch 'dep' occurrences in the file //
            ////////////////////////////////////////////////
            tmpRegex = new RegExp('(?:' + escapeRegExp(dep) + '(?!\\w+))', 'g');

            // while there are occurrences of the dependency in the file
            while ((matches = tmpRegex.exec(fileContent)) !== null) {
              total++;
            }
            
            ////////////////////////////////////
            // is the dependency in comments? //
            ////////////////////////////////////
            if (checkComments) {
              grunt.log.debug('  END   check ' + dep + '. Occurrences: ' + total);
              grunt.log.debug('  START check ' + dep + ' in comments...');
              inComments.forEach(function (comment) {
                var r = new RegExp(escapeRegExp(dep));
                if (r.test(comment)) {
                  total--;
                }
              });
              grunt.log.debug('  END   check ' + dep + ' in comments. Final occurrences of "' + dep + '" in the file "' + file + '": ' + total + '\n');
            }
            else {
              grunt.log.debug('  END   check ' + dep + '. Final occurrences of "' + dep + '" in the file "' + file + '": ' + total + '\n');
            }
            
            ////////////////////////////////////////////////////////
            // if the dependency is not used, clean the injection //
            ////////////////////////////////////////////////////////
            if (total === base) {
              removedDependencies.push(dep);
              fileContentWithComment = fileContentWithComment.replace(replaceOccurrencesRegex, '');
            }
          }); // end for each dependency
  
          /////////////////////////////////////////////////////
          // write in the file with the dependencies cleaned //
          /////////////////////////////////////////////////////
          if (removedDependencies.length > 0) {
            grunt.log.success('Removed dependency injections of the file "' + file + '": ' + removedDependencies.join(', '));
            grunt.file.write(file, fileContentWithComment);
          }

        }
        else {
          grunt.fatal('No file or directory "' + file + '" was found.');
        }

      }); // end for each file

    } // end if files.length > 0

  });

};