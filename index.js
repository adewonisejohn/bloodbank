const express=require('express');
var http=require('http');
const app=express();
var server=http.createServer(app);
const io=require('socket.io')(server);

const port=process.env.PORT || 5300;
//var MongoClient=require('mongodb').MongoClient;

//const url="mongodb://localhost:27017/";

const { MongoClient, MongoDBNamespace } = require('mongodb');
const { mquery } = require('mongoose');
const uri = "mongodb+srv://bloodbak:oluwalogbon@votanet.blolf.mongodb.net/?retryWrites=true&w=majority";

const client = new MongoClient(uri);



app.use(express.json());


var signup_info={
    name:'Lorem ipsum',
    email:'loremipsum@gmail.com',
    mobile:+2348143648991,
    address:'Lorem ipsum sit adet',
    gender:'male',
    bloodGroup:'O'
}
client.connect(err => {
    console.log('connection to db successful');
    const dbo = client.db("blooddonor");
    /*dbo.createCollection("donors",function(err,res){
        if(err){
            console.log(err);
        }
        console.log("collection created successfully");
    });*/
    io.on('connection',function(socket){
        console.log('a client connected');
        console.log(socket.id,"has joined");
        socket.on("current_location",function(msg){
            var query={_id:msg.id};
            var location={lat:msg.lat,lng:msg.lng};
            var new_value={$set:{current_location:location}};
            dbo.collection("donors").updateOne(query,new_value,function(err,res){
                if(err)throw err;
                console.log('successuflly updated db');
            });
            //console.log(msg);
        });
        socket.on('signup',function(msg){
            console.log(msg);
            var info={
                _id:msg.mobileNumber,
                name:msg.name,
                gender:msg.gender,
                bloodType:msg.bloodType,
                email:msg.email,
                mobileNumber:msg.mobileNumber,
                address:msg.address,
                current_location:""
            }
            dbo.collection("donors").insertOne(info,function(err,res){
                if(err)console.log(err);
                console.log('onde document added to the db');
            });
        });
        socket.on('disconnnect',function(socket){
            console.log('a client disconnect')
        })
        
    });
    // perform actions on the collection object
    //client.close();
  });

server.listen(port,"0.0.0.0",function(){
    console.log('server started at port'+port);
});

