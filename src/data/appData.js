export const ASSESSMENT_QUESTIONS = [
  {
    id: 1, category: 'Programming',
    question: 'What is the time complexity of accessing an element in an array by index?',
    options: ['O(n)', 'O(log n)', 'O(1)', 'O(n²)'],
    answer: 2,
  },
  {
    id: 2, category: 'Programming',
    question: 'Which of the following is NOT a primitive data type in most programming languages?',
    options: ['Integer', 'Boolean', 'Array', 'Float'],
    answer: 2,
  },
  {
    id: 3, category: 'Programming',
    question: 'What does "recursion" mean in programming?',
    options: [
      'A loop that runs a fixed number of times',
      'A function that calls itself',
      'A data structure that stores elements',
      'A method that sorts an array',
    ],
    answer: 1,
  },
  {
    id: 4, category: 'Programming',
    question: 'What is the output of: 5 // 2 in Python?',
    options: ['2.5', '2', '3', 'Error'],
    answer: 1,
  },
  {
    id: 5, category: 'Programming',
    question: 'Which keyword is used to create a class in most OOP languages?',
    options: ['object', 'struct', 'class', 'type'],
    answer: 2,
  },
  {
    id: 6, category: 'Logical Reasoning',
    question: 'If A > B and B > C, which of the following is always true?',
    options: ['A = C', 'A < C', 'A > C', 'A ≤ C'],
    answer: 2,
  },
  {
    id: 7, category: 'Logical Reasoning',
    question: 'What comes next in the series: 2, 6, 12, 20, 30, ___?',
    options: ['40', '42', '44', '48'],
    answer: 1,
  },
  {
    id: 8, category: 'Logical Reasoning',
    question: 'A train travels 60 km/h. How long to travel 180 km?',
    options: ['2 hours', '2.5 hours', '3 hours', '4 hours'],
    answer: 2,
  },
  {
    id: 9, category: 'Logical Reasoning',
    question: 'If all Bloops are Razzles, and all Razzles are Lazzles, then:',
    options: [
      'All Lazzles are Bloops',
      'All Bloops are Lazzles',
      'Some Bloops are not Lazzles',
      'None of the above',
    ],
    answer: 1,
  },
  {
    id: 10, category: 'Logical Reasoning',
    question: 'How many times does the digit 3 appear between 1 and 50?',
    options: ['5', '6', '10', '15'],
    answer: 0,
  },
  {
    id: 11, category: 'Data Structures',
    question: 'Which data structure uses LIFO (Last In, First Out) order?',
    options: ['Queue', 'Array', 'Stack', 'Linked List'],
    answer: 2,
  },
  {
    id: 12, category: 'Data Structures',
    question: 'What is the worst-case time complexity of Binary Search?',
    options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
    answer: 1,
  },
  {
    id: 13, category: 'Data Structures',
    question: 'In a linked list, each node contains:',
    options: [
      'Only data',
      'Only a pointer to the next node',
      'Data and a pointer to the next node',
      'An index and data',
    ],
    answer: 2,
  },
  {
    id: 14, category: 'Data Structures',
    question: 'Which data structure is best suited for implementing a "breadth-first search"?',
    options: ['Stack', 'Queue', 'Tree', 'Graph'],
    answer: 1,
  },
  {
    id: 15, category: 'Data Structures',
    question: 'What is the maximum number of nodes at level k in a binary tree?',
    options: ['k', 'k²', '2^k', '2k'],
    answer: 2,
  },
]

export const CODING_PROBLEMS = [
  // Arrays
  {
    id: 1, title: 'Two Sum', category: 'Arrays', difficulty: 'Easy',
    description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution.',
    example: 'Input: nums = [2, 7, 11, 15], target = 9\nOutput: [0, 1]\nExplanation: nums[0] + nums[1] = 2 + 7 = 9',
    hint: 'Use a hash map to store the complement of each number as you iterate.',
  },
  {
    id: 2, title: 'Maximum Subarray', category: 'Arrays', difficulty: 'Medium',
    description: 'Given an integer array nums, find the contiguous subarray (containing at least one number) which has the largest sum and return its sum.',
    example: 'Input: nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4]\nOutput: 6\nExplanation: [4,-1,2,1] has the largest sum = 6.',
    hint: 'Use Kadane\'s algorithm — track current sum and max sum.',
  },
  {
    id: 3, title: 'Best Time to Buy and Sell Stock', category: 'Arrays', difficulty: 'Easy',
    description: 'Given an array prices where prices[i] is the price of a stock on the ith day. Maximize profit by choosing one day to buy and one later day to sell.',
    example: 'Input: prices = [7, 1, 5, 3, 6, 4]\nOutput: 5\nExplanation: Buy on day 2 (price=1), sell on day 5 (price=6), profit = 5.',
    hint: 'Keep track of the minimum price seen so far.',
  },
  {
    id: 4, title: 'Rotate Array', category: 'Arrays', difficulty: 'Medium',
    description: 'Given an array, rotate it to the right by k steps, where k is non-negative.',
    example: 'Input: nums = [1,2,3,4,5,6,7], k = 3\nOutput: [5,6,7,1,2,3,4]',
    hint: 'Reverse the entire array, then reverse first k elements, then reverse the rest.',
  },
  // Strings
  {
    id: 5, title: 'Valid Palindrome', category: 'Strings', difficulty: 'Easy',
    description: 'A phrase is a palindrome if, after converting all uppercase letters to lowercase and removing all non-alphanumeric characters, it reads the same forward and backward.',
    example: 'Input: s = "A man, a plan, a canal: Panama"\nOutput: true',
    hint: 'Use two pointers from both ends, skip non-alphanumeric characters.',
  },
  {
    id: 6, title: 'Longest Common Prefix', category: 'Strings', difficulty: 'Easy',
    description: 'Write a function to find the longest common prefix string amongst an array of strings. If there is no common prefix, return an empty string "".',
    example: 'Input: strs = ["flower","flow","flight"]\nOutput: "fl"',
    hint: 'Compare characters column by column across all strings.',
  },
  {
    id: 7, title: 'Anagram Check', category: 'Strings', difficulty: 'Easy',
    description: 'Given two strings s and t, return true if t is an anagram of s, and false otherwise. An anagram is a word formed by rearranging the letters of another word.',
    example: 'Input: s = "anagram", t = "nagaram"\nOutput: true',
    hint: 'Sort both strings and compare, or use a character frequency map.',
  },
  // Recursion
  {
    id: 8, title: 'Fibonacci Number', category: 'Recursion', difficulty: 'Easy',
    description: 'The Fibonacci numbers, commonly denoted F(n) form a sequence such that each number is the sum of the two preceding ones, starting from 0 and 1. Given n, calculate F(n).',
    example: 'Input: n = 4\nOutput: 3\nExplanation: F(4) = F(3) + F(2) = 2 + 1 = 3.',
    hint: 'F(n) = F(n-1) + F(n-2). Base cases: F(0) = 0, F(1) = 1.',
  },
  {
    id: 9, title: 'Power of a Number', category: 'Recursion', difficulty: 'Medium',
    description: 'Implement pow(x, n), which calculates x raised to the power n (i.e., xⁿ). Assume n is a non-negative integer.',
    example: 'Input: x = 2.00000, n = 10\nOutput: 1024.00000',
    hint: 'Use fast exponentiation: pow(x, n) = pow(x, n/2)² when n is even.',
  },
  {
    id: 10, title: 'Tower of Hanoi', category: 'Recursion', difficulty: 'Medium',
    description: 'Print the steps to solve the Tower of Hanoi problem for n disks. Move all disks from rod A to rod C using rod B as auxiliary.',
    example: 'Input: n = 2\nOutput:\nMove disk 1 from A to B\nMove disk 2 from A to C\nMove disk 1 from B to C',
    hint: 'Move top n-1 disks to auxiliary, move largest disk to destination, move n-1 disks from auxiliary to destination.',
  },
  // Linked Lists
  {
    id: 11, title: 'Reverse Linked List', category: 'Linked Lists', difficulty: 'Easy',
    description: 'Given the head of a singly linked list, reverse the list, and return the reversed list.',
    example: 'Input: head = [1,2,3,4,5]\nOutput: [5,4,3,2,1]',
    hint: 'Use three pointers: prev, curr, next. Update links as you traverse.',
  },
  {
    id: 12, title: 'Detect Cycle in Linked List', category: 'Linked Lists', difficulty: 'Medium',
    description: 'Given head, the head of a linked list, determine if the linked list has a cycle in it. Return true if there is a cycle, false otherwise.',
    example: 'Input: head = [3,2,0,-4] (tail connects to node at index 1)\nOutput: true',
    hint: 'Use Floyd\'s cycle detection: slow pointer moves 1 step, fast moves 2. If they meet, there\'s a cycle.',
  },
  {
    id: 13, title: 'Merge Two Sorted Lists', category: 'Linked Lists', difficulty: 'Easy',
    description: 'Given the heads of two sorted linked lists, merge them into one sorted list and return its head.',
    example: 'Input: list1 = [1,2,4], list2 = [1,3,4]\nOutput: [1,1,2,3,4,4]',
    hint: 'Compare heads of both lists and recursively build the merged list.',
  },
  // Stacks
  {
    id: 14, title: 'Valid Parentheses', category: 'Stacks', difficulty: 'Easy',
    description: 'Given a string s containing only the characters "(", ")", "{", "}", "[" and "]", determine if the input string is valid. Open brackets must be closed by the same type of bracket in the correct order.',
    example: 'Input: s = "()[]{}" → Output: true\nInput: s = "(]" → Output: false',
    hint: 'Push opening brackets. On closing bracket, check if top of stack matches.',
  },
  {
    id: 15, title: 'Min Stack', category: 'Stacks', difficulty: 'Medium',
    description: 'Design a stack that supports push, pop, top, and retrieving the minimum element in constant time.',
    example: 'MinStack obj = new MinStack()\nobj.push(-2); obj.push(0); obj.push(-3)\nobj.getMin() → -3\nobj.pop(); obj.top() → 0\nobj.getMin() → -2',
    hint: 'Use two stacks: one for values and one for minimums.',
  },
  {
    id: 16, title: 'Evaluate Reverse Polish Notation', category: 'Stacks', difficulty: 'Medium',
    description: 'Evaluate the value of an arithmetic expression in Reverse Polish Notation. Valid operators are +, -, *, and /.',
    example: 'Input: tokens = ["2","1","+","3","*"]\nOutput: 9\nExplanation: ((2 + 1) * 3) = 9',
    hint: 'Push numbers to stack. On operator, pop two numbers, apply operator, push result.',
  },
  {
    id: 17, title: 'Next Greater Element', category: 'Stacks', difficulty: 'Medium',
    description: 'Given a circular integer array nums, return the next greater number for every element. The next greater number of a number x is the first greater number to its traversal-order right.',
    example: 'Input: nums = [1,2,1]\nOutput: [2,-1,2]',
    hint: 'Use a monotonic stack and iterate the array twice.',
  },
  // Queues
  {
    id: 18, title: 'Implement Queue Using Stacks', category: 'Queues', difficulty: 'Easy',
    description: 'Implement a first in first out (FIFO) queue using only two stacks. Supported operations: push, pop, peek, empty.',
    example: 'MyQueue queue = new MyQueue()\nqueue.push(1); queue.push(2)\nqueue.peek() → 1\nqueue.pop() → 1\nqueue.empty() → false',
    hint: 'Use two stacks: one for input and one for output. Transfer elements when output is empty.',
  },
  {
    id: 19, title: 'Number of Recent Calls', category: 'Queues', difficulty: 'Easy',
    description: 'Design a class that counts recent requests within a time window of 3000 ms. Each time ping(t) is called, return the count of requests in the range [t-3000, t].',
    example: 'ping(1) → 1\nping(100) → 2\nping(3001) → 3\nping(3002) → 3',
    hint: 'Use a queue to store recent pings. Remove pings older than t-3000.',
  },
  {
    id: 20, title: 'Sliding Window Maximum', category: 'Queues', difficulty: 'Hard',
    description: 'Given an array nums and an integer k, return an array of the maximum values of each sliding window of size k.',
    example: 'Input: nums = [1,3,-1,-3,5,3,6,7], k = 3\nOutput: [3,3,5,5,6,7]',
    hint: 'Use a deque (double-ended queue) to maintain a decreasing order of indices.',
  },
]

export const ROADMAP_PHASES = [
  {
    id: 1,
    title: 'Programming Fundamentals',
    duration: '2 weeks',
    topics: [
      { id: 'p1t1', name: 'Variables, Data Types & Operators' },
      { id: 'p1t2', name: 'Control Flow (if, loops)' },
      { id: 'p1t3', name: 'Functions & Scope' },
      { id: 'p1t4', name: 'OOP Basics (Classes, Objects)' },
      { id: 'p1t5', name: 'Time & Space Complexity' },
    ],
  },
  {
    id: 2,
    title: 'Arrays and Strings',
    duration: '2 weeks',
    topics: [
      { id: 'p2t1', name: 'Array Operations & Traversal' },
      { id: 'p2t2', name: 'Two Pointers Technique' },
      { id: 'p2t3', name: 'Sliding Window' },
      { id: 'p2t4', name: 'String Manipulation' },
      { id: 'p2t5', name: 'Sorting Algorithms' },
    ],
  },
  {
    id: 3,
    title: 'Linked Lists, Stack & Queue',
    duration: '2 weeks',
    topics: [
      { id: 'p3t1', name: 'Singly & Doubly Linked Lists' },
      { id: 'p3t2', name: 'Linked List Problems' },
      { id: 'p3t3', name: 'Stack Implementation & Problems' },
      { id: 'p3t4', name: 'Queue & Deque' },
      { id: 'p3t5', name: 'Monotonic Stack/Queue' },
    ],
  },
  {
    id: 4,
    title: 'Trees and Graphs',
    duration: '3 weeks',
    topics: [
      { id: 'p4t1', name: 'Binary Trees & Traversals' },
      { id: 'p4t2', name: 'Binary Search Trees' },
      { id: 'p4t3', name: 'Heaps & Priority Queues' },
      { id: 'p4t4', name: 'Graph Representations' },
      { id: 'p4t5', name: 'BFS & DFS' },
    ],
  },
  {
    id: 5,
    title: 'Projects and Development',
    duration: '3 weeks',
    topics: [
      { id: 'p5t1', name: 'Build a CRUD Application' },
      { id: 'p5t2', name: 'REST APIs' },
      { id: 'p5t3', name: 'Database Basics (SQL)' },
      { id: 'p5t4', name: 'Version Control with Git' },
      { id: 'p5t5', name: 'Deploy a Project' },
    ],
  },
  {
    id: 6,
    title: 'Interview Preparation',
    duration: '2 weeks',
    topics: [
      { id: 'p6t1', name: 'Dynamic Programming Intro' },
      { id: 'p6t2', name: 'System Design Basics' },
      { id: 'p6t3', name: 'HR & Behavioral Questions' },
      { id: 'p6t4', name: 'Mock Interviews' },
      { id: 'p6t5', name: 'Resume & LinkedIn Optimization' },
    ],
  },
]

export const DAILY_TASKS = {
  coding: [
    {
      title: 'Reverse an Array',
      description: 'Write a program that reverses an array of integers in-place without using built-in reverse methods.',
      inputFormat: 'First line: N (size of array)\nSecond line: N space-separated integers',
      outputFormat: 'N space-separated integers in reversed order',
      constraints: '1 ≤ N ≤ 10⁵\n-10⁹ ≤ arr[i] ≤ 10⁹',
      hint: 'Use two pointers — one at the start and one at the end, swap and move inward.',
      examples: [
        { input: '5\n1 2 3 4 5', output: '5 4 3 2 1', explanation: 'Array reversed in-place' },
      ],
      testCases: [
        { input: '5\n1 2 3 4 5', expectedOutput: '5 4 3 2 1', hidden: false },
        { input: '3\n10 20 30', expectedOutput: '30 20 10', hidden: false },
        { input: '1\n42', expectedOutput: '42', hidden: true },
        { input: '4\n-1 0 1 2', expectedOutput: '2 1 0 -1', hidden: true },
      ],
      starterCode: {
        71: 'n = int(input())\narr = list(map(int, input().split()))\n# reverse in-place\nprint(*arr)',
        63: 'const lines = require("fs").readFileSync("/dev/stdin","utf8").trim().split("\\n");\nconst n = parseInt(lines[0]);\nconst arr = lines[1].split(" ").map(Number);\n// reverse in-place\nconsole.log(arr.join(" "));',
        54: '#include<bits/stdc++.h>\nusing namespace std;\nint main(){\n  int n; cin>>n;\n  vector<int> a(n);\n  for(auto &x:a) cin>>x;\n  // reverse in-place\n  cout<<a[0]; for(int i=1;i<n;i++) cout<<" "<<a[i];\n}',
      },
    },
    {
      title: 'Count Vowels',
      description: 'Count the number of vowels (a, e, i, o, u — both upper and lowercase) in a given string.',
      inputFormat: 'A single line containing a string S',
      outputFormat: 'A single integer — the vowel count',
      constraints: '1 ≤ |S| ≤ 10⁵\nS contains only printable ASCII characters',
      hint: 'Convert to lowercase first, then check if each character is in the set {a,e,i,o,u}.',
      examples: [
        { input: 'Hello World', output: '3', explanation: 'e, o, o are vowels' },
      ],
      testCases: [
        { input: 'Hello World', expectedOutput: '3', hidden: false },
        { input: 'aeiou', expectedOutput: '5', hidden: false },
        { input: 'AEIOU', expectedOutput: '5', hidden: true },
        { input: 'bcdfg', expectedOutput: '0', hidden: true },
      ],
      starterCode: {
        71: 's = input()\ncount = 0\n# count vowels\nprint(count)',
        63: 'const s = require("fs").readFileSync("/dev/stdin","utf8").trim();\nlet count = 0;\n// count vowels\nconsole.log(count);',
        54: '#include<bits/stdc++.h>\nusing namespace std;\nint main(){\n  string s; getline(cin,s);\n  int count=0;\n  // count vowels\n  cout<<count;\n}',
      },
    },
    {
      title: 'Find Duplicates',
      description: 'Given an array of integers where each element is between 1 and N (inclusive) and N is the array size, find all duplicates.',
      inputFormat: 'First line: N\nSecond line: N space-separated integers (each between 1 and N)',
      outputFormat: 'Space-separated duplicate integers in ascending order, or "none" if no duplicates',
      constraints: '1 ≤ N ≤ 10⁵\n1 ≤ arr[i] ≤ N',
      hint: 'For each element, negate arr[abs(x)-1]. If it is already negative, it is a duplicate.',
      examples: [
        { input: '6\n4 3 2 7 8 2', output: '2', explanation: '2 appears twice' },
        { input: '5\n1 2 3 4 5', output: 'none', explanation: 'No duplicates' },
      ],
      testCases: [
        { input: '6\n4 3 2 7 8 2', expectedOutput: '2', hidden: false },
        { input: '5\n1 2 3 4 5', expectedOutput: 'none', hidden: false },
        { input: '8\n4 3 2 7 8 2 3 1', expectedOutput: '2 3', hidden: true },
        { input: '3\n1 1 2', expectedOutput: '1', hidden: true },
      ],
      starterCode: {
        71: 'n = int(input())\narr = list(map(int, input().split()))\nduplicates = []\n# find duplicates\nprint(*duplicates if duplicates else ["none"])',
        63: 'const lines = require("fs").readFileSync("/dev/stdin","utf8").trim().split("\\n");\nconst n = parseInt(lines[0]);\nconst arr = lines[1].split(" ").map(Number);\nconst duplicates = [];\n// find duplicates\nconsole.log(duplicates.length ? duplicates.join(" ") : "none");',
        54: '#include<bits/stdc++.h>\nusing namespace std;\nint main(){\n  int n; cin>>n;\n  vector<int> a(n);\n  for(auto &x:a) cin>>x;\n  vector<int> dup;\n  // find duplicates\n  if(dup.empty()) cout<<"none";\n  else { sort(dup.begin(),dup.end()); for(int i=0;i<dup.size();i++){if(i)cout<<" ";cout<<dup[i];}}\n}',
      },
    },
    {
      title: 'Sum of Digits',
      description: 'Compute the sum of all digits of a given non-negative integer recursively.',
      inputFormat: 'A single line containing a non-negative integer N',
      outputFormat: 'A single integer — the sum of digits',
      constraints: '0 ≤ N ≤ 10¹⁸',
      hint: 'sumDigits(n) = n % 10 + sumDigits(n / 10); base case: sumDigits(0) = 0.',
      examples: [
        { input: '1234', output: '10', explanation: '1+2+3+4 = 10' },
      ],
      testCases: [
        { input: '1234', expectedOutput: '10', hidden: false },
        { input: '0', expectedOutput: '0', hidden: false },
        { input: '9999', expectedOutput: '36', hidden: true },
        { input: '100', expectedOutput: '1', hidden: true },
      ],
      starterCode: {
        71: 'def sum_digits(n):\n    # base case\n    pass\n\nn = int(input())\nprint(sum_digits(n))',
        63: 'function sumDigits(n) {\n  // base case\n}\nconst n = parseInt(require("fs").readFileSync("/dev/stdin","utf8").trim());\nconsole.log(sumDigits(n));',
        54: '#include<bits/stdc++.h>\nusing namespace std;\nlong long sumDigits(long long n){\n  // base case\n  return 0;\n}\nint main(){\n  long long n; cin>>n;\n  cout<<sumDigits(n);\n}',
      },
    },
    {
      title: 'Palindrome Check',
      description: 'Check if a given string is a palindrome (reads the same forwards and backwards). Ignore case.',
      inputFormat: 'A single line containing a string S',
      outputFormat: '"YES" if palindrome, "NO" otherwise',
      constraints: '1 ≤ |S| ≤ 10⁵\nS contains only alphanumeric characters',
      hint: 'Use two pointers from both ends, comparing characters after lowercasing.',
      examples: [
        { input: 'Racecar', output: 'YES', explanation: 'racecar reads same both ways' },
        { input: 'hello', output: 'NO', explanation: 'olleh ≠ hello' },
      ],
      testCases: [
        { input: 'Racecar', expectedOutput: 'YES', hidden: false },
        { input: 'hello', expectedOutput: 'NO', hidden: false },
        { input: 'A', expectedOutput: 'YES', hidden: true },
        { input: 'abcba', expectedOutput: 'YES', hidden: true },
      ],
      starterCode: {
        71: 's = input().lower()\n# check palindrome using two pointers\nprint("YES" if s == s[::-1] else "NO")',
        63: 'const s = require("fs").readFileSync("/dev/stdin","utf8").trim().toLowerCase();\n// check palindrome\nconsole.log(s === s.split("").reverse().join("") ? "YES" : "NO");',
        54: '#include<bits/stdc++.h>\nusing namespace std;\nint main(){\n  string s; cin>>s;\n  transform(s.begin(),s.end(),s.begin(),::tolower);\n  string r=s; reverse(r.begin(),r.end());\n  cout<<(s==r?"YES":"NO");\n}',
      },
    },
    {
      title: 'FizzBuzz',
      description: 'Print numbers from 1 to N. For multiples of 3 print "Fizz", for multiples of 5 print "Buzz", for multiples of both print "FizzBuzz".',
      inputFormat: 'A single line containing N',
      outputFormat: 'N lines — each either the number, "Fizz", "Buzz", or "FizzBuzz"',
      constraints: '1 ≤ N ≤ 10⁵',
      hint: 'Check divisibility by 15 first, then 3, then 5, else print the number.',
      examples: [
        { input: '15', output: '1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz', explanation: 'Classic FizzBuzz up to 15' },
      ],
      testCases: [
        { input: '5', expectedOutput: '1\n2\nFizz\n4\nBuzz', hidden: false },
        { input: '15', expectedOutput: '1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz', hidden: false },
        { input: '1', expectedOutput: '1', hidden: true },
        { input: '3', expectedOutput: '1\n2\nFizz', hidden: true },
      ],
      starterCode: {
        71: 'n = int(input())\nfor i in range(1, n+1):\n    # fizzbuzz logic\n    print(i)',
        63: 'const n = parseInt(require("fs").readFileSync("/dev/stdin","utf8").trim());\nfor(let i=1;i<=n;i++){\n  // fizzbuzz logic\n  console.log(i);\n}',
        54: '#include<bits/stdc++.h>\nusing namespace std;\nint main(){\n  int n; cin>>n;\n  for(int i=1;i<=n;i++){\n    // fizzbuzz logic\n    cout<<i<<"\\n";\n  }\n}',
      },
    },
    {
      title: 'Binary to Decimal',
      description: 'Convert a binary number given as a string to its decimal equivalent.',
      inputFormat: 'A single line containing a binary string B (only 0s and 1s)',
      outputFormat: 'A single integer — the decimal equivalent',
      constraints: '1 ≤ |B| ≤ 63',
      hint: 'Process bits from left to right: result = result * 2 + bit.',
      examples: [
        { input: '1010', output: '10', explanation: '1×8 + 0×4 + 1×2 + 0×1 = 10' },
      ],
      testCases: [
        { input: '1010', expectedOutput: '10', hidden: false },
        { input: '0', expectedOutput: '0', hidden: false },
        { input: '1111', expectedOutput: '15', hidden: true },
        { input: '100000', expectedOutput: '32', hidden: true },
      ],
      starterCode: {
        71: 'b = input().strip()\n# convert binary to decimal\nprint(int(b, 2))',
        63: 'const b = require("fs").readFileSync("/dev/stdin","utf8").trim();\n// convert binary to decimal\nconsole.log(parseInt(b, 2));',
        54: '#include<bits/stdc++.h>\nusing namespace std;\nint main(){\n  string b; cin>>b;\n  long long dec=0;\n  for(char c:b) dec=dec*2+(c-\'0\');\n  cout<<dec;\n}',
      },
    },
  ],
  aptitude: [
    { title: 'Percentage Problems', description: 'Solve 3 percentage-based word problems: profit/loss, discounts, and tax calculation.' },
    { title: 'Time & Work', description: 'If A can complete a work in 10 days and B in 15 days, how long will they take together?' },
    { title: 'Speed & Distance', description: 'A train 150m long passes a pole in 15 seconds. Find the speed in km/h.' },
    { title: 'Number Series', description: 'Find the next 3 terms: 1, 4, 9, 16, 25, ...' },
    { title: 'Logical Deduction', description: 'Solve a set of syllogism problems involving Venn diagram logic.' },
    { title: 'Ratio & Proportion', description: 'If A:B = 2:3 and B:C = 4:5, find A:C.' },
    { title: 'Probability Basics', description: 'A bag contains 5 red and 3 blue balls. What is the probability of drawing 2 red balls?' },
  ],
  revision: [
    { title: 'Time Complexity Recap', description: 'Review Big-O notation for common operations: array access, search, insertion, deletion.' },
    { title: 'Recursion Patterns', description: 'Revise the 3 main recursion patterns: linear, binary, and tree recursion.' },
    { title: 'OOP Principles', description: 'Recall the 4 pillars of OOP: Encapsulation, Abstraction, Inheritance, Polymorphism.' },
    { title: 'Sorting Algorithms', description: 'Review Bubble Sort, Selection Sort, Merge Sort and their complexities.' },
    { title: 'Stack vs Queue', description: 'Compare LIFO vs FIFO with real-world use cases for each.' },
    { title: 'Graph Terms', description: 'Revise: vertex, edge, directed/undirected, weighted, adjacency list vs matrix.' },
    { title: 'SQL Basics', description: 'Review: SELECT, WHERE, JOIN (INNER, LEFT, RIGHT), GROUP BY, ORDER BY.' },
  ],
}

export const MOCK_LEADERBOARD = [
  { id: 'u1', name: 'Dharani', points: 320, streak: 12, college: 'VIT Vellore' },
  { id: 'u2', name: 'Rahul', points: 280, streak: 9, college: 'NIT Trichy' },
  { id: 'u3', name: 'Sneha', points: 245, streak: 7, college: 'BITS Pilani' },
  { id: 'u4', name: 'Arjun', points: 210, streak: 6, college: 'IIIT Hyderabad' },
  { id: 'u5', name: 'Priya', points: 185, streak: 5, college: 'SRM Chennai' },
  { id: 'u6', name: 'Karan', points: 160, streak: 4, college: 'PSG Tech Coimbatore' },
  { id: 'u7', name: 'Meera', points: 140, streak: 3, college: 'Amrita Coimbatore' },
]

export const MENTOR_FEEDBACK = [
  {
    id: 1,
    mentorName: 'Vikram Nair',
    mentorTitle: 'Software Engineer @ Google',
    avatarColor: '#6366f1',
    date: '2026-03-20',
    metrics: {
      problemSolving: { label: 'Problem Solving', rating: 'Good', ratingClass: 'good' },
      consistency: { label: 'Consistency', rating: 'Medium', ratingClass: 'medium' },
      codeQuality: { label: 'Code Quality', rating: 'Good', ratingClass: 'good' },
    },
    suggestion: '💡 Focus on Arrays and Strings this week. Practice at least 2 problems daily. Your recursion understanding needs improvement — try Tower of Hanoi and Fibonacci variants.',
    detailedNotes: 'Overall progress is on track. You are solving easy problems well but struggling with medium-level array problems. Spend more time on edge cases. Keep up the daily streak!',
  },
  {
    id: 2,
    mentorName: 'Ananya Sharma',
    mentorTitle: 'SDE-2 @ Amazon',
    avatarColor: '#8b5cf6',
    date: '2026-03-15',
    metrics: {
      problemSolving: { label: 'Problem Solving', rating: 'Medium', ratingClass: 'medium' },
      consistency: { label: 'Consistency', rating: 'Good', ratingClass: 'good' },
      codeQuality: { label: 'Code Quality', rating: 'Needs Work', ratingClass: 'needs' },
    },
    suggestion: '💡 Work on clean code habits. Use meaningful variable names and add comments. Start practicing Stack and Queue problems as they appear frequently in interviews.',
    detailedNotes: 'Your daily consistency is great — 7-day streak maintained! Work on time complexity optimization. Some solutions are correct but inefficient. Read about hash maps as an optimization technique.',
  },
]
