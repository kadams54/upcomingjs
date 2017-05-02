# Upcoming.js [![Build Status](https://secure.travis-ci.org/kadams54/upcomingjs.png?branch=master)](https://travis-ci.org/kadams54/upcomingjs)

Displays upcoming events from public Google calendars in a customizable fashion.

* Free software: [Apache License](https://github.com/kadams54/upcomingjs/blob/master/LICENSE)
* History: [HISTORY.md](https://github.com/kadams54/upcomingjs/blob/master/HISTORY.md)
* How to contribute: [CONTRIBUTING.md](https://github.com/kadams54/upcomingjs/blob/master/CONTRIBUTING.md)

## Demo

Live demo: http://kadams54.github.io/upcomingjs/demo/.

To try out the demo locally:

1. Make sure you have NPM and Grunt installed.
2. Set up Upcoming.js and run it:

  ```bash
  git clone https://github.com/kadams54/upcomingjs.git
  cd upcomingjs/
  npm install
  grunt
  ```

## Usage

1. Include the code:

	```html
	<script src="upcoming.min.js"></script>
	```

2. Call upcomingjs:

	```javascript
	window.upcomingjs(
    '#my-upcoming',  // Element selector
    'MY GOOGLE CALENDAR API KEY',  // Google Calendar API key
    'MY CALENDAR ID'  // Google Calendar ID
	);
	```

Upcoming.js requires three pieces of information, passed in as the three
parameters above:

1. The selector for the DOM element into which Upcoming.js should render
   the event list.
2. Your Google Calendar API key.
3. The public calendar's ID - note that the calendar *must* be made
   public.

The first bit of information, the DOM selector, is easy. Unfortunately
the last two require a bit of work.

### Obtaining Your Google Calendar API Key

Hat tip to [Full Calendar](https://fullcalendar.io/) for [these instructions](https://fullcalendar.io/docs/google_calendar/):

1. Go to the [Google Developer Console](https://console.developers.google.com/)
   and create a new project (it might take a second).
2. Once in the project, go to **APIs & auth > APIs** on the sidebar.
3. Find "Calendar API" in the list and turn it ON.
4. On the sidebar, click **APIs & auth > Credentials**.
5. In the "Public API access" section, clikc "Create new Key".
6. Choose "Browser key".
7. If you know what domains will host your calendar, enter them into the
   box. Otherwise, leave it blank. You can always change it later.
8. Your new API key will appear. It might take a second or two before it
   starts working.

### Making Your Google Calendar Public

TODO

### Finding Your Google Calendar ID

TODO

## Team

Upcoming.js was created by Kyle Adams, with help from these [contributors](https://github.com/kadams54/upcomingjs/graphs/contributors).

### Credits

* [Zeno Rocha](http://zenorocha.com) and [Addy Osmani](http://addyosmani.com) for creating [jquery-boilerplate](https://github.com/jquery-boilerplate/jquery-boilerplate).
* [Audrey Roy](http://www.audreymroy.com) for creating [cookiecutter-jquery](https://github.com/audreyr/cookiecutter-jquery).


### Sites Using This Widget

* None listed yet. Why not be the first?
