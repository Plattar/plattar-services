<h3 align="center">
  <img src="graphics/logo.png?raw=true" alt="Plattar Logo" width="600">
</h3>

[![install size](https://packagephobia.com/badge?p=@plattar/plattar-services)](https://packagephobia.com/result?p=@plattar/plattar-services)
[![NPM](https://img.shields.io/npm/v/@plattar/plattar-services)](https://www.npmjs.com/package/@plattar/plattar-services)
[![License](https://img.shields.io/npm/l/@plattar/plattar-services)](https://www.npmjs.com/package/@plattar/plattar-services)

_plattar-services_ allows interfacing with Remote Plattar Services such as Configurators, File Converters and Asset Optimisers.

### _Quick Use_

-   ES2015 & ES2019 Builds via [jsDelivr](https://www.jsdelivr.com/)

```javascript
// Minified Version ES2015 & ES2019 (Latest)
https://cdn.jsdelivr.net/npm/@plattar/plattar-services/build/es2015/plattar-services.min.js
https://cdn.jsdelivr.net/npm/@plattar/plattar-services/build/es2019/plattar-services.min.js

// Standard Version ES2015 & ES2019 (Latest)
https://cdn.jsdelivr.net/npm/@plattar/plattar-services/build/es2015/plattar-services.js
https://cdn.jsdelivr.net/npm/@plattar/plattar-services/build/es2019/plattar-services.js
```

### _Installation_

-   Install using [npm](https://www.npmjs.com/package/@plattar/plattar-services)

```console
npm install @plattar/plattar-services
```

### _Configurator Example_

```js
const configurator = new PlattarServices.Configurator();

// add SceneProduct and ProductVariation mapping to our configurator
// if using plattar-api objects, the attributes will be hashed aswell
configurator.add("4e00bed9-27a2-182b-f4fa-05a5fdebf351", "568b63d0-3af6-11e9-8543-4d96b548a86f");
configurator.add("a4864c9d-399a-dc56-85fa-f4eea5aedd8c", "c8bc3d40-3af6-11e9-8e4f-fb10e27e3a41");
configurator.add("3bf0c608-731e-ebde-5081-b99de03e14ff", "1bf213e0-3af7-11e9-bb39-dbde969e139c");

// output configuration as USDZ - default is glb
configurator.output = "usdz";

// execute on staging objects - default is production
configurator.server = "staging";

configurator.get().then((value) => {
    // this says if the object is returned from cache or generated new
    console.log("cache_status - " + data.cache_status);
    // this is the full url to the final generated object
    console.log("filename - " + data.filename);
    // this is the request/file hash used for caching
    console.log("hash - " + data.hash);
}).catch((err) => {
    console.error(err);
});

```
