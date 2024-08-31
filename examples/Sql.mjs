import assert from "assert";
import tedious from "tedious";
import fs from "fs";
import EnvParser from "../lib/EnvParser.mjs";
import { EventEmitter } from "events";
import test from 'node:test';

const File = fs.promises;
const Connection = tedious.Connection;
const Request = tedious.Request;
const TYPES = tedious.TYPES;

const data = await File.readFile(".env", "utf-8");
const env = Object.assign(process.env, EnvParser.parse(data));
class SqlRequestListener {
    constructor(request, resolve, reject){
        request.on("columnMetadata", this.columnMetadata.bind(this));
        request.on("prepared", this.prepared.bind(this));
        request.on("error", this.error.bind(this));
        request.on("requestCompleted", this.requestCompleted.bind(this));
        request.on("row", this.row.bind(this));
        request.on("done", this.done.bind(this));
        this.resolve = resolve;
        this.reject = reject;
    }
    columnMetadata(columns){
        console.log("columnMetadata", columns);
    }
    prepared(){}
    error(err){
        console.log("Sql Error: ", err);
        this.reject(err);
    }
    row(columns){
        console.log("row", columns);
    }
    done(rowCount, more, rows){
        console.log("done", rowCount, more, rows);
        this.resolve({rowCount, more, rows});
    }
    requestCompleted(){
        console.log("Done exeucting the request. You can make another now.");
        this.resolve();
    }

}
class SqlDriver extends EventEmitter{
    constructor(config){
        super();
        this.config = config;
        this.conn = null;
    }
    close(){
        console.log("closing");
        this.conn.close();
    }
    async connect(){
        return new Promise(function(resolve, reject){
            this.conn = new Connection(this.config);
            this.conn.on("end", ()=>{
                console.log("ending");
            });
            this.conn.on("error", err => {
                console.log("connection error", err);
                reject(err);
            });
            this.conn.on("debug", message => {
                console.info("debuggin", message);
            });
            this.conn.on("infoMessage", err => {
                console.info(err);
            });
            this.conn.on("errorMessage", err => {
                console.error("error message", err);
            });
            this.conn.on("connect", function(err) {
                console.log("connected callback", err);
                if(err) reject(err);
                else resolve(this.conn);
            }.bind(this));
            this.conn.connect();
        }.bind(this));
    }
    prepare(request){
        return this.conn.prepare(request);
    }
    async exec(statement){
        return new Promise(function(resolve, reject){
            const request = new Request(statement, (err, rowCount, rows)=>{
                if(err) reject(err)
                else resolve({rows, rowCount})
            });
            const listener = new SqlRequestListener(request, resolve, reject);
            this.conn.execSql(request);
        }.bind(this));
    }
    async execRequest(request, params = {}){
        return new Promise(function(resolve, reject){
            const listener = new SqlRequestListener(request, resolve, reject);
            
            this.conn.prepare(request);
            request.on("prepared", function(){
                this.conn.execute(request, params);
            }.bind(this));
        }.bind(this));
    }
}

const config = {
    server: env.SQL_HOST,
    options: {
        trustServerCertificate: true
    },
    authentication: {
        type: env.SQL_AUTH_TYPE,
        options: {
            userName: env.SQL_USERNAME,
            password: env.SQL_PASSWORD
        }
    }
}

test("SQL Server", t=>{
    t.test("Get some data", async ()=>{
        const sql = new SqlDriver(config);
        const params = {
            name: "TestDB"
        };
        const statement = "DROP DATABASE IF EXISTS @name; CREATE DATABASE @name;";
        const request = new Request(statement, (err, rowCount, rows)=>{
            console.log("on requested");
            console.log(err, rowCount, rows);
        });
        const connection = await sql.connect();
        assert.doesNotReject(await sql.execRequest(request, params));
        //sql.close();
    });
});