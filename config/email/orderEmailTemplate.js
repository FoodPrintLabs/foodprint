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
               <table>
              <tr><td><b>Produce Name </b></td><td >${produceName}</td></tr>
              <tr><td><b>Province </b></td><td >${province}</td></tr>
              <tr><td><b>Quantity </b></td><td >${quantity}</td></tr>
              <tr><td><b>Price </b></td><td >${price}</td></tr>
              <tr><td><b>Time Accepted </b></td><td >${timeStamp}</td></tr>
              <tr><td><b>From </b></td><td >${order_user}</td></tr>
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
       <table>
      <tr><td><b>Produce Name </b></td><td >${produceName}</td></tr>
      <tr><td><b>Province </b></td><td >${province}</td></tr>
      <tr><td><b>Quantity </b></td><td >${quantity}</td></tr>
      <tr><td><b>Price </b></td><td >${price}</td></tr>
      <tr><td><b>Time Accepted </b></td><td >${timeStamp}</td></tr>
      <tr><td><b>From </b></td><td >${order_user}</td></tr>
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
              <table>
              <tr><td><b>Produce Name </b></td><td >${produceName}</td></tr>
              <tr><td ><b>Province </b></td><td >${province}</td></tr>
              <tr><td ><b>Quantity </b></td><td >${quantity}</td></tr>
              <tr><td ><b>Price </b></td><td >${price}</td></tr>
              <tr><td ><b>Time Accepted </b></td><td >${timeStamp}</td></tr>
              <tr><td ><b>From </b></td><td >${current}</td></tr>
              </table>
              <p><b>Order ID</b> - ${logid} </p>
              <p><b>Offer ID</b> - ${original_logid} <b>Time Placed</b> - ${original_timeStamp} </p>
            
      `;
  }
};

module.exports = acceptOrderEmail;
