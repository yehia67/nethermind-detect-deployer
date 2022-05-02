import {
  FindingType,
  FindingSeverity,
  Finding,
  HandleTransaction,
  createTransactionEvent,
  ethers,
} from "forta-agent";
import agent, { DEPLOYER } from "./agent";

const mockNotDeployerAddress = "0x7C71a3D85a8d620EeaB9339cCE776Ddc14a8129C";
const mockContractAddress = "0x55d398326f99059ff775485246999027b3197955";

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
        },
        contractAddress: "",
      } as any);
      const findings = await handleTransaction(mockTxEvent);

      expect(findings).toStrictEqual([]);
    });
    it("returns empty if deployer didn't submit a deployment transaction", async () => {
      const mockTxEvent = createTransactionEvent({
        transaction: {
          from: DEPLOYER,
          to: null,
        },
        contractAddress: "",
      } as any);
      const findings = await handleTransaction(mockTxEvent);

      expect(findings).toStrictEqual([]);
    });
    it("returns a finding if deployer deployed a bot", async () => {
      const mockTxEvent = createTransactionEvent({
        transaction: {
          from: DEPLOYER,
          to: null,
        },
        contractAddress: mockContractAddress,
      } as any);
      const findings = await handleTransaction(mockTxEvent);

      expect(findings).toStrictEqual([
        Finding.fromObject({
          name: "The Nethermind Forta deployer",
          description: `Forta deployer account with address ${DEPLOYER} deploy new bot with address: ${mockContractAddress}`,
          alertId: "DEPLOYER-0",
          type: FindingType.Info,
          severity: FindingSeverity.Info,
          metadata: {
            contractAddress: mockContractAddress,
          },
        }),
      ]);
    });
  });
});
