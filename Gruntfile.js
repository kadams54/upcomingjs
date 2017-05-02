module.exports = function(grunt) {

  grunt.initConfig({

    // Import package manifest
    pkg: grunt.file.readJSON("package.json"),

    // Banner definitions
    meta: {
      banner: "/*\n" +
        " *  <%= pkg.title || pkg.name %> - v<%= pkg.version %>\n" +
        " *  <%= pkg.description %>\n" +
        " *  <%= pkg.homepage %>\n" +
        " *\n" +
        " *  Made by <%= pkg.author %>\n" +
        " *  Under <%= pkg.licenses[0].type %> License\n" +
        " */\n"
    },

    // Lint definitions
    eslint: {
      src: ["src/upcoming.js"]
    },

    // Concat definitions
    concat: {
      dist_js: {
        src: "src/upcoming.js",
        dest: "dist/upcoming.js"
      },
      dist_css: {
        src: "src/upcoming.css",
        dest: "dist/upcoming.css"
      },
      options: {
        banner: "<%= meta.banner %>"
      }
    },

    // Minify definitions
    uglify: {
      dist: {
        src: "dist/upcoming.js",
        dest: "dist/upcoming.min.js"
      },
      options: {
        banner: "<%= meta.banner %>",
        mangle: false,
        compress: false
      }
    },

    // CSS minification
    cssmin: {
      add_banner: {
        options: {
          banner: '/* Upcoming.js by kadams54 ~ https://github.com/kadams54/upcomingjs */'
        },
        files: {
          'dist/upcoming.min.css': ['src/upcoming.css']
        }
      }
    },

    // Start up server on 8080 and open demo
    connect: {
      server: {
        options: {
          keepalive: true,
          open: "http://127.0.0.1:8080/demo/index.html",
          port: 8080
        }
      }
    }

  });

  grunt.loadNpmTasks("gruntify-eslint");
  grunt.loadNpmTasks("grunt-contrib-concat");
  grunt.loadNpmTasks("grunt-contrib-uglify");
  grunt.loadNpmTasks("grunt-contrib-cssmin");
  grunt.loadNpmTasks("grunt-contrib-connect");

  grunt.registerTask("default", ["eslint", "concat", "connect"]);
  grunt.registerTask("travis", ["eslint"]);

};
