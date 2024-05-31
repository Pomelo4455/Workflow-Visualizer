# Workflow Visualizer

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `src/app/page.js`. The page auto-updates as you edit the file.

## Project Structure

```plaintext
.
├── public/             # Static assets
├── src/                # Source files
│   ├── app/            # Next.js app directory
│   ├── components/     # React components
│   └── styles/         # CSS and styling
├── .eslintrc.json      # ESLint configuration
├── jsconfig.json       # JavaScript configuration
├── next.config.js      # Next.js configuration
├── package.json        # Project dependencies and scripts
└── tailwind.config.js  # Tailwind CSS configuration
```

## Features

- **Task Graph Visualization**: Visualize tasks and their connectors using D3.js.
- **Responsive Design**: Adapts to different screen sizes.
- **Apollo Client**: Fetch data from GraphQL API.
- **Tailwind CSS**: Utility-first CSS framework for styling.