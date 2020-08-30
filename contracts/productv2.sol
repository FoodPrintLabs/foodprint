pragma solidity ^0.5.0;

//OpenZeppelin Contract modules for math operations, simple authorization and access control mechanisms.
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

/** @title TheProduct - FoodPrint Produce Smart Contract. */
contract TheProductV2 is Ownable {
    /*
    NB:
        - "internal" functions can only be called from the contract itself (or from derived contracts).

        - v0.5 breaking changes list that:
            - Explicit data location for all variables of struct, array or mapping types is now mandatory.
            - This is also applied to function parameters and return variables.

        Recall that when a function's visibility is external, only external contracts can call that function.
        When such an external call happens, the data of that call is stored in calldata. Reading from calldata is cheap
        as compared to reading from memory which uses more data.

        External functions = calldata, public functions = memory
        Explicit data location for all variables of struct, array or mapping types is now mandatory. This is also applied to function parameters and return variables.
    */

    // Include the SafeMath library inside this contract
    using SafeMath for uint;

    address payable contractOwner;
    bool private stopped; // for use in circuit breaker

    /*
        Struct for a single produce harvest operation which corresponds to an entry in the FoodPrint Harvest Logbook. A struct in solidity is simply a loose bag of variables.
    */
    struct produceHarvestSubmission {
        string harvestID;
        string supplierproduceID;
        string photoHash;
        string geolocation;
        string harvestTimeStamp;
        //string harvestDetail; //growingCondtions, harvestTableName, harvestQuantity, harvestUser
        uint256 BlockNumber;  // block number of Harvest submission
        uint IsSet; // integer indication of whether Harvest Submission exists i.e. default is zero so if > 0 it exists
    }

    struct produceHarvestSubmissionDetail {
        string harvestID;
        string growingCondtions;
        string harvestDescription;
        string harvestTableName;
        string harvestQuantity; //includes Harvest UoM
        string harvestUser;
        uint256 BlockNumber;  // block number of Harvest submission
    }

    /*
        State variable that stores a `produceHarvestSubmission` struct for each Harvest entry. The key is a string i.e. harvest_logid e.g. 93716116-4207-4b1e-a891-01731642fd3a and the value is a produceHarvestSubmission struct.
        Recall that a mapping is essentially a key-value store for storing and looking up data, it allows random access in a single step.
    */
    mapping(string => produceHarvestSubmission) public harvestMap;

    /*
        State variable that stores a `produceHarvestSubmissionDetail` struct for each Harvest entry.
    */
    mapping(string => produceHarvestSubmissionDetail) public harvestDetailMap;

    /*
       State variable that stores the ETH wallet address corresponding to each harvest entry submission i.e. AuditTrail purposes.
    */
    mapping(string => address) public harvestAddressMap;

    /*
        A dynamically-sized string array containing Harvest Log IDs. This will be used for length tracking.
        Array of harvestLogIDs made public because of length method.
    */
    string[] public harvestLogIDs;

    /** 
     * @dev Fired on submission of a Harvest entry.
     */
    event registeredHarvestEvent (
        uint _harvestLogIDIndex,
        string _harvestID,
        uint _harvestSubmissionBlockNumber
    );

     /** 
     * @dev Fired on submission of a Harvest entry.
     */
    event registeredHarvestDetailEvent (
        string _harvestID,
        uint _harvestSubmissionBlockNumber
    );


    //Creating the reference data for storage of produce
    /*
        Struct for a single produce storage operation (i.e. handover from farmer to market) which corresponds to an entry in the  FoodPrint Storage Logbook (Handover Logbook).
        Each storage operation has an associated harvest operation.
    */
    struct produceStorageSubmission {
        string storageID;  
        string harvestID;  //this should be the same ID as the corresponding produceHarvestSubmission ID
        string otherID; //includes supplierproduceID and marketID
        //string marketID;
        string storageTimeStamp;
        string storageDetail; //storageDescription, storageTableName, storageUser and storageQuantity which includes storage UoM
        uint256 BlockNumber; //block number of storage submission. previously hash
        uint IsSet; // integer indication of whether storage Submission exists i.e. default is zero so if > 0 it exists
    }

    /*
        State variable that stores a `produceStorageSubmission` struct for each Storage entry.
    */
    mapping(string => produceStorageSubmission) public storageMap;

    /*
        State variable that stores a `produceStorageSubmissionDetail` struct for each Storage entry.
    */
   // mapping(string => produceStorageSubmissionDetail) public storageDetailMap;

    /*
       State variable that stores the ETH wallet address corresponding to each harvest entry submission i.e. for AuditTrail purposes.
    */
    mapping(string => address) public storageAddressMap;

    /*
        A dynamically-sized string array containing Storage Log IDs. This will be used for length tracking.
    */
    string[] public storageLogIDs;

    /** 
     * @dev Fired on submission of a Storage entry.
     */
    event registeredStorageEvent (
        uint _storageLogIDIndex,
        string _storageID,
        uint _storageSubmissionBlockNumber
    );

   /**
     * @dev Constructor.
     */
    constructor () public {
        contractOwner = msg.sender;
        stopped = false;
    }

    /*
        @dev Circuit breaker switch
    */
    function toggleContractActive() onlyOwner public returns (bool) {
        stopped = !stopped;
        return stopped;
    }

    /*
        @dev Circuit breaker modifier. Throws if contract is stopped.
    */
    modifier stopInEmergency() {
        require(!stopped, "Circuit Breaker: FoodPrint Contract is currently stopped.");
        _;
    }

    /*
        @dev Circuit breaker modifier. Throws if contract is not stopped.
    */
    modifier onlyInEmergency() {
        require(stopped, "Circuit Breaker: FoodPrint Contract is not currently stopped.");
        _;
    }

    /**
     * @dev Register a Harvest submission - it should add the Harvest submission to the array of Harvest submissions i.e. harvestMap.
     * @param _supplierproduceID Unique ID (per supplier-produce combination) e.g. OZCF_Apples
     * @param _photoHash Hash of photo BLOB stored in relational database e.g. abc01...
     * @param _geolocation Geographical location of where the produce is harvested e.g. -33.961059,18.4110411
     * @param _harvestTimeStamp Date and time at which produce is harvested e.g. 20190620 16:10:55
     * @param _harvestID Unique ID for supplier-produce and harvest combination e.g. 1b26557b-20f3-4ea2-81d2-e54c5a9a40f7
     */
    function registerHarvestSubmission(string calldata _supplierproduceID, 
                                       string calldata _photoHash,  string calldata _geolocation, 
                                       string calldata _harvestTimeStamp, 
                                       string calldata _harvestID)
                                        stopInEmergency external returns(uint, uint) {
        /*
            Recall that Public functions need to write all of the arguments to memory because public functions
            may be called internally, which is an entirely different process from external calls. Thus, when the
            compiler generates the code for an internal function, that function expects its arguments to be located in memory.
        */

        require(this.checkHarvestSubmission(_harvestID) == false, "Error: Cannot add a previously submitted Harvest ID/Entry.");

        uint256 harvestSubmissionBlockNumber = block.number;
        // string harvestSubmissionBlockHash = block.blockhash(harvestSubmissionBlockNumber - 1); // hash of the given block - only works for the 256 most recent blocks excluding current

        uint256 IsSet = 1;

        // Creates mapping between a harvestID and HarvestS ubmission struct and save in storage.
        harvestMap[_harvestID] = produceHarvestSubmission(_harvestID, _supplierproduceID,  _photoHash, _geolocation, 
                                                           _harvestTimeStamp, harvestSubmissionBlockNumber, IsSet);

         // Creates mapping between a Harvest ID and Harvest Entry submitter address then save in storage.
        harvestAddressMap[_harvestID] = msg.sender;

        //add the Harvest ID to the array for length tracking
        uint harvestLogIDIndex = harvestLogIDs.push(_harvestID);
        harvestLogIDIndex = harvestLogIDIndex.sub(1); //subtract 1 if you wish to access using array index

        // trigger event for Harvest registration
        emit registeredHarvestEvent(harvestLogIDIndex, _harvestID, harvestSubmissionBlockNumber);

        return (harvestLogIDIndex, harvestSubmissionBlockNumber);
    }

    /**
     * @dev Register a Harvest submission - it should add the Harvest submission to the array of Harvest submissions i.e. harvestMap.
     * @param _growingCondtions Claims related to growing conditions e.g. Organic vs Conventional i.e. harvest_description_json e.g. 'organic,pesticide free'
     * @param _harvestDescription Harvest specific comment e.g. Baby Marrows with soft skin and buttery flesh.
     * @param _harvestTableName Table name for harvest entry in relational database e.g. foodprint_harvest
     * @param _harvestQuantity Quantity of harvested produce e.g. 10, includes  unit of measure e.g. bunches/KGs/none
     * @param _harvestUser User who logged harvest e.g. useremail@xyz.com
     * @param _harvestID Unique ID for supplier-produce and harvest combination e.g. 1b26557b-20f3-4ea2-81d2-e54c5a9a40f7
     */
    function registerHarvestSubmissionDetails(string calldata _growingCondtions, string calldata _harvestDescription,
                                       string calldata _harvestTableName, string calldata _harvestQuantity, string calldata _harvestUser, 
                                        string calldata _harvestID)
                                        stopInEmergency external returns(uint) {
        
        uint256 harvestSubmissionBlockNumber = block.number;
        // string harvestSubmissionBlockHash = block.blockhash(harvestSubmissionBlockNumber - 1); // hash of the given block - only works for the 256 most recent blocks excluding current

        // Creates mapping between a harvestID and HarvestS ubmission struct and save in storage.
        harvestDetailMap[_harvestID] = produceHarvestSubmissionDetail(_harvestID, _growingCondtions, _harvestDescription, _harvestTableName, 
                                        _harvestQuantity,  _harvestUser, harvestSubmissionBlockNumber);
        
         // trigger event for Harvest registration
        emit registeredHarvestDetailEvent(_harvestID, harvestSubmissionBlockNumber);

        return (harvestSubmissionBlockNumber);
    }

    /**
     * @dev Returns the number of Harvest Submissions tracked on Blockchain.
     * Can only be called by the current owner.
     */
    function getHarvestSubmissionsCount() external onlyOwner stopInEmergency view returns(uint) {
        return harvestLogIDs.length;
    }

    /**
     * @dev Returns an address used for a submission.
     * @param harvest_id Harvest ID which is key in the harvestMap map
     * Can only be called by the current owner.
     */
    function getHarvestSubmitterAddress(string calldata harvest_id) external onlyOwner stopInEmergency view returns(address) {
       return harvestAddressMap[harvest_id];
    }

    /**
     * @dev Returns a harvest ID from harvestLogIDs array using array index.
     * @param arrayIndex Array index of harvestLogIDs
     */
    function getHarvestLogIDByIndex(uint256 arrayIndex) external stopInEmergency view returns(string memory) {
       return harvestLogIDs[arrayIndex];
    }

    /**
     * @dev Returns the harvest submission if the Harvest ID  exists in the harvestMap.
     * @param harvest_id Harvest ID which is key in the harvestMap.
     * Data location must be "memory" for return parameter in function
     */
    function getHarvestSubmission(string calldata harvest_id) external stopInEmergency view returns (string memory, string memory,  
                                                                                                    string memory, uint, uint) {
        
        //If you have more than eight return values,  error:Stack too deep, try removing local variables. 
        //Rather load struct into memory then return instead of returning directly against map e.g. harvestMap[harvest_id].supplierproduceID
        produceHarvestSubmission memory harvestEntry = harvestMap[harvest_id];

        return (harvestEntry.harvestID, harvestEntry.supplierproduceID, harvestEntry.harvestTimeStamp, 
               harvestEntry.BlockNumber, harvestEntry.IsSet);
    }   

    /**
     * @dev Returns the harvest submission details if the Harvest ID  exists in the harvestDetailMap.
     * @param harvest_id Harvest ID which is key in the harvestMap.
     */
    function getHarvestSubmissionDetail(string calldata harvest_id) external stopInEmergency view returns (string memory, string memory,  
                                                                                                    string memory, string memory, string memory, string memory, uint) {
        
        produceHarvestSubmissionDetail memory harvestEntryDetail = harvestDetailMap[harvest_id];

        return (harvest_id, harvestEntryDetail.growingCondtions, harvestEntryDetail.harvestDescription, 
               harvestEntryDetail.harvestTableName, harvestEntryDetail.harvestQuantity, harvestEntryDetail.harvestUser, harvestEntryDetail.BlockNumber);
    }  

    /**
     * @dev Confirm whether the Harvest ID exists in the harvest submissions.
     * @param harvest_id Harvest ID which is key in the harvestMap map
     */
    function checkHarvestSubmission(string memory harvest_id) public stopInEmergency view returns (bool) {
        // check whether the harvest_id is among the list of known harvest ID's
        uint onChainIsSet = harvestMap[harvest_id].IsSet;
        if (onChainIsSet > 0) {
            // if yes, return true
            return true;
          }
        // otherwise return false
        return false;
    }

    /**
     * @dev Register a Storage submission - it should add the Storage submission to the array of Storage submissions i.e. storageMap.
     * @param _otherID Other IDs (e.g. supplier-produce and marketID) e.g. OZCF_Apples, OZCFM
     * @param _storageTimeStamp Date and time at which produce is harvested e.g. 20190620 16:10:55
     * @param _storageDetail Combination of storageDescription, storageTableName, storageUser and storageQuantity which includes storage UoM
     * @param _storageID Unique ID for storage entry e.g. 1b26557b-20f3-4ea2-81d2-e54c5a9a50be
     * @param _harvestID Unique ID for harvest entry e.g. 1b26557b-20f3-4ea2-81d2-e54c5a9a40f7
     */
    function registerStorageSubmission (string calldata _otherID, string calldata _storageTimeStamp,  string calldata _storageDetail, string calldata _storageID, string calldata _harvestID)
                                        stopInEmergency external returns(uint, uint) {
        require(this.checkStorageSubmission(_storageID) == false, "Error: Cannot add a previously submitted Storage ID/Entry.");

        uint256 storageSubmissionBlockNumber = block.number;
        // string harvestSubmissionBlockHash = block.blockhash(harvestSubmissionBlockNumber - 1); // hash of the given block - only works for the 256 most recent blocks excluding current

        uint256 IsSet = 1;

        // Creates mapping between a harvestID and HarvestS ubmission struct and save in storage.
        storageMap[_storageID] = produceStorageSubmission(_storageID, _harvestID, _otherID, _storageTimeStamp, _storageDetail, storageSubmissionBlockNumber,  IsSet);

         // Creates mapping between a Storage ID and Storage/Handover submitter address then save in storage.
        storageAddressMap[_storageID] = msg.sender;

        //add the Storage ID to the array for length tracking
        uint storageLogIDIndex = storageLogIDs.push(_storageID);
        storageLogIDIndex = storageLogIDIndex.sub(1); //subtract 1 if you wish to access using array index

        // trigger event for storage/handover registration
        emit registeredStorageEvent(storageLogIDIndex, _storageID, storageSubmissionBlockNumber);

        return (storageLogIDIndex, storageSubmissionBlockNumber);
    }

    /**
     * @dev Returns the number of Storage Submissions tracked on Blockchain.
     * Can only be called by the current owner.
     */
    function getStorageSubmissionsCount() external onlyOwner stopInEmergency view returns(uint) {
        return storageLogIDs.length;
    }

    /**
     * @dev Returns an address used for a submission.
     * @param storage_id Storage ID which is key in the storageMap 
     * Can only be called by the current owner.
     */
    function getStorageSubmitterAddress(string calldata storage_id) external onlyOwner stopInEmergency view returns(address) {
       return storageAddressMap[storage_id];
    }

    /**
     * @dev Returns a Storage ID from storageLogIDs array using array index.
     * @param arrayIndex Array index of storageLogIDs
     */
    function getStorageLogIDByIndex(uint256 arrayIndex) external stopInEmergency view returns(string memory) {
       return storageLogIDs[arrayIndex];
    }

    /**
     * @dev Returns the Storage submission if the Storage ID  exists in the storageMap.
     * @param storage_id Storage ID which is key in the storageMap.
     */
    function getStorageSubmission(string calldata storage_id) external stopInEmergency view returns (string memory, string memory, string memory, string memory, uint, uint) {
        produceStorageSubmission memory storageEntry = storageMap[storage_id];

        return (storageEntry.storageID, storageEntry.harvestID, storageEntry.otherID, storageEntry.storageDetail, storageEntry.BlockNumber, storageEntry.IsSet);
    }   

    /**
     * @dev Confirm whether the Storage ID exists in the storage submissions.
     * @param storage_id Storage ID which is key in the storageMap
     */
    function checkStorageSubmission(string memory storage_id) public stopInEmergency view returns (bool) {
        // check whether the storage_id is among the list of known Storage ID's
        uint onChainIsSet = storageMap[storage_id].IsSet;
        if (onChainIsSet > 0) {
            // if yes, return true
            return true;
          }
        // otherwise return false
        return false;
    }

    /**
     * @dev Confirm whether the contract is stopped or not.
     */
    function checkContractIsRunning() public view returns (bool) {
        return stopped;
    }

    /**
     * @dev This is a fallback function which gets executed if a transaction with invalid data is sent to the contract or
     *   just ether without data. We revert the send so that no-one accidentally loses money when using the contract.
     */
    function() external {
        revert();
    }

    /**
     * @dev Remove the storage and code from the state.
     * Can only be called by the current owner.
     */
    function destroy() public onlyOwner onlyInEmergency {
        // cast owner which is address to address payable
        //contractOwner = address(uint160(owner));
        selfdestruct(contractOwner);
    }
}