import { ProductVariation, SceneProduct, Server } from "@plattar/plattar-api";
import hash from "object-hash";
import { RemoteRequest, RequestPayload } from "./remote-request";

export interface ConfiguratorMap {
    sceneproduct: string | null;
    productvariation: string | null
}

export class Configurator {
    private readonly _maps: ConfiguratorMap[];
    private readonly _attrHash: string[];

    public quality: number = 100;
    public output: "usdz" | "glb" | "vto" = "glb";
    public server: "production" | "staging" | "dev" = "production";
    public retry: number = 0;

    constructor() {
        this._maps = [];
        this._attrHash = [];
    }

    public add(sceneProduct: SceneProduct | string | undefined | null = null, productVariation: ProductVariation | string | undefined | null = null): void {
        if (!sceneProduct) {
            throw new Error("Configurator.add() - sceneProduct input was null or undefined");
        }

        if (!productVariation) {
            throw new Error("Configurator.add() - productVariation input was null or undefined");
        }

        const map: ConfiguratorMap = {
            sceneproduct: null,
            productvariation: null
        };

        if ((sceneProduct instanceof SceneProduct) && (productVariation instanceof ProductVariation)) {
            map.sceneproduct = sceneProduct.id;
            map.productvariation = productVariation.id;

            this._maps.push(map);

            return;
        }

        if ((typeof sceneProduct === "string" || sceneProduct instanceof String) && (typeof productVariation === "string" || productVariation instanceof String)) {
            map.sceneproduct = <string>sceneProduct;
            map.productvariation = <string>productVariation;

            this._maps.push(map);

            return;
        }

        throw new Error("Configurator.add() - mismatched instance types for inputs");
    }

    public get(): Promise<any> {
        return new Promise<any>((accept, reject) => {
            this._CalculateHash().then(() => {
                RemoteRequest.request(this._GetPayload(), (this.retry < 0 ? 0 : this.retry)).then(accept).catch(reject);
            }).catch((_err) => {
                reject(new Error("Configurator.get() - one of the objects does not exist in Plattar API"));
            });
        });
    }

    private _CalculateHash(): Promise<void> {
        return new Promise<void>((accept, reject) => {
            const promises: any[] = [];

            const oldOrigin: string = Server.default().originLocation.type;

            Server.create(Server.match(this.server));

            this._maps.forEach((map) => {
                if (map.productvariation !== null) {
                    promises.push(new ProductVariation(map.productvariation).get());
                }

                if (map.sceneproduct !== null) {
                    promises.push(new SceneProduct(map.sceneproduct).get());
                }
            });

            Promise.all(promises).then((values: any[]) => {
                values.forEach((value: any) => {
                    this._attrHash.push(value.attributes);
                });

                // reset server back
                Server.create(Server.match(oldOrigin));

                accept();
            }).catch(reject);
        });
    }

    private _GetPayload(): RequestPayload {
        const load: RequestPayload = {
            options: {
                converter: (this.output === "vto" ? "config_to_model" : "config_to_reality"),
                quality: this.quality,
                output: this.output,
                server: this.server
            },
            data: {
                maps: this._maps
            }
        }

        if (this._attrHash.length > 0) {
            load.options.hash = hash.MD5(this._attrHash) + hash.MD5(load);
        }
        else {
            load.options.hash = hash.MD5(load);
        }

        return load;
    }
}