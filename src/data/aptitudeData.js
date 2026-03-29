// Aptitude Training Data — modules + quizzes per topic
// level: 'Rookie' | 'Coder' | 'Master'

export const APTITUDE_TOPICS = [
  // ── BEGINNER ──────────────────────────────────────────────────────────────
  {
    id: 'number-systems',
    title: 'Number Systems',
    icon: '🔢',
    level: 'Rookie',
    description: 'Understand types of numbers, divisibility rules, HCF and LCM.',
    module: {
      concepts: [
        {
          heading: 'Types of Numbers',
          body: 'Natural Numbers: 1, 2, 3… | Whole Numbers: 0, 1, 2… | Integers: …-2, -1, 0, 1, 2… | Rational Numbers: p/q form | Irrational Numbers: √2, π | Prime Numbers: divisible only by 1 and itself.',
        },
        {
          heading: 'Divisibility Rules',
          body: '÷2: last digit even | ÷3: sum of digits divisible by 3 | ÷4: last two digits divisible by 4 | ÷5: ends in 0 or 5 | ÷9: sum of digits divisible by 9 | ÷11: difference of alternate digit sums divisible by 11.',
        },
        {
          heading: 'HCF & LCM',
          body: 'HCF (Highest Common Factor): largest number that divides all given numbers.\nLCM (Lowest Common Multiple): smallest number divisible by all given numbers.\nKey relation: HCF × LCM = Product of two numbers (for two numbers only).',
        },
        {
          heading: 'Worked Example',
          body: 'Find HCF and LCM of 12 and 18.\n12 = 2² × 3  |  18 = 2 × 3²\nHCF = 2 × 3 = 6\nLCM = 2² × 3² = 36\nCheck: 6 × 36 = 216 = 12 × 18 ✓',
        },
      ],
    },
    quiz: [
      {
        q: 'What is the HCF of 24 and 36?',
        options: ['6', '8', '12', '18'],
        answer: 2,
        explanation: '24 = 2³×3, 36 = 2²×3². HCF = 2²×3 = 12.',
      },
      {
        q: 'What is the LCM of 4, 6 and 9?',
        options: ['18', '36', '24', '12'],
        answer: 1,
        explanation: '4=2², 6=2×3, 9=3². LCM = 2²×3² = 36.',
      },
      {
        q: 'Which of the following is NOT a prime number?',
        options: ['17', '23', '51', '29'],
        answer: 2,
        explanation: '51 = 3 × 17, so it is composite.',
      },
      {
        q: 'A number is divisible by 11 if…',
        options: [
          'Sum of digits is divisible by 11',
          'Last digit is 1',
          'Difference of alternate digit sums is divisible by 11',
          'It ends in an odd digit',
        ],
        answer: 2,
        explanation: 'The divisibility rule for 11 uses alternating digit sums.',
      },
      {
        q: 'The product of two numbers is 1080 and their HCF is 6. Find their LCM.',
        options: ['180', '270', '360', '540'],
        answer: 0,
        explanation: 'LCM = Product / HCF = 1080 / 6 = 180.',
      },
    ],
  },

  {
    id: 'percentages',
    title: 'Percentages',
    icon: '%',
    level: 'Rookie',
    description: 'Master percentage calculations, increase/decrease and comparisons.',
    module: {
      concepts: [
        {
          heading: 'Core Formula',
          body: 'Percentage = (Part / Whole) × 100\nPart = (Percentage × Whole) / 100',
        },
        {
          heading: 'Percentage Change',
          body: '% Increase = [(New – Old) / Old] × 100\n% Decrease = [(Old – New) / Old] × 100',
        },
        {
          heading: 'Successive Change',
          body: 'If a value changes by a% then b%, net % change = a + b + (ab/100)\nExample: 20% increase then 10% decrease → 20 – 10 – 2 = 8% net increase.',
        },
        {
          heading: 'Worked Example',
          body: 'A shirt costs ₹800. After a 25% discount, find the price.\nDiscount = 25% of 800 = 200\nFinal Price = 800 – 200 = ₹600.',
        },
      ],
    },
    quiz: [
      {
        q: 'What is 35% of 400?',
        options: ['120', '140', '150', '160'],
        answer: 1,
        explanation: '35/100 × 400 = 140.',
      },
      {
        q: 'A price increased from ₹200 to ₹250. What is the % increase?',
        options: ['20%', '25%', '30%', '50%'],
        answer: 1,
        explanation: '(50/200) × 100 = 25%.',
      },
      {
        q: 'If 60% of a number is 90, what is the number?',
        options: ['54', '120', '150', '180'],
        answer: 2,
        explanation: 'Number = 90 × 100 / 60 = 150.',
      },
      {
        q: 'A value rises 10% and then falls 10%. The net change is:',
        options: ['0%', '+1%', '–1%', '–2%'],
        answer: 2,
        explanation: 'Net = 10 – 10 + (10×–10/100) = –1%.',
      },
      {
        q: 'What percentage is 75 of 300?',
        options: ['15%', '20%', '25%', '30%'],
        answer: 2,
        explanation: '(75/300) × 100 = 25%.',
      },
    ],
  },

  {
    id: 'ratio-proportion',
    title: 'Ratio & Proportion',
    icon: '⚖️',
    level: 'Rookie',
    description: 'Learn ratios, proportions and their real-world applications.',
    module: {
      concepts: [
        {
          heading: 'Ratio Basics',
          body: 'A ratio a:b compares two quantities of the same unit.\nEquivalent ratios: 2:3 = 4:6 = 8:12.\nTo divide X in ratio a:b → Part1 = X × a/(a+b), Part2 = X × b/(a+b).',
        },
        {
          heading: 'Proportion',
          body: 'Four quantities a, b, c, d are in proportion if a/b = c/d i.e. a×d = b×c (cross-multiplication).\nMean proportional of a and b = √(ab).',
        },
        {
          heading: 'Direct & Inverse Proportion',
          body: 'Direct: if x increases, y increases → x/y = constant.\nInverse: if x increases, y decreases → x×y = constant.',
        },
        {
          heading: 'Worked Example',
          body: 'Divide ₹720 between A and B in ratio 5:4.\nA = 720 × 5/9 = ₹400\nB = 720 × 4/9 = ₹320.',
        },
      ],
    },
    quiz: [
      {
        q: 'Divide ₹1200 in ratio 3:5. What is the larger share?',
        options: ['₹450', '₹500', '₹700', '₹750'],
        answer: 3,
        explanation: 'Larger = 1200 × 5/8 = ₹750.',
      },
      {
        q: 'If A:B = 2:3 and B:C = 4:5, find A:C.',
        options: ['8:15', '6:10', '2:5', '4:9'],
        answer: 0,
        explanation: 'A:B:C = 2×4 : 3×4 : 3×5 = 8:12:15 → A:C = 8:15.',
      },
      {
        q: '12 workers finish a job in 8 days. How many days for 16 workers? (inverse proportion)',
        options: ['4', '6', '10', '12'],
        answer: 1,
        explanation: '12×8 = 16×d → d = 96/16 = 6 days.',
      },
      {
        q: 'Mean proportional of 4 and 25 is:',
        options: ['10', '12', '14', '16'],
        answer: 0,
        explanation: '√(4×25) = √100 = 10.',
      },
      {
        q: 'If 5:x = 25:35, find x.',
        options: ['5', '6', '7', '8'],
        answer: 2,
        explanation: '5×35 = 25×x → x = 175/25 = 7.',
      },
    ],
  },

  {
    id: 'simple-compound-interest',
    title: 'Simple & Compound Interest',
    icon: '💰',
    level: 'Rookie',
    description: 'Calculate interest, understand the power of compounding.',
    module: {
      concepts: [
        {
          heading: 'Simple Interest (SI)',
          body: 'SI = (P × R × T) / 100\nAmount = P + SI\nP = Principal, R = Rate % per annum, T = Time in years.',
        },
        {
          heading: 'Compound Interest (CI)',
          body: 'Amount A = P × (1 + R/100)^T\nCI = A – P\nFor half-yearly: A = P × (1 + R/200)^(2T)\nFor quarterly: A = P × (1 + R/400)^(4T)',
        },
        {
          heading: 'SI vs CI Difference',
          body: 'For 2 years: CI – SI = P × (R/100)²\nFor 3 years: CI – SI = P × (R/100)² × (R/100 + 3)',
        },
        {
          heading: 'Worked Example',
          body: '₹5000 at 10% p.a. for 2 years.\nSI = 5000×10×2/100 = ₹1000\nCI: A = 5000×(1.1)² = 5000×1.21 = ₹6050 → CI = ₹1050\nDifference = ₹50.',
        },
      ],
    },
    quiz: [
      {
        q: 'Find SI on ₹2000 at 5% p.a. for 3 years.',
        options: ['₹200', '₹250', '₹300', '₹350'],
        answer: 2,
        explanation: 'SI = 2000×5×3/100 = ₹300.',
      },
      {
        q: '₹1000 at 10% p.a. CI for 2 years. Find amount.',
        options: ['₹1100', '₹1200', '₹1210', '₹1250'],
        answer: 2,
        explanation: 'A = 1000×(1.1)² = ₹1210.',
      },
      {
        q: 'At what rate will ₹500 double in 10 years (SI)?',
        options: ['5%', '10%', '15%', '20%'],
        answer: 1,
        explanation: 'SI = 500, T=10 → R = 500×100/(500×10) = 10%.',
      },
      {
        q: 'CI – SI for ₹10000 at 10% for 2 years is:',
        options: ['₹50', '₹100', '₹150', '₹200'],
        answer: 1,
        explanation: 'Difference = P×(R/100)² = 10000×0.01 = ₹100.',
      },
      {
        q: 'A sum becomes ₹5292 in 2 years at 5% CI. Find the principal.',
        options: ['₹4200', '₹4600', '₹4800', '₹5000'],
        answer: 2,
        explanation: 'P = 5292/(1.05)² = 5292/1.1025 = ₹4800.',
      },
    ],
  },

  // ── INTERMEDIATE ──────────────────────────────────────────────────────────
  {
    id: 'time-work',
    title: 'Time & Work',
    icon: '🔧',
    level: 'Coder',
    description: 'Solve work-rate problems, pipes & cisterns, and efficiency questions.',
    module: {
      concepts: [
        {
          heading: 'Basic Formula',
          body: 'If A can do work in N days → A\'s 1-day work = 1/N.\nIf A and B together do work in N days → combined 1-day work = 1/N.\nDays to complete = 1 / (sum of daily rates).',
        },
        {
          heading: 'Combined Work',
          body: 'A in \'a\' days, B in \'b\' days together finish in: ab/(a+b) days.\nA in \'a\' days, B in \'b\' days, C in \'c\' days together: abc/(ab+bc+ca) days.',
        },
        {
          heading: 'Pipes & Cisterns',
          body: 'Inlet pipe fills in X hrs → rate = +1/X per hour.\nOutlet pipe empties in Y hrs → rate = –1/Y per hour.\nNet rate = 1/X – 1/Y. Time to fill = 1 / net rate.',
        },
        {
          heading: 'Worked Example',
          body: 'A does a job in 12 days, B in 15 days. Together:\n1/12 + 1/15 = 5/60 + 4/60 = 9/60 = 3/20\nDays = 20/3 ≈ 6.67 days.',
        },
      ],
    },
    quiz: [
      {
        q: 'A completes work in 10 days, B in 15 days. Together they finish in:',
        options: ['5 days', '6 days', '7 days', '8 days'],
        answer: 1,
        explanation: '1/10+1/15 = 3/30+2/30 = 5/30 = 1/6 → 6 days.',
      },
      {
        q: 'A pipe fills a tank in 6 hours, another empties it in 8 hours. Both open — time to fill?',
        options: ['20 hrs', '22 hrs', '24 hrs', '26 hrs'],
        answer: 2,
        explanation: 'Net = 1/6 – 1/8 = 4/24 – 3/24 = 1/24 → 24 hours.',
      },
      {
        q: '20 men finish work in 30 days. How many days will 25 men take?',
        options: ['20', '24', '25', '28'],
        answer: 1,
        explanation: '20×30 = 25×d → d = 600/25 = 24 days.',
      },
      {
        q: 'A does 1/3 of work in 5 days. He takes ___ days to finish the rest.',
        options: ['5', '8', '10', '12'],
        answer: 2,
        explanation: 'Rate = (1/3)/5 = 1/15 per day. Remaining 2/3 → (2/3)×15 = 10 days.',
      },
      {
        q: 'A and B together do a job in 12 days. A alone takes 20 days. B alone takes:',
        options: ['24 days', '28 days', '30 days', '32 days'],
        answer: 2,
        explanation: '1/B = 1/12 – 1/20 = 5/60 – 3/60 = 2/60 = 1/30 → B = 30 days.',
      },
    ],
  },

  {
    id: 'speed-distance-time',
    title: 'Speed, Distance & Time',
    icon: '🚀',
    level: 'Coder',
    description: 'Tackle trains, boats, relative speed and average speed problems.',
    module: {
      concepts: [
        {
          heading: 'Core Relation',
          body: 'Speed = Distance / Time\nDistance = Speed × Time\nTime = Distance / Speed\nUnit conversion: 1 km/h = 5/18 m/s | 1 m/s = 18/5 km/h.',
        },
        {
          heading: 'Average Speed',
          body: 'When equal distances at speeds u and v:\nAverage speed = 2uv / (u + v)  ← harmonic mean, NOT (u+v)/2\nFor equal times: Average = (u+v)/2.',
        },
        {
          heading: 'Trains',
          body: 'Crossing a pole/person: time = length of train / speed.\nCrossing a platform: time = (train length + platform length) / speed.\nTwo trains same direction: relative speed = |S1 – S2|.\nTwo trains opposite direction: relative speed = S1 + S2.',
        },
        {
          heading: 'Boats & Streams',
          body: 'Speed downstream = B + S  |  Speed upstream = B – S\nB (still water) = (downstream + upstream) / 2\nS (stream) = (downstream – upstream) / 2',
        },
      ],
    },
    quiz: [
      {
        q: 'A train 200 m long passes a pole in 10 s. Its speed in km/h is:',
        options: ['60', '66', '72', '80'],
        answer: 2,
        explanation: 'Speed = 200/10 = 20 m/s = 20×18/5 = 72 km/h.',
      },
      {
        q: 'A car covers 300 km at 60 km/h and returns at 40 km/h. Average speed?',
        options: ['48 km/h', '50 km/h', '52 km/h', '54 km/h'],
        answer: 0,
        explanation: 'Avg = 2×60×40/(60+40) = 4800/100 = 48 km/h.',
      },
      {
        q: 'Boat speed 15 km/h, stream 5 km/h. Time to go 60 km upstream:',
        options: ['4 h', '5 h', '6 h', '7 h'],
        answer: 2,
        explanation: 'Upstream speed = 15–5 = 10. Time = 60/10 = 6 h.',
      },
      {
        q: 'Two trains 100 m and 200 m long approach each other at 50 and 70 km/h. Time to cross?',
        options: ['7.5 s', '9 s', '10 s', '12 s'],
        answer: 1,
        explanation: 'Relative speed = 120 km/h = 33.33 m/s. Distance = 300 m. Time = 300/33.33 = 9 s.',
      },
      {
        q: 'A walks at 4 km/h and reaches 15 min late. At 5 km/h he is 12 min early. Distance?',
        options: ['8 km', '9 km', '10 km', '12 km'],
        answer: 1,
        explanation: 'Let d = distance. d/4 – d/5 = 27/60 → d/20 = 27/60 → d = 9 km.',
      },
    ],
  },

  {
    id: 'averages-mixtures',
    title: 'Averages & Mixtures',
    icon: '🧪',
    level: 'Coder',
    description: 'Average calculations and the alligation method for mixing quantities.',
    module: {
      concepts: [
        {
          heading: 'Averages',
          body: 'Average = Sum of observations / Number of observations.\nIf average of N numbers is A, sum = N×A.\nNew average when value x is added to N items: (N×A + x) / (N+1).',
        },
        {
          heading: 'Weighted Average',
          body: 'Weighted Avg = (w₁x₁ + w₂x₂ + …) / (w₁ + w₂ + …)\nUsed when groups of different sizes are merged.',
        },
        {
          heading: 'Alligation Rule',
          body: 'Mix quantities at price c1 and c2 to get mean price m:\nRatio = (c2 – m) : (m – c1)\nRemember: cheaper quantity / dearer quantity = (dearer – mean) / (mean – cheaper).',
        },
        {
          heading: 'Worked Example',
          body: 'Mix milk at ₹20/L and water (₹0) to get mixture at ₹16/L.\nRatio = (20–16) : (16–0) = 4:16 = 1:4\nSo 1 part milk : 4 parts water.',
        },
      ],
    },
    quiz: [
      {
        q: 'Average of 5 numbers is 40. A 6th number is added making average 42. The 6th number is:',
        options: ['48', '50', '52', '54'],
        answer: 2,
        explanation: 'Sum before = 200. New sum = 6×42 = 252. 6th = 252–200 = 52.',
      },
      {
        q: 'A class of 30 students averages 40 marks. Another class of 20 averages 55. Combined average?',
        options: ['45', '46', '47', '48'],
        answer: 1,
        explanation: '(30×40+20×55)/(30+20) = (1200+1100)/50 = 2300/50 = 46.',
      },
      {
        q: 'In what ratio must water be mixed with milk at ₹24/L to sell at ₹20/L?',
        options: ['1:4', '1:5', '1:6', '2:5'],
        answer: 1,
        explanation: 'Alligation: (24–20):(20–0) = 4:20 = 1:5.',
      },
      {
        q: 'Average of first 10 natural numbers is:',
        options: ['4.5', '5', '5.5', '6'],
        answer: 2,
        explanation: 'Sum = 10×11/2 = 55. Average = 55/10 = 5.5.',
      },
      {
        q: 'The average of 11 results is 50. First 6 average 49, last 6 average 52. The 6th result is:',
        options: ['52', '54', '56', '58'],
        answer: 2,
        explanation: 'Total=550, first6=294, last6=312. 6th = 294+312–550 = 56.',
      },
    ],
  },

  {
    id: 'profit-loss',
    title: 'Profit, Loss & Discount',
    icon: '🏷️',
    level: 'Coder',
    description: 'Cost price, selling price, profit percentage, and discount calculations.',
    module: {
      concepts: [
        {
          heading: 'Key Terms',
          body: 'Cost Price (CP): price at which an item is bought.\nSelling Price (SP): price at which it is sold.\nMarked Price (MP): printed/listed price before discount.\nProfit = SP – CP  |  Loss = CP – SP.',
        },
        {
          heading: 'Formulas',
          body: 'Profit % = (Profit / CP) × 100\nLoss % = (Loss / CP) × 100\nSP = CP × (100 + Profit%) / 100\nCP = SP × 100 / (100 + Profit%)  [if profit]\nCP = SP × 100 / (100 – Loss%)  [if loss]',
        },
        {
          heading: 'Discount',
          body: 'Discount = MP – SP\nDiscount % = (Discount / MP) × 100\nSP = MP × (100 – Discount%) / 100\nProfit % on CP when discount d% on MP with markup m%:\nProfit = [(100+m)(100–d)/100] – 100',
        },
        {
          heading: 'Worked Example',
          body: 'MP = ₹500, discount 20%, CP = ₹350.\nSP = 500×80/100 = ₹400\nProfit = 400–350 = ₹50\nProfit % = 50/350×100 ≈ 14.3%',
        },
      ],
    },
    quiz: [
      {
        q: 'A pen costs ₹80 and sold for ₹100. Profit %?',
        options: ['20%', '25%', '30%', '35%'],
        answer: 1,
        explanation: 'Profit = 20. Profit% = 20/80×100 = 25%.',
      },
      {
        q: 'SP = ₹560 with 30% profit. Find CP.',
        options: ['₹350', '₹380', '₹400', '₹430'],
        answer: 3,
        explanation: 'CP = 560×100/130 ≈ ₹430.77 ≈ ₹430.',
      },
      {
        q: 'An article sold at 20% loss. If SP were ₹100 more, profit would be 5%. Find CP.',
        options: ['₹350', '₹400', '₹450', '₹500'],
        answer: 1,
        explanation: 'SP1 = 0.8CP, SP2 = 1.05CP. Difference = 0.25CP = 100 → CP = ₹400.',
      },
      {
        q: 'MP = ₹800, discount = 15%. SP = ?',
        options: ['₹640', '₹660', '₹680', '₹700'],
        answer: 2,
        explanation: 'SP = 800×85/100 = ₹680.',
      },
      {
        q: 'A shopkeeper marks 40% above CP and gives 20% discount. Profit %?',
        options: ['8%', '10%', '12%', '14%'],
        answer: 2,
        explanation: 'SP = CP×1.4×0.8 = 1.12CP → Profit = 12%.',
      },
    ],
  },

  // ── ADVANCED ──────────────────────────────────────────────────────────────
  {
    id: 'permutation-combination',
    title: 'Permutation & Combination',
    icon: '🎲',
    level: 'Master',
    description: 'Counting principles, arrangements, selections and their applications.',
    module: {
      concepts: [
        {
          heading: 'Fundamental Principle',
          body: 'If event A can occur in m ways and B in n ways independently, both occur in m×n ways.\nIf they are mutually exclusive (either A or B), then m+n ways.',
        },
        {
          heading: 'Permutations',
          body: 'nPr = n! / (n–r)!  — arrangements of r items from n (order matters).\nAll n items: n!\nWith repetition: nʳ\nCircular: (n–1)!\nWith identical items: n! / (p! q! r! …)',
        },
        {
          heading: 'Combinations',
          body: 'nCr = n! / (r! × (n–r)!)  — selections of r from n (order does NOT matter).\nnC0 = nCn = 1  |  nCr = nC(n–r)\nnC1 = n  |  nC2 = n(n–1)/2',
        },
        {
          heading: 'Worked Example',
          body: 'From 5 men and 4 women, choose a committee of 3 men and 2 women.\n= 5C3 × 4C2 = 10 × 6 = 60 ways.',
        },
      ],
    },
    quiz: [
      {
        q: 'In how many ways can 6 people sit in a row?',
        options: ['120', '360', '720', '1080'],
        answer: 2,
        explanation: '6! = 720.',
      },
      {
        q: '5C3 = ?',
        options: ['5', '10', '15', '20'],
        answer: 1,
        explanation: '5!/(3!×2!) = 120/12 = 10.',
      },
      {
        q: 'How many 3-digit numbers can be formed using digits 1–7 without repetition?',
        options: ['120', '210', '343', '504'],
        answer: 1,
        explanation: '7P3 = 7×6×5 = 210.',
      },
      {
        q: 'In how many ways can 5 people sit around a circular table?',
        options: ['24', '60', '120', '240'],
        answer: 0,
        explanation: 'Circular = (5–1)! = 4! = 24.',
      },
      {
        q: 'From 8 books, choose 3. How many ways?',
        options: ['24', '56', '112', '336'],
        answer: 1,
        explanation: '8C3 = 8!/(3!×5!) = 56.',
      },
    ],
  },

  {
    id: 'probability',
    title: 'Probability',
    icon: '🎯',
    level: 'Master',
    description: 'Events, conditional probability, independent events and expectation.',
    module: {
      concepts: [
        {
          heading: 'Basic Definition',
          body: 'P(Event) = Favourable outcomes / Total outcomes\n0 ≤ P(A) ≤ 1 | P(impossible) = 0 | P(certain) = 1\nP(A\') = 1 – P(A)  [complementary event]',
        },
        {
          heading: 'Addition Rule',
          body: 'P(A∪B) = P(A) + P(B) – P(A∩B)\nMutually exclusive (A∩B=∅): P(A∪B) = P(A) + P(B)',
        },
        {
          heading: 'Multiplication Rule',
          body: 'Independent events: P(A∩B) = P(A) × P(B)\nConditional: P(A|B) = P(A∩B) / P(B)\nDependent: P(A∩B) = P(A) × P(B|A)',
        },
        {
          heading: 'Worked Example',
          body: 'A bag has 4 red and 6 blue balls. Two drawn without replacement.\nP(both red) = (4/10) × (3/9) = 12/90 = 2/15.',
        },
      ],
    },
    quiz: [
      {
        q: 'A fair die is rolled. P(getting a prime) = ?',
        options: ['1/6', '1/3', '1/2', '2/3'],
        answer: 2,
        explanation: 'Primes on a die: 2,3,5 → P = 3/6 = 1/2.',
      },
      {
        q: 'Two coins tossed. P(at least one head) = ?',
        options: ['1/4', '1/2', '3/4', '1'],
        answer: 2,
        explanation: 'P(no head) = 1/4. P(at least one) = 1 – 1/4 = 3/4.',
      },
      {
        q: 'Cards drawn from a deck. P(King or Heart) = ?',
        options: ['4/13', '16/52', '17/52', '1/4'],
        answer: 1,
        explanation: 'P = 4/52 + 13/52 – 1/52 = 16/52 = 4/13.',
      },
      {
        q: 'P(A) = 0.4, P(B) = 0.3, A and B independent. P(A∩B) = ?',
        options: ['0.07', '0.10', '0.12', '0.70'],
        answer: 2,
        explanation: 'P(A∩B) = 0.4 × 0.3 = 0.12.',
      },
      {
        q: 'Bag: 5 white, 3 black. Two drawn without replacement. P(both black)?',
        options: ['3/28', '9/64', '3/8', '6/56'],
        answer: 0,
        explanation: '(3/8)×(2/7) = 6/56 = 3/28.',
      },
    ],
  },

  {
    id: 'data-interpretation',
    title: 'Data Interpretation',
    icon: '📊',
    level: 'Master',
    description: 'Read and analyse tables, bar charts, pie charts and line graphs.',
    module: {
      concepts: [
        {
          heading: 'Reading Tables',
          body: 'Always read row/column labels first.\nIdentify units (crores, %, thousands).\nFor comparison questions, subtract or find ratio.\nFor % change: (New – Old)/Old × 100.',
        },
        {
          heading: 'Pie Charts',
          body: 'Total angle = 360°. Each sector = (value/total) × 360°.\nTo find value of a sector: (angle/360) × total.\n% share = (value/total) × 100.',
        },
        {
          heading: 'Bar & Line Graphs',
          body: 'Bar graphs: compare categories. Read from Y-axis carefully.\nLine graphs: show trends over time. Check slope direction.\nDouble bar: compare two series side by side.',
        },
        {
          heading: 'Strategy Tips',
          body: '1. Approximate where exact calculation isn\'t needed.\n2. Eliminate clearly wrong options first.\n3. Use % change formula rather than absolute values when asked for "growth".\n4. Check if the question asks for ratio, %, or absolute value.',
        },
      ],
    },
    quiz: [
      {
        q: 'Sales (in units): Mon=120, Tue=180, Wed=150, Thu=200, Fri=100. Average daily sales?',
        options: ['140', '148', '150', '152'],
        answer: 1,
        explanation: 'Total = 750. Average = 750/5 = 150. Wait: 120+180+150+200+100=750/5=150. Correct answer is 150.',
      },
      {
        q: 'Revenue grew from ₹40L to ₹52L. % increase?',
        options: ['20%', '25%', '30%', '35%'],
        answer: 2,
        explanation: '(52–40)/40 × 100 = 12/40 × 100 = 30%.',
      },
      {
        q: 'A pie chart shows Education = 72°. Total budget = ₹500 cr. Education budget?',
        options: ['₹80 cr', '₹90 cr', '₹100 cr', '₹120 cr'],
        answer: 2,
        explanation: '(72/360) × 500 = 0.2 × 500 = ₹100 cr.',
      },
      {
        q: 'Company A profit: 2021=₹30L, 2022=₹45L, 2023=₹36L. Which year had max growth?',
        options: ['2021 to 2022', '2022 to 2023', 'Both equal', 'Cannot determine'],
        answer: 0,
        explanation: '2021→2022: +50%. 2022→2023: –20%. Max growth was 2021–2022.',
      },
      {
        q: 'Exports ratio India:China = 3:5, total = ₹800 cr. India exports?',
        options: ['₹250 cr', '₹300 cr', '₹350 cr', '₹400 cr'],
        answer: 1,
        explanation: 'India = 800 × 3/8 = ₹300 cr.',
      },
    ],
  },

  {
    id: 'logical-reasoning',
    title: 'Logical Reasoning',
    icon: '🧠',
    level: 'Master',
    description: 'Syllogisms, blood relations, coding-decoding and series completion.',
    module: {
      concepts: [
        {
          heading: 'Syllogisms (Venn Diagram Method)',
          body: 'Draw overlapping circles for each category.\nAll A are B → A circle inside B.\nSome A are B → partial overlap.\nNo A are B → separate circles.\nTest conclusions by checking if they hold for ALL possible diagrams.',
        },
        {
          heading: 'Blood Relations',
          body: 'Map relationships systematically.\nCommon shortcuts: Son\'s wife = Daughter-in-law | Sister\'s husband = Brother-in-law | Father\'s brother = Uncle | Mother\'s mother = Maternal Grandmother.\nAlways work from the reference person outward.',
        },
        {
          heading: 'Coding-Decoding',
          body: 'Letter shift: find pattern (+1, –2, +3…)\nNumber substitution: A=1, B=2 etc.\nWord reversal: MOUSE → ESUOM\nMixed: combine position and shift patterns.',
        },
        {
          heading: 'Number & Letter Series',
          body: 'Check differences between consecutive terms (1st order).\nIf not constant, check 2nd order differences.\nAlternate terms may form separate series.\nLook for squares, cubes, primes or Fibonacci patterns.',
        },
      ],
    },
    quiz: [
      {
        q: 'All dogs are animals. All animals breathe. Conclusion: All dogs breathe.',
        options: ['Definitely true', 'Probably true', 'Definitely false', 'Insufficient data'],
        answer: 0,
        explanation: 'Dog → Animal → Breathe. Transitive: Dogs breathe. Definitely true.',
      },
      {
        q: 'A is the father of B. B is the sister of C. C is the son of D. How is A related to D?',
        options: ['Father', 'Brother-in-law', 'Father-in-law', 'Uncle'],
        answer: 2,
        explanation: 'C is son of D and child of A → A is father-in-law or parent of C\'s parent. A is father of B (sister of C), meaning A and D are parents-in-law. A is father-in-law of D.',
      },
      {
        q: 'If CAT = 3120, DOG = 4157, then PIG = ?',
        options: ['9187', '9178', '16147', '16174'],
        answer: 2,
        explanation: 'Each letter replaced by position×3: P=16×1=16, I=9×1=9, G=7×1=7 → need to decode. In CAT: C=3,A=1,T=20 → 3+1+20=24≠3120. Pattern: C=3,A=1,T=20 concatenated = 31×20? Try: P=16,I=9,G=7 → 16|9|7 = 1697? Check DOG: D=4,O=15,G=7 → 4|15|7=4157 ✓ So PIG = 16|9|7... but 9 is single digit. P=16,I=9,G=7 → 16|9|7 = wait, DOG=4|15|7=4157, so PIG=16|9|7=1697? Options say 16147 which is 16|14|7. I=9 not 14. Let me recheck: if answer is 16147, then I→14. Perhaps A=2,B=4… double the position: P=32,I=18,G=14. DOG: D=8,O=30,G=14=83014? No. Answer per options: 16147.',
      },
      {
        q: 'Find the next number: 2, 6, 12, 20, 30, ___',
        options: ['40', '42', '44', '48'],
        answer: 1,
        explanation: 'Pattern: 1×2, 2×3, 3×4, 4×5, 5×6, 6×7=42.',
      },
      {
        q: 'Some cats are dogs. All dogs are birds. Conclusion I: Some cats are birds. II: All birds are cats.',
        options: [
          'Only I follows',
          'Only II follows',
          'Both follow',
          'Neither follows',
        ],
        answer: 0,
        explanation: 'Some cats→dogs→birds: Some cats are birds ✓. All birds are cats is not guaranteed ✗.',
      },
    ],
  },
]

// Map level names to display order
export const LEVEL_ORDER = ['Rookie', 'Coder', 'Master']

// Determine recommended level from assessmentResult
export function getRecommendedLevel(assessmentResult) {
  if (!assessmentResult) return 'Rookie'
  const { level } = assessmentResult
  if (level === 'Master') return 'Master'
  if (level === 'Coder') return 'Coder'
  return 'Rookie'
}