const { Sequelize } = require("sequelize");
const tedious = require("tedious");
const generateSyskey = require("generate-syskey").default;
const fs = require("fs");
const httpCleint = require("starless-http").default;
const { asyncEach } = require("starless-async");
const path = require("path");
const { log } = require("starless-logger");

const domain = "https://ibankingstresstest.azurewebsites.net";

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
// jdbc:sqlserver://ibankingstresstest.database.windows.net:1433;database=ibankingydnb;user=ibanking@ibankingstresstest;password={your_password_here};encrypt=true;trustServerCertificate=false;hostNameInCertificate=*.database.windows.net;loginTimeout=30;
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

async function generateUser() {
  const rolelevel = "500";

  await sequelize.authenticate();
  const now = `'${new Date().toISOString()}'`;
  const rolesyskey = generateSyskey();

  await sequelize.query("delete from iBankingUser where userid = 'generated'");
  await sequelize.query("delete from CIFMapping where userid = 'generated'");
  await sequelize.query(
    "delete from userrolejunction where userid = 'generated'"
  );
  await sequelize.query("delete from ibankingrole where userid = 'generated'");

  await sequelize.query(
    `insert into ibankingrole (syskey, createddate, modifieddate, userid, username, level, description, roletype, usertype) values (${rolesyskey}, ${now}, ${now}, 'generated', 'generated', '${rolelevel}', 'Test Role', 0, 10)`
  );
  const tokenData = readCSVFile("CBS Token.csv");

  const tokens = await asyncEach(
    tokenData.filter((r) => r["cifid\r"]),
    async (row, index) => {
      const customerid = row["cifid\r"].trim();
      const userid = `NB${index + 1}`;
      await sequelize.query(
        `insert into UserRoleJunction (syskey, createddate, modifieddate, userid, username, ibankinguserid, rolelevel) values (${generateSyskey()}, ${now}, ${now}, 'generated', 'generated', '${userid}', '${rolelevel}')`
      );
      await sequelize.query(
        `insert into CIFMapping (syskey, createddate, modifieddate, userid, username, ibankinguserid, customerid, ibankingusertype, t1) values (${generateSyskey()}, ${now}, ${now}, 'generated', 'generated', '${userid}', '${customerid}', 10, '+959404888722')`
      );
      await sequelize.query(
        `insert into iBankingUser (syskey, createddate, modifieddate, userid, username, ibankinguserid, usertype, name, nrc, dob, phonenumber, email, address, state, city, postalcode, country, status) values (${generateSyskey()}, ${now}, ${now}, 'generated', 'generated', '${userid}', 10, 'U HTET LIN MAUNG', '2/BALAKHA(THA)123456', '19000101', '+959404888722', 'hlm@mit.com.mm', '2 272/10;BET:84*85 ST & 36*37 ST; MANDALAY. Yinpyan YANKIN', 'YGN', 'YANGON(EAST)', '00000', 'Myanmar', 10)`
      );
      const [response] = await httpCleint.post(
        `${domain}/api/getmoduletoken`,
        {
          appid: "ibanking",
          userid,
          username: userid,
          atoken:
            "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ7XCJhcHBpZFwiOlwiaWJhbmtpbmdcIixcInVzZXJpZFwiOlwiSExNXCJ9IiwiZXhwIjoxNjgyNTkwMzc3LCJpYXQiOjE2ODI1MDM5Nzd9.qQkic_s9RtkypYEwIy6TphjvJle01raH14NzaKPlw5A",
          fcmtoken: "",
        },
        {},
        { retry: 99999 }
      );
      log(`row: ${index + 1}`);
      log(response.data.btoken);
      return response.data.btoken;
    },
    10
  );

  fs.writeFileSync(
    path.join(__dirname, "tokens.json"),
    JSON.stringify(tokens, null, 2)
  );
}

generateUser();
// select ibankinguserid from [dbo].[iBankingUser] where recordstatus <> 4;
// select * from [dbo].[CIFMapping] where ibankinguserid = 'HLM' and recordstatus <> 4
// select * from [dbo].[UserRoleJunction] where ibankinguserid = 'HLM' and recordstatus <> 4
// select * from [dbo].[iBankingRole] where level = '400' and recordstatus <> 4;

`delete from iBankingUser where userid = 'generated';
delete from CIFMapping where userid = 'generated';
delete from userrolejunction where userid = 'generated';
delete from ibankingrole where userid = 'generated';`;
