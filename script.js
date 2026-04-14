// 🚀 FINAL PRODUCTION VERSION: Deploy + Comments + Admin Panel

import React, { useState, useEffect } from "react"; import { Card, CardContent } from "@/components/ui/card"; import { Button } from "@/components/ui/button"; import { initializeApp } from "firebase/app"; import { getFirestore, collection, addDoc, getDocs, updateDoc, doc, deleteDoc, } from "firebase/firestore"; import { getStorage, ref, uploadBytes, getDownloadURL, } from "firebase/storage"; import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, } from "firebase/auth";

// 🔥 Firebase Config const firebaseConfig = { apiKey: "YOUR_API_KEY", authDomain: "YOUR_PROJECT.firebaseapp.com", projectId: "YOUR_PROJECT_ID", storageBucket: "YOUR_PROJECT.appspot.com", messagingSenderId: "XXXX", appId: "XXXX", };

const app = initializeApp(firebaseConfig); const db = getFirestore(app); const storage = getStorage(app); const auth = getAuth(app); const provider = new GoogleAuthProvider();

const ADMIN_EMAIL = "your_email@gmail.com"; // 👈 change this

const categories = ["Class 9","Class 10","Class 11","Class 12","CUET","NDA","NEET","JEE"];

export default function App() { const [notes, setNotes] = useState([]); const [file, setFile] = useState(null); const [title, setTitle] = useState(""); const [category, setCategory] = useState(categories[0]); const [subject, setSubject] = useState(""); const [type, setType] = useState("Notes"); const [user, setUser] = useState(null); const [search, setSearch] = useState(""); const [commentText, setCommentText] = useState("");

const isAdmin = user?.email === ADMIN_EMAIL;

const login = async () => { const result = await signInWithPopup(auth, provider); setUser(result.user); };

const logout = () => { signOut(auth); setUser(null); };

const fetchNotes = async () => { const snapshot = await getDocs(collection(db, "notes")); const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })); setNotes(data); };

useEffect(() => { fetchNotes(); }, []);

const handleUpload = async () => { if (!user) return alert("Login required"); if (!file || !title || !subject) return alert("Fill all fields");

const storageRef = ref(storage, `notes/${Date.now()}_${file.name}`);
await uploadBytes(storageRef, file);
const fileURL = await getDownloadURL(storageRef);

await addDoc(collection(db, "notes"), {
  title, category, subject, type, fileURL,
  likes: 0,
  user: user.displayName,
  comments: []
});

fetchNotes();

};

const likeNote = async (id, likes) => { await updateDoc(doc(db, "notes", id), { likes: likes + 1 }); fetchNotes(); };

const addComment = async (note) => { if (!user) return alert("Login required"); if (!commentText) return;

const updatedComments = [
  ...(note.comments || []),
  { text: commentText, user: user.displayName }
];

await updateDoc(doc(db, "notes", note.id), {
  comments: updatedComments
});

setCommentText("");
fetchNotes();

};

const deleteNote = async (id) => { if (!isAdmin) return; await deleteDoc(doc(db, "notes", id)); fetchNotes(); };

return ( <div className="p-6 grid gap-6"> <h1 className="text-3xl font-bold">🌐 Notes Platform</h1>

<div>
    {user ? (
      <div>
        {user.displayName}
        <Button onClick={logout}>Logout</Button>
      </div>
    ) : (
      <Button onClick={login}>Login</Button>
    )}
  </div>

  <input placeholder="Search..." onChange={(e) => setSearch(e.target.value)} />

  <Card>
    <CardContent>
      <input placeholder="Title" onChange={(e) => setTitle(e.target.value)} />
      <input placeholder="Subject" onChange={(e) => setSubject(e.target.value)} />
      <select onChange={(e) => setCategory(e.target.value)}>
        {categories.map(c => <option key={c}>{c}</option>)}
      </select>
      <select onChange={(e) => setType(e.target.value)}>
        <option>Notes</option>
        <option>PYQ</option>
      </select>
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <Button onClick={handleUpload}>Upload</Button>
    </CardContent>
  </Card>

  {notes.filter(n => n.title.toLowerCase().includes(search.toLowerCase())).map(note => (
    <Card key={note.id}>
      <CardContent>
        <h3>{note.title}</h3>
        <p>{note.subject}</p>
        <p>❤️ {note.likes}</p>

        <a href={note.fileURL} target="_blank">View</a>
        <a href={note.fileURL} download>Download</a>

        <Button onClick={() => likeNote(note.id, note.likes)}>Like</Button>

        {isAdmin && (
          <Button onClick={() => deleteNote(note.id)}>Delete</Button>
        )}

        {/* Comments */}
        <div>
          <h4>Comments</h4>
          {(note.comments || []).map((c, i) => (
            <p key={i}><b>{c.user}:</b> {c.text}</p>
          ))}

          <input
            placeholder="Add comment"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
          />
          <Button onClick={() => addComment(note)}>Post</Button>
        </div>

      </CardContent>
    </Card>
  ))}
</div>

); }

/* 🌍 DEPLOY STEPS (VERY IMPORTANT):

1. Install Vercel: npm install -g vercel


2. Build project: npm run build


3. Deploy: vercel


4. Follow instructions → your site goes LIVE 🌐



🔥 FEATURES DONE:

Login system

Upload notes

Download/view

Likes

Comments

Admin delete control


🎯 YOU NOW HAVE A REAL WEBSITE STARTUP BASE */
