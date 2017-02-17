   pragma solidity ^ 0.4.0;
   
   import "DateTime.sol";

   contract ciberLottery {

       address owner;

       bool lotteryState;

       struct Ticket {
           address participant;
           uint ticketNumber;
       }

       bytes32 lotteryTitle;
       uint endDate; // expected format: ddmmyyyy
       uint ticketPrice; // expected format: whole numbers in ether
       uint ticketMax; // expected format: whole numbers
       uint payout1; // expected format: full percentage points
       uint payout2;
       uint payout3;
       
       uint8 dayss;
       uint monthss;
       uint yearss;
       uint currentDate;

       function ciberLottery() {
           owner = msg.sender;
       }
       
       function displayDate() {
           currentDate = now;
       }

       function startLottery(bytes32 _lotteryTitle, uint _endDate, uint _ticketPrice, uint _ticketMax, uint _payout1, uint _payout2, uint _payout3) {

           if (owner == msg.sender) {
               if (!lotteryState) {
                   lotteryState = true;
                   lotteryTitle = _lotteryTitle;
                   endDate = _endDate;
                   ticketPrice = _ticketPrice;
                   ticketMax = _ticketMax;
                   payout1 = _payout1;
                   payout2 = _payout2;
                   payout3 = _payout3;
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
                   if (now == endDate) {
                       
                       // Stop lottery
                       lotteryState = false;
                       
                       // Payout ether
                       
                       // Destroy functie

                   }
               }
           }
       }


       function buyIn() {

           DateTime date = new DateTime();  // Nieuwe instance van DateTime.sol
           
           dayss = date.getDay(now);
           monthss = date.getMonth(now);
           yearss = date.getYear(now);
           
           currentDate = dayss + monthss + yearss;
           
           if (now < endDate) {

           }

       }


       function refund() {

           // Alleen NA endDate
           if (now > endDate) {

           }
       }


   }