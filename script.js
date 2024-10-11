function addRow() {
    const table = document.getElementById('inventoryTable').getElementsByTagName('tbody')[0];
    const rowCount = table.rows.length;
    const row = table.insertRow(rowCount);
    row.innerHTML = `
        <td>${rowCount + 1}</td>
        <td><input type="text" name="itemDescription"></td>
        <td>
            <input type="text" name="serial" id="serial${rowCount + 1}">
            <button type="button" onclick="scanSerial(${rowCount + 1})">Scan</button>
        </td>
        <td><input type="text" name="length"></td>
        <td><input type="number" name="qty"></td>
        <td>
            <select name="usage">
                <option value="New">New</option>
                <option value="Used">Used</option>
                <option value="Removed">Removed</option>
            </select>
        </td>
        <td>
            <select name="condition">
                <option value="Good">Good</option>
                <option value="Damaged">Damaged</option>
            </select>
        </td>
        <td><input type="text" name="remarks"></td>
    `;
}

async function generatePDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const date = document.getElementById('date').value;
    const siteId = document.getElementById('siteId').value;
    const siteName = document.getElementById('siteName').value;
    const teamLeader = document.getElementById('teamLeader').value;
    const remarks = document.getElementById('remarks').value;
    const issuedPerson = document.getElementById('issuedPerson').value;
    const nic = document.getElementById('nic').value;
    const contactNo = document.getElementById('contactNo').value;

    doc.autoTable({
        head: [['Date', date], ['Site ID', siteId], ['Site Name', siteName], ['Team Leader', teamLeader]],
        startY: 10,
        theme: 'plain'
    });

    const table = document.getElementById('inventoryTable');
    const rows = table.getElementsByTagName('tr');
    const data = [];
    for (let i = 1; i < rows.length; i++) {
        const cells = rows[i].getElementsByTagName('td');
        const rowData = [];
        for (let j = 0; j < cells.length; j++) {
            const input = cells[j].getElementsByTagName('input')[0] || cells[j].getElementsByTagName('select')[0];
            rowData.push(input ? input.value : cells[j].innerText);
        }
        data.push(rowData);
    }

    doc.autoTable({
        head: [['No', 'Item Description & Model Name', 'Serial', 'Length', 'Qty', 'Usage', 'Condition', 'Remarks']],
        body: data,
        startY: doc.autoTable.previous.finalY + 10
    });

    doc.autoTable({
        head: [['Remarks', remarks], ['Issued Person', issuedPerson], ['NIC No.', nic], ['Contact No.', contactNo]],
        startY: doc.autoTable.previous.finalY + 10,
        theme: 'plain'
    });

    doc.save(`${siteId}_${siteName}_Return_Note.pdf`);
}

function scanSerial(rowId) {
    const codeReader = new ZXing.BrowserBarcodeReader();
    const video = document.getElementById('video');
    video.style.display = 'block';

    codeReader.decodeFromInputVideoDevice(undefined, 'video').then(result => {
        document.getElementById(`serial${rowId}`).value = result.text;
        video.style.display = 'none';
        codeReader.reset();
    }).catch(err => {
        console.error(err);
        video.style.display = 'none';
    });
}
