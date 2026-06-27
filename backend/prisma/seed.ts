import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// ============================================================
// DYNAMIC TEST CASE GENERATORS
// ============================================================

// Two Sum (1)
function generateTwoSumTestCase(): { input: string, expectedOutput: string, isSample: boolean } {
  const n = Math.floor(Math.random() * 20) + 10;
  const nums: number[] = [];
  for (let i = 0; i < n; i++) nums.push(Math.floor(Math.random() * 200) - 100);
  const idx1 = Math.floor(Math.random() * n);
  let idx2 = Math.floor(Math.random() * n);
  while (idx2 === idx1) idx2 = Math.floor(Math.random() * n);
  const target = nums[idx1] + nums[idx2];
  const seen = new Map<number, number>();
  let out = "";
  for (let i = 0; i < n; i++) {
    const comp = target - nums[i];
    if (seen.has(comp)) {
      out = `${seen.get(comp)} ${i}`;
      break;
    }
    seen.set(nums[i], i);
  }
  return {
    input: `${n}\n${nums.join(' ')}\n${target}`,
    expectedOutput: out,
    isSample: false
  };
}

// Reverse String (2)
function generateReverseStringTestCase(): { input: string, expectedOutput: string, isSample: boolean } {
  const chars = 'abcdefghijklmnopqrstuvwxyz';
  let s = '';
  const len = Math.floor(Math.random() * 15) + 5;
  for (let i = 0; i < len; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return {
    input: s,
    expectedOutput: s.split('').reverse().join(''),
    isSample: false
  };
}

// Palindrome Check (3)
function generatePalindromeTestCase(): { input: string, expectedOutput: string, isSample: boolean } {
  const chars = 'abcdefghijklmnopqrstuvwxyz';
  const isPal = Math.random() > 0.5;
  let s = '';
  const len = Math.floor(Math.random() * 6) + 4;
  for (let i = 0; i < len; i++) s += chars[Math.floor(Math.random() * chars.length)];
  if (isPal) {
    s = s + s.split('').reverse().join('');
  }
  const rev = s.split('').reverse().join('');
  return {
    input: s,
    expectedOutput: s === rev ? 'YES' : 'NO',
    isSample: false
  };
}

// Maximum Subarray Sum (4)
function generateMaxSubarrayTestCase(): { input: string, expectedOutput: string, isSample: boolean } {
  const n = Math.floor(Math.random() * 20) + 10;
  const nums: number[] = [];
  for (let i = 0; i < n; i++) nums.push(Math.floor(Math.random() * 100) - 50);
  let cur = nums[0];
  let best = nums[0];
  for (let i = 1; i < n; i++) {
    cur = Math.max(nums[i], cur + nums[i]);
    best = Math.max(best, cur);
  }
  return {
    input: `${n}\n${nums.join(' ')}`,
    expectedOutput: best.toString(),
    isSample: false
  };
}

// Binary Search (5)
function generateBinarySearchTestCase(): { input: string, expectedOutput: string, isSample: boolean } {
  const n = Math.floor(Math.random() * 20) + 10;
  const nums: number[] = [];
  for (let i = 0; i < n; i++) nums.push(Math.floor(Math.random() * 200) - 100);
  nums.sort((a, b) => a - b);
  const distinctNums = Array.from(new Set(nums));
  const target = Math.random() > 0.3
    ? distinctNums[Math.floor(Math.random() * distinctNums.length)]
    : Math.floor(Math.random() * 300) - 150;
  const idx = distinctNums.indexOf(target);
  return {
    input: `${distinctNums.length}\n${distinctNums.join(' ')}\n${target}`,
    expectedOutput: idx.toString(),
    isSample: false
  };
}

// Merge Sorted Arrays (6)
function generateMergeSortedTestCase(): { input: string, expectedOutput: string, isSample: boolean } {
  const m = Math.floor(Math.random() * 10) + 5;
  const n = Math.floor(Math.random() * 10) + 5;
  const a: number[] = [];
  const b: number[] = [];
  for (let i = 0; i < m; i++) a.push(Math.floor(Math.random() * 100) - 50);
  for (let i = 0; i < n; i++) b.push(Math.floor(Math.random() * 100) - 50);
  a.sort((x, y) => x - y);
  b.sort((x, y) => x - y);
  const merged = [...a, ...b].sort((x, y) => x - y);
  return {
    input: `${m}\n${a.join(' ')}\n${n}\n${b.join(' ')}`,
    expectedOutput: merged.join(' '),
    isSample: false
  };
}

// Count Vowels (7)
function generateCountVowelsTestCase(): { input: string, expectedOutput: string, isSample: boolean } {
  const chars = 'abcdefghijklmnopqrstuvwxyz';
  let s = '';
  const len = Math.floor(Math.random() * 20) + 10;
  for (let i = 0; i < len; i++) s += chars[Math.floor(Math.random() * chars.length)];
  let count = 0;
  const vowels = 'aeiou';
  for (const c of s) {
    if (vowels.includes(c)) count++;
  }
  return {
    input: s,
    expectedOutput: count.toString(),
    isSample: false
  };
}

// Fibonacci Number (8)
function generateFibonacciTestCase(): { input: string, expectedOutput: string, isSample: boolean } {
  const N = Math.floor(Math.random() * 1000) + 2;
  const MOD = 1e9 + 7;
  let a = 0n;
  let b = 1n;
  for (let i = 2; i <= N; i++) {
    const c = (a + b) % BigInt(MOD);
    a = b;
    b = c;
  }
  return {
    input: N.toString(),
    expectedOutput: b.toString(),
    isSample: false
  };
}

// Longest Common Subsequence (9)
function generateLcsTestCase(): { input: string, expectedOutput: string, isSample: boolean } {
  const chars = 'abcdefghijklmnopqrstuvwxyz';
  let a = '';
  let b = '';
  const lenA = Math.floor(Math.random() * 12) + 5;
  const lenB = Math.floor(Math.random() * 12) + 5;
  for (let i = 0; i < lenA; i++) a += chars[Math.floor(Math.random() * chars.length)];
  for (let i = 0; i < lenB; i++) b += chars[Math.floor(Math.random() * chars.length)];
  const dp = Array(lenA + 1).fill(0).map(() => Array(lenB + 1).fill(0));
  for (let i = 1; i <= lenA; i++) {
    for (let j = 1; j <= lenB; j++) {
      dp[i][j] = (a[i - 1] === b[j - 1])
        ? dp[i - 1][j - 1] + 1
        : Math.max(dp[i - 1][j], dp[i][j - 1]);
    }
  }
  return {
    input: `${a}\n${b}`,
    expectedOutput: dp[lenA][lenB].toString(),
    isSample: false
  };
}

// Coin Change (10)
function generateCoinChangeTestCase(): { input: string, expectedOutput: string, isSample: boolean } {
  const coinCount = Math.floor(Math.random() * 3) + 2;
  const coinsSet = new Set<number>();
  while (coinsSet.size < coinCount) {
    coinsSet.add(Math.floor(Math.random() * 10) + 1);
  }
  const coins = Array.from(coinsSet).sort((x, y) => x - y);
  const amount = Math.floor(Math.random() * 100) + 1;
  const dp = Array(amount + 1).fill(Infinity);
  dp[0] = 0;
  for (let i = 1; i <= amount; i++) {
    for (const c of coins) {
      if (c <= i && dp[i - c] !== Infinity) {
        dp[i] = Math.min(dp[i], dp[i - c] + 1);
      }
    }
  }
  const ans = dp[amount] === Infinity ? -1 : dp[amount];
  return {
    input: `${coins.length}\n${coins.join(' ')}\n${amount}`,
    expectedOutput: ans.toString(),
    isSample: false
  };
}

async function main() {
  console.log('Seeding database with accounts and 10 problems...');

  // 1. Clean existing database
  await prisma.editorial.deleteMany({});
  await prisma.hint.deleteMany({});
  await prisma.testCase.deleteMany({});
  await prisma.submission.deleteMany({});
  await prisma.userStatistics.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.problem.deleteMany({});
  await prisma.problemTag.deleteMany({});

  // 2. Create Users
  const passwordHash = await bcrypt.hash('password123', 10);

  // Admin User
  const admin = await prisma.user.create({
    data: {
      username: 'admin',
      email: 'admin@codearena.com',
      passwordHash,
      role: 'ADMIN',
      isVerified: true,
    },
  });
  await prisma.userStatistics.create({ data: { userId: admin.id } });

  // Regular User
  const user = await prisma.user.create({
    data: {
      username: 'coder_42',
      email: 'user@codearena.com',
      passwordHash,
      role: 'USER',
      isVerified: true,
    },
  });
  await prisma.userStatistics.create({ data: { userId: user.id } });

  console.log('Created accounts:');
  console.log('  Admin: admin@codearena.com / password123');
  console.log('  User:  user@codearena.com / password123');

  // ============================================================
  // PROBLEM 1: Two Sum (EASY)
  // ============================================================
  await prisma.problem.create({
    data: {
      title: 'Two Sum',
      slug: 'two-sum',
      difficulty: 'EASY',
      statement: `Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to \`target\`.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

Output the indices separated by a space, sorted in ascending order.`,
      inputFormat: 'The first line contains an integer N (the size of the array).\nThe second line contains N space-separated integers representing the array.\nThe third line contains the target integer.',
      outputFormat: 'Output two space-separated integers representing the indices of the two numbers.',
      constraints: '2 <= N <= 10^4\n-10^9 <= nums[i] <= 10^9\n-10^9 <= target <= 10^9',
      tags: {
        connectOrCreate: [
          { where: { name: 'Arrays' }, create: { name: 'Arrays' } },
          { where: { name: 'Hash Table' }, create: { name: 'Hash Table' } },
        ],
      },
      testCases: {
        create: [
          // Sample Test Cases
          { input: '4\n2 7 11 15\n9', expectedOutput: '0 1', isSample: true },
          { input: '3\n3 2 4\n6', expectedOutput: '1 2', isSample: true },
          { input: '2\n3 3\n6', expectedOutput: '0 1', isSample: true },
          // Hidden Test Cases
          { input: '5\n1 5 3 7 2\n8', expectedOutput: '1 2', isSample: false },
          { input: '4\n-1 -2 -3 -4\n-6', expectedOutput: '1 3', isSample: false },
          { input: '6\n10 20 30 40 50 60\n70', expectedOutput: '0 5', isSample: false },
          { input: '3\n0 4 3\n3', expectedOutput: '0 2', isSample: false },
          { input: '5\n1 2 3 4 5\n9', expectedOutput: '3 4', isSample: false },
          { input: '4\n100 200 300 400\n500', expectedOutput: '0 3', isSample: false },
          { input: '6\n-5 -3 4 7 8 1\n-8', expectedOutput: '0 1', isSample: false },
          { input: '3\n1000000000 -1000000000 0\n0', expectedOutput: '0 1', isSample: false },
          { input: '4\n5 10 15 20\n25', expectedOutput: '0 3', isSample: false },
          { input: '7\n1 3 5 7 9 11 13\n14', expectedOutput: '0 6', isSample: false },
          { input: '5\n2 4 6 8 10\n12', expectedOutput: '0 4', isSample: false },
          { input: '4\n-10 20 -30 40\n10', expectedOutput: '0 1', isSample: false },
        ],
      },
      hints: {
        create: [
          { level: 1, content: 'A brute force approach would be to check every pair, which takes O(N^2) time. Can we do better?' },
          { level: 2, content: 'Try caching values we have seen so far in a hash map as we iterate. What should the key and value be?' },
          { level: 3, content: 'For each element x, we check if target - x is already stored in the hash map. If yes, we found our indices!' },
        ],
      },
      editorial: {
        create: {
          content: 'We can solve this in O(N) time using a Hash Map. We iterate through the array, storing each number\'s index. For each number, we look up its complement (target - num).',
          codeSolution: `#include <iostream>
#include <vector>
#include <unordered_map>
using namespace std;
int main() {
    int n; cin >> n;
    vector<int> nums(n);
    for (int i = 0; i < n; i++) cin >> nums[i];
    int target; cin >> target;
    unordered_map<int, int> seen;
    for (int i = 0; i < n; i++) {
        int comp = target - nums[i];
        if (seen.count(comp)) { cout << seen[comp] << " " << i << endl; return 0; }
        seen[nums[i]] = i;
    }
    return 0;
}`,
        },
      },
    },
  });
  console.log('  Created: Two Sum (EASY)');

  // ============================================================
  // PROBLEM 2: Reverse String (EASY)
  // ============================================================
  await prisma.problem.create({
    data: {
      title: 'Reverse String',
      slug: 'reverse-string',
      difficulty: 'EASY',
      statement: `Write a program that takes a string input and prints it in reverse order.`,
      inputFormat: 'A single line containing the string input (no spaces).',
      outputFormat: 'Print the string in reverse order.',
      constraints: '1 <= string.length <= 10^5',
      tags: {
        connectOrCreate: [
          { where: { name: 'Strings' }, create: { name: 'Strings' } },
          { where: { name: 'Two Pointers' }, create: { name: 'Two Pointers' } },
        ],
      },
      testCases: {
        create: [
          { input: 'hello', expectedOutput: 'olleh', isSample: true },
          { input: 'world', expectedOutput: 'dlrow', isSample: true },
          { input: 'a', expectedOutput: 'a', isSample: true },
          // Hidden
          { input: 'codearena', expectedOutput: 'aneraedoc', isSample: false },
          { input: 'abcdefghij', expectedOutput: 'jihgfedcba', isSample: false },
          { input: 'racecar', expectedOutput: 'racecar', isSample: false },
          { input: 'programming', expectedOutput: 'gnimmargorp', isSample: false },
          { input: 'z', expectedOutput: 'z', isSample: false },
          { input: 'ab', expectedOutput: 'ba', isSample: false },
          { input: 'aaaaaa', expectedOutput: 'aaaaaa', isSample: false },
          { input: 'abcba', expectedOutput: 'abcba', isSample: false },
          { input: 'openai', expectedOutput: 'ianepo', isSample: false },
          { input: 'algorithm', expectedOutput: 'mhtirogla', isSample: false },
          { input: 'testcase', expectedOutput: 'esactset', isSample: false },
          { input: 'xyz', expectedOutput: 'zyx', isSample: false },
        ],
      },
      hints: {
        create: [
          { level: 1, content: 'Read the input string using std::string.' },
          { level: 2, content: 'You can swap characters from both ends moving inward, or print the string backward.' },
          { level: 3, content: 'Try using std::reverse(str.begin(), str.end()) or a custom pointer loop.' },
        ],
      },
      editorial: {
        create: {
          content: 'Use std::reverse which swaps characters from both ends in O(N) time and O(1) extra space.',
          codeSolution: `#include <iostream>
#include <string>
#include <algorithm>
using namespace std;
int main() {
    string s; cin >> s;
    reverse(s.begin(), s.end());
    cout << s << endl;
    return 0;
}`,
        },
      },
    },
  });
  console.log('  Created: Reverse String (EASY)');

  // ============================================================
  // PROBLEM 3: Palindrome Check (EASY)
  // ============================================================
  await prisma.problem.create({
    data: {
      title: 'Palindrome Check',
      slug: 'palindrome-check',
      difficulty: 'EASY',
      statement: `Given a string, determine whether it is a palindrome. A palindrome reads the same forward and backward.

Print \`YES\` if it is a palindrome, \`NO\` otherwise.`,
      inputFormat: 'A single line containing the string (lowercase English letters only, no spaces).',
      outputFormat: 'Print YES or NO.',
      constraints: '1 <= string.length <= 10^5',
      tags: {
        connectOrCreate: [
          { where: { name: 'Strings' }, create: { name: 'Strings' } },
          { where: { name: 'Two Pointers' }, create: { name: 'Two Pointers' } },
        ],
      },
      testCases: {
        create: [
          { input: 'racecar', expectedOutput: 'YES', isSample: true },
          { input: 'hello', expectedOutput: 'NO', isSample: true },
          { input: 'a', expectedOutput: 'YES', isSample: true },
          // Hidden
          { input: 'madam', expectedOutput: 'YES', isSample: false },
          { input: 'level', expectedOutput: 'YES', isSample: false },
          { input: 'abcba', expectedOutput: 'YES', isSample: false },
          { input: 'abcde', expectedOutput: 'NO', isSample: false },
          { input: 'ab', expectedOutput: 'NO', isSample: false },
          { input: 'aa', expectedOutput: 'YES', isSample: false },
          { input: 'abccba', expectedOutput: 'YES', isSample: false },
          { input: 'abcdba', expectedOutput: 'NO', isSample: false },
          { input: 'noon', expectedOutput: 'YES', isSample: false },
          { input: 'kayak', expectedOutput: 'YES', isSample: false },
          { input: 'python', expectedOutput: 'NO', isSample: false },
        ],
      },
      hints: {
        create: [
          { level: 1, content: 'Compare the string with its reverse.' },
          { level: 2, content: 'Alternatively, use two pointers from both ends.' },
        ],
      },
      editorial: {
        create: {
          content: 'Compare the string with its reverse. If they match, it is a palindrome.',
          codeSolution: `#include <iostream>
#include <string>
#include <algorithm>
using namespace std;
int main() {
    string s; cin >> s;
    string rev = s;
    reverse(rev.begin(), rev.end());
    cout << (s == rev ? "YES" : "NO") << endl;
    return 0;
}`,
        },
      },
    },
  });
  console.log('  Created: Palindrome Check (EASY)');

  // ============================================================
  // PROBLEM 4: Maximum Subarray Sum (MEDIUM)
  // ============================================================
  await prisma.problem.create({
    data: {
      title: 'Maximum Subarray Sum',
      slug: 'maximum-subarray-sum',
      difficulty: 'MEDIUM',
      statement: `Given an array of integers, find the contiguous subarray (containing at least one number) which has the largest sum and print that sum.`,
      inputFormat: 'The first line contains an integer N.\nThe second line contains N space-separated integers.',
      outputFormat: 'Print the maximum subarray sum.',
      constraints: '1 <= N <= 10^5\n-10^4 <= nums[i] <= 10^4',
      tags: {
        connectOrCreate: [
          { where: { name: 'Arrays' }, create: { name: 'Arrays' } },
          { where: { name: 'Dynamic Programming' }, create: { name: 'Dynamic Programming' } },
        ],
      },
      testCases: {
        create: [
          { input: '9\n-2 1 -3 4 -1 2 1 -5 4', expectedOutput: '6', isSample: true },
          { input: '1\n1', expectedOutput: '1', isSample: true },
          { input: '5\n5 4 -1 7 8', expectedOutput: '23', isSample: true },
          // Hidden
          { input: '1\n-1', expectedOutput: '-1', isSample: false },
          { input: '3\n-2 -3 -1', expectedOutput: '-1', isSample: false },
          { input: '5\n1 2 3 4 5', expectedOutput: '15', isSample: false },
          { input: '6\n-1 2 3 -4 5 -1', expectedOutput: '6', isSample: false },
          { input: '4\n-1 -2 1 2', expectedOutput: '3', isSample: false },
          { input: '7\n3 -1 2 -1 3 -1 2', expectedOutput: '7', isSample: false },
          { input: '5\n-5 -4 -3 -2 -1', expectedOutput: '-1', isSample: false },
          { input: '8\n1 -2 3 4 -5 6 7 -8', expectedOutput: '15', isSample: false },
          { input: '3\n10000 -10000 10000', expectedOutput: '10000', isSample: false },
          { input: '6\n-2 -1 3 4 -2 5', expectedOutput: '10', isSample: false },
          { input: '4\n0 0 0 0', expectedOutput: '0', isSample: false },
        ],
      },
      hints: {
        create: [
          { level: 1, content: 'Think about Kadane\'s algorithm.' },
          { level: 2, content: 'At each position, decide whether to extend the current subarray or start a new one.' },
          { level: 3, content: 'Keep track of current_sum and max_sum. current_sum = max(nums[i], current_sum + nums[i]).' },
        ],
      },
      editorial: {
        create: {
          content: 'Use Kadane\'s Algorithm: maintain a running sum and reset it when it drops below the current element.',
          codeSolution: `#include <iostream>
#include <vector>
#include <climits>
using namespace std;
int main() {
    int n; cin >> n;
    vector<int> a(n);
    for (int i = 0; i < n; i++) cin >> a[i];
    long long cur = a[0], best = a[0];
    for (int i = 1; i < n; i++) {
        cur = max((long long)a[i], cur + a[i]);
        best = max(best, cur);
    }
    cout << best << endl;
    return 0;
}`,
        },
      },
    },
  });
  console.log('  Created: Maximum Subarray Sum (MEDIUM)');

  // ============================================================
  // PROBLEM 5: Binary Search (MEDIUM)
  // ============================================================
  await prisma.problem.create({
    data: {
      title: 'Binary Search',
      slug: 'binary-search',
      difficulty: 'MEDIUM',
      statement: `Given a sorted array of integers and a target value, find the index of the target. If the target is not found, print \`-1\`.`,
      inputFormat: 'The first line contains an integer N.\nThe second line contains N space-separated integers in sorted order.\nThe third line contains the target integer.',
      outputFormat: 'Print the 0-based index of the target, or -1 if not found.',
      constraints: '1 <= N <= 10^5\n-10^9 <= nums[i] <= 10^9',
      tags: {
        connectOrCreate: [
          { where: { name: 'Arrays' }, create: { name: 'Arrays' } },
          { where: { name: 'Binary Search' }, create: { name: 'Binary Search' } },
        ],
      },
      testCases: {
        create: [
          { input: '6\n-1 0 3 5 9 12\n9', expectedOutput: '4', isSample: true },
          { input: '6\n-1 0 3 5 9 12\n2', expectedOutput: '-1', isSample: true },
          { input: '1\n5\n5', expectedOutput: '0', isSample: true },
          // Hidden
          { input: '1\n5\n-5', expectedOutput: '-1', isSample: false },
          { input: '5\n1 2 3 4 5\n1', expectedOutput: '0', isSample: false },
          { input: '5\n1 2 3 4 5\n5', expectedOutput: '4', isSample: false },
          { input: '5\n1 2 3 4 5\n3', expectedOutput: '2', isSample: false },
          { input: '5\n1 2 3 4 5\n6', expectedOutput: '-1', isSample: false },
          { input: '10\n1 3 5 7 9 11 13 15 17 19\n15', expectedOutput: '7', isSample: false },
          { input: '10\n1 3 5 7 9 11 13 15 17 19\n20', expectedOutput: '-1', isSample: false },
          { input: '3\n-100 0 100\n-100', expectedOutput: '0', isSample: false },
          { input: '3\n-100 0 100\n100', expectedOutput: '2', isSample: false },
          { input: '7\n2 4 6 8 10 12 14\n8', expectedOutput: '3', isSample: false },
          { input: '4\n10 20 30 40\n25', expectedOutput: '-1', isSample: false },
        ],
      },
      hints: {
        create: [
          { level: 1, content: 'The array is sorted — you can use binary search for O(log N) time.' },
          { level: 2, content: 'Use two pointers (low, high) and check the middle element each time.' },
        ],
      },
      editorial: {
        create: {
          content: 'Standard binary search on a sorted array. O(log N) time complexity.',
          codeSolution: `#include <iostream>
#include <vector>
using namespace std;
int main() {
    int n; cin >> n;
    vector<int> a(n);
    for (int i = 0; i < n; i++) cin >> a[i];
    int target; cin >> target;
    int lo = 0, hi = n - 1;
    while (lo <= hi) {
        int mid = lo + (hi - lo) / 2;
        if (a[mid] == target) { cout << mid << endl; return 0; }
        else if (a[mid] < target) lo = mid + 1;
        else hi = mid - 1;
    }
    cout << -1 << endl;
    return 0;
}`,
        },
      },
    },
  });
  console.log('  Created: Binary Search (MEDIUM)');

  // ============================================================
  // PROBLEM 6: Merge Sorted Arrays (MEDIUM)
  // ============================================================
  await prisma.problem.create({
    data: {
      title: 'Merge Sorted Arrays',
      slug: 'merge-sorted-arrays',
      difficulty: 'MEDIUM',
      statement: `You are given two sorted arrays of integers. Merge them into a single sorted array and print the result.`,
      inputFormat: 'The first line contains integer M (size of array 1).\nThe second line contains M space-separated sorted integers.\nThe third line contains integer N (size of array 2).\nThe fourth line contains N space-separated sorted integers.',
      outputFormat: 'Print the merged sorted array as space-separated integers on a single line.',
      constraints: '1 <= M, N <= 10^5\n-10^9 <= element <= 10^9',
      tags: {
        connectOrCreate: [
          { where: { name: 'Arrays' }, create: { name: 'Arrays' } },
          { where: { name: 'Two Pointers' }, create: { name: 'Two Pointers' } },
          { where: { name: 'Sorting' }, create: { name: 'Sorting' } },
        ],
      },
      testCases: {
        create: [
          { input: '3\n1 3 5\n3\n2 4 6', expectedOutput: '1 2 3 4 5 6', isSample: true },
          { input: '2\n1 2\n1\n3', expectedOutput: '1 2 3', isSample: true },
          { input: '1\n5\n1\n5', expectedOutput: '5 5', isSample: true },
          // Hidden
          { input: '3\n-3 -1 5\n2\n-2 4', expectedOutput: '-3 -2 -1 4 5', isSample: false },
          { input: '1\n1\n1\n2', expectedOutput: '1 2', isSample: false },
          { input: '4\n1 1 1 1\n3\n1 1 1', expectedOutput: '1 1 1 1 1 1 1', isSample: false },
          { input: '5\n2 4 6 8 10\n5\n1 3 5 7 9', expectedOutput: '1 2 3 4 5 6 7 8 9 10', isSample: false },
          { input: '3\n10 20 30\n3\n40 50 60', expectedOutput: '10 20 30 40 50 60', isSample: false },
          { input: '3\n40 50 60\n3\n10 20 30', expectedOutput: '10 20 30 40 50 60', isSample: false },
          { input: '2\n-1000000000 1000000000\n1\n0', expectedOutput: '-1000000000 0 1000000000', isSample: false },
          { input: '4\n1 2 3 4\n4\n5 6 7 8', expectedOutput: '1 2 3 4 5 6 7 8', isSample: false },
          { input: '1\n100\n1\n50', expectedOutput: '50 100', isSample: false },
          { input: '3\n1 5 9\n4\n2 3 7 8', expectedOutput: '1 2 3 5 7 8 9', isSample: false },
        ],
      },
      hints: {
        create: [
          { level: 1, content: 'Use two pointers, one for each array.' },
          { level: 2, content: 'Compare elements from both arrays and pick the smaller one each time.' },
          { level: 3, content: 'After one array is exhausted, append the remaining elements of the other.' },
        ],
      },
      editorial: {
        create: {
          content: 'Classic two-pointer merge in O(M+N) time.',
          codeSolution: `#include <iostream>
#include <vector>
using namespace std;
int main() {
    int m; cin >> m;
    vector<int> a(m); for (int i = 0; i < m; i++) cin >> a[i];
    int n; cin >> n;
    vector<int> b(n); for (int i = 0; i < n; i++) cin >> b[i];
    int i = 0, j = 0;
    bool first = true;
    while (i < m && j < n) {
        if (!first) cout << " ";
        first = false;
        if (a[i] <= b[j]) cout << a[i++];
        else cout << b[j++];
    }
    while (i < m) { if (!first) cout << " "; first = false; cout << a[i++]; }
    while (j < n) { if (!first) cout << " "; first = false; cout << b[j++]; }
    cout << endl;
    return 0;
}`,
        },
      },
    },
  });
  console.log('  Created: Merge Sorted Arrays (MEDIUM)');

  // ============================================================
  // PROBLEM 7: Count Vowels (MEDIUM)
  // ============================================================
  await prisma.problem.create({
    data: {
      title: 'Count Vowels',
      slug: 'count-vowels',
      difficulty: 'MEDIUM',
      statement: `Given a string of lowercase English letters, count the number of vowels (a, e, i, o, u) in the string.`,
      inputFormat: 'A single line containing the string (lowercase English letters only, no spaces).',
      outputFormat: 'Print the count of vowels.',
      constraints: '1 <= string.length <= 10^5',
      tags: {
        connectOrCreate: [
          { where: { name: 'Strings' }, create: { name: 'Strings' } },
        ],
      },
      testCases: {
        create: [
          { input: 'hello', expectedOutput: '2', isSample: true },
          { input: 'aeiou', expectedOutput: '5', isSample: true },
          { input: 'bcdfg', expectedOutput: '0', isSample: true },
          // Hidden
          { input: 'a', expectedOutput: '1', isSample: false },
          { input: 'z', expectedOutput: '0', isSample: false },
          { input: 'programming', expectedOutput: '3', isSample: false },
          { input: 'aeiouaeiou', expectedOutput: '10', isSample: false },
          { input: 'bbbbb', expectedOutput: '0', isSample: false },
          { input: 'education', expectedOutput: '5', isSample: false },
          { input: 'rhythm', expectedOutput: '0', isSample: false },
          { input: 'queue', expectedOutput: '3', isSample: false },
          { input: 'sequoia', expectedOutput: '5', isSample: false },
          { input: 'strengths', expectedOutput: '1', isSample: false },
        ],
      },
      hints: {
        create: [
          { level: 1, content: 'Iterate through each character and check if it is a vowel.' },
          { level: 2, content: 'You can use a set or a string containing "aeiou" for quick lookup.' },
        ],
      },
      editorial: {
        create: {
          content: 'Simple iteration with vowel check. O(N) time.',
          codeSolution: `#include <iostream>
#include <string>
using namespace std;
int main() {
    string s; cin >> s;
    int cnt = 0;
    string vowels = "aeiou";
    for (char c : s) if (vowels.find(c) != string::npos) cnt++;
    cout << cnt << endl;
    return 0;
}`,
        },
      },
    },
  });
  console.log('  Created: Count Vowels (MEDIUM)');

  // ============================================================
  // PROBLEM 8: Fibonacci Number (HARD)
  // ============================================================
  await prisma.problem.create({
    data: {
      title: 'Fibonacci Number',
      slug: 'fibonacci-number',
      difficulty: 'HARD',
      statement: `Given an integer N, compute the N-th Fibonacci number.

The Fibonacci sequence is defined as:
- F(0) = 0
- F(1) = 1
- F(n) = F(n-1) + F(n-2) for n >= 2

Since the answer can be very large, output the result modulo 10^9 + 7.`,
      inputFormat: 'A single integer N.',
      outputFormat: 'Print the N-th Fibonacci number modulo 10^9 + 7.',
      constraints: '0 <= N <= 10^6',
      tags: {
        connectOrCreate: [
          { where: { name: 'Dynamic Programming' }, create: { name: 'Dynamic Programming' } },
          { where: { name: 'Math' }, create: { name: 'Math' } },
        ],
      },
      testCases: {
        create: [
          { input: '0', expectedOutput: '0', isSample: true },
          { input: '1', expectedOutput: '1', isSample: true },
          { input: '10', expectedOutput: '55', isSample: true },
          // Hidden
          { input: '2', expectedOutput: '1', isSample: false },
          { input: '3', expectedOutput: '2', isSample: false },
          { input: '5', expectedOutput: '5', isSample: false },
          { input: '7', expectedOutput: '13', isSample: false },
          { input: '20', expectedOutput: '6765', isSample: false },
          { input: '30', expectedOutput: '832040', isSample: false },
          { input: '50', expectedOutput: '586268941', isSample: false },
          { input: '100', expectedOutput: '687995182', isSample: false },
          { input: '1000', expectedOutput: '517691607', isSample: false },
          { input: '10000', expectedOutput: '468049177', isSample: false },
          { input: '100000', expectedOutput: '295027649', isSample: false },
          { input: '1000000', expectedOutput: '918987561', isSample: false },
        ],
      },
      hints: {
        create: [
          { level: 1, content: 'Recursive approach will be too slow for large N. Think iterative.' },
          { level: 2, content: 'Use two variables to keep track of F(n-1) and F(n-2) and iterate.' },
          { level: 3, content: 'Don\'t forget to apply modulo at each step to prevent overflow.' },
        ],
      },
      editorial: {
        create: {
          content: 'Iterative DP approach: keep two variables and iterate from 2 to N. O(N) time, O(1) space.',
          codeSolution: `#include <iostream>
using namespace std;
const int MOD = 1e9 + 7;
int main() {
    int n; cin >> n;
    if (n == 0) { cout << 0 << endl; return 0; }
    if (n == 1) { cout << 1 << endl; return 0; }
    long long a = 0, b = 1;
    for (int i = 2; i <= n; i++) {
        long long c = (a + b) % MOD;
        a = b; b = c;
    }
    cout << b << endl;
    return 0;
}`,
        },
      },
    },
  });
  console.log('  Created: Fibonacci Number (HARD)');

  // ============================================================
  // PROBLEM 9: Longest Common Subsequence (HARD)
  // ============================================================
  await prisma.problem.create({
    data: {
      title: 'Longest Common Subsequence',
      slug: 'longest-common-subsequence',
      difficulty: 'HARD',
      statement: `Given two strings, find the length of their longest common subsequence (LCS).

A subsequence is a sequence that can be derived from another sequence by deleting some or no elements without changing the order of the remaining elements.`,
      inputFormat: 'The first line contains string A.\nThe second line contains string B.',
      outputFormat: 'Print the length of the longest common subsequence.',
      constraints: '1 <= |A|, |B| <= 1000\nStrings contain only lowercase English letters.',
      tags: {
        connectOrCreate: [
          { where: { name: 'Dynamic Programming' }, create: { name: 'Dynamic Programming' } },
          { where: { name: 'Strings' }, create: { name: 'Strings' } },
        ],
      },
      testCases: {
        create: [
          { input: 'abcde\nace', expectedOutput: '3', isSample: true },
          { input: 'abc\nabc', expectedOutput: '3', isSample: true },
          { input: 'abc\ndef', expectedOutput: '0', isSample: true },
          // Hidden
          { input: 'a\na', expectedOutput: '1', isSample: false },
          { input: 'a\nb', expectedOutput: '0', isSample: false },
          { input: 'abcdef\nbdf', expectedOutput: '3', isSample: false },
          { input: 'abab\nbaba', expectedOutput: '3', isSample: false },
          { input: 'xyzw\nwzyx', expectedOutput: '1', isSample: false },
          { input: 'aaaaaa\naaa', expectedOutput: '3', isSample: false },
          { input: 'programming\ncontest', expectedOutput: '2', isSample: false },
          { input: 'abcbdab\nbdcaba', expectedOutput: '4', isSample: false },
          { input: 'gxtxayb\naggtab', expectedOutput: '4', isSample: false },
          { input: 'aaaa\naa', expectedOutput: '2', isSample: false },
          { input: 'abcdefghij\nfghijabcde', expectedOutput: '5', isSample: false },
        ],
      },
      hints: {
        create: [
          { level: 1, content: 'This is a classic Dynamic Programming problem.' },
          { level: 2, content: 'Create a 2D DP table where dp[i][j] represents the LCS length of A[0..i-1] and B[0..j-1].' },
          { level: 3, content: 'If A[i-1] == B[j-1], dp[i][j] = dp[i-1][j-1] + 1. Otherwise, dp[i][j] = max(dp[i-1][j], dp[i][j-1]).' },
        ],
      },
      editorial: {
        create: {
          content: 'Classic 2D DP. O(M*N) time and space.',
          codeSolution: `#include <iostream>
#include <string>
#include <vector>
#include <algorithm>
using namespace std;
int main() {
    string a, b; cin >> a >> b;
    int m = a.size(), n = b.size();
    vector<vector<int>> dp(m+1, vector<int>(n+1, 0));
    for (int i = 1; i <= m; i++)
        for (int j = 1; j <= n; j++)
            dp[i][j] = (a[i-1] == b[j-1]) ? dp[i-1][j-1] + 1 : max(dp[i-1][j], dp[i][j-1]);
    cout << dp[m][n] << endl;
    return 0;
}`,
        },
      },
    },
  });
  console.log('  Created: Longest Common Subsequence (HARD)');

  // ============================================================
  // PROBLEM 10: Coin Change (HARD)
  // ============================================================
  await prisma.problem.create({
    data: {
      title: 'Coin Change',
      slug: 'coin-change',
      difficulty: 'HARD',
      statement: `You are given an integer array \`coins\` representing coins of different denominations and an integer \`amount\` representing a total amount of money.

Return the fewest number of coins needed to make up that amount. If it is not possible, print \`-1\`.

You may assume you have an infinite number of each kind of coin.`,
      inputFormat: 'The first line contains integer N (number of coin denominations).\nThe second line contains N space-separated integers representing coin denominations.\nThe third line contains the target amount.',
      outputFormat: 'Print the minimum number of coins needed, or -1 if impossible.',
      constraints: '1 <= N <= 12\n1 <= coins[i] <= 2^31 - 1\n0 <= amount <= 10^4',
      tags: {
        connectOrCreate: [
          { where: { name: 'Dynamic Programming' }, create: { name: 'Dynamic Programming' } },
          { where: { name: 'Math' }, create: { name: 'Math' } },
        ],
      },
      testCases: {
        create: [
          { input: '3\n1 5 10\n11', expectedOutput: '2', isSample: true },
          { input: '1\n2\n3', expectedOutput: '-1', isSample: true },
          { input: '1\n1\n0', expectedOutput: '0', isSample: true },
          // Hidden
          { input: '3\n1 2 5\n11', expectedOutput: '3', isSample: false },
          { input: '3\n1 2 5\n100', expectedOutput: '20', isSample: false },
          { input: '2\n3 5\n7', expectedOutput: '-1', isSample: false },
          { input: '2\n3 5\n8', expectedOutput: '2', isSample: false },
          { input: '1\n1\n1', expectedOutput: '1', isSample: false },
          { input: '3\n1 5 10\n30', expectedOutput: '3', isSample: false },
          { input: '3\n1 5 10\n27', expectedOutput: '4', isSample: false },
          { input: '4\n1 5 10 25\n99', expectedOutput: '9', isSample: false },
          { input: '2\n2 5\n1', expectedOutput: '-1', isSample: false },
          { input: '3\n1 3 4\n6', expectedOutput: '2', isSample: false },
          { input: '2\n7 13\n26', expectedOutput: '2', isSample: false },
        ],
      },
      hints: {
        create: [
          { level: 1, content: 'Think about a DP approach where dp[i] is the min coins to make amount i.' },
          { level: 2, content: 'For each amount, try all coin denominations and take the minimum.' },
          { level: 3, content: 'dp[i] = min(dp[i - coin] + 1) for each coin. Initialize dp[0] = 0.' },
        ],
      },
      editorial: {
        create: {
          content: 'Bottom-up DP. dp[i] = min coins for amount i. O(amount * N) time.',
          codeSolution: `#include <iostream>
#include <vector>
#include <climits>
using namespace std;
int main() {
    int n; cin >> n;
    vector<int> coins(n);
    for (int i = 0; i < n; i++) cin >> coins[i];
    int amount; cin >> amount;
    vector<int> dp(amount + 1, INT_MAX);
    dp[0] = 0;
    for (int i = 1; i <= amount; i++)
        for (int c : coins)
            if (c <= i && dp[i - c] != INT_MAX)
                dp[i] = min(dp[i], dp[i - c] + 1);
    cout << (dp[amount] == INT_MAX ? -1 : dp[amount]) << endl;
    return 0;
}`,
        },
      },
    },
  });
  console.log('  Created: Coin Change (HARD)');

  // ============================================================
  // POST-SEEDING: EXPAND TEST CASES TO 30 PER PROBLEM
  // ============================================================
  console.log('Expanding test cases to 30 for all problems...');
  const allProblems = await prisma.problem.findMany({
    include: { testCases: true }
  });

  for (const p of allProblems) {
    const currentCount = p.testCases.length;
    const needed = 30 - currentCount;
    if (needed <= 0) continue;

    console.log(`  Problem "${p.title}" (slug: ${p.slug}) has ${currentCount} test cases. Adding ${needed} more...`);
    const newTestCases = [];
    for (let k = 0; k < needed; k++) {
      let tc;
      if (p.slug === 'two-sum') tc = generateTwoSumTestCase();
      else if (p.slug === 'reverse-string') tc = generateReverseStringTestCase();
      else if (p.slug === 'palindrome-check') tc = generatePalindromeTestCase();
      else if (p.slug === 'maximum-subarray-sum') tc = generateMaxSubarrayTestCase();
      else if (p.slug === 'binary-search') tc = generateBinarySearchTestCase();
      else if (p.slug === 'merge-sorted-arrays') tc = generateMergeSortedTestCase();
      else if (p.slug === 'count-vowels') tc = generateCountVowelsTestCase();
      else if (p.slug === 'fibonacci-number') tc = generateFibonacciTestCase();
      else if (p.slug === 'longest-common-subsequence') tc = generateLcsTestCase();
      else if (p.slug === 'coin-change') tc = generateCoinChangeTestCase();

      if (tc) {
        newTestCases.push({
          problemId: p.id,
          input: tc.input,
          expectedOutput: tc.expectedOutput,
          isSample: tc.isSample
        });
      }
    }

    if (newTestCases.length > 0) {
      await prisma.testCase.createMany({
        data: newTestCases
      });
    }
  }

  console.log('\nSeeding completed! 10 problems created and expanded to 30 test cases each (3 EASY, 4 MEDIUM, 3 HARD)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
