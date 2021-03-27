## Sensor Aggregation

In this repo, you can find a simple and minimalist API endpoints used to aggregate sensor data from `sensor_data.json` by room area and by day. There are three endpoints in total:

- `/room/{area}`
- `/room/{area}/date`
- `/room/{area}/date/{day}/{month}/{year}`

The first endpoint returns an aggregated sensor data for a specific room area. The second one returns the list of available date for the day aggregation. The last endpoint returns an aggregated sensor data for a specific room area in a specific day.

## Guide To Use

To use and test this program on your own local machine, do these steps:

- Clone this repository.
- Go to the main folder, then run `npm install` for install all the dependencies.
- Open `sensor_data.json` on `data` directory. Select all the data using `ctrl + a`, then delete. After that, write an empty array `[]` in it.
- On the terminal, run `nodemon app.js`. The express server will start on port 3000.
- Open up Postman, set request to GET. Then hit the API endpoint.

## Copyright

&copy; Muhammad Arifin
