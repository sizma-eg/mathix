import { startAdmin, getAll, escapeHTML, money, dateLabel, showError } from "./admin.js";

await startAdmin();

const search = document.getElementById("search");
const rows = document.getElementById("rows");
let purchases = [];

function render() {
  const term = search.value.trim().toLowerCase();

  const filtered = purchases.filter(item =>
    `${item.title || item.revisionTitle || item.revisionId || ""} ${item.studentId || ""} ${item.studentEmail || ""} ${item.id}`
      .toLowerCase().includes(term)
  );

  rows.innerHTML = filtered.length
    ? filtered.map(item => `
      <tr>
        <td>${escapeHTML(item.title || item.revisionTitle || item.revisionId || "—")}</td>
        <td>${escapeHTML(item.studentEmail || item.studentId || "—")}</td>
        <td>${money(item.price ?? item.amount ?? 0)}</td>
        <td>${dateLabel(item.createdAt || item.purchasedAt)}</td>
        <td>${escapeHTML(item.id)}</td>
      </tr>
    `).join("")
    : '<tr><td colspan="5" class="empty">لا توجد مشتريات.</td></tr>';
}

search.oninput = render;

try {
  purchases = await getAll("purchases");
  render();
} catch (error) {
  showError(error, "تعذر تحميل المشتريات");
}
