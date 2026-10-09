import {
  startAdmin, db, collection, doc, onSnapshot,
  runTransaction, serverTimestamp, escapeHTML, money, toast, showError
} from "./admin.js";

await startAdmin();

const $ = id => document.getElementById(id);
let requests = [];

function render() {
  const term = $("search").value.trim().toLowerCase();
  const status = $("filter").value;

  const filtered = requests.filter(item =>
    (status === "all" || (item.status || "pending") === status) &&
    `${item.studentEmail || item.email || ""} ${item.studentId || ""} ${item.senderPhone || ""} ${item.reference || ""}`.toLowerCase().includes(term)
  );

  $("rows").innerHTML = filtered.length
    ? filtered.map(item => `
      <tr>
        <td>${escapeHTML(item.studentEmail || item.email || item.studentId || "—")}</td>
        <td>${money(item.amount)}</td>
        <td>${escapeHTML(item.senderPhone || "—")}</td>
        <td>${escapeHTML(item.reference || item.transactionId || "—")}</td>
        <td>${escapeHTML(item.status || "pending")}</td>
        <td><div class="row-actions">
          ${(item.status || "pending") === "pending" ? `
            <button class="btn btn-success" data-approve="${escapeHTML(item.id)}">اعتماد</button>
            <button class="btn btn-danger" data-reject="${escapeHTML(item.id)}">رفض</button>
          ` : "—"}
        </div></td>
      </tr>
    `).join("")
    : '<tr><td colspan="6" class="empty">لا توجد طلبات مطابقة.</td></tr>';

  document.querySelectorAll("[data-approve]").forEach(button => {
    button.onclick = () => processRequest(button.dataset.approve, "approved");
  });

  document.querySelectorAll("[data-reject]").forEach(button => {
    button.onclick = () => processRequest(button.dataset.reject, "rejected");
  });
}

$("search").oninput = render;
$("filter").onchange = render;

async function processRequest(id, status) {
  const approved = status === "approved";

  if (!confirm(approved
    ? "هل تأكدت من وصول التحويل؟ سيتم إضافة المبلغ للمحفظة."
    : "هل تريد رفض طلب الشحن؟")) return;

  try {
    await runTransaction(db, async transaction => {
      const requestRef = doc(db, "walletRequests", id);
      const requestSnap = await transaction.get(requestRef);

      if (!requestSnap.exists()) throw new Error("طلب الشحن غير موجود.");

      const request = requestSnap.data();
      if ((request.status || "pending") !== "pending") {
        throw new Error("تمت معالجة الطلب بالفعل.");
      }

      const uid = request.studentId || request.uid;
      const amount = Number(request.amount);

      if (!uid || !Number.isFinite(amount) || amount <= 0) {
        throw new Error("بيانات الطالب أو المبلغ غير صحيحة.");
      }

      const walletRef = doc(db, "wallets", uid);
      const walletSnap = await transaction.get(walletRef);
      const wallet = walletSnap.exists() ? walletSnap.data() : {};
      const before = Number(wallet.balance ?? wallet.amount ?? 0);

      // لا تبدأ أي كتابة قبل إتمام جميع القراءات.
      if (approved) {
        transaction.set(walletRef, {
          balance: before + amount,
          updatedAt: serverTimestamp()
        }, { merge: true });

        const ledgerRef = doc(collection(db, "walletTransactions"));
        transaction.set(ledgerRef, {
          studentId: uid,
          studentEmail: request.studentEmail || request.email || "",
          type: "topup",
          amount,
          balanceBefore: before,
          balanceAfter: before + amount,
          requestId: id,
          reason: "اعتماد طلب شحن من الأدمن",
          createdAt: serverTimestamp()
        });
      }

      transaction.update(requestRef, {
        status,
        reviewedAt: serverTimestamp(),
        reviewedBy: "z1wae12008@gmail.com"
      });
    });

    toast(approved ? "تم اعتماد الطلب وإضافة الرصيد." : "تم رفض الطلب.");
  } catch (error) {
    showError(error, "تعذر معالجة الطلب");
  }
}

onSnapshot(collection(db, "walletRequests"), snapshot => {
  requests = snapshot.docs.map(item => ({ id: item.id, ...item.data() }));
  render();
}, error => showError(error, "تعذر تحميل طلبات الشحن"));
