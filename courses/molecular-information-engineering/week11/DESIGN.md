# 11주차 강의 HTML

기준 화면은 사용자가 제공한 `MIT/lecture11-1.html`의 BLUE 슬라이드이다. 기존 목차, 발표 모드, 읽기 모드, 키보드 이동, 단계별 SVG를 재사용한다.

## 색과 글자

기존 CSS 변수 `--navy`, `--teal`, `--amber`, `--ink`, `--gray`, `--border`, `--white`, `--tealwash`, `--crim`, `--green`을 사용한다. 제목은 기존 `h2`, 설명은 `.sub`, 본문은 `.pts`, 비교는 `.tbl`, 출처는 `.src`를 따른다. 생화학 도식의 색은 분자·반응의 의미를 구별하며 범례를 제공한다.

## 배치

Layout: 강의 슬라이드 - 목차와 조작기를 유지하며 본문 탐색 -> scroll-body-shell (https://github.com/changeroa/StyleGallery/blob/main/patterns/viewport-shell/scroll-body-shell.md); scroll owner: 발표 모드 `.slide .body`, 읽기 모드 `.stage`; anti-patterns: 중첩 스크롤 강제, 휴대전화에서 두 열 고정, 그림 자르기.

## 구성 요소

1. `.slide`: 제목, 그림·본문, 출처, 페이지 번호.
2. `.cols`: 큰 화면의 두 열, 읽기 모드 좁은 화면의 한 열.
3. `.source-figure`: 실제 교재·논문 그림, `object-fit:contain`, 캡션과 출처 링크.
4. `.portraits`: 사진·이름·공헌·저작권을 함께 표시하는 인물 목록.
5. `.proc`: 버튼 또는 그림 클릭으로 반응 단계 전환. 모식도임을 표시한다.
6. 영상: 누르기 전에는 썸네일과 관찰 질문만 표시. 재생 시에만 개인정보 보호 YouTube iframe을 생성한다. 원본 링크는 항상 제공한다.

## 강의별 요구사항

주요 동작은 다음 슬라이드로 이동이다. 정보 우선순위는 원리와 그림, 근거·비교, 출처 순이다. 장식용 숫자나 이미지는 추가하지 않는다.

11-1: 인물 7명, PCR·중합효소·염기쌍·뉴클레오타이드·생어 교재 그림, 역사적 원논문, 정확한 당 번호·인산 반응·방향성, 기존 실습.

11-2: HGP와 Celera, 품질값과 조립, GigAssembler, 인류사와 고대 DNA, 파이로시퀀싱, 454·Illumina·SOLiD·Ion Torrent·Helicos·Complete Genomics, 판독 길이와 오류 비교, 공식 영상과 자체 단계별 도식, NHGRI 비용 곡선, 긴 판독 연결.

11-2 심화: 60분. Cambridge의 연구·가역 종결 화학·개별 특허, 비드/표면/패턴 배열의 구분, 현행 MiSeq i100·NextSeq 1000/2000·NovaSeq X의 실물과 공식 작동 영상, MGI·Element의 RCA와 각 판독 화학, Singular·Ultima·역사적 Onso 비교, 실제 Google Maps의 Illumina·UCSD·Salk와 공식 캠퍼스 영상.

실험 원리 문서는 여섯 플랫폼별 준비·증폭·화학·검출·오류를 읽기 페이지로 제공한다. 영상은 공식 채널 우선이며 역사적 재게시와 WIRED 자료는 업로더를 구분한다. NAS에서 확보한 SBS 원본은 실제 디코딩해 대조하고 영상 파일을 재게시하지 않는다.

11-6은 FastQC·Phred 통계·RPKM/FPKM/TPM·분석 목적별 선택을 8장으로 보강한다. AI_NGS 폴더는 읽기 전용 참고이며 내부 연구 데이터는 게시하지 않는다. 11-3~5는 핵심 구성을 유지하고 CCS/RCA, 2019 ONT 책과 현행 Dorado, 전기 측정에서 디코딩으로의 연결을 각각 1장 보강한다. 권장 수업 순서는 강의 번호와 별도로 표시한다.

## 그림의 검증

교재 원본은 Lehninger 7판(2017) EPUB에서 추출하며 그림 번호와 인쇄 쪽수를 함께 기록한다. 자체 DNA 그림의 상보성·역평행성과 dNTP의 1′–5′·3′-OH·α 인산 위치를 대조한다. 교재·대학·논문의 그림을 퍼블릭 도메인으로 간주하지 않는다. 외부 영상과 역사적 장비 수치는 출처의 시대를 명시한다.
