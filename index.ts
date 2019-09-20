import * as dotenv from 'dotenv';
dotenv.config()

import { GrpcClient, GetUnspentOutputResponse, TransactionNotification,  } from "grpc-bchrpc-node";
import { ClientReadableStream } from "grpc";

let grpc: GrpcClient;
if(process.env.bchd_cert)
    grpc = new GrpcClient({ url: process.env.bchd_url, rootCertPath: process.env.bchd_cert });
else if(process.env.bchd_url)
    grpc = new GrpcClient({ url: process.env.bchd_url });
else
    grpc = new GrpcClient();

const getTxOut = async (hash: string, vout: number): Promise<GetUnspentOutputResponse|null> =>  {
    try {
        let utxo = (await grpc.getUnspentTransaction({ hash: hash, vout: vout, includeMempool: true }));
        return utxo;
    } catch(_) {
        return null
    }
}

const grpcSubscribe = async () => {
    let txnstream: ClientReadableStream<TransactionNotification>;
    txnstream = await grpc.subscribeTransactions({ includeMempoolAcceptance: true, includeSerializedTxn: false, includeBlockAcceptance: false })
    txnstream.on('data', async function(data: TransactionNotification) {
        let inputs = data.getUnconfirmedTransaction()!.getTransaction()!.getInputsList();
        console.log("Input Count:", inputs.length);
        for(let i = 0; i < inputs.length; i++) {
            let txid = Buffer.from(inputs[i].getOutpoint()!.getHash_asU8()).toString('hex');
            let idx = inputs[i].getOutpoint()!.getIndex();
            console.log("Input:", txid, idx);
            let status = await getTxOut(txid, idx);
            if(status)
                console.log("Error: Txn notified but UTXO not spent in 'gettxout'.");
            else
                console.log("OK (marked spent)")
        }
    });
}

grpcSubscribe();
