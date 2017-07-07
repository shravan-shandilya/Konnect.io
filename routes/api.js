var express = require('express');
var router = express.Router();
var Web3 = require('web3');
var web3 = new Web3();
var Twitter = require('twitter');
var db = require('./db');


filters = {}
try{
  web3.setProvider(new Web3.providers.HttpProvider("http://localhost:8545"));
  web3.eth.defaultAccount = web3.eth.coinbase;
}catch(err){
  console.log("Connection to RPC Provider failed! Following error occured:",err);
}

var actions = {
  "Tweet":function(address,message){
    cred = db.get(address)["data"];
    var client = new Twitter({
      consumer_key: cred.CONSUMER_KEY,
      consumer_secret: cred.CONSUMER_SECRET,
      access_token_key: cred.ACCESS_TOKEN_KEY,
      access_token_secret: cred.ACCESS_TOKEN_SECRET
    });
    client.post('statuses/update', {status: message},  function(error, tweet, response) {
        if(error){
          console.log(error);
        }
    });
  },
  "ShareOnFacebook":function(address,message){
    //To be implemented
  },
  "RenewAWS":function(address,message){
    //To be implemented
  }
}

router.post('/watch/create', function(req, res, next) {
  temp_data = req.body["data"].split("\n").join("").split("\r").join("").split("'").join('"');
  data = {
    "name":req.body["contract_name"],
    "event":req.body["event"],
    "action":req.body["action"],
    "data":JSON.parse(temp_data),
    "status":true
  };
  db.add(req.body["contract_address"],data);

  var filter = web3.eth.filter({event:req.body["event"],fromBlock:'latest',address:req.body["contract_address"]});
  filter.watch(function(err,res){
    address = res.address;
    console.log(db.get(address)["action"]);
    actions[db.get(address)["action"]](address,web3.toAscii(res.data));
  });
  //id = Math.random().toString(36).substr(2);
  filters[req.body["contract_address"]] = filter;
  res.writeHead(301,
  {Location: 'http://localhost:3000/'}
  );
  res.end();
});

router.post('/watch/delete', function(req, res, next) {
  //id = req.body.id;
  address = req.body.address;
  if((filters[address] != null) & (db.isPresent(address))){
    filters[address].stopWatching();
    db.pause(address);
    res.send({"status":"success"});
    return;
  }else{
    res.send({"status":"failure"});
  }
});

router.post('/watch/restart', function(req, res, next) {
  //id = req.body.id;
  address = req.body.address;
  var filter = web3.eth.filter({event:db.get(address)["event"],fromBlock:'latest',address:address});
  filter.watch(function(err,res){
    address = res.address;
    actions[db.get(address)["action"]](address,web3.toAscii(res.data));
  });
  db.resume(address);
  res.send({"status":"success"});
});

module.exports = router;
