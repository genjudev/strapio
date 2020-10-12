## StrapIO

module for working with socket.io with predefined rules. StrapIO will look at Role permission on each action.

## Installation
```bash
npm i strapio
```

`config/functions/bootstrap.js`
```js
process.nextTick(() => {
    strapi.StrapIO = new (require('strapio'))(strapi);
});
```

## Usage

### server
`api/<content-type>/controllers/<content-type.js`
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
    strapi.StrapIO.emit(this, ctx,'create', entity, 'contenttype');

    return sanitizeEntity(entity, { model: strapi.models.CONTENTTYPE });
  }

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
    strapi.StrapIO.emit(this, ctx,'update', entity, 'contenttype');

    return sanitizeEntity(entity, { model: strapi.models.CONTENTTYPE });
  }
}
```
### Client

```js
const io = require('socket.io-client');

// Handshake required, token will be verified against strapi
const socket = io.connect(API_URL, {
    query: { token }
});

socket.on('create', data => {
    //do something
});
socket.on('update', data => {
    // do something
});
```

## Test
Currently tested with:
```js
{
    "strapi": "3.1.6",
    "strapi-plugin-users-permissions": "3.1.6"
}
```

## Middleware ...coming

Im working on an middleware wrapper. Im not sure how. :)

## Contribute
just do it over github or chat with me [@Discord](https://discord.gg/8gCdxzs)

## TODO
1. validation
2. Error handling
