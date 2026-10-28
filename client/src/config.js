const configuredServerUrl = import.meta.env.VITE_SERVER_URL?.trim().replace(/\/+$/, "")

export const serverUrl = configuredServerUrl || (import.meta.env.DEV ? "http://localhost:8000" : "")
export const isServerConfigured = import.meta.env.DEV || Boolean(configuredServerUrl)
