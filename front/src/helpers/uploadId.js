export default function uploadId() {
  return Date.now().toString(36) + '-' +
    (Math.floor(Math.pow(36, 5) * Math.random() + 1)).toString(36)
}
