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
    { title: 'Reverse an Array', description: 'Write a function that reverses an array in-place without using built-in reverse methods.' },
    { title: 'Count Vowels', description: 'Count the number of vowels in a given string efficiently.' },
    { title: 'Find Duplicates', description: 'Given an array of integers, find all duplicates in O(n) time using O(1) extra space.' },
    { title: 'Sum of Digits', description: 'Compute the sum of digits of a number recursively.' },
    { title: 'Palindrome Check', description: 'Check if a given string is a palindrome without using built-in reverse.' },
    { title: 'FizzBuzz', description: 'Print FizzBuzz for numbers 1 to 100 using the classic rules.' },
    { title: 'Binary to Decimal', description: 'Convert a binary number (string) to its decimal equivalent.' },
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
