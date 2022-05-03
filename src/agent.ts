import {
  Finding,
  HandleTransaction,
  TransactionEvent,
  FindingSeverity,
  FindingType,
} from "forta-agent";

export const ERC721_TRANSFER_EVENT =
  "event Transfer(address indexed from, address indexed to, uint256 tokenId)";

export const AGENT_UPDATED_EVENT =
  "event AgentUpdated(uint256 indexed agentId, address indexed by, string metadata, uint256[] chainIds)";

export const DEPLOYER = "0x88dC3a2284FA62e0027d6D6B1fCfDd2141a143b8";
export const CONTRACT_ADDRESS = "0x61447385b019187daa48e91c55c02af1f1f3f863";

export const provideHandleTransaction = (
  DEPLOYER: string,
  CONTRACT_ADDRESS: string
): HandleTransaction => {
  const handleTransaction: HandleTransaction = async (
    txEvent: TransactionEvent
  ) => {
    const findings: Finding[] = [];

    const isDeployerAndContractAddress =
      DEPLOYER === txEvent.transaction.from &&
      CONTRACT_ADDRESS === txEvent.contractAddress;

    if (!isDeployerAndContractAddress) return findings;

    // check for mint transaction (transfer from zero address to deployer address)
    const erc721TransferEvents = txEvent.filterLog(ERC721_TRANSFER_EVENT);

    // check for update agent transaction
    const updatedAgentEvents = txEvent.filterLog(AGENT_UPDATED_EVENT);

    let isMintTransactionSubmitted = false;

    erc721TransferEvents.forEach((transferEvent) => {
      const { to, from } = transferEvent.args;
      if (
        to === DEPLOYER &&
        from === "0x0000000000000000000000000000000000000000"
      ) {
        isMintTransactionSubmitted = true;
      }
    });

    updatedAgentEvents.forEach((transferEvent) => {
      const { agentId, by } = transferEvent.args;
      if (by === DEPLOYER && isMintTransactionSubmitted) {
        findings.push(
          Finding.fromObject({
            name: "The Nethermind Forta deployer",
            description: `Forta deployer account with address ${DEPLOYER} deploy new bot with address: ${txEvent.contractAddress}`,
            alertId: "DEPLOYER-0",
            type: FindingType.Info,
            severity: FindingSeverity.Info,
            metadata: {
              agentId: agentId.toString(),
            },
          })
        );
      }
    });

    return findings;
  };
  return handleTransaction;
};

export default {
  handleTransaction: provideHandleTransaction(DEPLOYER, CONTRACT_ADDRESS),
};
