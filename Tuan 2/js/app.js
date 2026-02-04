const API = 'https://api.escuelajs.co/api/v1/products';

let products = [];
let currentPage = 1;
let pageSize = 10;
let sortField = '';
let asc = true;

const tableBody = document.getElementById('tableBody');
const searchInput = document.getElementById('searchInput');
const pagination = document.getElementById('pagination');
const tooltip = document.getElementById('tooltip');

/* LOAD DATA */
fetch(API)
  .then(res => res.json())
  .then(data => {
    products = data;
    render();
  });

function render() {
  let filtered = products.filter(p =>
    p.title.toLowerCase().includes(searchInput.value.toLowerCase())
  );

  if (sortField) {
    filtered.sort((a, b) =>
      asc ? a[sortField] > b[sortField] : a[sortField] < b[sortField]
    );
  }

  let start = (currentPage - 1) * pageSize;
  let pageData = filtered.slice(start, start + pageSize);

  tableBody.innerHTML = pageData.map(p => `
    <tr onmouseover="showDesc(event,'${p.description}')"
        onmouseout="hideDesc()"
        onclick="openModal(${p.id})">
      <td>${p.id}</td>
      <td>${p.title}</td>
      <td>$${p.price}</td>
      <td>${p.category?.name}</td>
      <td><img src="${p.images[0]}" class="thumb"></td>
    </tr>
  `).join('');

  renderPagination(filtered.length);
}

/* PAGINATION */
function renderPagination(total) {
  pagination.innerHTML = '';
  let pages = Math.ceil(total / pageSize);
  for (let i = 1; i <= pages; i++) {
    pagination.innerHTML += `
      <li class="page-item ${i === currentPage ? 'active' : ''}">
        <button class="page-link" onclick="currentPage=${i};render()">${i}</button>
      </li>
    `;
  }
}

/* EVENTS */
searchInput.oninput = () => {
  currentPage = 1;
  render();
};

document.getElementById('pageSize').onchange = e => {
  pageSize = +e.target.value;
  render();
};

function sortBy(field) {
  asc = sortField === field ? !asc : true;
  sortField = field;
  render();
}

/* CSV EXPORT */
function exportCSV() {
  let csv = "id,title,price\n";
  document.querySelectorAll("#tableBody tr").forEach(tr => {
    let tds = [...tr.children].map(td => td.innerText);
    csv += `${tds[0]},${tds[1]},${tds[2]}\n`;
  });

  let blob = new Blob([csv]);
  let a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'products.csv';
  a.click();
}

/* MODAL VIEW */
function openModal(id) {
  let p = products.find(x => x.id === id);
  editId.value = p.id;
  editTitle.value = p.title;
  editPrice.value = p.price;
  editDesc.value = p.description;
  editImage.value = p.images[0];
  new bootstrap.Modal(viewModal).show();
}

/* UPDATE PRODUCT */
function updateProduct() {
  fetch(`${API}/${editId.value}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: editTitle.value,
      price: Number(editPrice.value),
      description: editDesc.value,
      images: [editImage.value]
    })
  })
    .then(res => res.json())
    .then(() => {
      alert("Update thành công!");
      location.reload();
    });
}

/* CREATE PRODUCT */
function createProduct() {
  const payload = {
    title: newTitle.value,
    price: Number(newPrice.value),
    description: newDesc.value,
    categoryId: 1,
    images: [newImage.value]
  };

  fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
    .then(res => {
      if (!res.ok) throw new Error("Create failed");
      return res.json();
    })
    .then(() => {
      alert("Create thành công!");
      location.reload();
    })
    .catch(err => {
      console.error(err);
      alert("Create thất bại – mở F12 xem lỗi");
    });
}

/* TOOLTIP */
function showDesc(e, text) {
  tooltip.innerText = text;
  tooltip.style.display = 'block';
  tooltip.style.left = e.pageX + 10 + 'px';
  tooltip.style.top = e.pageY + 10 + 'px';
}
function hideDesc() {
  tooltip.style.display = 'none';
}
