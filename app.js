const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/wikiDB', { useNewUrlParser: true, useUnifiedTopology: true });

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log('Successfully connected to database');
});

const app = express();

var PORT = process.env.PORT;
if (PORT == "" || PORT == null || PORT == undefined) {
    PORT = 3000;
}

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

const articleSchema = new mongoose.Schema({
    title: String,
    content: String
});

const Article = mongoose.model('Article', articleSchema);

app.route('/articles')
    .get((req, res) => {
        Article.find((err, articles) => {
            if (err) return console.error(err);
            res.send(articles);
        })
    })
    .post((req, res) => {
        const newArticle = new Article({
            title: req.body.title,
            content: req.body.content
        });

        newArticle.save((err) => {
            if (err) {
                res.send(err);
            }
            else {
                res.send("Successfully added a new article.");
            }
        });
    })
    .delete((req, res) => {

        Article.deleteMany((err) => {
            if (err) {
                res.send(err);
            }
            else {
                res.send("Successfully deleted all articles.");
            }
        });
    });

app.route("/articles/:title")
    .get((req, res) => {
        Article.findOne({ title: req.params.title }, (err, article) => {
            if (article) {
                res.send(article);
            }
            else {
                res.send("No matching articles found.");
            }
        });
    })
    .put((req, res) => {
        Article.update({ title: req.params.title },
            { title: req.body.title, content: req.body.content },
            { overwrite: true },
            (err) => {
                if (!err) {
                    res.send("Successfully updated!");
                }
                else {
                    res.send(err);
                }
            })
    })
    .patch((req, res) => {
        Article.update({ title: req.params.title },
            { $set: req.body },
            (err) => {
                if (!err) {
                    res.send("Successfully updated!");
                }
            })
    })
    .delete((req, res) => {
        Article.deleteOne({ title: req.params.title },
            (err) => {
                if (!err) {
                    res.send("Successfully deleted!");
                }
            })
    });


app.listen(PORT, () => console.log(`Server running at port ${PORT}: http://localhost:${PORT}/`));