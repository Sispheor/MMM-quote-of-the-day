const NodeHelper = require('node_helper');
const request = require("request");
const translate = require('google-translate-api');

module.exports = NodeHelper.create({
    start: function() {
        console.log(this.name + ' helper started');

    },

    getNewQuote: function(payload) {
        var self = this;

        self.url = payload.url
        self.language = payload.language

        options = {
            url: self.url,
            json: true,
            method: "GET"
        }

        request(options, function (error, response, body) {
            if (error) { return console.log(error); };
            console.log("Quote API call result: " + body);
            self.returned_data = body;

            if (self.language != "en"){
                translate(self.returned_data.quoteText, {to: "fr"}).then(res => {
                    // console.log(res.text);
                    self.returned_data.quoteText = res.text;
                    self.sendSocketNotification('QUOTE_RESULT', self.returned_data);

                }).catch(err => {
                    console.error(err);
                    self.sendSocketNotification('QUOTE_RESULT', self.returned_data);
                });
            }else{
                // return the quote directly without translating it
                self.sendSocketNotification('QUOTE_RESULT', self.returned_data);
            }
        });

    },

    socketNotificationReceived: function(notification, payload) {
        console.log(this.name + " received a socket notification: " + notification + " - Payload: " + payload);
        if (notification === 'GET_QUOTE') {
            this.getNewQuote(payload);
        }
    },


});