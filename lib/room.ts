import { create } from 'zustand'

export type Phase = 'lobby' | 'options' | 'rating' | 'revealed' | 'voting' | 'decided'
export type Participant = { id: string; name: string; connected: boolean; isAI: boolean; statusLine?: string }
export type Option = { id: string; title: string; addedBy: string; suggestedByAI: boolean }
export type RoomView = {
  phase: Phase
  room: { code: string; title: string; hostId: string }
  me: { id: string; name: string }
  participants: Participant[]
  options: Option[]
  myRatings: Record<string, { score: 1 | 2 | 3 | 4 | 5; reason?: string }>
  ratingProgress: { finished: number; total: number }
  revealed?: { ratings: Record<string, Record<string, number>>; means: Record<string, number>; spreads: Record<string, number> }
  analysis?: { verdicts: Record<string, string>; disagreements: string[]; compromise?: string; aiUnavailable?: boolean }
  votes?: { counts: Record<string, number>; votedBy: string[] }
}

type RoomActions = { createRoom: (title: string, name: string) => void; joinRoom: (code: string, name: string) => void; addOption: (title: string) => void; removeOption: (id: string) => void; startOptions: () => void; startRating: () => void; copyCode: () => void }

const emptyView = (): RoomView => ({ phase: 'lobby', room: { code: '', title: '', hostId: '' }, me: { id: '', name: '' }, participants: [], options: [], myRatings: {}, ratingProgress: { finished: 0, total: 0 } })
const makeCode = () => Math.random().toString(36).slice(2, 8).toUpperCase()

export const useRoom = create<RoomView & RoomActions>((set, get) => ({
  ...emptyView(),
  createRoom: (title, name) => { const id = crypto.randomUUID(); set({ ...emptyView(), phase: 'lobby', room: { code: makeCode(), title: title.trim(), hostId: id }, me: { id, name: name.trim() }, participants: [{ id, name: name.trim(), connected: true, isAI: false }] }) },
  joinRoom: (code, name) => { const id = crypto.randomUUID(); set({ ...emptyView(), phase: 'lobby', room: { code: code.trim().toUpperCase(), title: '', hostId: '' }, me: { id, name: name.trim() }, participants: [{ id, name: name.trim(), connected: true, isAI: false }] }) },
  addOption: (title) => { const { options, me } = get(); if (title.trim() && options.length < 10) set({ options: [...options, { id: crypto.randomUUID(), title: title.trim(), addedBy: me.name, suggestedByAI: false }] }) },
  removeOption: (id) => set({ options: get().options.filter((option) => option.id !== id) }),
  startOptions: () => set({ phase: 'options' }),
  startRating: () => set({ phase: 'rating' }),
  copyCode: () => { const code = get().room.code; if (code) navigator.clipboard?.writeText(code) },
}))
