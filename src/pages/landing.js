'use client'

import React, { useState, useEffect, useRef } from 'react';
import { Box, Button, Modal, Stack, TextField, Typography } from "@mui/material";
import { firestore } from '@/firebase';
import { collection, getDocs, getDoc, setDoc, doc, query, deleteDoc } from 'firebase/firestore';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';

import { GoogleGenerativeAI } from "@google/generative-ai";

import { ToastContainer } from 'react-toastify';
import { toast } from 'react-toastify';

import { useAuth } from '../context/AuthContext';

import 'react-toastify/dist/ReactToastify.css';
import ProtectedRoutes from './components/ProtectedRoutes';

// firebase storage
import { storage } from '../../firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

import {Camera} from "react-camera-pro";
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import CameraEnhanceIcon from '@mui/icons-material/CameraEnhance';
import CancelPresentationIcon from '@mui/icons-material/CancelPresentation';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  color: 'black',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4
};

export default function Home() {
  const [pantry, setPantry] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [searchItem, setSearchItem] = useState('');
  const {user, signOut} = useAuth();
  const camera = useRef(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [photoTaken, setPhotoTaken] = useState(false);
  const [cameraPhotoUrl, setCameraPhotoUrl] = useState(null);
  const [recipe, setRecipe] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const dataURLtoFile = (dataUrl, fileName) => {
    const arr = dataUrl.split(",");
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
  
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
  
    return new File([u8arr], fileName, { type: mime });
  };

  const handleFileChange = (event) => {
    setImageFile(event.target.files[0]);
    setPhotoTaken(false);
    setCameraPhotoUrl(null);
  };

  const handleTakePhoto = () =>{
    const photoUrl = camera.current.takePhoto();
    setCameraPhotoUrl(photoUrl);

    const timestamp = new Date().toISOString().replace(/[-:.]/g, "");
    const fileName = `photo_${timestamp}.jpg`;
    const photoFile = dataURLtoFile(photoUrl, fileName);

    console.log("PHOTO FILE: " + photoFile);
    setImageFile(photoFile);
    setPhotoTaken(true);
    setCameraOpen(false);
  }

  const uploadImage = async (file) => {
    try{
      const storageRef = ref(storage, 'images/' + file.name);
      await uploadBytes(storageRef, file);
      return getDownloadURL(storageRef);
    }
    catch(error){
      console.error("Error uploading image: ", error);
      return '/images/pantry.png';
    }
  };

  const getPantryItems = async () => {
    const itemNames = [];
    try {
      const snapshot = query(collection(firestore, 'users', user.uid, 'items'));
      const docs = await getDocs(snapshot);
  
      docs.forEach((doc) => {
        itemNames.push(doc.id);
      });
    } catch (error) {
      console.error("Error fetching item names: ", error);
    }
    return itemNames;
  };

  const generateRecipe = async () => {
    setIsLoading(true);
    const ingredients = (await getPantryItems()).join(', ');
    // console.log("INGREDIENTS: " + ingredients);

    const systemPrompt = `You will be a given a list of ingredients. Given these ingredients, create a recipe using all those items.`;

    const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);

    const request = `${systemPrompt}\n\nIngredients: ${ingredients}`;

    const model = genAI.getGenerativeModel({
        model: "gemini-1.0-pro",
    });

    const result = await model.generateContent(request);
    const response = result.response.text();

    // console.log("RECIPE: " + response);

    setRecipe(response);

    setIsLoading(false);

    return response;
  };

  const updatePantry = async () => {
    const pantryList = [];
    const pantryCollectionRef = collection(firestore, 'users', user.uid, 'items');
    const pantryQuery = query(pantryCollectionRef);

    const docs = await getDocs(pantryQuery);

    docs.forEach((doc) => {
      pantryList.push({
        name: doc.id,
        ...doc.data()
      });
    });
    
    setPantry(pantryList);
    setSearchResults(pantryList);
  };

  const addItem = async (itemName, imageUrl) => {
    // console.log("IMAGE URL FIRST RIGHT AFTER PHOTO: " + imageUrl);

    if(itemName === ''){
      toast.error('Please enter an item name.');
      return;
    }

    const docRef = doc(firestore, 'users', user.uid, 'items', itemName);
    const docSnap = await getDoc(docRef);

    if(docSnap.exists() && open){
      toast.error(`${itemName} already exists in pantry!`);
      return;
    }
    else if(docSnap.exists()){
      const { count } = docSnap.data();
      await setDoc(docRef, { ...docSnap.data(), count: count + 1});

      setPantry(prevPantry => prevPantry.map(item =>
        item.name === itemName ? { ...item, count: count + 1 } : item
      ));

      setSearchResults(prevSearchResults => prevSearchResults.map(item =>
        item.name === itemName ? { ...item, count: count + 1} : item
      ));

      toast.success(`${itemName} added to pantry!`);

      return;
    }

    if(imageUrl === undefined || imageUrl === null){
      imageUrl = '/images/pantry.png';
    }
    else{
      imageUrl = await uploadImage(imageFile);
    }

    // console.log("IMAGE URL: " + imageUrl);

    try{
        await setDoc(docRef, { count: 1, image: `${imageUrl}` });
        setPantry(prevPantry => [...prevPantry, { name: itemName, count: 1, image: `${imageUrl}` }]);
        setSearchResults(prevSearchResults => [...prevSearchResults, { name: itemName, count: 1, image: `${imageUrl}` }]);
        toast.success(`${itemName} added to pantry!`);
    }
    catch(error){
      console.error("Error adding item: ", error);
      toast.error(`Unable to add ${itemName} to pantry`);
    }
    
  };

  const removeItem = async (itemName) => {
    const docRef = doc(firestore, 'users', user.uid, 'items', itemName);
    const docSnap = await getDoc(docRef);

    try{
      if(docSnap.exists()) {
        const { count, image } = docSnap.data();

        if(count === 1) {
          await deleteDoc(docRef);
  
          setPantry(prevPantry => prevPantry.filter(item => item.name !== itemName));
          setSearchResults(prevSearchResults => prevSearchResults.filter(item => item.name !== itemName));

          if(image && image !== '/images/pantry.png'){
            // console.log("IMAGE URL: " + image);
              const imageRef = ref(storage, `${image}`);
              await deleteObject(imageRef).catch((error) => {
                  console.error("Error deleting image: ", error);
                  toast.error(`Unable to delete image for ${itemName}`);
              });
          }
  
          toast.success(`${itemName} removed from pantry!`);
        }
        else {
          await setDoc(docRef, { ...docSnap.data(), count: count - 1 });
          setPantry(prevPantry => prevPantry.map(item =>
            item.name === itemName ? { ...item, count: count - 1 } : item
          ));
          setSearchResults(prevSearchResults => prevSearchResults.map(item =>
            item.name === itemName ? { ...item, count: count - 1 } : item
          ));
        }
      }
    }
    catch(error){
      console.error("Error removing item: ", error);
      toast.error(`Unable to remove ${itemName} from pantry`);
    }
    
  };

  const handleSearch = async () => {
    if (searchItem !== '') {
      const searchResults = pantry.filter(item =>
        item.name.toLowerCase().includes(searchItem.toLowerCase())
      );
      setSearchResults(searchResults);
    } else {
      setSearchResults(pantry);
    }
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  useEffect(() => {
    updatePantry();
  }, []);

  useEffect(() => {
    handleSearch();
  }, [searchItem]);

  return (

    <ProtectedRoutes>    
    <div className="overflow-x-hidden">
      <ToastContainer limit={5} />

      {/* navbar */}
      <nav className="bg-blue-500 p-4">
        <div className="container mx-auto flex justify-between items-center">
          <Stack direction={'row'} spacing={2}>
            <div className="text-white text-2xl font-bold">
              PantryPal
            </div>
            <img src="/images/pantry.png" alt="pantry" className="w-8 h-8" />
          </Stack>




          <ul className="lg:flex lg:items-center lg:space-x-6 lg:block">
            <li>
              {/* search bar */}
              <TextField
                autoFocus
                margin="dense"
                id="search"
                name="search"
                label="Search"
                type="search"
                width="100%"
                variant="outlined"
                value={searchItem}
                onChange={(e) => {
                  setSearchItem(e.target.value);
                }}
                InputProps={{
                  style: { color: 'white' },
                }}
                InputLabelProps={{
                  style: { color: 'white' }
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: 'white',
                    },
                    '&:hover fieldset': {
                      borderColor: 'white',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'white',
                    },
                  },
                }}
              />
            </li>

            <li>
              {user ? <p>{user.email}</p> : <p>Please log in</p>}
            </li>

            <li>
              <ExitToAppIcon onClick={signOut} className="text-white cursor-pointer hover:text-black" />
            </li>
          </ul>
        </div>
      </nav>




<Box
  width="100vw"
  height="50vw"
  display={'flex'}
  marginTop={'100px'}
  flexDirection={'column'}
  alignItems={'center'}
  gap={2}
>
  <Modal
    open={open}
    onClose={handleClose}
    aria-labelledby="modal-modal-title"
    aria-describedby="modal-modal-description"
  >
    <Box sx={style}>
      <Stack direction={'column'}>

        <Typography id="modal-modal-title" variant="h6" component="h2">
          Add Item
        </Typography>


        <Typography id="modal-modal-description" sx={{ mt: 2, mb: 3}}>
          Enter an item to add to your pantry.
        </Typography>

        <TextField
          label="Item Name"
          variant="outlined"
          value={itemName}
          onChange={(e) => setItemName(e.target.value)}
        />

        {!cameraOpen && (
                  <input
                  type="file"
                  onChange={handleFileChange}
                  className='mt-4'
              />
        )}

        {!cameraOpen && (
        <Button onClick={() => {setCameraOpen(true)
          setPhotoTaken(false)
          setImageFile(null)
          setCameraPhotoUrl(null)
        }
        }>
          <CameraAltIcon />
        </Button>
        )}

        {cameraOpen && (
        <div className="mt-4">
          <Camera ref={camera} aspectRatio={4 / 3} />
          <Button onClick={handleTakePhoto}>
            <CameraEnhanceIcon />
          </Button>
          <Button onClick={() => setCameraOpen(false)}>
            <CancelPresentationIcon />
          </Button>
        </div>
       )}

       {photoTaken && (
        <img src={cameraPhotoUrl} alt="item" className="w-64 h-64" />
       )}

        

        <Button
          onClick={() => {
            addItem(itemName, imageFile);
            setItemName('');
            setImageFile(null);
            setCameraPhotoUrl(null);
            setPhotoTaken(false);
            handleClose();
          }}
          variant="contained" style={{ marginTop: '12px' }}
        >
          Add
        </Button>
      </Stack>
    </Box>
  </Modal>

  <Button disabled={isLoading} onClick={generateRecipe}>
    Craft Recipe
  </Button>

  {recipe && (
        <div style={{ marginTop: '20px' }}>
          <pre
            style={{
              backgroundColor: '#3293a8',
              padding: '15px',
              borderRadius: '5px',
              whiteSpace: 'pre-wrap',
              wordWrap: 'break-word',
            }}
          >
            {recipe}
          </pre>
        </div>
      )}

  <AddCircleIcon
  onClick={handleOpen}
  className='h-16 w-16 bg-blue-500 text-white rounded-full cursor-pointer transition-transform duration-300 ease-in-out hover:scale-105'
/>




  <Box border={'3px solid white'}>
  {/* Header Row */}
  <Box
    width="100%"
    display={'flex'}
    justifyContent={'space-between'}
    padding={'5px'}
    bgcolor={'gray-200'}
    className="text-lg font-semibold"
  >
    <Typography
      variant={'h6'}
      color={'white'}
      textAlign={'center'}
      ml={5}
      flex={1}
    >
      Item
    </Typography>
    <Typography
      variant={'h6'}
      color={'white'}
      textAlign={'center'}
      flex={1}
    >
      Quantity
    </Typography>
  </Box>
  {/* Items List */}
  <Stack width="800px" height="400px" spacing={1} overflow={'auto'}>
    {searchResults.map((item) => (
      <Box
        key={item.name}
        width="100%"
        height="200px"
        display={'flex'}
        justifyContent={'space-between'}
        alignItems={'center'}
        className="bg-gray-400"
        padding={'5px'}
      >

        <img src={item.image} alt="pantry" className="w-32 h-32" />

<Typography
  variant={'body1'}
  color={'black'}
  textAlign={'center'}
  flex={1}
  sx={{ 
    fontSize: 32,  // Optional: explicitly set font size if needed
    fontFamily: 'Roboto Slab',
    overflow: 'hidden',          // Hide overflow text
    textOverflow: 'ellipsis',     // Show ellipsis when text overflows
    whiteSpace: 'nowrap',         // Prevent text from wrapping to the next line
  }}
>
  {item.name}
</Typography>

        <Typography
          variant={'body1'}  // Smaller text size
          color={'black'}
          textAlign={'center'}
          flex={1}
          sx={{ fontSize: 32 }}  // Optional: explicitly set font size if needed
          style={{ fontFamily: 'Roboto Slab',  textAlign: 'center'}}

        >
          {item.count}
        </Typography>

        <Stack direction={'row'} spacing={2}>
          <AddCircleIcon
            onClick={() => addItem(item.name)}
            className="text-blue-500 cursor-pointer transition-colors duration-300 hover:text-green-500"
          />
          <RemoveCircleIcon
            onClick={() => removeItem(item.name)}
            className="text-red-500 cursor-pointer transition-colors duration-300 hover:text-yellow-500"
          />
        </Stack>
      </Box>
    ))}
  </Stack>
</Box>

</Box>
    </div>

    </ProtectedRoutes>

  );
}
