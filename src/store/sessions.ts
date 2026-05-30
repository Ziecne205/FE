import { create } from 'zustand'
import { ParkingSession } from '@/types'

interface SessionState {
  sessions: ParkingSession[]
  setSessions: (sessions: ParkingSession[]) => void
  addSession: (session: ParkingSession) => void
  updateSession: (sessionId: string, updates: Partial<ParkingSession>) => void
  getActiveSessions: () => ParkingSession[]
}

export const useSessionStore = create<SessionState>((set, get) => ({
  sessions: [],

  setSessions: (sessions: ParkingSession[]) => set({ sessions }),

  addSession: (session: ParkingSession) => {
    set((state) => ({
      sessions: [...state.sessions, session],
    }))
  },

  updateSession: (sessionId: string, updates: Partial<ParkingSession>) => {
    set((state) => ({
      sessions: state.sessions.map((session) =>
        session.id === sessionId ? { ...session, ...updates } : session
      ),
    }))
  },

  getActiveSessions: () => {
    const { sessions } = get()
    return sessions.filter((session) => session.status === 'Active')
  },
}))
