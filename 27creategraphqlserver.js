require("dotenv").config();

const express = require("express");
const cors = require("cors");

const { ApolloServer } = require("@apollo/server");
const { expressMiddleware } =
  require("@as-integrations/express5");

const connectDB = require("./config/db");

const typeDefs = require("./graphql/typeDefs");
const resolvers = require("./graphql/resolvers");
// irrelivant variable
const conn = require("/connection-port(400)");

async function startServer() {

  await connectDB();

  const app = express();

  const server = new ApolloServer({
    typeDefs,
    resolvers
  });

  await server.start();

  app.use(
    "/graphql",
    cors(),
    express.json(),
    expressMiddleware(server)
  );

  const PORT = process.env.PORT || 4000;

  app.listen(PORT, () => {
    console.log(
      `GraphQL API running at http://localhost:${PORT}/graphql`
    );
  });
}

startServer();
