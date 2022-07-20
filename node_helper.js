const NodeHelper = require('node_helper');
const translate = require('google-translate-api');
const bodyParser = require('body-parser');
const axios = require('axios').default;

module.exports = NodeHelper.create({
    start: function () {
        console.log(this.name + ' helper started');

        this.handleApiRequest();

        this.quoteConfig = {}

    },

    getNewQuote: function () {
        let self = this;

        self.url = this.quoteConfig.url;
        self.language = this.quoteConfig.language;

        axios.get(self.url)
            .then(function (response) {
                self.returned_data = response.data;

                if (self.language !== "en") {
                    translate(self.returned_data.quoteText, {
                        to: self.language
                    }).then(res => {
                        self.returned_data.quoteText = res.text;
                        self.sendSocketNotification('QUOTE_RESULT', self.returned_data);
    
                    }).catch(err => {
                        console.error(err);
                        self.sendSocketNotification('QUOTE_RESULT', self.returned_data);
                    });
                } else {
                    // return the quote directly without translating it
                    self.sendSocketNotification('QUOTE_RESULT', self.returned_data);
                }
            })
            .catch(function (error) {
                console.log(error);
            });

    },

    socketNotificationReceived: function (notification, payload) {
        console.log(this.name + " received a socket notification: " + notification + " - Payload: " + payload);
        if (notification === 'INIT_HELPER') {
            this.quoteConfig = payload
        }

        if (notification === 'GET_QUOTE') {
            this.getNewQuote();
        }
    },

    handleApiRequest: function () {
        this.expressApp.use(bodyParser.json()); // support json encoded bodies
        this.expressApp.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

        this.expressApp.post('/quote-of-the-day', (req, res) => {
            if (req.body.notification && req.body.notification === "QUOTE-OF-THE-DAY"){
                if (req.body.payload){
                    let payload = req.body.payload;
                    console.log("[MMM-quote-of-the-day] payload received: " + payload);

                    if (payload === "getNewQuote") {
                        this.getNewQuote();
                        res.send({"status": "success"});
                    } else {
                        res.send({"status": "failed", "error": "non recognized payload"});
                    }

                } else {
                    res.send({"status": "failed", "error": "No payload given."});
                }
            } else {
                res.send({"status": "failed", "error": "No notification given."});
            }
        });
    }

});