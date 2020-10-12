## StrapIO

module for working with socket.io with predefined rules. StrapIO will look at Role permission on each action.

### Installation
```bash
npm i strapio
```

`config/functions/bootstrap.js`
```js
process.nextTick(() => {
strapi.StrapIO = new (require('strapio'))(strapi);
  });
```

### Usage

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
    strapi.StrapIO.emit(this, ctx,'create', entity, 'transport');

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
    strapi.StrapIO.emit(this, ctx,'update', entity, 'transport');

    return sanitizeEntity(entity, { model: strapi.models.CONTENTTYPE });
  },
```

### Test
Currently tested with:
```js
{
    "strapi": "3.1.6",
    "strapi-plugin-users-permissions": "3.1.6"
}
```

### Middleware ...coming

Currently im working on an middleware wrapper for StrapIO. Im not currently sure how. :)

### Contribute
just do it over github or chat with me [@Discord](https://discord.gg/8gCdxzs)