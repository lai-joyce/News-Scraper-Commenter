# News-Scraper-Commenter

* [Scraper Live](https://youtu.be/RpKAsnctajc) - Scraper Demo/Code Walk-Through Video


# Overview

This is an app that lets users scrape articles from a news site into a Mongo database.  Users can then save articles and comments pertaining to those articles and delete them.  Once articles are deleted, they can be "re-scraped" by hitting the scrape button again.  

## Built With:

* [node.js](https://nodejs.org/en/) - JS runtime server environment
* [express](https://expressjs.com/) - server
* [express-handlebars](https://www.npmjs.com/package/express-handlebars) - Handlebars view engine for Express
* [mongoose](http://mongoosejs.com/) - mongoDB object data modeling for node.js
* [body-parser](https://www.npmjs.com/package/body-parser) - incoming request body-parsing middleware
* [cheerio](https://www.npmjs.com/package/cheerio) - server-side library to parse HTML DOM 
* [request](https://www.npmjs.com/package/request) - make HTTP calls