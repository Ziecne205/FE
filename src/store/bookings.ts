import { create } from 'zustand'
import { Booking, BookingStatus } from '@/types'

interface BookingState {
  bookings: Booking[]
  setBookings: (bookings: Booking[]) => void
  addBooking: (booking: Booking) => void
  updateBookingStatus: (bookingId: string, status: BookingStatus) => void
  getBookingsByStatus: (status: BookingStatus) => Booking[]
}

export const useBookingStore = create<BookingState>((set, get) => ({
  bookings: [],

  setBookings: (bookings: Booking[]) => set({ bookings }),

  addBooking: (booking: Booking) => {
    set((state) => ({
      bookings: [...state.bookings, booking],
    }))
  },

  updateBookingStatus: (bookingId: string, status: BookingStatus) => {
    set((state) => ({
      bookings: state.bookings.map((booking) =>
        booking.id === bookingId ? { ...booking, status } : booking
      ),
    }))
  },

  getBookingsByStatus: (status: BookingStatus) => {
    const { bookings } = get()
    return bookings.filter((booking) => booking.status === status)
  },
}))
