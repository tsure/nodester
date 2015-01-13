var restify = require('restify');
var mongojs = require("mongojs");
var users = require('login-mongo');

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

var connection_string = '127.0.0.1:27017/taxiAppService';
var db = mongojs(connection_string, ['taxiAppService']);
var jobs = db.collection("jobs");

var PATH = '/jobs'
server.get({path : PATH , version : '0.0.1'} , findAllJobs);
server.get({path : PATH +'/:jobId' , version : '0.0.1'} , findJob);
server.post({path : PATH , version: '0.0.1'} ,postNewJob);
server.del({path : PATH +'/:jobId' , version: '0.0.1'} ,deleteJob);

var LOGINPATH = '/users'
server.post({path:LOGINPATH + '/createuser'} , addUser);
server.post({path:LOGINPATH + '/logintry'}, checkUserPassword);

function addUser(req, res) {
	res.setHeader('Access-Control-Allow-Origin','*');
	users.add(req.body.email, req.body.user, req.body.pass, function(err, success) {
    return res.end(JSON.stringify({
      error: err,
      success: success
    }));
  });
}

function checkUserPassword(req, res) {
	res.setHeader('Access-Control-Allow-Origin','*');
	users.checkPassword(req.body.user, req.body.pass, function(success) {
    if (success) {
      req.session.user = req.body.user;
      return res.redirect('/fareride.html');
    } else {
      req.session.user = void 0;
      return res.redirect('/sign-in.html');
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