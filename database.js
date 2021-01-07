const {Client}= require('pg');
const db=new Client({
    connectionString: process.env.DATABASE_URL,
  /*ssl: {
    rejectUnauthorized: false
  }*/
});
db.connect();
module.exports={
    query(text,parameters,callback){
      return db.query(text,parameters,callback);
    }
}