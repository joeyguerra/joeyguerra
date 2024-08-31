import assert from "assert"
import test from 'node:test'
const isPalindrome = word => {
    const half = Math.ceil(word.length / 2)
    const length = word.length
    // console.log(word, half, length, word.substring(0, half))
    // console.log(word.substring(length % 2 == 0 ? half : half - 1, length))
    return word.substring(0, half) == word.substring(length % 2 == 0 ? half : half - 1, length).split("").reverse().join("")
}

test("Palindromes", t=>{
    t.test("Should be a palindrome", async ()=>{
        const palindromeExamples = ["A but tuba", "tacocat", "A car, a man, a maraca.", "A dog, a plan, a canal: pagoda.",
            "A lad named E. Mandala", "As I pee, sir, I see Pisa!"]
        palindromeExamples.forEach(word => assert.ok(isPalindrome(word.replace(/[\s|,|\.\:\!]/g, "").toLowerCase())))
    })
})