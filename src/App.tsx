import { useState } from "react"
import { Login } from "./components/Login"
import { S3Uploader } from "./components/S3Uploader"

function App() {
  const [authenticatedUserId, setAuthenticatedUserId] = useState<string | null>(
    null,
  )

  if (!authenticatedUserId) {
    return <Login onAuthenticated={setAuthenticatedUserId} />
  }

  return (
    <S3Uploader
      userId={authenticatedUserId}
      onSignOut={() => setAuthenticatedUserId(null)}
    />
  )
}

export default App
