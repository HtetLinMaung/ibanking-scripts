const httpClient = require("starless-http").default;
const { log } = require("starless-logger");
const fs = require("fs");
const { asyncEach } = require("starless-async");

const domain = "https://ibankingstresstest.azurewebsites.net";

function arrayToCSV(data, delimiter = ",") {
  const header = Object.keys(data[0]).join(delimiter);
  const rows = data.map((obj) => Object.values(obj).join(delimiter)).join("\n");
  return header + "\n" + rows;
}

function writeCSVFile(filename, data, delimiter) {
  const csvContent = arrayToCSV(data, delimiter);
  fs.writeFileSync(filename, csvContent);
}

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
  const data = readCSVFile(
    "CBS Internal Transfer Difference Branch 1000 (1).csv",
    ","
  );
  const tokens = require("./tokens.json");

  const csvData = await asyncEach(
    data.filter((d) => d.amount != undefined),
    async (row, index) => {
      log(`row: ${index + 1}`);
      log(row);
      let [response] = await httpClient.post(
        `${domain}/api/requesttransfer`,
        {
          amount: row.amount,
          bankcharges: row.bankcharges,
          fromaccnumber: row.fromaccnumber,
          fromname: row.fromname,
          frombranch: "002",
          toaccnumber: row.toaccnumber,
          toname: row.toname,
          tobranch: "002",
          transfertype: "1",
          sisyskey: "0",
        },
        {
          headers: {
            Authorization: "Bearer " + tokens[index],
          },
        },
        {
          retry: 999999,
        }
      );
      if (response && response.data) {
        log(response.data);
      }

      return {
        refnumber: response.data.refnumber,
        otp: "",
        otpsession: "",
        token: tokens[index],
      };
    },
    10
  );
  writeCSVFile("other-accounts.csv", csvData, ",");
}
main();
