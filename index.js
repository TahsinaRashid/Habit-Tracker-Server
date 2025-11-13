const express = require('express');
const cors = require('cors');
const app = express();
const port = 7000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

app.use(cors());
app.use(express.json());

// MongoDB connection
const uri = "mongodb+srv://health-tracker:GJSDuCiXTKaKIPjd@cluster0.hlqh8iv.mongodb.net/?appName=Cluster0";
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
    const db = client.db('habit-tracker');
    const habitCollection = db.collection('AddHabit');

    /** GET ALL HABITS */
    app.get('/addHabit', async (req, res) => {
      const result = await habitCollection.find().toArray();
      res.send(result);
    });


     app.get("/latest-habit", async (req, res) => {
      const result = await habitCollection
        .find().sort({createdAt: "desc"}).limit(6).toArray();
        console.log(result);
        res.send(result);
    });

    /** GET HABIT BY ID */
    app.get('/addHabit/:id', async (req, res) => {
      const { id } = req.params;
      const result = await habitCollection.findOne({ _id: new ObjectId(id) });
      res.send({ success: true, result });
    });

    /** ADD NEW HABIT */
    app.post('/addHabit', async (req, res) => {
      const habitData = req.body;
      const result = await habitCollection.insertOne(habitData);
      res.send(result);
    });

    /** UPDATE HABIT (All editable fields) */
    app.patch('/addHabit/:id', async (req, res) => {
      const { id } = req.params;
      const updateData = req.body;

      const updatedHabit = await habitCollection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: updateData },
        { returnDocument: 'after' }
      );
      res.send({ success: true, result: updatedHabit.value });
    });

    /** DELETE HABIT */
    app.delete('/addHabit/:id', async (req, res) => {
      const { id } = req.params;
      const deleted = await habitCollection.deleteOne({ _id: new ObjectId(id) });
      if (deleted.deletedCount === 1) {
        res.send({ success: true, message: "Habit deleted successfully" });
      } else {
        res.status(404).send({ success: false, message: "Habit not found" });
      }
    });

    /** MARK HABIT COMPLETE */
    app.patch('/addHabit/:id/complete', async (req, res) => {
      try {
        const { id } = req.params;
        const { completionHistory } = req.body;

        const habit = await habitCollection.findOne({ _id: new ObjectId(id) });
        if (!habit) return res.status(404).send({ success: false, message: "Habit not found" });

        const todayStr = new Date().toDateString();
        const historyStrings = completionHistory.map(d => new Date(d).toDateString());

        // Prevent duplicate
        if (
          historyStrings.includes(todayStr) &&
          habit.completionHistory?.map(d => new Date(d).toDateString()).includes(todayStr)
        ) {
          return res.status(400).send({ success: false, message: "Habit already completed today" });
        }

        // Calculate streak
        const sortedHistory = [...historyStrings].sort((a, b) => new Date(b) - new Date(a));
        let streak = 0;
        let dayCounter = 0;
        for (let i = 0; i < sortedHistory.length; i++) {
          const date = new Date();
          date.setDate(date.getDate() - dayCounter);
          if (sortedHistory.includes(date.toDateString())) streak++;
          else break;
          dayCounter++;
        }

        const updatedHabit = await habitCollection.findOneAndUpdate(
          { _id: new ObjectId(id) },
          { $set: { completionHistory, currentStreak: streak } },
          { returnDocument: 'after' }
        );

        res.send({ success: true, result: updatedHabit.value });
      } catch (error) {
        console.error(error);
        res.status(500).send({ success: false, message: "Server error" });
      }
    });

    await client.db("admin").command({ ping: 1 });
    console.log("Connected to MongoDB successfully!");
  } finally {
    // client.close(); // optional
  }
}
run().catch(console.dir);

// Root
app.get('/', (req, res) => res.send('Server is running'));

// Dummy users (optional)
const users = [
  { id: 1, name: 'Sabana', email: 'sabana@gmail.com' },
  { id: 2, name: 'Safa', email: 'safa@gmail.com' },
  { id: 3, name: 'Sabila', email: 'sabila@gmail.com' },
];
app.get('/users', (req, res) => res.send(users));
app.post('/users', (req, res) => {
  const newUser = req.body;
  newUser.id = users.length + 1;
  users.push(newUser);
  res.send(newUser);
});

// Start server
app.listen(port, () => console.log(`Server listening on port ${port}`));

