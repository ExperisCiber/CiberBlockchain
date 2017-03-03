const SANDBOX_ID = 'f44622432b';
export const BLOCKCHAIN_URL = 'https://stijnkoopal.by.ether.camp:8555/sandbox/' + SANDBOX_ID;
export const CONTRACT_ADDRESS = '0x17956ba5f4291844bc25aedb27e69bc11b5bda39';

export const CONTRACT_ABI = [
  {
    "constant": false,
    "inputs": [],
    "name": "endLottery",
    "outputs": [],
    "payable": false,
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "_lotteryTitle",
        "type": "bytes32"
      },
      {
        "name": "_endDateStart",
        "type": "uint256"
      },
      {
        "name": "_endDateClose",
        "type": "uint256"
      },
      {
        "name": "_ticketPrice",
        "type": "uint256"
      },
      {
        "name": "_ticketMax",
        "type": "uint256"
      }
    ],
    "name": "startLottery",
    "outputs": [],
    "payable": false,
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [],
    "name": "buyIn",
    "outputs": [],
    "payable": true,
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [],
    "name": "refund",
    "outputs": [],
    "payable": false,
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "lotteryState",
    "outputs": [
      {
        "name": "",
        "type": "bool"
      }
    ],
    "payable": false,
    "type": "function"
  },
  {
    "inputs": [],
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [],
    "name": "BuyIn",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [],
    "name": "LotteryStart",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [],
    "name": "LotteryEnd",
    "type": "event"
  }
];