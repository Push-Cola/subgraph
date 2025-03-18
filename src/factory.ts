import { LazyMintDeployed, ProjectCreated, ProjectUpdated } from '../generated/LazyMintFactory/LazyMintFactory';
import { LazyMint1, TokenMetadata } from '../generated/templates';
import { Coupon, User, Project } from '../generated/schema';
import { log, BigInt, Bytes } from '@graphprotocol/graph-ts';

// Helper function to generate a unique project ID
function generateProjectId(projectId: BigInt): Bytes {
    // Create a unique ID by concatenating the project ID with a prefix
    return Bytes.fromUTF8('project-').concatI32(projectId.toI32());
}

// La única función que debe crear proyectos
export function handleProjectCreated(event: ProjectCreated): void {
    let user = User.load(event.params.owner);
    if (user == null) {
        user = new User(event.params.owner);
        user.save();
    }

    // Generate a unique project ID
    let projectId = generateProjectId(event.params.projectId);
    
    log.info('Project ID from event: {}', [event.params.projectId.toString()]);
    log.info('Generated project ID: {}', [projectId.toHexString()]);
    
    // Check if the project already exists
    let project = Project.load(projectId);
    if (project == null) {
        log.info('Creating new project with ID: {} and name: {}', [
            event.params.projectId.toString(),
            event.params.name
        ]);
        
        project = new Project(projectId);
        project.projectId = event.params.projectId;
        project.creator = user.id;
        project.name = event.params.name;
        project.createdAt = event.block.timestamp;
        project.totalClaims = BigInt.fromI32(0);
        project.uniqueClaimers = [];
        project.totalBudgetLocked = BigInt.fromI32(0);
        project.totalAffiliatePayments = BigInt.fromI32(0);
        project.save();
        
        log.info('Successfully created project with ID: {} and entityID: {}', [
            event.params.projectId.toString(),
            projectId.toHexString()
        ]);
    } else {
        // Si ya existe, actualizamos solo si es necesario
        if (project.name == "") {
            project.name = event.params.name;
            project.save();
            log.info('Updated empty project name with ID: {} to: {}', [
                event.params.projectId.toString(),
                event.params.name
            ]);
        } else {
            // Solo actualizar si hay un cambio real
            if (project.name != event.params.name) {
                project.name = event.params.name;
                project.save();
                log.info('Updated project name with ID: {} to: {}', [
                    event.params.projectId.toString(),
                    event.params.name
                ]);
            } else {
                log.info('Ignoring duplicate ProjectCreated event for project ID: {}', [
                    event.params.projectId.toString()
                ]);
            }
        }
    }
}

export function handleProjectUpdated(event: ProjectUpdated): void {
    let projectId = generateProjectId(event.params.projectId);
    let project = Project.load(projectId);

    if (project != null) {
        project.name = event.params.name;
        project.save();

        log.info('Project updated with ID: {}, name: {}', [
            event.params.projectId.toString(),
            event.params.name
        ]);
    } else {
        // Si el proyecto no existe, registramos el error pero NO lo creamos
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

    // Generate a unique project ID
    let projectId = generateProjectId(event.params.projectId);
    
    log.info('LazyMintDeployed - Project ID from event: {}', [event.params.projectId.toString()]);
    log.info('LazyMintDeployed - Generated project ID: {}', [projectId.toHexString()]);
    
    let project = Project.load(projectId);
    
    // IMPORTANTE: No creamos proyectos en este handler
    if (project == null) {
        log.warning('Project not found in LazyMintDeployed handler with ID: {}. Ignoring event.', [
            event.params.projectId.toString()
        ]);
        return; // Salimos para evitar crear coupons sin proyecto
    }
    
    log.info('Found existing project with ID: {} for LazyMintDeployed', [
        event.params.projectId.toString()
    ]);
    
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
    coupon.claimStart = event.params.claimStart;
    coupon.claimEnd = event.params.claimEnd;
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
