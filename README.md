# Homebl - Server

## Setup

Complete the following steps to start a new server:

1. Clone this repository to your local machine `git clone URL NEW-PROJECTS-NAME`
2. `cd` into the cloned repository
3. Make a fresh start of the git history for this project with `rm -rf .git && git init`
4. Install the node dependencies `npm install`
5. Install Developer Dependencies `npm install chai postgrator-cli@3.2.0 mocha supertest`
6. Force `pg@7.12.x` for migration stability `npm install pg@7.12.x`
7. Create database `createdb DATABASENAME`
8. Run migrate script to create tables `npm run migrate` for tests `npm run migrate:test`
9. Seed tables `psql -U -d -f ./seeds/seed.homebl_tables.sql`
10. Update database url in the `.env`

## Scripts

Start the application `npm start`

Start nodemon for the application `npm run dev`

Run the tests `npm test`

## Deploying

When your new project is ready for deployment, add a new Heroku application with `heroku create`. This will make a new git remote called "heroku" and you can then `npm run deploy` which will push to this remote's master branch.
