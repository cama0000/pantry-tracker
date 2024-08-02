'use client'

import React, { useState, useEffect } from 'react';
import { Box, Button, Modal, Stack, TextField, Typography } from "@mui/material";
import { firestore } from '@/firebase';
import { collection, getDocs, getDoc, setDoc, doc, query, deleteDoc } from 'firebase/firestore';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import OpenAI from 'openai';
import Navbar from "./components/navbar";

import { ToastContainer } from 'react-toastify';
import { toast } from 'react-toastify';

import 'react-toastify/dist/ReactToastify.css';

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

const client = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true 
});

export default function Home() {
  const [pantry, setPantry] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState('');
  const [searchItem, setSearchItem] = useState('');

  const getPantryItems = async () => {
    const itemNames = [];
    try {
      const snapshot = query(collection(firestore, 'pantry'));
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
    const ingredients = (await getPantryItems()).join(', ');
    console.log("INGRE: " + ingredients);

    const prompt =  `Here is a list of ingredients I have: ${ingredients}. Please suggest a recipe that can be made using these ingredients.`;

    try {
      const params = {
        messages: [{ role: 'user', content: `${prompt}` }],
        model: 'gpt-3.5-turbo',
      };
      const chatCompletion = await client.chat.completions.create(params);
      return chatCompletion.data.choices[0].message.content.trim();
    } catch (error) {
      console.error('Error fetching recipe suggestion:', error);
      return 'Sorry, I could not generate a recipe at this time.';
    }
  };

  const displayRecipe = async () => {
    const recipe = await generateRecipe();
    alert(recipe);
  };

  const updatePantry = async () => {
    const snapshot = query(collection(firestore, 'pantry'));
    const docs = await getDocs(snapshot);
    const pantryList = [];

    docs.forEach((doc) => {
      pantryList.push({
        name: doc.id,
        ...doc.data()
      });
    });
    setPantry(pantryList);
    setSearchResults(pantryList);
  };

  const addItem = async (itemName) => {
    const docRef = doc(firestore, 'pantry', itemName);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const { count } = docSnap.data();
      await setDoc(docRef, { count: count + 1 });
      setPantry(prevPantry => prevPantry.map(item =>
        item.name === itemName ? { ...item, count: count + 1 } : item
      ));
      setSearchResults(prevSearchResults => prevSearchResults.map(item =>
        item.name === itemName ? { ...item, count: count + 1 } : item
      ));
    } else {
      await setDoc(docRef, { count: 1 });
      setPantry(prevPantry => [...prevPantry, { name: itemName, count: 1 }]);
      setSearchResults(prevSearchResults => [...prevSearchResults, { name: itemName, count: 1 }]);
    }

    toast.success(`${itemName} added to pantry!`);
  };

  const removeItem = async (itemName) => {
    const docRef = doc(firestore, 'pantry', itemName);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const { count } = docSnap.data();
      if (count === 1) {
        await deleteDoc(docRef);
        setPantry(prevPantry => prevPantry.filter(item => item.name !== itemName));
        setSearchResults(prevSearchResults => prevSearchResults.filter(item => item.name !== itemName));

        toast.success(`${itemName} removed from pantry!`);
      } else {
        await setDoc(docRef, { count: count - 1 });
        setPantry(prevPantry => prevPantry.map(item =>
          item.name === itemName ? { ...item, count: count - 1 } : item
        ));
        setSearchResults(prevSearchResults => prevSearchResults.map(item =>
          item.name === itemName ? { ...item, count: count - 1 } : item
        ));
      }
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
    
    <div className="overflow-x-hidden">
      <ToastContainer limit={5} />

      {/* navbar */}
      <nav className="bg-gray-800 p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="text-white text-2xl font-bold">
            <a href="/">PantryPal</a>
          </div>
          <img src="pantry-tracker/images/pantry.png" alt="pantry" />
          <div className="lg:hidden">
            <button className="text-white">
              &#9776; {/* Hamburger icon */}
            </button>
          </div>
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
          </ul>
        </div>
      </nav>

      <Box
        width="100vw"
        height="100vw"
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

              <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                Enter an item to add to your pantry.
              </Typography>

              <TextField
                label="Item Name"
                variant="outlined"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
              />

              <Button
                onClick={() => {
                  addItem(itemName);
                  setItemName('');
                  handleClose();
                }}
                variant="contained" style={{ marginTop: '12px' }}
              >
                Add
              </Button>
            </Stack>
          </Box>
        </Modal>

        <Button onClick={handleOpen} variant="contained">
          Add Item
        </Button>

        <Box border={'3px solid white'}>
          <Box width="800px" height="100px" bgcolor={'gray'}>
            <Typography
              variant={'h2'}
              color={'black'}
              textAlign={'center'}
            >
              Pantry Items
            </Typography>
          </Box>
          <Stack width="800px" height="400px" spacing={1} overflow={'auto'}>
            {searchResults.map((item) => (
              <Box
                key={item.name}
                width="100%"
                height="200px"
                display={'flex'}
                justifyContent={'space-between'}
                alignItems={'center'}
                bgcolor={'blue'}
                padding={'5px'}
              >
                <Typography
                  variant={'h3'}
                  color={'black'}
                  textAlign={'center'}
                  fontWeight={'bold'}
                >
                  {item.name}
                </Typography>

                <Typography
                  variant={'h3'}
                  color={'black'}
                  textAlign={'center'}
                  fontWeight={'bold'}
                  marginRight={'12px'}
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
  );
}
