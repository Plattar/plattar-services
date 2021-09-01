import fetch from "node-fetch";

export class RemoteResponse {
    data: any;
}

export interface RequestPayload {
    options: {
        converter: "config_to_model",
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
    public static request(payload: RequestPayload): Promise<RemoteResponse> {
        return new Promise<RemoteResponse>((accept, reject) => {
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
                        accept({
                            data: json
                        });
                    }
                });
        });
    }
}