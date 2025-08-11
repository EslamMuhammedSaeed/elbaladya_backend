const express = require("express");
const { ApolloServer } = require("apollo-server-express");
const {
  ApolloServerPluginLandingPageLocalDefault,
} = require("apollo-server-core");
const { makeExecutableSchema } = require("@graphql-tools/schema");
const resolvers = require("./Graphql/resolvers");
const typeDefs = require("./Graphql/typeDefs");
const { graphqlUploadExpress } = require("graphql-upload");
const path = require("path");
const cors = require("cors");
const { createAuthContext } = require("./Middlewares/auth");
const { authDirectiveTransformer, adminDirectiveTransformer } = require("./Middlewares/directives");

const app = express();

// Create the schema
let schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

// Apply directive transformers
schema = authDirectiveTransformer(schema);
schema = adminDirectiveTransformer(schema);

// Create Apollo Server instance
const server = new ApolloServer({
  schema,
  context: async ({ req }) => {
    return await createAuthContext(req);
  },
  plugins: [ApolloServerPluginLandingPageLocalDefault()],
});

// Configure CORS
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production" ? process.env.FRONTEND_URL : "*",
    credentials: true,
  })
);

async function startServer() {
  try {
    await server.start();

    // Configure middleware
    app.use("/public", express.static(path.join(__dirname, "public")));
    app.use(graphqlUploadExpress());
    server.applyMiddleware({ app });

    // Redirect root to GraphQL playground
    app.get("/", (_, res) => {
      res.redirect("/graphql");
    });

    // Start HTTP server
    const PORT = process.env.PORT || 4000;
    app.listen(PORT, () => {
      console.log(
        `🚀 HTTP server running at http://localhost:${PORT}${server.graphqlPath}`
      );
    });
  } catch (error) {
    console.error("❌ Error starting server:", error);
    process.exit(1);
  }
}

startServer();
