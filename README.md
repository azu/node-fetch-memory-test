# Node.js `fetch()` garbage collection test

Node.js `fetch()` will cause memory leak-like behavior if the response body is not consumed or cancelled.

```js
const testFetch = async () => {
    const url = 'http://localhost:3000/index.json';
    return fetch(url)
        .then(async res => {
            // This pattern does not consume or cancel the response body
            // It increase memory when the response status is not 2xx
            if (!res.ok) {
                throw new Error();
            }
            return res.json();
        });
}
```

This increased memory will be released by garbage collection, but it is not deterministic and may cause stalls or deadlocks.

## Test

```shell
$ npm start # start mock server
$ npm test # run test

6.26 MB
6.26 MB
...
41.05 MB
41.12 MB
Increased memory: 34 MB
```

## Fix

Consume or cancel the response body to free up memory.

```js
const testFetch = async () => {
    const url = 'http://localhost:3000/index.json';
    return fetch(url)
        .then(async res => {
            if (!res.ok) {
                for await (const chunk of res.body) {
                    // consume body to free up memory
                }
                throw new Error();
            }
            return res.json();
        });
}
```

or

```js
const testFetch = async () => {
    const url = 'http://localhost:3000/index.json';
    return fetch(url)
        .then(async res => {
            if (!res.ok) {
                const resText = await res.text();
                throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText} ${resText}`);
            }
            return res.json();
        });
}
```

## Details

See https://github.com/nodejs/undici?tab=readme-ov-file#garbage-collection

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

    However, if you want to get only headers, it might be better to use HEAD request method. Usage of this method will obviate the need for consumption or cancelling of the response body. See MDN - HTTP - HTTP request methods - HEAD for more details.
    
    const headers = await fetch(url, { method: 'HEAD' })
    .then(res => res.headers)

