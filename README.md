# :poop: Polling & Survey application

## :grey_question: Task for project
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

## :wrench: Project Launch Guide

1) Create FaunaDB account and empty database
2) Create server database key on FaunaDB Security page
3) Set this key in enviroment variables (for example in .env or next.config.js file) with name FAUNADB_SECRET_KEY
4) Run `npm run build` and after that `npm run start` (Database collections and indexes will be created automatically on app laucnch if they dont exists)
5) Enjoy :)
   
> If Database collections and indexes didn't created exec this FQL queries in FaunaDB FQL Shell or run `dbFactory` method in `src/faunadbConfig.ts`
>   ```
>   CreateCollection({ name: "pollsCollectionName" });
>   ```
>   ```
>   CreateIndex({
>     name: "pollsVotesByPollIpIndexName",
>     source: Collection("pollsCollectionName"),
>     terms: [
>       { field: ["ref", "id"] },
>       { field: ["data", "choices", "votes", "voter_ip"] },
>     ],
>   })
>   ```

## Features and thoughts (You must read it! (At least thoughts...))

- Color scheme is stored in cookie to avoid color scheme mismatch after hydration
- IP checking by middleware and getServerSideProps
- When creating their own survey, users can choose whether there is a multiple choice in it. If so, then users can vote for several answer options.
- They can also choose the expiration date of the survey. If you don't choose anything, the polls will be endless.
- On poll page users have share button. If it clicked unique generated URL copied.

> For such projects, conventional SSR rendering is poorly suited, so serverside and clientside SWR hooks were used to pre-render data for better SEO and then conveniently real-time update them.

> As a minus, I can highlight the absence of any authorization (If you think about it... then it wasn't specified in the requirements of the project and everything is fine...). But I tried to compensate for this by using IP as a unique user ID. The user has a dashboard in which the votes created from his IP are shown and only he can delete them.

> It was decided not to divide the database and many aspects in the code into modules. Since many parts of the code are unique (for example, FQL queries) and cannot be reused, and using a database in such a small project is easier without creating multiple collections.

## :sleeping: REST API

- [ GET, POST ] - api/polls
   
     GET - Can accept query vars `offset` and `page_size` for pagination. Return `offset, page_size, data`.
     
     POST - Accept `question, choices, is_multiple_answer_options, expires_at` vars. Return data of created poll.

- [ GET, PUT, DELETE ] - api/polls/[id]
   
     GET - Return poll data by `id`.
     
     PUT - Accept `question, choices, is_multiple_answer_options, expires_at` vars. Return updated poll data.
     
     DELETE - Delete poll data by `id`.

- [ POST ] - api/polls/[id]/vote

     POST - Accept `choices` array of strings (Can be length of 1). Check IP, expiration date and return new poll data.

## :memo: Description

![image](https://github.com/Re-Gelu/Survey-app/assets/75813517/17ffab52-aaa1-42e0-838a-b24b97ecf5ed)
> Image 1 - Home page

![image](https://github.com/Re-Gelu/Survey-app/assets/75813517/9315ddab-a096-4d45-95cb-5b54c1898f39)
> Image 2 - Dashboard page

> All func based on IPs. Polls have creator_ip field and votes have voter_ip field.

![image](https://github.com/Re-Gelu/Survey-app/assets/75813517/a6fa0771-388f-4f84-af8b-88cdad51f9df)
> Image 2 - Poll page

![image](https://github.com/Re-Gelu/Survey-app/assets/75813517/85b568a7-83f5-4ff0-ac78-213e6d6cd80c)
> Image 3 -Poll page after user voted

> User cannot vote again, he can only check other users answers

![image](https://github.com/Re-Gelu/Survey-app/assets/75813517/02ebdd27-2f5a-4f70-bac5-a2ff629f2d7c)
> Image 4 - Poll page after user voted with multiple option vote func and poll expiration

![image](https://github.com/Re-Gelu/Survey-app/assets/75813517/f877d249-7cb9-4bf3-b11a-6bec1fec95f2)
> Image 5 -Poll page after poll expiration

> User cannot vote, he can check other users answers

![image](https://github.com/Re-Gelu/Survey-app/assets/75813517/87ef7617-dab3-40e9-ae70-41687634c714)
> Image 6 -Poll deletion. You can delete poll only if you are creator (checked by IP).


## NPM scripts

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
