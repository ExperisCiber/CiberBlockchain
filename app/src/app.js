import './index.html';
import {CONTRACT_ABI, BLOCKCHAIN_URL, CONTRACT_ADDRESS} from './config.js';

/* global $*/

// Specific required libraries (should also be in package.json)
const Web3 = require('web3');
const moment = require('moment');
const toastr = require('toastr');

// Initialize web3 to use the right url and default account
const web3 = new Web3(new Web3.providers.HttpProvider(BLOCKCHAIN_URL));
web3.eth.defaultAccount = '0xdedb49385ad5b94a16f236a6890cf9e0b1e30392';

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
 * Function that will refreh the balance div with the balance of the contract
 */
const refreshBalance = contract => promise(web3.eth.getBalance, contract.address, 'latest')
 .then(result => $('.balance').html(result.toNumber()));

/**
 * Function that will refresh all relevant with fields from the lottery contract
 */ 
const refreshLotteryData = contract => {
  refreshBalance(contract);

  promise(contract.ticketPrice)
    .then(price => price.toNumber())
    .then(price => $('.ticket-price').html(price));
    
  Promise.all([promise(contract.endDateStart), promise(contract.endDateClose)])
    .then(([start, close]) => endDateKnown(start.toNumber(), close.toNumber()))
    .catch(err => toastr.error(err));
};

const endDateKnown = (endDateStart, endDateClose) => {
  const momentStart = moment.unix(endDateStart);
  const momentEnd = moment.unix(endDateClose);
  
  $('.end-date').html(momentStart.format('DD-MM-YYYY') + ' - ' + momentEnd.format('DD-MM-YYYY'));

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
  promise(contract.lotteryState).then(result => {
    alert(result);
    if (result) {
      $('.lottery-started').show();
      $('.lottery-not-started').hide();
    
      refreshLotteryData(contract);
    } else {
      $('.lottery-started').hide();
      $('.lottery-not-started').show();
    }
  }).catch(err => toastr.error(err));
};

/**
 * Utility method to watch events on a contract
 */ 
const watchContractEvent = (event, fn) => {
  event().watch((error, result) => fn());
}

/**
 * Listen to events on the lottery contract
 */ 
const watchContractEvents = contract => {
  watchContractEvent(contract.BuyIn, () => refreshBalance(contract));
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
      const lotPrice = form.find('input[name=lotPrice]').val();
      const maxParticipants = form.find('input[name=maxParticipants]').val();
      const endDateString = form.find('input[name=endDate]').val();
      const endDate = moment(endDateString, 'DD-MM-YYYY');
      
      promise(contract.startLottery, title, endDate.unix(), endDate.add(1, 'days').unix(), lotPrice, maxParticipants)
        .then(() => toastr.success('Lottery started!!'))
        .then(() => refreshLotteryState(contract))
        .catch(err => toastr.error(err));
  });
  
const watchBuyTicketButton = contract => {
  watchButtonClick('#buy-ticket-button', e => {
    promise(contract.ticketPrice)
      .then(ticketPrice => promise(contract.buyIn, {value: ticketPrice}))
      .then(() => toastr.success('Ticket bought!'))
      .catch(err => toastr.error(err));
  });
};

const watchRefundButton = contract => {
  watchButtonClick('#refund-button', e => {
    promise(contract.refund)
      .then(() => toastr.success('All your tickets are refunded'))
      .catch(err => toastr.error(err));
  });
};

const watchEndLotteryButton = contract => {
  watchButtonClick('#end-lottery-button', e => {
    promise(contract.refund)
      .then(() => toastr.success('Lottery ended, winner has been rewarded'))
      .catch(err => toastr.error(err));
  });
};

/**
 * Function that is executed when the DOM is fully loaded
 */
$(() => {
    const contract = web3.eth.contract(CONTRACT_ABI).at(CONTRACT_ADDRESS);

    refreshLotteryState(contract);
    
    watchContractEvents(contract);
    
    watchStartLotteryButton(contract);
    watchBuyTicketButton(contract);
    watchEndLotteryButton(contract);
    watchRefundButton(contract);
});