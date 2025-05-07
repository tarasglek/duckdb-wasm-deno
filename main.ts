import * as duckdb from '@duckdb/duckdb-wasm';
import worker_blocking from './duckdb-node-blocking.cjs';
// import duckdb_wasm from '@duckdb/duckdb-wasm/dist/duckdb-mvp.wasm?url';
// import mvp_worker from '@duckdb/duckdb-wasm/dist/duckdb-browser-mvp.worker.js?url';
// import duckdb_wasm_eh from '@duckdb/duckdb-wasm/dist/duckdb-eh.wasm?url';
// import eh_worker from '@duckdb/duckdb-wasm/dist/duckdb-browser-eh.worker.js?url';

const MANUAL_BUNDLES = {
    mvp: {
        mainModule: "duckdb-mvp.wasm",
        mainWorker: "duckdb-node-blocking.cjs",
    },
};
// Select a bundle based on browser checks
const bundle = await duckdb.selectBundle(MANUAL_BUNDLES);
// Instantiate the asynchronus version of DuckDB-wasm
// const worker = new worker_blocking.Worker(bundle.mainWorker!);
// const worker = new worker_blocking.create(bundle.mainWorker!);
// console.log(worker_blocking.DEFAULT_RUNTIME);
// console.log(duckdb);
const logger = new duckdb.ConsoleLogger;
// console.log("worker_blocking", worker_blocking.NODE_RUNTIME)
const ddb = await worker_blocking.createDuckDB(MANUAL_BUNDLES, logger, worker_blocking.NODE_RUNTIME);
const inst = await ddb.instantiate(bundle.mainModule, bundle.mainWorker);
const db = await ddb.connect();
console.log("inst", await db.query("SELECT 1").toArray());
