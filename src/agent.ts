import {
  Finding,
  HandleTransaction,
  TransactionEvent,
  FindingSeverity,
  FindingType,
} from "forta-agent";

export const DEPLOYER = "0x88dC3a2284FA62e0027d6D6B1fCfDd2141a143b8";

const handleTransaction: HandleTransaction = async (
  txEvent: TransactionEvent
) => {
  const findings: Finding[] = [];

  const isDeployer = DEPLOYER === txEvent.transaction.from;

  if (!isDeployer) return findings;

  // Check if its a deployment transaction
  // to should be equal null and contract address should exist
  if (
    txEvent.transaction.to === null &&
    txEvent.contractAddress &&
    txEvent.contractAddress?.length > 0
  ) {
    findings.push(
      Finding.fromObject({
        name: "The Nethermind Forta deployer",
        description: `Forta deployer account with address ${DEPLOYER} deploy new bot with address: ${txEvent.contractAddress}`,
        alertId: "DEPLOYER-0",
        type: FindingType.Info,
        severity: FindingSeverity.Info,
        metadata: {
          contractAddress: txEvent.contractAddress,
        },
      })
    );
  }

  return findings;
};

export default {
  handleTransaction,
};
