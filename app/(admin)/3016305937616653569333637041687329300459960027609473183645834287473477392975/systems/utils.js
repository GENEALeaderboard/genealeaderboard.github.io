// export function calculateCombinations(n, k) {
//   // Helper function to calculate factorial
//   function factorial(num) {
//     if (num === 0 || num === 1) return 1
//     return num * factorial(num - 1)
//   }

//   // Calculate the combination
//   return Math.round(factorial(n) / (factorial(k) * factorial(n - k)))
// }

export function calculateCombinations(n, k) {
  // Helper function to calculate factorial
  function factorial(num) {
    if (num === 0 || num === 1) return 1
    let result = 1
    for (let i = 2; i <= num; i++) {
      result *= i
    }
    return result
  }

  // Calculate the combination
  if (k > n) {
    return 0 // If k is greater than n, combination is not defined
  }
  return Math.round(factorial(n) / (factorial(k) * factorial(n - k)))
}

export function incrementAlpha(str) {
  let carry = 1
  let result = ""

  for (let i = str.length - 1; i >= 0; i--) {
    let code = str.charCodeAt(i) - 65 + carry
    carry = 0
    if (code === 26) {
      code = 0
      carry = 1
    }
    result = String.fromCharCode(65 + code) + result
  }

  if (carry === 1) {
    result = "A" + result
  }

  return result
}
