from fastapi import FastAPI
from openai_client import get_openai_response

app = FastAPI()

@app.get("/query")
async def query_openai(text: str):
    response = get_openai_response(text)
    return {"response": response}
