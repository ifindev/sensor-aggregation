const fs = require("fs");
const express = require("express");
const { Collection } = require("json-aggregate");

const app = express();
const port = 3000;

app.use(express.json());

app.get("/room/:area", (req, res) => {
  let roomAreaNumber = parseInt(req.params.area);

  let sensorData = getDataFromJSON("data/sensor_data.json").array;
  if (roomAreaNumber > 0 && roomAreaNumber <= 3) {
    let roomArea;
    if (roomAreaNumber === 1) {
      roomArea = sensorData.filter((data) => data.roomArea === "roomArea1");
    } else if (roomAreaNumber === 2) {
      roomArea = sensorData.filter((data) => data.roomArea === "roomArea2");
    } else {
      roomArea = sensorData.filter((data) => data.roomArea === "roomArea3");
    }
    console.log(roomAreaNumber);
    /* find maximum temperature and humidity */
    let maximumTemp = findMaximumValue(roomArea, "temperature");
    let maximumHumd = findMaximumValue(roomArea, "humidity");

    /* find minimum temperature and humidity */
    let minimumTemp = findMinimumValue(roomArea, "temperature");
    let minimumHumd = findMinimumValue(roomArea, "humidity");

    /* Find total temperature & humidity for average */
    let totalTemp = 0;
    let totalHumd = 0;
    roomArea.map((data) => {
      totalTemp += data.temperature;
      totalHumd += data.humidity;
    });

    /* Find average value */
    let avgTemp = totalTemp / roomArea.length;
    let avgHumd = totalHumd / roomArea.length;

    /* Find median temperature & humidity */
    let medTemp = 0;
    let medHumd = 0;
    let dataLen = roomArea.length;
    let dataLenHalf = parseInt(dataLen / 2);

    if (dataLen % 2 === 0) {
      /* zero index array: median even data = data[n/2] +  data[n/2 -1] / 2*/
      medTemp =
        (roomArea[dataLenHalf].temperature +
          roomArea[dataLenHalf - 1].temperature) /
        2;
      medHumd =
        (roomArea[dataLenHalf].humidity + roomArea[dataLenHalf - 1].humidity) /
        2;
    } else {
      medTemp = roomArea[dataLenHalf - 1].temperature;
      medHumd = roomArea[dataLenHalf - 1].humidity;
    }

    let respJSON = {
      temperature: {
        min: minimumTemp,
        max: maximumTemp,
        median: medTemp,
        avg: avgTemp,
      },
      humidity: {
        min: minimumHumd,
        max: maximumHumd,
        median: medHumd,
        avg: avgHumd,
      },
    };

    res.send(respJSON);
  } else {
    res.send({ error: true, msg: "room is not available" });
  }
});

app.get("/room/:area/day", (req, res) => {
  let roomAreaNumber = parseInt(req.params.area);

  let sensorData = getDataFromJSON("data/sensor_data.json").array;
});

/* Find maximum data from array of json */
const findMaximumValue = (arr, dataParam) => {
  if (dataParam === "temperature") {
    let maxTemp = 0;
    arr.map((data) => {
      if (data.temperature > maxTemp) {
        maxTemp = data.temperature;
      }
    });
    return maxTemp;
  } else if (dataParam === "humidity") {
    let maxHumid = 0;
    arr.map((data) => {
      if (data.humidity > maxHumid) {
        maxHumid = data.humidity;
      }
    });
    return maxHumid;
  } else {
    return 0;
  }
};

/* Find minimum data from array of json */
const findMinimumValue = (arr, dataParam) => {
  if (dataParam === "temperature") {
    let minTemp = 1e10;
    arr.map((data) => {
      if (data.temperature < minTemp) {
        minTemp = data.temperature;
      }
    });
    return minTemp;
  } else if (dataParam === "humidity") {
    let minHumid = 1e10;
    arr.map((data) => {
      if (data.humidity < minHumid) {
        minHumid = data.humidity;
      }
    });
    return minHumid;
  } else {
    return 0;
  }
};

/* Find minimum data from array of json */

/* get data from json file */
const getDataFromJSON = (file) => {
  const jsonData = fs.readFileSync(file);
  return JSON.parse(jsonData);
};

app.listen(port, () => {
  console.log(`Server runs on port ${port}`);
});
