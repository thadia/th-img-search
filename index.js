var server = require('express');
var port = process.env.PORT || 3500;
var app = server();
var search = require('bing.search');
var path = require('path');
var util = require('util');
var mongoose = require('mongoose');
var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectID;
var HistorySchema = new Schema({
    term: {
        type: String,
        required: true,
        trim: true
    },
    time: {
        type: Date,
        required: true,
        trim: true
    }
});
var History = mongoose.model('History', HistorySchema);


var search_it = new search('hAesGkyxDUEtkrw+n6hDlxBtoZHRnU5QQ6FJvlKqxhk');
mongoose.connect('mongodb://user:pass@db:port/th-img-search-db');


app.listen(port, function () {
    console.log('Ready: ' + port);
});

app.get('/api/imagesearch/*', function (req_g, res_g) {
    // https://cryptic-ridge-9197.herokuapp.com/api/imagesearch/lolcats%20funny?offset=10

    var history = new History({
        term: req_g.params[0],
        time: new Date()
    });

    history.save(function (error, data) {
        if (error) {
            console.log(error);
        } else {
            console.log(data + " is saved.");
        }
    });


    console.log(req_g.params[0]);
    search_it.images(req_g.params[0], {
            top: 5
        },
        function (err, results) {
            if (err) {
                console.log(err);
                res_g.status(err.status).end();
            } else {
                console.log(util.inspect(results, {
                    colors: true,
                    depth: null
                }));
                res_g.json(results);
            }
        }
    );

});

app.get('/api/latest/imagesearch/', function (req_g, res_g) {

    History.find({}, '-_id term time', {
        limit: 10
    }, function (err, latest_data) {
        if (err) return console.error(err);
        else {
            console.log(latest_data);
            res_g.json(latest_data);
        }
    });


});


app.get('/', function (req, res) {
    var fileName = path.join(__dirname, 'index.html');
    res.sendFile(fileName, function (err) {
        if (err) {
            console.log(err);
            res.status(err.status).end();
        } else {
            console.log('Sent:', fileName);
        }
    });
});