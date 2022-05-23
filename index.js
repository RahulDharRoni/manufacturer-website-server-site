const express = require('express')
const app = express();
const cors = require('cors');
// var bodyParser = require('body-parser')
require('dotenv').config()
var jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const res = require('express/lib/response');
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


        app.get('/parts', async (req, res) => {
            const query = {};
            const cursor = partsCollection.find(query);
            const parts = await cursor.toArray()
            res.send(parts)
        });

        app.get('/parts/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await partsCollection.findOne(query);
            res.send(result);
        })
        app.get('/orders/myorders', async (req, res) => {
            const userEmail = req.query.uEmail;
            const query = { uEmail: userEmail }
            const order = await ordersCollection.find(query).toArray();
            res.send(order)
        })

        app.post('/orders', async (req, res) => {
            const query = req.body
            const order = await ordersCollection.insertOne(query);
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