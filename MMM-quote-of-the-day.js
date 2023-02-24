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
        let quoteApiURL = "http://api.forismatic.com/api/1.0/?method=getQuote&format=json&lang=en";
        let payload = {
            url: quoteApiURL,
            language: this.config.language
        };
        this.sendSocketNotification('INIT_HELPER', payload);

        // convert the updateInterval string into seconds
        this.updateIntervalMilliseconds = this.getUpdateIntervalMillisecondFromString(this.config.updateInterval);
        // console.log("[MMM-quote-of-the-day] updateIntervalMillisecond: " + this.updateIntervalMilliseconds)

        this.getNewQuote();
        this.scheduleUpdate();
    },

    getDom: function () {
        let wrapper = document.createElement("div");
        let quoteTextDiv = document.createElement("div");
        let quoteAuthorDiv = document.createElement("div");

        quoteTextDiv.className = "normal";
        quoteAuthorDiv.className = "small dimmed";

        if (this.result.quoteText){
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
        let nextLoad = this.updateIntervalMilliseconds;
        if (typeof delay !== "undefined" && delay >= 0) {
          nextLoad = delay;
        }
        console.log("[MMM-quote-of-the-day] Next update in " + this.updateIntervalMilliseconds + " milliseconds");
        let self = this;

        setInterval(function() {
          self.getNewQuote();
        }, nextLoad);
      },

    socketNotificationReceived: function (notification, payload) {
        if (notification === "QUOTE_RESULT") {
            // let self = this;
            this.result = payload;
            this.updateDom();
        }
    },

    getNewQuote: function(){
        this.sendSocketNotification('GET_QUOTE');

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
        let regexString = new RegExp("^\\d+[smhd]{1}$");
        let updateIntervalMillisecond = 0;

        if (regexString.test(intervalString)){
            console.log("[MMM-quote-of-the-day] valid updateInterval");
            // split the integer from the letter
            let regexInteger = "^\\d+";
            let integer = intervalString.match(regexInteger);
            // console.log("[MMM-quote-of-the-day] integer: " + integer);

            // now get the letter
            let regexLetter = "[smhd]{1}$";
            let letter = intervalString.match(regexLetter);
            // console.log("[MMM-quote-of-the-day] letter: '" + letter + "'");

            // convert the letter into second
            let millisecondsMultiplier = 1000;
            switch (String(letter)) {
                case "s":
                    millisecondsMultiplier = 1000;
                    break;
                case "m":
                    millisecondsMultiplier = 1000 * 60;
                    break;
                case "h":
                    millisecondsMultiplier = 1000 * 60 * 60;
                    break;
                case "d":
                    millisecondsMultiplier = 1000 * 60 * 60 * 24;
                    break;
            }

            // convert the string into seconds
            updateIntervalMillisecond = millisecondsMultiplier * integer

        }else{
            console.log("[MMM-quote-of-the-day] invalid updateInterval, set default to 1 day");
            // set default interval to 1 day
            updateIntervalMillisecond = 1000 * 60 * 60 * 24
        }

        return updateIntervalMillisecond
    },

    notificationReceived: function(notification, payload, sender) {
        if (sender) {
            console.log("[MMM-quote-of-the-day] received a module notification: " + notification + " from sender: " + sender.name);
            if (notification === "QUOTE-OF-THE-DAY"){
                if (payload === "getNewQuote"){
                    this.getNewQuote();
                }
            }
        } else {
            Log.log(this.name + " received a system notification: " + notification);
        }
    }

});