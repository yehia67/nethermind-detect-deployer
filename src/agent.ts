import {
  Finding,
  HandleTransaction,
  TransactionEvent,
  FindingSeverity,
  FindingType,
} from "forta-agent";

export const DEPLOYER = "0x88dC3a2284FA62e0027d6D6B1fCfDd2141a143b8";
export const CONTRACT_ADDRESS = "0x61447385b019187daa48e91c55c02af1f1f3f863";

const handleTransaction: HandleTransaction = async (
  txEvent: TransactionEvent
) => {
  const findings: Finding[] = [];

  const isDeployerAndContractAddress =
    DEPLOYER === txEvent.transaction.from &&
    CONTRACT_ADDRESS === txEvent.contractAddress;

  if (!isDeployerAndContractAddress) return findings;

  const methodID = "0x7935d5b4";
  if (methodID === txEvent.transaction.data.slice(0, 10)) {
    findings.push(
      Finding.fromObject({
        name: "The Nethermind Forta deployer",
        description: `Forta deployer account with address ${DEPLOYER} deploy new bot with address: ${txEvent.contractAddress}`,
        alertId: "DEPLOYER-0",
        type: FindingType.Info,
        severity: FindingSeverity.Info,
        metadata: {
          contractAddress: txEvent.contractAddress!,
        },
      })
    );
  }

  return findings;
};

export default {
  handleTransaction,
};
