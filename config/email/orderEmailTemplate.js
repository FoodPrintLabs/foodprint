const acceptOrderEmail = function (
  produceName,
  quantity,
  order_user,
  current,
  original_logid,
  logid,
  type,
  original_timeStamp,
  timeStamp,
  price,
  province,
  to
) {
  //email for buyer accepting
  if (to == 'Buyer') {
    return `<h3>Offer accepted!</h3>
              <p>Hello ${current}! You accepted an order of ${produceName}. Listed below is your order </p>
               <table style="border: 1px solid black; border-collapse: collapse;">
              <tr><td style="border: 1px solid black; border-collapse: collapse; " ><b>Produce Name </b></td><td style="border: 1px solid black; border-collapse: collapse;" >${produceName}</td></tr>
              <tr><td style="border: 1px solid black; border-collapse: collapse; " ><b>Province </b></td><td style="border: 1px solid black; border-collapse: collapse;" >${province}</td></tr>
              <tr><td style="border: 1px solid black; border-collapse: collapse; " ><b>Quantity </b></td><td style="border: 1px solid black; border-collapse: collapse;" >${quantity}</td></tr>
              <tr><td style="border: 1px solid black; border-collapse: collapse; " ><b>Price </b></td><td style="border: 1px solid black; border-collapse: collapse;" >${price}</td></tr>
              <tr><td style="border: 1px solid black; border-collapse: collapse; " ><b>Time Accepted </b></td><td style="border: 1px solid black; border-collapse: collapse;" >${timeStamp}</td></tr>
              <tr><td style="border: 1px solid black; border-collapse: collapse; " ><b>From </b></td><td style="border: 1px solid black; border-collapse: collapse;" >${order_user}</td></tr>
              </table>
              <p><b>Order ID</b> - ${logid} </p>
              <p><b>Offer ID</b> - ${original_logid} <b>Time Placed</b> - ${original_timeStamp} </p>
              <p><a href="#" >CLICK HERE TO MAKE PAYMENT</a></p>
            
      `;
  }
  //email for seller accepting
  else if (to == 'Seller') {
    return `<h3>Bid accepted!</h3>
      <p>Hello ${current}! You accepted an order of ${produceName}. Listed below is your order </p>
       <table style="border: 1px solid black; border-collapse: collapse;">
      <tr><td style="border: 1px solid black; border-collapse: collapse; " ><b>Produce Name </b></td><td style="border: 1px solid black; border-collapse: collapse;" >${produceName}</td></tr>
      <tr><td style="border: 1px solid black; border-collapse: collapse; " ><b>Province </b></td><td style="border: 1px solid black; border-collapse: collapse;" >${province}</td></tr>
      <tr><td style="border: 1px solid black; border-collapse: collapse; " ><b>Quantity </b></td><td style="border: 1px solid black; border-collapse: collapse;" >${quantity}</td></tr>
      <tr><td style="border: 1px solid black; border-collapse: collapse; " ><b>Price </b></td><td style="border: 1px solid black; border-collapse: collapse;" >${price}</td></tr>
      <tr><td style="border: 1px solid black; border-collapse: collapse; " ><b>Time Accepted </b></td><td style="border: 1px solid black; border-collapse: collapse;" >${timeStamp}</td></tr>
      <tr><td style="border: 1px solid black; border-collapse: collapse; " ><b>From </b></td><td style="border: 1px solid black; border-collapse: collapse;" >${order_user}</td></tr>
      </table>
      <p><b>Order ID</b> - ${logid} </p>
      <p><b>Bid ID</b> - ${original_logid} <b>Time Placed</b> - ${original_timeStamp} </p>
      <p><a href="#" >CLICK HERE TO MAKE PAYMENT</a></p>
  `;
  }
  //General receiving email for your order being accepted
  else if (to == 'Accepted') {
    return `<h3>Order Accepted!</h3>
              <p>Hello ${current}! Your ${type} of ${produceName} was accepted by ${order_user}. Listed below is your accepted order </p>
              <table style="border: 1px solid black; border-collapse: collapse;">
              <tr><td style="border: 1px solid black; border-collapse: collapse; " ><b>Produce Name </b></td><td style="border: 1px solid black; border-collapse: collapse;" >${produceName}</td></tr>
              <tr><td style="border: 1px solid black; border-collapse: collapse;" ><b>Province </b></td><td style="border: 1px solid black; border-collapse: collapse;" >${province}</td></tr>
              <tr><td style="border: 1px solid black; border-collapse: collapse;" ><b>Quantity </b></td><td style="border: 1px solid black; border-collapse: collapse;" >${quantity}</td></tr>
              <tr><td style="border: 1px solid black; border-collapse: collapse;" ><b>Price </b></td><td style="border: 1px solid black; border-collapse: collapse;" >${price}</td></tr>
              <tr><td style="border: 1px solid black; border-collapse: collapse;" ><b>Time Accepted </b></td><td style="border: 1px solid black; border-collapse: collapse;" >${timeStamp}</td></tr>
              <tr><td style="border: 1px solid black; border-collapse: collapse;" ><b>From </b></td><td style="border: 1px solid black; border-collapse: collapse;" >${current}</td></tr>
              </table>
              <p><b>Order ID</b> - ${logid} </p>
              <p><b>Offer ID</b> - ${original_logid} <b>Time Placed</b> - ${original_timeStamp} </p>
            
      `;
  }
};

module.exports = acceptOrderEmail;
