const {JWT} = require('google-auth-library');
const keys = require('./.credentials/trackerJWT_2.json');

console.log(keys);

async function main() {
  const client = new JWT({
    email: keys.client_email,
    key: keys.private_key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const url = `https://docs.google.com/spreadsheets/d/13-zoYnlLD6gpz5fb8yHF1NNAMhxse7jFm5_eMpyLGaw/edit#gid=0`;
  const res = await client.request({url});
  console.log(res.data);
}

main().catch(console.error);
