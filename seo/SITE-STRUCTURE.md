# Site Structure — Triple J Metal LLC

## URL Hierarchy

```
/ (Home)
│   Schema: LocalBusiness, AggregateRating
│   Links to: /services/carports, /locations/central-texas, /get-a-quote
│
├── /services/
│   ├── /services/carports/          ← PRIMARY money page
│   │   Schema: Service, LocalBusiness
│   ├── /services/garages/
│   ├── /services/barns/
│   ├── /services/rv-covers/
│   └── /services/equipment-covers/
│
├── /locations/
│   ├── /locations/central-texas/    ← Primary geo hub
│   ├── /locations/waco/             ← P1
│   ├── /locations/austin/           ← P1
│   ├── /locations/dallas/           ← P1
│   ├── /locations/temple/           ← P2
│   ├── /locations/killeen/          ← P2
│   ├── /locations/round-rock/       ← P2
│   ├── /locations/georgetown/       ← P2
│   ├── /locations/belton/           ← P3
│   └── /locations/san-marcos/       ← P3
│
├── /gallery/
│   Schema: ImageGallery
│
├── /reviews/
│   Schema: LocalBusiness with AggregateRating
│
├── /about/
│
├── /faq/
│   Schema: FAQPage
│
├── /contact/
│   Schema: ContactPage
│
├── /get-a-quote/             ← Conversion page (quote form)
│
└── /blog/
    ├── /blog/welded-vs-bolted-carport/
    ├── /blog/carport-cost-central-texas/
    ├── /blog/do-i-need-permit-carport-texas/
    └── /blog/[slug]/
        Schema: Article, BreadcrumbList
```

---

## Internal Linking Strategy

| From | Links To |
|---|---|
| Every page | /get-a-quote (CTA), phone number |
| Home | /services/carports, /locations/waco, /locations/central-texas, /gallery |
| Service pages | 3 nearest location pages + /get-a-quote |
| Location pages | /services/carports + /get-a-quote + /gallery |
| Blog posts | 1 service page + 1 location page + /get-a-quote |
| FAQ | Relevant service pages + /contact |
| Gallery | /get-a-quote + /services/carports |

---

## Schema Per Page Type

### Home
```json
{
  "@type": "LocalBusiness",
  "name": "Triple J Metal LLC",
  "priceRange": "$",
  "areaServed": ["Waco, TX", "Austin, TX", "Dallas, TX", "Central Texas"],
  "serviceType": "Metal Carport Installation"
}
```

### Location Pages
```json
{
  "@type": "LocalBusiness",
  "name": "Triple J Metal LLC — Waco TX Carports",
  "geo": { "@type": "GeoCoordinates", "latitude": 31.5493, "longitude": -97.1467 },
  "areaServed": "Waco, TX"
}
```

### FAQ Page
```json
{
  "@type": "FAQPage",
  "mainEntity": [
    { "@type": "Question", "name": "Do I need a permit for a carport in Texas?", "acceptedAnswer": {...} },
    { "@type": "Question", "name": "How much does a carport cost in Central Texas?", "acceptedAnswer": {...} }
  ]
}
```
