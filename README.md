# helcity-bikeapp

# Preparations

Use ```git clone``` to clone this repository to your local machine.

Change directories to the back and front directories and install nodemodules with ```npm install```

## Database can be used locally or remotely:

- To use locally, follow [mongodb community server installation guide](https://www.mongodb.com/docs/manual/administration/install-community/). When the server is set up and running, type ```mongosh``` to console and create database helcity with ```use helcity```.

- To use remotely, ask for .env file through email, and change the mongoose uri guided by comments in the back/index.js file. Remote database has a limit of 512MB due to free tier, and has been occupied with half of that (file ```2021-06.csv```), so importing is somewhat limited.
