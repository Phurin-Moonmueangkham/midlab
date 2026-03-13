import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import {
  addDoc,
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  where
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

const statusEl = document.getElementById("firebase-status");
const activityEl = document.getElementById("activityList");
const studentIdEl = document.getElementById("studentId");
const checkinForm = document.getElementById("checkinForm");
const checkoutForm = document.getElementById("checkoutForm");
const qrModal = document.getElementById("qrModal");
const closeQrModalBtn = document.getElementById("closeQrModal");
const scanButtons = document.querySelectorAll(".scan-btn");

let db;
let qrScanner;
let scanning = false;

function setStatus(text, ok = false) {
  statusEl.textContent = text;
  statusEl.classList.toggle("ok", ok);
}

function getStudentId() {
  const studentId = studentIdEl.value.trim();
  if (!studentId) {
    throw new Error("Please enter Student ID first.");
  }
  return studentId;
}

function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported on this browser."));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => resolve(position.coords),
      () => reject(new Error("Cannot access location. Please allow GPS permission.")),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  });
}

async function refreshActivity() {
  if (!db) {
    return;
  }

  const q = query(collection(db, "activity"), orderBy("created_at", "desc"), limit(8));
  const snap = await getDocs(q);

  activityEl.innerHTML = "";
  if (snap.empty) {
    const li = document.createElement("li");
    li.textContent = "No activity yet.";
    activityEl.append(li);
    return;
  }

  snap.forEach((docSnap) => {
    const data = docSnap.data();
    const li = document.createElement("li");
    li.textContent = `${data.type.toUpperCase()} | ${data.student_id} | ${data.session_id}`;
    activityEl.append(li);
  });
}

async function initFirebase() {
  try {
    if (firebaseConfig.apiKey.startsWith("REPLACE_")) {
      setStatus("Firebase config incomplete: update apiKey/messagingSenderId/appId.");
      return;
    }

    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);

    setStatus("Firebase connected.", true);
    await refreshActivity();
  } catch (error) {
    setStatus(`Firebase error: ${error.message}`);
  }
}

async function stopScan() {
  if (!qrScanner || !scanning) {
    qrModal.hidden = true;
    return;
  }

  try {
    await qrScanner.stop();
    await qrScanner.clear();
  } catch {
    // Ignore scanner shutdown errors from stale camera states.
  } finally {
    scanning = false;
    qrModal.hidden = true;
  }
}

async function startScan(targetInputId) {
  const inputEl = document.getElementById(targetInputId);
  if (!inputEl) {
    return;
  }

  if (!window.Html5Qrcode) {
    const fallback = prompt("QR scanner not available. Please paste Session ID:");
    if (fallback) {
      inputEl.value = fallback.trim();
    }
    return;
  }

  qrModal.hidden = false;

  if (!qrScanner) {
    qrScanner = new window.Html5Qrcode("qr-reader");
  }

  const onSuccess = async (decodedText) => {
    inputEl.value = decodedText.trim();
    await stopScan();
  };

  try {
    await qrScanner.start(
      { facingMode: "environment" },
      { fps: 10, qrbox: { width: 220, height: 220 } },
      onSuccess,
      () => {}
    );
    scanning = true;
  } catch {
    qrModal.hidden = true;
    const fallback = prompt("Cannot open camera. Please paste Session ID:");
    if (fallback) {
      inputEl.value = fallback.trim();
    }
  }
}

scanButtons.forEach((button) => {
  button.addEventListener("click", async () => {
    await startScan(button.dataset.target);
  });
});

closeQrModalBtn.addEventListener("click", async () => {
  await stopScan();
});

qrModal.addEventListener("click", async (event) => {
  if (event.target === qrModal) {
    await stopScan();
  }
});

checkinForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!db) {
    alert("Firebase is not connected.");
    return;
  }

  try {
    const studentId = getStudentId();
    const coords = await getCurrentPosition();

    const payload = {
      student_id: studentId,
      session_id: document.getElementById("checkinSessionId").value.trim(),
      checkin_time: new Date().toISOString(),
      checkin_lat: coords.latitude,
      checkin_lng: coords.longitude,
      prev_topic: document.getElementById("prevTopic").value.trim(),
      expected_topic: document.getElementById("expectedTopic").value.trim(),
      mood_before: Number(document.getElementById("moodBefore").value),
      created_at: serverTimestamp()
    };

    await addDoc(collection(db, "checkins"), payload);
    await addDoc(collection(db, "activity"), {
      type: "checkin",
      student_id: payload.student_id,
      session_id: payload.session_id,
      created_at: serverTimestamp()
    });

    checkinForm.reset();
    alert("Check-in saved.");
    await refreshActivity();
  } catch (error) {
    alert(error.message);
  }
});

checkoutForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!db) {
    alert("Firebase is not connected.");
    return;
  }

  try {
    const studentId = getStudentId();
    const sessionId = document.getElementById("checkoutSessionId").value.trim();

    const checkinQuery = query(
      collection(db, "checkins"),
      where("student_id", "==", studentId),
      limit(30)
    );
    const checkinSnap = await getDocs(checkinQuery);
    const hasMatch = checkinSnap.docs.some((docSnap) => docSnap.data().session_id === sessionId);
    if (!hasMatch) {
      throw new Error("No matching check-in found for this student and session.");
    }

    const coords = await getCurrentPosition();

    const payload = {
      student_id: studentId,
      session_id: sessionId,
      checkout_time: new Date().toISOString(),
      checkout_lat: coords.latitude,
      checkout_lng: coords.longitude,
      learned_today: document.getElementById("learnedToday").value.trim(),
      class_feedback: document.getElementById("classFeedback").value.trim(),
      created_at: serverTimestamp()
    };

    await addDoc(collection(db, "checkouts"), payload);
    await addDoc(collection(db, "activity"), {
      type: "checkout",
      student_id: payload.student_id,
      session_id: payload.session_id,
      created_at: serverTimestamp()
    });

    checkoutForm.reset();
    alert("Class completion saved.");
    await refreshActivity();
  } catch (error) {
    alert(error.message);
  }
});

initFirebase();
