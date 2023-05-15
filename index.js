const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');


// Middleware
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send("They are Ema & John");
});

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xhxkbrt.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        await client.connect();
        const productCollection = client.db("emaJohnDB").collection("products");

        app.get('/products', async (req, res) => {
            // console.log(req.query);
            const page = parseInt(req.query.page) || 0;
            const limit = parseInt(req.query.limit) || 10;
            const skip = (page) * limit;
            const result = await productCollection.find().skip(skip).limit(limit).toArray();
            res.send(result);
        });

        app.post('/productsById', async (req, res) => {
            const ids = req.body;
            const objectId = ids.map(id => new ObjectId(id))
            const query = { _id: { $in: objectId } }
            const result = await productCollection.find(query).toArray();
            res.send(result);
        })

        app.get('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await productCollection.findOne(query);
            res.send(result);
        });

        // Count of total products.
        // for pagination.
        app.get('/totalProducts', async (req, res) => {
            const result = await productCollection.estimatedDocumentCount();
            res.send({ totalProducts: result });
        });

        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // await client.close();
    }
}
run().catch(console.dir);


app.listen(port, () => {
    console.log(`EmaJohn server listening on port ${port}`);
});