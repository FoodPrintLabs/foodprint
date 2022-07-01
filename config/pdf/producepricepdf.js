var moment = require('moment'); //datetime

function producepricepdf(data) {
  let PDFStringdata = '';
  if (data.length) {
    for (var i = 0; i < data.length; i++) {
      PDFStringdata =
        PDFStringdata +
        data[i].produce_name +
        ': R' +
        data[i].produce_price +
        ' Updated: ' +
        data[i].produce_date +
        '\n';
    }
  } else {
    PDFStringdata = 'NO PRICE DATA AVAILABLE';
  }
  return PDFStringdata;
}

module.exports = { producepricepdf };
