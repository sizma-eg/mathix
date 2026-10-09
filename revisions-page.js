import {
  startAdmin, db, collection, doc, setDoc, deleteDoc,
  onSnapshot, serverTimestamp, escapeHTML, money, toast, showError
} from "./admin.js";

await startAdmin();

const $ = id => document.getElementById(id);
let items = [];

const subjects = {
  arabic: "اللغة العربية",
  english: "اللغة الإنجليزية",
  physics: "الفيزياء",
  chemistry: "الكيمياء",
  "solid-geometry": "الهندسة الفراغية",
  algebra: "الجبر"
};

const types = { pdf: "PDF", youtube: "YouTube", link: "رابط خارجي" };

function render() {
  const term = $("search").value.trim().toLowerCase();
  const filter = $("filter").value;

  const filtered = items.filter(item => {
    const title = `${item.title || item.name || ""} ${subjects[item.subject] || item.subject || ""}`.toLowerCase();
    return title.includes(term) && (filter === "all" || item.subject === filter);
  });

  $("rows").innerHTML = filtered.length
    ? filtered.map(item => `
      <tr>
        <td>${escapeHTML(item.title || item.name || "بدون عنوان")}</td>
        <td>${escapeHTML(subjects[item.subject] || item.subject || "—")}</td>
        <td>${escapeHTML(types[item.type] || item.type || "—")}</td>
        <td>${item.isFree || Number(item.price || 0) === 0 ? "مجاني" : money(item.price)}</td>
        <td>${escapeHTML(item.status || (item.published ? "published" : "draft"))}</td>
        <td><div class="row-actions">
          <button class="btn btn-secondary" data-edit="${escapeHTML(item.id)}">تعديل</button>
          <button class="btn btn-danger" data-delete="${escapeHTML(item.id)}">حذف</button>
        </div></td>
      </tr>
    `).join("")
    : '<tr><td colspan="6" class="empty">لا توجد ملخصات.</td></tr>';

  document.querySelectorAll("[data-edit]").forEach(button => {
    button.onclick = () => openEditor(items.find(item => item.id === button.dataset.edit));
  });

  document.querySelectorAll("[data-delete]").forEach(button => {
    button.onclick = () => removeItem(button.dataset.delete);
  });
}

function openEditor(item = null) {
  $("revisionForm").reset();
  $("itemId").value = item?.id || "";
  $("modalTitle").textContent = item ? "تعديل ملخص" : "إضافة ملخص";
  $("title").value = item?.title || item?.name || "";
  $("subject").value = item?.subject || "arabic";
  $("type").value = item?.type || "pdf";
  $("url").value = item?.url || item?.contentUrl || item?.link || "";
  $("price").value = Number(item?.price || 0);
  $("status").value = item?.status || (item?.published ? "published" : "draft");
  $("description").value = item?.description || "";
  $("free").checked = Boolean(item?.isFree);
  $("editModal").classList.add("open");
}

$("addBtn").onclick = () => openEditor();
$("search").oninput = render;
$("filter").onchange = render;
$("free").onchange = () => {
  if ($("free").checked) $("price").value = "0";
};

$("revisionForm").onsubmit = async event => {
  event.preventDefault();
  $("saveBtn").disabled = true;

  try {
    const id = $("itemId").value;
    const status = $("status").value;
    const price = $("free").checked ? 0 : Number($("price").value);
    const url = $("url").value.trim();

    if (!Number.isFinite(price) || price < 0) throw new Error("السعر غير صحيح.");

    const parsed = new URL(url);
    if (!["https:", "http:"].includes(parsed.protocol)) throw new Error("الرابط غير صالح.");

    const data = {
      title: $("title").value.trim(),
      subject: $("subject").value,
      type: $("type").value,
      url,
      price,
      isFree: $("free").checked,
      description: $("description").value.trim(),
      status,
      published: status === "published",
      updatedAt: serverTimestamp()
    };

    if (!data.title) throw new Error("اكتب عنوان الملخص.");

    if (id) {
      await setDoc(doc(db, "revisions", id), data, { merge: true });
    } else {
      const newDoc = doc(collection(db, "revisions"));
      await setDoc(newDoc, { ...data, createdAt: serverTimestamp() });
    }

    $("editModal").classList.remove("open");
    toast("تم حفظ الملخص.");
  } catch (error) {
    showError(error, "تعذر حفظ الملخص");
  } finally {
    $("saveBtn").disabled = false;
  }
};

async function removeItem(id) {
  if (!confirm("متأكد من حذف الملخص؟")) return;

  try {
    await deleteDoc(doc(db, "revisions", id));
    toast("تم حذف الملخص.");
  } catch (error) {
    showError(error, "تعذر حذف الملخص");
  }
}

onSnapshot(collection(db, "revisions"), snapshot => {
  items = snapshot.docs.map(item => ({ id: item.id, ...item.data() }));
  render();
}, error => showError(error, "تعذر تحميل الملخصات"));
