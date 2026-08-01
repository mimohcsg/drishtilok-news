# Satyavrat (सत्यव्रत) — West MP news

Hindi digital news portal for **Indore Division**, **Ujjain Division** (including Dewas), **statewide Madhya Pradesh**, and **India** national stories.

**Repo:** https://github.com/mimohcsg/drishtilok-news

## Run locally

```bash
npm install
npm start
```

Open [http://localhost:4173](http://localhost:4173).

## Deploy (Render)

**Expected live URL after first deploy:** https://satyavrat-news.onrender.com

One-click free host (Node server required — GitHub Pages cannot run the live RSS API):

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/mimohcsg/drishtilok-news)

Or in the [Render dashboard](https://dashboard.render.com/) → **New** → **Blueprint** → select this repo (`render.yaml` → service `satyavrat-news`).

Code is on `main` (`mimohcsg/drishtilok-news`). Auto-deploys apply once the Blueprint is connected.

## Coverage

| Area | Districts |
|------|-----------|
| **इंदौर संभाग** | इंदौर, धार, झाबुआ, अलीराजपुर, खरगोन, बड़वानी, खंडवा, बुरहानपुर |
| **उज्जैन संभाग** | उज्जैन, देवास, रतलाम, मंदसौर, नीमच, शाजापुर, आगर-मालवा |
| **मध्य प्रदेश** | Statewide MP politics, admin, and general news |
| **भारत** | National / India stories mixed into the front page |

## API

- `GET /api/news?lang=hi`
- `GET /api/news?lang=hi&division=indore-div`
- `GET /api/news?lang=hi&division=ujjain-div`
- `GET /api/news?lang=hi&district=dewas`
- `GET /api/news?lang=hi&district=mp`
- `GET /api/region`
- `GET /api/health`

Primary feeds: दैनिक भास्कर (मप्र), अमर उजाला (मप्र), नई दुनिया (मप्र).

## E-paper

Daily e-paper compiles all stories gathered during the day (IST) and **locks at 11:59 PM**.

- Page: `/epaper.html`
- API: `GET /api/epaper?lang=hi&date=YYYY-MM-DD`
- Dates: `GET /api/epaper/dates`
- Use **प्रिंट / PDF** in the browser to save or print the edition
