import { FileModel } from "@plattar/plattar-api";
import hash from "object-hash";
import { RemoteRequest, RequestPayload } from "./remote-request";

export class ModelConverter {
    private readonly _attrHash: string[];

    private _model: string | null = null;
    public quality: number = 100;
    public output: "usdz" | "glb" = "glb";
    public server: "production" | "staging" | "dev" = "production";

    constructor() {
        this._attrHash = [];
    }

    public get model(): string | null {
        return this._model;
    }

    public set model(newModel: FileModel | string | undefined | null) {
        if (!newModel) {
            return;
        }

        if (newModel instanceof FileModel) {
            this._model = newModel.id;
            this._attrHash.push(hash.MD5(newModel.attributes));

            return;
        }

        this._model = newModel;
    }

    public get(): Promise<any> {
        return new Promise<any>((accept, reject) => {
            if (!this._model) {
                return reject(new Error("ModelConverter.get() - required .model attribute was not set"));
            }

            RemoteRequest.request(this._Payload).then(accept).catch(reject);
        });
    }

    private get _Payload(): RequestPayload {
        const load: RequestPayload = {
            options: {
                converter: "gltf_to_model",
                quality: this.quality,
                output: this.output,
                server: this.server
            },
            data: {
                model: this._model
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