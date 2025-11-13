const express = require('express')
const cors=require('cors');
const app = express()
const port = 7000
const { MongoClient, ServerApiVersion } = require('mongodb');

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
  
    const db=client.db('habit-tracker')
    const habitCollection=db.collection('AddHabit')

    app.get('/addHabit',async(req,res)=>{
      const result=await habitCollection.find().toArray()
      res.send(result)
    })

    app.get('/addHabit/:id',async (req,res)=>{
      const {id}=req.params
      console.log(id);

      res.send({
        success:true,
      })
    })

    app.post('/addHabit', async (req, res) => { 
      const habitData = req.body;
      const result = await habitCollection.insertOne(habitData);
      console.log('Habit added:', result);
      res.send(result);
    });




    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
  
}
}
  run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Server is running')
})

const users=[
    {id: 1,  name: 'Sabana' , email: 'sabana@gmail.com'},
    {id: 2,  name: 'Safa' , email: 'safa@gmail.com'},
    {id: 3,  name: 'Sabila' , email: 'sabila@gmail.com'},
]

app.get('/users',(req,res)=>{
    res.send(users);
})

app.post('/users',(req,res)=>{
    console.log('post method called',req.body);
    const newUser=req.body;
    newUser.id=users.length+1;
    users.push(newUser)
    res.send(newUser);
})

app.listen(port, () => {
  console.log(`Server is  listening on port ${port}`)
})
