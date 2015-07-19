module.exports = function(grunt) {
    "use strict";
    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),

        concat: {
            options: {
                separator: ';'
            },
            dist: {
                //src: ["js/nanoajax.min.js", "js/nanomodal.min.js", "js/vanilla-masker.min.js", "js/app.js"],
                src: ["js/app.js"],
                dest: "js/app.min.js"
            }
        },
        uglify: {
            options: {
                mangle: {
                    except: []
                }
            },
            my_target: {
                files: {
                    "js/app.min.js": ["js/app.min.js"]
                }
            }
        },
        watch: {
            scripts: {
                files: ['**/*.js'],
                tasks: ['default'],
                options: {
                    spawn: true
                }
            }
        }
    });

    grunt.loadNpmTasks("grunt-contrib-concat");
    grunt.loadNpmTasks("grunt-contrib-uglify");
    grunt.loadNpmTasks("grunt-contrib-watch");

    grunt.registerTask("default", [ "concat", "uglify"]);
   // grunt.registerTask("default", [ "concat"]);

    grunt.registerTask("dev", ["default", "watch"]);
};
