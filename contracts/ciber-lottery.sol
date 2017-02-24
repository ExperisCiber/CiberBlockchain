   pragma solidity ^ 0.4 .0;

   import "DateTime.sol";

   contract ciberLottery {

       address owner;

       bool public lotteryState;

       struct Ticket {
           address participant;
           uint ticketNumber;
       }
       mapping(uint => Ticket) tickets;
       
       

       uint ticketCounter;

       bytes32 lotteryTitle;
       uint endDateStart; // expected format: unix timestamp
       uint endDateClose; // expected format: unix timestamp
       uint ticketPrice; // expected format: whole numbers in ether
       uint ticketMax; // expected format: whole numbers

       bytes32 check;
       uint random;
       
       address winner;
       uint price;
       
       function ciberLottery() {
           owner = msg.sender;
       }

       function startLottery(bytes32 _lotteryTitle, uint _endDateStart, uint _endDateClose, uint _ticketPrice, uint _ticketMax) {

           if (owner == msg.sender) {
               if (!lotteryState) {
                   lotteryState = true;
                   lotteryTitle = _lotteryTitle;
                   endDateStart = _endDateStart;
                   endDateClose = _endDateClose;
                   ticketPrice = _ticketPrice;
                   ticketMax = _ticketMax;
               }
               else {
                   throw;
               }
           }
           else {
               throw;
           }
       }


       function endLottery() {

           // Alleen door lottery owner
           if (msg.sender == owner) {

               if (lotteryState) {

                   // Alleen OP lottery endDate
                   if (now > endDateStart && now < endDateClose) {
                       random = 3;
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

                   } else throw;
               } else throw;
           } else throw;
       }


       function buyIn() payable {

           if (now < endDateStart) {
               
               if (msg.value == ticketPrice) {

                   ticketCounter++;
                   if (ticketCounter <= ticketMax) {
                   
                   tickets[ticketCounter] = Ticket({
                       participant: msg.sender,
                       ticketNumber: ticketCounter
                   });
                   
                   } else {
                       ticketCounter = ticketCounter - 1;
                       throw;
                   }
               }
               else {
                   throw;
               }
           }
           else {
               throw;
           }

       }


       function refund() {

           // Alleen NA endDate
           //if (now > endDateClose) {
           
             for(uint i = 0; i <= ticketCounter; i++) {
               if (tickets[i].participant == msg.sender) {
                tickets[i].participant.send(ticketPrice);
                delete tickets[i];
               }
             }
           //}
       }


   }