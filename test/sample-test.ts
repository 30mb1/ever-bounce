import { Address, Contract, getRandomNonce, Signer, toNano, WalletTypes } from "locklift";
import { BounceReceiverAbi } from "../build/factorySource";
import { Account } from "everscale-standalone-client";
import { expect } from "chai";
import _ from "lodash";

const getRandomStringNonce = () => getRandomNonce().toString();

let signer: { signer: Signer; account: Account };
let bounceReceiver: Contract<BounceReceiverAbi>;
const accountAddress = process.env.ACCOUNT;
const bounceReceiverAddress = process.env.BOUNCE_RECEIVER;

describe("Test Sample contract", async function () {
  before(async () => {
    const keyPair = (await locklift.keystore.getSigner("0"))!;
    signer = {
      signer: keyPair,
      account: accountAddress
        ? await locklift.factory.accounts.addExistingAccount({
            type: WalletTypes.EverWallet,
            address: new Address(accountAddress),
          })
        : await locklift.factory.accounts
            .addNewAccount({
              type: WalletTypes.EverWallet,
              value: toNano(10),
              publicKey: keyPair.publicKey,
            })
            .then(res => res.account),
    };
    console.log({
      signer: signer.signer,
      accountAddress: signer.account.address,
    });
    console.log(await locklift.provider.getBalance(signer.account.address));
    const { code: bounceProducerCode } = locklift.factory.getContractArtifacts("BounceProducer");
    bounceReceiver = bounceReceiverAddress
      ? await locklift.factory.getDeployedContract("BounceReceiver", new Address(bounceReceiverAddress))
      : await locklift.factory
          .deployContract({
            contract: "BounceReceiver",
            value: toNano(1),
            constructorParams: {},
            publicKey: signer.signer.publicKey,
            initParams: {
              owner: signer.account.address,
              bounceProducerCode,
              nonce: getRandomNonce(),
            },
          })
          .then(res => res.contract);

    console.log(`bounceReceiver deployed/retrieved ${bounceReceiver.address.toString()}`);
    await bounceReceiver.methods
      .deployBounceProducer({
        nonce: getRandomNonce(),
      })
      .send({
        from: signer.account.address,
        amount: toNano(1),
      });
  });
  describe("Contracts", async function () {
    it("handle five UINT128", async () => {
      const fiveUInts = {
        a: 1,
        b: 2,
        c: 3,
        d: 4,
        e: 5,
      };
      const { traceTree } = await locklift.tracing.trace(
        bounceReceiver.methods.fiveUInts(fiveUInts).send({
          from: signer.account.address,
          amount: toNano(1),
          bounce: true,
        }),
        { raise: false },
      );

      await traceTree?.beautyPrint();
      expect(traceTree)
        .to.emit("FiveUInts")
        .withNamedArgs(
          _(fiveUInts)
            .mapValues(v => v.toString())
            .value(),
        );
    });
    it("handle five strings", async () => {
      const fiveUInts = {
        a: "1",
        b: "2",
        c: "3",
        d: "4",
        e: "5",
      };
      const { traceTree } = await locklift.tracing.trace(
        bounceReceiver.methods.fiveStrings(fiveUInts).send({
          from: signer.account.address,
          amount: toNano(1),
          bounce: true,
        }),
        { raise: false },
      );

      await traceTree?.beautyPrint();
      expect(traceTree)
        .to.emit("FiveStrings")
        .withNamedArgs(
          _(fiveUInts)
            .mapValues(v => v.toString())
            .value(),
        );
    });
    it("handle five uint128 maps", async () => {
      const fiveMaps = {
        a: [[getRandomStringNonce(), [getRandomStringNonce()]]],
        b: [[getRandomStringNonce(), [getRandomStringNonce()]]],
        c: [[getRandomStringNonce(), [getRandomStringNonce()]]],
        d: [[getRandomStringNonce(), [getRandomStringNonce()]]],
        e: [[getRandomStringNonce(), [getRandomStringNonce()]]],
      };
      const { traceTree } = await locklift.tracing.trace(
        // @ts-ignore
        bounceReceiver.methods.fiveUIntsArrayMaps(fiveMaps).send({
          from: signer.account.address,
          amount: toNano(1),
          bounce: true,
        }),
        { raise: false },
      );

      await traceTree?.beautyPrint();
      expect(traceTree).to.emit("FiveUIntsArrayMaps").withNamedArgs(fiveMaps);
    });
    it("handle five huge maps", async () => {
      const fiveMaps = ["a", "b", "c", "d", "e"].reduce((acc, next) => {
        return {
          ...acc,
          [next]: [
            [
              getRandomStringNonce(),
              Array.from({ length: 10 }, () => ({
                stringArr: Array.from({ length: 10 }, () => getRandomStringNonce()),
                uint128Arr: Array.from({ length: 10 }, () => getRandomStringNonce()),
                uint128Map: [
                  [
                    getRandomStringNonce(),
                    Array.from({ length: 10 }, () => ({
                      field1: getRandomStringNonce(),
                      field2: getRandomStringNonce(),
                    })),
                  ],
                ],
              })),
            ],
          ],
        };
      }, {});
      const { traceTree } = await locklift.tracing.trace(
        // @ts-ignore
        bounceReceiver.methods.fiveHugeMaps(fiveMaps).send({
          from: signer.account.address,
          amount: toNano(3),
          bounce: true,
        }),
        { raise: false },
      );

      await traceTree?.beautyPrint();
      expect(traceTree).to.emit("FiveHugeMaps").withNamedArgs(fiveMaps);
    });
  });
});
