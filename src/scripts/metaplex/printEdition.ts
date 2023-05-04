import { airdropSolIfNeeded, initializeSolSignerKeypair } from "../initializeKeypair"
import * as web3 from "@solana/web3.js"
import {  PublicKey } from "@solana/web3.js"

import {
  Metaplex,
  keypairIdentity,
  bundlrStorage
} from "@metaplex-foundation/js"

const mint = new PublicKey("43kuMteF9GbND7jrDperBR85Tv27Pb6hCQjsVE4BnUyq")

async function main() {
  const connection = new web3.Connection(web3.clusterApiUrl("devnet"))
  const user = await initializeSolSignerKeypair()
  await airdropSolIfNeeded(user, connection)


  const edition = await printEdition(connection, user)

  return edition

}

async function printEdition(
  connection: web3.Connection,
  signer: web3.Keypair

) {

  // Set Metaplex with signer
  const metaplex = Metaplex.make(connection)
  .use(keypairIdentity(signer))

  const nft  = await metaplex.nfts().printNewEdition({
    originalMint: mint,
    // newUpdateAuthority: user.publicKey,
    // newUpdateAuthority: new PublicKey("")
    // newOwner: new PublicKey("JakevMAR7R4Evr4PZpTqNAb1KkVXAskzYohd1vxEUqj")
  }); 

  console.log("New edition: ", nft) 
}


main()
  .then(() => {
    console.log("Finished successfully")
    process.exit(0)
  })
  .catch((error) => {
    console.log(error)
    process.exit(1)
  })

