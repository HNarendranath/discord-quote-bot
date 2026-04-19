# Inspiring Quotator

A Discord bot that turns messages into beautifully formatted quote embeds.

## What it does

Reply to any message and run `/quote` — the bot reposts it as a styled embed in your server's designated quotes channel. You can pull in multiple recent messages at once, and admins can configure the channel and embed colour per guild. Settings are persisted in a local SQLite database.

## Commands

| Command | Description |
|---|---|
| `/quote [number]` | Quotes the replied-to message, or the most recent one. Pass a number (max 10) to include extra previous messages. |
| `/setchannel channel:` *(admin)* | Sets the channel where quotes are posted for this guild. |
| `/embedcolour hex:` *(admin)* | Sets the embed accent colour. Accepts hex values like `#FF0000`. |

## Setup

Requires Node.js v18+.

```bash
git clone <repo>
cd inspiring-quotator
npm install
```

Create a `.env` file in the project root:

```env
DISCORD_TOKEN=your-bot-token
```

Then start the bot:

```bash
npm run start     # production
npm run dev       # development (auto-restarts on changes)
```

Slash commands register automatically on startup. If they don't appear, check the console for the `Ready! Logged in as ...` message and confirm the bot has the right permissions.

## Tech stack

| | |
|---|---|
| **Runtime** | Node.js v18+ |
| **Discord** | [discord.js](https://discord.js.org/) — client, slash command registration, embed builder |
| **Database** | [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) — synchronous SQLite for per-guild settings |
| **Config** | dotenv — loads `DISCORD_TOKEN` from `.env` |
| **Dev tools** | nodemon (auto-restart), eslint |

## Project structure

```
discord-quote-bot/
├── data/
│   └── database.sqlite       per-guild settings (consider gitignoring)
├── src/
│   ├── index.js              entrypoint — client init, command + event loading, DB setup
│   ├── commands/
│   │   ├── quote.js          /quote handler
│   │   ├── setchannel.js     /setchannel handler
│   │   └── setcolour.js      /embedcolour handler
│   └── events/
│       ├── interactionCreate.js   command dispatch
│       └── messageCreate.js       mention-based quote listener
├── .env                      secrets (do not commit)
├── .gitignore
├── eslint.config.js
└── package.json
```

## Security

> **Never commit your bot token.** If you do, rotate it immediately in the [Discord Developer Portal](https://discord.com/developers/applications) and purge it from git history.

To stop tracking the database file:

```bash
git rm --cached database.sqlite
echo "database.sqlite" >> .gitignore
git commit -am "Ignore local sqlite database"
```

For deployments, pass secrets via environment variables (GitHub Actions secrets, Heroku config vars, etc.) rather than a committed `.env`. Consider adding a pre-commit hook with `git-secrets` to catch accidental leaks.

## Deployment

Any host that supports Node.js works. Set `DISCORD_TOKEN` as environment variable on your host rather than shipping a `.env` file. The bot currently uses a single local SQLite file — if you ever run multiple instances, you'll need a shared datastore.

## Troubleshooting

- **Commands don't appear** — confirm the bot logged in successfully and check for errors on startup.
- **Quoting fails** — make sure the guild has a channel set via `/setchannel` and the bot has send-message permission there.

## Contributing

Match the existing style: tabs for indentation, single quotes, semicolons. Run `eslint` before opening a PR.
