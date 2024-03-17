// return large json file with status 404
import { createServer } from 'http';
import { readFile } from 'fs/promises';
// large json file
const jsonFile = './large.json';
const server = createServer(async (req, res) => {
    try {
        const data = await readFile(jsonFile);
        // set status 404
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(data);
    } catch (err) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Not Found' }));
    }
});
server.listen(3000, () => console.log('Server is running on http://localhost:3000'));
