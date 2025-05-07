
const DOWNLOAD_PREFIX = 'https://cdn.jsdelivr.net/npm/@duckdb/duckdb-wasm/dist/';
import worker_blocking from './duckdb-node-blocking.cjs';

const MANUAL_BUNDLES = {
    mvp: {
        mainModule: "duckdb-mvp.wasm",
        mainWorker: "duckdb-node-blocking.cjs",
    },
};
const logger = new  worker_blocking.ConsoleLogger();
// console.log("worker_blocking", worker_blocking.NODE_RUNTIME)
const ddb = await worker_blocking.createDuckDB(MANUAL_BUNDLES, logger, worker_blocking.NODE_RUNTIME);
const inst = await ddb.instantiate(MANUAL_BUNDLES.mvp.mainModule, MANUAL_BUNDLES.mvp.mainWorker);
const db = await ddb.connect();
ddb.registerFileURL(`main.ts`, 'main.ts', worker_blocking.DuckDBDataProtocol.NODE_FS, false);
console.log("inst", await db.query("select md5(content) as md5 from read_text('main.ts')").toArray()[0].md5);
