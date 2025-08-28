
# Purchase Tracker MVP Skeleton

## Product Overview

**Purchase Tracker** is a minimal, functional MVP application that:

- Scans a paper receipt 📸
- Runs OCR to extract structured items
- Saves data to the cloud
- Displays purchase history in the app

---

## 1. Core MVP Idea

**One simple feature:** Take a photo of a receipt → Instantly get a "purchase" in the app with date, store, item list, prices, and total.

**MVP Goal:** Prove that users will actually save receipts and that data can be reliably parsed.

**Focus:** Minimal UX friction, fast response, cross-platform (iOS + Android).

---

## 2. Architecture & Technologies

### 📱 Client (Mobile App)
- **Framework:** React Native (fast, cross-platform, camera access). Alternative: Flutter, but RN integrates easier with JS backend.
- **UI:** Minimalist — list of receipts + scan screen.
- **iOS/Android Optimization:**
  - Use native camera modules (expo-camera or react-native-camera)
  - Auto-cropping guidelines for receipts
  - Local photo caching before upload

### ☁️ Backend & Cloud (AWS)
- **API Gateway + AWS Lambda (Node.js/Python):** Serverless backend
- **S3:** Store original receipt photos
- **DynamoDB:** Purchases database (flexible, key-value, cost-effective)
- **Cognito:** User authentication
- **Amazon Textract:** OCR for receipts (extracts text, items, prices)
- **Amazon Comprehend / Custom Parser:** Extract structured data (store, date, items, prices)

---

## 3. MVP Mini-Architecture (Flow)

1. User takes a photo of a receipt
2. Frontend sends photo to API Gateway → Lambda
3. Lambda stores photo in S3
4. Lambda calls Textract → gets text
5. Parser (in Lambda) converts text to JSON (store, date, item list)
6. JSON saved to DynamoDB
7. Mobile app fetches and displays purchase list

---

## 4. Data Model (Minimal Schema)

**Purchases Table (DynamoDB):**

```json
{
  "purchaseId": "uuid",
  "userId": "uuid",
  "date": "2025-08-27T12:34:56Z",
  "storeName": "Carrefour",
  "items": [
    { "name": "Milk", "price": 1.20, "quantity": 1 },
    { "name": "Bread", "price": 0.80, "quantity": 1 }
  ],
  "total": 2.00,
  "rawText": "original OCR text",
  "imageUrl": "s3://bucket/..."
}
```

---

## 5. UI Skeleton

### "My Purchases" Screen
- Feed with receipt cards: store, date, total
- Tap for details (items)

### "Scan Receipt" Screen
- Camera with hint: "Point at the receipt"
- Button: "Take Photo"

### "Profile" Screen (Minimal)
- Logout button

---

## 6. Roadmap: First Steps

**Step 1. Infrastructure Skeleton (1 week)**
- Set up AWS project (API Gateway + Lambda + DynamoDB + S3 + Cognito)
- Configure CI/CD (e.g., AWS Amplify or GitHub Actions)

**Step 2. Mobile App (1–2 weeks)**
- React Native skeleton (Tab Navigation: Home / Scan / Profile)
- Camera screen → photo → send to API
- Purchase list screen (empty placeholder)

**Step 3. OCR & Parsing (1–2 weeks)**
- Integrate Textract → get raw text
- Write simple parser: extract date, total, items via regex
- Save to DynamoDB

**Step 4. Integration & Display (1 week)**
- Fetch receipts from DynamoDB → show in app
- Receipt details (items, total, date)

**Step 5. Mini-Optimization**
- Local purchase list caching (AsyncStorage)
- Photo compression before upload

---

## 7. Second Iteration (If MVP Succeeds)
- Automatic import from e-receipts (QR code from fiscal receipt → tax API, where available)
- Item categorization (dairy, bread, meat)
- Mini-analytics (top items, weekly spend)
- Push notifications (e.g., "Don't forget to save your receipt!")

---

## Summary

**MVP = React Native app + AWS (Textract, S3, DynamoDB, Lambda, API Gateway, Cognito).**

User → photo of receipt → OCR → JSON → display in purchase feed.