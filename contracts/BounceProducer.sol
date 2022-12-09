pragma ever-solidity >= 0.61.2;
pragma AbiHeader expire;
pragma AbiHeader pubkey;

import "./lib/CommonStructures.sol";


contract BounceProducer {
    uint128 static nonce;
    constructor() public {}

    function fiveUInts(uint128 a, uint128 b, uint128 c, uint128 d, uint128 e) public {
        revert(1001);
    }

    function fiveStrings(string a, string b, string c, string d, string e) public {
        revert(1002);
    }

    function fiveMapsOfUIntsArr(
        mapping(uint128 => uint128[]) a,
        mapping(uint128 => uint128[]) b,
        mapping(uint128 => uint128[]) c,
        mapping(uint128 => uint128[]) d,
        mapping(uint128 => uint128[]) e
    ) public {
        revert(1003);
    }

    function fiveHugeMaps(
        mapping(uint128 => CommonStructures.UIntStringMap[]) a,
        mapping(uint128 => CommonStructures.UIntStringMap[]) b,
        mapping(uint128 => CommonStructures.UIntStringMap[]) c,
        mapping(uint128 => CommonStructures.UIntStringMap[]) d,
        mapping(uint128 => CommonStructures.UIntStringMap[]) e
    ) public {
        revert(1004);
    }


}
