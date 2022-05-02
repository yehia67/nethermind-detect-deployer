# Nethermind Deployer Agent

## Description

This agent detects each time the Nethermind Forta deployer account deploys a bot.

## Supported Chains

- Polygon

## Alerts

- DEPLOYER-0
  - Fired when a transaction submitted from the deployer address
  - Severity is always set to "Info"
  - Type is always set to "Info"
  - Metadata "contractAddress" field specifies which Forta bot had been deployed

## Test Data

The agent behavior can be verified with the following transactions:

- 0x6ca3f2f3c383f44732d1a4808b4c7b6f6d2a94adf57403cc01a0c18837edbd93 (Agent created 39 day ago)
- 0xf1f233ca07aa1ed5f3344b06d21de7b17cbd38ed5c2e47c7ff6b799c7ec48533 (Agent created 39 day ago)
- 0x46c5a07d66aec71dc1b12dcf7a036c78c2299cc45c099d981d440f2c67501525 (Agent created 39 day ago)
