import WalletPopover from "./walletPopover.tsx";

const Header = ({provider, publicKey}) => {
    console.log(publicKey)
    return (
        <div className="flex justify-between mx-auto max-w-screen-xl mb-10">
            <div className="text-xl text-white font-semibold">
            MultiSig      
          </div>
            <div className="flex md:gap-7 gap-2 justify-center items-center w-2/5">
            
            <div className="sm:block hidden">
                {provider && publicKey ? 
                    <WalletPopover provider={provider} publicKey={publicKey.toBase58()} /> 
                    :  
                    <button className="bg-main-03 text-black font-medium rounded-md p-2" onClick={async () => {
                        try {
                        await provider.connect();
                        } catch (err) {
                        console.warn(err);
                        }
                    }}>Connect</button>}
                    </div>
            </div>
        </div>
    )
}

export default Header