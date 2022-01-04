/*  Helper Functions  */

const sendDataBuilder = (identity, entity) => {
  return Array.isArray(entity)
    ? JSON.stringify({ identity: identity.toLowerCase(), entity })
    : JSON.stringify({ identity: identity.toLowerCase(), ...entity });
};

const getUpServices = (strapi) => strapi.plugins["users-permissions"].services;

const sendMessageToSocket = (socket, message) => {
  socket.emit("message", message);
};

/* socket.io middleware */

const subscribe = (socket, next) => {
  socket.on("subscribe", (payload) => {
    if (payload !== undefined && payload !== "") {
      socket.join(payload.toLowerCase());
      sendMessageToSocket(
        socket,
        "Successfully joined: " + payload.toLowerCase()
      );
    }
  });
  next();
};

const handshake = (socket, next) => {
  if (socket.handshake.query && socket.handshake.query.token) {
    const upsServices = getUpServices(strapi);
    upsServices.jwt.verify(socket.handshake.query.token).then((user) => {
      sendMessageToSocket(socket, "handshake ok");
      upsServices.user
        .fetchAuthenticatedUser(user.id)
        .then((detail) => socket.join(detail.role.name));
    }).catch((err) => {
      sendMessageToSocket(socket, err.message);
      socket.disconnect()
    });
  } else {
    sendMessageToSocket(socket, "No token given.");
    socket.disconnect();
  }
  next();
};

/* socket.io actions */

const emit = (upsServices, io) => {
  return async (vm, action, entity) => {
    const plugins = await upsServices.userspermissions.getPlugins("en");
    const roles = await upsServices.userspermissions.getRoles();

    for (let i in roles) {
      const roleDetail = await upsServices.userspermissions.getRole(
        roles[i].id,
        plugins
      );

      if (
        !roleDetail.permissions.application.controllers[
          vm.identity.toLowerCase()
        ][action].enabled
      )
        return;

      // send to specific subscriber
      if (entity._id || entity.id) {
        io.sockets
          .in(`${vm.identity.toLowerCase()}_${entity._id || entity.id}`)
          .emit(action, sendDataBuilder(vm.identity, entity));
      }

      // send to all in collection room
      io.sockets
        .in(vm.identity.toLowerCase())
        .emit(action, sendDataBuilder(vm.identity, entity));
    }
  };
};

const StrapIO = (strapi, options) => {
  const { Pool } = require("pg");
  const { createAdapter } = require("@socket.io/postgres-adapter");
  const io = require("socket.io")(strapi.server, options);

  const pool = new Pool({
    user: strapi.config.database.connections.default.settings.username,
    host: strapi.config.database.connections.default.settings.host,
    database: strapi.config.database.connections.default.settings.database,
    password: strapi.config.database.connections.default.settings.password,
    port: strapi.config.database.connections.default.settings.port,
  });

  pool.query(`
    CREATE TABLE IF NOT EXISTS socket_io_attachments (
      id          bigserial UNIQUE,
      created_at  timestamptz DEFAULT NOW(),
      payload     bytea
    );
  `);

  // loading middleware ordered
  io.use(handshake);
  io.use(subscribe);
  io.adapter(createAdapter(pool));

  // debugging
  if(process.env.DEBUG == "strapio" || process.env.DEBUG == "*") {
    io.on("connection", (socket) => {
      console.debug("Connected Socket:", socket.id);
      socket.on("disconnecting", (reason) => {
        console.debug("Socket Disconnect:", socket.id, socket.rooms);
      });
    });
  }
  

  return {
    emit: emit(getUpServices(strapi), io),
    emitRaw: (room, event, data) => io.sockets.in(room).emit(event, data),
  };
};

module.exports = StrapIO;
