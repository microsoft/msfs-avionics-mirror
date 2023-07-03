# Working Title G3000

Folks who want to build the G3000 from this source should be aware of two things.

First, the G3000 uses a two-phased build, first compiling a shared code library that is then used by the individual components of the project.  For this reason, two distinct build commands need to be run to get a full build.

    cd wtg3000common
    npm i && npm run build
    cd ..
    npm i && npm run build

Second, for reasons of copyright, the images that form various icons have not been included in this repository.   Builds made from this source will be missing some icons but otherwise fully functional.

Once compiled, the final output can be found in the `dist` directory.  However, it will not include manifest or layout files -- these will need to be prepared by the user based on instructions and various tooling available online.