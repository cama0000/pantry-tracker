// 'use client'

// import { Box, Button, Modal, Stack, TextField, Typography } from "@mui/material";
// import {firestore} from '@/firebase'
// import {collection, getDocs, getDoc, setDoc, doc, query, deleteDoc} from 'firebase/firestore'
// import { useEffect, useState } from "react";
// import AddCircleIcon from '@mui/icons-material/AddCircle';
// import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';

// const style = {
//   position: 'absolute',
//   top: '50%',
//   left: '50%',
//   transform: 'translate(-50%, -50%)',
//   width: 400,
//   bgcolor: 'background.paper',
//   color: 'black',
//   border: '2px solid #000',
//   boxShadow: 24,
//   p: 4
// }


// export default function Home() {
//   const [pantry, setPantry] = useState([])
//   const [open, setOpen] = useState(false)
//   const [itemName, setItemName] = useState('')
//   const [searchItem, setSearchItem] = useState('')

//   const updatePantry = async () => {
//     const snapshot = query(collection(firestore, 'pantry'))
//     const docs = await getDocs(snapshot)
//     const pantryList = []

//     docs.forEach((doc) => {
//       console.log("DOC: " + doc)

//       // each pantry item has a name and the rest of the data from that specific doc
//       pantryList.push({
//         name: doc.id,
//         ...doc.data()
//       })
//     })
//     setPantry(pantryList)
//   }

//   const addItem = async (itemName) =>{
//     console.log("Adding item: " + itemName)
//     const docRef = doc(firestore, 'pantry', itemName)
//     const docSnap = await getDoc(docRef)

//     if(docSnap.exists()){
//       const {count} = docSnap.data()
//       await setDoc(docRef, {count: count + 1})
//     }
//     else{
//       await setDoc(docRef, {count: 1})
//     }

//     await updatePantry()
//   }

//   const removeItem = async (item) =>{
//     // docRef is a reference to the specific document within the 'pantry' collection identified by item.
//     const docRef = doc(firestore, 'pantry', item)
//     // docSnap is the snapshot of the document fetched from Firestore using the reference docRef.
//     const docSnap = await getDoc(docRef)

//     if(docSnap.exists()){
//       const {count} = docSnap.data()
//       if(count === 1){
//         await deleteDoc(docRef)
//       }
//       else{
//         await setDoc(docRef, {count: count - 1})
//       }
//     }

//     await updatePantry()
//   }

//   const handleSearch = async () => {

//     if(searchItem != ''){
//       try {
//         console.log("Snapshot size ")

//         const snapshot = await getDocs(collection(firestore, 'pantry'));
//         const searchList = [];

  
//         snapshot.forEach((doc) => {
//           console.log("DOC: " + doc.id)
//           if(doc.id.toLowerCase().includes(searchItem.toLowerCase())){
//             searchList.push({
//               name: doc.id,
//               ...doc.data()
//             });

//           }
//         });
  
//         setPantry(searchList);
//       } catch (error) {
//         console.error("Error fetching search results: ", error);
//       }
//     }
//     else{
//       updatePantry();
//     }
//   }

//   const handleOpen = () => {
//     setOpen(true)
//   }

//   const handleClose = () => {
//     setOpen(false)
//   }

//   useEffect(() => {
//     updatePantry()
//   }, [])

//   // searches immediately after putting name
//   useEffect(()=>{
//     handleSearch();
//   }, [searchItem]);

//   return (

//     <Box
//       width="100vw"
//       height="100vw"
//       display={'flex'}
//       justifyContent={'center'}
//       flexDirection={'column'}
//       alignItems={'center'}
//       gap={2}
//     >
//         <Modal
//           open={open}
//           onClose={handleClose}
//           aria-labelledby="modal-modal-title"
//           aria-describedby="modal-modal-description"
//         >
//           <Box sx={style}>
//             <Stack direction={'column'}>
//               <Typography id="modal-modal-title" variant="h6" component="h2">
//                 Add Item
//               </Typography>

//               <Typography id="modal-modal-description" sx={{ mt: 2 }}>
//                 Enter an item to add to your pantry.
//               </Typography>

//               <TextField 
//               label="Item Name"
//                 variant="outlined"
//                 value={itemName}
//                 onChange={(e) => setItemName(e.target.value)}>
                
//               </TextField>

//               <Button 
//               onClick={() => {
//                   addItem(itemName)
//                   setItemName('')
//                   handleClose()
//                 }}
//                 variant="contained" style={{marginTop: '12px'}}>
//                   Add
//               </Button>
//             </Stack>
//           </Box>
//         </Modal>





//       <Button onClick={handleOpen} variant="contained">
//         Add Item
//       </Button>

//       <TextField
//                 autoFocus
//                 margin="dense"
//                 id="search"
//                 name="search"
//                 label="Search"
//                 type="search"
//                 width="100%"
//                 variant="outlined"
//                 value={searchItem}
//                 onChange={(e) => {
//                   console.log("E TARGETT VALUE: " + e.target.value)
//                   setSearchItem(e.target.value);
//                   // handleSearch();
//                 }}
//                 InputProps={{
//                   style: { color: 'white' }, // Text color inside the input
//                 }}
//                 InputLabelProps={{
//                   style: { color: 'white' } // Label color
//                 }}
//               />
//       <Box border={'3px solid white'}>
//       <Box
//       width="800px"
//       height="100px"
//       bgcolor={'gray'}
//       >
//           <Typography
//               variant={'h2'}
//               color={'black'}
//               textAlign={'center'}
//             >
//               Pantry Items
//             </Typography>

//       </Box>
//       <Stack width="800px" height="400px" spacing={1} overflow={'auto'}>
//         {pantry.map((item) =>(
//           <Box
//             key={item.name}
//             width="100%"
//             height="200px"
//             display={'flex'}
//             justifyContent={'space-between'}
//             alignItems={'center'}
//             bgcolor={'blue'}
//             padding={'5px'}
//           >
//               <Typography
//                 variant={'h3'}
//                 color={'black'}
//                 textAlign={'center'}
//                 fontWeight={'bold'}
//               >
//               {item.name}
//               </Typography>

//               <Typography
//                 variant={'h3'}
//                 color={'black'}
//                 textAlign={'center'}
//                 fontWeight={'bold'}
//                 marginRight = {'12px'}
//               >
//               {item.count}
//               </Typography>

//               <Stack direction={'row'} spacing={2}>
//               <AddCircleIcon
//         onClick={() => addItem(item.name)}
//         className="text-blue-500 cursor-pointer transition-colors duration-300 hover:text-green-500"
//       />
//       <RemoveCircleIcon
//         onClick={() => removeItem(item.name)}
//         className="text-red-500 cursor-pointer transition-colors duration-300 hover:text-yellow-500"
//       />
//               </Stack>

              
            
//           </Box>
//         ))}
//       </Stack>
//       </Box>
//     </Box>
//   );
// }




'use client'

import { Box, Button, Modal, Stack, TextField, Typography } from "@mui/material";
import { firestore } from '@/firebase';
import { collection, getDocs, getDoc, setDoc, doc, query, deleteDoc } from 'firebase/firestore';
import { useEffect, useState } from "react";
import AddCircleIcon from '@mui/icons-material/AddCircle';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';

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
}

export default function Home() {
  const [pantry, setPantry] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState('');
  const [searchItem, setSearchItem] = useState('');

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
  }

  const addItem = async (itemName) => {
    const docRef = doc(firestore, 'pantry', itemName);
    const docSnap = await getDoc(docRef);

    if(docSnap.exists()) {
      const { count } = docSnap.data();
      await setDoc(docRef, { count: count + 1 });

      // Update local state for the item
      setPantry(prevPantry => prevPantry.map(item =>
        item.name === itemName ? { ...item, count: count + 1 } : item
      ));
      setSearchResults(prevSearchResults => prevSearchResults.map(item =>
        item.name === itemName ? { ...item, count: count + 1 } : item
      ));
    } else {
      await setDoc(docRef, { count: 1 });
      // Add new item to local state
      setPantry(prevPantry => [...prevPantry, { name: itemName, count: 1 }]);
      setSearchResults(prevSearchResults => [...prevSearchResults, { name: itemName, count: 1 }]);
    }
  }

  const removeItem = async (itemName) => {
    const docRef = doc(firestore, 'pantry', itemName);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const { count } = docSnap.data();
      
      if (count === 1) {
        await deleteDoc(docRef);
        // Remove item from local state
        setPantry(prevPantry => prevPantry.filter(item => item.name !== itemName));
        setSearchResults(prevSearchResults => prevSearchResults.filter(item => item.name !== itemName));
      } else {
        await setDoc(docRef, { count: count - 1 });
        // Update local state for the item
        setPantry(prevPantry => prevPantry.map(item =>
          item.name === itemName ? { ...item, count: count - 1 } : item
        ));
        setSearchResults(prevSearchResults => prevSearchResults.map(item =>
          item.name === itemName ? { ...item, count: count - 1 } : item
        ));
      }
    }
  }

  const handleSearch = async () => {
    if (searchItem !== '') {
      const searchResults = pantry.filter(item =>
        item.name.toLowerCase().includes(searchItem.toLowerCase())
      );
      setSearchResults(searchResults);
    } else {
      setSearchResults(pantry);
    }
  }

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  useEffect(() => {
    updatePantry();
  }, []);

  useEffect(() => {
    handleSearch();
  }, [searchItem]);

  return (
    <Box
      width="100vw"
      height="100vw"
      display={'flex'}
      justifyContent={'center'}
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
  );
}
