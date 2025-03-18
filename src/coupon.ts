import { TokenMetadata, Affiliate, CouponRedeemed, TokenClaimed, Location, Attribute, City, Country } from '../generated/schema';
import { Bytes, dataSource, json, log, BigInt, TypedMap, Value, BigDecimal, JSONValue, JSONValueKind, crypto } from '@graphprotocol/graph-ts';
import { Coupon, User, Project } from '../generated/schema';
import { 
	AffiliateRegistered,
	CouponRedeemed as CouponRedeemedEvent,
	TokenClaimed as TokenClaimedEvent
} from '../generated/templates/LazyMint1/LazyMint1';

export function handleMetadata(content: Bytes): void {
	const tokenId = dataSource.stringParam();
	
	// Check if metadata already exists
	let tokenMetadata = TokenMetadata.load(tokenId);
	
	if (tokenMetadata == null) {
		tokenMetadata = new TokenMetadata(tokenId);
		tokenMetadata.name = 'Unnamed Token'; // Set default name
	}

	if (content.length == 0) {
		log.warning('Empty content received for token {}', [tokenId]);
		tokenMetadata.save();
		return;
	}

	let jsonResult = json.try_fromBytes(content);
	if (jsonResult.isError) {
		log.error('Failed to parse JSON for token {}', [tokenId]);
		tokenMetadata.save();
		return;
	}

	let value = jsonResult.value.toObject();
	if (value) {
		// Basic fields
		const name = value.get('name');
		const description = value.get('description');
		const image = value.get('image');
		const backgroundColor = value.get('backgroundColor');
		const textColor = value.get('textColor');
		const visibility = value.get('visibility');
		const category = value.get('category');

		// Location object
		const location = value.get('location');
		let locationObj: TypedMap<string, JSONValue> | null = null;
		if (location && !location.isNull()) {
			locationObj = location.toObject();
		}

	

		// Attributes array
		const attributes = value.get('attributes');
		let attributesArray: Array<JSONValue> | null = null;
		if (attributes && !attributes.isNull()) {
			attributesArray = attributes.toArray();
		}

		// Set basic fields
		if (name && !name.isNull() && name.kind == JSONValueKind.STRING) tokenMetadata.name = name.toString();
		if (description && !description.isNull() && description.kind == JSONValueKind.STRING) tokenMetadata.description = description.toString();
		if (image && !image.isNull() && image.kind == JSONValueKind.STRING) tokenMetadata.image = image.toString();
		if (backgroundColor && !backgroundColor.isNull() && backgroundColor.kind == JSONValueKind.STRING) tokenMetadata.backgroundColor = backgroundColor.toString();
		if (textColor && !textColor.isNull() && textColor.kind == JSONValueKind.STRING) tokenMetadata.textColor = textColor.toString();
		if (visibility && !visibility.isNull() && visibility.kind == JSONValueKind.STRING) tokenMetadata.visibility = visibility.toString();
		if (category && !category.isNull() && category.kind == JSONValueKind.STRING) tokenMetadata.category = category.toString();

		// Set location fields if available
		if (locationObj) {
			let location = new Location(tokenId + '-location');
			const address1 = locationObj.get('address1');
			const address2 = locationObj.get('address2');
			const formattedAddress = locationObj.get('formattedAddress');
			const cityName = locationObj.get('city');
			const region = locationObj.get('region');
			const postalCode = locationObj.get('postalCode');
			const countryName = locationObj.get('country');
			const lat = locationObj.get('lat');
			const lng = locationObj.get('lng');

			if (address1 && !address1.isNull() && address1.kind == JSONValueKind.STRING) location.address1 = address1.toString();
			if (address2 && !address2.isNull() && address2.kind == JSONValueKind.STRING) location.address2 = address2.toString();
			if (formattedAddress && !formattedAddress.isNull() && formattedAddress.kind == JSONValueKind.STRING) location.formattedAddress = formattedAddress.toString();
			if (region && !region.isNull() && region.kind == JSONValueKind.STRING) location.region = region.toString();
			if (postalCode && !postalCode.isNull() && postalCode.kind == JSONValueKind.STRING) location.postalCode = postalCode.toString();
			if (lat && !lat.isNull() && lat.kind == JSONValueKind.STRING) location.lat = BigDecimal.fromString(lat.toString());
			if (lng && !lng.isNull() && lng.kind == JSONValueKind.STRING) location.lng = BigDecimal.fromString(lng.toString());

			// Handle Country
			if (countryName && !countryName.isNull() && countryName.kind == JSONValueKind.STRING) {
				let countryNameStr = countryName.toString();
				// Create a hash-based ID for the country
				let countryIdBytes = Bytes.fromByteArray(crypto.keccak256(Bytes.fromUTF8(countryNameStr.toLowerCase())));
				let country = Country.load(countryIdBytes);
				if (!country) {
					country = new Country(countryIdBytes);
					country.name = countryNameStr;
					country.code = countryNameStr.toLowerCase();
					country.totalCoupons = BigInt.fromI32(0);
				}
				country.totalCoupons = country.totalCoupons.plus(BigInt.fromI32(1));
				country.save();
				location.country = countryIdBytes;
			}

			// Handle City
			if (cityName && !cityName.isNull() && cityName.kind == JSONValueKind.STRING) {
				let cityNameStr = cityName.toString();
				// Create a composite string for uniqueness and then hash it
				let cityIdInput = cityNameStr.toLowerCase();
				if (location.country) {
					cityIdInput = cityIdInput + '-' + location.country.toHexString();
				}
				let cityIdBytes = Bytes.fromByteArray(crypto.keccak256(Bytes.fromUTF8(cityIdInput)));
				let city = City.load(cityIdBytes);
				if (!city) {
					city = new City(cityIdBytes);
					city.name = cityNameStr;
					if (region && !region.isNull() && region.kind == JSONValueKind.STRING) city.region = region.toString();
					city.country = location.country;
					city.totalCoupons = BigInt.fromI32(0);
				}
				city.totalCoupons = city.totalCoupons.plus(BigInt.fromI32(1));
				city.save();
				location.city = cityIdBytes;
			}
			
			location.save();
			tokenMetadata.location = location.id;
		}


		// Process attributes
		if (attributesArray) {
			let processedAttributes: string[] = [];
			for (let i = 0; i < attributesArray.length; i++) {
				let attribute = attributesArray[i].toObject();
				let traitType = attribute.get('trait_type');
				let traitValue = attribute.get('value');
				
				if (traitType && !traitType.isNull() && traitType.kind == JSONValueKind.STRING && 
					traitValue && !traitValue.isNull() && traitValue.kind == JSONValueKind.STRING) {
					let newAttribute = new Attribute(tokenId + '-attribute-' + i.toString());
					newAttribute.traitType = traitType.toString();
					newAttribute.value = traitValue.toString();
					newAttribute.save();
					processedAttributes.push(newAttribute.id);
				}
			}
			tokenMetadata.attributes = processedAttributes;
		}

		log.info('Successfully processed metadata for token {}', [tokenId]);
	} else {
		log.error('Invalid metadata object for token {}', [tokenId]);
	}

	tokenMetadata.save();
}

export function handleAffiliateRegistered(event: AffiliateRegistered): void {
	let user = User.load(event.params.user);
	if (!user) {
		user = new User(event.params.user);
		user.save();
	}

	let coupon = Coupon.load(event.params.contractAddress);
	if (!coupon) {
		log.error('Coupon not found for address {}', [event.params.contractAddress.toHexString()]);
		return;
	}

	// Initialize totalAffiliatePayments if not set
	if (!coupon.totalAffiliatePayments) {
		coupon.totalAffiliatePayments = BigInt.fromI32(0);
	}

	// Update project's totalBudgetLocked
	let project = Project.load(coupon.project);
	if (project) {
		project.totalBudgetLocked = project.totalBudgetLocked.plus(coupon.lockedBudget);
		project.save();
	}

	let affiliate = new Affiliate(event.params.user);
	affiliate.user = user.id;
	affiliate.coupon = coupon.id;
	affiliate.timestamp = event.block.timestamp;
	affiliate.totalClaims = BigInt.fromI32(0);
	affiliate.totalRedemptions = BigInt.fromI32(0);
	affiliate.totalEarnings = BigInt.fromI32(0);
	affiliate.totalPaidOut = BigInt.fromI32(0);
	affiliate.pendingPayments = BigInt.fromI32(0);
	affiliate.uniqueClaimers = [];
	affiliate.save();
	
	// Save coupon after initialization
	coupon.save();
}

export function handleCouponRedeemed(event: CouponRedeemedEvent): void {
	// Load or create owner user
	let owner = User.load(event.params.owner);
	if (!owner) {
		owner = new User(event.params.owner);
		owner.save();
	}

	// Load the coupon
	let coupon = Coupon.load(event.params.contractAddress);
	if (!coupon) {
		log.error('Coupon not found for address {}', [event.params.contractAddress.toHexString()]);
		return;
	}

	// Load the project
	let project = Project.load(coupon.project);
	if (!project) {
		log.error('Project not found for coupon {}', [event.params.contractAddress.toHexString()]);
		return;
	}

	// Find the affiliate if it exists
	let affiliate = Affiliate.load(event.params.affiliateAddress);

	// Create the CouponRedeemed entity
	let entity = new CouponRedeemed(
		event.transaction.hash.concatI32(event.logIndex.toI32())
	);
	entity.coupon = coupon.id;
	entity.owner = owner.id;
	entity.feeAmount = coupon.fee;

	if (affiliate) {
		entity.affiliate = affiliate.id;
		// Update affiliate earnings based on fee
		affiliate.totalEarnings = affiliate.totalEarnings.plus(coupon.fee);
		affiliate.pendingPayments = affiliate.pendingPayments.plus(coupon.fee);
		affiliate.totalRedemptions = affiliate.totalRedemptions.plus(BigInt.fromI32(1));
		
		// Update payments tracking
		coupon.totalAffiliatePayments = coupon.totalAffiliatePayments.plus(coupon.fee);
		project.totalAffiliatePayments = project.totalAffiliatePayments.plus(coupon.fee);
		affiliate.save();
	}

	entity.timestamp = event.params.timestamp;
	entity.blockNumber = event.block.number;
	entity.blockTimestamp = event.block.timestamp;
	entity.transactionHash = event.transaction.hash;

	// Update the Coupon entity's isRedeemed field
	coupon.isRedeemed = true;

	// Save all entities
	entity.save();
	project.save();
	coupon.save();
}

export function handleTokenClaimed(event: TokenClaimedEvent): void {
	// Create or load receiver user
	let receiver = User.load(event.params.receiver);
	if (!receiver) {
		receiver = new User(event.params.receiver);
		receiver.save();
	}

	// Load the coupon and its project
	let coupon = Coupon.load(event.params.contractAddress);
	if (!coupon) {
		log.error('Coupon not found for address {}', [event.params.contractAddress.toHexString()]);
		return;
	}

	let project = Project.load(coupon.project);
	if (!project) {
		log.error('Project not found for coupon {}', [event.params.contractAddress.toHexString()]);
		return;
	}

	// Find the affiliate if it exists
	let affiliate = Affiliate.load(event.params.affiliateAddress);
	
	// Create the TokenClaimed entity
	let entity = new TokenClaimed(
		event.transaction.hash.concatI32(event.logIndex.toI32())
	);
	entity.project = project.id;
	entity.coupon = coupon.id;
	entity.claimer = event.params.claimer;
	entity.receiver = receiver.id;
	entity.quantity = event.params.quantity;

	if (affiliate) {
		entity.affiliate = affiliate.id;
	}

	// Update project stats
	project.totalClaims = project.totalClaims.plus(event.params.quantity);
	
	// Add receiver to project uniqueClaimers if not already present
	let projectClaimers = project.uniqueClaimers;
	let isNewProjectClaimer = true;
	for (let i = 0; i < projectClaimers.length; i++) {
		if (projectClaimers[i] == receiver.id) {
			isNewProjectClaimer = false;
			break;
		}
	}
	if (isNewProjectClaimer) {
		projectClaimers.push(receiver.id);
		project.uniqueClaimers = projectClaimers;
	}

	// Update affiliate stats if exists
	if (affiliate) {
		affiliate.totalClaims = affiliate.totalClaims.plus(event.params.quantity);
		
		// Add receiver to affiliate uniqueClaimers if not already present
		let affiliateClaimers = affiliate.uniqueClaimers;
		let isNewAffiliateClaimer = true;
		for (let i = 0; i < affiliateClaimers.length; i++) {
			if (affiliateClaimers[i] == receiver.id) {
				isNewAffiliateClaimer = false;
				break;
			}
		}
		if (isNewAffiliateClaimer) {
			affiliateClaimers.push(receiver.id);
			affiliate.uniqueClaimers = affiliateClaimers;
		}
		affiliate.save();
	}
	
	// Update ownership
	coupon.owner = receiver.id;

	entity.timestamp = event.params.timestamp;
	entity.blockNumber = event.block.number;
	entity.blockTimestamp = event.block.timestamp;
	entity.transactionHash = event.transaction.hash;

	// Save all entities
	entity.save();
	project.save();
	coupon.save();
}
