import {  TokenMetadata } from '../generated/schema';
import { Bytes, dataSource, json , log } from '@graphprotocol/graph-ts';

export function handleMetadata(content: Bytes): void {
	const tokenId = dataSource.stringParam();
  let metadata = new TokenMetadata(tokenId);

  const value = json.fromBytes(content).toObject();
	
  if (value) {
    const image = value.get("image");
    const name = value.get("name");
    const bgColor = value.get("bgColor");
    const textColor = value.get("textColor");
    const logo = value.get("logo");
    const address = value.get("address");
    const description = value.get("description");
		const qrColor = value.get("qrColor");


    if (image) metadata.image = image.toString();
    if (name) metadata.name = name.toString();
    if (bgColor) metadata.bgColor = bgColor.toString();
    if (textColor) metadata.textColor = textColor.toString();
    if (logo) metadata.logo = logo.toString();
    if (address) metadata.address = address.toString();
    if (description) metadata.description = description.toString();
		if (qrColor) metadata.qrColor = qrColor.toString();

    metadata.save();
  }
}
