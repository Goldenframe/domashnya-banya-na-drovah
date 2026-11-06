import { queryOptions } from "@tanstack/react-query";
import { api } from "@/shared/api";

const bookingKey = (userId) => ["user-account", userId, "booking"];
export const listKey = (userId) => [...bookingKey(userId), "list"];
const calendarKey = (userId) => [...bookingKey(userId), "calendar"];
const availabilityKey = (userId, date) => [
  ...bookingKey(userId), "availability", ...(date ? [date] : []),
];
const config = (token, signal) => ({
  headers: { Authorization: "Bearer " + token },
  signal,
});

export function bookingsQuery(userId, token) {
  return queryOptions({
    queryKey: listKey(userId),
    queryFn: async ({ signal }) => {
      const { data } = await api.get(
        "/api/userAccount/" + userId + "/bookings", config(token, signal)
      );
      return data;
    },
  });
}

export function startTimesQuery(userId, token, date) {
  return queryOptions({
    queryKey: [...availabilityKey(userId, date), "starts"],
    enabled: Boolean(date),
    staleTime: 5 * 60 * 1000,
    queryFn: async ({ signal }) => {
      const { data } = await api.get(
        "/api/userAccount/" + userId + "/availableIntervals/" + date,
        config(token, signal)
      );
      return data.availableStartTimes;
    },
  });
}

export function endTimesQuery(userId, token, date, startTime, intervalId) {
  return queryOptions({
    queryKey: [...availabilityKey(userId, date), "ends", startTime, intervalId],
    enabled: Boolean(date && startTime) && intervalId != null,
    staleTime: 30 * 1000,
    queryFn: async ({ signal }) => {
      const { data } = await api.get(
        "/api/userAccount/" + userId + "/availableEndTimes/" + date + "/" + startTime + "/" + intervalId,
        config(token, signal)
      );
      const times = data.availableEndTimes.map(({ endTime }) => endTime);
      if (times.length && !times.includes("24:00")) times.push("24:00");
      return times;
    },
  });
}

export function calendarQuery(queryClient, userId, token, dates) {
  return queryOptions({
    queryKey: [...calendarKey(userId), dates[0]],
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
    queryFn: async ({ signal }) => {
      const availableDates = [];
      let failedDays = 0;
      for (let i = 0; i < dates.length; i += 4) {
        signal.throwIfAborted();
        const batch = dates.slice(i, i + 4);
        const results = await Promise.allSettled(batch.map((date) =>
          queryClient.fetchQuery(startTimesQuery(userId, token, date))
        ));
        results.forEach((result, index) => {
          if (result.status === "rejected") failedDays += 1;
          else if (result.value.length) availableDates.push(batch[index]);
        });
      }
      if (failedDays === dates.length) throw new Error("Не удалось загрузить календарь.");
      return { availableDates, failedDays };
    },
  });
}

export function createBooking(userId, token, booking) {
  return api.post("/api/userAccount/" + userId + "/book", booking, config(token));
}

export function cancelBooking(userId, token, bookingId) {
  return api.delete(
    "/api/userAccount/" + userId + "/bookings/" + bookingId, config(token)
  );
}

export async function refreshBookings(queryClient, userId, date) {
  const availability = queryClient.invalidateQueries({ queryKey: availabilityKey(userId, date) });
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: listKey(userId) }),
    availability.then(() => queryClient.invalidateQueries({ queryKey: calendarKey(userId) })),
  ]);
}
