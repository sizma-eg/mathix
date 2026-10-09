import {
  startAdmin, db, collection, doc, getDoc, getDocs, query, where,
  runTransaction, serverTimestamp, escapeHTML, money, toast, showError
} from "./admin.js";

await startAdmin();

const $ = id => document.getElementById(id);
let student = null;
let currentBalance = 0;

async function searchStudent() {
  const term = $("search").value.trim();
  if (!term) return toast("اكتب UID أو البريد الإلكتروني.", "error");

  $("result").textContent = "جارٍ البحث...";

  try {
    let found = null;
    const direct = await getDoc(doc(db, "students", term));

    if (direct.exists()) {
      found = { uid: direct.id, ...direct.data() };
    } else {
      const result = await getDocs(query(
        collection(db, "students"),
        where("email", "==", term)
      ));

      if (!result.empty) {
        const item = result.docs[0];
        found = { uid: item.id, ...item.data() };
      }
    }

    if (!found) {
      $("result").textContent = "لم يتم العثور على الطالب.";
      return;
    }

    const walletSnap = await getDoc(doc(db, "wallets", found.uid));
    const wallet = walletSnap.exists() ? walletSnap.data() : {};

    student = found;
    currentBalance = Number(wallet.balance ?? wallet.amount ?? 0);

    $("result").innerHTML = `
      <div class="stat">
        <div class="stat-label">الطالب</div>
        <div class="stat-value" style="font-size:18px">
          ${escapeHTML(found.name || found.fullName || found.email || found.uid)}
        </div>
        <p class="muted">${escapeHTML(found.email || "")}</p>
        <p class="muted">UID: ${escapeHTML(found.uid)}</p>
        <div class="stat-label">الرصيد الحالي</div>
        <div class="stat-value purple">${money(currentBalance)}</div>
        <button class="btn" id="editBtn">تعديل الرصيد</button>
      </div>`;

    $("editBtn").onclick = openEditor;
  } catch (error) {
    showError(error, "تعذر البحث عن الطالب");
  }
}

function openEditor() {
  $("walletForm").reset();
  $("uid").value = student.uid;
  $("studentLabel").textContent = student.email || student.uid;
  $("balance").textContent = money(currentBalance);
  $("editModal").classList.add("open");
}

$("searchBtn").onclick = searchStudent;
$("search").addEventListener("keydown", event => {
  if (event.key === "Enter") searchStudent();
});

$("walletForm").onsubmit = async event => {
  event.preventDefault();
  $("saveBtn").disabled = true;

  try {
    const uid = $("uid").value;
    const amount = Number($("amount").value);
    const operation = $("operation").value;
    const reason = $("reason").value.trim();

    if (!Number.isFinite(amount) || amount < 0 || !reason) {
      throw new Error("راجع المبلغ وسبب التعديل.");
    }

    await runTransaction(db, async transaction => {
      const walletRef = doc(db, "wallets", uid);
      const snapshot = await transaction.get(walletRef);
      const wallet = snapshot.exists() ? snapshot.data() : {};
      const before = Number(wallet.balance ?? wallet.amount ?? 0);

      let after = operation === "add"
        ? before + amount
        : operation === "subtract"
          ? before - amount
          : amount;

      if (after < 0) throw new Error("لا يمكن جعل الرصيد بالسالب.");

      const ledgerRef = doc(collection(db, "walletTransactions"));

      transaction.set(walletRef, {
        balance: after,
        updatedAt: serverTimestamp()
      }, { merge: true });

      transaction.set(ledgerRef, {
        studentId: uid,
        studentEmail: student.email || "",
        type: "admin_adjustment",
        operation,
        amount,
        reason,
        balanceBefore: before,
        balanceAfter: after,
        createdAt: serverTimestamp()
      });
    });

    $("editModal").classList.remove("open");
    toast("تم تعديل الرصيد.");
    await searchStudent();
  } catch (error) {
    showError(error, "تعذر تعديل الرصيد");
  } finally {
    $("saveBtn").disabled = false;
  }
};
