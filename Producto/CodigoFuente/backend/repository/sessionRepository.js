// Simple in-memory session store (persists only while the process is running)
export class SessionRepository {
  constructor() {
    if (!SessionRepository.instance) {
      this.sessions = new Map();
      SessionRepository.instance = this;
    }
    return SessionRepository.instance;
  }

  createSession(userId) {
    const token = `${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}`;
    this.sessions.set(token, { userId, createdAt: Date.now() });
    return token;
  }

  findSession(token) {
    return this.sessions.get(token);
  }

  deleteSession(token) {
    this.sessions.delete(token);
  }
}
