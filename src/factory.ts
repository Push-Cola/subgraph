import { LazyMintDeployed } from '../generated/LazyMintFactory/LazyMintFactory';
import { LazyMint1, TokenMetadata } from '../generated/templates';
import { Coupon, User, Project } from '../generated/schema';
import { log, BigInt } from '@graphprotocol/graph-ts';

export function handleContractCreated(event: LazyMintDeployed): void {
    LazyMint1.create(event.params.lazyMintAddress);

    let user = User.load(event.params.creator);
    if (user == null) {
        user = new User(event.params.creator);
        user.save();
    }

    // Create the Project entity (simple container)
    let project = new Project(event.params.lazyMintAddress);
    project.creator = user.id;
    project.totalClaims = BigInt.fromI32(0);
    project.uniqueClaimers = [];
    project.totalBudgetLocked = BigInt.fromI32(0);
    project.totalAffiliatePayments = BigInt.fromI32(0);
    project.save();

    // Create the Coupon entity with all the event information
    let coupon = new Coupon(event.params.lazyMintAddress);
    coupon.project = project.id;
    coupon.owner = user.id;  // Initially, creator is also the owner
    coupon.lazyMintAddress = event.params.lazyMintAddress;
    coupon.uri = event.params.uri;
    coupon.maxSupply = event.params.maxSupply;
    coupon.lockedBudget = event.params.lockedBudget;
    coupon.claimExpiration = event.params.claimExpiration;
    coupon.redeemExpiration = event.params.redeemExpiration;
    coupon.currencyAddress = event.params.currencyAddress;
    coupon.fee = event.params.fee;
    coupon.tokenId = event.params.tokenId;
    coupon.isRedeemed = false;
    coupon.totalAffiliatePayments = BigInt.fromI32(0);

    let uri = event.params.uri;
    log.info('Processing URI: {}', [uri]);

    if (uri.startsWith('ipfs://')) {
        let cid = uri.replace('ipfs://', '');
        
        // Handle potential path components
        if (cid.includes('/')) {
            cid = cid.split('/')[0];
        }
        
        if (cid.length > 0) {
            log.info('Creating TokenMetadata template with CID: {}', [cid]);
            TokenMetadata.create(cid);
            coupon.metadata = cid;
        } else {
            log.warning('Invalid IPFS CID extracted from URI: {}', [uri]);
        }
    } else {
        log.warning('URI does not start with ipfs://: {}', [uri]);
    }

    coupon.save();
    
    // Handle nullable metadata with type assertion
    let metadataStr = coupon.metadata ? (coupon.metadata as string) : 'null';
    log.info('Coupon created with address: {} and metadata CID: {}', [
        event.params.lazyMintAddress.toHexString(),
        metadataStr
    ]);
}
