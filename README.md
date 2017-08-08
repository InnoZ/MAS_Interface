# README

# MATSim Interface

This repository is for the development and maintenance of an interactive website for an Interface of the MATSim Multi Agent Traffic Simulation.

Local Development Environment
-----------------------------

Some Dependencies you need:

- clone the repository
- ruby = 2.3.1
- rails >= 5
- postgresql >= 9.1
- JavaScript runtime (if not pre-installed, e.g. nodejs)
- an empty database named mas_interface_development
- user postgres/ pw postgres

Inside the project folder run:

if you have trouble with calling "bin/rake" you can also try "bundle exec rake" or "bin/rails"

```bash
gem install bundler
bundle install
```
```bash
bin/rake db:gis:setup
```
```bash
bin/rake db:migrate
```

Start the App with

```bash
rails s
```

You can access the site in the browser with
*http://127.0.0.1:3000* 
or 
*localhost:3000*

### Further dependencies

Some tasks, such as email notification and scenario creation are performed in queues. For those, ActiveJob with sidekiq adapter is used, requiring the package `redis-server`. To start the queuing engine, use

```bash
sidekiq -C config/sidekiq.yml
```

Queues can be tracked on an inteface. Visit *localhost:3000/queue*.

### Specs

When everything is set up correctly, all specs should pass. Run


```bash
bin/rake
```
or

```bash
bundle exec rake
```


to run all specs. To get an overview over the scope of the project,
see `spec/features` with the full stack acceptance level tests. See
the other subdirectories under `spec` for unit level tests.

Not only to assure integrity, but to make clear the purpose of new or edited code, all pull requests should go along with suitable specs.


### Code conventions

The project uses rubocop (https://github.com/bbatsov/rubocop). The
default rake task runs rubocop after the specs, but you can also run
it manually with


```bash
bundle exec rubocop
```

Please do not commit code with new offenses.

Write good commit messages:
http://tbaggery.com/2008/04/19/a-note-about-git-commit-messages.html


### Frontend assets

An asset pipeline is used to concatenate, compress and cache control
javascript, css and image files. The toplevel files in
assets/javascripts/application.js and
assets/stylesheets/application.css.scss pull everything together.

Our own asset files are under the assets directory.

External frontend packages such as jquery and leaflet are put under
vendor/assets.

### Coding Standards

The rule above all: please be consistent. Look around how it has been
done elsewhere in the app and either do it the same way, or make a
separate commit that changes the style throughout the app, so that the
code remains consistent.

- Use spaces, not tabs for indentation

- Ruby: https://github.com/airbnb/ruby & Rubocop

- Javascript:
  https://google.github.io/styleguide/javascriptguide.xml
  (with the deviation that we use 2 instead of 4 spaces).

- CSS/SCSS: hyphen separated, lowercase e.g.: `.city-name { ... }`

- Filenames: underscore separated, lowercase, english
  e.g. `city_overview.haml`

### Server config and deployment

The rails deployment is mostly based on this tutorial: https://www.digitalocean.com/community/tutorials/how-to-deploy-a-rails-app-with-unicorn-and-nginx-on-ubuntu-14-04

We use a system user 'apprunner', i.e. for managing the repository folder and access the rails database.
Two init scripts are set to start all necessary services on server startup (i.e. after automatic reboot):

- `/etc/init.d/unicorn_mas_interface` to start the webserver (based on the unicorn service explained in the tutorial)

- `/etc/rc.local` to start the sidekiq queue engine (starts command `sudo su apprunner -c "cd /srv/MAS_Interface && bundle exec sidekiq -C config/sidekiq.yml -e production"`)
