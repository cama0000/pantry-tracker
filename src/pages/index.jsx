import { Button } from '@mui/material';
import Link from 'next/link';
import React from 'react';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import {auth} from '../../firebase';
import { useRouter } from 'next/router';



const index = () => {
  const router = useRouter();

  const handleGoogle = async (e) => {
    const provider = await new GoogleAuthProvider();

    try{
      const result = await signInWithPopup(auth, provider);
      router.push('/landing')
    }catch(err){
      console.log(err);
    }
  }

  return (
    <div className="flex flex-col min-h-screen relative">

      <div className="flex-grow content flex flex-col items-center mt-40">
        <span className="font-bold text-4xl mb-5 text-center">
          Be seamlessly productive.
        </span>

        <Button onClick={handleGoogle} variant="contained" color="primary" style={{ backgroundColor: 'purple', color: 'white' }}>
          Sign in with Google
        </Button>

        <span className="font-bold text-4xl mt-20 mb-5 text-center">
          What is Wave?
        </span>

        <div className="mt-2 max-w-2xl text-center">
            <span className="text-lg mb-5 block">
                Wave is your one-stop solution to studying and tracking deadlines.
            </span>
        </div>
      </div>

    </div>
  );
}

export default index;
