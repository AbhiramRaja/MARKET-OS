import React,{useEffect,useState} from 'react'
import { listProducts, createProduct, deleteProduct, getUploadUrl } from './api'
export default function Products(){
  const [items,setItems]=useState<any[]>([])
  const [name,setName]=useState(''); const [price,setPrice]=useState<number>(999)
  const [file,setFile]=useState<File|null>(null)
  const sellerId = import.meta.env.VITE_SELLER_ID as string
  const refresh=()=>listProducts().then(setItems); useEffect(()=>{refresh()},[])
  async function handleCreate(){
    let images:string[]=[]
    if(file){
      const key=`${sellerId}/products/${name.replace(/\s+/g,'_')}-${crypto.randomUUID()}${file.name.toLowerCase().endsWith('.png')?'.png':'.jpeg'}`
      const {uploadUrl}=await getUploadUrl(key,file.type||'image/jpeg')
      await fetch(uploadUrl,{method:'PUT',headers:{'Content-Type':file.type||'image/jpeg'},body:file})
      images=[key]
    }
    await createProduct({name,price:Number(price),images}); setName('');setPrice(999);setFile(null); refresh()
  }
  return <div className="card">
    <h2>Products</h2>
    <div className="row">
      <label>Name</label><input value={name} onChange={e=>setName(e.target.value)} />
      <label>Price</label><input type="number" value={price} onChange={e=>setPrice(+e.target.value)} style={{width:120}} />
      <input type="file" accept="image/*" onChange={e=>setFile(e.target.files?.[0]||null)} />
      <button onClick={handleCreate} disabled={!name}>Create</button>
    </div>
    <ul>{items.map(p=><li key={p.productId} className="row" style={{justifyContent:'space-between'}}>
      <span>{p.name} — ₹{p.price}</span>
      <button onClick={()=>deleteProduct(p.productId).then(refresh)}>Delete</button>
    </li>)}</ul>
  </div>
}
