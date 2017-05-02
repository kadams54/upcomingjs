// TODO: Verify that this is the best way to wrap a JS module in this day and age.
(function (window, document) {
  const defaultTemplate = `
    <div class="upcomingjs">
      <div class="upcomingjs__headers">
        <div class="upcomingjs__header">Date</div>
        <div class="upcomingjs__header">Info</div>
      </div>
      <div class="upcomingjs__body">
        <% if (!days.length) { %>
        <div class="upcomingjs__no-events">No upcoming events found.</div>
        <% } else { %>
        <% days.forEach(day => { %>
        <div class="upcomingjs__day-header">
          <%=day.label%>
        </div>
        <div class="upcomingjs__day-events">
          <% day.events.forEach(event => { %>
          <div class="upcomingjs__event">
            <div class="upcomingjs__event-time">
              <abbr title="<%=event.start.toISOString()%>" class="upcomingjs__event-start"><%=event.startLabel%></abbr>&#8211;<abbr title="<%=event.end.toISOString()%>" class="upcomingjs__event-end"><%=event.endLabel%></abbr>
            </div>
            <div class="upcomingjs__event-info">
              <a class="upcomingjs__event-summary" href="<%=event.htmlLink%>"><%=event.summary%></a>
              <% if (event.description) { %>
              <div class="upcomingjs__event-description"><%=event.description%></div>
              <% } %>
              <% if (event.location) { %>
              <div class="upcomingjs__event-location"><%=event.location%></div>
              <% } %>
            </div>
          </div>
          <% }); %>
        </div>
        <% }); %>
        <% } %>
      </div>
    </div>
  `;

  function extend() {
    let i, key;
    for (i = 1; i < arguments.length; i++) {
      for (key in arguments[i]) {
        if (arguments[i].hasOwnProperty(key)) {
          arguments[0][key] = arguments[i][key];
        }
      }
    }
    return arguments[0];
  }

  const defaults = {
    dayLabelFormat: { weekday: "long", month: "long", day: "numeric" },
    error: function(e) {
      const cause = e.cause ? e.cause.statusText : e.message;
      const prefix = 'Unable to display the upcoming events due to an error';
      this.element.innerHTML = `<span class="error">${prefix}: ${cause}</span>`;
    },
    loadingIndicator: '<em>Loading&#8230;</em>',
    orderBy: 'starttime',
    period: 7,
    template: defaultTemplate,
    timeFormat: { hour: "numeric", minute: "numeric" }
  };

  // TODO: Investigate using a real class.
  /**
   * Represents a list of upcoming events, pulled from a Google Calendar.
   *
   * @class
   * @param {string} elementSelector - The DOM selector where the list should
   *   be rendered.
   * @param {string} apiKey - Your Google Calendar API key.
   * @param {string} calendarId - Your Google Calendar ID.
   * @param {Object} [options] - A configuration object where Upcoming's
   *   behavior can be tweaked.
   * @param {Object} [options.dayLabelFormat] - options for formatting the day
   *   labels displayed in the events listing. These options are sent directly
   *   to Javascript's toLocaleDateString function; see MDN's documentation for
   *   more details: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toLocaleDateString#Using_options
   * @param {Function} [options.error] - A function for handling any errors;
   *   the default function displays a short error message in place of the
   *   events.
   * @param {string} [options.loadingIndicator=<em>Loading&#8230;</em>] - The
   *   loading indicator displayed while events are being fetched. Default is
   *   a simple text "Loading..." message, but this can be any HTML string.
   * @param {string} [options.locale=null] - The locale to use when
   *   rendering dates. If null, the browser's default locale is used.
   * @param {string} [options.orderBy='startTime] - The order of the events
   *   returned. Defaults to 'startTime', which orders by the event's start
   *   date. Can also be set to 'updated', which sorts the events by their last
   *   modification time.
   * @param {integer} [options.period=7] - The period, in days, the list of
   *   upcoming events should span. Defaults to 7 (days), e.g. a week.
   * @param {string} [options.template] - Can be used to override the default
   *   template used to render the events. Right now Upcoming.js uses John
   *   Resig's micro-templating markup. For more information, see his blog
   *   post: https://johnresig.com/blog/javascript-micro-templating/
   * @param {Object} [options.timeFormat] - options for formatting the times
   *   displayed in the events listing. These options are sent directly to
   *   Javascript's toLocaleTimeString function; see MDN's documentation for
   *   more details: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toLocaleTimeString#Using_options
   */
  function Upcoming(elementSelector, apiKey, calendarId, options) {
    this.element = document.querySelector(elementSelector);
    this.apiKey = apiKey;
    this.calendarId = calendarId;
    this.settings = extend({}, defaults, options);
    this.init();
  }

  Upcoming.prototype = {
    /**
     * Initializes the Upcoming object.
     *
     * @method init
     */
    init: function() {
      // Validate that the required parameters are provided.
      const settings = this.settings;
      const error = settings.error.bind(this);
      if (!this.calendarId) {
        error({message: 'Provide a calendar ID.'});
      }
      if (!this.apiKey) {
        error({message: 'Provide an API key.'});
      }
      if (!this.element || !this.element.nodeType) {
        error({message: `Can't find the element "${this.element}".`});
      }

      // Startup a loading indicator.
      if (settings.loadingIndicator) {
        this.element.innerHTML = settings.loadingIndicator;
      }

      // Pull together the query for the events.
      const now = new Date();
      const endDate = new Date();
      endDate.setDate(now.getDate() + settings.period);
      const apiUrl = 'https://www.googleapis.com/calendar/v3/calendars/' +
        `${this.calendarId}/events`;
      const url = this.buildURL(apiUrl, {
        key: this.apiKey,
        timeMin: now.toISOString(),
        timeMax: endDate.toISOString(),
        orderBy: settings.orderBy,
        singleEvents: true
      });

      // Make the request to Google Calendar's Events API and add the results
      // to the document.
      this.ajaxGet(url)
        .then(JSON.parse)
        .then(this.parseFeed.bind(this, url))
        .catch(error);
    },

    /**
     * Constructs a query string from the parameters passed in and returns a
     * URL that includes the query string.
     *
     * @method buildURL
     * @param {string} base - the base URL that needs the query string added.
     * @param {Object} params - key/value pairings that will form the query
     *   string. The keys and values will be URI encoded.
     */
    buildURL: function(base, params) {
      const querystring = Object.keys(params).map(key => {
        return `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`;
      });
      return `${base}?${querystring.join('&')}`;
    },

    /**
     * Make an ajax request and return the Promise object wrapping the request.
     *
     * @method ajaxGet
     * @param {string} url - the URL to make the Ajax request to.
     */
    ajaxGet: function(url) {
      return new Promise(function(resolve, reject) {
        let req = new XMLHttpRequest();
        req.open('GET', url);
        req.onload = function() {
          if (req.status === 200) {
            resolve(req.response);
          } else {
            reject(new Error(req.statusText));
          }
        };
        req.onerror = function() {
          reject(new Error('Network error'));
        };
        req.send();
      });
    },

    /**
     * Convert a feed item into our event object. The most important thing
     * here is that the expected fields be set correctly. If not, then
     * the event will likely be filtered out further down the line. This
     * function doesn't throw any errors, but rather sets a field to null if it
     * has problems converting/mapping it. At the moment, the most important
     * field is the event's start date; if that's not set, the start will be
     * set to null and the event will eventually be filtered out.
     *
     * @method eventMapper
     * @param {Object} item - Represents one item in the list of events
     *   retrieved from the Google Calendar Events API list call.
     */
    eventMapper: function(item) {
      // Documentation on Google's JSON:
      // https://developers.google.com/google-apps/calendar/v3/reference/events/list
      const settings = this.settings;
      // Parse each of the dates in a safe manner; null out the date and
      // proceed if there are errors. This approach minimizes impact on the
      // visitor; depending on the template being used, we may still be able
      // to render an event without an end or updated date.
      let end, endLabel, start, startLabel, updated;
      try {
        start = new Date(item.start.dateTime);
        startLabel = start.toLocaleTimeString(settings.locale,
          settings.timeFormat);
      } catch(e) {
        start = null;
        startLabel = '';
      }
      try {
        end = new Date(item.end.dateTime);
        endLabel = end.toLocaleTimeString(settings.locale,
          settings.timeFormat);
      } catch(e) {
        end = null;
        endLabel = '';
      }
      try {
        updated = new Date(item.updated);
      } catch(e) {
        updated = null;
      }
      return {
        description: item.description,
        end: end,
        endLabel: endLabel,
        htmlLink: item.htmlLink,
        id: item.id,
        location: item.location,
        organizer: item.organizer,
        start: start,
        startLabel: startLabel,
        status: item.status,  // tentative, confirmed, cancelled
        summary: item.summary,
        updated: updated
      };
    },

    /**
     * Simple JavaScript Templating
     * John Resig - http://ejohn.org/ - MIT Licensed
     * http://ejohn.org/blog/javascript-micro-templating/
     *
     * @method render
     * @param {string} template - The unpopulated template.
     * @param {Object} data - The data with which to populate the template.
     */
    render: function(template, data){
      // Convert the template into pure JavaScript.
      const tmpl = template
        .replace(/[\r\t\n]/g, ' ')
        .split('<%').join('\t')
        .replace(/((^|%>)[^\t]*)'/g, '$1\r')
        .replace(/\t=(.*?)%>/g, '\',$1,\'')
        .split('\t').join('\');')
        .split('%>').join('p.push(\'')
        .split('\r').join('\\\'');
      const fnBody = `
        const p = [], print = function() {
          p.push.apply(p, arguments);
        };
        // Introduce the data as local variables using with(){}.
        with(obj) {
          p.push('${tmpl}');
        }
        return p.join('');
      `;
      // Generate a reusable function that will serve as a template
      // generator.
      const fn = new Function('obj', fnBody);
      return fn(data);
    },

    /**
     * Parses the feed returned by Google Calendar's Events API. The feed is
     * gathered up into a data structure conducive to rendering and then
     * passed into the render method at the very end.
     *
     * @method parseFeed
     * @param {string} url - The url for the feed being parsed; mostly here
     *   for user feedback if parsing fails. This param is bound as parseFeed
     *   is called asynchronously.
     * @param {Object} feed - The feed being parsed.
     */
    parseFeed: function(url, feed) {
      const settings = this.settings;
      const error = settings.error.bind(this);

      // Validate that we're deeling with a valid feed.
      if (!feed || !feed.items) {
        error({message: `Invalid feed from: ${url}`});
      }

      const items = feed.items;
      const data = {
        days: [],
        settings: settings
      };
      if (items.length) {
        // Convert feed items to our event object.
        const events = items.map(this.eventMapper.bind(this));

        // Remove any events that don't have times set.
        const validEvents = events.filter(event => {
          return event.start && event.end;
        });

        // Aggregate the events by day, resulting in the desired data structure.
        const Day = function(date, events) {
          date = date || new Date(0);
          // Ensure the timestamp is zeroed out so this represents a day only.
          // Necessary when we start doing comparisons between days; we don't want
          // different times causing two dates on the same day to compare as
          // different.
          date.setHours(0);
          date.setMinutes(0);
          date.setSeconds(0);
          date.setMilliseconds(0);
          this.date = date;
          this.events = events || [];
          // A user-friendly representation of the Day's date.
          this.label = date.toLocaleDateString(settings.locale,
            settings.dayLabelFormat);
        };
        let currentDay = new Day();
        try {
          validEvents.forEach(event => {
            const startDay = new Day(event.start);
            if (startDay.date.getTime() !== currentDay.date.getTime()) {
              currentDay = startDay;
              data.days.push(currentDay);
            }
            currentDay.events.push(event);
          });
        } catch(e) {
          error(e);
        }
      }

      // Combine the data structure with the HTML template and presto-chango.
      try {
        this.element.innerHTML = this.render(settings.template, data);
      } catch(e) {
        error(e);
      }
    }
  };

  // Wrapper to allow for multiple instantiations in a single page. Yes, adding
  // to globals is bad. Let me know (or better yet, submit a pull request) if
  // there's a better way.
  window.upcomingjs = function(element, apiKey, calendarId, options) {
    // Get the actual DOM element, so we can modify it.
    const upcomingElement = document.querySelector(element);
    if (upcomingElement) {
      if (typeof upcomingElement['plugin_upcomingjs'] === 'undefined') {
        // Associate the actual DOM element obj with a new Upcoming object.
        upcomingElement['plugin_upcomingjs'] = new Upcoming(element, apiKey,
          calendarId, options);
      }
    }
    return this;
  };

})(window, document);
