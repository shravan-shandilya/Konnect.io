//Replace in-memory hashtable with mongodb

watches = {}
function add(address,data){
  watches[address] = data;
}

function get(address){
  return watches[address];
}

function remove(address){
  delete watches[address];
}

function isPresent(address){
  return watches[address] != null;
}

function getAll(){
  temp = [];
  keys = Object.keys(watches);
  for (var i = 0;i<keys.length;i++){
    data = {};
    watch = keys[i];
    data["address"] = watch;
    data["name"] = watches[watch]["name"];
    data["action"] = watches[watch]["action"];
    if(watches[watch]["status"]){
      data["checked"] = "checked";
    }
    temp.push(data);
  }
  return temp;
}
function pause(address){
  watches[address]["status"] = false;
}
function resume(){
  watches[address]["status"] = true;
}

module.exports = {
  "add":add,
  "get":get,
  "remove":remove,
  "isPresent":isPresent,
  "getAll":getAll,
  "pause":pause,
  "resume":resume
};
