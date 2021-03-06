import {
  FindingType,
  FindingSeverity,
  Finding,
  HandleTransaction,
  createTransactionEvent,
  ethers,
} from "forta-agent";
import agent, {
  DEPLOYER,
  CONTRACT_ADDRESS,
  provideHandleTransaction,
} from "./agent";

const mockNotDeployerAddress = "0x7C71a3D85a8d620EeaB9339cCE776Ddc14a8129C";

const createAgentTxData =
  "0x7935d5b41ebdeb7c258149125a199078496162cafd9ee57a1c5466a5fa72f86fc3dfa90b00000000000000000000000088dc3a2284fa62e0027d6d6b1fcfdd2141a143b8000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000e0000000000000000000000000000000000000000000000000000000000000002e516d533736645269597a4443446e6d61637a616131396b7432557731584c627368325271436f694d504d3361736b0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000380000000000000000000000000000000000000000000000000000000000000089000000000000000000000000000000000000000000000000000000000000a86a";
const notCreateAgentTxData =
  "0x9935d5b41ebdeb7c258149125a199078496162cafd9ee57a1c5466a5fa72f86fc3dfa90b00000000000000000000000088dc3a2284fa62e0027d6d6b1fcfdd2141a143b8000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000e0000000000000000000000000000000000000000000000000000000000000002e516d533736645269597a4443446e6d61637a616131396b7432557731584c627368325271436f694d504d3361736b0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000380000000000000000000000000000000000000000000000000000000000000089000000000000000000000000000000000000000000000000000000000000a86a";

describe("Nethermind deployer deploy a new bot", () => {
  let handleTransaction: HandleTransaction;

  beforeAll(() => {
    handleTransaction = agent.handleTransaction;
  });

  describe("handleTransaction", () => {
    it("returns  empty if deployer didn't submit a transaction", async () => {
      const mockTxEvent = createTransactionEvent({
        transaction: {
          from: mockNotDeployerAddress,
          to: null,
          data: createAgentTxData,
        },
        contractAddress: "",
      } as any);
      handleTransaction = provideHandleTransaction(
        mockNotDeployerAddress,
        CONTRACT_ADDRESS
      );
      const findings = await handleTransaction(mockTxEvent);

      expect(findings).toStrictEqual([]);
    });
    it("returns empty if deployer didn't submit a createAgent transaction", async () => {
      const mockTxEvent = createTransactionEvent({
        transaction: {
          from: DEPLOYER,
          to: null,
          data: notCreateAgentTxData,
        },
        contractAddress: "",
      } as any);
      handleTransaction = provideHandleTransaction(DEPLOYER, CONTRACT_ADDRESS);
      const findings = await handleTransaction(mockTxEvent);

      expect(findings).toStrictEqual([]);
    });
    it("returns empty if deployer submit a createAgent transaction from a different smart contract", async () => {
      const mockTxEvent = createTransactionEvent({
        transaction: {
          from: DEPLOYER,
          to: null,
          data: createAgentTxData,
        },
        contractAddress: "",
      } as any);
      handleTransaction = provideHandleTransaction(DEPLOYER, CONTRACT_ADDRESS);
      const findings = await handleTransaction(mockTxEvent);

      expect(findings).toStrictEqual([]);
    });
    it("returns a finding if deployer deployed a bot", async () => {
      const mockTxEvent = createTransactionEvent({
        transaction: {
          from: DEPLOYER,
          to: null,
          data: createAgentTxData,
        },
        contractAddress: CONTRACT_ADDRESS,
      } as any);
      const mockMintTransferEvent = {
        args: {
          from: "0x0000000000000000000000000000000000000000",
          to: DEPLOYER,
          value: ethers.BigNumber.from("20000000000"), //20k with 6 decimals
        },
      };
      const mockUpdatedAgentEvent = {
        args: {
          agentId: 1,
          by: DEPLOYER,
          metadata: "",
          chainIds: [1],
        },
      };
      mockTxEvent.filterLog = jest
        .fn()
        .mockReturnValue([mockMintTransferEvent, mockUpdatedAgentEvent]);

      handleTransaction = provideHandleTransaction(DEPLOYER, CONTRACT_ADDRESS);
      const findings = await handleTransaction(mockTxEvent);

      expect(findings).toStrictEqual([
        Finding.fromObject({
          name: "The Nethermind Forta deployer",
          description: `Forta deployer account with address ${DEPLOYER} deploy new bot with address: ${CONTRACT_ADDRESS}`,
          alertId: "DEPLOYER-0",
          type: FindingType.Info,
          severity: FindingSeverity.Info,
          metadata: {
            agentId: "1",
          },
        }),
      ]);
    });
  });
});
