function storagepdf(data) {
  let result = [];
  if (data.length) {
    for (let i = 0; i < data.length; i++) {
      const item = {
        text:
          'Stoarge ID: ' +
          data[i].storage_logid +
          '; Harvest ID: ' +
          data[i].harvest_logid +
          ';  Supplier Code: ' +
          data[i].harvest_supplierShortcode +
          ';  Produce: ' +
          data[i].supplierproduce +
          ';  Market Name: ' +
          data[i].market_Name +
          ';  Market Quantity: ' +
          data[i].market_quantity +
          ';  Unit of Measure: ' +
          data[i].market_unitOfMeasure +
          ';  Storage Timestamp: ' +
          data[i].market_storageTimeStamp,
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
      text: 'NO STORAGE DATA AVAILABLE',
      url: null,
      align: 'center',
      fillColor: 'red',
    });
  }
  return result;
}

module.exports = { storagepdf };
