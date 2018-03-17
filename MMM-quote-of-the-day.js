Module.register('MMM-quote-of-the-day', {

    // Default module config.
    defaults: {
        language: "en",
        updateInterval: "1d", // one day by default
    },

    result: {},

    start: function () {

        console.log("Starting module: " + this.name);
        quote_api_url = "http://api.forismatic.com/api/1.0/?method=getQuote&format=json&lang=en"

        payload = {
            url: quote_api_url,
            language: this.config.language
        }

        // convert the updateInterval string into seconds
        this.updateIntervalSeconds = this.getUpdateIntervalSecondFromString(this.config.updateInterval)
        console.log("[MMM-quote-of-the-day] updateIntervalSeconds: " + this.updateIntervalSeconds)

        // this.sendSocketNotification('GET_QUOTE', payload);
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

    socketNotificationReceived: function (notification, payload) {
        if (notification === "QUOTE_RESULT") {
            var self = this;
            console.log("QUOTE_RESULT received with payload:" + payload)
            this.result = payload;
            this.updateDom();
        }
    },

    /** return a number of second following the received intervalString
     *  Interval string is composed by a number followed by a letter.
     *  E.g:
     *      intervalString 1m will return 60
     *      intervalString 10m will return 600
     * @param {string} intervalString - The interval to convert into second of the book.
    */
    getUpdateIntervalSecondFromString: function(intervalString) {
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
            var secondsMultiplier = 1
            switch (String(letter)) {
                case "s":
                    secondsMultiplier = 1
                    break;
                case "m":
                    secondsMultiplier = 60
                    break;
                case "h":
                    secondsMultiplier = 3600
                    break;
                case "d":
                    secondsMultiplier = 86400
                    break;
            }

            // convert the string into seconds
            updateIntervalSecond = secondsMultiplier * integer

        }else{
            console.log("[MMM-quote-of-the-day] invalid updateInterval, set default to 1 day")
            // set default interval to 1 day
            updateIntervalSecond = 86400
        }

        return updateIntervalSecond
    }

});