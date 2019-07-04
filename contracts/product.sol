pragma solidity ^0.5.0;

contract TheProduct {

    //Array of all the produce harvested
    harvestProduce[] public harvestProduceArray;

    //Array of all the produce received at storage
    storageProduce[] public storageProduceArray;

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

    event registeredHarvestEvent (
        uint indexed _harvestID
    );

    //Registering a harvest instance
    //Not sure if the input parameters should be read from memory...?
    function registerHarvest(uint _ID, string memory _supplierID, address _supplierAddress,  string memory _productID, string memory _photoHash,
    string memory _harvestTimeStamp, string memory _harvestCaptureTime) public {
        uint index = harvestProduceArray.push(harvestProduce(_ID, _supplierID, _supplierAddress, _productID, _photoHash,
            _harvestTimeStamp, _harvestCaptureTime));
        // trigger registeredSong event
        emit registeredHarvestEvent(index);
       // buyer[index-1].push(msg.sender); - not applicable
    }

    //Registering a storage instance
    //Not sure if the input parameters should be read from memory...?
    function registerStorage(uint _ID, string memory _marketID, address _marketAddress, uint _quantity, string memory _unitOfMeasure, string memory _storageTimeStamp, string memory _storageCaptureTime, string memory _URL, string memory _hashID) public {
        uint index = songList.push(song(_ID, _marketID, _marketAddress, _quantity, _unitOfMeasure, _storageTimeStamp, _storageCaptureTime,
            _URL, _hashID));
       //buyer[index-1].push(msg.sender); - not applicable
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

    //Mapping the array index of all the buyers of a song. The uint is the song index in the song array
    //mapping (uint => address[]) public buyer;

    // //Checks to see if any of the songs have already ben bought by an address
    // function buyerCheck (uint songIndex) external returns (bool){
    //     bool isBuyer = false;
    //     for(uint i = 0;i < buyer[songIndex].length; i++){
    //         if (msg.sender == buyer[songIndex][i]){
    //             isBuyer = true;
    //             return isBuyer;
    //         }else{
    //             return false;
    //         }
    //     }
    // }
    // //Function to buy song: Checks the value of message against the price, adds buyer to the buyers array and transfers funds to the owner
    //  function buySong(uint256 _songId) public payable returns (bool){
    //     song memory selectedSong = songList[_songId];
    //     require(selectedSong.price == msg.value);
    //     buyer[_songId].push(msg.sender);
    //     selectedSong.owner.transfer(msg.value);
    // }
}