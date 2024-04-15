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
    let results, isCached = false;
    try {
        const cachedRes = await redisClient.get(species);
        if(cachedRes){
            isCached = true;
            results = JSON.parse(cachedRes)
        }
        else{
            results = await getApiData(species);
            if (results.length === 0) {
                throw "API returned an empty array";
            }
            await redisClient.set(species, JSON.stringify(results));
        }
        
        res.send({
            fromCache: isCached,
            data: results,
        });
    } catch (error) {
        console.error(error);
        res.status(404).send("Data unavailable");
    }
}

app.get("/fish/:species", getSpeciesData);
app.listen(PORT, () => {
    console.log(`⚙️ Server is running at port : ${PORT}`)
})