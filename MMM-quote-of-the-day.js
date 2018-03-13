
Module.register('MMM-quote-of-the-day',{
    result: {},

    start: function() {

        console.log("Starting module: " + this.name);
        quote_api_url = "http://api.forismatic.com/api/1.0/?method=getQuote&format=json&lang=en"
        this.sendSocketNotification('GET_QUOTE', quote_api_url);
    },

    getDom: function() {


        var wrapper = document.createElement("div");
        var quoteTextDiv = document.createElement("div");
        var quoteAuthorDiv = document.createElement("div");

        quoteTextDiv.className = "normal"
        quoteAuthorDiv.className = "small dimmed"

        if (this.result){
            quoteTextDiv.innerHTML = this.result.quoteText
            quoteAuthorDiv.innerHTML = this.result.quoteAuthor
        }

        wrapper.appendChild(quoteTextDiv);
        wrapper.appendChild(quoteAuthorDiv);
        return wrapper;

    },

    socketNotificationReceived: function(notification, payload) {
        if (notification === "QUOTE_RESULT") {
            var self = this;
            console.log("QUOTE_RESULT received with payload:" + payload)
            this.result = payload;
            this.updateDom();
        }
      },

});