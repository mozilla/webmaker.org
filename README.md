webmaker-events
===============

Pluggable events app for Mozilla Webmaker


Integrating into Webmaker
-------------------------
Add the following line to `app.js`:

    require("webmaker-events").init(app, nunjucksEnv, lessMiddleWare, app_root);

where:
  - `app` is the Express app
  - `nunjucksEnv` is the nunjucks Environment for adding a custom fileloader
    before calling `nunjucksEnv.express(app)`
  - `lessMiddleWare` is the 'less-middleware' module, for compiling less
    stylesheets
  - `app_root` is the root dir for the express app, which is usually `__dirname`

Add `webmaker-events` to the dependency list in `package.json`:

    "webmaker-events": "git://github.com/AmoebaConsulting/webmaker-events.git"

See [mozilla/webmaker.org](
  https://github.com/mozilla/webmaker.org/blob/master/app.js#L70
) for all the changes required to get it working with Webmaker.

Importing Events to Fixtures
----------------------------
Events can be loaded at runtime by placing a JSON file with the Event fixture
at `fixtures/initial_data.json`. This can be generated from the live webmaker
events by running:

    curl -L https://webmaker.org/events.json | ./scripts/transform_to_fixture.pl > fixtures/initial_data.json

This requires several Perl and several CPAN packages, which can be installed
via cpanminus:

    curl -L http://cpanmin.us | perl - -S App::cpanminus Modern::Perl JSON JE

Running Database Migrations
---------------------------
Database migrations must be run from within the webmaker.org dir using foreman:

    cd webmaker.org
    foreman run ./node_packages/webmaker-events/scripts/sequelize -m

To undo the latest migrations:

    foreman run ./node_packages/webmaker-events/scripts/sequelize -mu

If you don't have foreman, you can also try:

    source .env
    ./node_packages/webmaker-events/scripts/sequelize -m

To fill the city/country fields for Events, you can run the following script:

    foreman run ./node_packages/webmaker-events/scripts/geocode_events.js

To convert the attendee field from the old enum/range format to an average number (this should only be run once):

    foreman run ./node_packages/webmaker-events/scripts/convert_attendees.js

You can run a basic nodeJs repl with the orm loaded via the 'db_shell.js' script:

    foreman run ./node_packages/webmaker-events/scripts/db_shell.js


Known Bugs
----------

  - DateTime fields seem to not work with fixtures loaded into SQLite, when
    the fixtures where generated from data dumped from a webmaker.org server
    running mysql (default).
