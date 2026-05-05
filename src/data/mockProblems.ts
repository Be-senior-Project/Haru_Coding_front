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
  date: string;
}

export const mockProblems: Problem[] = [
  {
    id: '1',
    type: 'multiple_choice',
    title: '반복문 안에서 포인터 이동',
    difficulty: '초급',
    topic: '알고리즘',
    question: '다음 중 반복문 안에서 포인터를 이동시키기에 적합한 코드는?',
    code: `while (head != NULL) {\n    count++;\n    ?\n}`,
    options: ['head++;', 'head = head->next;', 'head.next();', 'free(head);'],
    answer: 'head = head->next;',
    explanation: 'head = head->next는 연결 리스트에서 다음 노드로 포인터를 이동시키는 올바른 방법입니다.',
    date: '2026-04-28',
  },
  {
    id: '2',
    type: 'fill_blank',
    title: '연결 리스트 노드 개수',
    difficulty: '중급',
    topic: '자료구조',
    question: '연결 리스트의 모든 노드 개수를 구하는 코드를 완성하세요.',
    code: `int countNodes(ListNode* head) {\n    int count = 0;\n    while (head != ___) {\n        ___++;\n        head = head->next;\n    }\n    return count;\n}`,
    blanks: ['NULL', 'count'],
    answer: ['NULL', 'count'],
    explanation: 'NULL은 연결 리스트의 끝을 나타내며, count를 증가시켜 노드 수를 셉니다.',
    date: '2026-04-29',
  },
  {
    id: '3',
    type: 'word_match',
    title: 'IT 핵심 용어 매칭',
    difficulty: '초급',
    topic: '개념',
    question: '정보처리기사 핵심 용어와 그 정의를 올바르게 짝지어 보세요.',
    matchLeft: ['메타버스', '디지털 트윈', '블록체인', '클라우드'],
    matchRight: [
      '가상과 현실이 상호작용하는 3차원 가상 세계',
      '가상의 물리적 사물을 가상 세계 그대로 복제하는 기술',
      '인터넷을 통해 IT 자원을 대여하여 사용하는 서비스',
      '분산 컴퓨팅 기반의 데이터 위변조 방지 기술',
    ],
    answer: ['가상과 현실이 상호작용하는 3차원 가상 세계', '가상의 물리적 사물을 가상 세계 그대로 복제하는 기술', '분산 컴퓨팅 기반의 데이터 위변조 방지 기술', '인터넷을 통해 IT 자원을 대여하여 사용하는 서비스'],
    explanation: '각 용어의 정의를 정확히 이해하는 것이 중요합니다.',
    date: '2026-04-30',
  },
  {
    id: '4',
    type: 'short_answer',
    title: 'OOP 캡슐화',
    difficulty: '중급',
    topic: '언어/문법',
    question: '객체지향 프로그래밍(OOP)에서 데이터와 함수를 하나로 묶어 외부로부터의 직접적인 접근을 방지하는 기술은 무엇인가요?',
    answer: '캡슐화',
    explanation: '캡슐화(Encapsulation)는 OOP의 핵심 원칙 중 하나로, 데이터와 메서드를 클래스 내부에 숨기고 외부 접근을 제한합니다.',
    date: '2026-05-01',
  },
  {
    id: '5',
    type: 'multiple_choice',
    title: 'LRU 캐시 구현 오류 찾기',
    difficulty: '고급',
    topic: '알고리즘',
    question: '아래는 LRU(Least Recently Used) 캐시를 구현한 코드입니다. 정상 동작하지 않는 원인은 무엇인가요?',
    code: `class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.cache = new Map();
  }

  get(key) {
    if (!this.cache.has(key)) {
      return -1;
    }
    const value = this.cache.get(key);
    this.cache.delete(key);
    this.cache.set(key, value);
    return value;
  }

  put(key, value) {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.capacity) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
    this.cache.set(key, value);
  }
}

// 테스트
const lru = new LRUCache(2);
lru.put(1, 1);
lru.put(2, 2);
console.log(lru.get(1)); // 예상: 1
lru.put(3, 3);           // 용량 초과 → 2 삭제 예상
console.log(lru.get(2)); // 예상: -1 (삭제됨)
console.log(lru.get(3)); // 예상: 3`,
    options: [
      'Map은 삽입 순서를 보장하지 않아 가장 오래된 항목을 찾을 수 없다',
      '코드는 정상 동작하며 오류가 없다',
      'get() 호출 시 delete 후 set을 하지 않아 순서가 갱신되지 않는다',
      'capacity 비교 시 > 대신 >= 를 써야 한다',
    ],
    answer: '코드는 정상 동작하며 오류가 없다',
    explanation: 'JavaScript의 Map은 삽입 순서를 보장합니다. get()에서 delete→set으로 최근 사용 순서를 갱신하고, put()에서 keys().next().value로 가장 오래된 키를 꺼내 삭제합니다. 이 구현은 올바른 LRU 캐시입니다.',
    date: '2026-05-02',
  },
  {
    id: '6',
    type: 'fill_blank',
    title: '이진 탐색 구현',
    difficulty: '중급',
    topic: '알고리즘',
    question: '정렬된 배열에서 target 값을 찾는 이진 탐색 코드를 완성하세요.',
    code: `function binarySearch(arr, target) {
  let left = 0;
  let right = arr.___ - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);

    if (arr[mid] === target) {
      return mid;
    } else if (arr[mid] < target) {
      left = ___ + 1;
    } else {
      right = mid - ___;
    }
  }

  return -1;
}

const arr = [1, 3, 5, 7, 9, 11, 13];
console.log(binarySearch(arr, 7));  // 3
console.log(binarySearch(arr, 6));  // -1`,
    blanks: ['length', 'mid', '1'],
    answer: ['length', 'mid', '1'],
    explanation: '이진 탐색은 중간값과 target을 비교해 탐색 범위를 절반씩 줄입니다. 시간복잡도는 O(log n)입니다.',
    date: '2026-05-03',
  },
  // ── 프로그래머스 Lv.1 / 백준 실버 수준 ──────────────────────────────
  {
    id: '7',
    type: 'fill_blank',
    title: 'BFS 최단경로 (게임 맵)',
    difficulty: '고급',
    topic: '알고리즘',
    question: '다음 코드를 보고 [빈칸 A]에 들어갈 조건식을 채우세요.',
    code: `from collections import deque

def solution(maps):
    n, m = len(maps), len(maps[0])
    queue = deque()
    queue.append((0, 0, 1))

    visited = [[False]*m for _ in range(n)]
    visited[0][0] = True

    dx = [1, -1, 0, 0]
    dy = [0, 0, 1, -1]

    while queue:
        x, y, dist = queue.popleft()

        if x == n-1 and y == m-1:
            return dist

        for i in range(4):
            nx = x + dx[i]
            ny = y + dy[i]

            if ___:
                visited[nx][ny] = True
                queue.append((nx, ny, dist+1))

    return -1`,
    blanks: ['0 <= nx < n and 0 <= ny < m and not visited[nx][ny]'],
    answer: ['0 <= nx < n and 0 <= ny < m and not visited[nx][ny]'],
    explanation: '범위 체크(0 <= nx < n and 0 <= ny < m)와 방문 체크(not visited[nx][ny])를 모두 만족할 때만 큐에 추가합니다. visited로 재방문을 막아 최단거리를 보장합니다.',
    date: '2026-05-04',
  },
  {
    id: '8',
    type: 'fill_blank',
    title: '스택으로 괄호 검사 (백준 9012)',
    difficulty: '중급',
    topic: '자료구조',
    question: '괄호 문자열이 올바른지 스택으로 검사하는 코드를 완성하세요.',
    code: `def is_valid(s):
    stack = []
    for c in s:
        if c == '(':
            stack.___(c)      # 빈칸1: 스택에 추가
        elif c == ')':
            if not stack:
                return False
            stack.___()       # 빈칸2: 스택에서 제거
    return not ___            # 빈칸3: 스택이 비어야 정상

print(is_valid("((()))"))   # True
print(is_valid("(()"))      # False
print(is_valid(")("))       # False`,
    blanks: ['append', 'pop', 'stack'],
    answer: ['append', 'pop', 'stack'],
    explanation: '여는 괄호는 스택에 push, 닫는 괄호는 pop합니다. 닫을 때 스택이 비면 즉시 False. 마지막에 스택이 비어 있어야(not stack) 모든 괄호가 짝이 맞습니다.',
    date: '2026-05-05',
  },
  {
    id: '9',
    type: 'fill_blank',
    title: 'DP 계단 오르기 (백준 2579)',
    difficulty: '고급',
    topic: '알고리즘',
    question: '연속 3칸을 밟을 수 없을 때, 점수 합의 최댓값을 구하는 DP 코드를 완성하세요.',
    code: `def staircase(stairs):
    n = len(stairs)
    dp = [0] * (n + 1)
    dp[1] = stairs[0]
    dp[2] = stairs[0] + stairs[1]

    for i in range(3, n + 1):
        # 연속 3칸 금지: 두 칸 전에서 오거나, 세 칸 전+한 칸 건너서
        dp[i] = max(
            dp[i-___] + stairs[i-1],
            dp[i-___] + stairs[i-2] + stairs[i-1]
        )
    return dp[n]

# [10, 20, 15, 25, 10, 20] → 75
print(staircase([10, 20, 15, 25, 10, 20]))`,
    blanks: ['2', '3'],
    answer: ['2', '3'],
    explanation: 'dp[i-2]+stairs[i-1]: 바로 아래 계단은 건너뜀. dp[i-3]+stairs[i-2]+stairs[i-1]: 두 칸 연속 밟고 세 번째는 건너뜀. 두 경우 중 최댓값을 선택합니다.',
    date: '2026-05-06',
  },

  // ── 원데이 코딩 트레이닝 1세트: 5가지 유형 ──────────────────────────

  // 유형1: 개념접근 - 객관식
  {
    id: '10',
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
    explanation: 'BFS는 같은 레벨의 모든 노드를 큐에 저장하므로, 넓은 그래프에서는 DFS보다 메모리를 더 많이 사용할 수 있습니다. 나머지 3가지는 모두 BFS의 올바른 특징입니다.',
    date: '2026-05-07',
  },

  // 유형2: 오답찾기 - 코드에서 DFS/BFS 혼동 원인 찾기
  {
    id: '11',
    type: 'multiple_choice',
    title: 'BFS 코드 오류 찾기',
    difficulty: '중급',
    topic: '알고리즘',
    question: '아래 코드는 BFS처럼 보이지만 실제로는 DFS로 동작합니다. 원인을 고르세요.',
    code: `from collections import deque

def traversal(graph, start):
    visited = set([start])
    queue = deque([start])

    while queue:
        node = queue.pop()      # ← 주목
        print(node)

        for neighbor in graph[node]:
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append(neighbor)`,
    options: [
      'queue.pop()이 LIFO 방식으로 꺼내므로 DFS가 된다',
      'visited를 set으로 선언해 순서가 보장되지 않는다',
      'queue.append() 대신 queue.appendleft()를 써야 한다',
      '코드에 오류가 없다',
    ],
    answer: 'queue.pop()이 LIFO 방식으로 꺼내므로 DFS가 된다',
    explanation: 'deque.pop()은 오른쪽(뒤)에서 꺼내는 LIFO 방식이라 스택처럼 동작합니다. BFS는 반드시 popleft()로 앞에서 꺼내야 FIFO가 유지됩니다.',
    date: '2026-05-08',
  },

  // 유형3: 문제 해결 - 빈칸 채우기
  {
    id: '12',
    type: 'fill_blank',
    title: 'BFS 빈칸 채우기 (문제 해결)',
    difficulty: '중급',
    topic: '알고리즘',
    question: '다음 코드를 보고 빈칸을 채워 완성하세요.',
    code: `from collections import deque

def solution(maps):
    n = len(maps)
    m = len(maps[0])

    queue = deque([(0, 0)])
    visited = [[False]*m for _ in range(n)]
    visited[0][0] = True

    dx = [1, -1, 0, 0]
    dy = [0, 0, 1, -1]

    while queue:
        x, y = queue.popleft()

        for i in range(4):
            nx = x + dx[i]
            ny = y + dy[i]

            if ___:
                visited[nx][ny] = True
                queue.append((nx, ny))

    return -1`,
    blanks: ['0 <= nx < n and 0 <= ny < m and not visited[nx][ny] and maps[nx][ny] == 0'],
    answer: ['0 <= nx < n and 0 <= ny < m and not visited[nx][ny] and maps[nx][ny] == 0'],
    explanation: '범위 체크, 방문 체크, 벽 체크(maps[nx][ny] == 0)를 모두 만족할 때만 큐에 추가합니다.',
    date: '2026-05-09',
  },

  // 유형4: 디버깅
  {
    id: '13',
    type: 'short_answer',
    title: 'BFS 디버깅',
    difficulty: '중급',
    topic: '알고리즘',
    question: '다음 코드를 보고 틀린 부분을 찾고 이유를 적어주세요.',
    code: `from collections import deque

def solution(maps):
    n = len(maps)
    m = len(maps[0])

    queue = deque([(0, 0)])
    visited = [[False]*m for _ in range(n)]
    visited[0][0] = True

    dx = [1, -1, 0, 0]
    dy = [0, 0, 1, -1]

    while queue:
        x, y = queue.popleft()

        for i in range(4):
            nx = x + dx[i]
            ny = y + dy[i]

            if 0 <= nx < n and 0 <= ny < m:
                queue.append((nx, ny))

    return -1`,
    answer: '방문 체크 없음, 벽 체크 없음',
    explanation: '1. 방문 체크 없음 → 무한 반복 위험\n2. 벽 체크 없음 (maps[nx][ny] == 0 필요)',
    date: '2026-05-10',
  },

  // PCCE Lv.0
  {
    id: '15',
    type: 'fill_blank',
    title: 'PCCE Lv.0 - 변수와 출력',
    difficulty: '초급',
    topic: '언어/문법',
    question: '주어진 코드는 변수에 데이터를 저장하고 출력하는 코드입니다. 아래와 같이 출력되도록 빈칸을 채워 코드를 완성해 주세요.\n\n[출력 예시]\n3\n2\n1\nLet\'s go!',
    code: `import java.util.Scanner;

public class Solution {
    public static void main(String[] args) {
        String message = "___";

        System.out.println("3\\n2\\n1");
        System.out.println(message);
    }
}`,
    blanks: ["Let's go!"],
    answer: ["Let's go!"],
    explanation: 'message 변수에 "Let\'s go!"를 저장합니다. println("3\\n2\\n1")의 \\n은 줄바꿈 문자로 3, 2, 1을 각각 다른 줄에 출력합니다.',
    date: '2026-05-12',
  },

  // 유형5: 실전 구현형
  {
    id: '14',
    type: 'short_answer',
    title: 'BFS 실전 구현',
    difficulty: '고급',
    topic: '알고리즘',
    question: '다음 코드에서 목표지점까지의 최단거리를 구하는 코드를 완성하세요. (핵심 5~7줄)',
    code: `from collections import deque

def solution(maps):
    n = len(maps)
    m = len(maps[0])

    queue = deque([(0, 0, 1)])  # (x, y, distance)
    visited = [[False]*m for _ in range(n)]
    visited[0][0] = True

    dx = [1, -1, 0, 0]
    dy = [0, 0, 1, -1]

    while queue:
        x, y, dist = queue.popleft()

        # 여기에 작성 (핵심 5~7줄)


    return -1`,
    answer: 'if x == n-1 and y == m-1:\n    return dist',
    explanation: `if x == n-1 and y == m-1:
    return dist

for i in range(4):
    nx = x + dx[i]
    ny = y + dy[i]

    if 0 <= nx < n and 0 <= ny < m and not visited[nx][ny] and maps[nx][ny] == 0:
        visited[nx][ny] = True
        queue.append((nx, ny, dist+1))`,
    date: '2026-05-11',
  },
];

export const getTodayProblem = (): Problem => {
  const today = new Date().toISOString().split('T')[0];
  return mockProblems.find(p => p.date === today) ?? mockProblems[0];
};
