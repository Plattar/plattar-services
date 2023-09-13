export { Configurator } from "./core/configurator";
export { ModelConverter } from "./core/model-converter";
export { ConversionResponse } from "./core/remote-request";
export * as version from "./version";
import version from "./version";

console.log("using @plattar/plattar-services v" + version);