const express= require('express');
const app = express();
const { default: mongoose } = require('mongoose');
const router = require("./Route/route");
const multer =  require("multer");
const {PORT,MONGOOSE_CONNECTION} = require('../configs')
const { AppConfig } = require('aws-sdk');


app.use(express.json());
app.use(express.urlencoded({ extended:true }));
app.use(multer().any());


mongoose.connect(MONGOOSE_CONNECTION,{useNewUrlParser:true,useUnifiedTopology:true})
.then(()=>{console.log("Database connected..")})
.catch(()=>{
    console.log("error")
})


app.use('/',router);

app.listen(PORT,()=>{
    console.log(`Express app Listening on port ${PORT}`);
})