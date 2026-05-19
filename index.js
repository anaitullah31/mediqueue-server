const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");

dotenv.config();

const port = process.env.PORT || 5000;
const app = express();

// Middlewares
app.use(express.json());
app.use(cors());
// Serve public folder
app.use(express.static("public"));

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.rsynxg9.mongodb.net/?appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!",
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

// app.get("/", (req, res) => {
//   res.status(200).json({
//     success: true,
//     message: "Welcome to MediQueue API Server",
//   });
// });

app.get("/", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>MediQueue - Online Learning & Tutoring Platform API</title>

        <link rel="icon" type="image/png" href="/favicon.png" />

        <meta charset="UTF-8" />
        <meta
          name="description"
          content="MediQueue - Online Learning & Tutoring Platform"
        />
      </head>

      <body style="font-family:sans-serif;padding:10px; text-align:center">
        <h1>Welcome to MediQueue Server</h1>
        <p>
          Online Learning & Tutoring Platform API is running successfully.
        </p>
      </body>
    </html>
  `);
});

app.listen(port, () => {
  console.log(`MediQueue server is running on port ${port}`);
});
