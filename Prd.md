Product Requirements Document (PRD)
Smart Class Check-in & Learning Reflection App
Problem Statement
Universities struggle to verify that students are physically present in class and actively engaged with the material. Manual attendance methods are slow, easy to fake, and provide no insight into student learning or emotional state. This app automates attendance verification using GPS and QR codes, while also capturing lightweight learning reflections to support both students and instructors.

Target Users
Primary: University students checking into class sessions
Secondary: Instructors (indirect beneficiaries via collected attendance and reflection data)
Feature List
Check-in (Before Class)

One-tap check-in button
Automatic GPS location capture with timestamp
QR code scan to verify classroom identity
Pre-class reflection form:
Topic covered in previous class (text)
Expected topic today (text)
Mood before class (1–5 scale)
Class Completion (After Class)

Finish Class button
QR code scan (second verification)
Automatic GPS capture with timestamp
Post-class reflection form:
What was learned today (short text)
Feedback on class or instructor (text)
Data Storage

Local persistence via SQLite (MVP)
Firebase Firestore for cloud sync and deployment demo
Deployment

Flutter Web build hosted on Firebase Hosting
User Flow


App Launch
    │
    ▼
Home Screen
    │
    ├──► [Check-in Button]
    │         │
    │         ▼
    │    GPS captured + Timestamp
    │         │
    │         ▼
    │    Scan QR Code (classroom)
    │         │
    │         ▼
    │    Pre-class Reflection Form
    │    (prev topic / today's topic / mood)
    │         │
    │         ▼
    │    Data saved → Confirmation
    │
    └──► [Finish Class Button]
              │
              ▼
         Scan QR Code again
              │
              ▼
         GPS captured + Timestamp
              │
              ▼
         Post-class Reflection Form
         (learned today / feedback)
              │
              ▼
         Data saved → Confirmation
Data Fields
Check-in Record
Field	Type	Description
student_id	String	Unique student identifier
session_id	String	Decoded from QR code
checkin_time	DateTime	Auto-captured timestamp
checkin_lat	Double	GPS latitude
checkin_lng	Double	GPS longitude
prev_topic	String	Topic from previous class
expected_topic	String	Expected topic today
mood_before	Int (1–5)	Pre-class mood score
Check-out Record
Field	Type	Description
student_id	String	Unique student identifier
session_id	String	Decoded from QR code (must match check-in)
checkout_time	DateTime	Auto-captured timestamp
checkout_lat	Double	GPS latitude
checkout_lng	Double	GPS longitude
learned_today	String	Post-class reflection
class_feedback	String	Feedback on class/instructor
Tech Stack
Layer	Technology
Frontend	Flutter (Dart)
Local Storage	SQLite via sqflite package
QR Scanning	mobile_scanner package
GPS	geolocator package
Cloud / Hosting	Firebase Firestore + Firebase Hosting
Deployment Target	Flutter Web
Out of Scope (MVP)
Instructor dashboard
Real-time location boundary enforcement (geofencing)
Push notifications
Authentication / login system (student ID entered manually for MVP)
