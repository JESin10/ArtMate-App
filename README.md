# ArtMate(APP)

<img width="100%" alt="Top-Bar" src="https://github.com/JESin10/ArtMate/assets/119720123/cbeac7bc-7d28-4814-a172-a0091b069357">

~ 26.03.29 / 총 37일 Commit
리팩토링 : 4/15, 20, 21, 22, 25, 26 (총 6일 진행)

(구현 시 최소 1일 1commit 하였기에 총 commit 일수로 표시하였습니다.)

## 🚀 Getting Started

```
bash
git clone https://github.com/JESin10/ArtMate-App.git
cd ArtMate-App
npm install
npm start
```

Notion URL
[artmate-Notion](https://jin29.notion.site/ArtMate-7a7b69e3c1da4f4bbf64cda1999a9ab0?source=copy_link)

## 📌 서비스 소개

현재 한국문화정보원에서 제공 중인 전시에 대한 정보를 확인하고, 관련 미술관 및 박물관에 대한 정보를 확인할 수 있는 정보제공 사이트이며, 개인 학습 용도로 제작된 사이트입니다.

전시중인 작품에 대한 설명을 일괄적으로 확인하고, 전시장소에 대한 위치를 현재 위치를 기반으로 지도를 통해 확인 할 수 있습니다.

감상했던 전시에 대한 리뷰 및 평점을 남겨 평점별 전시 검색과 같은 특정 검색이 가능합니다.

유저간의 팔로우, 좋아요, 댓글과 같은 상호작용이 가능하며, 팔로잉과 좋아요의 경우 상호 작용을 위해 알림을 전달하고 있습니다.

단순히 문화예술 정보 제공 서비스가 아닌 사용자간의 콘텐츠 생성, 상호작용이 가능한 구조로 개발하고자 하였습니다.


## 📌 서비스 아키텍쳐

- Service Layer : Firebase 및 API 호출을 service로 분리해 제어하고, 재사용성과 테스트 가능성 확보

- Custom Hooks  : 데이터 흐름에따라 자주 사용되는 함수를 hook으로 분리해 컴포넌트 단순화

- Zustand Store : 단순히 state에서 그치지않고, 전역 상태를 사용해 보다 간결하게 관리하고 props drilling 방지
  
  
## 📌 기술 스택

FrontEnd: React Native (Expo)

Backend / DB : Firebase Firestore, Firebase Authentication

Data : 공공 문화예술 API 활용 (XML 파싱)


## 📌 서비스 예시

<details><summary> 🎨 WireFrame </summary>

<img width="55%" alt="Initial_wireframe" src="https://github.com/user-attachments/assets/9489e92e-26f7-4b26-9680-81b0f4fc5b7a">

[Link to Figma](https://www.figma.com/design/0iw4lYmsIkfaZHq0X9uad2/artmate?node-id=0-1&t=JupJ97lyvlU1kN9X-1)

</details>

Mobile View

<details> <summary>HOME</summary> 
<img width="15%" alt="home1" src="https://github.com/user-attachments/assets/e69173fd-24d3-4b63-8271-2b8a77c76f22" />
<img width="15%" alt="home2" src="https://github.com/user-attachments/assets/b3efb6d2-c8e1-4688-b356-e12dad50e44b" />
<img width="15%" alt="home3" src="https://github.com/user-attachments/assets/e6d8876c-f87d-4b5b-b8e1-2c74debd7d07" />
</details>

<details>
<summary> MAP </summary>
<img width="15%" alt="map1" src="https://github.com/user-attachments/assets/b8fec565-937e-449f-9303-c7900768535a" />
<img width="15%" alt="map2" src="https://github.com/user-attachments/assets/ad8a87e1-5072-489d-a499-330abcd91a27" />
<img width="15%" alt="map3" src="https://github.com/user-attachments/assets/579150eb-4b77-470d-82d7-028c6e8f2c4b" />
<img width="15%" alt="map4" src="https://github.com/user-attachments/assets/4523451b-7e01-4967-b923-7f35b2ab9a5a" />
<img width="15" alt="map5" src="https://github.com/user-attachments/assets/7224fc9c-88f6-4b87-a051-9dedc145c1d2" />
</details>

<details><summary> ART </summary>
<img width="15%" alt="art1" src="https://github.com/user-attachments/assets/4d2e413f-47bd-4dbd-99ba-7cfa7004af33" />
<img width="15%" alt="art2" src="https://github.com/user-attachments/assets/94d5f3be-bdbc-43e9-9290-f6a8e332d2ea" />
<img width="15%" alt="art3" src="https://github.com/user-attachments/assets/e8be58c3-b7fd-4b23-aa60-9c697d9073e3" />
</details>

<details>
<summary> ETC </summary>
<img width="15%" alt="etc1"  src="https://github.com/user-attachments/assets/edca79e9-4373-4a56-9fb3-e7fbeb966037" />
<img width="15%" alt="etc2" src="https://github.com/user-attachments/assets/63753c9a-8529-49fe-bbc1-054acba03538" />
<img width="15%" alt="etc3" src="https://github.com/user-attachments/assets/0158e51c-8d31-4378-8258-0ff5af890751" />
<img width="15%" alt="etc4"  src="https://github.com/user-attachments/assets/4d40125e-1b3c-4ecd-98fb-b4a88715f2ac" />
<img width="15%" alt="etc5"  src="https://github.com/user-attachments/assets/93393980-3363-45cc-b145-ae42f9a7c270" />
<img width="15%" alt="etc6" src="https://github.com/user-attachments/assets/351a629c-5d22-4060-ba25-0d6af3e9de21" />
<img width="15%" alt="etc7" src="https://github.com/user-attachments/assets/9eb55217-1194-47ca-8053-ca883089c556" />
<img width="15%" alt="etc8"  src="https://github.com/user-attachments/assets/5819e0a5-cb22-4f3f-8a49-a80abb0470ee" />
</details>

## 📌 서비스 구현 상세

✅ Firebase

사용자 인증이나 Database 사용에 있어 구글의 Firebase 플랫폼을 사용해 BackEnd를 적용하였습니다.

기존 웹 프로젝트에선 Auth와 Database의 기본적인 부분만 사용하였지만 collection간의 연결도를 생각해보다 정교하게 Database를 구성하였습니다.

또한, add, set, update, delete와 같은 기본적인 기능만 썼던 기존의 웹앱과 달리 모바일앱에서는 where, orderBy와 같은 frontend단 정렬을 사용하였고, 실시간 데이터 동기화를 위해 Firestore onSnapshot 사용해 Database를 활용하였습니다.

사용자의 정보, 리뷰와 같이 수정가능한 정보들을 Firestore에 저장하였고 리뷰 혹은 프로필에 사용될 이미지들을 Storage에 따로 저장한 후 링크를 불러오는 방식을 사용하였습니다.


✅ 모바일 앱

초기 디자인에 맞게 모바일 앱으로 구현하였고 접근성이 보다 용이한 Expo를 이용하였습니다.

최종적으로 React Native + Expo를 기반으로 iOS/Android 크로스 플랫폼 앱으로 구현하였습니다.

현재는 JS로 기본 개발 되어있으나 data type으로 발생할 수 있는 에러를 줄이고, 경험을 위해 typescript로 마이그레이션 할 예정입니다.


✅ 공공 API 활용

개발 밑 테스트 단계에서는 프로젝트에 필요한 정보를 서울시 공공 API를 사용하였고, 거리나 필터의 경우 frontend 단에서 처리를 해 보여주고 있습니다.

XML 데이터를 파싱하여 앱에서 사용 가능한 형태로 가공하였다는 점에 의의가 있으나, 공공 API를 사용하는 관계로 속도와 용량에 제한이 있다는 한계가 있습니다.


✅ Custom Style

초기에는 스타일의 확장성 및 커스터마이징을 위해 React Native 기본 컴포넌트와 StyleSheet를 사용하였습니다.

ts 마이그레이션을 진행하며 uiux의 쉬운 관리를 위해 tailwind와 styled-component를 함께 결합한 tailwind-styled-component를 사용할 에정입니다.


✅ Custom Hook

개인프로젝트인 만큼 러프한 초기 구성에서 자주 사용되는 function을 파악하고, custom hook으로 만들어 어느 컴포넌트에서나 public하게 접근 및 사용이 용이하도록 하였습니다.

Hook뿐 아니라 filter, modal, slider와 같은 각자의 기능을 따로하는 컴포넌트들을 분리해 구성하고자 하였습니다.



## ⚠️ Troubleshooting

### Firestore 실시간 데이터 중복 렌더링 문제
- 원인: onSnapshot 중복 구독
- 해결: useEffect cleanup 함수에서 unsubscribe 처리

### XML 파싱 데이터 구조 불일치
- 원인: API 응답 구조의 일관성 부족
- 해결: 데이터 가공 로직 추가 및 예외 처리


## 📌 향후 서비스 개선 예정
[완료] Firestore 로직을 Service Layer로 분리

[완료] 상태 관리 도입 (Zustand)

[완료] 컴포넌트 구조 리팩토링

[ ] TypeScript 적용

[ ] UI/UX 개선

[ ] 테스트 코드 작성 (Jest / React Native Testing Library)
