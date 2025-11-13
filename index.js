// const express = require('express')
// const cors=require('cors');
// const app = express()
// const port = 7000
// const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

// app.use(cors());
// app.use(express.json());


// const uri = "mongodb+srv://health-tracker:GJSDuCiXTKaKIPjd@cluster0.hlqh8iv.mongodb.net/?appName=Cluster0";

// const client = new MongoClient(uri, {
//   serverApi: {
//     version: ServerApiVersion.v1,
//     strict: true,
//     deprecationErrors: true,
//   }
// });

// async function run() {
//   try {
//     await client.connect();
  
//     const db=client.db('habit-tracker')
//     const habitCollection=db.collection('AddHabit')

//     app.get('/addHabit',async(req,res)=>{
//       const result=await habitCollection.find().toArray()
//       res.send(result)
//     })

//     app.get('/addHabit/:id',async (req,res)=>{
//       const {id}=req.params
//       console.log(id);
//       const result =await habitCollection.findOne({_id: new ObjectId (id)})

//       res.send({
//         success:true,
//         result
//       })
//     })




    

//     app.post('/addHabit', async (req, res) => { 
//       const habitData = req.body;
//       const result = await habitCollection.insertOne(habitData);
//       console.log('Habit added:', result);
//       res.send(result);
//     });




//     await client.db("admin").command({ ping: 1 });
//     console.log("Pinged your deployment. You successfully connected to MongoDB!");
//   } finally {
  
// }
// }
//   run().catch(console.dir);

// app.get('/', (req, res) => {
//   res.send('Server is running')
// })

// const users=[
//     {id: 1,  name: 'Sabana' , email: 'sabana@gmail.com'},
//     {id: 2,  name: 'Safa' , email: 'safa@gmail.com'},
//     {id: 3,  name: 'Sabila' , email: 'sabila@gmail.com'},
// ]

// app.get('/users',(req,res)=>{
//     res.send(users);
// })

// app.post('/users',(req,res)=>{
//     console.log('post method called',req.body);
//     const newUser=req.body;
//     newUser.id=users.length+1;
//     users.push(newUser)
//     res.send(newUser);
// })

// app.listen(port, () => {
//   console.log(`Server is  listening on port ${port}`)
// })



const express = require('express');
const cors = require('cors');
const app = express();
const port = 7000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

app.use(cors());
app.use(express.json());

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

    // Get all habits
    app.get('/addHabit', async (req, res) => {
      const result = await habitCollection.find().toArray();
      res.send(result);
    });

    // Get habit by ID
    app.get('/addHabit/:id', async (req, res) => {
      const { id } = req.params;
      const result = await habitCollection.findOne({ _id: new ObjectId(id) });
      res.send({
        success: true,
        result
      });
    });

    // Add new habit
    app.post('/addHabit', async (req, res) => {
      const habitData = req.body;
      const result = await habitCollection.insertOne(habitData);
      console.log('Habit added:', result);
      res.send(result);
    });

    // PATCH route: Mark habit complete, push date, prevent duplicate, update streak
    app.patch('/addHabit/:id/complete', async (req, res) => {
      try {
        const { id } = req.params;
        const { completionHistory } = req.body; // frontend sends updated array including today

        const habit = await habitCollection.findOne({ _id: new ObjectId(id) });
        if (!habit) {
          return res.status(404).send({ success: false, message: "Habit not found" });
        }

        // Prevent duplicate for today
        const todayStr = new Date().toDateString();
        const historyStrings = completionHistory.map(d => new Date(d).toDateString());
        if (historyStrings.includes(todayStr) && habit.completionHistory?.map(d => new Date(d).toDateString()).includes(todayStr)) {
          return res.status(400).send({ success: false, message: "Habit already completed today" });
        }

        // Calculate streak
        const sortedHistory = [...historyStrings].sort((a,b) => new Date(b) - new Date(a)); // latest first
        let streak = 0;
        let dayCounter = 0;
        for (let i = 0; i < sortedHistory.length; i++) {
          const date = new Date();
          date.setDate(date.getDate() - dayCounter);
          if (sortedHistory.includes(date.toDateString())) streak++;
          else break;
          dayCounter++;
        }

        // Update habit in DB
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
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // You can close client here if needed
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Server is running');
});

// Dummy users (can leave as is)
const users = [
  { id: 1, name: 'Sabana', email: 'sabana@gmail.com' },
  { id: 2, name: 'Safa', email: 'safa@gmail.com' },
  { id: 3, name: 'Sabila', email: 'sabila@gmail.com' },
];

app.get('/users', (req, res) => {
  res.send(users);
});

app.post('/users', (req, res) => {
  console.log('post method called', req.body);
  const newUser = req.body;
  newUser.id = users.length + 1;
  users.push(newUser);
  res.send(newUser);
});

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
