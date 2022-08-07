function harvestpdf(data) {
  let result = [];
  if (data.length) {
    for (let i = 0; i < data.length; i++) {
      const item = {
        text:
          'ID: ' +
          data[i].harvest_logid +
          ';  Produce: ' +
          data[i].harvest_produceName +
          ';  Quantity: ' +
          data[i].harvest_quantity +
          ';  Unit of Measure: ' +
          data[i].harvest_unitOfMeasure +
          ';  Harvest Timestamp: ' +
          data[i].harvest_TimeStamp +
          ';  Farmer Name: ' +
          data[i].harvest_farmerName,
        url: {
          title:
            'Blockchain URL: ' +
            (data[i].blockchain_explorer_url ? data[i].blockchain_explorer_url : ''),
          link: data[i].blockchain_explorer_url ? data[i].blockchain_explorer_url : '',
          fillColor: 'blue',
        },
        align: '',
        fillColor: 'black',
      };
      result.push(item);
    }
  } else {
    result.push({
      text: 'NO HARVEST DATA AVAILABLE',
      url: null,
      align: 'center',
      fillColor: 'red',
    });
  }
  return result;
}

module.exports = { harvestpdf };
