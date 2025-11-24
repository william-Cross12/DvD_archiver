GET /dvds → List all DVDs with optional query params for filtering.

POST /dvds → Add a new DVD.

GET /dvds/:id → Get details of a specific DVD.

PUT /dvds/:id → Update a DVD.

DELETE /dvds/:id → Delete a DVD.

GET /search-dvd?title=... → Search OMDB for DVD info.




dvd-catalog/
├── backend/
│   ├── package.json
│   ├── server.js           # Main Express server
│   ├── routes/
│   │   └── dvds.js        # All DVD-related endpoints
│   ├── controllers/
│   │   └── dvdsController.js
│   ├── models/
│   │   └── dvdModel.js    # Database queries
│   ├── db/
│   │   └── database.sqlite
│   └── utils/
│       └── omdb.js        # OMDB API helper functions
├── frontend/
│   ├── package.json
│   ├── src/
│   │   ├── App.jsx
│   │   ├── components/
│   │   │   ├── DvdList.jsx
│   │   │   ├── DvdForm.jsx
│   │   │   └── DvdDetail.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── AddDvd.jsx
│   │   │   └── EditDvd.jsx
│   │   └── api/
│   │       └── api.js     # Frontend calls to backend
│   └── public/
│       └── index.html
└── README.md
