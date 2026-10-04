# RailBook – Railway Booking System

A responsive railway ticket booking web app with user registration and login,
dynamic fare calculation and booking management.

Originally a Java Swing desktop prototype, rebuilt as a modern web application.

## Features
- Register / login with validation and SHA-256 password hashing (Web Crypto API)
- Book tickets: passenger, route, date, class, number of passengers
- Live fare estimate based on distance and class
- Booking history with PNR numbers and cancellation
- Responsive layout with automatic dark mode

## Tech stack
HTML5, CSS3 (custom properties, grid), vanilla JavaScript (ES6)

## Run locally
Open `index.html` in a browser. No build step or dependencies.

## Deploy
Upload the folder to GitHub, then enable GitHub Pages
(Settings → Pages → Deploy from branch → `main` / root).
Netlify and Vercel also work by dragging the folder in.

## Note
This is a front-end demo. Data is stored in the browser's localStorage, so
accounts and bookings are per-device. A production version would use a backend
API with a database and server-side password hashing (e.g. bcrypt).

## Roadmap
- Node.js + Express REST API with MongoDB
- JWT-based authentication
- Train schedules and real seat availability
