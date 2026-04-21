# Awakened Quest — 판타지 현실 퀘스트 앱

웹툰 「나 혼자만 레벨업」 스타일의 홀로그램 인터페이스로 **현실 퀘스트 → 골드 보상 → 가짜 환전** 루프를 경험하는 Expo + React Native 모바일 앱.

> ※ 환전은 시각적 시뮬레이션이며 실제 금융 거래가 아닙니다.

## 실행 방법

```bash
cd fantasy-quest-app
npm install
npx expo start
```

QR 코드를 모바일 **Expo Go** 앱으로 스캔하면 즉시 실행됩니다.

## 구조

```
App.tsx                         # 루트 네비게이터 (하단 탭)
src/
  theme/colors.ts               # 홀로그램 팔레트
  data/questTemplates.ts        # 카테고리/난이도/템플릿 뱅크
  utils/
    dateReset.ts                # 일일 리셋 날짜 키
    questGenerator.ts           # 퀘스트 자동 생성기
    storage.ts                  # AsyncStorage 래퍼
  store/gameStore.ts            # Zustand persist 전역 상태
  components/
    HolographicFrame.tsx        # 시안 코너 프레임
    SystemPopup.tsx             # "[알림]" 팝업
    QuestCard.tsx               # 난이도 뱃지 + 완료 버튼
    StatusWindow.tsx            # 상태창
    GoldCounter.tsx             # 골드 배지
    BankTransferModal.tsx       # 가짜 은행 송금 애니메이션
  screens/
    QuestsScreen.tsx            # 일일 퀘스트
    StatusScreen.tsx            # 상태창 + 활동 기록
    ExchangeScreen.tsx          # 환전소
    SettingsScreen.tsx          # 설정/리셋/디버그
```

## 핵심 기능

- **매일 자동 생성**: 앱 실행 시 마지막 생성일이 오늘이 아니면 E~A 난이도 6개의 새 일일 퀘스트 생성. 미완료 퀘스트는 `[만료]`로 기록에 아카이브.
- **보상 체계**: 난이도별 골드 + 경험치. 경험치가 `80 + 40×Lv` 쌓이면 레벨업, 스탯 포인트 5 지급.
- **환전소**: 보유 골드 → 원화 환산(1G = 1원). [송금] 탭 시 3단계 연출 (스피너 → 진행바 → 영수증).
- **누적 통계**: 여지껏 받은 골드, 환전한 골드, 받은 총 금액, 완료/만료 퀘스트 수, 환전 횟수
- **상태창**: 이름/칭호/레벨/경험치 바/5대 스탯(근/민/체/지/감) + 활동 기록 20건.
- **설정**: 퀘스트 강제 재생성, 디버그(어제로 설정), 전체 초기화.

## 테마 팔레트

| 역할 | 색상 |
|-----|-----|
| 배경 | `#05070f` (딥 네이비) |
| 패널 | `#0a1224` |
| 시안 | `#4fd0ff` |
| 시안 글로우 | `#7ee7ff` |
| 골드 | `#ffd666` |
| 경고 | `#ff5470` |

## 검증

```bash
npm run typecheck   # tsc --noEmit
npx expo start      # Metro + Expo Go
```

1. 첫 실행 시 `[알림]` 팝업 → 새 퀘스트 6개 확인
2. [완료] 탭 → 골드 누적, 레벨업 시 팝업
3. 환전소에서 금액 입력 후 [송금] → 애니메이션 + 영수증
4. 설정에서 "디버그: 어제로 설정" 후 재진입 → 새 퀘스트 생성 확인
