const fs = require("fs");
const express = require("express");

const app = express();
const port = 3000;

app.use(express.json());

/* First endpoint to get aggregate data by area number */
app.get("/room/:area", (req, res) => {
  /* Get room area number */
  let roomAreaNumber = parseInt(req.params.area);

  /* Get Sensor Data */
  let sensorData = getDataFromJSON("data/sensor_data.json").array;

  if (roomAreaNumber > 0 && roomAreaNumber <= 3) {
    /* Get room area data */
    let roomArea = getRoomAreaData(sensorData, roomAreaNumber);

    /* get aggregated sensor data */
    let respJSON = getSensorAggregate(roomArea);

    /* Send response */
    res.send(respJSON);
  } else {
    res.send({ error: true, msg: "room is not available" });
  }
});

/* Second endpoint to get available Datetime */
app.get("/room/:area/date", (req, res) => {
  /* Get room area number */
  let roomAreaNumber = parseInt(req.params.area);

  /* Get sensor data from JSON  */
  let sensorData = getDataFromJSON("data/sensor_data.json").array;

  if (roomAreaNumber > 0 && roomAreaNumber <= 3) {
    /* Get room area data */
    let roomArea = getRoomAreaData(sensorData, roomAreaNumber);

    /* Convert timestamps data into date time data */
    roomArea = convertTimestampToDate(roomArea);

    let dateKey = getDateKeys(roomArea);

    console.log(dateKey);

    /* Response send available day to be aggregated */
    let respJSON = {
      availableDateTime: {
        ...dateKey,
      },
    };

    /* Send response */
    res.send(respJSON);
  } else {
    res.send({ error: true, msg: "room is not available" });
  }
});

/* Third Endpoint to get aggregate data based on date-time */
app.get("/room/:area/date/:day/:month/:year", (req, res) => {
  /* Get datetime from params */
  const dateParams =
    req.params.day + "/" + req.params.month + "/" + req.params.year;

  /* Get room area number */
  let roomAreaNumber = parseInt(req.params.area);

  /* Get sensor data from JSON  */
  let sensorData = getDataFromJSON("data/sensor_data.json").array;

  if (roomAreaNumber > 0 && roomAreaNumber <= 3) {
    /* Get room area data */
    let roomArea = getRoomAreaData(sensorData, roomAreaNumber);

    roomArea = convertTimestampToDate(roomArea);

    let dateKey = getDateKeys(roomArea);

    /* check queried date key is available or not */
    const found = dateKey.find((date) => date === dateParams);

    if (found) {
      roomArea = roomArea.filter((data) => {
        if (data.timestamp == dateParams) {
          return data;
        }
      });

      /* Get sensor aggregate data for this date */
      let respJSON = getSensorAggregate(roomArea);

      res.send(respJSON);
    } else {
      res.send({ error: true, msg: "data for that date is not available" });
    }
  } else {
    res.send({ error: true, msg: "room is not available" });
  }
});

const convertTimestampToDate = (arrData) => {
  arrData.map((data) => {
    let dateTime = new Date(data.timestamp);
    data.timestamp =
      dateTime.getDate() +
      "/" +
      dateTime.getMonth() +
      "/" +
      dateTime.getFullYear();
  });

  return arrData;
};

/* Get date key values */
const getDateKeys = (arrData) => {
  /* get all the date-time key values */
  let dateKey = arrData.reduce(function (arrKey, dataVal) {
    if (arrKey[dataVal.timestamp]) {
      arrKey[dataVal.timestamp] += 1;
    } else {
      arrKey[dataVal.timestamp] = 1;
    }
    return arrKey;
  }, {});

  dateKey = Object.keys(dateKey);
  return dateKey;
};

/* Get room area data by room area numnber */
const getRoomAreaData = (sensorData, roomAreaNumber) => {
  if (roomAreaNumber === 1) {
    roomArea = sensorData.filter((data) => data.roomArea === "roomArea1");
  } else if (roomAreaNumber === 2) {
    roomArea = sensorData.filter((data) => data.roomArea === "roomArea2");
  } else {
    roomArea = sensorData.filter((data) => data.roomArea === "roomArea3");
  }

  return roomArea;
};

/* Get Aggregated data from json */
const getSensorAggregate = (arrData) => {
  /* find maximum temperature and humidity */
  let maximumTemp = findMaximumValue(arrData, "temperature");
  let maximumHumd = findMaximumValue(arrData, "humidity");

  /* find minimum temperature and humidity */
  let minimumTemp = findMinimumValue(arrData, "temperature");
  let minimumHumd = findMinimumValue(arrData, "humidity");

  /* Find total temperature & humidity for average */
  let totalTemp = 0;
  let totalHumd = 0;
  arrData.map((data) => {
    totalTemp += data.temperature;
    totalHumd += data.humidity;
  });

  /* Find average value */
  let avgTemp = totalTemp / arrData.length;
  let avgHumd = totalHumd / arrData.length;

  /* Find median temperature & humidity */
  let medTemp = 0;
  let medHumd = 0;
  let dataLen = arrData.length;
  let dataLenHalf = parseInt(dataLen / 2);

  if (dataLen % 2 === 0) {
    /* zero index array: median even data = data[n/2] +  data[n/2 -1] / 2*/
    medTemp =
      (arrData[dataLenHalf].temperature +
        arrData[dataLenHalf - 1].temperature) /
      2;
    medHumd =
      (arrData[dataLenHalf].humidity + arrData[dataLenHalf - 1].humidity) / 2;
  } else {
    medTemp = arrData[dataLenHalf - 1].temperature;
    medHumd = arrData[dataLenHalf - 1].humidity;
  }

  let resultJSON = {
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

  return resultJSON;
};

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
