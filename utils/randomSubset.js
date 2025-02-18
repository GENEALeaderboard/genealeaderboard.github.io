export function getRandomSubset(array, n) {
  // Shuffle the array using Fisher-Yates algorithm
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }

  // Return the first `n` elements
  return array.slice(0, n)
}
