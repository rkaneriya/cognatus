export default async function handler(req, res) { 
    return res.writeHead(301, {
        Location: `https://youtu.be/K8wStaoi88c`
    }).end();
}