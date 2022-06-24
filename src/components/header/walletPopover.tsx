import { Popover, Transition } from '@headlessui/react'
import { ChevronDown, Copy, ExternalLink, LogOut } from 'react-feather'
import { Fragment } from 'react'

export default function WalletPopover({provider, publicKey}) {
  return (
    <div className="">
      <Popover className="relative">
        {({ open }) => (
          <>
            <Popover.Button className={`${open ? '' : 'text-opacity-90'} hover:bg-green-300 bg-neon-cyan text-black flex text-sm py-2 px-4 transform transition-all duration-200 hover:scale-105 font-semibold rounded-md`}>
              <span>{publicKey.slice(0, 5) + "..." + publicKey.slice(-4)}</span>
              <ChevronDown
                className={`${open ? '' : 'text-opacity-70'}
                  ml-2 h-5 w-5 text-orange-300 group-hover:text-opacity-80 transition ease-in-out duration-150`}
                aria-hidden="true"
              />
            </Popover.Button>
            <Transition
                show={open}
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
            >
              <Popover.Panel className="origin-top-right text-white absolute mt-2 right-0 z-50 bg-main-01 shadow-lg border-2 border-main-02 rounded-lg p-4 w-80">
                <div className="flex flex-col items-stretch">
                    <div className="font-semibold mb-3">Your wallet</div>
                    <div className='flex items-center justify-between text-sm'>
                        <p>{publicKey.slice(0, 6) + "..." + publicKey.slice(-4)}</p>
                        <div className='flex gap-2'>
                            <button 
                                onClick={() => {
                                    navigator.clipboard.writeText(publicKey)
                                }}
                                className="bg-gray-700 hover:bg-opacity-100 h-8 w-8 flex items-center justify-center rounded-full focus:outline-none font-medium">
                                <Copy size={12} className="text-white" />
                            </button>

                            <a 
                                href={`https://viewblock.io/zilliqa/address/${publicKey}`} 
                                rel="noreferrer"
                                target='_blank'
                                className="bg-gray-700 hover:bg-opacity-100 h-8 w-8 flex items-center justify-center rounded-full font-medium">
                                <ExternalLink size={12} className="text-white" />
                            </a>
                        </div>
                    </div>
                    <button
                        className="py-2 text-left flex items-center gap-3 rounded-full font-medium text-sm focus:outline-none"
                        onClick={async () => {
                            try {
                              await provider.disconnect();
                            } catch (err) {
                              console.warn(err);
                            }
                          }}
                    >
                        <div className="bg-gray-700 rounded-full h-8 w-8 flex items-center justify-center">
                            <LogOut size={12} />
                        </div>
                        Logout
                    </button>
                </div>
              </Popover.Panel>
            </Transition>
          </>
        )}
      </Popover>
    </div>
  )
}