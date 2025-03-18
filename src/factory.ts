import { LazyMintDeployed, ProjectCreated, ProjectUpdated } from '../generated/LazyMintFactory/LazyMintFactory';
import { LazyMint1, TokenMetadata } from '../generated/templates';
import { Coupon, User, Project } from '../generated/schema';
import { log, BigInt, Bytes } from '@graphprotocol/graph-ts';

export function handleProjectCreated(event: ProjectCreated): void {
    let user = User.load(event.params.owner);
    if (user == null) {
        user = new User(event.params.owner);
        user.save();
    }

    // Create a new project with projectId
    let projectId = Bytes.fromI32(event.params.projectId.toI32());
    
    // Check if the project already exists (could be created inline during LazyMintDeployed)
    let project = Project.load(projectId);
    if (project == null) {
        project = new Project(projectId);
        project.creator = user.id;
        project.name = event.params.name;
        project.createdAt = event.block.timestamp;
        project.totalClaims = BigInt.fromI32(0);
        project.uniqueClaimers = [];
        project.totalBudgetLocked = BigInt.fromI32(0);
        project.totalAffiliatePayments = BigInt.fromI32(0);
        project.save();
    } else {
        // If the project existed (rare case), update its name
        project.name = event.params.name;
        project.save();
    }

    log.info('Project created with ID: {} and name: {}', [
        event.params.projectId.toString(),
        event.params.name
    ]);
}

export function handleProjectUpdated(event: ProjectUpdated): void {
    let projectId = Bytes.fromI32(event.params.projectId.toI32());
    let project = Project.load(projectId);

    if (project != null) {
        project.name = event.params.name;
        project.save();

        log.info('Project updated with ID: {}, name: {}', [
            event.params.projectId.toString(),
            event.params.name
        ]);
    } else {
        log.warning('Attempted to update non-existent project: {}', [
            event.params.projectId.toString()
        ]);
    }
}

export function handleContractCreated(event: LazyMintDeployed): void {
    LazyMint1.create(event.params.lazyMintAddress);

    let user = User.load(event.params.creator);
    if (user == null) {
        user = new User(event.params.creator);
        user.save();
    }

    // Get or create the Project entity using the project ID
    let projectId = Bytes.fromI32(event.params.projectId.toI32());
    let project = Project.load(projectId);
    
    // If the project doesn't exist, create it
    // This should be rare since the contract creates the project first,
    // but we handle it just in case
    if (project == null) {
        project = new Project(projectId);
        project.creator = user.id;
        project.name = "Untitled Project"; // Default name
        project.createdAt = event.block.timestamp;
        project.totalClaims = BigInt.fromI32(0);
        project.uniqueClaimers = [];
        project.totalBudgetLocked = BigInt.fromI32(0);
        project.totalAffiliatePayments = BigInt.fromI32(0);
    }
    
    // Update the project's budget
    project.totalBudgetLocked = project.totalBudgetLocked.plus(event.params.lockedBudget);
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
    log.info('Coupon created with address: {} and metadata CID: {} for project: {}', [
        event.params.lazyMintAddress.toHexString(),
        metadataStr,
        projectId.toHexString()
    ]);
}
