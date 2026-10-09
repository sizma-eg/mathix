import { auth, db, authReady } from "./firebase-config.js";
import { requireAdmin } from "./auth.js";
import { signOut } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  onSnapshot,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  runTransaction,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

export {
  auth, db, authReady, collection, doc, getDoc, getDocs, query,
  where, onSnapshot, setDoc, addDoc, updateDoc, deleteDoc,
  runTransaction, serverTimestamp
};

export function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

export function money(value) {
  const amount = Number(value ?? 0);
  return Number.isFinite(amount)
    ? `${amount.toLocaleString("en-US")} ج.م`
    : "—";
}

export function dateLabel(value) {
  if (!value) return "—";
  try {
    const date = typeof value.toDate === "function"
      ? value.toDate()
      : new Date(value);

    return Number.isNaN(date.getTime())
      ? "—"
      : date.toLocaleString("ar-EG");
  } catch {
    return "—";
  }
}

export function toast(message, type = "success") {
  const notice = document.getElementById("notice");
  if (!notice) {
    alert(message);
    return;
  }

  notice.textContent = message;
  notice.className = `notice show ${type}`;

  clearTimeout(window.__noticeTimer);
  window.__noticeTimer = setTimeout(() => {
    notice.className = "notice";
  }, 4500);
}

export function showError(error, prefix = "حصل خطأ") {
  console.error(prefix, error);

  const message = error?.code === "permission-denied"
    ? "الصلاحيات الحالية في Firestore لا تسمح بالعملية."
    : error?.message || "حدث خطأ غير معروف.";

  toast(`${prefix}: ${message}`, "error");
}

export async function startAdmin() {
  await authReady;
  const user = await requireAdmin();

  if (!user) return null;

  const email = document.getElementById("adminEmail");
  if (email) email.textContent = user.email || "";

  document.getElementById("logoutBtn")?.addEventListener("click", async () => {
    try {
      await signOut(auth);
      location.replace("./index.html");
    } catch (error) {
      showError(error, "تعذر تسجيل الخروج");
    }
  });

  document.querySelectorAll("[data-close]").forEach(button => {
    button.addEventListener("click", () => {
      document.getElementById(button.dataset.close)?.classList.remove("open");
    });
  });

  return user;
}

export async function getAll(name) {
  const snapshot = await getDocs(collection(db, name));
  return snapshot.docs.map(item => ({
    id: item.id,
    ...item.data()
  }));
}
