const fs      = require("fs");
const csv     = require("csv-parser");
const ExcelJS = require("exceljs");
const path    = require("path");

const parseFile = (filePath) => {
  return new Promise((resolve, reject) => {
    const ext = path.extname(filePath).toLowerCase();

    // --- Excel ---
    if (ext === ".xlsx" || ext === ".xls") {
      const workbook = new ExcelJS.Workbook();
      workbook.xlsx.readFile(filePath)
        .then(() => {
          const worksheet = workbook.worksheets[0];
          const rows      = [];
          let   headers   = [];

          worksheet.eachRow((row, rowIndex) => {
            const values = row.values.slice(1);
            if (rowIndex === 1) {
              headers = values.map((h) => String(h).trim());
            } else {
              const obj = {};
              headers.forEach((header, i) => {
                obj[header] = values[i] !== undefined
                  ? String(values[i]).trim()
                  : "";
              });
              rows.push(obj);
            }
          });
          resolve(rows);
        })
        .catch(reject);
      return;
    }

    // --- CSV ---
    if (ext === ".csv") {
      const rows = [];
      fs.createReadStream(filePath)
        .pipe(csv())
        .on("data", (row) => rows.push(row))
        .on("end",  ()    => resolve(rows))
        .on("error",(err) => reject(err));
      return;
    }

    reject(new Error("Unsupported file format. Use .csv or .xlsx"));
  });
};

module.exports = parseFile;