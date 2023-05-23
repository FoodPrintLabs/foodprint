const getMimeType = function(buffer){
  const mimeType = buffer.slice(0, 4).toString('hex').toUpperCase();
  let result = {
    contentType: '',
    ext: ''
  };
  switch (mimeType) {
    case '89504E47':
      result= {
        contentType : 'image/png',
        ext: '.png'
      }
      break;
    case '47494638':
      result= {
        contentType : 'image/gif',
        ext: '.gif'
      }
      break;
    case 'FFD8FFE0':
    case 'FFD8FFE1':
    case 'FFD8FFE2':
      result= {
        contentType : 'image/jpeg',
        ext: '.jpg'
      }
      break;
    default:
      break;
  }
  return result;
}

module.exports = { getMimeType };
