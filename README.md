# React + Tailwind

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules. One top of the standard Vite setup, [tailwindcss](https://tailwindcss.com/) is installed and ready to be used in React components.

Additional references:

- [Getting started with Vite](https://vitejs.dev/guide/)
- [Tailwind documentation](https://tailwindcss.com/docs/installation)

## Supabase Auth Setup

Create a `.env` file in the project root with:

```
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_SITE_URL=http://localhost:5173
```

Then start the dev server:

```
npm run dev
```

To invite users, insert a row into the `org_invitations` table with `org_id` (the organization to join) and `email`. Share a link like:

```
https://your-app.example.com/?invite=<token-from-org_invitations>
```

After the user signs in with the magic link, the app will automatically call `accept_invite(token)` to add them to the organization.

### Example env and debug

If you need to verify that envs are present in a deployed build:

- Ensure the above VITE_* variables are set in Vercel (Preview/Production per your URL).
- Redeploy with build cache disabled so Vite inlines them.
- Open your app with `?env=1` appended to the URL to see the Env Debug page (example: `http://localhost:5173/?env=1`).
