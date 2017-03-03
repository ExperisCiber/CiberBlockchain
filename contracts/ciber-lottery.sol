   pragma solidity ^ 0.4 .0;

   import "DateTime.sol";

   contract ciberLottery {

       event BuyIn();
       event LotteryStart();
       event LotteryEnd();

       address owner;
       bool public lotteryState;

       struct Ticket {
           address participant;
           uint ticketNumber;
       }
       mapping(uint => Ticket) tickets;
       uint ticketCounter;
       bytes32 lotteryTitle;
       uint public endDateStart; // expected format: unix timestamp
       uint public endDateClose; // expected format: unix timestamp
       uint public ticketPrice; // expected format: whole numbers in ether
       uint ticketMax; // expected format: whole numbers
       bool testFlag;
       bytes32 check;
       uint256 public random;
       address winner;
       uint price;

       function ciberLottery() {
           owner = msg.sender;
       }

       function startLottery(bytes32 _lotteryTitle, uint _endDateStart, uint _endDateClose, uint _ticketPrice, uint _ticketMax, bool _testFlag) {

           if (owner == msg.sender) {
               if (!lotteryState) {
                   lotteryState = true;
                   lotteryTitle = _lotteryTitle;
                   endDateStart = _endDateStart;
                   endDateClose = _endDateClose;
                   ticketPrice = _ticketPrice;
                   ticketMax = _ticketMax;
                   testFlag = _testFlag;

                   LotteryStart();
               }
           }
           throw;
       }

       modifier onlyOwner() {
            if (msg.sender != owner)
                throw;
            _;
        }
        
        modifier lotteryStarted(bool started) {
            if (lotteryState != started) {
                throw;
            }
            _;
        }
        
       function endLottery() {

           // Alleen door lottery owner
           if (msg.sender == owner) {

               // Alleen als lottery is gestart
               if (lotteryState) {

                   // Alleen OP lottery endDate
                   if ((now > endDateStart && now < endDateClose) || testFlag) {
                       random = ((now * now * now) % 10 ** 1);
                       while (random > ticketCounter) {
                           random = ((now * now * now) % 10 ** 1);
                       }
                       winner = tickets[random].participant;
                       price = this.balance;
                       tickets[random].participant.send(this.balance);

                       // Stop lottery
                       lotteryState = false;
                       lotteryTitle = '';
                       endDateStart = 0;
                       endDateClose = 0;
                       ticketPrice = 0;
                       ticketMax = 0;
                       ticketCounter = 0;

                       LotteryEnd();

                   }
               }
           }
           throw;
       }

       function buyIn() payable returns(uint) {

           if (now < endDateStart || testFlag) {

               if (msg.value == ticketPrice) {
              
                   ticketCounter++;
                   if (ticketCounter <= ticketMax) {
                        tickets[ticketCounter] = Ticket({
                            participant: msg.sender,
                            ticketNumber: ticketCounter
                        });
                   
                        BuyIn();
                        return ticketCounter;
                   
                    } 
                    else {
                       ticketCounter = ticketCounter - 1;
                    }
               }
           }
           throw;
       }


       function refund() {

           // Alleen NA endDate
           if (now > endDateClose || testFlag) {

               if (lotteryState) {

                   for (uint i = 0; i <= ticketCounter; i++) {
                       if (tickets[i].participant == msg.sender) {
                           tickets[i].participant.send(ticketPrice);
                           delete tickets[i];
                       }
                   }
               }
           }
       }
   }