# PAiMO for 🏸
![icon-192x192](https://github.com/user-attachments/assets/31cfe9b0-ed7c-448e-a4fa-41dbedf3b870)

Welcome to the PIV Club's not-so-serious game scheduler. It's a Next.js app with NextAuth sprinkled on top so you can manage who gets to do what.

## Dangerously Quick Setup
1. Clone this repo and run `npm install`. (Skip this and things will break, we warned you!)
2. Drop a `.env.local` file at the project root with your `DB_URL`, a `NEXTAUTH_SECRET`, and variables for email verification:
   ```env
   DB_URL=your_mongodb_connection_string
   AUTH_SECRET=some_complex_secret
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   RESEND_API_KEY=your_resend_key
   PUSHER_APP_ID=your_pusher_app_id
   PUSHER_KEY=your_pusher_key
   PUSHER_SECRET=your_pusher_secret
   PUSHER_CLUSTER=your_pusher_cluster
   NEXT_PUBLIC_PUSHER_KEY=your_pusher_key
   NEXT_PUBLIC_PUSHER_CLUSTER=your_pusher_cluster
   ```
3. Fire up the dev server with `npm run dev` and open `http://localhost:3000`.
4. Head to `/signup` to create an account, then `/login` to start planning. Use the Google option on the login page for a quick sign in—you can change your password later in the profile page.

That's it. Short, sweet, and probably unstable—handle with care!

## Generating Test Data
Need some dummy accounts fast? Use the `createTestData` script to seed the
database. Make sure your `.env.local` has `DB_URL` configured, then run:

### Create everything from scratch:
```bash
npm run create-test-data <user-count> [club-name] [event-name]
```

- `user-count` – how many users to create
- `club-name` *(optional)* – name of the club, default is **Test Club**
- `event-name` *(optional)* – name of the event, default is **Test Event**

The script creates the users, a club, an event and registers everyone to that
event automatically.

### Register users to existing event:
```bash
npm run create-test-data register <event-id> <user-count>
```

- `event-id` – ID of the existing event (get this from the event URL: `/events/[event-id]`)
- `user-count` – how many test users to create and register

This is perfect for testing events with multiple participants. The script will:
- Create test users with random skill levels (3.0-6.0)
- Add them to the event's club (if applicable)
- Register them as participants in the event
- Show total participant count after completion

Example:
```bash
npm run create-test-data register 507f1f77bcf86cd799439011 8
```

## Backfilling Missing Avatars
If existing users signed up before avatars were stored, run the `fill-avatars`
script to generate and upload Boring Avatars for them. Ensure your `.env.local`
contains your `DB_URL` and Cloudflare R2 credentials:

```env
R2_REGION=<your region>
R2_ENDPOINT=<https://your-account.r2.cloudflarestorage.com>
R2_ACCESS_KEY_ID=<access key>
R2_SECRET_ACCESS_KEY=<secret key>
R2_BUCKET_NAME=<bucket name>
R2_PUBLIC_URL=<public bucket base URL>
```

Then run:

```bash
npm run fill-avatars
```

The script scans for users without an avatar, generates one using Boring
Avatars, uploads it to R2, and updates each user record with the new image URL.

