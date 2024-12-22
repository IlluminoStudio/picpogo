# PicPogo! - Staff Photo Board

Snap, share, and showcase your awesome team members with this fun and interactive photo board app! ✨

![PicPogo Screenshot](public/screenshot.png)

Getting Started

1. Clone this repository

2. Install dependencies:
   ```
   npm install
   ```

3. Fill in your Pexels API key in the `.env` file:
   ```
   NEXT_PUBLIC_PEXELS_API_KEY=your_api_key_here
   ```

4. Start the development server:
   ```
   npm run dev
   ```

5. Open http://localhost:3000 to view the app in your browser.

Running Tests

You can run the tests in two modes:

Interactive Mode

To open Cypress Test Runner with a visual interface:
```
npx cypress run --spec "cypress/e2e/Tests.cy.ts" --headed --no-exit
```

Headless Mode

To run tests in command line without GUI:
```
npx cypress run --spec "cypress/e2e/Tests.cy.ts" --headless
```
