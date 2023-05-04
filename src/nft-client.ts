import { initializeSolSignerKeypair, airdropSolIfNeeded } from "./scripts/initializeKeypair"
import * as web3 from "@solana/web3.js"

import createNfts from "./scripts/metaplex/createNftOrCollection"
import addAndVerifyCollection from "./scripts/metaplex/addNftToCollection"


async function main() {

  const cluster = 'devnet'
  const connection = new web3.Connection(web3.clusterApiUrl(cluster))

  const signer = initializeSolSignerKeypair()
  await airdropSolIfNeeded(signer, connection)

  // Create collection NFT 
  console.log(``)
  console.log('***NEXT PROCESS - CREATING NFT(s) ...')
  console.log(``)
  const arrayOfNfts = await createNfts(cluster, signer, 'assets')
  console.log(`***RESULT - NUMBER OF NFT(S) CREATED: ${arrayOfNfts.length}`)
  console.log(``)

  console.log(``)
  console.log(`***NEXT PROCESS - ADDING AND VERIFYING COLLECTION ${arrayOfNfts[0]} TO NFT(S) ...`)
  console.log(``)
  // Add and verify NFT to collection
  const arrayOfVerifications = await addAndVerifyCollection(cluster, signer, arrayOfNfts)
  console.log(`***RESULT - NUMBER OF NFT(S) ADDED AND VERIFIED TO COLLECTION: ${arrayOfVerifications.length}`)
  console.log('')


  
  return arrayOfNfts

}

async function wait(seconds : number): Promise<void> {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve();
    }, seconds * 1000);
  });
}



main().then(() => {
    console.log('Finished successfully')
    console.log(``)
    process.exit(0)
}).catch(error => {
    console.log(error)
    process.exit(1)
})