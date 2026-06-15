# Factors Video Renderer — Setup Guide

## One-time setup (do this once)

### 1. Install dependencies
cd factors-video
npm install

### 2. Install ngrok (already done via Homebrew)
ngrok config add-authtoken YOUR_NGROK_TOKEN

## Every time you want to run

### Terminal window 1 — Start render server
cd factors-video
node server.js

You should see:
✅ Factors Video Renderer running on http://localhost:3000

### Terminal window 2 — Start ngrok tunnel
ngrok http 3000

You will see something like:
Forwarding  https://abc123.ngrok-free.app → http://localhost:3000

Copy that https URL — paste it into n8n as your render server URL.

## Update n8n

In your Code node, change this line:
const RENDER_SERVER = 'http://localhost:3000/render';

To:
const RENDER_SERVER = 'https://abc123.ngrok-free.app/render';

## Test it manually first
curl -X POST http://localhost:3000/render \
  -H "Content-Type: application/json" \
  -d '{
    "video_title": "Test video",
    "scenes": [
      {
        "text": "LinkedIn Ads are not broken.",
        "accent_words": ["broken"],
        "background": "paper",
        "illustration": null,
        "illustration_position": null,
        "show_logo": false
      },
      {
        "text": "Your strategy is.",
        "accent_words": ["strategy"],
        "background": "yellow",
        "illustration": null,
        "illustration_position": null,
        "show_logo": true
      }
    ]
  }'

## n8n workflow final order
1. Notion Trigger
2. IF node (Status = Generate)
3. Notion Update (Status = Processing)
4. HTTP Request (fetch blog URL)
5. Code node (extract text)
6. Claude node (generate scene spec JSON)
7. Code node (parse + call render server)
8. Notion Update (write video URL + Status = Done)
