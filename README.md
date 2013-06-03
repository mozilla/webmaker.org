webmaker-events
===============

Pluggable events app for Mozilla Webmaker


Integrating into Webmaker
-------------------------
Add the following line to `app.js`:

    require("webmaker-events").init(app, nunjucksEnv);

where `app` is the Express app, and `nunjucksEnv` is to add a custom
file-loader to nunjucks before calling `nunjucksEnv.express(app)`.

To add `webmaker-events` to the dependency list in `package.json`,

    "webmaker-events": "git://github.com/AmoebaConsulting/webmaker-events.git"

Take a look at [AmoebaConsulting/webmaker.org#events](https://github.com/AmoebaConsulting/webmaker.org/tree/events) for all the changes
required to get it working with Webmaker.
