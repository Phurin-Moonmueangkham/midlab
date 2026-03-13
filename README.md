# Smart Class Check-in Web (midturm-6adfd)

เว็บ MVP สำหรับเช็กอิน/เช็กเอาต์เข้าเรียน พร้อม reflection ก่อนและหลังเรียน
และบันทึกข้อมูลลง Firebase Firestore

## Features

- Check-in ก่อนเรียน + GPS + timestamp
- Finish Class หลังเรียน + GPS + timestamp
- สแกน QR ด้วยกล้อง (ถ้าเปิดกล้องไม่ได้จะ fallback ให้กรอกเอง)
- หน้า History แยกสำหรับดูประวัติ check-in/check-out ตาม Student ID
- บันทึกข้อมูล Firestore collections: `checkins`, `checkouts`, `activity`

## Files

- `index.html` UI หน้าเว็บ
- `styles.css` สไตล์
- `app.js` logic เชื่อม Firebase + บันทึกข้อมูล
- `firebase-config.js` ตั้งค่า Firebase Web App
- `history.html` หน้าแสดงประวัติ
- `history.js` logic ดึงประวัติจาก Firestore
- `firebase.json` config สำหรับ Firebase Hosting
- `.firebaserc` ผูก default project = `midturm-6adfd`

## Firebase Setup

1. ไปที่ Firebase Console ของโปรเจกต์ `midturm-6adfd`
2. สร้าง Web App (ถ้ายังไม่มี)
3. คัดลอก config แล้วใส่ค่าใน `firebase-config.js`

ตัวอย่างค่าที่ต้องใส่:

```js
export const firebaseConfig = {
	apiKey: "YOUR_API_KEY",
	authDomain: "midturm-6adfd.firebaseapp.com",
	projectId: "midturm-6adfd",
	storageBucket: "midturm-6adfd.firebasestorage.app",
	messagingSenderId: "YOUR_SENDER_ID",
	appId: "YOUR_APP_ID"
};
```

## Firestore Rules (MVP only)

ใช้กฎแบบเปิดชั่วคราวตอนเดโม่เท่านั้น:

```txt
rules_version = '2';
service cloud.firestore {
	match /databases/{database}/documents {
		match /{document=**} {
			allow read, write: if true;
		}
	}
}
```

ไฟล์ rules นี้อยู่ในโปรเจกต์ที่ `firestore.rules`

## Run Locally

เปิดใน local server (ห้ามเปิดไฟล์ตรง ๆ แบบ `file://`)

```bash
cd /workspaces/midlab
python3 -m http.server 5500
```

แล้วเปิดเบราว์เซอร์ที่ `http://localhost:5500`

## Deploy to Firebase Hosting

1. ติดตั้ง Firebase CLI (ถ้ายังไม่มี)

```bash
npm install -g firebase-tools
```

2. ล็อกอิน

```bash
firebase login
```

3. deploy hosting ไปโปรเจกต์ `midturm-6adfd`

```bash
cd /workspaces/midlab
firebase deploy --only hosting
```

4. (ทางเลือก) deploy Firestore rules

```bash
firebase deploy --only firestore:rules
```

## Stored Collections

- `checkins`
- `checkouts`
- `activity`