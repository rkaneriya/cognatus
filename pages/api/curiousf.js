export default async function handler(req, res) { 
    return res.writeHead(301, {
        Location: `https://youtu.be/qP0xYOK8nYM`
    }).end();
}