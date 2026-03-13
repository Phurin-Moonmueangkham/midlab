import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import {
  collection,
  getDocs,
  limit,
  query,
  where
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

const statusEl = document.getElementById("firebase-status");
const historyForm = document.getElementById("historyForm");
const studentIdEl = document.getElementById("studentId");
const checkinHistoryEl = document.getElementById("checkinHistory");
const checkoutHistoryEl = document.getElementById("checkoutHistory");

let db;

function setStatus(text, ok = false) {
  statusEl.textContent = text;
  statusEl.classList.toggle("ok", ok);
}

function recordToCard(record, fields) {
  const card = document.createElement("article");
  card.className = "history-item";

  const title = document.createElement("h3");
  title.textContent = `Session: ${record.session_id}`;
  card.append(title);

  fields.forEach((field) => {
    const row = document.createElement("p");
    const value = field.formatter ? field.formatter(record) : record[field.key] ?? "-";
    row.innerHTML = `<strong>${field.label}:</strong> ${value}`;
    card.append(row);
  });

  return card;
}

function clearHistory() {
  checkinHistoryEl.innerHTML = "";
  checkoutHistoryEl.innerHTML = "";
}

function showEmpty(targetEl, message) {
  const p = document.createElement("p");
  p.className = "history-empty";
  p.textContent = message;
  targetEl.append(p);
}

async function loadHistory() {
  const studentId = studentIdEl.value.trim();
  if (!studentId) {
    alert("Please enter Student ID.");
    return;
  }
  if (!db) {
    alert("Firebase is not connected.");
    return;
  }

  clearHistory();

  const checkinQ = query(
    collection(db, "checkins"),
    where("student_id", "==", studentId),
    limit(20)
  );

  const checkoutQ = query(
    collection(db, "checkouts"),
    where("student_id", "==", studentId),
    limit(20)
  );

  const [checkinSnap, checkoutSnap] = await Promise.all([getDocs(checkinQ), getDocs(checkoutQ)]);
  const sortedCheckins = checkinSnap.docs
    .map((docSnap) => docSnap.data())
    .sort((a, b) => String(b.checkin_time ?? "").localeCompare(String(a.checkin_time ?? "")));
  const sortedCheckouts = checkoutSnap.docs
    .map((docSnap) => docSnap.data())
    .sort((a, b) => String(b.checkout_time ?? "").localeCompare(String(a.checkout_time ?? "")));

  if (sortedCheckins.length === 0) {
    showEmpty(checkinHistoryEl, "No check-ins found.");
  } else {
    sortedCheckins.forEach((record) => {
      checkinHistoryEl.append(
        recordToCard(record, [
          { label: "Check-in time", key: "checkin_time" },
          {
            label: "Location",
            formatter: (item) => `${item.checkin_lat ?? "-"}, ${item.checkin_lng ?? "-"}`
          },
          { label: "Expected topic", key: "expected_topic" },
          { label: "Mood", key: "mood_before" }
        ])
      );
    });
  }

  if (sortedCheckouts.length === 0) {
    showEmpty(checkoutHistoryEl, "No check-outs found.");
  } else {
    sortedCheckouts.forEach((record) => {
      checkoutHistoryEl.append(
        recordToCard(record, [
          { label: "Check-out time", key: "checkout_time" },
          {
            label: "Location",
            formatter: (item) => `${item.checkout_lat ?? "-"}, ${item.checkout_lng ?? "-"}`
          },
          { label: "Learned today", key: "learned_today" },
          { label: "Feedback", key: "class_feedback" }
        ])
      );
    });
  }
}

historyForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    await loadHistory();
  } catch (error) {
    alert(error.message);
  }
});

async function initFirebase() {
  try {
    if (firebaseConfig.apiKey.startsWith("REPLACE_")) {
      setStatus("Firebase config incomplete: update apiKey/messagingSenderId/appId.");
      return;
    }

    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    setStatus("Firebase connected.", true);
  } catch (error) {
    setStatus(`Firebase error: ${error.message}`);
  }
}

initFirebase();
