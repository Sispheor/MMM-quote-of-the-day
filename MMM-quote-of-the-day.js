Module.register('MMM-quote-of-the-day', {

    // Default module config.
    defaults: {
        language: "en",
        updateInterval: "1d", // one day by default
    },

    result: {},

    start: function () {

        console.log("Starting module: " + this.name);

        // init the node helper
        quote_api_url = "http://api.forismatic.com/api/1.0/?method=getQuote&format=json&lang=en"
        payload = {
            url: quote_api_url,
            language: this.config.language
        }
        this.sendSocketNotification('INIT_HELPER', payload);

        // convert the updateInterval string into seconds
        this.updateIntervalMilliseconds = this.getUpdateIntervalMillisecondFromString(this.config.updateInterval)
        // console.log("[MMM-quote-of-the-day] updateIntervalMillisecond: " + this.updateIntervalMilliseconds)

        this.getNewQuote();
        this.scheduleUpdate();
    },

    getDom: function () {
        var wrapper = document.createElement("div");
        var quoteTextDiv = document.createElement("div");
        var quoteAuthorDiv = document.createElement("div");

        quoteTextDiv.className = "normal";
        quoteAuthorDiv.className = "small dimmed";

        if (this.result.quoteText && this.result.quoteAuthor){
            quoteTextDiv.innerHTML = this.result.quoteText;
            quoteAuthorDiv.innerHTML = this.result.quoteAuthor;
        }else{
            quoteTextDiv.innerHTML = "Loading";
            quoteAuthorDiv.innerHTML = "";
        }

        wrapper.appendChild(quoteTextDiv);
        wrapper.appendChild(quoteAuthorDiv);
        return wrapper;

    },

    scheduleUpdate: function(delay) {
        var nextLoad = this.updateIntervalMilliseconds;
        if (typeof delay !== "undefined" && delay >= 0) {
          nextLoad = delay;
        }
        console.log("[MMM-quote-of-the-day] Next update in " + this.updateIntervalMilliseconds + " milliseconds")
        var self = this;

        setInterval(function() {
          self.getNewQuote();
        }, nextLoad);
      },

    socketNotificationReceived: function (notification, payload) {
        if (notification === "QUOTE_RESULT") {
            var self = this;
            this.result = payload;
            this.updateDom();
        }
    },

    getNewQuote: function(){
        this.sendSocketNotification('GET_QUOTE', payload);

    },

    /** return a number of millisecond following the received intervalString
     *  Interval string is composed by a number followed by a letter.
     *  E.g:
     *      intervalString 1m will return 60000
     *      intervalString 10m will return 600000
     * @param {string} intervalString - The interval to convert into second of the book.
    */
    getUpdateIntervalMillisecondFromString: function(intervalString) {
        // console.log("[MMM-quote-of-the-day] testing string: "+ intervalString)
        // the string must contains a number followed by a letter s or m or h or d. E.g: 50m
        var regexString = new RegExp("^\\d+[smhd]{1}$");

        if (regexString.test(intervalString)){
            console.log("[MMM-quote-of-the-day] valid updateInterval")
            // split the integer from the letter
            var regexInteger = "^\\d+";
            var integer = intervalString.match(regexInteger);
            // console.log("[MMM-quote-of-the-day] integer: " + integer);

            // now get the letter
            var regexLetter = "[smhd]{1}$";
            var letter = intervalString.match(regexLetter);
            // console.log("[MMM-quote-of-the-day] letter: '" + letter + "'");

            // convert the letter into second
            var millisecondsMultiplier = 1000
            switch (String(letter)) {
                case "s":
                    millisecondsMultiplier = 1000
                    break;
                case "m":
                    millisecondsMultiplier = 1000 * 60
                    break;
                case "h":
                    millisecondsMultiplier = 1000 * 60 * 60
                    break;
                case "d":
                    millisecondsMultiplier = 1000 * 60 * 60 * 24
                    break;
            }

            // convert the string into seconds
            updateIntervalMillisecond = millisecondsMultiplier * integer

        }else{
            console.log("[MMM-quote-of-the-day] invalid updateInterval, set default to 1 day")
            // set default interval to 1 day
            updateIntervalMillisecond = 1000 * 60 * 60 * 24
        }

        return updateIntervalMillisecond
    },

    notificationReceived: function(notification, payload, sender) {
        if (sender) {
            console.log("[MMM-quote-of-the-day] received a module notification: " + notification + " from sender: " + sender.name);
            if (notification == "QUOTE-OF-THE-DAY"){
                if (payload == "getNewQuote"){
                    this.getNewQuote();
                }
            }
        } else {
            Log.log(this.name + " received a system notification: " + notification);
        }
    }

});