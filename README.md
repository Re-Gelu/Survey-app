# Survey app

## Task for project
Tools: Next.js, TypeScript, FaunaDB, Mantine UI

Description:
You should to create a quick polling web application where users can create polls, share them, and gather responses. All the polls and their responses should be stored in FaunaDB.

Basic Features:
- Poll Creation: Users can create a poll with a question and multiple choices;
- Sharing: After creating a poll, a unique URL is generated that can be shared with others to gather responses;
- Vote: Anyone with the poll's URL can vote on it. Once they've voted, they can see the current poll results.

Advanced features:
- IP tracking: only one vote can be done from one IP address;
- Polls expiry: on creating a poll, you can set an expiration time (e.g. 12 hours), which would then displayed on poll page. After expiration time, poll should only display final results.

Expectations:
- Use Next.js with TypeScript for both the front-end and back-end.
- Do not use new app router and server components (it works poorly with Mantine).
- Use Next.js API routes for handling poll creation, voting, and results retrieval.
- Do not use FaunaDB's graphql endpoint - only use FQL.
- Code should be clean and modular.
- UI can be simple, but the application should be user-friendly.

## Project Launch Guide

1) Create FaunaDB account and empty database
2) Exec this FQL queries in FaunaDB FQL Shell or run `dbFactory` method in `src/faunadbConfig.ts`
  - ```
    CreateCollection({ name: "pollsCollectionName" });
    ```
  - ```
      CreateIndex({
        name: "pollsVotesByPollIpIndexName",
        source: Collection("pollsCollectionName"),
        terms: [
          { field: ["ref", "id"] },
          { field: ["data", "choices", "votes", "voter_ip"] },
        ],
      })
    ```
3) Create server database key on FaunaDB Security page
4) Set this key in enviroment variables (for example in .env file)
5) Run `npm run build` and after that `npm run start`
6) Enjoy :)

## Features

- Server side rendering setup for Mantine
- Color scheme is stored in cookie to avoid color scheme mismatch after hydration
- Storybook with color scheme toggle
- Jest with react testing library
- ESLint setup with [eslint-config-mantine](https://github.com/mantinedev/eslint-config-mantine)

## npm scripts

### Build and dev scripts

- `dev` – start dev server
- `build` – bundle application for production
- `export` – exports static website to `out` folder
- `analyze` – analyzes application bundle with [@next/bundle-analyzer](https://www.npmjs.com/package/@next/bundle-analyzer)

### Testing scripts

- `typecheck` – checks TypeScript types
- `lint` – runs ESLint
- `prettier:check` – checks files with Prettier
- `jest` – runs jest tests
- `jest:watch` – starts jest watch
- `test` – runs `jest`, `prettier:check`, `lint` and `typecheck` scripts

### Other scripts

- `storybook` – starts storybook dev server
- `storybook:build` – build production storybook bundle to `storybook-static`
- `prettier:write` – formats all files with Prettier
