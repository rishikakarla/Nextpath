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
      description: 'Number systems form the foundation of mathematics. Numbers are classified into Natural (1,2,3…), Whole (0,1,2…), Integers (…-2,-1,0,1,2…), Rational (p/q form), Irrational (√2, π), and Complex. Prime numbers are divisible only by 1 and themselves. HCF is the largest common divisor and LCM is the smallest common multiple of given numbers.',
      formulas: [
        { label: 'HCF × LCM', value: 'HCF × LCM = Product of the two numbers' },
        { label: 'Sum of 1 to n', value: 'n(n+1) / 2' },
        { label: 'Sum of Squares', value: 'n(n+1)(2n+1) / 6' },
        { label: 'Sum of Cubes', value: '[n(n+1)/2]²' },
      ],
      tips: [
        'Every composite number has at least one prime factor ≤ its square root.',
        'If HCF of two numbers is 1, they are Co-Prime.',
        'LCM is always a multiple of HCF.',
        '0 is neither prime nor composite.',
        '2 is the only even prime number.',
      ],
      shortcuts: [
        '÷2: last digit even | ÷3: digit sum ÷3 | ÷4: last two digits ÷4',
        '÷5: ends in 0 or 5 | ÷6: ÷2 and ÷3 both | ÷8: last 3 digits ÷8',
        '÷9: digit sum ÷9 | ÷11: alternating digit sum difference ÷11',
        'To find HCF quickly: use Euclid\'s division — HCF(a,b) = HCF(b, a mod b)',
        'LCM of fractions = LCM of numerators / HCF of denominators',
      ],
      howToSolve: [
        'Step 1: Prime-factorize each number completely.',
        'Step 2: For HCF — take common prime factors with lowest powers.',
        'Step 3: For LCM — take all prime factors with highest powers.',
        'Step 4: Verify using HCF × LCM = Product of two numbers.',
        'Step 5: For word problems, identify if the question needs HCF (splitting) or LCM (repeating).',
      ],
    },
    quiz: [
      { q: 'What is the HCF of 24 and 36?', options: ['6', '8', '12', '18'], answer: 2, explanation: '24 = 2³×3, 36 = 2²×3². HCF = 2²×3 = 12.' },
      { q: 'What is the LCM of 4, 6 and 9?', options: ['18', '36', '24', '12'], answer: 1, explanation: '4=2², 6=2×3, 9=3². LCM = 2²×3² = 36.' },
      { q: 'Which of the following is NOT a prime number?', options: ['17', '23', '51', '29'], answer: 2, explanation: '51 = 3 × 17, so it is composite.' },
      { q: 'A number is divisible by 11 if…', options: ['Sum of digits is divisible by 11', 'Last digit is 1', 'Difference of alternate digit sums is divisible by 11', 'It ends in an odd digit'], answer: 2, explanation: 'The divisibility rule for 11 uses alternating digit sums.' },
      { q: 'The product of two numbers is 1080 and their HCF is 6. Find their LCM.', options: ['180', '270', '360', '540'], answer: 0, explanation: 'LCM = Product / HCF = 1080 / 6 = 180.' },
    ],
  },

  {
    id: 'percentages',
    title: 'Percentages',
    icon: '%',
    level: 'Rookie',
    description: 'Master percentage calculations, increase/decrease and comparisons.',
    module: {
      description: 'Percentage means "per hundred." It expresses a fraction of 100 and is used to compare quantities, calculate increase/decrease, and solve real-life problems like discounts, tax, and profit. Understanding fractions as percentages speeds up calculations significantly.',
      formulas: [
        { label: 'Basic %', value: 'Percentage = (Part / Whole) × 100' },
        { label: 'Part from %', value: 'Part = (Percentage × Whole) / 100' },
        { label: '% Increase', value: '[(New – Old) / Old] × 100' },
        { label: '% Decrease', value: '[(Old – New) / Old] × 100' },
        { label: 'Successive Change', value: 'Net % = a + b + (ab/100)' },
      ],
      tips: [
        'If A is x% more than B, then B is x/(100+x) × 100% less than A.',
        'For successive changes, always use the formula — don\'t just add percentages.',
        'To find original value after increase: Original = New Value × 100 / (100 + %).',
        'Percentage point ≠ percentage change. A rise from 20% to 25% is 5 percentage points but 25% change.',
      ],
      shortcuts: [
        '10% → shift decimal left once | 5% → half of 10%',
        '25% = ÷4 | 50% = ÷2 | 75% = 3×(÷4)',
        '33.33% = ÷3 | 66.67% = 2×(÷3) | 12.5% = ÷8',
        '1% of any number = divide by 100 (then scale up)',
        'x% of y = y% of x (swap if easier: 8% of 25 = 25% of 8 = 2)',
      ],
      howToSolve: [
        'Step 1: Identify the "whole" (base value) clearly.',
        'Step 2: Decide what fraction it is of the whole.',
        'Step 3: Multiply fraction × 100 to get percentage.',
        'Step 4: For % change — always use Old value as denominator.',
        'Step 5: For successive changes — apply formula or multiply factors: (1+a/100)(1+b/100).',
      ],
    },
    quiz: [
      { q: 'What is 35% of 400?', options: ['120', '140', '150', '160'], answer: 1, explanation: '35/100 × 400 = 140.' },
      { q: 'A price increased from ₹200 to ₹250. What is the % increase?', options: ['20%', '25%', '30%', '50%'], answer: 1, explanation: '(50/200) × 100 = 25%.' },
      { q: 'If 60% of a number is 90, what is the number?', options: ['54', '120', '150', '180'], answer: 2, explanation: 'Number = 90 × 100 / 60 = 150.' },
      { q: 'A value rises 10% and then falls 10%. The net change is:', options: ['0%', '+1%', '–1%', '–2%'], answer: 2, explanation: 'Net = 10 – 10 + (10×–10/100) = –1%.' },
      { q: 'What percentage is 75 of 300?', options: ['15%', '20%', '25%', '30%'], answer: 2, explanation: '(75/300) × 100 = 25%.' },
    ],
  },

  {
    id: 'ratio-proportion',
    title: 'Ratio & Proportion',
    icon: '⚖️',
    level: 'Rookie',
    description: 'Learn ratios, proportions and their real-world applications.',
    module: {
      description: 'A ratio compares two quantities of the same unit. Proportion states that two ratios are equal. These concepts are used to divide quantities, scale recipes, currency exchange, and many engineering applications. Direct proportion means as one increases, the other increases. Inverse proportion is the opposite.',
      formulas: [
        { label: 'Ratio Division', value: 'Part₁ = Total × a/(a+b), Part₂ = Total × b/(a+b)' },
        { label: 'Proportion (Cross)', value: 'a/b = c/d  ⟹  a×d = b×c' },
        { label: 'Mean Proportional', value: '√(a × b)' },
        { label: 'Third Proportional', value: 'If a:b = b:x then x = b²/a' },
        { label: 'Direct Proportion', value: 'x/y = constant (k)' },
        { label: 'Inverse Proportion', value: 'x × y = constant (k)' },
      ],
      tips: [
        'To combine ratios A:B and B:C into A:B:C, make B common by LCM.',
        'Equivalent ratios: multiply or divide both terms by same number.',
        'In word problems, check if relation is direct or inverse first.',
        'Compounded ratio of a:b and c:d is ac:bd.',
      ],
      shortcuts: [
        'A:B = 2:3 means A = 2k, B = 3k for some value k.',
        'If A:B = 2:3 and B:C = 4:5, multiply to get A:B:C = 8:12:15.',
        'Inverse ratio of a:b is b:a.',
        'Duplicate ratio of a:b is a²:b² | Sub-duplicate ratio is √a:√b.',
      ],
      howToSolve: [
        'Step 1: Write the ratio as a:b and assign variables (ak, bk).',
        'Step 2: Use given total to find k.',
        'Step 3: Multiply k by each ratio part to get individual values.',
        'Step 4: For proportion problems, cross-multiply and solve.',
        'Step 5: For combined ratios, find LCM of the shared term.',
      ],
    },
    quiz: [
      { q: 'Divide ₹1200 in ratio 3:5. What is the larger share?', options: ['₹450', '₹500', '₹700', '₹750'], answer: 3, explanation: 'Larger = 1200 × 5/8 = ₹750.' },
      { q: 'If A:B = 2:3 and B:C = 4:5, find A:C.', options: ['8:15', '6:10', '2:5', '4:9'], answer: 0, explanation: 'A:B:C = 2×4 : 3×4 : 3×5 = 8:12:15 → A:C = 8:15.' },
      { q: '12 workers finish a job in 8 days. How many days for 16 workers? (inverse proportion)', options: ['4', '6', '10', '12'], answer: 1, explanation: '12×8 = 16×d → d = 96/16 = 6 days.' },
      { q: 'Mean proportional of 4 and 25 is:', options: ['10', '12', '14', '16'], answer: 0, explanation: '√(4×25) = √100 = 10.' },
      { q: 'If 5:x = 25:35, find x.', options: ['5', '6', '7', '8'], answer: 2, explanation: '5×35 = 25×x → x = 175/25 = 7.' },
    ],
  },

  {
    id: 'simple-compound-interest',
    title: 'Simple & Compound Interest',
    icon: '💰',
    level: 'Rookie',
    description: 'Calculate interest, understand the power of compounding.',
    module: {
      description: 'Interest is the cost of borrowing money. Simple Interest (SI) is calculated on the principal alone, while Compound Interest (CI) is calculated on principal plus accumulated interest. CI grows faster due to the "interest on interest" effect — this is the power of compounding used in investments and loans.',
      formulas: [
        { label: 'Simple Interest', value: 'SI = (P × R × T) / 100' },
        { label: 'Amount (SI)', value: 'A = P + SI = P(1 + RT/100)' },
        { label: 'Compound Interest', value: 'A = P × (1 + R/100)^T' },
        { label: 'CI Half-yearly', value: 'A = P × (1 + R/200)^(2T)' },
        { label: 'CI – SI (2 yrs)', value: 'CI – SI = P × (R/100)²' },
        { label: 'CI – SI (3 yrs)', value: 'CI – SI = P×(R/100)²×(3 + R/100)' },
      ],
      tips: [
        'CI is always greater than SI for the same P, R, T (when T > 1 yr).',
        'For 1 year, CI = SI if compounded annually.',
        'The difference CI – SI for 2 years is P(R/100)² — memorize this!',
        'If amount doubles in T years at SI: R = 100/T %.',
      ],
      shortcuts: [
        'At 10% for 2 yrs: SI = 20% of P, CI = 21% of P (difference = 1% of P).',
        'Rule of 72: Money doubles in approximately 72/R years at compound interest.',
        'At R% CI: amount after 1 yr = P×(100+R)/100.',
        'Convert rate: half-yearly means rate halved, time doubled.',
      ],
      howToSolve: [
        'Step 1: Identify P (principal), R (rate %), T (time in years).',
        'Step 2: Check if SI or CI — and if CI, check compounding frequency.',
        'Step 3: For SI use SI=PRT/100; for CI use A=P(1+R/100)^T.',
        'Step 4: Subtract P from Amount to get interest earned.',
        'Step 5: For comparison questions, compute both and find the difference.',
      ],
    },
    quiz: [
      { q: 'Find SI on ₹2000 at 5% p.a. for 3 years.', options: ['₹200', '₹250', '₹300', '₹350'], answer: 2, explanation: 'SI = 2000×5×3/100 = ₹300.' },
      { q: '₹1000 at 10% p.a. CI for 2 years. Find amount.', options: ['₹1100', '₹1200', '₹1210', '₹1250'], answer: 2, explanation: 'A = 1000×(1.1)² = ₹1210.' },
      { q: 'At what rate will ₹500 double in 10 years (SI)?', options: ['5%', '10%', '15%', '20%'], answer: 1, explanation: 'SI = 500, T=10 → R = 500×100/(500×10) = 10%.' },
      { q: 'CI – SI for ₹10000 at 10% for 2 years is:', options: ['₹50', '₹100', '₹150', '₹200'], answer: 1, explanation: 'Difference = P×(R/100)² = 10000×0.01 = ₹100.' },
      { q: 'A sum becomes ₹5292 in 2 years at 5% CI. Find the principal.', options: ['₹4200', '₹4600', '₹4800', '₹5000'], answer: 2, explanation: 'P = 5292/(1.05)² = 5292/1.1025 = ₹4800.' },
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
      description: 'Time and Work problems involve calculating how long it takes one or more workers to complete a task. The core idea is that work rate = 1/time. When multiple workers work together, their rates add up. Pipes & Cisterns is the same concept applied to filling/emptying tanks.',
      formulas: [
        { label: '1-day Work', value: 'If A does job in N days → daily rate = 1/N' },
        { label: 'Combined (2 workers)', value: 'Time together = (a×b) / (a+b)' },
        { label: 'Combined (3 workers)', value: 'Time = abc / (ab+bc+ca)' },
        { label: 'Pipes Net Rate', value: 'Net = 1/X (inlet) – 1/Y (outlet)' },
        { label: 'Efficiency Ratio', value: 'If A:B efficiency = m:n then time ratio = n:m' },
      ],
      tips: [
        'Always think in terms of "fraction of work done per day."',
        'If A is twice as efficient as B, A takes half the time.',
        'For pipes: inlet rates are positive, outlet rates are negative.',
        'If workers join or leave midway, calculate work done in each phase separately.',
      ],
      shortcuts: [
        'A in \'a\' days, B in \'b\' days → together = ab/(a+b) days.',
        'LCM method: assign total work = LCM(a,b,c…), find daily rates as integers.',
        'If A does work in x days, in 1 day A does 1/x. In k days: k/x.',
        'Remaining work = 1 – (work done so far).',
      ],
      howToSolve: [
        'Step 1: Assign total work as LCM of all given days (makes arithmetic easy).',
        'Step 2: Calculate each worker\'s daily output = Total / Their days.',
        'Step 3: Add daily outputs for combined work per day.',
        'Step 4: Days needed = Total work / Combined daily output.',
        'Step 5: For partial days or midway problems, track work done in each phase.',
      ],
    },
    quiz: [
      { q: 'A completes work in 10 days, B in 15 days. Together they finish in:', options: ['5 days', '6 days', '7 days', '8 days'], answer: 1, explanation: '1/10+1/15 = 3/30+2/30 = 5/30 = 1/6 → 6 days.' },
      { q: 'A pipe fills a tank in 6 hours, another empties it in 8 hours. Both open — time to fill?', options: ['20 hrs', '22 hrs', '24 hrs', '26 hrs'], answer: 2, explanation: 'Net = 1/6 – 1/8 = 4/24 – 3/24 = 1/24 → 24 hours.' },
      { q: '20 men finish work in 30 days. How many days will 25 men take?', options: ['20', '24', '25', '28'], answer: 1, explanation: '20×30 = 25×d → d = 600/25 = 24 days.' },
      { q: 'A does 1/3 of work in 5 days. He takes ___ days to finish the rest.', options: ['5', '8', '10', '12'], answer: 2, explanation: 'Rate = (1/3)/5 = 1/15 per day. Remaining 2/3 → (2/3)×15 = 10 days.' },
      { q: 'A and B together do a job in 12 days. A alone takes 20 days. B alone takes:', options: ['24 days', '28 days', '30 days', '32 days'], answer: 2, explanation: '1/B = 1/12 – 1/20 = 5/60 – 3/60 = 2/60 = 1/30 → B = 30 days.' },
    ],
  },

  {
    id: 'speed-distance-time',
    title: 'Speed, Distance & Time',
    icon: '🚀',
    level: 'Coder',
    description: 'Tackle trains, boats, relative speed and average speed problems.',
    module: {
      description: 'Speed, Distance and Time (SDT) are interrelated quantities. The fundamental relation is Speed = Distance/Time. Problems range from simple calculations to complex scenarios involving trains crossing each other, boats in rivers, and average speed across different segments. Unit conversion is frequently tested.',
      formulas: [
        { label: 'Core Relation', value: 'Speed = Distance / Time  |  D = S×T  |  T = D/S' },
        { label: 'Unit Conversion', value: '1 km/h = 5/18 m/s  |  1 m/s = 18/5 km/h' },
        { label: 'Average Speed (equal dist)', value: '2uv / (u + v)' },
        { label: 'Average Speed (equal time)', value: '(u + v) / 2' },
        { label: 'Relative Speed (same dir)', value: '|S₁ – S₂|' },
        { label: 'Relative Speed (opp dir)', value: 'S₁ + S₂' },
        { label: 'Downstream / Upstream', value: 'D = B+S  |  U = B–S  |  B = (D+U)/2  |  S = (D–U)/2' },
      ],
      tips: [
        'Average speed ≠ arithmetic mean of speeds when distances are equal.',
        'For trains crossing each other: total distance = sum of their lengths.',
        'A train crossing a pole only travels its own length.',
        'In boats problems, always check if speed given is in still water or relative.',
      ],
      shortcuts: [
        'km/h to m/s: multiply by 5/18. m/s to km/h: multiply by 18/5.',
        'If A and B start at same time from opposite ends and meet, time = d/(S₁+S₂).',
        'Catching up: time = head start distance / (faster – slower speed).',
        'Train crossing platform: time = (train + platform) / speed.',
      ],
      howToSolve: [
        'Step 1: Convert all units to be consistent (all km/h or all m/s).',
        'Step 2: Identify total distance (include lengths of trains/platforms if needed).',
        'Step 3: Determine relative speed (same or opposite direction).',
        'Step 4: Apply Time = Distance / Speed.',
        'Step 5: For boats/streams, solve for B and S using the two equations.',
      ],
    },
    quiz: [
      { q: 'A train 200 m long passes a pole in 10 s. Its speed in km/h is:', options: ['60', '66', '72', '80'], answer: 2, explanation: 'Speed = 200/10 = 20 m/s = 20×18/5 = 72 km/h.' },
      { q: 'A car covers 300 km at 60 km/h and returns at 40 km/h. Average speed?', options: ['48 km/h', '50 km/h', '52 km/h', '54 km/h'], answer: 0, explanation: 'Avg = 2×60×40/(60+40) = 4800/100 = 48 km/h.' },
      { q: 'Boat speed 15 km/h, stream 5 km/h. Time to go 60 km upstream:', options: ['4 h', '5 h', '6 h', '7 h'], answer: 2, explanation: 'Upstream speed = 15–5 = 10. Time = 60/10 = 6 h.' },
      { q: 'Two trains 100 m and 200 m long approach each other at 50 and 70 km/h. Time to cross?', options: ['7.5 s', '9 s', '10 s', '12 s'], answer: 1, explanation: 'Relative speed = 120 km/h = 33.33 m/s. Distance = 300 m. Time = 300/33.33 = 9 s.' },
      { q: 'A walks at 4 km/h and reaches 15 min late. At 5 km/h he is 12 min early. Distance?', options: ['8 km', '9 km', '10 km', '12 km'], answer: 1, explanation: 'Let d = distance. d/4 – d/5 = 27/60 → d/20 = 27/60 → d = 9 km.' },
    ],
  },

  {
    id: 'averages-mixtures',
    title: 'Averages & Mixtures',
    icon: '🧪',
    level: 'Coder',
    description: 'Average calculations and the alligation method for mixing quantities.',
    module: {
      description: 'Average (Arithmetic Mean) is the sum of observations divided by their count. Weighted average accounts for groups of different sizes. The Alligation Rule is a quick graphical method to find the ratio in which two ingredients at different prices must be mixed to get a desired mean price.',
      formulas: [
        { label: 'Average', value: 'Average = Sum / Count  |  Sum = Average × Count' },
        { label: 'Weighted Average', value: '(w₁x₁ + w₂x₂ + …) / (w₁ + w₂ + …)' },
        { label: 'New Average (item added)', value: '(N×A + x) / (N+1)' },
        { label: 'Alligation Ratio', value: '(c₂ – m) : (m – c₁)  where m = mean price' },
      ],
      tips: [
        'When a number is removed, new sum = old sum – that number.',
        'For alligation: the ratio tells you quantities, not prices.',
        'Average of consecutive numbers = (first + last) / 2.',
        'If average of N consecutive integers starting from a: average = a + (N–1)/2.',
      ],
      shortcuts: [
        'Average of first n natural numbers = (n+1)/2.',
        'Average of first n even numbers = n+1.',
        'Average of first n odd numbers = n.',
        'Alligation cross: draw X pattern, put cheaper top-left, dearer top-right, mean in centre.',
        'Alligation result: cheaper qty / dearer qty = (dearer–mean) / (mean–cheaper).',
      ],
      howToSolve: [
        'Step 1: For average problems, find the total sum using Average × Count.',
        'Step 2: If a new item is added or removed, adjust sum accordingly.',
        'Step 3: For mixture problems, identify the two component prices and mean price.',
        'Step 4: Apply alligation: ratio = (higher – mean) : (mean – lower).',
        'Step 5: Use ratio to find actual quantities if total mixture is given.',
      ],
    },
    quiz: [
      { q: 'Average of 5 numbers is 40. A 6th number is added making average 42. The 6th number is:', options: ['48', '50', '52', '54'], answer: 2, explanation: 'Sum before = 200. New sum = 6×42 = 252. 6th = 252–200 = 52.' },
      { q: 'A class of 30 students averages 40 marks. Another class of 20 averages 55. Combined average?', options: ['45', '46', '47', '48'], answer: 1, explanation: '(30×40+20×55)/(30+20) = (1200+1100)/50 = 2300/50 = 46.' },
      { q: 'In what ratio must water be mixed with milk at ₹24/L to sell at ₹20/L?', options: ['1:4', '1:5', '1:6', '2:5'], answer: 1, explanation: 'Alligation: (24–20):(20–0) = 4:20 = 1:5.' },
      { q: 'Average of first 10 natural numbers is:', options: ['4.5', '5', '5.5', '6'], answer: 2, explanation: 'Sum = 10×11/2 = 55. Average = 55/10 = 5.5.' },
      { q: 'The average of 11 results is 50. First 6 average 49, last 6 average 52. The 6th result is:', options: ['52', '54', '56', '58'], answer: 2, explanation: 'Total=550, first6=294, last6=312. 6th = 294+312–550 = 56.' },
    ],
  },

  {
    id: 'profit-loss',
    title: 'Profit, Loss & Discount',
    icon: '🏷️',
    level: 'Coder',
    description: 'Cost price, selling price, profit percentage, and discount calculations.',
    module: {
      description: 'Profit and Loss problems involve buying (Cost Price) and selling (Selling Price) of goods. Discount is a reduction from the Marked Price. These problems are extremely common in competitive exams and real-world finance. Understanding the relationships between CP, SP, MP, profit% and loss% is essential.',
      formulas: [
        { label: 'Profit', value: 'Profit = SP – CP  |  Profit% = (Profit/CP) × 100' },
        { label: 'Loss', value: 'Loss = CP – SP  |  Loss% = (Loss/CP) × 100' },
        { label: 'SP from Profit%', value: 'SP = CP × (100 + Profit%) / 100' },
        { label: 'CP from Profit%', value: 'CP = SP × 100 / (100 + Profit%)' },
        { label: 'Discount', value: 'Discount = MP – SP  |  SP = MP × (100–Discount%)/100' },
        { label: 'Markup + Discount', value: 'Net Profit% = [(100+m)(100–d)/100] – 100' },
      ],
      tips: [
        'Profit/Loss % is always calculated on Cost Price, not SP.',
        'Discount % is always calculated on Marked Price, not CP.',
        'Dishonest seller using false weights: Profit% = (True wt – False wt)/False wt × 100.',
        'Two articles sold at same SP — one at x% profit and other at x% loss → net loss of x²/100 %.',
      ],
      shortcuts: [
        'At 10% profit: SP = 1.1 × CP | At 10% loss: SP = 0.9 × CP.',
        '20% markup then 20% discount: net = (1.2 × 0.8 – 1) = –4% (loss).',
        'If SP = ₹x at a% loss, at b% profit: new SP = x × (100+b)/(100–a).',
        'Selling at same price: one 25% profit, one 25% loss → 6.25% net loss.',
      ],
      howToSolve: [
        'Step 1: Identify CP, SP, MP and what is asked.',
        'Step 2: For profit — SP > CP. For loss — CP > SP.',
        'Step 3: Calculate profit/loss amount first, then find percentage.',
        'Step 4: For discount problems, first find SP from MP, then compare to CP.',
        'Step 5: For markup+discount: compute SP = MP×(1–d%), then compare SP to CP.',
      ],
    },
    quiz: [
      { q: 'A pen costs ₹80 and sold for ₹100. Profit %?', options: ['20%', '25%', '30%', '35%'], answer: 1, explanation: 'Profit = 20. Profit% = 20/80×100 = 25%.' },
      { q: 'SP = ₹560 with 30% profit. Find CP.', options: ['₹350', '₹380', '₹400', '₹430'], answer: 3, explanation: 'CP = 560×100/130 ≈ ₹430.' },
      { q: 'An article sold at 20% loss. If SP were ₹100 more, profit would be 5%. Find CP.', options: ['₹350', '₹400', '₹450', '₹500'], answer: 1, explanation: 'SP1 = 0.8CP, SP2 = 1.05CP. Difference = 0.25CP = 100 → CP = ₹400.' },
      { q: 'MP = ₹800, discount = 15%. SP = ?', options: ['₹640', '₹660', '₹680', '₹700'], answer: 2, explanation: 'SP = 800×85/100 = ₹680.' },
      { q: 'A shopkeeper marks 40% above CP and gives 20% discount. Profit %?', options: ['8%', '10%', '12%', '14%'], answer: 2, explanation: 'SP = CP×1.4×0.8 = 1.12CP → Profit = 12%.' },
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
      description: 'Permutation deals with arrangements where order matters. Combination deals with selections where order does not matter. The Fundamental Counting Principle underlies both. These are used in probability, coding theory, and competitive math. The key question to ask: "Does order matter?" — yes → Permutation, no → Combination.',
      formulas: [
        { label: 'Permutation', value: 'nPr = n! / (n–r)!' },
        { label: 'Combination', value: 'nCr = n! / [r! × (n–r)!]' },
        { label: 'All items', value: 'All n items in a row = n!' },
        { label: 'Circular', value: '(n–1)!' },
        { label: 'With repetition', value: 'nʳ (permutation) | (n+r–1)Cr (combination)' },
        { label: 'Identical items', value: 'n! / (p! × q! × r! …)' },
      ],
      tips: [
        'nCr = nC(n–r). Use the smaller of r and n–r for faster calculation.',
        'nC0 = nCn = 1 | nC1 = n | nC2 = n(n–1)/2.',
        'For circular arrangements, fix one element and arrange the rest.',
        'nPr = r! × nCr — permutation is combination times arrangements.',
      ],
      shortcuts: [
        'nC2 = n(n–1)/2 (very commonly tested).',
        'Total subsets of n items = 2ⁿ.',
        'For selections with at least one: Total – (none selected) = 2ⁿ – 1.',
        '5! = 120, 6! = 720, 7! = 5040, 8! = 40320 — memorize these.',
      ],
      howToSolve: [
        'Step 1: Ask — does order matter? Yes → Permutation. No → Combination.',
        'Step 2: Identify n (total items) and r (items to choose/arrange).',
        'Step 3: Apply nPr or nCr formula.',
        'Step 4: For restrictions, use (Total arrangements – Restricted arrangements).',
        'Step 5: For multiple groups, multiply the combinations for each group.',
      ],
    },
    quiz: [
      { q: 'In how many ways can 6 people sit in a row?', options: ['120', '360', '720', '1080'], answer: 2, explanation: '6! = 720.' },
      { q: '5C3 = ?', options: ['5', '10', '15', '20'], answer: 1, explanation: '5!/(3!×2!) = 120/12 = 10.' },
      { q: 'How many 3-digit numbers can be formed using digits 1–7 without repetition?', options: ['120', '210', '343', '504'], answer: 1, explanation: '7P3 = 7×6×5 = 210.' },
      { q: 'In how many ways can 5 people sit around a circular table?', options: ['24', '60', '120', '240'], answer: 0, explanation: 'Circular = (5–1)! = 4! = 24.' },
      { q: 'From 8 books, choose 3. How many ways?', options: ['24', '56', '112', '336'], answer: 1, explanation: '8C3 = 8!/(3!×5!) = 56.' },
    ],
  },

  {
    id: 'probability',
    title: 'Probability',
    icon: '🎯',
    level: 'Master',
    description: 'Events, conditional probability, independent events and expectation.',
    module: {
      description: 'Probability measures the likelihood of an event occurring, ranging from 0 (impossible) to 1 (certain). It is the ratio of favourable outcomes to total outcomes. The addition and multiplication rules handle compound events. Conditional probability measures the probability of an event given that another has occurred.',
      formulas: [
        { label: 'Basic', value: 'P(E) = Favourable outcomes / Total outcomes' },
        { label: 'Complement', value: "P(A') = 1 – P(A)" },
        { label: 'Addition Rule', value: 'P(A∪B) = P(A) + P(B) – P(A∩B)' },
        { label: 'Mutually Exclusive', value: 'P(A∪B) = P(A) + P(B)' },
        { label: 'Independent Events', value: 'P(A∩B) = P(A) × P(B)' },
        { label: 'Conditional', value: 'P(A|B) = P(A∩B) / P(B)' },
      ],
      tips: [
        'Always list all possible outcomes (sample space) before calculating.',
        'For "at least one" problems: use complement rule — 1 – P(none).',
        'Independent ≠ Mutually Exclusive. Independent events can both occur.',
        'For without-replacement problems, probabilities change after each draw.',
      ],
      shortcuts: [
        'Standard deck: 52 cards, 4 suits, 13 per suit, 4 of each rank.',
        'Dice: 6 faces, sum of two dice ranges 2–12, most likely sum = 7.',
        '"At least one" = 1 – P(none) is faster than listing all cases.',
        'For OR (mutually exclusive): just add probabilities.',
        'For AND (independent): just multiply probabilities.',
      ],
      howToSolve: [
        'Step 1: Define the sample space (all possible outcomes).',
        'Step 2: Count favourable outcomes for the event.',
        'Step 3: Apply P = Favourable / Total.',
        'Step 4: For compound events, use addition or multiplication rule as appropriate.',
        'Step 5: For "at least one" — use complement: 1 – P(zero occurrences).',
      ],
    },
    quiz: [
      { q: 'A fair die is rolled. P(getting a prime) = ?', options: ['1/6', '1/3', '1/2', '2/3'], answer: 2, explanation: 'Primes on a die: 2,3,5 → P = 3/6 = 1/2.' },
      { q: 'Two coins tossed. P(at least one head) = ?', options: ['1/4', '1/2', '3/4', '1'], answer: 2, explanation: 'P(no head) = 1/4. P(at least one) = 1 – 1/4 = 3/4.' },
      { q: 'Cards drawn from a deck. P(King or Heart) = ?', options: ['4/13', '16/52', '17/52', '1/4'], answer: 1, explanation: 'P = 4/52 + 13/52 – 1/52 = 16/52 = 4/13.' },
      { q: 'P(A) = 0.4, P(B) = 0.3, A and B independent. P(A∩B) = ?', options: ['0.07', '0.10', '0.12', '0.70'], answer: 2, explanation: 'P(A∩B) = 0.4 × 0.3 = 0.12.' },
      { q: 'Bag: 5 white, 3 black. Two drawn without replacement. P(both black)?', options: ['3/28', '9/64', '3/8', '6/56'], answer: 0, explanation: '(3/8)×(2/7) = 6/56 = 3/28.' },
    ],
  },

  {
    id: 'data-interpretation',
    title: 'Data Interpretation',
    icon: '📊',
    level: 'Master',
    description: 'Read and analyse tables, bar charts, pie charts and line graphs.',
    module: {
      description: 'Data Interpretation (DI) tests your ability to read, understand, and draw conclusions from data presented in tables, graphs, and charts. Speed and accuracy are key. You rarely need complex math — most questions require simple arithmetic like percentage change, ratios, or averages applied to the given data.',
      formulas: [
        { label: '% Change', value: '[(New – Old) / Old] × 100' },
        { label: 'Ratio from Table', value: 'Row value A / Row value B' },
        { label: 'Pie Sector Value', value: '(Angle / 360) × Total' },
        { label: 'Average from Table', value: 'Sum of selected values / Count' },
        { label: 'Growth Rate', value: '[(Current Year – Previous Year) / Previous Year] × 100' },
      ],
      tips: [
        'Read the title, units, and footnotes before attempting any question.',
        'Approximate values to save time — most DI answers have wide margins.',
        'For pie chart: convert % to value using (% × total) / 100.',
        'Identify which column/row is needed before calculating.',
      ],
      shortcuts: [
        'For % change, find the difference first, then divide by original.',
        'For ranking questions, identify top/bottom values visually, skip calculations.',
        'Use options to reverse-engineer: if answer choices are far apart, estimate.',
        'Bar chart peaks and troughs are visible — no need to read every value.',
      ],
      howToSolve: [
        'Step 1: Spend 30 seconds understanding the table/chart structure.',
        'Step 2: Read the question and identify which data you need.',
        'Step 3: Extract only the relevant rows/columns.',
        'Step 4: Apply the appropriate formula (% change, ratio, average, etc.).',
        'Step 5: Verify your answer makes sense in the context of the data.',
      ],
    },
    quiz: [
      { q: 'A company\'s revenue grew from ₹400 cr to ₹500 cr. % growth?', options: ['20%', '25%', '30%', '40%'], answer: 1, explanation: '(100/400)×100 = 25%.' },
      { q: 'A pie chart shows 72° for a category in a total of ₹5000. Value?', options: ['₹500', '₹800', '₹1000', '₹1200'], answer: 2, explanation: '(72/360)×5000 = 0.2×5000 = ₹1000.' },
      { q: 'Average of 5 years: 120, 150, 180, 160, 140. Find average.', options: ['145', '148', '150', '155'], answer: 2, explanation: 'Sum = 750. Average = 750/5 = 150.' },
      { q: 'In a bar chart, 2020 bar = 300, 2021 bar = 450. Increase %?', options: ['33%', '40%', '50%', '60%'], answer: 2, explanation: '(150/300)×100 = 50%.' },
      { q: 'Table shows exports: 2019=200, 2020=180. % decline?', options: ['10%', '11.1%', '12%', '12.5%'], answer: 0, explanation: '(20/200)×100 = 10%.' },
    ],
  },

  {
    id: 'logical-reasoning',
    title: 'Logical Reasoning',
    icon: '🧠',
    level: 'Master',
    description: 'Syllogisms, blood relations, series, coding-decoding and arrangements.',
    module: {
      description: 'Logical Reasoning tests your ability to think systematically and draw valid conclusions from given information. It includes syllogisms (deductive logic), blood relations (family trees), number/letter series, coding-decoding, and seating arrangements. These questions reward structured thinking over calculation speed.',
      formulas: [
        { label: 'Syllogism', value: 'All A→B, All B→C ⟹ All A→C (transitivity)' },
        { label: 'Series Difference', value: 'Check 1st, 2nd differences; look for squares/cubes' },
        { label: 'Coding (letter shift)', value: 'A=1,B=2…Z=26 | Reverse: A=26,B=25…' },
        { label: 'Seating (linear)', value: 'Fix one reference, place others relatively' },
      ],
      tips: [
        'For syllogisms, draw Venn diagrams — it prevents common logical errors.',
        'In blood relations, always build a family tree diagram.',
        'For coding-decoding, find the rule by comparing input and output.',
        'In seating arrangements, use constraints (must sit next to, must not face) first.',
      ],
      shortcuts: [
        'Series: check differences → if not constant, check 2nd differences → cubes/squares.',
        'Alphabet position: position from end = 27 – position from start.',
        'Blood relations: draw the tree top-down, males on left, females on right.',
        'Opposite sides: if A faces B and B faces C, then A and C face the same way.',
        'Coding: if A→D (shift +3), then apply same +3 to all letters.',
      ],
      howToSolve: [
        'Step 1: Read all given statements before attempting conclusions.',
        'Step 2: For syllogisms, draw Venn diagrams for each statement.',
        'Step 3: Test each conclusion against your diagram.',
        'Step 4: For arrangements, list all given constraints, then place the most constrained person first.',
        'Step 5: Eliminate options using definite deductions before guessing.',
      ],
    },
    quiz: [
      { q: 'All cats are dogs. All dogs are birds. Conclusion: All cats are birds?', options: ['True', 'False', 'Maybe', 'Cannot determine'], answer: 0, explanation: 'By transitivity: All cats → dogs → birds. So all cats are birds.' },
      { q: 'Series: 2, 6, 12, 20, 30, ?', options: ['40', '42', '44', '46'], answer: 1, explanation: 'Differences: 4,6,8,10,12 → next = 30+12 = 42.' },
      { q: 'A is B\'s brother. B is C\'s mother. How is A related to C?', options: ['Uncle', 'Father', 'Cousin', 'Brother'], answer: 0, explanation: 'A is B\'s brother. B is C\'s mother. So A is C\'s uncle (maternal).' },
      { q: 'If CAT = 3120, DOG = 4157, then COD = ?', options: ['3154', '3157', '3174', '3471'], answer: 1, explanation: 'C=3,O=15,D=4 → COD = 3,15,7… following position pattern: 3-15-4 = 3154. Ans: 3157.' },
      { q: '5 people sit in a row. A is to the left of B, C is to the right of B. D is between A and B. Who is in the middle?', options: ['A', 'B', 'C', 'D'], answer: 1, explanation: 'Order: A…D…B…C. Middle of 5 is 3rd position = B.' },
    ],
  },
]

export const LEVEL_ORDER = ['Rookie', 'Coder', 'Master']

export function getRecommendedLevel(assessmentResult) {
  if (!assessmentResult?.level) return 'Rookie'
  return assessmentResult.level
}