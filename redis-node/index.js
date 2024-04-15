// const express = require('express')
import express from "express";
import axios from "axios"
const app = express();

const PORT = process.env.PORT || 3005;

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
        res.send({
            fromCache: false,
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