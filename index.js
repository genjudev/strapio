class StrapIO {
    constructor(strapi) {
      this.strapi = strapi;
      this.io = require("socket.io")(this.strapi.server);
  
      this.io.use((socket, next) => {
        if (socket.handshake.query && socket.handshake.query.token) {
          this._upServices()
            .jwt.verify(socket.handshake.query.token)
            .then((user) => {
                socket.emit('message', 'hey');
              this._upServices()
                .user.fetchAuthenticatedUser(user.id)
                .then((detail) => socket.join(detail.role.name));
            });
        }
        next();
      });
      
    }
  
    async emit(vm, ctx, action, entity) {
      const plugins = await this._upServices().userspermissions.getPlugins("en");
      const role = await this._upServices().userspermissions.getRole(
        ctx.state.user.role.id,
        plugins
      );
      if (
        role.permissions.application.controllers[vm.identity.toLowerCase()][
          action
        ].enabled
      ) {
        this.io.sockets
          .in(ctx.state.user.role.name)
          .emit(
            action,
            JSON.stringify({ identity: vm.identity.toLowerCase(), ...entity })
          );
      }
    }
  
    _upServices() {
      return this.strapi.plugins["users-permissions"].services;
    }
  }
  
  module.exports = StrapIO;
  