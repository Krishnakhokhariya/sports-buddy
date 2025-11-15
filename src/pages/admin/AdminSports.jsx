import React, {useEffect, useState} from 'react'
import { getAllSports, createSport, updateSport, deleteSport } from '../../utils/sports'
import { addLog } from '../../utils/logs'
import {useAuth} from '../../contexts/AuthContext'

function AdminSports() {
    const {profile} = useAuth();
    const [sports, setSports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [name, setName] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [editingName, setEditingName] = useState("");

    useEffect(() => {
        async function load() {
            setLoading(true);

            try{
                const all = await getAllSports();
                setSports(all);
            }catch(err){
                console.error("Failed to load sports", err);
            }finally{
                setLoading(false);
            }
        }
        load();
    }, []);

    async function handleAdd(e){
        e.preventDefault();
        if(!name.trim()) return;
        try{
            const id = await createSport({name: name.trim()});
            await addLog({
                actorUid: profile.uid,
                action: "create_sport",
                targetCollection: "sports",
                targetId: id,
                details: {name},
            });
            setSports(await getAllSports());
            setName("");
        } catch(err){
            console.error("Add sports failed", err);
            alert('Failed to add sport');
        }
    }

    function startEdit(s){
        setEditingId(s.id);
        setEditingName(s.name);
    }

    async function handleUpdate(e){
        e.preventDefault();
        if(!editingName.trim()) return;
        try{
            await updateSport(editingId, {name: editingName.trim() });
            await addLog({
                actorUid: profile.uid,
                action: 'update_sport',
                targetCollection: 'sports',
                targetId: editingId,
                details: {name: editingName},
            });
            setSports(await getAllSports());
            setEditingId(null);
            setEditingName("");
        }
        catch(err){
            console.error('Update failed', err);
            alert('Failed to update sport');
        }
    }

    async function handleDelete(id, nameToDelete) {
        if(!window.confirm(`Delete sports '${nameToDelete}'? `)) return;
        try{
            await deleteSport(id);
            await addLog({
               actorUid: profile.uid,
                action: 'delete_sport',
                targetCollection: 'sports',
                targetId: id,
                details: {name: nameToDelete},
            });
            setSports(await getAllSports());
        }catch(err){
             console.error("Failed to delete sports", err);
             alert('Failed to delete sport');
        }
    }

  return (
    <div className='p-6 bg-white rounded-lg shadow'>
      <h2 className='text-xl font-semibold mb-4'>Manage Sports</h2>

      <form className='mb-4 flex gap-2' onSubmit={editingId ? handleUpdate : handleAdd}>
        <input value={editingId? editingName: name}
        onChange={(e) => editingId? setEditingName(e.target.value) : setName(e.target.value)}
        placeholder='Sport Name (e.g. Cricket)'
        className='flex-1 border p-2 rounded' 
        />

        <button type='submit'
        className='bg-primary text-white px-4 rounded'>
            {editingId? "Update" : "Add"}
        </button>

        {editingId && (
            <button type='button' 
            onClick={()=>{setEditingId(null); setEditingName(null);}}
            className='px-3'>
                Cancel
            </button>)}
      </form>

      {loading?(
        <p>Loading...</p>
      ): sports.length === 0?(
        <p className='text-gray-500'>No sports Added</p>
      ):(
        <ul className='space-y-2'>
            {sports.map((s) =>(
                <li key={s.id} className='flex justify-between items-center border rounded p-2'>
                    <div>{s.name}</div>
                    <div className='flex gap-2'>
                        <button onClick={() => startEdit(s)} className='text-sm text-blue-600'>Edit</button>
                        <button onClick={() => handleDelete(s.id, s.name)} className='text-sm text-red-600'>Delete</button>
                    </div>
                </li>
            ))}
        </ul>
      )}
    </div>
  )
}

export default AdminSports
