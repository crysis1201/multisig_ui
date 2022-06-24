import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { update } from "../redux/multiSig.actionDispatcher.ts";

const ImportWallet = ({publicKey}) => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    return(
        <div className="flex mt-10 justify-center items-center" >
            <div className="max-w-screen-sm w-full bg-gray-900 border-main-03 border rounded-md p-4" >
                <input onChange={(e) => dispatch(update(e.target.value))} placeholder="Enter multisig Wallet" className="w-full outline-none m-auto bg-gray-800 p-2 font-medium text-sm text-gray-400 focus:bg-gray-700 focus:text-gray-300 rounded-md" /> 
                <div onClick={() => {
                    if(publicKey) {
                        navigate('/multisig')
                    }
                }} className="flex justify-end"><button className="font-medium bg-main-02 rounded-md p-2 mt-4">{publicKey ? 'Import' : 'connectWallet'}</button></div>
            </div>
        </div>
    )
}

export default ImportWallet