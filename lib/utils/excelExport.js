/**
 * Utility to export JavaScript object arrays to downloadable CSV / Excel file.
 * Handles UTF-8 BOM encoding for proper Hindi / Vernacular character support in Excel.
 *
 * @param {string} filename Name of exported file (without extension)
 * @param {Array<{label: string, key: string}>} columns Column definitions
 * @param {Array<object>} data Row objects matching column keys
 */
export function exportToExcel(filename, columns, data) {
  if (!data || !data.length) {
    alert('No data available to export.');
    return;
  }

  // 1. Build Header Row
  const headers = columns.map((col) => `"${col.label.replace(/"/g, '""')}"`).join(',');

  // 2. Build Data Rows
  const rows = data.map((item) => {
    return columns
      .map((col) => {
        const val = col.key.split('.').reduce((obj, key) => obj?.[key], item);
        const textVal = val !== undefined && val !== null ? String(val) : '';
        return `"${textVal.replace(/"/g, '""')}"`;
      })
      .join(',');
  });

  // 3. Join with newlines & add UTF-8 BOM (\uFEFF) for Excel unicode support
  const csvContent = '\uFEFF' + [headers, ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

  // 4. Trigger Browser File Download
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  const formattedDate = new Date().toISOString().slice(0, 10);

  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${formattedDate}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
