# Astro Starter Kit: Minimal

```sh
npm create astro@latest -- --template minimal
```

> 🧑‍🚀 **Seasoned astronaut?** Delete this file. Have fun!

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```text
/
├── public/
├── src/
│   └── pages/
│       └── index.astro
└── package.json
```

Astro looks for `.astro` or `.md` files in the `src/pages/` directory. Each page is exposed as a route based on its file name.

There's nothing special about `src/components/`, but that's where we like to put any Astro/React/Vue/Svelte/Preact components.

Any static assets, like images, can be placed in the `public/` directory.

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

## 👀 Want to learn more?

Feel free to check [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).

## Future Data Model

The current classroom calendar is seeded from local TypeScript data and stays public-only on `/calendar/`.

Planned tables for the next phase:

- `calendar_entries`
- `lesson_plans`
- `worksheets`
- `document_access_log`

`/portal/` is the future signed-in family experience and should only show `Published` classroom data after Cloudflare Access is configured.

`/teacher/planner/` is the local editing workspace. In production it must stay blocked until teacher authentication is implemented for `jeremysayers@gmail.com`.

Worksheet/document storage is expected to use the Cloudflare R2 binding name `WORKSHEETS_BUCKET` in a later pass. The `class-edthings-worksheets` bucket must remain private, and `NotPublished` files should stay superuser-only after authenticated access rules are in place.
