## StrapIO

module for working with socket.io with predefined rules. StrapIO will look at Role permission on each action.
StrapIO is looking for all roles which have access to the given contenttype and action type.

UPDATE v2:
You need to subscribe first before you receive any data. `socket.emit('subscribe', 'article')` article is the content-type.

## Installation

```bash
npm i strapio
```

`config/functions/bootstrap.js`

```js
process.nextTick(() => {
  strapi.StrapIO = new (require("strapio"))(strapi);
});
```

## Usage

### server

`api/<content-type>/controllers/<content-type>.js`

```js
module.exports = {
  async create(ctx) {
    let entity;
    if (ctx.is("multipart")) {
      const { data, files } = parseMultipartData(ctx);
      entity = await strapi.services.CONTENTTYPE.create(data, { files });
    } else {
      entity = await strapi.services.CONTENTTYPE.create(ctx.request.body);
    }
    strapi.StrapIO.emit(this,'create', entity);

    return sanitizeEntity(entity, { model: strapi.models.CONTENTTYPE });
  },

  async update(ctx) {
    const { id } = ctx.params;

    let entity;
    if (ctx.is("multipart")) {
      const { data, files } = parseMultipartData(ctx);
      entity = await strapi.services.CONTENTTYPE.update({ id }, data, {
        files,
      });
    } else {
      entity = await strapi.services.CONTENTTYPE.update({ id }, ctx.request.body);
    }

    strapi.StrapIO.emit(this,'update', entity);

    return sanitizeEntity(entity, { model: strapi.models.CONTENTTYPE });
  }
}
```

### Client

```js
const io = require("socket.io-client");

// Handshake required, token will be verified against strapi
const socket = io.connect(API_URL, {
  query: { token },
});

socket.emit('subscribe', 'article'); // article is the room which the client joins

socket.on("find", (data) => {
        console.log("article:", data);
  //do something
});
socket.on("update", (data) => {
  // do something
});
```

## Test

Currently tested with:

```js
{
    "strapi": "3.6.3",
    "strapi-plugin-users-permissions": "3.6.3"
}
```

## Plugin for strapi 

You can install strapio with a plugin `npm i strapi-plugin-socket-io`.

## Contribute

just do it over github or chat with me [@Discord](https://discord.gg/8gCdxzs)
