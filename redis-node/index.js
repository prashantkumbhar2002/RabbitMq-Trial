// const express = require('express')
import express from "express";
import axios from "axios"
const app = express();

const PORT = process.env.PORT || 3005;

async function getApiData(species){
    const apiRes = await axios.get(`https://www.fishwatch.gov/api/species/${species}`);
    console.log("Request sent to API ")
    return apiRes.data;
}



app.listen(PORT, ()=> {
  console.log(`⚙️ Server is running at port : ${PORT}`)
})