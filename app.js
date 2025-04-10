const mongoose = require('mongoose')
const Schema = mongoose.Schema

const playerSchema = new Schema({
    full_name: {type: String, required: true},
    peak_elo: {type: Number, default: 1250},
    debut: {type: Date, default: () => new Date()},
    matches: [{type: Schema.Types.ObjectId, ref: 'Match'}]
})

const matchSchema = new Schema({
    winner: {type: String, required: true},
    loser: {type: String, required: true},
    moves: {type: String, default: 'start'},
    began_on: {type: Date, default: () => new Date()},
    drew: {type: Boolean, default: false}
})

playerSchema.statics.listAllPlayers = function () {
    return this.find().populate('matches').exec(); //returns a promise
};

const playerModel = mongoose.model('Player', playerSchema)
const matchModel = mongoose.model('Match', matchSchema)

const express = require("express")
const app = express()

const port = 3000

app.set('view-engine', 'ejs')

app.use(express.urlencoded())
app.use(express.json())

app.use(express.static('public'))
app.use(express.static('src'))

mongoose.connect('mongodb://localhost:27017/test').catch(error => 
console.log("Something went wrong: " + error))

//  A Page for uploading new database entry
app.get('/upload', (req, res) => {
    res.render('upload.ejs')
})

//  A page for querying a specific set from the collection
app.get('/query', (req, res) => {
    res.render('query.ejs')
})

//  Lists all the objects within my collection
app.get('/list', (req, res, next) => {
    playerModel.listAllPlayers().then(players => {
        res.render('list.ejs', { players: players})
    }).catch(err => {
        next(err);
    })
})

//  post request to create an object in database
app.post('/player', (req, res, next) => {
    console.log(req.body)
    let player_to_add = new playerModel(req.body)

    player_to_add.save().then(() => {
        res.send("Player added to database")
    }).catch(err => {
        res.status(500).send("Failed to add player to database: " + err.message)
        next(err)
    })
})

app.post('/match', (req, res, next) => {
    let match_to_add = new matchModel(req.body)

    match_to_add.save().then(() => {
        Promise.all([
            playerModel.findOneAndUpdate(
            { full_name: req.body.winner },
            { $push: { matches: match_to_add._id } }
            ),
            playerModel.findOneAndUpdate(
            { full_name: req.body.loser },
            { $push: { matches: match_to_add._id } }
            )
        ]).then(() => {
            res.send("Match added to database and linked to players")
        }).catch(err => {
            res.status(500).send("Failed to link match to players: " + err.message);
            next(err);
        });
    }).catch(err => {
        res.status(500).send("Failed to add match to database: " + err.message)
        next(err)
    })
})

//  get request that returns parameterized set from collection

app.get('/search', (req, res) => {
    const { string, matches, players, cutoffelo, cutoffdate, dec } = req.query;
    let response = [null, null]; // Initialize as an array with two elements

    (async () => {
        try {
            if (string === "") {
                if (players === "on") {
                    response[0] = await playerModel.find({ 
                        peak_elo: { $gt: cutoffelo === undefined ? 200 : cutoffelo } 
                    }).populate('matches').sort({ peak_elo: dec === "on" ? -1 : 1 });
                }

                if (matches === "on") {
                    response[1] = await matchModel.find({ 
                        began_on: { $lt: cutoffdate === undefined ? new Date() : new Date(cutoffdate) } 
                    }).sort({ began_on: dec === "on" ? -1 : 1 });
                }
            } else {
                if (players === "on") {
                    response[0] = await playerModel.find({ 
                        full_name: { $regex: string, $options: 'i'}, 
                        peak_elo: { $gt: cutoffelo === undefined ? 200 : cutoffelo } 
                    }).populate('matches').sort({ peak_elo: dec === "on" ? -1 : 1 });
                }

                if (matches === "on") {
                    response[1] = await matchModel.find({ 
                        $or: [
                            { winner: { $regex: string, $options: 'i'}}, 
                            { loser: { $regex: string, $options: 'i'}}
                        ], 
                        began_on: { $lt: cutoffdate === undefined ? new Date() : new Date(cutoffdate) } 
                    }).sort({ began_on: dec === "on" ? -1 : 1 });
                }
            }

            res.json(response);
        } catch (err) {
            console.error(err);
            res.status(500).send("An error occurred while processing the query.");
        }
    })();
});

app.listen(port)