import { airdropSolIfNeeded, initializeSolSignerKeypair } from "../initializeKeypair"
import * as web3 from "@solana/web3.js"
import { PublicKey } from "@solana/web3.js"

import {
  toBigNumber,
  Metaplex,
  keypairIdentity
} from "@metaplex-foundation/js"




async function main() {
  const cluster = 'devnet'
  const connection = new web3.Connection(web3.clusterApiUrl(cluster))
  const user = await initializeSolSignerKeypair()
  await airdropSolIfNeeded(user, connection)

  const arrayOfNfts = [new PublicKey("9g6XoZE1q7MXs9qzcRNvXYhyzhLw4k4so49nRn6U9ykg"), new PublicKey("DoxNzhJQm23m2Rxgk3xMefJki6Mo5f2c2ZE3FP4KpshK") ] 

  const arrayOfVerifications = await addAndVerifyCollection(cluster, user, arrayOfNfts)

  return arrayOfVerifications

}



// Add and verify NFT to collection 
export default async function addAndVerifyCollection(
  cluster: web3.Cluster,
  signer: web3.Keypair,
  arrayOfNfts: web3.PublicKey[], // First NFT is collection NFT
) : Promise<Array<any>> {


  // Set up Metaplex with signer
  const connection = new web3.Connection(web3.clusterApiUrl(cluster))
  const metaplex = Metaplex.make(connection)
  .use(keypairIdentity(signer))

  // Get number of NFTs with collection NFT
  const numberOfNfts = arrayOfNfts.length

  let i = 1
  let arrayOfVerifications = []
  while (i < numberOfNfts) {
    // Get "NftWithToken" type from mint address
    const nft = await metaplex.nfts().findByMint( { mintAddress: arrayOfNfts[i]})

    // Update metaplex data and add collection
    await metaplex
    .nfts()
    .update({
      nftOrSft: nft,
      collection: arrayOfNfts[0],
    })

    console.log(`(${i}/${numberOfNfts-1}) Token Mint: https://explorer.solana.com/address/${nft.address.toString()}?cluster=${cluster}`)
    console.log(`(${i}/${numberOfNfts-1}) Waiting to verify collection ${arrayOfNfts[0]} on mint ${arrayOfNfts[i]}... `)
    

    // verify collection by owner
    const { response } = await metaplex.nfts().verifyCollection({
      mintAddress: arrayOfNfts[i],
      collectionMintAddress: arrayOfNfts[0],
      isSizedCollection: false
    })

    // await metaplex
    // .nfts()
    // .migrateToSizedCollection( {
    //   mintAddress: arrayOfNfts[0],
    //   size: toBigNumber(1)
    // })

    console.log(`(${i}/${numberOfNfts-1}) Signature Explorer: https://explorer.solana.com/signuature/${response.signature}?cluster=${cluster}`)
    console.log('')

    arrayOfVerifications.push(response.signature)




    i++

  }

return arrayOfVerifications

}

