import dayjs from 'dayjs'
import 'dayjs/locale/id'

dayjs.locale('id')

export function formatDate(value) {
  if (!value) return '-'
  return dayjs(value).format('DD MMM YYYY')
}

export function formatDateTime(value) {
  if (!value) return '-'
  return dayjs(value).format('DD MMM YYYY, HH:mm')
}

export function isWithinOneHourFromServerCreatedAt(createdAt) {
  if (!createdAt) return false
  return dayjs().diff(dayjs(createdAt), 'minute') <= 60
}
