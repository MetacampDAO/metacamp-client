import { airdropSolIfNeeded, initializeSolSignerKeypair } from "../initializeKeypair"
import * as web3 from "@solana/web3.js"
import { NFTStorageMetaplexor } from '@nftstorage/metaplex-auth'


import {
  Metaplex,
  keypairIdentity,
  CreateNftOutput
} from "@metaplex-foundation/js"
import * as fs from "fs"



async function main() {
  const cluster = 'devnet'
  const connection = new web3.Connection(web3.clusterApiUrl(cluster))
  const user = await initializeSolSignerKeypair()
  await airdropSolIfNeeded(user, connection)

  // Create Nfts through the asset directory
  const assetDirectory = "assets" 
  const arrayOfNfts = await createNfts(cluster, user, assetDirectory)

  return arrayOfNfts

}


// create NFT
export default async function createNfts(
  cluster: web3.Cluster,
  signer: web3.Keypair,
  assetDirectory: string
): Promise<web3.PublicKey[]> {

  // Checking files in asset directory
  const jsonType = '.json';
  const files = await fs.promises.readdir(assetDirectory);
  const jsonFiles = files.filter(file => file.endsWith(jsonType));
  const otherFiles = files.filter(file => !file.endsWith(jsonType));
  const collectionFiles = files.filter(file => file.startsWith("collection.json"));
  console.log(`${jsonFiles.length} JSON files and ${otherFiles.length} other files found, among collection.json file is found.`);
  console.log(``)

  // Creating NFTs
  const numberOfNfts = jsonFiles.length;
  const arrayOfNtfs: web3.PublicKey[] = [];
  for (let i = 0; i < numberOfNfts; i++) {
    
    if (i == 0) {

      // Create Collection mint
      console.log(`(${i+1}/${numberOfNfts}) Creating NFT from collection.json ...`)
      const collectionData = await createNft(cluster, signer, assetDirectory + "/collection.json");
      console.log(`(${i+1}/${numberOfNfts}) Created Collection NFT Explorer: https://explorer.solana.com/address/${collectionData.nft.address.toString()}?cluster=${cluster}`)
      console.log(``)
      arrayOfNtfs.push(collectionData.nft.address);
      i++

    }

    // Create NFT mint
    console.log(`(${i+1}/${numberOfNfts}) Creating NFT from ${i-1}.json ...`)
    const mintData = await createNft(cluster, signer, assetDirectory + `/${i-1}.json`);
    console.log(`(${i+1}/${numberOfNfts}) Created NFT Explorer: https://explorer.solana.com/address/${mintData.nft.address.toString()}?cluster=${cluster}`)
    console.log(``)
    arrayOfNtfs.push(mintData.nft.address);

  }



  // Return the array of NFT keys, including the collection key
  return arrayOfNtfs;

}


export async function createNft(
  cluster: web3.Cluster,
  signer: web3.Keypair,
  assetPath: string
) : Promise<CreateNftOutput>{


  const connection = new web3.Connection(web3.clusterApiUrl(cluster))

  // Setup Metaplex bundlrStorage and signer
  const metaplex = Metaplex.make(connection)
  .use(keypairIdentity(signer))


  // Set up NFT-Storage client
  const client = NFTStorageMetaplexor.withSecretKey(signer.secretKey, {
    solanaCluster: cluster,
    mintingAgent: 'Metacamp',
  })

  // Upload NFT with NFT-Storage
  const nft = await client.storeNFTFromFilesystem(assetPath)
  console.log(`JSON file uploaded to ${nft.metadataGatewayURL}`)
  console.log(`Image file uploaded to ${nft.metadata.image}`)


  // Send tx to Solana and create NFT
  const data = await metaplex
    .nfts()
    .create({
      uri: nft.metadataGatewayURL,
      name: nft.metadata.name,
      sellerFeeBasisPoints: nft.metadata.sellerFeeBasisPoints,
      symbol: nft.metadata.symbol,
      uses: {
        useMethod: 0,
        remaining: 4294967295,
        total: 4294967295
      }
      // maxSupply: null
    })

  console.log(`Signature Explorer: https://explorer.solana.com/tx/${data.response.signature}?cluster=devnet$`)

  return data

}