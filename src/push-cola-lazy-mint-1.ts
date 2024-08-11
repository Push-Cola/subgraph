import {
  ApprovalForAll as ApprovalForAllEvent,
  BatchMetadataUpdate as BatchMetadataUpdateEvent,
  ContractURIUpdated as ContractURIUpdatedEvent,
  CouponRedeemed as CouponRedeemedEvent,
  DefaultRoyalty as DefaultRoyaltyEvent,
  MetadataFrozen as MetadataFrozenEvent,
  OwnerUpdated as OwnerUpdatedEvent,
  RoyaltyForToken as RoyaltyForTokenEvent,
  TokenClaimed as TokenClaimedEvent,
  TokensClaimed as TokensClaimedEvent,
  TokensLazyMinted as TokensLazyMintedEvent,
  TransferBatch as TransferBatchEvent,
  TransferSingle as TransferSingleEvent,
  URI as URIEvent
} from "../generated/PushColaLazyMint1/PushColaLazyMint1"
import {
  ApprovalForAll,
  BatchMetadataUpdate,
  ContractURIUpdated,
  CouponRedeemed,
  DefaultRoyalty,
  MetadataFrozen,
  OwnerUpdated,
  RoyaltyForToken,
  TokenClaimed,
  TokensClaimed,
  TokensLazyMinted,
  TransferBatch,
  TransferSingle,
  URI
} from "../generated/schema"

export function handleApprovalForAll(event: ApprovalForAllEvent): void {
  let entity = new ApprovalForAll(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity._owner = event.params._owner
  entity._operator = event.params._operator
  entity._approved = event.params._approved

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleBatchMetadataUpdate(
  event: BatchMetadataUpdateEvent
): void {
  let entity = new BatchMetadataUpdate(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity._fromTokenId = event.params._fromTokenId
  entity._toTokenId = event.params._toTokenId

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleContractURIUpdated(event: ContractURIUpdatedEvent): void {
  let entity = new ContractURIUpdated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.prevURI = event.params.prevURI
  entity.newURI = event.params.newURI

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleCouponRedeemed(event: CouponRedeemedEvent): void {
  let entity = new CouponRedeemed(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.owner = event.params.owner
  entity.tokenId = event.params.tokenId
  entity.affiliateAddress = event.params.affiliateAddress
  entity.FEE = event.params.FEE
  entity.contractAddress = event.params.contractAddress
  entity.timestamp = event.params.timestamp
  entity.currency = event.params.currency

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleDefaultRoyalty(event: DefaultRoyaltyEvent): void {
  let entity = new DefaultRoyalty(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.newRoyaltyRecipient = event.params.newRoyaltyRecipient
  entity.newRoyaltyBps = event.params.newRoyaltyBps

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleMetadataFrozen(event: MetadataFrozenEvent): void {
  let entity = new MetadataFrozen(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleOwnerUpdated(event: OwnerUpdatedEvent): void {
  let entity = new OwnerUpdated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.prevOwner = event.params.prevOwner
  entity.newOwner = event.params.newOwner

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleRoyaltyForToken(event: RoyaltyForTokenEvent): void {
  let entity = new RoyaltyForToken(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.tokenId = event.params.tokenId
  entity.royaltyRecipient = event.params.royaltyRecipient
  entity.royaltyBps = event.params.royaltyBps

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleTokenClaimed(event: TokenClaimedEvent): void {
  let entity = new TokenClaimed(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.claimer = event.params.claimer
  entity.receiver = event.params.receiver
  entity.tokenId = event.params.tokenId
  entity.quantity = event.params.quantity
  entity.affiliateAddress = event.params.affiliateAddress
  entity.contractAddress = event.params.contractAddress
  entity.timestamp = event.params.timestamp

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleTokensClaimed(event: TokensClaimedEvent): void {
  let entity = new TokensClaimed(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.claimer = event.params.claimer
  entity.receiver = event.params.receiver
  entity.tokenId = event.params.tokenId
  entity.quantityClaimed = event.params.quantityClaimed

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleTokensLazyMinted(event: TokensLazyMintedEvent): void {
  let entity = new TokensLazyMinted(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.startTokenId = event.params.startTokenId
  entity.endTokenId = event.params.endTokenId
  entity.baseURI = event.params.baseURI
  entity.encryptedBaseURI = event.params.encryptedBaseURI

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleTransferBatch(event: TransferBatchEvent): void {
  let entity = new TransferBatch(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity._operator = event.params._operator
  entity._from = event.params._from
  entity._to = event.params._to
  entity._ids = event.params._ids
  entity._values = event.params._values

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleTransferSingle(event: TransferSingleEvent): void {
  let entity = new TransferSingle(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity._operator = event.params._operator
  entity._from = event.params._from
  entity._to = event.params._to
  entity._id = event.params._id
  entity._value = event.params._value

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleURI(event: URIEvent): void {
  let entity = new URI(event.transaction.hash.concatI32(event.logIndex.toI32()))
  entity._value = event.params._value
  entity._id = event.params._id

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
