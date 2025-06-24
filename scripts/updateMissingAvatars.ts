import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
import connect from '../utils/mongoose'
import User from '../models/User'
import AvatarModule from 'boring-avatars'
const Avatar = (AvatarModule as any).default
import { uploadAvatar } from '../lib/r2'

async function main() {
  await connect()
  const users = await User.find({ $or: [ { image: { $exists: false } }, { image: null }, { image: '' } ] })
  const { createElement } = await import('react')
  const { renderToStaticMarkup } = await import('react-dom/server')
  for (const user of users) {
    const svg = renderToStaticMarkup(
      createElement(Avatar, { size: 256, name: user.username || user.email, variant: 'beam' })
    )
    const key = `avatars/${user._id}.svg`
    const url = await uploadAvatar(key, Buffer.from(svg), 'image/svg+xml')
    user.image = url
    await user.save()
    console.log(`Updated ${user.email}`)
  }
  console.log(`Processed ${users.length} users`)
}

main().then(() => process.exit(0)).catch(err => { console.error(err); process.exit(1); })
