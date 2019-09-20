## grpc-gettxout-test

Test Notes:
 - This app listens for new transaction notifications and for each input checks `getUnspentOutput()` (grpc version of gettxout)
 - I was only able reproduce this bug when running a local full node, probably due to latency differences.
 - If the input is still in the UTXO set you will see `Error: Txn notified but UTXO still exists.`
 - If the input is marked spent you will see `OK`

Setup for your local full node:
 - Rename `example.env` file to `.env`
 - update `bchd_url` var if needed, default `localhost:8335`
 - update `bchd_cert` var, this is located in bchd's app data directory

Running the test:
 - `npm install`
 - `npm start`
 - monitor the console output for `Error:...` vs `OK`
