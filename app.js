const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
const bodyParser = require('body-parser');
const redis = require('redis');
const uuid = require('uuid');

// Set Port 
const port = process.env.PORT || 5000;

const REDIS_PORT = process.env.PORT || 6379;

// init app 
const app = express();

// view engine
app.engine('handlebars', exphbs({defaultLayout:'main'}));
app.set('view engine', 'handlebars');

// body-parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

// redis client
let client = redis.createClient(REDIS_PORT);

client.on('connect', () => {
    console.log(`Connected to Redis on port:${REDIS_PORT}`);
});


client.on('error', (err) => {
    console.log(`Error connecting to Redis on port:${port}` + " " + err);
});

// homepage view
app.get('/', (req, res, next) => {
    res.render('linksShortener');
});

// linkShortener view

app.post('/', function(req, res, next) {
    let keyName = "link";
    let linkId = req.body.id;
    let url = `${req.body.URL}`;
    let linkFieldOne = `fullLink${req.body.id}`;
    let linkFieldTwo = `shortenedLink${req.body.id}`;
    let shortenedLink = `http://localhost:${port}/${uuid.v4()}`;   

    client.hmset( keyName, [
        "id", linkId,
        linkFieldOne, url, 
        linkFieldTwo, shortenedLink
    ]);

    res.render('linksShortener', {shortLink: shortenedLink, originalLink: url});
})

app.get("/viewAllLinks", (req, res, next) => { 
    client.hgetall("link", (err, obj) => {
        if (!obj) {
            res.render('allLinks')
        } else {
            res.render('allLinks', {link: obj})
        }
    })
})

app.listen(port, () => {
    console.log(`Server Started on Port:${port}`);
})
