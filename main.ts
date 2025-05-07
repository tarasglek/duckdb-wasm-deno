
const DOWNLOAD_PREFIX = 'https://cdn.jsdelivr.net/npm/@duckdb/duckdb-wasm/dist/';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const MANUAL_BUNDLES = {
    mvp: {
        mainModule: "duckdb-mvp.wasm",
        mainWorker: "duckdb-node-blocking.cjs",
    },
};
const currentModuleDir = path.dirname(fileURLToPath(import.meta.url));

async function ensureFileDownloaded(fileName: string, downloadUrlPrefix: string, targetDir: string) {
    const filePath = path.join(targetDir, fileName);
    try {
        await fs.access(filePath);
    } catch (error) {
        console.log(`${fileName} not found. Downloading from ${downloadUrlPrefix}${fileName}...`);
        const response = await fetch(`${downloadUrlPrefix}${fileName}`);
        if (!response.ok || !response.body) {
            throw new Error(`Failed to download ${fileName}: ${response.statusText}`);
        }
        const fileBuffer = await response.arrayBuffer();
        await fs.writeFile(filePath, Buffer.from(fileBuffer));
        console.log(`${fileName} downloaded successfully to ${filePath}.`);
    }
}

const wasmFileName = MANUAL_BUNDLES.mvp.mainModule;
const workerFileName = MANUAL_BUNDLES.mvp.mainWorker;

await ensureFileDownloaded(wasmFileName, DOWNLOAD_PREFIX, currentModuleDir);
await ensureFileDownloaded(workerFileName, DOWNLOAD_PREFIX, currentModuleDir);

const workerModule = await import('./' + workerFileName);
const worker_blocking = workerModule.default;

const logger = new worker_blocking.ConsoleLogger();
const ddb = await worker_blocking.createDuckDB(MANUAL_BUNDLES, logger, worker_blocking.NODE_RUNTIME);

const absoluteWasmPath = path.join(currentModuleDir, MANUAL_BUNDLES.mvp.mainModule);
const absoluteWorkerPath = path.join(currentModuleDir, MANUAL_BUNDLES.mvp.mainWorker);
const inst = await ddb.instantiate(absoluteWasmPath, absoluteWorkerPath);
const db = await ddb.connect();
const mainTsAbsolutePath = fileURLToPath(import.meta.url);
ddb.registerFileURL(`main.ts`, mainTsAbsolutePath, worker_blocking.DuckDBDataProtocol.NODE_FS, false);
console.log("inst", await db.query("select md5(content) as md5 from read_text('main.ts')").toArray()[0].md5);
