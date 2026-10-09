import { startAdmin, getAll, money, escapeHTML, showError } from "./admin.js";

await startAdmin();

async function loadDashboard() {
  try {
    const [revisions, requests, purchases, students] = await Promise.all([
      getAll("revisions"),
      getAll("walletRequests"),
      getAll("purchases"),
      getAll("students")
    ]);

    document.getElementById("revisionCount").textContent = revisions.length;
    document.getElementById("requestCount").textContent =
      requests.filter(item => (item.status || "pending") === "pending").length;
    document.getElementById("purchaseCount").textContent = purchases.length;
    document.getElementById("studentCount").textContent = students.length;

    const recent = requests
      .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
      .slice(0, 8);

    document.getElementById("requestsTable").innerHTML = recent.length
      ? recent.map(item => `
          <tr>
            <td>${escapeHTML(item.studentEmail || item.email || item.studentId || "—")}</td>
            <td>${money(item.amount)}</td>
            <td>${escapeHTML(item.status || "pending")}</td>
          </tr>
        `).join("")
      : '<tr><td colspan="3" class="empty">لا توجد طلبات شحن.</td></tr>';
  } catch (error) {
    showError(error, "تعذر تحميل الإحصائيات");
  }
}

document.getElementById("refreshBtn").addEventListener("click", loadDashboard);
await loadDashboard();
