const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

dotenv.config();

const port = process.env.PORT || 5000;
const app = express();

// Middlewares
app.use(express.json());
app.use(cors());
// Serve public folder
// app.use(express.static("public"));

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.rsynxg9.mongodb.net/?appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const tutorsCollections = client.db("mediqueue").collection("tutors");
const bookedSessionCollections = client
  .db("mediqueue")
  .collection("bookedsession");

// GET All Tutors
app.get("/tutors", async (req, res) => {
  try {
    const result = await tutorsCollections.find({}).toArray();
    res.status(200).json({
      success: true,
      message: "Tutors retrieve successfully",
      data: result,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to retrieve tutors",
      error: error.message,
    });
  }
});

// GET My All Tutors
app.get("/my-tutors/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await tutorsCollections.find({ userId }).toArray();
    // console.log(result, "RESULT");

    res.status(200).json({
      success: true,
      message: "My tutors retrieve successfully",
      data: result,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to retrieve my tutors",
      error: error.message,
    });
  }
});

// DELETE My Tutor
app.delete("/my-tutors/:id", async (req, res) => {
  try {
    const { id } = await req.params;

    const result = await tutorsCollections.deleteOne({
      _id: new ObjectId(id),
    });
    // Not found
    if (result.deletedCount === 0) {
      return res.status(404).send({
        success: false,
        message: "Tutor not found",
      });
    }
    // Success
    res.status(200).send({
      success: true,
      message: "Tutor deleted successfully",
      data: result,
    });
  } catch (error) {
    console.error(error);

    res.status(500).send({
      success: false,
      message: "Failed to delete tutor",
      error: error.message,
    });
  }
});

// GET Single Tutor
app.get("/tutors/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await tutorsCollections.findOne({ _id: new ObjectId(id) });
    res.status(200).json({
      success: true,
      message: "Tutor details retrieve successfully",
      data: result,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to retrieve tutor details",
      error: error.message,
    });
  }
});

// PATCH Single Tutor
app.patch("/tutors/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updatedTutor = req.body;
    const result = await tutorsCollections.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: updatedTutor,
      },
    );
    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Tutor not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Tutor updated successfully",
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update tutor",
      error: error.message,
    });
  }
});

// POST Create A Tutor
app.post("/add-tutors", async (req, res) => {
  try {
    const tutor = req.body;
    const result = await tutorsCollections.insertOne(tutor);
    res.status(201).json({
      success: true,
      message: "Tutor added successfully",
      data: {
        insertedId: result.insertedId,
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to add tutor",
      error: error.message,
    });
  }
});

// GET My Booked Session
app.get("/my-booked-session/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).send({
        success: false,
        message: "User id is required",
      });
    }

    const result = await bookedSessionCollections
      .find({ studentId: userId })
      .toArray();

    res.status(200).send({
      success: true,
      message: "Booked sessions fetched successfully",
      data: result,
    });
  } catch (error) {
    console.error(error);

    res.status(500).send({
      success: false,
      message: "Failed to fetch booked sessions",
      error: error.message,
    });
  }
});

// POST Booked New Session
app.post("/session-bookings", async (req, res) => {
  try {
    const bookingData = req.body;
    const { courseId, studentId } = bookingData;

    if (!courseId || !studentId) {
      return res.status(400).send({
        success: false,
        message: "Course id and student id are required",
      });
    }

    if (!ObjectId.isValid(courseId)) {
      return res.status(400).send({
        success: false,
        message: "Invalid course id",
      });
    }

    const tutor = await tutorsCollections.findOne({
      _id: new ObjectId(courseId),
    });

    if (!tutor) {
      return res.status(404).send({
        success: false,
        message: "Course not found",
      });
    }

    const alreadyBooked = await bookedSessionCollections.findOne({
      courseId,
      studentId,
    });

    if (alreadyBooked) {
      return res.status(409).send({
        success: false,
        message: "You already booked this course",
      });
    }

    if (Number(tutor.totalSlot) <= 0) {
      return res.status(400).send({
        success: false,
        message: "No slots available",
      });
    }

    const booking = {
      ...bookingData,
      status: "pending",
      paymentStatus: "unpaid",
      bookedAt: new Date().toLocaleDateString(),
    };

    const result = await bookedSessionCollections.insertOne(booking);

    await tutorsCollections.updateOne(
      { _id: new ObjectId(courseId) },
      { $inc: { totalSlot: -1 } },
    );

    res.status(201).send({
      success: true,
      message: "Class booked successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Failed to book class",
      error: error.message,
    });
  }
});

// UPDATE | CANCEL SESSION
app.patch("/my-booked-session/:sessionId", async (req, res) => {
  try {
    const { sessionId } = req.params;

    if (!ObjectId.isValid(sessionId)) {
      return res.status(400).send({
        success: false,
        message: "Invalid session id",
      });
    }

    const bookedSession = await bookedSessionCollections.findOne({
      _id: new ObjectId(sessionId),
    });

    if (!bookedSession) {
      return res.status(404).send({
        success: false,
        message: "Booked session not found",
      });
    }

    if (bookedSession.status === "cancel") {
      return res.status(400).send({
        success: false,
        message: "Session is already cancelled",
      });
    }

    const result = await bookedSessionCollections.updateOne(
      { _id: new ObjectId(sessionId) },
      {
        $set: {
          status: "cancel",
          cancelledAt: new Date().toLocaleDateString(),
        },
      }
    );

    if (ObjectId.isValid(bookedSession.courseId)) {
      await tutorsCollections.updateOne(
        { _id: new ObjectId(bookedSession.courseId) },
        { $inc: { totalSlot: 1 } }
      );
    }

    res.status(200).send({
      success: true,
      message: "Session cancelled successfully",
      data: result,
    });
  } catch (error) {
    console.error(error);

    res.status(500).send({
      success: false,
      message: "Failed to cancel session",
      error: error.message,
    });
  }
});
// Removed explicit run() to let the MongoDB driver automatically handle connection on first operation
// async function run() {
//   try {
//     // Connect the client to the server	(optional starting in v4.7)
//     await client.connect();

//     await client.db("admin").command({ ping: 1 });
//     console.log(
//       "Pinged your deployment. You successfully connected to MongoDB!",
//     );
//   } finally {
//     // Ensures that the client will close when you finish/error
//     // await client.close();
//   }
// }
// run().catch(console.dir);

app.get("/", (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message:
        "MediQueue - Online Learning & Tutoring Platform API is running successfully",
      data: null,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to run the API",
      error: error.message,
    });
  }
});

app.listen(port, () => {
  console.log(`MediQueue server is running on port ${port}`);
});

module.exports = app;
