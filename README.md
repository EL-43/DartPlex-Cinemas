# Dependencies
if there's no database called dartplex, create it with sql first:

> CREATE DATABASE dartplex;

run the sync.js script to sync existing .json data with the database

> node sync.js

finally, start the server with nodemon

> node server.js
> OR
> nodemon
