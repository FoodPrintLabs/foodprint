var moment = require('moment'); //datetime

function producepricepdf(data) {
  let PDFStringdata = '';
  if (data.length) {
    PDFStringdata =
      'PRODUCE PRICE LIST AS OF ' + moment(new Date()).format('YYYY-MM-DD HH:mm:ss') + ' \n\n';
    for (var i = 0; i < data.length; i++) {
      PDFStringdata = PDFStringdata + data[i].produce_name + ': R' + data[i].produce_price + '\n';
    }
  } else {
    PDFStringdata = 'NO PRICE DATA AVAILABLE';
  }
  return PDFStringdata;
}

module.exports = { producepricepdf };
