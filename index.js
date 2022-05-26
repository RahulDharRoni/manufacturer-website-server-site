const express = require('express')
const app = express();
const cors = require('cors');
require('dotenv').config()
var jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const res = require('express/lib/response');
// const { ObjectID } = require('bson');
// // import { ObjectId } from "mongodb";
// const ObjectId = require('mongodb').ObjectId

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const port = process.env.PORT || 5000;


app.use(cors())
app.use(express.json())



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.42txn.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const partsCollection = client.db("computer").collection("parts");
        const ordersCollection = client.db("computer").collection("orders");
        const usersCollection = client.db("computer").collection("users");
        const reviewsCollection = client.db("computer").collection("reviews");
        const myprofileCollection = client.db("computer").collection("myprofile");
        const paymentsCollection = client.db("computer").collection("payments");


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


        app.get('/order/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const cursor = await ordersCollection.findOne(query)
            res.send(cursor)
        })
        app.get('/admin/:email', async (req, res) => {
            const email = req.params.email;
            const user = await usersCollection.findOne({ email: email });
            const isAdmin = user.roll === "admin";
            res.send({ admin: isAdmin })
        })



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
        app.delete('/order/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const result = await ordersCollection.deleteOne(query)
            res.send(result)
        })
        // admin user
        app.put('/user/admin/:email', async (req, res) => {
            const email = req.params.email;
            const filter = { email: email };
            const updateDoc = {
                $set: { role: 'admin' },
            };
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.send(result);
        })
        // app.put('user/admin/:email', async (req, res) => {
        //     const email = req.params.email;
        //     const filter = { email: email }
        //     const updateDoc = {
        //         $set: { roll: 'admin' }
        //     }
        //     const result = await usersCollection.updateOne(filter, updateDoc);
        //     res.send(result)

        // })
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
            var token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN_SECRET);
            res.send({ result, token })

        })

        // app.put('/users/:email', async (req, res) => {
        //     const email = req.params.email;
        //     const user = req.body;
        //     const filter = { email: email }
        //     const options = { upsert: true };
        //     const updateDoc = {
        //         $set: user
        //     }
        //     const result = await usersCollection.updateOne(filter, updateDoc, options);
        //     var token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN_SECRET);
        //     res.send({ result, token })

        // })
        // post Reviews
        app.post('/reviews', async (req, res) => {
            const query = req.body;
            const order = await reviewsCollection.insertOne(query);
            res.send(order)
        })

        // payment post
        app.post('/create-payment-intro', async (req, res) => {
            const orderPay = req.body;
            const price = orderPay.productPrice;
            console.log(price)

            const amount = price * 100;
            const paymentIntent = await stripe.paymentIntents.create({
                amount: amount,
                currency: "usd",
                payment_method_types: [
                    "card"
                ],

            })
            console.log(paymentIntent)
            res.send({
                clientSecret: paymentIntent.client_secret,
            })
        })
        // payment update
        app.patch('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const payment = req.body;
            console.log(id)
            const filter = { _id: ObjectId(id) }
            const updateDoc = {
                $set: {
                    paid: true,
                    transactionID: payment.transactionId
                }
            }
            const paymentResult = await paymentsCollection.insertOne(payment);
            const result = await ordersCollection.updateOne(filter, updateDoc);
            res.send({ updateDoc })

        })


        // my profile
        app.post('/profile', async (req, res) => {
            const query = req.body;
            const order = await myprofileCollection.insertOne(query);
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