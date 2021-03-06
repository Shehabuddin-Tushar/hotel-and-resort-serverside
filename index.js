const express = require('express')
const app = express()
require('dotenv').config()
var cors = require('cors')
const port = process.env.PORT || 5000
const ObjectId=require("mongodb").ObjectId;
app.use(express.json())
app.use(cors())

const { MongoClient } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.lp6z6.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


async function run(){
   
    try{
        await client.connect();
        const database = client.db("resortbooking");
        const services = database.collection("services");
        const booking = database.collection("bookingregister");


       
        app.get("/services",async(req,res)=>{

            const result= services.find({});
            const myservices=await result.toArray();
            res.send(myservices)
        })

        app.get("/databyid/:id",async(req,res)=>{
          const id=req.params.id;
          const query={_id:ObjectId(id)}
          const result= await services.findOne(query);
          res.json(result);
        })

        app.post("/bookingadd",async(req,res)=>{
           const value=req.body;
           const date=value.date;
           const place=value.bookingplace;
           const query ={bookingplace:place};
           const cursor = await booking.find(query).toArray();
           const collectdata=cursor.filter(d=>d.date==date)
           if(collectdata.length===0){
            const result = await booking.insertOne(value);
            res.send("you have been booked your resort successfully");
           }else{
              res.send("you cannot booked this resort because its already booked")
           }
        })

        app.get("/myorders",async(req,res)=>{
           const search=req.query.search;
           const query ={email:search};
           const result = await booking.find(query).toArray();
           res.json(result)
        })

        app.delete("/deletebooking/:id",async(req,res)=>{
          const id=req.params.id;
          console.log(id)
          const query = { _id:ObjectId(id)};

          const result = await booking.deleteOne(query);
          res.json(result)
        });

        

        app.get("/allbookingitems",async(req,res)=>{
          const result = await booking.find({}).toArray();
           res.json(result)
        });

        app.get("/mystatuschange/:id",async(req,res)=>{
          const id= req.params.id;

          const query = { _id:ObjectId(id)};
          const data = await booking.findOne(query);
          const mystatus=data.status;
         
              const filter = { _id:ObjectId(id) };
              const options = { upsert: true };
              const updateDoc = {
                  $set: {
                     status:mystatus=="Approved"?"Pending":"Approved",
                   },
                };
              const result = await booking.updateOne(filter, updateDoc, options);
              res.send(result);
       });

       app.post("/addnewservice",async(req,res)=>{

        const placename=req.body.name;
      
        const query ={name:placename};
        const result = await services.findOne(query);
        console.log(result)
        if(result==null){
          const value = await services.insertOne(req.body);
          res.send("Service add successfully");
         }else{
            res.send("Its already added")
         } 
       })

       

       


    }finally{

    }
}

run().catch(console.dir)

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})