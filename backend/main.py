from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

class ExecutionPayload(BaseModel):
    callback: str
    workflow_input: dict

latest_webhook_response = None

# Configure CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods
    allow_headers=["*"],  # Allow all headers
)

@app.post("/executions", response_model=dict)
async def execute_workflow(payload: ExecutionPayload):
    import httpx

    # Sending the request to Salt API
    url = "https://salt-api-prod.getsalt.ai/api/v1/deployments/402a0423-e8d0-4eee-9022-0b12444c4400/executions/"
    headers = {
        "Content-Type": "application/json",
    }
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(url, json=payload.dict(), headers=headers)
            response.raise_for_status()
            return response.json()
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=e.response.status_code, detail=e.response.text)

@app.post("/webhook")
async def receive_webhook(request: Request):
    global latest_webhook_response
    payload = await request.json()
    if payload:
        latest_webhook_response = payload
        return JSONResponse(content={"status": "success"})
    else:
        raise HTTPException(status_code=400, detail="Invalid webhook payload")

@app.get("/latest-webhook")
async def get_latest_webhook_response(execution_id: str):
    if latest_webhook_response and latest_webhook_response.get('execution_id') == execution_id:
        return latest_webhook_response
    raise HTTPException(status_code=404, detail="No data found for this execution ID")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="localhost", port=8000)
