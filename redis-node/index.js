// const express = require('express')
import express from "express";
import axios from "axios";
import redis from "redis";

const app = express();

const PORT = process.env.PORT || 3005;

let redisClient;
(async ()=>{
  redisClient = redis.createClient();
  redisClient.on("error", (error)=> {
    console.log(`Error : ${error}`)
  })
  await redisClient.connect();
})();

async function getApiData(species) {
    const apiRes = await axios.get(`https://www.fishwatch.gov/api/species/${species}`);
    console.log("Request sent to API ")
    return apiRes.data;
}


async function getSpeciesData(req, res) {
    const { species } = req.params;
    let results;
    try {
        results = await getApiData(species);
        if (results.length === 0) {
            throw "API returned an empty array";
        }
        await redisClient.set(species, JSON.stringify(results), { EX: 180, NX: true});
        res.send({
            fromCache: false,
            data: results,
        });
    } catch (error) {
        console.error(error);
        res.status(404).send("Data unavailable");
    }
}


async function cacheData(req, res, next){
    const {species} = req.params;
    let results;
    try {
      const cacheRes = await redisClient.get(species);
      if(cacheRes){
        results = JSON.parse(cacheRes)
        res.send({
          fromCache: true,
          data: results
        })
      } else{
        next();
      }
    } catch (error) {
      console.error(error);
      res.status(404);
    }
  }

app.get("/fish/:species", cacheData, getSpeciesData);
app.listen(PORT, () => {
    console.log(`⚙️ Server is running at port : ${PORT}`)
})