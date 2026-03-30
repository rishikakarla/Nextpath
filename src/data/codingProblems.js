// HackerRank-style coding problems
// Each problem has: inputFormat, outputFormat, constraints, examples[], testCases[], starterCode{}
// testCases: { input, expectedOutput, hidden }
// starterCode keyed by Judge0 language id: 71=Python3, 63=JS, 54=C++, 62=Java, 50=C

export const CODING_PROBLEMS = [
  // ── 1. Two Sum ────────────────────────────────────────────────────────────
  {
    id: 1, title: 'Two Sum', category: 'Arrays', difficulty: 'Easy',
    description: 'Given an array of integers and a target value, find the two numbers that add up to the target and print their 0-based indices (smaller index first).\n\nYou may assume each input has exactly one solution, and you may not use the same element twice.',
    inputFormat: 'First line: two integers N and Target separated by space.\nSecond line: N space-separated integers.',
    outputFormat: 'A single line with two space-separated indices i and j (i < j) such that nums[i] + nums[j] = target.',
    constraints: '2 ≤ N ≤ 10⁴\n-10⁹ ≤ nums[i] ≤ 10⁹\n-10⁹ ≤ target ≤ 10⁹',
    hint: 'Use a hash map to store each number\'s complement. One pass is enough.',
    examples: [
      { input: '4 9\n2 7 11 15', output: '0 1', explanation: 'nums[0] + nums[1] = 2 + 7 = 9. So output is 0 1.' },
      { input: '3 6\n3 2 4',     output: '1 2', explanation: 'nums[1] + nums[2] = 2 + 4 = 6.' },
    ],
    testCases: [
      { input: '4 9\n2 7 11 15',   expectedOutput: '0 1', hidden: false },
      { input: '3 6\n3 2 4',       expectedOutput: '1 2', hidden: false },
      { input: '2 6\n3 3',         expectedOutput: '0 1', hidden: true  },
      { input: '5 10\n1 4 8 2 9',  expectedOutput: '1 3', hidden: true  },
      { input: '4 0\n-1 0 1 2',    expectedOutput: '0 2', hidden: true  },
    ],
    starterCode: {
      71: `n, target = map(int, input().split())
nums = list(map(int, input().split()))

# Write your solution here
# Find indices i and j such that nums[i] + nums[j] == target
# Print: i j`,
      63: `const lines = require('fs').readFileSync('/dev/stdin','utf8').trim().split('\\n');
const [n, target] = lines[0].split(' ').map(Number);
const nums = lines[1].split(' ').map(Number);

// Write your solution here
// Find indices i and j such that nums[i] + nums[j] === target
// console.log(i + ' ' + j);`,
      54: `#include<bits/stdc++.h>
using namespace std;
int main(){
    int n, target; cin >> n >> target;
    vector<int> nums(n);
    for(auto &x: nums) cin >> x;

    // Write your solution here
    // Find indices i and j such that nums[i] + nums[j] == target
    // cout << i << " " << j;
}`,
    },
  },

  // ── 2. Maximum Subarray ───────────────────────────────────────────────────
  {
    id: 2, title: 'Maximum Subarray', category: 'Arrays', difficulty: 'Medium',
    description: 'Given an integer array, find the contiguous subarray (containing at least one number) which has the largest sum and return its sum.',
    inputFormat: 'First line: integer N.\nSecond line: N space-separated integers.',
    outputFormat: 'A single integer — the maximum subarray sum.',
    constraints: '1 ≤ N ≤ 10⁵\n-10⁴ ≤ nums[i] ≤ 10⁴',
    hint: 'Kadane\'s Algorithm: keep a running currentSum; if it goes below 0 reset it. Track the overall maximum.',
    examples: [
      { input: '9\n-2 1 -3 4 -1 2 1 -5 4', output: '6', explanation: '[4,-1,2,1] has the largest sum = 6.' },
      { input: '1\n1',                       output: '1', explanation: 'Only one element.' },
    ],
    testCases: [
      { input: '9\n-2 1 -3 4 -1 2 1 -5 4', expectedOutput: '6',  hidden: false },
      { input: '1\n1',                       expectedOutput: '1',  hidden: false },
      { input: '5\n5 4 -1 7 8',              expectedOutput: '23', hidden: true  },
      { input: '4\n-3 -2 -1 -4',             expectedOutput: '-1', hidden: true  },
      { input: '6\n1 -1 2 -2 3 -3',          expectedOutput: '3',  hidden: true  },
    ],
    starterCode: {
      71: `n = int(input())
nums = list(map(int, input().split()))

# Write your solution here
# Find the maximum sum of any contiguous subarray
# print(max_sum)`,
      63: `const lines = require('fs').readFileSync('/dev/stdin','utf8').trim().split('\\n');
const nums = lines[1].split(' ').map(Number);

// Write your solution here
// Find the maximum sum of any contiguous subarray
// console.log(maxSum);`,
      54: `#include<bits/stdc++.h>
using namespace std;
int main(){
    int n; cin >> n;
    vector<int> a(n); for(auto &x: a) cin >> x;

    // Write your solution here
    // Find the maximum sum of any contiguous subarray
    // cout << maxSum;
}`,
    },
  },

  // ── 3. Best Time to Buy and Sell Stock ────────────────────────────────────
  {
    id: 3, title: 'Best Time to Buy and Sell Stock', category: 'Arrays', difficulty: 'Easy',
    description: 'Given an array of stock prices where prices[i] is the price on day i, find the maximum profit you can achieve by buying on one day and selling on a later day.\n\nIf no profit is possible, return 0.',
    inputFormat: 'First line: integer N.\nSecond line: N space-separated integers (prices).',
    outputFormat: 'A single integer — the maximum profit.',
    constraints: '1 ≤ N ≤ 10⁵\n0 ≤ prices[i] ≤ 10⁴',
    hint: 'Track the minimum price seen so far. At each price, profit = price - minSoFar.',
    examples: [
      { input: '6\n7 1 5 3 6 4', output: '5', explanation: 'Buy at 1 (day 2), sell at 6 (day 5). Profit = 5.' },
      { input: '5\n7 6 4 3 1',   output: '0', explanation: 'Prices only fall — no profit possible.' },
    ],
    testCases: [
      { input: '6\n7 1 5 3 6 4', expectedOutput: '5', hidden: false },
      { input: '5\n7 6 4 3 1',   expectedOutput: '0', hidden: false },
      { input: '1\n5',           expectedOutput: '0', hidden: true  },
      { input: '4\n2 4 1 7',     expectedOutput: '6', hidden: true  },
      { input: '6\n3 3 5 0 0 3', expectedOutput: '3', hidden: true  },
    ],
    starterCode: {
      71: `n = int(input())
prices = list(map(int, input().split()))

# Write your solution here
# Find the max profit from one buy-sell transaction
# print(max_profit)`,
      63: `const lines = require('fs').readFileSync('/dev/stdin','utf8').trim().split('\\n');
const prices = lines[1].split(' ').map(Number);

// Write your solution here
// Find the max profit from one buy-sell transaction
// console.log(maxProfit);`,
      54: `#include<bits/stdc++.h>
using namespace std;
int main(){
    int n; cin >> n;
    vector<int> prices(n); for(auto &x: prices) cin >> x;

    // Write your solution here
    // Find the max profit from one buy-sell transaction
    // cout << profit;
}`,
    },
  },

  // ── 4. Rotate Array ───────────────────────────────────────────────────────
  {
    id: 4, title: 'Rotate Array', category: 'Arrays', difficulty: 'Medium',
    description: 'Given an array of N integers, rotate it to the right by K steps.\n\nElements shifted off the right end wrap around to the left.',
    inputFormat: 'First line: two integers N and K.\nSecond line: N space-separated integers.',
    outputFormat: 'N space-separated integers — the rotated array.',
    constraints: '1 ≤ N ≤ 10⁵\n0 ≤ K ≤ 10⁵',
    hint: 'k = k % n. Reverse the whole array, then reverse [0..k-1], then reverse [k..n-1].',
    examples: [
      { input: '7 3\n1 2 3 4 5 6 7', output: '5 6 7 1 2 3 4', explanation: 'Rotate right by 3.' },
      { input: '3 2\n-1 -100 3',     output: '3 -1 -100',      explanation: 'Rotate right by 2.' },
    ],
    testCases: [
      { input: '7 3\n1 2 3 4 5 6 7', expectedOutput: '5 6 7 1 2 3 4', hidden: false },
      { input: '3 2\n-1 -100 3',     expectedOutput: '3 -1 -100',      hidden: false },
      { input: '5 0\n1 2 3 4 5',     expectedOutput: '1 2 3 4 5',       hidden: true  },
      { input: '4 4\n1 2 3 4',       expectedOutput: '1 2 3 4',         hidden: true  },
      { input: '6 8\n1 2 3 4 5 6',   expectedOutput: '5 6 1 2 3 4',    hidden: true  },
    ],
    starterCode: {
      71: `n, k = map(int, input().split())
nums = list(map(int, input().split()))

# Write your solution here
# Rotate nums to the right by k steps
# print(*nums)`,
      63: `const lines = require('fs').readFileSync('/dev/stdin','utf8').trim().split('\\n');
const [n, k] = lines[0].split(' ').map(Number);
const nums = lines[1].split(' ').map(Number);

// Write your solution here
// Rotate nums to the right by k steps
// console.log(nums.join(' '));`,
      54: `#include<bits/stdc++.h>
using namespace std;
int main(){
    int n, k; cin >> n >> k;
    vector<int> a(n); for(auto &x: a) cin >> x;

    // Write your solution here
    // Rotate a to the right by k steps
    // for(int i=0;i<n;i++) cout << a[i] << " \n"[i==n-1];
}`,
    },
  },

  // ── 5. Valid Palindrome ───────────────────────────────────────────────────
  {
    id: 5, title: 'Valid Palindrome', category: 'Strings', difficulty: 'Easy',
    description: 'A string is a palindrome if, after converting all uppercase letters to lowercase and removing all non-alphanumeric characters, it reads the same forward and backward.\n\nGiven a string, return "true" or "false".',
    inputFormat: 'A single line containing the string.',
    outputFormat: '"true" if the string is a palindrome, "false" otherwise.',
    constraints: '1 ≤ s.length ≤ 2×10⁵\ns consists of printable ASCII characters.',
    hint: 'Filter to alphanumerics, lowercase, then use two pointers from each end.',
    examples: [
      { input: 'A man, a plan, a canal: Panama', output: 'true',  explanation: '"amanaplanacanalpanama" is a palindrome.' },
      { input: 'race a car',                     output: 'false', explanation: '"raceacar" is not a palindrome.' },
    ],
    testCases: [
      { input: 'A man, a plan, a canal: Panama', expectedOutput: 'true',  hidden: false },
      { input: 'race a car',                     expectedOutput: 'false', hidden: false },
      { input: ' ',                              expectedOutput: 'true',  hidden: true  },
      { input: 'Was it a car or a cat I saw?',   expectedOutput: 'true',  hidden: true  },
      { input: '0P',                             expectedOutput: 'false', hidden: true  },
    ],
    starterCode: {
      71: `s = input()

# Write your solution here
# Check if s is a palindrome (ignore non-alphanumeric, case-insensitive)
# print("true" or "false")`,
      63: `const s = require('fs').readFileSync('/dev/stdin','utf8').trim();

// Write your solution here
// Check if s is a palindrome (ignore non-alphanumeric, case-insensitive)
// console.log("true" or "false");`,
      54: `#include<bits/stdc++.h>
using namespace std;
int main(){
    string s; getline(cin, s);

    // Write your solution here
    // Check if s is a palindrome (ignore non-alphanumeric, case-insensitive)
    // cout << "true" or "false";
}`,
    },
  },

  // ── 6. Longest Common Prefix ──────────────────────────────────────────────
  {
    id: 6, title: 'Longest Common Prefix', category: 'Strings', difficulty: 'Easy',
    description: 'Write a function to find the longest common prefix string among an array of strings.\n\nIf there is no common prefix, return an empty string.',
    inputFormat: 'First line: integer N.\nNext N lines: one string each.',
    outputFormat: 'The longest common prefix, or an empty line if none exists.',
    constraints: '1 ≤ N ≤ 200\n0 ≤ strs[i].length ≤ 200\nAll strings consist of lowercase English letters.',
    hint: 'Sort the array; compare only the first and last string character by character.',
    examples: [
      { input: '3\nflower\nflow\nflight', output: 'fl',  explanation: '"fl" is the common prefix of all three.' },
      { input: '3\ndog\nracecar\ncar',   output: '',    explanation: 'No common prefix exists.' },
    ],
    testCases: [
      { input: '3\nflower\nflow\nflight', expectedOutput: 'fl',     hidden: false },
      { input: '3\ndog\nracecar\ncar',   expectedOutput: '',        hidden: false },
      { input: '1\nalone',              expectedOutput: 'alone',   hidden: true  },
      { input: '2\nab\nabc',            expectedOutput: 'ab',      hidden: true  },
      { input: '3\nabc\nabc\nabc',      expectedOutput: 'abc',     hidden: true  },
    ],
    starterCode: {
      71: `n = int(input())
strs = [input() for _ in range(n)]

# Write your solution here
# Find the longest common prefix among all strings
# print(prefix)`,
      63: `const lines = require('fs').readFileSync('/dev/stdin','utf8').trim().split('\\n');
const n = Number(lines[0]);
const strs = lines.slice(1, n + 1);

// Write your solution here
// Find the longest common prefix among all strings
// console.log(prefix);`,
      54: `#include<bits/stdc++.h>
using namespace std;
int main(){
    int n; cin >> n; cin.ignore();
    vector<string> v(n);
    for(auto &s: v) getline(cin, s);

    // Write your solution here
    // Find the longest common prefix among all strings
    // cout << prefix;
}`,
    },
  },

  // ── 7. Anagram Check ─────────────────────────────────────────────────────
  {
    id: 7, title: 'Anagram Check', category: 'Strings', difficulty: 'Easy',
    description: 'Given two strings s and t, return "true" if t is an anagram of s, and "false" otherwise.\n\nAn anagram uses all original letters exactly once in a different arrangement.',
    inputFormat: 'Two lines, each containing one string.',
    outputFormat: '"true" or "false".',
    constraints: '1 ≤ s.length, t.length ≤ 5×10⁴\nStrings consist of lowercase English letters.',
    hint: 'Sort both strings and compare, or use a frequency count array.',
    examples: [
      { input: 'anagram\nnagaram', output: 'true',  explanation: 'Same letters rearranged.' },
      { input: 'rat\ncar',        output: 'false', explanation: 'Different letter sets.' },
    ],
    testCases: [
      { input: 'anagram\nnagaram', expectedOutput: 'true',  hidden: false },
      { input: 'rat\ncar',        expectedOutput: 'false', hidden: false },
      { input: 'a\na',            expectedOutput: 'true',  hidden: true  },
      { input: 'ab\nba',          expectedOutput: 'true',  hidden: true  },
      { input: 'listen\nsilent',  expectedOutput: 'true',  hidden: true  },
    ],
    starterCode: {
      71: `s = input()
t = input()

# Write your solution here
# Check if t is an anagram of s
# print("true" or "false")`,
      63: `const lines = require('fs').readFileSync('/dev/stdin','utf8').trim().split('\\n');
const [s, t] = lines;

// Write your solution here
// Check if t is an anagram of s
// console.log("true" or "false");`,
      54: `#include<bits/stdc++.h>
using namespace std;
int main(){
    string s, t; cin >> s >> t;

    // Write your solution here
    // Check if t is an anagram of s
    // cout << "true" or "false";
}`,
    },
  },

  // ── 8. Fibonacci Number ───────────────────────────────────────────────────
  {
    id: 8, title: 'Fibonacci Number', category: 'Recursion', difficulty: 'Easy',
    description: 'The Fibonacci sequence: F(0)=0, F(1)=1, F(n)=F(n-1)+F(n-2).\n\nGiven n, compute F(n).',
    inputFormat: 'A single integer n.',
    outputFormat: 'A single integer — F(n).',
    constraints: '0 ≤ n ≤ 30',
    hint: 'Use iteration or memoized recursion. Naive recursion (without memo) is O(2ⁿ) — avoid for large n.',
    examples: [
      { input: '4', output: '3',  explanation: 'F(4) = F(3)+F(2) = 2+1 = 3.' },
      { input: '0', output: '0',  explanation: 'Base case.' },
    ],
    testCases: [
      { input: '4',  expectedOutput: '3',    hidden: false },
      { input: '0',  expectedOutput: '0',    hidden: false },
      { input: '1',  expectedOutput: '1',    hidden: true  },
      { input: '10', expectedOutput: '55',   hidden: true  },
      { input: '20', expectedOutput: '6765', hidden: true  },
    ],
    starterCode: {
      71: `n = int(input())

# Write your solution here
# Compute the nth Fibonacci number
# print(result)`,
      63: `const n = Number(require('fs').readFileSync('/dev/stdin','utf8').trim());

// Write your solution here
// Compute the nth Fibonacci number
// console.log(result);`,
      54: `#include<bits/stdc++.h>
using namespace std;
int main(){
    int n; cin >> n;

    // Write your solution here
    // Compute the nth Fibonacci number
    // cout << result;
}`,
    },
  },

  // ── 9. Power of a Number ─────────────────────────────────────────────────
  {
    id: 9, title: 'Power of a Number', category: 'Recursion', difficulty: 'Medium',
    description: 'Implement pow(x, n) which calculates x raised to the power n.\n\nAssume n is a non-negative integer. Print the result as an integer if it is whole, otherwise as a float with up to 5 decimal places.',
    inputFormat: 'Two values on one line: x (float) and n (integer).',
    outputFormat: 'The value of x^n. If result is a whole number print as integer, else up to 5 decimal places.',
    constraints: '-100.0 < x < 100.0\n0 ≤ n ≤ 30',
    hint: 'Fast exponentiation: if n is even, pow(x,n) = pow(x*x, n/2). If odd, x * pow(x, n-1).',
    examples: [
      { input: '2.0 10',  output: '1024',    explanation: '2^10 = 1024.' },
      { input: '2.1 3',   output: '9.261',   explanation: '2.1^3 = 9.261.' },
    ],
    testCases: [
      { input: '2.0 10',  expectedOutput: '1024',  hidden: false },
      { input: '2.1 3',   expectedOutput: '9.261', hidden: false },
      { input: '2.0 0',   expectedOutput: '1',     hidden: true  },
      { input: '1.0 100', expectedOutput: '1',     hidden: true  },
      { input: '3.0 5',   expectedOutput: '243',   hidden: true  },
    ],
    starterCode: {
      71: `parts = input().split()
x = float(parts[0])
n = int(parts[1])

# Write your solution here
# Compute x raised to the power n
# Print as integer if whole, else up to 5 decimal places`,
      63: `const [xStr, nStr] = require('fs').readFileSync('/dev/stdin','utf8').trim().split(' ');
const x = parseFloat(xStr);
const n = parseInt(nStr);

// Write your solution here
// Compute x raised to the power n
// Print as integer if whole, else up to 5 decimal places`,
      54: `#include<bits/stdc++.h>
using namespace std;
int main(){
    double x; int n; cin >> x >> n;

    // Write your solution here
    // Compute x raised to the power n
    // Print as integer if whole, else up to 5 decimal places
}`,
    },
  },

  // ── 10. Tower of Hanoi ────────────────────────────────────────────────────
  {
    id: 10, title: 'Tower of Hanoi', category: 'Recursion', difficulty: 'Medium',
    description: 'Print all the moves to solve the Tower of Hanoi for N disks.\n\nMove all disks from rod A to rod C using rod B as auxiliary. Always move the smaller disk on top.',
    inputFormat: 'A single integer N — number of disks.',
    outputFormat: 'Each line: "Move disk D from X to Y" where D is disk number (1=smallest), X is source, Y is destination.',
    constraints: '1 ≤ N ≤ 10',
    hint: 'Recursively: move top N-1 disks to auxiliary, move disk N to destination, move N-1 disks from auxiliary to destination.',
    examples: [
      {
        input: '2',
        output: 'Move disk 1 from A to B\nMove disk 2 from A to C\nMove disk 1 from B to C',
        explanation: '3 moves needed for 2 disks.',
      },
    ],
    testCases: [
      { input: '2', expectedOutput: 'Move disk 1 from A to B\nMove disk 2 from A to C\nMove disk 1 from B to C', hidden: false },
      { input: '1', expectedOutput: 'Move disk 1 from A to C', hidden: false },
      { input: '3', expectedOutput: 'Move disk 1 from A to C\nMove disk 2 from A to B\nMove disk 1 from C to B\nMove disk 3 from A to C\nMove disk 1 from B to A\nMove disk 2 from B to C\nMove disk 1 from A to C', hidden: true },
    ],
    starterCode: {
      71: `n = int(input())

# Write your solution here
# Print all moves to solve Tower of Hanoi for n disks
# Each move format: "Move disk D from X to Y"
# Move from rod 'A' to rod 'C' using rod 'B'`,
      63: `const n = Number(require('fs').readFileSync('/dev/stdin','utf8').trim());

// Write your solution here
// Print all moves to solve Tower of Hanoi for n disks
// Each move format: "Move disk D from X to Y"
// Move from rod 'A' to rod 'C' using rod 'B'`,
      54: `#include<bits/stdc++.h>
using namespace std;
int main(){
    int n; cin >> n;

    // Write your solution here
    // Print all moves to solve Tower of Hanoi for n disks
    // Each move format: "Move disk D from X to Y"
    // Move from rod 'A' to rod 'C' using rod 'B'
}`,
    },
  },

  // ── 11. Reverse Linked List (Array I/O) ───────────────────────────────────
  {
    id: 11, title: 'Reverse Linked List', category: 'Linked Lists', difficulty: 'Easy',
    description: 'Given a linked list represented as space-separated integers, reverse it and print the result.\n\nSimulate a singly linked list reversal.',
    inputFormat: 'A single line of space-separated integers representing the linked list nodes.',
    outputFormat: 'Space-separated integers — the reversed linked list.',
    constraints: '0 ≤ N ≤ 5000\n-5000 ≤ node.val ≤ 5000',
    hint: 'Three pointers: prev=null, curr=head, next. On each step: save next, point curr→prev, advance.',
    examples: [
      { input: '1 2 3 4 5', output: '5 4 3 2 1', explanation: 'Simple reversal.' },
      { input: '1 2',       output: '2 1',       explanation: 'Two-node list.' },
    ],
    testCases: [
      { input: '1 2 3 4 5', expectedOutput: '5 4 3 2 1', hidden: false },
      { input: '1 2',       expectedOutput: '2 1',       hidden: false },
      { input: '1',         expectedOutput: '1',         hidden: true  },
      { input: '5 4 3 2 1', expectedOutput: '1 2 3 4 5', hidden: true  },
    ],
    starterCode: {
      71: `nums = list(map(int, input().split()))

# Write your solution here
# Reverse the list (simulate linked list reversal with three pointers)
# print(*reversed_nums)`,
      63: `const nums = require('fs').readFileSync('/dev/stdin','utf8').trim().split(' ').map(Number);

// Write your solution here
// Reverse the list (simulate linked list reversal with three pointers)
// console.log(reversed.join(' '));`,
      54: `#include<bits/stdc++.h>
using namespace std;
int main(){
    vector<int> a; int x;
    string line; getline(cin, line);
    istringstream ss(line); while(ss >> x) a.push_back(x);

    // Write your solution here
    // Reverse the list (simulate linked list reversal with three pointers)
    // for(int i=0;i<(int)a.size();i++) cout << a[i] << " ";
}`,
    },
  },

  // ── 12. Detect Cycle (Union-Find simulation) ──────────────────────────────
  {
    id: 12, title: 'Detect Cycle in Linked List', category: 'Linked Lists', difficulty: 'Medium',
    description: 'Given a sequence of integers representing node values and a "tail connects to index" value (-1 means no cycle), determine if the linked list has a cycle.\n\nOutput "true" if cycle exists, "false" otherwise.',
    inputFormat: 'First line: space-separated integers (node values).\nSecond line: integer pos (-1 = no cycle, else index where tail connects).',
    outputFormat: '"true" or "false".',
    constraints: '0 ≤ N ≤ 10⁴\n-1 ≤ pos < N',
    hint: 'If pos >= 0, a cycle exists. In real Floyd\'s algorithm: slow and fast pointer meet if there\'s a cycle.',
    examples: [
      { input: '3 2 0 -4\n1', output: 'true',  explanation: 'Tail connects back to index 1 — cycle exists.' },
      { input: '1 2\n-1',     output: 'false', explanation: 'No cycle.' },
    ],
    testCases: [
      { input: '3 2 0 -4\n1',  expectedOutput: 'true',  hidden: false },
      { input: '1 2\n-1',      expectedOutput: 'false', hidden: false },
      { input: '1\n0',         expectedOutput: 'true',  hidden: true  },
      { input: '1\n-1',        expectedOutput: 'false', hidden: true  },
    ],
    starterCode: {
      71: `nodes = input().split()  # node values
pos = int(input())       # tail connects to this index (-1 = no cycle)

# Write your solution here
# Determine if a cycle exists based on pos
# print("true" or "false")`,
      63: `const lines = require('fs').readFileSync('/dev/stdin','utf8').trim().split('\\n');
const nodes = lines[0].split(' ');
const pos = parseInt(lines[1]);

// Write your solution here
// Determine if a cycle exists based on pos
// console.log("true" or "false");`,
      54: `#include<bits/stdc++.h>
using namespace std;
int main(){
    string line; getline(cin, line);
    int pos; cin >> pos;

    // Write your solution here
    // Determine if a cycle exists based on pos
    // cout << "true" or "false";
}`,
    },
  },

  // ── 13. Merge Two Sorted Lists ────────────────────────────────────────────
  {
    id: 13, title: 'Merge Two Sorted Lists', category: 'Linked Lists', difficulty: 'Easy',
    description: 'Given two sorted linked lists (as space-separated integers), merge them into one sorted linked list and print it.\n\nIf a list is empty, input the word "null".',
    inputFormat: 'First line: space-separated integers for list1 (or "null").\nSecond line: space-separated integers for list2 (or "null").',
    outputFormat: 'Space-separated integers of the merged sorted list, or "null" if both are empty.',
    constraints: '0 ≤ N, M ≤ 50\n-100 ≤ node.val ≤ 100\nBoth lists are sorted in non-decreasing order.',
    hint: 'Use two pointers. Always pick the smaller head and advance that pointer.',
    examples: [
      { input: '1 2 4\n1 3 4', output: '1 1 2 3 4 4', explanation: 'Standard merge.' },
      { input: 'null\nnull',   output: 'null',         explanation: 'Both empty.' },
    ],
    testCases: [
      { input: '1 2 4\n1 3 4', expectedOutput: '1 1 2 3 4 4', hidden: false },
      { input: 'null\nnull',   expectedOutput: 'null',         hidden: false },
      { input: 'null\n0',      expectedOutput: '0',            hidden: true  },
      { input: '1 3 5\n2 4 6', expectedOutput: '1 2 3 4 5 6', hidden: true  },
    ],
    starterCode: {
      71: `l1 = input().strip()
l2 = input().strip()
a = [] if l1 == 'null' else list(map(int, l1.split()))
b = [] if l2 == 'null' else list(map(int, l2.split()))

# Write your solution here
# Merge the two sorted lists using two pointers
# Print space-separated result, or "null" if empty`,
      63: `const lines = require('fs').readFileSync('/dev/stdin','utf8').trim().split('\\n');
const a = lines[0] === 'null' ? [] : lines[0].split(' ').map(Number);
const b = lines[1] === 'null' ? [] : lines[1].split(' ').map(Number);

// Write your solution here
// Merge the two sorted lists using two pointers
// console.log(merged.length ? merged.join(' ') : 'null');`,
      54: `#include<bits/stdc++.h>
using namespace std;
int main(){
    string la, lb; getline(cin, la); getline(cin, lb);
    vector<int> a, b;
    if(la != "null"){ istringstream s(la); int x; while(s >> x) a.push_back(x); }
    if(lb != "null"){ istringstream s(lb); int x; while(s >> x) b.push_back(x); }

    // Write your solution here
    // Merge the two sorted vectors using two pointers
    // Print space-separated result, or "null" if empty
}`,
    },
  },

  // ── 14. Valid Parentheses ─────────────────────────────────────────────────
  {
    id: 14, title: 'Valid Parentheses', category: 'Stacks', difficulty: 'Easy',
    description: 'Given a string containing only "(", ")", "{", "}", "[" and "]", determine if the input string is valid.\n\nAn input string is valid if: open brackets are closed by the same type, and in the correct order.',
    inputFormat: 'A single line containing the bracket string.',
    outputFormat: '"true" or "false".',
    constraints: '1 ≤ s.length ≤ 10⁴\ns consists only of ()[]{}',
    hint: 'Use a stack. Push opening brackets. On closing bracket, check if top matches.',
    examples: [
      { input: '()[]{}', output: 'true',  explanation: 'All brackets properly matched.' },
      { input: '(]',     output: 'false', explanation: 'Mismatched bracket types.' },
    ],
    testCases: [
      { input: '()[]{}', expectedOutput: 'true',  hidden: false },
      { input: '(]',     expectedOutput: 'false', hidden: false },
      { input: '()',     expectedOutput: 'true',  hidden: true  },
      { input: '([)]',   expectedOutput: 'false', hidden: true  },
      { input: '{[]}',   expectedOutput: 'true',  hidden: true  },
    ],
    starterCode: {
      71: `s = input()

# Write your solution here
# Use a stack to check if brackets are valid
# print("true" or "false")`,
      63: `const s = require('fs').readFileSync('/dev/stdin','utf8').trim();

// Write your solution here
// Use a stack to check if brackets are valid
// console.log("true" or "false");`,
      54: `#include<bits/stdc++.h>
using namespace std;
int main(){
    string s; cin >> s;

    // Write your solution here
    // Use a stack to check if brackets are valid
    // cout << "true" or "false";
}`,
    },
  },

  // ── 15. Min Stack ─────────────────────────────────────────────────────────
  {
    id: 15, title: 'Min Stack', category: 'Stacks', difficulty: 'Medium',
    description: 'Simulate a MinStack that supports push, pop, top, and getMin in O(1) time.\n\nProcess a series of operations and output the result of each "top" and "getMin" call.',
    inputFormat: 'First line: integer Q (number of operations).\nNext Q lines: operation name and optional value.\nOperations: push X | pop | top | getMin',
    outputFormat: 'For each "top" or "getMin" operation, print the result on a new line.',
    constraints: '1 ≤ Q ≤ 3×10⁴\n-2³¹ ≤ val ≤ 2³¹-1\nAll "pop", "top", "getMin" calls are valid (stack is non-empty).',
    hint: 'Use two stacks: one for values, one tracking the current minimum at each depth.',
    examples: [
      {
        input: '6\npush -2\npush 0\npush -3\ngetMin\npop\ntop',
        output: '-3\n0',
        explanation: 'getMin → -3, after pop top → 0.',
      },
    ],
    testCases: [
      { input: '6\npush -2\npush 0\npush -3\ngetMin\npop\ntop', expectedOutput: '-3\n0', hidden: false },
      { input: '3\npush 1\npush 2\ngetMin',                      expectedOutput: '1',     hidden: true  },
      { input: '5\npush 5\npush 3\npush 7\ngetMin\ntop',         expectedOutput: '3\n7',  hidden: true  },
    ],
    starterCode: {
      71: `import sys
input = sys.stdin.readline
q = int(input())

# Write your solution here
# Use two stacks: one for values, one for tracking minimums
# For each operation process push/pop/top/getMin
for _ in range(q):
    op = input().split()
    # handle op[0] == 'push', 'pop', 'top', 'getMin'
    pass`,
      63: `const lines = require('fs').readFileSync('/dev/stdin','utf8').trim().split('\\n');
const q = Number(lines[0]);

// Write your solution here
// Use two stacks: one for values, one for tracking minimums
for(let i = 1; i <= q; i++){
  const parts = lines[i].split(' ');
  // handle parts[0] === 'push', 'pop', 'top', 'getMin'
}`,
      54: `#include<bits/stdc++.h>
using namespace std;
int main(){
    int q; cin >> q; cin.ignore();

    // Write your solution here
    // Use two stacks: one for values, one for tracking minimums
    while(q--){
        string op; cin >> op;
        // handle push, pop, top, getMin
        cin.ignore();
    }
}`,
    },
  },

  // ── 16. Evaluate Reverse Polish Notation ──────────────────────────────────
  {
    id: 16, title: 'Evaluate Reverse Polish Notation', category: 'Stacks', difficulty: 'Medium',
    description: 'Evaluate the value of an arithmetic expression in Reverse Polish Notation (postfix).\n\nValid operators: +, -, *, /. Division truncates toward zero.',
    inputFormat: 'A single line of space-separated tokens.',
    outputFormat: 'A single integer — the result.',
    constraints: '1 ≤ tokens.length ≤ 10⁴\ntokens[i] is an integer or one of +, -, *, /\nAnswer fits in 32-bit integer.',
    hint: 'Push numbers to stack. On operator, pop two, apply operator (second op first), push result.',
    examples: [
      { input: '2 1 + 3 *', output: '9',  explanation: '((2+1)*3) = 9.' },
      { input: '4 13 5 / +', output: '6', explanation: '(4+(13/5)) = 4+2 = 6.' },
    ],
    testCases: [
      { input: '2 1 + 3 *',       expectedOutput: '9',  hidden: false },
      { input: '4 13 5 / +',      expectedOutput: '6',  hidden: false },
      { input: '10 6 9 3 + -11 * / * 17 + 5 +', expectedOutput: '22', hidden: true },
      { input: '3 4 +',           expectedOutput: '7',  hidden: true  },
    ],
    starterCode: {
      71: `tokens = input().split()

# Write your solution here
# Use a stack: push numbers, on operator pop two and push result
# print(stack[0])`,
      63: `const tokens = require('fs').readFileSync('/dev/stdin','utf8').trim().split(' ');

// Write your solution here
// Use a stack: push numbers, on operator pop two and push result
// console.log(stack[0]);`,
      54: `#include<bits/stdc++.h>
using namespace std;
int main(){
    // Write your solution here
    // Read tokens one by one
    // Use a stack: push numbers, on operator pop two and push result
    string t;
    while(cin >> t){
        // handle number or operator
    }
    // cout << result;
}`,
    },
  },

  // ── 17. Next Greater Element ──────────────────────────────────────────────
  {
    id: 17, title: 'Next Greater Element', category: 'Stacks', difficulty: 'Medium',
    description: 'Given a circular integer array, for each element find the next greater element searching clockwise.\n\nIf no greater element exists, output -1 for that position.',
    inputFormat: 'First line: integer N.\nSecond line: N space-separated integers.',
    outputFormat: 'N space-separated integers — the next greater element for each position.',
    constraints: '1 ≤ N ≤ 10⁴\n-10⁹ ≤ nums[i] ≤ 10⁹',
    hint: 'Use a monotonic stack. Iterate 2N times (circular). Push indices, pop when a greater element is found.',
    examples: [
      { input: '3\n1 2 1', output: '2 -1 2', explanation: 'Next greater of 1→2, 2→none(-1), 1→2 (circular).' },
      { input: '4\n1 2 3 4', output: '2 3 4 -1', explanation: 'Last element has no greater.' },
    ],
    testCases: [
      { input: '3\n1 2 1',     expectedOutput: '2 -1 2',      hidden: false },
      { input: '4\n1 2 3 4',   expectedOutput: '2 3 4 -1',    hidden: false },
      { input: '1\n5',         expectedOutput: '-1',          hidden: true  },
      { input: '5\n5 4 3 2 1', expectedOutput: '-1 5 5 5 5',  hidden: true  },
    ],
    starterCode: {
      71: `n = int(input())
nums = list(map(int, input().split()))
res = [-1] * n

# Write your solution here
# Use a monotonic stack, iterate 2*n times for circular array
# print(*res)`,
      63: `const lines = require('fs').readFileSync('/dev/stdin','utf8').trim().split('\\n');
const n = Number(lines[0]);
const nums = lines[1].split(' ').map(Number);
const res = new Array(n).fill(-1);

// Write your solution here
// Use a monotonic stack, iterate 2*n times for circular array
// console.log(res.join(' '));`,
      54: `#include<bits/stdc++.h>
using namespace std;
int main(){
    int n; cin >> n;
    vector<int> a(n); for(auto &x: a) cin >> x;
    vector<int> res(n, -1);

    // Write your solution here
    // Use a monotonic stack, iterate 2*n times for circular array
    // for(int i=0;i<n;i++) cout << res[i] << " \n"[i==n-1];
}`,
    },
  },

  // ── 18. Queue Using Stacks ────────────────────────────────────────────────
  {
    id: 18, title: 'Implement Queue Using Stacks', category: 'Queues', difficulty: 'Easy',
    description: 'Simulate a FIFO queue using only stack operations.\n\nProcess a series of operations: push, pop, peek, empty.',
    inputFormat: 'First line: integer Q.\nNext Q lines: operation (push X | pop | peek | empty).',
    outputFormat: 'For each "pop", "peek", or "empty" operation, print the result on a new line.',
    constraints: '1 ≤ Q ≤ 100\n1 ≤ val ≤ 9\nAll "pop" and "peek" calls are valid.',
    hint: 'Use two stacks (in/out). Transfer from in→out when out is empty and pop/peek is called.',
    examples: [
      {
        input: '5\npush 1\npush 2\npeek\npop\nempty',
        output: '1\n1\nfalse',
        explanation: 'peek→1, pop→1, empty→false (2 remains).',
      },
    ],
    testCases: [
      { input: '5\npush 1\npush 2\npeek\npop\nempty', expectedOutput: '1\n1\nfalse', hidden: false },
      { input: '3\npush 5\npop\nempty',               expectedOutput: '5\ntrue',    hidden: true  },
    ],
    starterCode: {
      71: `q = int(input())

# Write your solution here
# Simulate a queue using two stacks (in_stack and out_stack)
for _ in range(q):
    op = input().split()
    # handle op[0] == 'push', 'pop', 'peek', 'empty'
    pass`,
      63: `const lines = require('fs').readFileSync('/dev/stdin','utf8').trim().split('\\n');
const q = Number(lines[0]);

// Write your solution here
// Simulate a queue using two stacks (inStack and outStack)
for(let i = 1; i <= q; i++){
  const [op, v] = lines[i].split(' ');
  // handle 'push', 'pop', 'peek', 'empty'
}`,
      54: `#include<bits/stdc++.h>
using namespace std;
int main(){
    int q; cin >> q; cin.ignore();

    // Write your solution here
    // Simulate a queue using two stacks
    while(q--){
        string op; cin >> op;
        // handle push, pop, peek, empty
        cin.ignore();
    }
}`,
    },
  },

  // ── 19. Number of Recent Calls ────────────────────────────────────────────
  {
    id: 19, title: 'Number of Recent Calls', category: 'Queues', difficulty: 'Easy',
    description: 'You have a RecentCounter class. Each call ping(t) registers a new request at time t.\n\nReturn the number of requests in the inclusive range [t - 3000, t]. Each new t is strictly greater than the previous.',
    inputFormat: 'First line: integer N (number of pings).\nNext N lines: integer t.',
    outputFormat: 'N lines — the count returned by each ping call.',
    constraints: '1 ≤ N ≤ 10⁴\n1 ≤ t ≤ 10⁹\nEach t is strictly greater than the previous.',
    hint: 'Use a queue. Append t, then remove all elements < t-3000. Queue length is the answer.',
    examples: [
      { input: '4\n1\n100\n3001\n3002', output: '1\n2\n3\n3', explanation: 'At t=3002: requests in [2,3002] → {100,3001,3002} = 3.' },
    ],
    testCases: [
      { input: '4\n1\n100\n3001\n3002', expectedOutput: '1\n2\n3\n3', hidden: false },
      { input: '1\n1',                  expectedOutput: '1',           hidden: true  },
      { input: '3\n100\n200\n300',      expectedOutput: '1\n2\n3',    hidden: true  },
    ],
    starterCode: {
      71: `n = int(input())

# Write your solution here
# Use a queue to track recent pings within [t-3000, t]
for _ in range(n):
    t = int(input())
    # add t to queue, remove elements < t-3000, print queue size
    pass`,
      63: `const lines = require('fs').readFileSync('/dev/stdin','utf8').trim().split('\\n');
const n = Number(lines[0]);

// Write your solution here
// Use a queue to track recent pings within [t-3000, t]
for(let i = 1; i <= n; i++){
  const t = Number(lines[i]);
  // add t to queue, remove elements < t-3000, print queue size
}`,
      54: `#include<bits/stdc++.h>
using namespace std;
int main(){
    int n; cin >> n;

    // Write your solution here
    // Use a deque to track recent pings within [t-3000, t]
    while(n--){
        int t; cin >> t;
        // add t to deque, remove elements < t-3000, print size
    }
}`,
    },
  },

  // ── 20. Sliding Window Maximum ────────────────────────────────────────────
  {
    id: 20, title: 'Sliding Window Maximum', category: 'Queues', difficulty: 'Hard',
    description: 'Given an array of integers and a sliding window of size k, find the maximum value in each window position as it moves from left to right.',
    inputFormat: 'First line: two integers N and K.\nSecond line: N space-separated integers.',
    outputFormat: 'Space-separated integers — the max of each window.',
    constraints: '1 ≤ K ≤ N ≤ 10⁵\n-10⁴ ≤ nums[i] ≤ 10⁴',
    hint: 'Use a monotonic deque storing indices. Remove indices outside the window. Front of deque is always the maximum.',
    examples: [
      { input: '8 3\n1 3 -1 -3 5 3 6 7', output: '3 3 5 5 6 7', explanation: 'Windows: [1,3,-1]→3, [3,-1,-3]→3, [-1,-3,5]→5, [-3,5,3]→5, [5,3,6]→6, [3,6,7]→7.' },
      { input: '4 1\n4 2 3 1',            output: '4 2 3 1',     explanation: 'Window size 1 — each element is the max.' },
    ],
    testCases: [
      { input: '8 3\n1 3 -1 -3 5 3 6 7', expectedOutput: '3 3 5 5 6 7', hidden: false },
      { input: '4 1\n4 2 3 1',            expectedOutput: '4 2 3 1',     hidden: false },
      { input: '3 3\n1 2 3',              expectedOutput: '3',           hidden: true  },
      { input: '5 2\n5 1 4 2 3',          expectedOutput: '5 4 4 3',    hidden: true  },
    ],
    starterCode: {
      71: `n, k = map(int, input().split())
nums = list(map(int, input().split()))
res = []

# Write your solution here
# Use a monotonic deque storing indices
# Remove indices outside window, maintain decreasing order
# print(*res)`,
      63: `const lines = require('fs').readFileSync('/dev/stdin','utf8').trim().split('\\n');
const [n, k] = lines[0].split(' ').map(Number);
const nums = lines[1].split(' ').map(Number);
const res = [];

// Write your solution here
// Use a monotonic deque storing indices
// Remove indices outside window, maintain decreasing order
// console.log(res.join(' '));`,
      54: `#include<bits/stdc++.h>
using namespace std;
int main(){
    int n, k; cin >> n >> k;
    vector<int> a(n); for(auto &x: a) cin >> x;

    // Write your solution here
    // Use a monotonic deque storing indices
    // Remove indices outside window, maintain decreasing order
}`,
    },
  },
]
