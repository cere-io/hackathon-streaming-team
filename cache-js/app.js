const fs = require('fs');
const path = require('path');
const cors = require('cors');
const DscSdk = require('@cere-ddc-sdk/ddc-client');
const express = require('express');

(async () => {
    if (!fs.existsSync(path.join(__dirname, 'files'))) {
        fs.mkdirSync(path.join(__dirname, 'files'))
    }

    const ddcClient = await DscSdk.DdcClient.buildAndConnect(
        {clusterAddress: 0, smartContract: DscSdk.DEVNET, fileOptions: {pieceSizeInBytes: 512 * 1024, parallel: 4}},
        process.env.SECRET_PHRASE || ''
    );

    const readFileDescriptor = async (cid, bucketId) => {
        const fileDescriptor = await ddcClient.read(DscSdk.DdcUri.build(bucketId, cid, DscSdk.IPIECE));
        return fileDescriptor.links;
    }

    const readFileChunk = async (chunkCid, bucketId) => {
        const chunk = await ddcClient.caStorage.read(bucketId, chunkCid);
        return chunk.data;
    }

    const readFileAndSave = async (cid, bucketId, filePath) => {
        const chunks = await readFileDescriptor(cid, bucketId);
        fs.writeFileSync(filePath, new Uint8Array(0));
        for (const chunk of chunks) {
            const chunkData = await readFileChunk(chunk.cid, bucketId);
            fs.appendFileSync(filePath, chunkData)
        }
    }

    const respondWithFileStream = (res, filePath, reqHeaders) => {
        const range = reqHeaders.range;
        const CHUNK_SIZE = 10 ** 6;
        const fileSize = fs.statSync(filePath).size;
        const start = Number(range.replace(/\D/g, ""));
        const end = Math.min(start + CHUNK_SIZE, fileSize - 1);
        const contentLength = end - start + 1;
        const headers = {
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': contentLength,
            'Content-Type': "video/mp4",
        };
        res.writeHead(206, headers);
        const videoStream = fs.createReadStream(filePath, {start, end});
        videoStream.pipe(res);
    }

    const app = express();
    app.use(cors());
    app.get('/:bucketId/:cid', async (req, res) => {
        const {bucketId, cid} = req.params;
        const filePath = path.join(__dirname, 'files', `${bucketId}-${cid}`);
        if (fs.existsSync(filePath)) {
            respondWithFileStream(res, filePath, req.headers);
            return;
        }
        await readFileAndSave(cid, BigInt(bucketId), filePath);
        respondWithFileStream(res, filePath, req.headers);
    });

    const PORT = Number(process.env.PORT) || 8080;
    app.listen(PORT, () => console.log(`Server started at port ${PORT}`))
})()
