[![Build Status](https://travis-ci.org/mozilla/webmaker.org.png)](https://travis-ci.org/mozilla/webmaker.org)
[![Dependency Status](https://gemnasium.com/mozilla/webmaker.org.png)](https://gemnasium.com/mozilla/webmaker.org)
[![Code Climate](https://codeclimate.com/github/mozilla/webmaker.org.png)](https://codeclimate.com/github/mozilla/webmaker.org)

# webmaker.org

## TLDR; if you've done this before

####Development

1. `git clone https://github.com/mozilla/webmaker.org`
2. `npm install`
3. `cp env.dist .env`
4. `grunt dev` (Builds front end js. If you aren't working on front end assets you can just do `node app`)

####Submitting PRs

1. `grunt` (validate and compress images)
2. Make a pull request against `mozilla/master`

##New Contributors

Please review our contributing guidelines [here](https://github.com/mozilla/webmaker.org/blob/master/CONTRIBUTING.md).


### Dependencies

The setup portion of this README assumes you have the following installed:

* Node.js & npm
* Bower: `npm install -g bower`
* grunt-cli: `npm install -g grunt-cli`

You should also have these Webmaker stack applications running:

* MakeAPI: [https://github.com/mozilla/MakeAPI](https://github.com/mozilla/MakeAPI)
* Webmaker Login: [https://github.com/mozilla/login.webmaker.org](https://github.com/mozilla/login.webmaker.org)

### Project Setup

1. Clone webmaker.org and enter the directory: `git clone https://github.com/mozilla/webmaker.org && cd webmaker.org`
2. Install webmaker.org's Node and Bower dependencies: `npm install`
3. Copy the configuration template to its expected location: `cp env.dist .env`
4. Open `.env` in your favourite text editor and ensure that your `PORT`, `MAKE_ENDPOINT`, `LOGIN` and `LOGINAPI` environment variables are set to the correct values. `PORT` can be any available port. `MAKE_ENDPOINT`, `LOGIN` and `LOGINAPI` should point to the URL of your running MakeAPI and Webmaker Login service instances.
5. Run `grunt dev`, and open up `http://localhost:7777/` in your favourite web browser!

### Grunt Tasks

- `grunt` - Validate LESS, beautify and lint JS, compress images as needed. Run before you push.
- `grunt dev` - Run the server and build js files as they are changed
- `grunt verify` - Verify LESS and JS are formatted and lint free. Read only. Used by Travis.

