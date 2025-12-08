# Strapi FAQ Generator (Frontend)

This project is a React-based frontend application designed to generate FAQs by fetching content from Strapi and leveraging AI/SERP data.

## What's this app for?

This application serves as a tool for content managers and SEO specialists to:
- Fetch existing pages from Strapi CMS.
- Generate content-based FAQs using AI.
- Fetch "People Also Ask" (PAA) questions from Google via SerpAPI.
- Rephrase and edit FAQs before publishing.

## Tech Stack

- [React](https://reactjs.org/) - UI Library
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Vite](https://vitejs.dev/) - Build tool (assumed based on modern standards, or Create React App)

## Key Features

- **Strapi Integration**: Fetches collections and pages directly from your Strapi instance.
- **Smart Caching**: Implements 12-hour local storage caching for API calls to reduce load and costs.
- **SEO Optimization**: Prioritizes `meta_data_title` for page selection.
- **Interactive UI**: Real-time status updates, error handling, and easy-to-use dropdowns.

## Getting Started

1.  **Install Dependencies**
    ```bash
    npm install
    ```

2.  **Run Locally**
    ```bash
    npm run start
    ```
    The app will run on `http://localhost:3000`.

3.  **Build for Production**
    ```bash
    npm run build
    ```

## Project Structure

- `src/pages/ExistingPage.jsx`: Main logic for fetching existing Strapi content.
- `src/pages/NewPage.jsx`: Logic for generating FAQs from scratch/keywords.
- `src/utils/cacheUtils.js`: Caching utility for API optimization.
- `public/keywords.json`: Local fallback for keyword mapping.

## Learn More

If you are new to React or the tools used here, check out:
- [React Documentation](https://reactjs.org/docs/getting-started.html)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
