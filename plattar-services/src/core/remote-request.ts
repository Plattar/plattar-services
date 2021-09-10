import fetch from "node-fetch";

export interface RequestPayload {
    options: {
        converter: "config_to_model" | "gltf_to_model",
        quality: number,
        output: "usdz" | "glb",
        server: "production" | "staging" | "dev",
        hash?: string
    };
    data: any;
}

/**
 * This is used by the core types to perform remote requests
 */
export class RemoteRequest {
    public static request(payload: RequestPayload, retry: number = 0): Promise<any> {
        return new Promise<any>((accept, reject) => {
            if (retry >= 0) {
                RemoteRequest._send(payload).then(accept).catch((err) => {
                    const newretry: number = retry - 1;

                    if (newretry < 0) {
                        return reject(err);
                    }

                    console.error("RemoteRequest.request() - retry number " + newretry);
                    console.error(err);

                    setTimeout(() => {
                        RemoteRequest.request(payload, newretry).then(accept).catch(reject);
                    }, 500);
                });
            }
            else {
                return reject(new Error("RemoteRequest.request() - attempted all retries without success"));
            }
        });
    }

    private static _send(payload: RequestPayload): Promise<any> {
        return new Promise<any>((accept, reject) => {
            const endpoint: string = payload.options.server === "dev" ? "http://localhost:9000/2015-03-31/functions/function/invocations" : "https://3gbnq7wuw2.execute-api.ap-southeast-2.amazonaws.com/main/xrutils";

            const reqopts = {
                method: "POST",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            };

            fetch(endpoint, reqopts)
                .then((res) => {
                    if (res.ok) {
                        try {
                            return res.json();
                        }
                        catch (err) {
                            return new Error("RemoteRequest.request() - critical error occured, cannot proceed");
                        }
                    }

                    return new Error("RemoteRequest.request() - unexpected error occured, cannot proceed. error message is " + res.statusText);
                })
                .then((json: any) => {
                    if (json instanceof Error) {
                        reject(json);
                    }
                    else {
                        accept(json);
                    }
                });
        });
    }
}