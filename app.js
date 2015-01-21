var restify = require('restify');
var mongojs = require("mongojs");
var bcrypt = require('bcrypt');

console.log("logging into database..");
var db = mongojs('mongodb://taxiapp:taxiTaxi!@ds050077.mongolab.com:50077/taxiappservice', ['users']);
var users = db.collection("users");
console.log("db = "+db);
//var jobs = db.collection("jobs");
db.on('error',function(err) {
    console.log('database error', err);
});

db.on('ready',function() {
    console.log('database connected');
});


var ip_addr = '127.0.0.1';
var port    =  '3000';
 
var server = restify.createServer({
    name : "taxiAppService"
});

server.use(restify.queryParser());
server.use(restify.bodyParser());
server.use(restify.CORS());

server.listen(port ,ip_addr, function(){
    console.log('%s listening at %s ', server.name , server.url);
});




var PATH = '/jobs'
server.get({path : PATH , version : '0.0.1'} , findAllJobs);
server.get({path : PATH +'/:jobId' , version : '0.0.1'} , findJob);
server.post({path : PATH , version: '0.0.1'} ,postNewJob);
server.del({path : PATH +'/:jobId' , version: '0.0.1'} ,deleteJob);

var LOGINPATH = '/users'
server.post({path:LOGINPATH + '/createuser'} , addUser);
server.post({path:LOGINPATH + '/logintry'}, checkUserPassword);

function addUser(req, res, next) {
	res.setHeader('Access-Control-Allow-Origin','*');
    var emailId = req.body.email;
    var firstName = req.body.firstname;
    var lastName = req.body.lastname;
    var password = req.body.password;
    console.log("password = "+password);

    var salt = bcrypt.genSaltSync(10);
    var passHash = bcrypt.hashSync(password, salt);
    
    console.log("password hash = "+passHash);
    //Store details in database
    var user = {};
    user.firstName = firstName;
    user.lastName = lastName;
    user.email = emailId;
    user.password = passHash; //storing the password hash and not the password..


    users.save(user , function(err , success){
        console.log('Response success '+success);
        console.log('Response error '+err);
        if(success){
            res.send(201 , user);
            return next();
        }else{
            return next(err);
        }
    });


    
}

function checkUserPassword(req, res, next) {
	res.setHeader('Access-Control-Allow-Origin','*');
    var foundUser = users.findOne({
        email: req.body.email,
    },function(err, doc) {
        var foundUserPassword = doc.password;
        var userPasswordMatches = bcrypt.compareSync(req.body.password, foundUserPassword);
        if(userPasswordMatches){
            res.send(200 , doc);
            return next();
        }else{
            return next(err);
        }
    });
}


function findAllJobs(req, res , next){
    res.setHeader('Access-Control-Allow-Origin','*');
    jobs.find().limit(20).sort({postedOn : -1} , function(err , success){
        console.log('Response success '+success);
        console.log('Response error '+err);
        if(success){
            res.send(200 , success);
            return next();
        }else{
            return next(err);
        }
 
    });
 
}
 
function findJob(req, res , next){
    res.setHeader('Access-Control-Allow-Origin','*');
    jobs.findOne({_id:mongojs.ObjectId(req.params.jobId)} , function(err , success){
        console.log('Response success '+success);
        console.log('Response error '+err);
        if(success){
            res.send(200 , success);
            return next();
        }
        return next(err);
    })
}
 
function postNewJob(req , res , next){
    var job = {};
    job.title = req.params.title;
    job.description = req.params.description;
    job.location = req.params.location;
    job.postedOn = new Date();
 
    res.setHeader('Access-Control-Allow-Origin','*');
 
    jobs.save(job , function(err , success){
        console.log('Response success '+success);
        console.log('Response error '+err);
        if(success){
            res.send(201 , job);
            return next();
        }else{
            return next(err);
        }
    });
}
 
function deleteJob(req , res , next){
    res.setHeader('Access-Control-Allow-Origin','*');
    jobs.remove({_id:mongojs.ObjectId(req.params.jobId)} , function(err , success){
        console.log('Response success '+success);
        console.log('Response error '+err);
        if(success){
            res.send(204);
            return next();      
        } else{
            return next(err);
        }
    })
 
}

function genSaltForPassword(password) {
    var passHash = null;
    bcrypt.genSalt(10, function(err, salt) {
    console.log("password in gensalt= "+password);        
    bcrypt.hash(password, salt, function(err, hash) {
            console.log("hash generated = "+hash);
            passHash =  hash;
        });
    });
    return passHash;
}

function comparePasswordSalt(password) {
    bcrypt.compare(password, hash, function(err, res) {
        return res;
    });
} 
