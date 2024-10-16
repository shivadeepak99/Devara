const sql=require(`mysql2`);
require(`dotenv`).config();
const con=sql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

con.connect((err)=>{
    if(err){
        console.log(err)
        console.log("error connecting the database!")
    }else{ console.log("Database is on fire🔥🔥")}
});

module.exports=con;
