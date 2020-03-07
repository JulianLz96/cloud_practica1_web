  var AWS = require('aws-sdk');
  AWS.config.loadFromPath('./config.json');

  var db = new AWS.DynamoDB();

  function keyvaluestore(table) {
    this.LRU = require("lru-cache");
    this.cache = new this.LRU({ max: 200 });
    this.tableName = table;
  };

  /**
   * Initialize the tables
   * 
   */
  keyvaluestore.prototype.init = function(whendone) {
    
    var tableName = this.tableName;
    var self = this;
    
    
    whendone(); //Call Callback function.
  };

  /**
   * Get result(s) by key
   * 
   * @param search
   * 
   * Callback returns a list of objects with keys "sort" and "value"
   */
  
keyvaluestore.prototype.get = function(search, callback) {
    var self = this;
    console.log(search)
    
    if (self.cache.get(search))
          callback(null, self.cache.get(search));
    else {
      let params = {
        TableName: this.tableName,
        KeyConditionExpression: '#key = :ky',
        ExpressionAttributeNames: {
          '#key': 'key'
        },
        ExpressionAttributeValues: {
          ':ky': { 'S': search }
        },
      };
      db.query(params, (err, data) => {
        if(err){
          callback(err, null)
        } else {
          self.cache.set(search, data);
          callback(null, data)
        }
      })
      /*
       * 
       * La función QUERY debe generar un arreglo de objetos JSON son cada
       * una de los resultados obtenidos. (inx, value, key).
       * Al final este arreglo debe ser insertado al cache. Y llamar a callback
       * 
       * Ejemplo:
       *    var items = [];
       *    items.push({"inx": data.Items[0].inx.N, "value": data.Items[0].value.S, "key": data.Items[0].key});
       *    self.cache.set(search, items)
       *    callback(err, items);
       */
    }
  };


  module.exports = keyvaluestore;
