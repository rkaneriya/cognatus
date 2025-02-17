# COGNATUS

[Cognatus](https://www.cognatus.app) is a web app for visualizing and connecting with your kin. It lets you create interactive networks ("trees") of family members and the relations between them. Learn more [here](https://www.cognatus.app/about).

I created Cognatus as a non-commercial hobby project in December 2021 to visualize my own family tree. I've maintained it in production since then and periodically expand its functionality based on my needs (i.e. most recently, I added support for monthly e-mail reminders of upcoming birthdays/anniversaries).

Cognatus was bootstrapped with [Next.js](https://nextjs.org/) (React), uses [Ant Design](https://ant.design/) as a component library, and uses [Supabase](https://supabase.io/) for authentication and data storage. It's deployed and hosted using [AWS](https://aws.amazon.com/).

_While you're welcome to use the app, please note that this is primarily a personal hobby project, so I can't guarantee its longevity!_

<p align="center">
  <a href="https://www.cognatus.app/trees/6168b760-a4c8-4f39-9e01-184401db5f0d" target="_blank">
    <img width="800" alt="cognatus.app" src="https://github.com/user-attachments/assets/76247a5c-b23f-40cd-a93a-ba9a2eef196a" />
  </a>
</p>

## Dev Guide

### Running locally

```bash
yarn install
yarn dev
```

### Project structure

```
.
├── components
│   ├── editable-table.js
│   ├── graph.js
│   ├── member-card.js
│   └── ...
├── constants
│   └── ...
├── data
│   ├── contexts
│   │   └── ... # Custom React contexts
│   ├── entities
│   │   ├── member.js
│   │   ├── relation.js
│   │   └── ... # Entity schemas (Postgres)
│   └── hooks
│       └── ... # Custom React hooks for data access/fetching
├── pages
│   ├── _app.js
│   ├── _document.js
│   ├── _styles.css
│   ├── about.js
│   ├── api
│   │   ├── auth.js
│   │   └── event-email.js # For generating monthly e-mail
│   ├── index.js
│   ├── trees
│   │   └── [uuid].js # Individual tree page (at /trees/:uuid)
│   ├── trees-mobile.js
│   └── trees.js # Admin page for viewing & managing trees (desktop)
├── public
│   └── ... # Images, SVGs
├── utils
│   └── ... # Formatting, business logic, 3P API clients (Supabase, Sendgrid)
├── README.md
├── tailwind.config.js # Styles use Tailwind CSS
├── postcss.config.js
├── next.config.js
├── package.json
└── yarn.lock
```
