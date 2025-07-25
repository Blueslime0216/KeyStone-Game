# 에테르가르드 (Aethelgard)

공명의 힘을 다루는 전략 보드게임

## 게임 소개

에테르가르드는 두 명의 플레이어가 판 위에 돌을 놓아 고대의 힘인 '공명(Resonance)'을 일으키고, 그 힘의 결정체인 '요석(Keystone)'을 연결하여 승리하는 전략 보드게임입니다.

## 게임 규칙

### 목표
- 자신의 **요석 5개**를 가로, 세로, 또는 대각선 중 한 방향으로 **정확히** 일렬로 연결하면 승리
- **장목(6개 이상)은 무효**

### 게임 구성물
- 17x17 크기의 게임 판
- 흑돌 (선공): 전도석 `○`, 요석 `□`
- 백돌 (후공): 전도석 `●`, 요석 `■`

### 핵심 메커니즘

#### 1. 전도석 배치
- 각 턴에 빈 칸에 전도석을 하나씩 배치

#### 2. ㄱ자 형태 변환
- 전도석 3개가 ㄱ 또는 ㄴ 모양을 이루면
- 다음 턴에 그 중 하나를 요석으로 변환 가능

#### 3. 코어와 공명
- 전도석 4개가 2x2 정사각형(코어)을 완성하면 공명 활성화
- 초점 요석을 선택하여 4방향으로 공명 파동 전파
- 경로상의 자신의 전도석을 요석으로 변환

## 조작법

- **클릭**: 돌 배치
- **Ctrl+Z**: 되돌리기
- **Ctrl+Shift+Z**: 다시 실행
- **기보 ON/OFF**: 좌측 패널에서 기보 표시 토글

## 기보 시스템

기보가 ON일 때 돌 위에 숫자가 표시됩니다:

- **일반 배치**: 숫자만 (예: 17)
- **초점 요석**: + 기호 (예: 17+)
- **요석 변환**: • 기호 (예: 17•)
- **공명 변환**: 화살표 (예: 17→)

## 기술 스택

- **Frontend**: React 18 + TypeScript
- **애니메이션**: Framer Motion
- **스타일링**: Tailwind CSS
- **상태 관리**: Zustand

## 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm start

# 빌드
npm run build
```

## 프로젝트 구조

```
src/
├── components/
│   ├── GameBoard/          # 게임 보드 관련 컴포넌트
│   ├── UI/                 # UI 컴포넌트
│   └── Animations/         # 애니메이션 컴포넌트
├── hooks/                  # 커스텀 훅
├── stores/                 # 상태 관리
├── utils/                  # 유틸리티 함수
└── types/                  # 타입 정의
```

## 개발 상태

- ✅ 기본 게임 로직
- ✅ 돌 배치 및 이동
- ✅ ㄱ자 형태 감지 및 변환
- ✅ 코어 감지 및 공명 활성화
- ✅ 승리 조건 확인
- ✅ 기보 시스템
- ✅ 되돌리기 시스템
- ✅ 애니메이션 효과
- ✅ 다크모드 UI

## 라이선스

MIT License 