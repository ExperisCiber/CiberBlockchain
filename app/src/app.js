import './index.html';
import {CONTRACT_ABI, BLOCKCHAIN_URL, CONTRACT_ADDRESS} from './config.js';

/* global $*/

const Web3 = require('web3');

const web3 = new Web3(new Web3.providers.HttpProvider(BLOCKCHAIN_URL));

web3.eth.defaultAccount = '0xdedb49385ad5b94a16f236a6890cf9e0b1e30392';

const refreshBalance = contract => web3.eth.getBalance(contract.address, 'latest', (error, result) => {
    $('#balance').html(result.toNumber());
});

const refreshState = (contract) => {
  if (contract.lotteryState()) {
    $('#lottery-started-down').hide(); 
    $('#lottery-started-up').show(); 
    $('#start-lottery-form').hide();
  } else {
    $('#lottery-started-down').show(); 
    $('#lottery-started-up').hide(); 
    $('#start-lottery-form').show();
  }
};

const startLottery = (contract, title, lotPrice, maxParticipants, endDate) => {
  contract.startLottery(title, endDate, endDate + 1000000, lotPrice, maxParticipants);
};

const watchEvents = contract => {
  contract.BuyIn().watch((error, result) => refreshBalance(contract));
  contract.LotteryStart().watch((error, result) => refreshState(contract));
  contract.LotteryEnd().watch((error, result) => refreshState(contract));
};

const watchStartLotteryClick = contract => 
  $('#start-lottery-button').click(e => {
      e.stopPropagation();
      
      const form = $('#start-lottery-form');
      const title = form.find('input[name=name]').val();
      const lotPrice = form.find('input[name=lotPrice]').val();
      const maxParticipants = form.find('input[name=maxParticipants]').val();
      const endDate = form.find('input[name=endDate]').val();

      startLottery(contract, title, lotPrice, maxParticipants, endDate);
      refreshState(contract);
      return false;
  });

    
$(() => {
    const contract = web3.eth.contract(CONTRACT_ABI).at(CONTRACT_ADDRESS);

    refreshBalance(contract);
    refreshState(contract);
    
    watchEvents(contract);
    watchStartLotteryClick(contract);
    
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