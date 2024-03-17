// test memory usage with fetch
const testFetch = async () => {
    const url = 'http://localhost:3000/index.json';
    return fetch(url)
        .then(async res => {
            // this pattern will retain the response body in memory until garbage collection
            if (!res.ok) {
                throw new Error();
            }
            // For avoiding memory increasing, we need to consume the response body explicitly
            // const resText = await res.text();
            // throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText} ${resText}`);
            return res.json();
        });
}
const dumpCurrentMemoryUsage = () => {
    const used = process.memoryUsage().heapUsed / 1024 / 1024;
    console.log(`${Math.round(used * 100) / 100} MB`);
}

// iterate 1..1000
const test = async () => {
    for (let i = 0; i < 1000; i++) {
        try {
            await testFetch();
        } catch {
            /* nope */
        }
        dumpCurrentMemoryUsage();
    }
}

const startMemoryUsage = process.memoryUsage().heapUsed / 1024 / 1024;
await test();
const endMemoryUsage = process.memoryUsage().heapUsed / 1024 / 1024;
console.log(`Increased memory: ${Math.round(endMemoryUsage - startMemoryUsage)} MB`);
