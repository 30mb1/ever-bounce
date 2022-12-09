pragma ever -solidity >= 0.61.2;
pragma AbiHeader expire;
pragma AbiHeader pubkey;

library CommonStructures {
    struct UIntStringMap {
        uint128[] uint128Arr;
        string[] stringArr;
        mapping(uint128 => Uint128Fields[]) uint128Map;
    }

    struct Uint128Fields {
        uint128 field1;
        uint128 field2;
    }
}
