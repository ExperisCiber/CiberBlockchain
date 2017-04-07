import './index.html';
import {USE_SANDBOX, CONTRACT_ABI, BLOCKCHAIN_URL, SANDBOX_CONTRACT_ADDRESS, ROPSTEN_CONTRACT_ADDRESS} from './config.js';

/* global $*/

// Specific required libraries (should also be in package.json)
const Web3 = require('web3');
const moment = require('moment');
const toastr = require('toastr');
const DATE_FORMAT = 'DD-MM-YYYY HH:mm';

let CONTRACT_ADDRESS;

if (!USE_SANDBOX && typeof web3 !== 'undefined') { // Injection by Metamask/Mist
  window.web3 = new Web3(window.web3.currentProvider);
  window.web3.eth.defaultAccount = window.web3.eth.accounts[0];
  CONTRACT_ADDRESS=ROPSTEN_CONTRACT_ADDRESS;
  console.log('Using metamask');
} else {
  window.web3 = new Web3(new Web3.providers.HttpProvider(BLOCKCHAIN_URL));
  window.web3.eth.defaultAccount = '0xdedb49385ad5b94a16f236a6890cf9e0b1e30392';
  CONTRACT_ADDRESS=SANDBOX_CONTRACT_ADDRESS;
  console.log('Using sandbox');
}

/**
 * Utility method that takes at least one parameter: a function `x`.
 * The last argument of function `x` should be a callback in the form (error, result)
 * Every next argument you give `promise` will be given as argument to function `x`
 */
const promise = (fn, ...args) => {
  return new Promise((resolve, reject) => 
    fn.apply(this, args.concat([(err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    }]))
  );
};

/**
 * Convenience method that changes the given function into a promise
 */ 
const invoke = fn => 
  ({
    with(...args) {
      return promise.apply(this, [fn].concat(args));
    },
    
    then(thenFn) {
      return promise.apply(this, [fn])
        .then(thenFn);
    }
  });


/**
 * Function that will refreh the balance div with the balance of the contract
 */
const refreshBalance = contract => invoke(window.web3.eth.getBalance).with(contract.address, 'latest')
 .then(result => window.web3.fromWei(result, 'ether'))
 .then(result => $('.balance').html(result.toNumber()));

/**
 * Function that will convert a hex value to a human readable string
 */ 
const toString = value => {
  const postFix = value.substr(2, value.length);
  return postFix.match(/.{1,2}/g)
    .map(charCode => String.fromCharCode(parseInt(charCode, 16)))
    .reduce((a, b) => a + b)
    .trim();
};

const refreshWinnerData = contract => {
  invoke(contract.winnerAddress)
    .then(winner => $('.winnerAddress').html(winner));
    
  invoke(contract.winnerNumber)
    .then (number => number.toNumber())
    .then (number => $('.winnerNumber').html(number));
};

const refreshLotteryData = contract => {
  refreshBalance(contract);

  invoke(contract.lotteryTitle)
    .then(title => toString(title))
    .then(title => $('.title').html(title));
  
  invoke(contract.ticketPrice)
    .then(price => price.toNumber())
    .then(price => window.web3.fromWei(price, 'ether'))
    .then(price => $('.ticket-price').html(price));
  
  invoke(contract.tickets).with(1)
      .then (tickets => $('.participant1').html(tickets));
  invoke(contract.tickets).with(2)
      .then (tickets => $('.participant2').html(tickets));
  invoke(contract.tickets).with(3)
      .then (tickets => $('.participant3').html(tickets));
  invoke(contract.tickets).with(4)
      .then (tickets => $('.participant4').html(tickets));
  invoke(contract.tickets).with(5)
      .then (tickets => $('.participant5').html(tickets));
  invoke(contract.tickets).with(6)
      .then (tickets => $('.participant6').html(tickets));
  invoke(contract.tickets).with(7)
      .then (tickets => $('.participant7').html(tickets));
  invoke(contract.tickets).with(8)
      .then (tickets => $('.participant8').html(tickets));
  invoke(contract.tickets).with(9)
      .then (tickets => $('.participant9').html(tickets));
      
  Promise.all([invoke(contract.endDateStart), invoke(contract.endDateClose)])
    .then(([start, close]) => endDateKnown(start.toNumber(), close.toNumber()))
    .catch(err => toastr.error(err));
};

const endDateKnown = (endDateStart, endDateClose) => {
  const momentStart = moment.unix(endDateStart);
  const momentEnd = moment.unix(endDateClose);
  
  $('.end-date').html(momentStart.format(DATE_FORMAT) + ' <br/> ' + momentEnd.format(DATE_FORMAT));

  if (moment().isBetween(momentStart, momentEnd)) {
    $('#end-lottery-button').prop('disabled', false);
  } else {
    $('#end-lottery-button').prop('disabled', true);

    if (moment().isBefore(momentStart)) {
      const timeUntilEnabled = (momentStart.unix() - moment().unix()) * 1000; 
      setTimeout(() => $('#end-lottery-button').prop('disabled', false), timeUntilEnabled);
     }
  }
  
  if (moment().isAfter(momentEnd)) {
    $('#refund-button').prop('disabled', false);
  } else {
    $('#refund-button').prop('disabled', true);
    const timeUntilEnabled = (momentEnd.unix() - moment().unix()) * 1000;
    setTimeout(() => $('#refund-button').prop('disabled', false), timeUntilEnabled);
  }
};

/**
 * Updates the visibility of fields that are bound to the state of the contract.
 * Will hide and show fields appropriate.
 * Will also refresh the lottery data if the lottery is started
 */ 
const refreshLotteryState = contract => {
  invoke(contract.lotteryState)
  .then(result => {
    if (result) {
      $('.lottery-started').show();
      $('.lottery-not-started').hide();
    
      refreshLotteryData(contract);
    } else {
      $('.lottery-started').hide();
      $('.lottery-not-started').show();
      
      refreshWinnerData(contract);
    }
  }).catch(err => toastr.error(err));
};

/**
 * Utility method to watch events on a contract
 */ 
const watchContractEvent = (event, fn) => {
  event().watch((error, result) => fn());
};

/**
 * Listen to events on the lottery contract
 */ 
const watchContractEvents = contract => {
  watchContractEvent(contract.BuyIn, () => refreshLotteryState(contract));
  watchContractEvent(contract.LotteryStart, () => refreshLotteryState(contract));
  watchContractEvent(contract.LotteryEnd, () => refreshLotteryState(contract));
};

/**
 * Utility method that will listen to clicks on a certain selector, and will stop 
 * propagation of the click event throughout the DOM
 */ 
const watchButtonClick = (selector, fn) => {
  $(selector).click(e => {
    e.stopPropagation();
    fn.apply(this, e);
    return false;
  });
};

const watchStartLotteryButton = contract => 
  watchButtonClick('#start-lottery-button', e => {
      const form = $('#start-lottery-form');
      const title = form.find('input[name=name]').val();
      const lotPrice = window.web3.toWei(form.find('input[name=lotPrice]').val(), 'ether')
      const maxParticipants = form.find('input[name=maxParticipants]').val();
      const endDateStart = moment(form.find('input[name=endDateStart]').val(), DATE_FORMAT);
      const endDateClose = moment(form.find('input[name=endDateClose]').val(), DATE_FORMAT);

      invoke(contract.startLottery).with(title, endDateStart.unix(), endDateClose.unix(), lotPrice, maxParticipants)
        .then(() => toastr.success('Lottery submitted'))
        .then(() => refreshLotteryState(contract))
        .catch(err => toastr.error(err));
  });
  
const watchBuyTicketButton = contract => {
  watchButtonClick('#buy-ticket-button', e => {
    invoke(contract.ticketPrice)
      .then(ticketPrice => invoke(contract.buyIn).with({value: ticketPrice}))
      .then(result => toastr.success('Ticket submitted'))
      .catch(err => toastr.error(err));
  });
};

const watchRefundButton = contract => {
  watchButtonClick('#refund-button', e => {
    invoke(contract.refund)
      .then(() => toastr.success('Refund to be processed by the chain'))
      .catch(err => toastr.error(err));
  });
};

const watchEndLotteryButton = contract => {
  watchButtonClick('#end-lottery-button', e => {
    invoke(contract.endLottery)
      .then(() => toastr.success('Ending of lottery to be processed by chain'))
      .catch(err => toastr.error(err));
  });
};

const setNetwork = () => {
  const mapping = {1: 'Main', 2: 'Deprecated Morden', 3: 'Ropsten'};
  
  invoke(window.web3.version.getNetwork)
    .then(netId => mapping[netId] || 'Sandbox')
    .then(network => $('#network').html(network));
};

/**
 * Function that is executed when the DOM is fully loaded
 */
$(() => {
    const contract = window.web3.eth.contract(CONTRACT_ABI).at(CONTRACT_ADDRESS);
    
    refreshLotteryState(contract);
    
    watchContractEvents(contract);
    
    watchStartLotteryButton(contract);
    watchBuyTicketButton(contract);
    watchEndLotteryButton(contract);
    watchRefundButton(contract);
    
    setNetwork();
    
    $('#lotPrice').val(1000);
    $('#maxParticipants').val(9);
    $('#endDateStart').val(moment().add(5, 'm').format(DATE_FORMAT));
    $('#endDateClose').val(moment().add(10, 'm').format(DATE_FORMAT));
});