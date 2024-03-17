# Node.js `fetch()` memory leak test

Node.js `fetch()` will cause memory leak if the response body is not consumed or cancelled.

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

## Test

```shell
$ npm start # start mock server
$ npm test # run test

6.26 MB
6.26 MB
...
41.05 MB
41.12 MB
```

## Details

    The Fetch Standard allows users to skip consuming the response body by relying on garbage collection to release connection resources. Undici does not do the same. Therefore, it is important to always either consume or cancel the response body.
    
    Garbage collection in Node is less aggressive and deterministic (due to the lack of clear idle periods that browsers have through the rendering refresh rate) which means that leaving the release of connection resources to the garbage collector can lead to excessive connection usage, reduced performance (due to less connection re-use), and even stalls or deadlocks when running out of connections.
    
    ```javascript
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
    ```

    However, if you want to get only headers, it might be better to use HEAD request method. Usage of this method will obviate the need for consumption or cancelling of the response body. See MDN - HTTP - HTTP request methods - HEAD for more details.
    
    ```
    const headers = await fetch(url, { method: 'HEAD' })
    .then(res => res.headers)
    ```

See https://github.com/nodejs/undici?tab=readme-ov-file#garbage-collection
