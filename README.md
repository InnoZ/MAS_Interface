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

### Nginx config (note the ActionCable part!)

```
upstream innoz-matsim{
    # Path to Unicorn SOCK file, as defined previously
    server unix:/srv/MAS_Interface/tmp/unicorn.sock fail_timeout=0;
}
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name simulations.innoz.de;
    location /{
    proxy_pass http://innoz-matsim;
    proxy_set_header X-Forwarded-For    $proxy_add_x_forwarded_for;
    proxy_set_header Host               $host;
    proxy_set_header X-Forwarded-Proto  $scheme;
    proxy_set_header X-Real-IP          $remote_addr;
    proxy_redirect off;
    }
    # needed for rails actioncable used by the platform demonstrator
    location /cable {
      proxy_pass http://innoz-matsim;
      proxy_http_version 1.1;
      proxy_set_header Upgrade $http_upgrade;
      proxy_set_header Connection "upgrade";
    }
    ssl on;
    ssl_certificate /etc/nginx/ssl/simulations.innoz.de.crt;
    ssl_certificate_key /etc/nginx/ssl/simulations.innoz.de.key;
    ssl_dhparam /etc/nginx/ssl/dhp-2048.pem;
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:50m;
    ssl_session_tickets off;
    ssl_protocols TLSv1 TLSv1.1 TLSv1.2;
    ssl_ciphers 'ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-AES256-GCM-SHA384:DHE-RSA-AES128-GCM-SHA256:DHE-DSS-AES128-GCM-SHA256:kEDH+AESGCM:ECDHE-RSA-AES128-SHA256:ECDHE-ECDSA-AES128-SHA256:ECDHE-RSA-AES128-SHA:ECDHE-ECDSA-AES128-SHA:ECDHE-RSA-AES256-SHA384:ECDHE-ECDSA-AES256-SHA384:ECDHE-RSA-AES256-SHA:ECDHE-ECDSA-AES256-SHA:DHE-RSA-AES128-SHA256:DHE-RSA-AES128-SHA:DHE-DSS-AES128-SHA256:DHE-RSA-AES256-SHA256:DHE-DSS-AES256-SHA:DHE-RSA-AES256-SHA:AES128-GCM-SHA256:AES256-GCM-SHA384:AES128-SHA256:AES256-SHA256:AES128-SHA:AES256-SHA:AES:CAMELLIA:DES-CBC3-SHA:!aNULL:!eNULL:!EXPORT:!DES:!RC4:!MD5:!PSK:!aECDH:!EDH-DSS-DES-CBC3-SHA:!EDH-RSA-DES-CBC3-SHA:!KRB5-DES-CBC3-SHA';
    ssl_prefer_server_ciphers on;
    ssl_stapling on;
    ssl_stapling_verify on;
}
```
