import requests
from fastapi import FastAPI
from fastapi.responses import FileResponse
import uvicorn

app = FastAPI()

PATH_FLOD = ''

@app.get("/fetch/{chunk_id}")
async def distribute_chunk_by_id(chunk_id):
    try:
        with open(f'/Users/groschovskiy/PycharmProjects/cdn-node/test/${chunk_id}') as f:
            file_path = f'/Users/groschovskiy/PycharmProjects/cdn-node/test/${chunk_id}'
            return FileResponse(path=file_path, filename=file_path)
    except FileNotFoundError:
        fetch_chunk_by_id(chunk_id)


async def fetch_chunk_by_id(chunk_id):
    url = 'https://speed.hetzner.de/100MB.bin'
    r = requests.get(url)
    with open(f'/Users/groschovskiy/PycharmProjects/cdn-node/test/${chunk_id}', 'wb') as f:
        f.write(r.content)

if __name__ == '__main__':
    uvicorn.run(app, host='127.0.0.1', port=8000)
    print("running")


