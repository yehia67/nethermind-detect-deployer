import {
  Finding,
  HandleTransaction,
  TransactionEvent,
  FindingSeverity,
  FindingType,
} from "forta-agent";

export const DEPLOYER = "0x88dC3a2284FA62e0027d6D6B1fCfDd2141a143b8";
export const ERC721_TRANSFER_EVENT =
  "event Transfer(address indexed from, address indexed to, uint256 tokenId)";
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

    // Make sure the agent ERC721 token has been minted
    const erc721TransferEvents = txEvent.filterLog(ERC721_TRANSFER_EVENT);

    erc721TransferEvents.forEach((transferEvent) => {
      // extract transfer event arguments
      const { to, from } = transferEvent.args;
      if (
        from === "0x0000000000000000000000000000000000000000" &&
        to === DEPLOYER
      ) {
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
    });
  }

  return findings;
};

export default {
  handleTransaction,
};
