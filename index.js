const express = require('express')
const app = express();
const cors = require('cors');
require('dotenv').config()
var jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const res = require('express/lib/response');
// // import { ObjectId } from "mongodb";
// const ObjectId = require('mongodb').ObjectId
const port = process.env.PORT || 5000;

app.use(cors())
app.use(express.json())
// app.use(bodyParser());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.42txn.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const partsCollection = client.db("computer").collection("parts");
        const ordersCollection = client.db("computer").collection("orders");
        const usersCollection = client.db("computer").collection("users");
        const reviewsCollection = client.db("computer").collection("reviews");


        app.get('/parts', async (req, res) => {
            const query = {};
            const cursor = partsCollection.find(query);
            const parts = await cursor.toArray()
            res.send(parts)
        });
        // get all reviews
        app.get('/reviews', async (req, res) => {
            const query = {};
            const cursor = await reviewsCollection.find(query).toArray();
            res.send(cursor)
        });
        app.get('/users', async (req, res) => {
            const users = await usersCollection.find().toArray();
            res.send(users)
        })

        app.get('/parts/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await partsCollection.findOne(query);
            res.send(result);
        })
        // get all Order
        app.get('/orders', async (req, res) => {
            const query = {};
            const cursor = ordersCollection.find(query);
            const parts = await cursor.toArray()
            res.send(parts)
        })
        // get order id 

        // app.get('/orders/:id', async (req, res) => {
        //     const id = req.params.id
        //     const query = { _id: ObjectId(id) }
        //     const cursor = await ordersCollection.findOne(query)
        //     res.send(cursor)
        // })



        app.get('/orders/myorders', async (req, res) => {
            const userEmail = req.query.email;
            const query = { email: userEmail }
            const order = await ordersCollection.find(query).toArray();
            res.send(order)
        })
        // post Order
        app.post('/orders', async (req, res) => {
            const query = req.body
            const order = await ordersCollection.insertOne(query);
            res.send(order)
        })
        // delete order
        app.delete('/orders/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const result = await ordersCollection.deleteOne(query)
            res.send(result)
        })
        // admin user
        app.put('/users/admin/:email', async (req, res) => {
            const email = req.params.email;
            const filter = { email: email }
            const updateDoc = {
                $set: { roll: 'admin-user' }
            }
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.send(result)

        })
        //users update or insert
        app.put('/users/:email', async (req, res) => {
            const email = req.params.email;
            const user = req.body;
            const filter = { email: email }
            const options = { upsert: true };
            const updateDoc = {
                $set: user
            }
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            res.send(result)

        })
        // post Reviews
        app.post('/reviews', async (req, res) => {
            const query = req.body;
            const order = await reviewsCollection.insertOne(query);
            res.send(order)
        })


        app.post('/parts', async (req, res) => {
            const query = req.body;
            const order = await partsCollection.insertOne(query);
            res.send(order)
        })
    } finally {

    }
} run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})