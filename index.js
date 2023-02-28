import Fastify from "fastify";
import fastifyCookie from "@fastify/cookie";
import fastifyFormBody from "@fastify/formbody";
import jwt from "jsonwebtoken";
import { indexPage, loginPage } from "./html.js";

const fastify = Fastify({
  logger: true,
});

fastify.register(fastifyCookie);
fastify.register(fastifyFormBody);

const users = new Map([
  ["john", "1234567890"],
  ["jane", "0987654321"],
]);

const secret = "1234567890";

fastify.get("/", async (request, reply) => {
  const accessToken = request.cookies.access_token;

  if (accessToken) {
    try {
      const username = jwt.verify(accessToken, secret).username;
      reply.type("text/html").send(indexPage(username));
    } catch (error) {
      reply.clearCookie("access_token");
      reply.redirect("/login");
    }
  }

  reply.redirect("/login");
});

fastify.get("/login", async (request, reply) => {
  const access_token = request.cookies.access_token;

  if (access_token && jwt.verify(access_token, secret)) {
    reply.redirect("/");
  } else {
    reply.type("text/html").send(loginPage());
  }
});

fastify.post("/login", async (request, reply) => {
  const { username, password } = request.body;

  if (users.get(username) === password) {
    const token = jwt.sign({ username }, secret);

    reply.setCookie("access_token", token);
    reply.redirect("/");
  } else {
    reply.redirect("/login");
  }
});

fastify.get("/logout", async (request, reply) => {
  const access_token = request.cookies.access_token;

  if (access_token) {
    reply.clearCookie("access_token");
  }

  reply.redirect("/");
});

// Starts the server.
const start = async () => {
  try {
    await fastify.listen({ port: 3000 });
  } catch (error) {
    fastify.log.error(error);
    process.exit(1);
  }
};

start();
