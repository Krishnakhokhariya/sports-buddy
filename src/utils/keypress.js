export function handleEnterKey(e, callback) {
  if (e.key === "Enter") {
    e.preventDefault();
    callback();
  }
}