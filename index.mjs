// test memory lean
/*
Garbage Collection

    https://fetch.spec.whatwg.org/#garbage-collection

The Fetch Standard allows users to skip consuming the response body by relying on garbage collection to release connection resources. Undici does not do the same. Therefore, it is important to always either consume or cancel the response body.

Garbage collection in Node is less aggressive and deterministic (due to the lack of clear idle periods that browsers have through the rendering refresh rate) which means that leaving the release of connection resources to the garbage collector can lead to excessive connection usage, reduced performance (due to less connection re-use), and even stalls or deadlocks when running out of connections.

// Do
const headers = await fetch(url)
  .then(async res => {
    for await (const chunk of res.body) {
      // force consumption of body
    }
    return res.headers
  })

// Do not
const headers = await fetch(url)
  .then(res => res.headers)
 */

const testFetch = async () => {
    const url = 'http://localhost:3000/index.json';
    return fetch(url)
        .then(async res => {
            if (!res.ok) {
                // consume body to release connection resources
                // for await (const chunk of res.body) {
                //     // force consumption of body
                // }
                throw new Error();
            }
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

await test();
