pragma solidity ^0.5.0;

contract TheProduct {

    //Creating the reference data for harvest of produce
    struct harvestProduce {
        uint ID;
        string supplierID;
        address payable supplierAddress;
        string productID;
        string photoHash;
        string harvestTimeStamp;
        string harvestCaptureTime;
    }

    //Creating the reference data for storage of produce
    struct storageProduce {
        uint ID;  //this should be the same ID as the harvestProduce ID
        string marketID;
        address payable marketAddress;
        uint quantity;
        string unitOfMeasure;
        string storageTimeStamp;
        string storageCaptureTime;
        string URL;
        string hashID;
    }

//    constructor () public {
//        //registerHarvest(ID, supplierID, supplierAddress, productID, photoHash, harvestTimeStamp, harvestCaptureTime)
//        registerHarvest(001,'OZF',"0x4657892df",'APP','456xf87909', '20190625 14:00', '20190725 15:00');
//    }

    event registeredHarvestEvent (
        uint indexed _harvestID
    );

    event registeredStorageEvent (
        uint indexed _storageID
    );

        //Array of all the produce harvested
    harvestProduce[] public harvestProduceArray;

    //Array of all the produce received at storage
    storageProduce[] public storageProduceArray;

    //Registering a harvest instance
    //Not sure if the input parameters should be read from memory...?
    function registerHarvest(uint _ID, string memory _supplierID, address payable _supplierAddress,  string memory _productID, string memory _photoHash, string memory _harvestTimeStamp, string memory _harvestCaptureTime) public {
        uint index = harvestProduceArray.push(harvestProduce(_ID, _supplierID, _supplierAddress, _productID, _photoHash, _harvestTimeStamp, _harvestCaptureTime));
        // trigger registeredHarvest event
        emit registeredHarvestEvent(index);
       // buyer[index-1].push(msg.sender); - not applicable
    }

    //Registering a storage instance
    //Not sure if the input parameters should be read from memory...?
    function registerStorage(uint _ID, string memory _marketID, address payable _marketAddress, uint _quantity, string memory _unitOfMeasure, string memory _storageTimeStamp,  string memory _storageCaptureTime, string memory _URL, string memory _hashID) public {
        uint index = storageProduceArray.push(storageProduce(_ID, _marketID, _marketAddress, _quantity, _unitOfMeasure, _storageTimeStamp, _storageCaptureTime, _URL, _hashID));
        // trigger registeredStorage event
        emit registeredStorageEvent(index);
    }

    //View harvest
    //This is not working. I think we need to use a loop to return the information per harvest?

    // function viewHarvest() public view returns (harvestProduce[]){
    //     return harvestProduceArray;
    // }

    // //View storage
    // function viewStorage() public view returns (storageProduce[]){
    //     return storageProduceArray;
    // }

    //Checks the number of harvests in the harvest array
    function noHarvests() public view returns (uint){
        return harvestProduceArray.length;
    }

    //Checks the number of produce in the storage array
    function noStorage() public view returns (uint){
        return storageProduceArray.length;
    }
}