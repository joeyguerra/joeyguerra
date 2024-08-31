import https from "https";
import http from "http";
import {URL} from "url";

class HttpAsync {
    static async get(url, headers = {
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Safari/605.1.15"
    }){
        return new Promise((resolve, reject)=>{
            const parsed = new URL(url);
            const protocol = {https, http}[parsed.protocol.replace(":", "")];
            const options = {
                hostname: parsed.host,
                port: parsed.port,
                path: parsed.pathname,
                method: "GET",
                headers: headers
            };
            const body = [];
            const req = protocol.request(options, res => {
                res.setEncoding("utf8");
                res.on("data", chunk => body.push(chunk));
                res.on("end", ()=> resolve(body.join("\n")));
            });
            req.on("error", err => reject(err));
            req.end();
        });
    }
}
export default HttpAsync;