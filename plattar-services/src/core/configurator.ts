import { Product, ProductVariation, SceneModel, SceneProduct, Server } from "@plattar/plattar-api";
import hash from "object-hash";
import { RemoteRequest, RequestPayload } from "./remote-request";

export interface ConfiguratorMap {
    sceneproduct?: string | null;
    product?: string | null;
    productvariation?: string | null;
    scenemodel?: string | null;
}

export class Configurator {
    private readonly _maps: ConfiguratorMap[];
    private readonly _attrHash: string[];

    public quality: number = 100;
    public output: "usdz" | "glb" | "vto" = "glb";
    public server: "production" | "staging" | "review" | "dev" = "production";
    public retry: number = 0;

    constructor() {
        this._maps = [];
        this._attrHash = [];
    }

    public add(sceneProduct: SceneProduct | string | undefined | null = null, productVariation: ProductVariation | string | undefined | null = null): void {
        this.addSceneProduct(sceneProduct, productVariation);
    }

    public addSceneProduct(sceneProduct: SceneProduct | string | undefined | null = null, productVariation: ProductVariation | string | undefined | null = null): void {
        if (!sceneProduct) {
            throw new Error("Configurator.addSceneProduct() - sceneProduct input was null or undefined");
        }

        if (!productVariation) {
            throw new Error("Configurator.addSceneProduct() - productVariation input was null or undefined");
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

        throw new Error("Configurator.addSceneProduct() - mismatched instance types for inputs");
    }

    public addProduct(product: Product | string | undefined | null = null, productVariation: ProductVariation | string | undefined | null = null): void {
        if (!product) {
            throw new Error("Configurator.addProduct() - product input was null or undefined");
        }

        if (!productVariation) {
            throw new Error("Configurator.addProduct() - productVariation input was null or undefined");
        }

        const map: ConfiguratorMap = {
            productvariation: null,
            product: null
        };

        if ((product instanceof Product) && (productVariation instanceof ProductVariation)) {
            map.product = product.id;
            map.productvariation = productVariation.id;

            this._maps.push(map);

            return;
        }

        if ((typeof product === "string" || product instanceof String) && (typeof productVariation === "string" || productVariation instanceof String)) {
            map.product = <string>product;
            map.productvariation = <string>productVariation;

            this._maps.push(map);

            return;
        }

        throw new Error("Configurator.addProduct() - mismatched instance types for inputs");
    }

    public addModel(sceneModel: SceneModel | string | undefined | null = null): void {
        if (!sceneModel) {
            throw new Error("Configurator.addModel() - sceneModel input was null or undefined");
        }

        const map: ConfiguratorMap = {
            scenemodel: null
        };

        if (sceneModel instanceof SceneModel) {
            map.scenemodel = sceneModel.id;

            this._maps.push(map);

            return;
        }

        if (typeof sceneModel === "string") {
            map.scenemodel = <string>sceneModel;

            this._maps.push(map);

            return;
        }

        throw new Error("Configurator.addModel() - mismatched instance types for inputs");
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
                if (map.productvariation) {
                    promises.push(new ProductVariation(map.productvariation).get());
                }

                if (map.sceneproduct) {
                    promises.push(new SceneProduct(map.sceneproduct).get());
                }

                if (map.scenemodel) {
                    promises.push(new SceneModel(map.scenemodel).get());
                }

                if (map.product) {
                    promises.push(new Product(map.product).get());
                }
            });

            Promise.all(promises).then((values: any[]) => {
                values.forEach((value: any) => {
                    this._attrHash.push(value.attributes);
                });

                // reset server back
                Server.create(Server.match(oldOrigin));

                accept();
            }).catch(() => {
                // reset server back
                Server.create(Server.match(oldOrigin));

                reject(new Error("Configurator._CalculateHash() - unexpected error"));
            });
        });
    }

    private _GetPayload(): RequestPayload {
        const converter = this.output === "vto" ? "config_to_reality" : "config_to_model";

        const load: RequestPayload = {
            options: {
                converter: converter,
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