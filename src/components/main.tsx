import { BN, web3 } from "@project-serum/anchor";
import { PublicKey, SYSVAR_RENT_PUBKEY } from "@solana/web3.js";
import {  useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { update } from "../redux/multiSig.actionDispatcher.ts";

const Main = ({wallet, transactionData})  => {

  const {programID, program} = transactionData

  const { SystemProgram, Keypair } = web3;
  /* create an account  */
  const baseAccount = Keypair.generate();
  console.log({programID})
  const [participants, setParticipants] = useState(['']);
  const [error, setError] = useState('')
  const [threshold, setThreshold] = useState(2)
  const [maxParticipants, setMaxParticipants] = useState(2)
  const baseSize = 8 + 8 + 1 + 4;
  const fudge = 64;
  const ownerSize = maxParticipants * 32 + 8;
  const multisigSize = baseSize + ownerSize + fudge;
  const navigate = useNavigate()   
  const dispatch = useDispatch()

  async function createCounter() {

    const owners = participants.map((p) => new PublicKey(p));  
    const [, nonce] = await PublicKey.findProgramAddress(
    [baseAccount.publicKey.toBuffer()],
    program.programId
    );
    console.log(baseAccount.publicKey.toBase58())
    try {
        const tx = await program.rpc.createAccount(
            owners,
            new BN(threshold),
            nonce,
            {
              accounts: {
                multisig: baseAccount.publicKey,
                rent: SYSVAR_RENT_PUBKEY,
              },
              signers: [baseAccount],
              instructions: [
                await program.account.transaction.createInstruction(
                  baseAccount,
                  // @ts-ignore
                  multisigSize
                ),
              ],
            },
          );
        console.log(await tx);
        dispatch(update(baseAccount.publicKey.toBase58()));
        navigate('/multisig')
      }
    catch (err: any) {console.log(err)}
    }

    return(
        <div className="flex justify-center mt-10 text-white items-center">
          <div className="w-full max-w-screen-sm p-4 grid grid-flow-row gap-5 text-left rounded-md border-main-03 border  bg-gray-900">
              <input onChange={(e) => setThreshold(parseInt(e.target.value) as number)} placeholder="Enter Threshold" className="w-full outline-none m-auto bg-gray-800 p-2 font-medium text-sm text-gray-400 focus:bg-gray-700 focus:text-gray-300 rounded-md" />
              <input onChange={(e) => parseInt(e.target.value) < 5 ? setMaxParticipants(parseInt(e.target.value) as number) : setError('Max participants should be less than 10 ')} placeholder="Max Participants" className="w-full outline-none m-auto bg-gray-800 p-2 font-medium text-sm text-gray-400 focus:bg-gray-700 focus:text-gray-300 rounded-md" />              
              {participants.map((p, idx) => (
                <input
                  value={p} 
                  onChange={
                  (e) => {const p = [...participants];
                    p[idx] = e.target.value;
                  setParticipants(p);
                }} 
                placeholder="Enter Wallet ID" className="w-full outline-none m-auto bg-gray-800 p-2 font-medium text-sm text-gray-400 focus:bg-gray-700 focus:text-gray-300 rounded-md" 
                />
              ))}
          <div className="flex justify-between items-center">
            <div className="text-red-400 text-xs italic">
              {error}
            </div>
            <button
              className="w-6 h-6 text-xl rounded-full text-gray-400 bg-gray-800 flex justify-center items-center"
              onClick={() => {
                if (participants.length < maxParticipants) {
                  const p = [...participants];
                  // @ts-ignore
                  p.push('');
                  setParticipants(p);
                } else {
                  setError('Participants should be less than max participants')
                }
              }}
            >
              <p>+</p>
            </button>
          </div>
          <button onClick={() => createCounter()} className="bg-main-02 rounded-md p-2 text-black font-medium">Create Account</button>      
          </div>
        </div>
    )
}

export default Main