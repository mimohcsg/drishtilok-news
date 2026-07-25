# Drishtilok (दृष्टिलोक) — West MP news

Hindi digital news portal for **Indore Division**, **Ujjain Division** (including Dewas), and **statewide Madhya Pradesh**.

## Run

```bash
cd drishtilok-news
npm install
npm start
```

Open [http://localhost:4173](http://localhost:4173).

## Coverage

| Area | Districts |
|------|-----------|
| **इंदौर संभाग** | इंदौर, धार, झाबुआ, अलीराजपुर, खरगोन, बड़वानी, खंडवा, बुरहानपुर |
| **उज्जैन संभाग** | उज्जैन, देवास, रतलाम, मंदसौर, नीमच, शाजापुर, आगर-मालवा |
| **मध्य प्रदेश** | Statewide MP politics, admin, and general news |

## API

- `GET /api/news?lang=hi`
- `GET /api/news?lang=hi&division=indore-div`
- `GET /api/news?lang=hi&division=ujjain-div`
- `GET /api/news?lang=hi&district=dewas`
- `GET /api/news?lang=hi&district=mp`
- `GET /api/region`

Primary feeds: दैनिक भास्कर (मप्र), अमर उजाला (मप्र), नई दुनिया (मप्र).

## E-paper

Daily e-paper compiles all stories gathered during the day (IST) and **locks at 11:59 PM**.

- Page: [http://localhost:4173/epaper.html](http://localhost:4173/epaper.html)
- API: `GET /api/epaper?lang=hi&date=YYYY-MM-DD`
- Dates: `GET /api/epaper/dates`
- Use **प्रिंट / PDF** in the browser to save or print the edition
