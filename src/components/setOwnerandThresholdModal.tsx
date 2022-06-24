import { Dialog, Transition } from '@headlessui/react'
import { BN } from '@project-serum/anchor';
import { Keypair, PublicKey, SYSVAR_RENT_PUBKEY } from '@solana/web3.js';
import { Fragment, useEffect, useState } from 'react'
import toast from 'react-hot-toast';

export default function SetOwnerModal({program, programID, provider, isOpen, publicKey}) {

  let [Open, setIsOpen] = useState(false)
  useEffect(() => {
    setIsOpen(isOpen)
  }, [isOpen])
  const [participants, setParticipants] = useState(['']);
  const [threshold, setThreshold] = useState(2)
  const [error, setError] = useState('')

  function closeModal() {
    setIsOpen(false)
  }

  const setOwner = async () => {
    const [multisigSigner] = await PublicKey.findProgramAddress(
        [publicKey.toBuffer()],
        programID
    );  
    const accounts = [
        {
          pubkey: publicKey,
          isWritable: true,
          isSigner: false,
        },
        {
          pubkey: multisigSigner,
          isWritable: false,
          isSigner: true,
        },
      ];    
    const owners = participants.map((p) => new PublicKey(p));
    const data = setOwnersData(owners);
    function setOwnersData(owners) {
        return program.coder.instruction.encode("set_owners_and_change_threshold", {
        owners,
        threshold: new BN(threshold)
    }); 
    }    
    toast.loading('set owner transaction started...')
    const transaction = Keypair.generate();
    const txSize = 5000; // TODO: tighter bound.
    const tx = await program.rpc.createTransaction(
    programID,
    accounts,
    data,
    {
        accounts: {
        multisig: publicKey,
        transaction: transaction.publicKey,
        proposer: provider.wallet.publicKey,
        rent: SYSVAR_RENT_PUBKEY,
        },
        signers: [transaction],
        instructions: [
        await program.account.transaction.createInstruction(
            transaction,
            // @ts-ignore
            txSize
        ),
        ],
    }
    );
    toast.success("Transaction success")
    }

  return (
    <>
      <Transition appear show={Open} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full grid gap-2 grid-flow-row max-w-md transform overflow-hidden rounded-2xl bg-main-00 p-6 text-left align-middle shadow-xl transition-all">
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
                    <input
                        onChange={(e) => setThreshold(parseInt(e.target.value) as number)}
                        placeholder="Enter threshold" className="w-full outline-none m-auto bg-gray-800 p-2 font-medium text-sm text-gray-400 focus:bg-gray-700 focus:text-gray-300 rounded-md" 
                    />
                    <div className='flex justify-between'>
                        <div className="text-red-400 text-xs italic">
                            {error}
                        </div>
                        <button
                            className="w-6 h-6 text-xl rounded-full text-gray-400 bg-gray-800 flex justify-center items-center"
                            onClick={() => {
                                if (participants.length < 5) {
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
                    
                    
                  <div className="mt-4">
                    <button
                      type="button"
                      className="bg-main-03 p-2 font-medium rounded-md text-black"
                      onClick={() => {
                        if(threshold < 0 || threshold > 5) {
                            setError('invalid threshold')
                        } else {
                            setOwner().catch((err) => toast.error(err.toString()))
                        }
                      }}
                    >
                      Set Owner and Threshold
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  )
}