export const toReadableTime = (sec = 0) => {
  sec = isNaN(sec) ? 0 : sec
  const minutes = `0${Math.floor(sec / 60)}`.slice(-2)
  const seconds = `0${Math.floor(sec - (minutes * 60))}`.slice(-2)
  return `${minutes}:${seconds}`
}
