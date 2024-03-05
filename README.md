## tech used
- typescript
- express
- node js
- graphQL
- mongoDB 
- mongoose

## route provided via the API
- /login : POST => {username,password}
- /signup : POST => {username,password}
- /graphql : POST => {
    jwt -> if not provided in the cookies ,
    query -> for graphql to work with
   }

## setup steps
install dependencies
`npm i`

### create mongodb database
- install it and run it in your local machine if you want to change url you can find it in `app.ts`
- create a DB named `MinecraftNotesDB`

## run 
`npx ts-node app.ts`

you can use the frontend included in this repo but it's outdated use the [new version](https://github.com/Mouaadgames/Minecraft-note-app)  
