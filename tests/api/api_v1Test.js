process.env.NODE_ENV = 'test';

let initModels = require('../../models/init-models');
let sequelise = require('../../config/db/db_sequelise');
let models = initModels(sequelise);

let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../../server');
let should = chai.should();

chai.use(chaiHttp);

describe('Harvest', function() {

  // empty the harvest table before each test
  beforeEach(function(done) {
    models.FoodprintHarvest.destroy({
      truncate: true,
    });
    done();
  });


  describe('/GET harvest', () => {
    it('should GET all the harvest', (done) => {
      chai.request(server)
        .get('/app/api/v1/harvest')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('array');
          res.body.length.should.be.eql(0);
          done();
        });
    });
  });

  describe('/POST harvest/save', () => {
    it('should POST a harvest entry', (done) => {
      let harvest = {
        harvest_supplierShortcode: 'OZCF',
        harvest_supplierName: 'Oranjezicht City Farm',
        supplierproduce: 'OZCF_Beetroot',
        harvest_produceName: 'Beetroot',
        harvest_supplierAddress: '37 Test Street, Goodwood',
        harvest_farmerName: 'Oranjezicht City Farm',
        harvest_year_established: '',
        harvest_covid19_response: '',
        harvest_timestamp: '01/17/2022 9:25 AM',
        harvest_capturetime: '01/17/2022 9:25 AM',
        harvest_description: 'Good quality Beetroot',
        harvest_geolocation: 'Cape Town',
        harvest_quantity: '50',
        harvest_unitofmeasure: 'kilogram',
        harvest_blockchainhashid: '-',
        harvest_blockchainhashdata: '-',
        harvest_bool_added_to_blockchain: 'false',
        harvest_added_to_blockchain_date: '',
        harvest_added_to_blockchain_by: '-',
        harvest_blockchain_uuid: '-',
        harvest_user: 'superuserjulz@example.com',
        logdatetime: '01/23/2022 9:25 AM',
        lastmodifieddatetime: '01/23/2022 9:25 AM',
      };

      chai.request(server)
        .post('/app/api/v1/harvest/save')
        .send(harvest)
        .end((err, res) => {
          res.should.have.status(201);
          res.body.should.be.a('object');
          res.body.should.have.property('message').eql('Harvest created successfully');
          res.body.should.have.property('harvest_logid');
          done();
        });
    });
  });

  describe('/POST harvest/update', () => {
    it('should UPDATE a harvest entry', (done) => {
      let harvest = {
        harvest_supplierShortcode: 'OZCF',
        harvest_supplierName: 'Oranjezicht City Farm',
        supplierproduce: 'OZCF_Beetroot',
        harvest_produceName: 'Beetroot',
        harvest_supplierAddress: '37 Test Street, Goodwood',
        harvest_farmerName: 'Oranjezicht City Farm',
        harvest_year_established: '',
        harvest_covid19_response: '',
        harvest_timestamp: '01/17/2022 9:25 AM',
        harvest_capturetime: '01/17/2022 9:25 AM',
        harvest_description: 'Good quality Beetroot',
        harvest_geolocation: 'Cape Town',
        harvest_quantity: '50',
        harvest_unitofmeasure: 'kilogram',
        harvest_blockchainhashid: '-',
        harvest_blockchainhashdata: '-',
        harvest_bool_added_to_blockchain: 'false',
        harvest_added_to_blockchain_date: '',
        harvest_added_to_blockchain_by: '-',
        harvest_blockchain_uuid: '-',
        harvest_user: 'superuserjulz@example.com',
        logdatetime: '01/23/2022 9:25 AM',
        lastmodifieddatetime: '01/23/2022 9:25 AM',
      };

      chai.request(server)
        .post('/app/api/v1/harvest/save')
        .send(harvest)
        .end((err, res) => {
          res.should.have.status(201);
          res.body.should.be.a('object');
          res.body.should.have.property('message').eql('Harvest created successfully');
          res.body.should.have.property('harvest_logid');

          harvest['harvest_logid'] = res.body.harvest_logid;
          harvest['harvest_quantity'] = '70';
          chai.request(server)
            .post('/app/api/v1/harvest/update')
            .send(harvest)
            .end((err, res) => {
              res.should.have.status(200);
              res.body.should.be.a('object');
              res.body.should.have.property('message').eql('Harvest entry updated successfully');
              res.body.should.have.property('harvest_logid').eql(res.body.harvest_logid);
              done();
            });
        });
    });
  });

  describe('/POST harvest/delete', () => {
    it('should DELETE a harvest entry', (done) => {
      let harvest = {
        harvest_supplierShortcode: 'OZCF',
        harvest_supplierName: 'Oranjezicht City Farm',
        supplierproduce: 'OZCF_Beetroot',
        harvest_produceName: 'Beetroot',
        harvest_supplierAddress: '37 Test Street, Goodwood',
        harvest_farmerName: 'Oranjezicht City Farm',
        harvest_year_established: '',
        harvest_covid19_response: '',
        harvest_timestamp: '01/17/2022 9:25 AM',
        harvest_capturetime: '01/17/2022 9:25 AM',
        harvest_description: 'Good quality Beetroot',
        harvest_geolocation: 'Cape Town',
        harvest_quantity: '50',
        harvest_unitofmeasure: 'kilogram',
        harvest_blockchainhashid: '-',
        harvest_blockchainhashdata: '-',
        harvest_bool_added_to_blockchain: 'false',
        harvest_added_to_blockchain_date: '',
        harvest_added_to_blockchain_by: '-',
        harvest_blockchain_uuid: '-',
        harvest_user: 'superuserjulz@example.com',
        logdatetime: '01/23/2022 9:25 AM',
        lastmodifieddatetime: '01/23/2022 9:25 AM',
      };

      chai.request(server)
        .post('/app/api/v1/harvest/save')
        .send(harvest)
        .end((err, res) => {
          res.should.have.status(201);
          res.body.should.be.a('object');
          res.body.should.have.property('message').eql('Harvest created successfully');
          res.body.should.have.property('harvest_logid');

          let data = {
            harvest_logid: res.body.harvest_logid,
          };

          chai.request(server)
            .post('/app/api/v1/harvest/delete')
            .send(data)
            .end((err, res) => {
              res.should.have.status(200);
              res.body.should.be.a('object');
              res.body.should.have.property('message').eql('Harvest entry deleted successfully!');
              res.body.should.have.property('harvest_logid').eql(res.body.harvest_logid);
              done();
            });
        });
    });
  });

  describe('/POST harvest/save/whatsapp', () => {
    it('should POST a harvest entry', (done) => {
      let harvest = {
        harvest_farmerName: 'Bergsoom Farm',
        harvest_produceName: 'Lemon',
        harvest_quantity: '50',
        harvest_date: '2021-11-19',
        harvest_unitOfMeasure: 'kilogram',
        email: 'superuserjulz@example.com',
      };

      chai.request(server)
        .post('/app/api/v1/harvest/save/whatsapp')
        .send(harvest)
        .end((err, res) => {
          res.should.have.status(201);
          res.body.should.be.a('object');
          res.body.should.have.property('message').eql('Harvest created successfully');
          res.body.should.have.property('harvest_logid');
          done();
        });
    });
  });

  describe('/POST harvest/whatsapp', () => {
    it('should return a harvest entry for the supplied harvest id', (done) => {

      let harvest = {
        harvest_farmerName: 'Bergsoom Farm',
        harvest_produceName: 'Lemon',
        harvest_quantity: '50',
        harvest_date: '2021-11-19',
        harvest_unitOfMeasure: 'kilogram',
        email: 'superuserjulz@example.com',
      };

      chai.request(server)
        .post('/app/api/v1/harvest/save/whatsapp')
        .send(harvest)
        .end((err, res) => {
          res.should.have.status(201);
          res.body.should.be.a('object');
          res.body.should.have.property('message').eql('Harvest created successfully');
          res.body.should.have.property('harvest_logid');

          let data = {
            harvest_logid: res.body.harvest_logid,
          };

          chai.request(server)
            .post('/app/api/v1/harvest/whatsapp')
            .send(data)
            .end((err, res) => {
              res.should.have.status(200);
              res.body.should.be.a('array');
              res.body.length.should.be.eql(1);
              done();
            });
        });
    });
  });


});

describe('Storage', function() {
  // empty the storage table before each test
  beforeEach(function(done) {
    models.FoodprintStorage.destroy({
      truncate: true,
    });
    models.FoodprintHarvest.destroy({
      truncate: true,
    });
    done();
  });

  describe('/GET storage', () => {
    it('should GET all the storage entries', (done) => {
      chai.request(server)
        .get('/app/api/v1/storage')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('array');
          res.body.length.should.be.eql(0);
          done();
        });
    });
  });

  describe('/POST storage/save', () => {
    it('should POST a storage entry', (done) => {
      let harvest = {
        harvest_supplierShortcode: 'OZCF',
        harvest_supplierName: 'Oranjezicht City Farm',
        supplierproduce: 'OZCF_Beetroot',
        harvest_produceName: 'Beetroot',
        harvest_supplierAddress: '37 Test Street, Goodwood',
        harvest_farmerName: 'Oranjezicht City Farm',
        harvest_year_established: '',
        harvest_covid19_response: '',
        harvest_timestamp: '01/17/2022 9:25 AM',
        harvest_capturetime: '01/17/2022 9:25 AM',
        harvest_description: 'Good quality Beetroot',
        harvest_geolocation: 'Cape Town',
        harvest_quantity: '50',
        harvest_unitofmeasure: 'kilogram',
        harvest_blockchainhashid: '-',
        harvest_blockchainhashdata: '-',
        harvest_bool_added_to_blockchain: 'false',
        harvest_added_to_blockchain_date: '',
        harvest_added_to_blockchain_by: '-',
        harvest_blockchain_uuid: '-',
        harvest_user: 'superuserjulz@example.com',
        logdatetime: '01/23/2022 9:25 AM',
        lastmodifieddatetime: '01/23/2022 9:25 AM',
      };

      chai.request(server)
        .post('/app/api/v1/harvest/save')
        .send(harvest)
        .end((err, res) => {
          res.should.have.status(201);
          res.body.should.be.a('object');
          res.body.should.have.property('message').eql('Harvest created successfully');
          res.body.should.have.property('harvest_logid');

          let storage = {
            harvest_logid: res.body.harvest_logid,
            harvest_supplierShortcode: 'OZCF',
            supplierproduce: 'OZCF_Beetroot',
            market_Shortcode: 'OZCFM',
            market_Name: 'Oranjezicht City Farm Market',
            market_Address: 'OZCFM - Granger Bay Blvd, Victoria & Alfred Waterfront, Cape Town, 8051',
            market_quantity: '50',
            market_unitOfMeasure: 'kilogram',
            market_storageTimeStamp: 'Sun Jan 23 2022 09:24:00 GMT 0200 (Central Africa Time)',
            market_storageCaptureTime: 'Sun Jan 23 2022 09:24:46 GMT 0200 (Central Africa Time)',
            market_URL: 'testm.com',
            storage_BlockchainHashID: '-',
            storage_BlockchainHashData: '-',
            storage_Description: 'good quality',
            storage_bool_added_to_blockchain: 'false',
            storage_added_to_blockchain_by: '-',
            storage_blockchain_uuid: '-',
            storage_user: 'superuserjulz@example.com',
            logdatetime: 'Sun Jan 23 2022 09:24:46 GMT 0200 (Central Africa Time)',
            lastmodifieddatetime: 'Sun Jan 23 2022 09:24:46 GMT 0200 (Central Africa Time)',
          };

          chai.request(server)
            .post('/app/api/v1/storage/save')
            .send(storage)
            .end((err, res) => {
              res.should.have.status(201);
              res.body.should.be.a('object');
              res.body.should.have.property('message').eql('New Storage entry added successfully');
              res.body.should.have.property('storage_logid');
              done();
            });

        });
    });
  });

  describe('/POST storage/update', () => {
    it('should UPDATE a storage entry', (done) => {
      let harvest = {
        harvest_supplierShortcode: 'OZCF',
        harvest_supplierName: 'Oranjezicht City Farm',
        supplierproduce: 'OZCF_Beetroot',
        harvest_produceName: 'Beetroot',
        harvest_supplierAddress: '37 Test Street, Goodwood',
        harvest_farmerName: 'Oranjezicht City Farm',
        harvest_year_established: '',
        harvest_covid19_response: '',
        harvest_timestamp: '01/17/2022 9:25 AM',
        harvest_capturetime: '01/17/2022 9:25 AM',
        harvest_description: 'Good quality Beetroot',
        harvest_geolocation: 'Cape Town',
        harvest_quantity: '50',
        harvest_unitofmeasure: 'kilogram',
        harvest_blockchainhashid: '-',
        harvest_blockchainhashdata: '-',
        harvest_bool_added_to_blockchain: 'false',
        harvest_added_to_blockchain_date: '',
        harvest_added_to_blockchain_by: '-',
        harvest_blockchain_uuid: '-',
        harvest_user: 'superuserjulz@example.com',
        logdatetime: '01/23/2022 9:25 AM',
        lastmodifieddatetime: '01/23/2022 9:25 AM',
      };

      chai.request(server)
        .post('/app/api/v1/harvest/save')
        .send(harvest)
        .end((err, res) => {
          res.should.have.status(201);
          res.body.should.be.a('object');
          res.body.should.have.property('message').eql('Harvest created successfully');
          res.body.should.have.property('harvest_logid');

          let storage = {
            harvest_logid: res.body.harvest_logid,
            harvest_supplierShortcode: 'OZCF',
            supplierproduce: 'OZCF_Beetroot',
            market_Shortcode: 'OZCFM',
            market_Name: 'Oranjezicht City Farm Market',
            market_Address: 'OZCFM - Granger Bay Blvd, Victoria & Alfred Waterfront, Cape Town, 8051',
            market_quantity: '50',
            market_unitOfMeasure: 'kilogram',
            market_storageTimeStamp: 'Sun Jan 23 2022 09:24:00 GMT 0200 (Central Africa Time)',
            market_storageCaptureTime: 'Sun Jan 23 2022 09:24:46 GMT 0200 (Central Africa Time)',
            market_URL: 'testm.com',
            storage_BlockchainHashID: '-',
            storage_BlockchainHashData: '-',
            storage_Description: 'good quality',
            storage_bool_added_to_blockchain: 'false',
            storage_added_to_blockchain_by: '-',
            storage_blockchain_uuid: '-',
            storage_user: 'superuserjulz@example.com',
            logdatetime: 'Sun Jan 23 2022 09:24:46 GMT 0200 (Central Africa Time)',
            lastmodifieddatetime: 'Sun Jan 23 2022 09:24:46 GMT 0200 (Central Africa Time)',
          };

          chai.request(server)
            .post('/app/api/v1/storage/save')
            .send(storage)
            .end((err, res) => {
              res.should.have.status(201);
              res.body.should.be.a('object');
              res.body.should.have.property('message').eql('New Storage entry added successfully');
              res.body.should.have.property('storage_logid');
              // done();

              storage['storage_logid'] = res.body.storage_logid;
              storage['market_quantity'] = '40';
              chai.request(server)
                .post('/app/api/v1/storage/update')
                .send(storage)
                .end((err, res) => {
                  res.should.have.status(200);
                  res.body.should.be.a('object');
                  res.body.should.have.property('message').eql('Storage entry updated successfully');
                  res.body.should.have.property('storage_logid').eql(res.body.storage_logid);
                  done();
                });
            });
        });
    });
  });

  describe('/POST storage/delete', () => {
    it('should DELETE a storage entry', (done) => {
      let harvest = {
        harvest_supplierShortcode: 'OZCF',
        harvest_supplierName: 'Oranjezicht City Farm',
        supplierproduce: 'OZCF_Beetroot',
        harvest_produceName: 'Beetroot',
        harvest_supplierAddress: '37 Test Street, Goodwood',
        harvest_farmerName: 'Oranjezicht City Farm',
        harvest_year_established: '',
        harvest_covid19_response: '',
        harvest_timestamp: '01/17/2022 9:25 AM',
        harvest_capturetime: '01/17/2022 9:25 AM',
        harvest_description: 'Good quality Beetroot',
        harvest_geolocation: 'Cape Town',
        harvest_quantity: '50',
        harvest_unitofmeasure: 'kilogram',
        harvest_blockchainhashid: '-',
        harvest_blockchainhashdata: '-',
        harvest_bool_added_to_blockchain: 'false',
        harvest_added_to_blockchain_date: '',
        harvest_added_to_blockchain_by: '-',
        harvest_blockchain_uuid: '-',
        harvest_user: 'superuserjulz@example.com',
        logdatetime: '01/23/2022 9:25 AM',
        lastmodifieddatetime: '01/23/2022 9:25 AM',
      };

      chai.request(server)
        .post('/app/api/v1/harvest/save')
        .send(harvest)
        .end((err, res) => {
          res.should.have.status(201);
          res.body.should.be.a('object');
          res.body.should.have.property('message').eql('Harvest created successfully');
          res.body.should.have.property('harvest_logid');

          let storage = {
            harvest_logid: res.body.harvest_logid,
            harvest_supplierShortcode: 'OZCF',
            supplierproduce: 'OZCF_Beetroot',
            market_Shortcode: 'OZCFM',
            market_Name: 'Oranjezicht City Farm Market',
            market_Address: 'OZCFM - Granger Bay Blvd, Victoria & Alfred Waterfront, Cape Town, 8051',
            market_quantity: '50',
            market_unitOfMeasure: 'kilogram',
            market_storageTimeStamp: 'Sun Jan 23 2022 09:24:00 GMT 0200 (Central Africa Time)',
            market_storageCaptureTime: 'Sun Jan 23 2022 09:24:46 GMT 0200 (Central Africa Time)',
            market_URL: 'testm.com',
            storage_BlockchainHashID: '-',
            storage_BlockchainHashData: '-',
            storage_Description: 'good quality',
            storage_bool_added_to_blockchain: 'false',
            storage_added_to_blockchain_by: '-',
            storage_blockchain_uuid: '-',
            storage_user: 'superuserjulz@example.com',
            logdatetime: 'Sun Jan 23 2022 09:24:46 GMT 0200 (Central Africa Time)',
            lastmodifieddatetime: 'Sun Jan 23 2022 09:24:46 GMT 0200 (Central Africa Time)',
          };

          chai.request(server)
            .post('/app/api/v1/storage/save')
            .send(storage)
            .end((err, res) => {
              res.should.have.status(201);
              res.body.should.be.a('object');
              res.body.should.have.property('message').eql('New Storage entry added successfully');
              res.body.should.have.property('storage_logid');
              // done();

              let data = {
                storage_logid: res.body.storage_logid,
              };

              chai.request(server)
                .post('/app/api/v1/storage/delete')
                .send(data)
                .end((err, res) => {
                  res.should.have.status(200);
                  res.body.should.be.a('object');
                  res.body.should.have.property('message').eql('Storage entry deleted successfully');
                  res.body.should.have.property('storage_logid').eql(res.body.storage_logid);
                  done();
                });
            });
        });
    });
  });

  describe('/POST storage/save/whatsapp', () => {
    it('should POST a storage entry', (done) => {
      let storage = {
        harvest_supplierShortcode: 'OZCF',
        supplierproduce: 'OZCF_Beetroot',
        market_quantity: '50',
        storage_date: '2021-11-19',
        market_unitOfMeasure: 'kilogram',
        email: 'superuserjulz@example.com',
      };

      chai.request(server)
        .post('/app/api/v1/storage/save/whatsapp')
        .send(storage)
        .end((err, res) => {
          res.should.have.status(201);
          res.body.should.be.a('object');
          res.body.should.have.property('message').eql('Storage entry created successfully');
          res.body.should.have.property('storage_logid');
          done();
        });
    });
  });

  describe('/POST storage/whatsapp', () => {
    it('should return a storage entry for the supplied id', (done) => {
      let storage = {
        harvest_supplierShortcode: 'OZCF',
        supplierproduce: 'OZCF_Beetroot',
        market_quantity: '50',
        storage_date: '2021-11-19',
        market_unitOfMeasure: 'kilogram',
        email: 'superuserjulz@example.com',
      };

      chai.request(server)
        .post('/app/api/v1/storage/save/whatsapp')
        .send(storage)
        .end((err, res) => {
          res.should.have.status(201);
          res.body.should.be.a('object');
          res.body.should.have.property('message').eql('Storage entry created successfully');
          res.body.should.have.property('storage_logid');

          let data = {
            storage_logid: res.body.storage_logid,
          };

          chai.request(server)
            .post('/app/api/v1/storage/whatsapp')
            .send(data)
            .end((err, res) => {
              res.should.have.status(200);
              res.body.should.be.a('array');
              res.body.length.should.be.eql(1);
              done();
            });
        });
    });
  });

});

describe('QR Count', function() {
  // empty the qr count table before each test
  beforeEach(function(done) {
    models.FoodprintQrcount.destroy({
      truncate: true,
    });
    done();
  });

  describe('/GET qrcount/scans/:startDate', () => {
    it('should GET all the qrcount scans', (done) => {
      chai.request(server)
        .get('/app/api/v1/qrcount/scans/2021-11-24')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('array');
          res.body.length.should.be.eql(0);
          done();
        });
    });
  });
});
