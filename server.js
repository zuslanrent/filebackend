const app = require('./app')
const { initDb } = require('./config/initDb')
const path = require('path')
const dotenv = require('dotenv')

dotenv.config({ path: path.resolve(__dirname, '.env.local') })

const PORT = process.env.PORT || 8000

async function startServer() {
  try {
    await initDb()
    app.listen(PORT, () => {
      console.log(`🚀 Backend started on http://localhost:${PORT}`)
    })
  } catch (error) {
    console.error('Failed to start backend:', error.message)
    process.exit(1)
  }
}

startServer()