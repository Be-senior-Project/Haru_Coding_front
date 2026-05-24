export type ProblemType = 'multiple_choice' | 'fill_blank' | 'word_match' | 'short_answer';

export interface Problem {
  id: string;
  type: ProblemType;
  title: string;
  difficulty: '초급' | '중급' | '고급';
  topic: string;
  question: string;
  code?: string;
  options?: string[];
  blanks?: string[];
  matchLeft?: string[];
  matchRight?: string[];
  answer: string | string[];
  explanation: string;
}

// 하루 1세트 = 문제 N개 묶음
export interface ProblemSet {
  id: string;
  title: string;
  targetDate: string;   // 'YYYY-MM-DD'
  difficulty: '초급' | '중급' | '고급';
  problems: Problem[];
}

// ─── 문제 데이터 ────────────────────────────────────────────

const allProblems: Problem[] = [
  // ── 세트 1: 2026-05-24 ──────────────────────────────────
  {
    id: 's1-1',
    type: 'multiple_choice',
    title: 'BFS 핵심 개념 이해',
    difficulty: '초급',
    topic: '알고리즘',
    question: 'BFS(너비 우선 탐색)에 대한 설명으로 옳지 않은 것을 고르세요.',
    options: [
      '큐(Queue)를 사용해 구현한다',
      '가중치 없는 그래프에서 최단 경로를 보장한다',
      'DFS보다 항상 메모리를 적게 사용한다',
      '시작 노드에서 가까운 노드부터 탐색한다',
    ],
    answer: 'DFS보다 항상 메모리를 적게 사용한다',
    explanation: 'BFS는 같은 레벨의 모든 노드를 큐에 저장하므로, 넓은 그래프에서는 DFS보다 메모리를 더 많이 사용할 수 있습니다.',
  },
  {
    id: 's1-2',
    type: 'fill_blank',
    title: '스택으로 괄호 검사',
    difficulty: '중급',
    topic: '자료구조',
    question: '괄호 문자열이 올바른지 스택으로 검사하는 코드를 완성하세요.',
    code: `def is_valid(s):\n    stack = []\n    for c in s:\n        if c == '(':\n            stack.___(c)      # 빈칸1\n        elif c == ')':\n            if not stack:\n                return False\n            stack.___()       # 빈칸2\n    return not ___            # 빈칸3`,
    blanks: ['append', 'pop', 'stack'],
    answer: ['append', 'pop', 'stack'],
    explanation: '여는 괄호는 push, 닫는 괄호는 pop합니다. 마지막에 스택이 비어 있어야 모든 괄호가 짝이 맞습니다.',
  },
  {
    id: 's1-3',
    type: 'word_match',
    title: 'IT 핵심 용어 매칭',
    difficulty: '초급',
    topic: '개념',
    question: '핵심 용어와 정의를 올바르게 짝지어 보세요.',
    matchLeft: ['메타버스', '디지털 트윈', '블록체인', '클라우드'],
    matchRight: [
      '가상과 현실이 상호작용하는 3차원 가상 세계',
      '가상의 물리적 사물을 가상 세계 그대로 복제하는 기술',
      '인터넷을 통해 IT 자원을 대여하여 사용하는 서비스',
      '분산 컴퓨팅 기반의 데이터 위변조 방지 기술',
    ],
    answer: [
      '가상과 현실이 상호작용하는 3차원 가상 세계',
      '가상의 물리적 사물을 가상 세계 그대로 복제하는 기술',
      '분산 컴퓨팅 기반의 데이터 위변조 방지 기술',
      '인터넷을 통해 IT 자원을 대여하여 사용하는 서비스',
    ],
    explanation: '각 용어의 정의를 정확히 이해하는 것이 중요합니다.',
  },
  {
    id: 's1-4',
    type: 'short_answer',
    title: 'OOP 캡슐화',
    difficulty: '중급',
    topic: '언어/문법',
    question: '객체지향 프로그래밍(OOP)에서 데이터와 함수를 하나로 묶어 외부로부터의 직접적인 접근을 방지하는 기술은 무엇인가요?',
    answer: '캡슐화',
    explanation: '캡슐화(Encapsulation)는 OOP의 핵심 원칙 중 하나로, 데이터와 메서드를 클래스 내부에 숨기고 외부 접근을 제한합니다.',
  },

  // ── 세트 2: 2026-05-25 ──────────────────────────────────
  {
    id: 's2-1',
    type: 'multiple_choice',
    title: 'BFS 코드 오류 찾기',
    difficulty: '중급',
    topic: '알고리즘',
    question: '아래 코드는 BFS처럼 보이지만 실제로는 DFS로 동작합니다. 원인을 고르세요.',
    code: `from collections import deque\n\ndef traversal(graph, start):\n    visited = set([start])\n    queue = deque([start])\n\n    while queue:\n        node = queue.pop()      # ← 주목\n        print(node)\n\n        for neighbor in graph[node]:\n            if neighbor not in visited:\n                visited.add(neighbor)\n                queue.append(neighbor)`,
    options: [
      'queue.pop()이 LIFO 방식으로 꺼내므로 DFS가 된다',
      'visited를 set으로 선언해 순서가 보장되지 않는다',
      'queue.append() 대신 queue.appendleft()를 써야 한다',
      '코드에 오류가 없다',
    ],
    answer: 'queue.pop()이 LIFO 방식으로 꺼내므로 DFS가 된다',
    explanation: 'deque.pop()은 오른쪽(뒤)에서 꺼내는 LIFO 방식이라 스택처럼 동작합니다. BFS는 반드시 popleft()로 앞에서 꺼내야 합니다.',
  },
  {
    id: 's2-2',
    type: 'fill_blank',
    title: '이진 탐색 구현',
    difficulty: '중급',
    topic: '알고리즘',
    question: '정렬된 배열에서 target 값을 찾는 이진 탐색 코드를 완성하세요.',
    code: `function binarySearch(arr, target) {\n  let left = 0;\n  let right = arr.___ - 1;\n\n  while (left <= right) {\n    const mid = Math.floor((left + right) / 2);\n    if (arr[mid] === target) return mid;\n    else if (arr[mid] < target) left = ___ + 1;\n    else right = mid - ___;\n  }\n  return -1;\n}`,
    blanks: ['length', 'mid', '1'],
    answer: ['length', 'mid', '1'],
    explanation: '이진 탐색은 중간값과 target을 비교해 탐색 범위를 절반씩 줄입니다. 시간복잡도는 O(log n)입니다.',
  },
  {
    id: 's2-3',
    type: 'multiple_choice',
    title: 'LRU 캐시 구현',
    difficulty: '고급',
    topic: '알고리즘',
    question: '아래 LRU 캐시 구현에 대한 설명으로 올바른 것은?',
    code: `class LRUCache {\n  constructor(capacity) {\n    this.capacity = capacity;\n    this.cache = new Map();\n  }\n  get(key) {\n    if (!this.cache.has(key)) return -1;\n    const value = this.cache.get(key);\n    this.cache.delete(key);\n    this.cache.set(key, value);\n    return value;\n  }\n  put(key, value) {\n    if (this.cache.has(key)) this.cache.delete(key);\n    else if (this.cache.size >= this.capacity) {\n      this.cache.delete(this.cache.keys().next().value);\n    }\n    this.cache.set(key, value);\n  }\n}`,
    options: [
      'Map은 삽입 순서를 보장하지 않아 오류가 있다',
      '코드는 정상 동작하며 오류가 없다',
      'get() 호출 시 순서가 갱신되지 않는다',
      'capacity 비교 시 >= 대신 >를 써야 한다',
    ],
    answer: '코드는 정상 동작하며 오류가 없다',
    explanation: 'JavaScript의 Map은 삽입 순서를 보장합니다. get()에서 delete→set으로 최근 사용 순서를 갱신하고, put()에서 keys().next().value로 가장 오래된 키를 꺼내 삭제합니다.',
  },
  {
    id: 's2-4',
    type: 'short_answer',
    title: 'DP 개념',
    difficulty: '초급',
    topic: '알고리즘',
    question: '동적 프로그래밍(DP)에서 이미 계산한 값을 저장해두고 재사용하는 기법을 무엇이라 하나요?',
    answer: '메모이제이션',
    explanation: '메모이제이션(Memoization)은 동일한 계산이 반복될 때 이전 결과를 캐시에 저장해 중복 계산을 방지하는 DP의 핵심 기법입니다.',
  },
];

// ─── 세트 정의 ────────────────────────────────────────────

export const problemSets: ProblemSet[] = [
  {
    id: 'set-1',
    title: '오늘의 코딩 도전',
    targetDate: '2026-05-24',
    difficulty: '초급',
    problems: allProblems.filter(p => p.id.startsWith('s1-')),
  },
  {
    id: 'set-2',
    title: '오늘의 코딩 도전',
    targetDate: '2026-05-25',
    difficulty: '중급',
    problems: allProblems.filter(p => p.id.startsWith('s2-')),
  },
];

// ─── 유틸 함수 ────────────────────────────────────────────

export const getTodaySet = (): ProblemSet | null => {
  const today = new Date().toISOString().split('T')[0];
  return problemSets.find(s => s.targetDate === today) ?? problemSets[0];
};

// 하위 호환 (ProblemSolveScreen에서 단일 문제 조회 시)
export const getProblemById = (id: string): Problem | undefined =>
  allProblems.find(p => p.id === id);
