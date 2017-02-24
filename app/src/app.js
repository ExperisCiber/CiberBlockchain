import './index.html';

const async = require('async');
const Web3 = require('web3');
const ethTx = require('ethereumjs-tx');
const SolidityFunction = require('web3/lib/web3/function');

const abi = [
  {
    "constant": true,
    "inputs": [],
    "name": "test",
    "outputs": [
      {
        "name": "",
        "type": "bool"
      }
    ],
    "payable": false,
    "type": "function"
  }
];

const sandboxId = 'f44622432b';
const url = 'https://stijnkoopal.by.ether.camp:8555/sandbox/' + sandboxId;
const web3 = new Web3(new Web3.providers.HttpProvider(url));

web3.eth.defaultAccount = '0xdedb49385ad5b94a16f236a6890cf9e0b1e30392';

const contractAddress = '0x17956ba5f4291844bc25aedb27e69bc11b5bda39';

const contract = web3.eth.contract(abi).at(contractAddress);

$(() => {
    web3.eth.getBalance(contractAddress, 'latest', (error, result) => {
        $('#balance').html(result.toNumber());
    })
    
    if (contract.test()) {
      $('#lotery-started-down').toggle(); 
      $('#lotery-started-up').toggle(); 
    }


    // $('#call').click(e => {
    //     e.preventDefault();

    //     async.parallel({
    //         nonce: web3.eth.getTransactionCount.bind(web3.eth, web3.eth.defaultAccount),
    //         gasPrice: web3.eth.getGasPrice.bind(web3.eth)
    //     }, (err, results) => {
    //         if (err) return console.error(err);

    //         const func = new SolidityFunction(web3, abi[0], '');
    //         const data = func.toPayload([$('#arg').val()]).data;

    //         const tx = new ethTx({
    //             to: contract.address,
    //             nonce: results.nonce,
    //             gasLimit: '0x100000',
    //             gasPrice: '0x' + results.gasPrice.toString(16),
    //             data: data
    //         });
    //         tx.sign(new Buffer('974f963ee4571e86e5f9bc3b493e453db9c15e5bd19829a4ef9a790de0da0015', 'hex'));

    //         web3.eth.sendRawTransaction('0x' + tx.serialize().toString('hex'), (err, txHash) => {
    //             if (err) return console.error(err);

    //             const blockFilter = web3.eth.filter('latest');
    //             blockFilter.watch(() => {
    //                 web3.eth.getTransactionReceipt(txHash, (err, receipt) => {
    //                     if (err) return console.error(err);
    //                     if (receipt) {
    //                         blockFilter.stopWatching();
    //                         console.log(receipt);
    //                     }
    //                 });
    //             });
    //         });
    //     });
    // });
});
