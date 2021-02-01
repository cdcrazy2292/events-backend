/**
 * Adding external libraries to use in this app
 */
const express = require('express'); // server
var cors = require('cors'); // importing cors library to make server work locally
const bodyParser = require('body-parser') // helper to parse requests
const MongoClient = require('mongodb').MongoClient // library that connects toMongoDB
const app = express(); // Creates express app
const ObjectID = require('mongodb').ObjectID; // Helper to look up events by ID


const mongoDbString = `mongodb+srv://server-user:3x0ijnzjUjYfRqfo@cluster0.zcueb.mongodb.net/tech-ia?retryWrites=true&w=majority` // URL that connects to my DB
MongoClient.connect(mongoDbString, {useUnifiedTopology: true}) // Establishing a connection
    .then(client => {
        app.use(cors())
        app.use(bodyParser.urlencoded({extended: true})) // Using url parser helper
        app.use(bodyParser.json()) // Using json parser helper
        console.log('Connected to Database') // Printing useful msg
        const db = client.db('tech-ia') // importing my database by name
        const eventsCollection = db.collection('events') // accessing collection in database by name

        app.listen(4000, function () {
            // Starting up the server on port 3000
            console.log(`Dayana's server is working on 4000`)
        })

        /**
         * Creating route that triggers retrieval of data from Mongo
         */
        app.get('/all', (req, res) => {
            const cursor = db.collection('events').find().toArray() // Using mongoDB library to fetch all Events in Collection
                .then(results => {
                    res.status(200).send(results) // Sending a response to the client
                }).catch(error => {
                    console.log(error) // printing error if any
                    res.status(500).send(error) // letting client know something went wrong
                })
        })

        /**
         * Crating route that triggers the creation of an event
         */
        app.post('/add-event', (req, res) => {
            eventsCollection.insertOne(req.body)// Using mongoDb library to insert an event to collection
                .then(result => {
                    res.status(201).send(result.ops) // Sending results to client
                })
                .catch(error => {
                    console.error(error)
                    res.status(500).send(error) // letting client know something went wrong
                })
        })

        /**
         * Creating route that triggers an update of an event
         */
        app.put('/update-event', (req, res) => {
            const event = req.body // simplifying object by extracting body into a variable
            eventsCollection.findOneAndUpdate( // Using mongoDb library to find an event by its ID and update it
                {_id: new ObjectID(event._id)}, // Using the filer object to find an event
                {  // update object that takes the data to be changed
                    $set: {
                        name: event.name,
                        description: event.description,
                        duration: event.duration,
                        date: event.date
                    }
                },
                { // options that are told to the DB in case something happens
                    upsert: false // Disabling the action of inserting an event if the above ID doesn't exist
                }
            ).then(result => {
                console.log(result)
                res.status(200).send(result) // Sending results to client
            }).catch(error => {
                console.error(error)
                res.status(500).send(error) // letting client know something went wrong
            })
        })

        /**
         * Creating route that triggers the deletion of a task
         */
        app.delete('/event/:id', (req, res) => {
            const id = new ObjectID(req.params.id) // converting an ID of type string to a mongo id object so Mongo can understand
            eventsCollection.deleteOne( // using mongoDB library to find event and deleteit
                {_id: id} // using filter to find task with id
            )
                .then(result => {
                    res.status(200).send(result) // Sending result to the client
                })
                .catch(error => {
                    console.error(error)
                    res.status(500).send(error) // letting client know something went wrong
                })
        })

    })
    .catch(error => console.error(error)) // Catching any errors in the App
