const { resolveSoa } = require('dns');
const express=require('express');
var http=require('http');
const app=express();
var server=http.createServer(app);
const io=require('socket.io')(server);
const ejs=require('ejs');


app.set('view engine','ejs');
app.set('views', 'views');

const port=process.env.PORT || 5300;
//var MongoClient=require('mongodb').MongoClient;

//const url="mongodb://localhost:27017/";

const { MongoClient, MongoDBNamespace } = require('mongodb');
const { mquery } = require('mongoose');
const { join } = require('path');
const { execPath } = require('process');
const { fchown } = require('fs');
const { randomInt } = require('crypto');
const uri = "mongodb+srv://bloodbak:oluwalogbon@votanet.blolf.mongodb.net/?retryWrites=true&w=majority";

const client = new MongoClient(uri);



app.use(express.json());
app.use(express.static('public'));

function distance(location1,location2){
    var lon1 =  Number(location1.lng) * Math.PI / 180;
    var lon2 = Number(location2.lng)* Math.PI / 180;
    var lat1 = Number(location1.lat)* Math.PI / 180;
    var lat2 = Number(location2.lat) * Math.PI / 180;

    let dlon = lon2 - lon1;
    let dlat = lat2 - lat1;
    let a = Math.pow(Math.sin(dlat / 2), 2)
             + Math.cos(lat1) * Math.cos(lat2)
             * Math.pow(Math.sin(dlon / 2),2);
    let c = 2 * Math.asin(Math.sqrt(a));

    // Radius of earth in kilometers. Use 3956
    // for miles
    let r = 6371;

    // calculate the result
    /*if(Math.floor(c*r)==0){
        console.log('distance is 0');
        return(Math.floor(Math.random())*10);
    }else{
        console.log('distance is not 0');
        return(c * r);
    }*/
    if(c*r==0){
        console.log('is zero');
        var random=Math.floor(Math.random()*10);
        console.log('---------------------------------------');
        console.log(random);
        console.log('--------------------------------------------');
        if(random==0){
            return 3939.44
        }else{
            return random
        }
    }else{
        return(c*r);
    }
}

var example=distance({lat:343.33,lng:3434},{lat:3344.33,lng:994883.5});


function preprocess_query(db_values,query_values){
    for(var i=0;i<db_values.length;i++){
        /*console.log('-------------------------------------');
        console.log(db_values[i]);
        console.log(query_values);
        console.log('------------------------------------');*/
        var donor_distance=distance(db_values[i].current_location,query_values);
        console.log('the distance is'+donor_distance);
        db_values[i].distance=donor_distance;
    }
}



client.connect(err => {
    console.log('connection to db successful');
    const dbo = client.db("blooddonor");


    app.get('/',function(req,res){
        res.sendFile('index.html');
    });
    app.get('/searchDonors',function(req,res){
        console.log(req.query);
        var blood=req.query.bloodtype;
        blood.toUpperCase();
        console.log(blood);
        dbo.collection("donors").find({bloodType:blood}).toArray(function(err, result) {
            if (err) throw err;
            if(result==[]){
                console.log('no result found');
            }else{
                console.log(result);
                preprocess_query(result,req.query);
                console.log('------------------------------------');
                console.log(result);
                res.render('result',{output:result});
            }
        });
        
    });
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
            console.log(msg);
            var info={
                id:msg.id,
                lat:msg.lat,
                lng:msg.lng
            }
            //var id=msg.id.toString();
            var query={'_id':info.id};
            //var location={lat:msg.lat,lng:msg.lng};
            var new_value={$set:{current_location:{'lat':info.lat,'lng':info.lng}}};
            dbo.collection("donors").updateOne(query,new_value,function(err,res){
                if(err)throw err;
                console.log('successuflly updated db');
            });
            console.log(info);
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
                current_location:{'lat':0,'lng':0}
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

