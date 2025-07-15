// const express = require("express");
// const { ApolloServer } = require("apollo-server-express");
// const {
//   ApolloServerPluginLandingPageLocalDefault,
// } = require("apollo-server-core");
// const { makeExecutableSchema } = require("@graphql-tools/schema");
// const { applyMiddleware } = require("graphql-middleware");
// const resolvers = require("./Graphql/resolvers");
// const typeDefs = require("./Graphql/typeDefs");
// const { graphqlUploadExpress } = require("graphql-upload");
// const https = require("https");
// const fs = require("fs");
// const path = require("path");
// const app = express();
// const cors = require("cors");

// // Create the schema
// const schema = applyMiddleware(
//   makeExecutableSchema({
//     typeDefs,
//     resolvers,
//   })
// );

// // SSL configuration
// const sslOptions = {
//   key: fs.readFileSync(path.join(__dirname, "cert", "key.pem")),
//   cert: fs.readFileSync(path.join(__dirname, "cert", "cert.pem")),
// };

// // Create Apollo Server instance
// const server = new ApolloServer({
//   schema,
//   context: ({ req }) => {
//     return {
//       req,
//     };
//   },
//   plugins: [ApolloServerPluginLandingPageLocalDefault()],
// });

// // Configure CORS
// app.use(
//   cors({
//     origin:
//       process.env.NODE_ENV === "production" ? process.env.FRONTEND_URL : "*",
//     credentials: true,
//   })
// );

// async function startServer() {
//   try {
//     // Start Apollo Server
//     await server.start();

//     // Configure middleware
//     app.use("/public", express.static(path.join(__dirname, "public")));
//     app.use(graphqlUploadExpress());
//     server.applyMiddleware({ app });

//     // Redirect root to GraphQL playground
//     app.get("/", (_, res) => {
//       res.redirect("/graphql");
//     });

//     // Create HTTPS server
//     const httpsServer = https.createServer(sslOptions, app);

//     // Start the server
//     const PORT = process.env.PORT || 4000;
//     httpsServer.listen(PORT, () => {
//       console.log(
//         `🚀 Server running at https://localhost:${PORT}${server.graphqlPath}`
//       );
//       console.log(`🔒 SSL enabled`);
//     });

//     // Optional: HTTP to HTTPS redirect
//     const http = require("http");
//     http
//       .createServer((req, res) => {
//         res.writeHead(301, {
//           Location: `https://${req.headers.host}${req.url}`,
//         });
//         res.end();
//       })
//       .listen(80);
//   } catch (error) {
//     console.error("Error starting server:", error);
//     process.exit(1);
//   }
// }

// startServer();
const express = require("express");
const { ApolloServer } = require("apollo-server-express");
const {
  ApolloServerPluginLandingPageLocalDefault,
} = require("apollo-server-core");
const { makeExecutableSchema } = require("@graphql-tools/schema");
const { applyMiddleware } = require("graphql-middleware");
const resolvers = require("./Graphql/resolvers");
const typeDefs = require("./Graphql/typeDefs");
const { graphqlUploadExpress } = require("graphql-upload");
const path = require("path");
const cors = require("cors");

const app = express();

// Create the schema
const schema = applyMiddleware(
  makeExecutableSchema({
    typeDefs,
    resolvers,
  })
);

// Create Apollo Server instance
const server = new ApolloServer({
  schema,
  context: ({ req }) => ({ req }),
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
