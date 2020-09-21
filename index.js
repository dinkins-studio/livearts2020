// import express, { static, json } from 'express';
// import Datastore from 'nedb';
// import multer from 'multer'; // use multer to upload blob data
// const upload = multer(); // set multer to be the upload variable (just like express, see above ( include it, then use it/set it up))
// import fs from 'fs'; // use the file system so we can save files
// import { S3 } from 'aws-sdk';
const express = require('express');
const Datastore = require('nedb');
const multer = require('multer') // use multer to upload blob data
const upload = multer(); // set multer to be the upload variable (just like express, see above ( include it, then use it/set it up))
const fs = require('fs'); // use the file system so we can save files
const AWS = require('aws-sdk');
const PORT = process.env.PORT || 5000
require('dotenv').config()

const BUCKET_NAME = "say-it-aloud";
const s3 = new AWS.S3({
  accessKeyId: process.env.ID,
  secretAccessKey: process.env.SECRET
});


const app = express();
app.listen(PORT, () => console.log(`Listening on ${PORT}`));
app.use(express.static('public'));
app.use(express.json({
  limit: '10mb'
}));

const database = new Datastore('database.db');
database.loadDatabase();


app.post("/upload", upload.single("videoBlob"), function(req, res, next) {
  let uploadLocation = __dirname + "/public/upload/" + req.file.originalname; // where to save the file to. make sure the incoming name has a .wav extension

//   fs.writeFileSync(
//     uploadLocation,
//     Buffer.from(new Uint8Array(req.file.buffer))
//   ); // write the blob to the server as a file

  // AWS https://stackabuse.com/uploading-files-to-aws-s3-with-node-js/
  const uploadFile = fileName => {
    // Read content from the file
    const fileContent = Buffer.from(new Uint8Array(req.file.buffer));

    // Setting up S3 upload parameters
    const params = {
      Bucket: BUCKET_NAME,
      Key: req.file.originalname, // File name you want to save as in S3
      Body: fileContent
    };

    // Upload files to the bucket
    s3.upload(params, function(err, data) {
      if (err) {
        throw err;
      }
      // add the filename
      const video = {
        url: data.Location,
        approved: false
      };
      database.insert(video);
      console.log(`File uploaded successfully. ${data.Location}`);
    });
  };
  
  uploadFile();
  
  res.sendStatus(200); // send back that everything went ok
  // Another option if you wanted to send a custom message back
  // res.json({
  //   status: "it worked!",
  //   filename: req.file.originalname
  // });
  
});

// connect to ThreeJS - this is a list of webm video uploads
app.get("/list", (request, response) => {
  database.find({}, (err, data) => {
    if (err) {
      response.end();
      return;
    }
    response.json(data);
  });
});