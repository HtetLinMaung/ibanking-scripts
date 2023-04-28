const { Sequelize } = require("sequelize");
const tedious = require("tedious");
const fs = require("fs");

const sequelize = new Sequelize("ibankingydnb", "ibanking", "P@ssword", {
  host: "ibankingstresstest.database.windows.net",
  port: 1433,
  dialect: "mssql",
  dialectModule: tedious,
  dialectOptions: {
    options: {
      encrypt: true,
      trustServerCertificate: false,
      hostNameInCertificate: "*.database.windows.net",
      loginTimeout: 30,
    },
  },
});
function csvToArrayOfObjects(csvData, delimiter = ",") {
  const lines = csvData.split("\n");
  const headers = lines[0].split(delimiter);

  return lines.slice(1).map((line) => {
    const values = line.split(delimiter);
    return headers.reduce((accumulator, header, index) => {
      accumulator[header] = values[index];
      return accumulator;
    }, {});
  });
}

function readCSVFile(filename, delimiter) {
  const csvData = fs.readFileSync(filename, "utf-8");
  return csvToArrayOfObjects(csvData, delimiter);
}
async function main() {
  const data = readCSVFile("other-accounts.csv", ",");
  if (data.length) {
    await sequelize.query(
      `update transferhistory set recordstatus = 1 where refno in (${data
        .map((d) => `'${d}'`)
        .join(", ")})`
    );
  }
}

main();
