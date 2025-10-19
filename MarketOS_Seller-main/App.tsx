import React,{useState} from 'react'
import Products from './Products'
import Orders from './Orders'
export default function App(){
  const [tab,setTab]=useState<'orders'|'products'>('orders')
  return <div className="container">
    <h1>Seller Portal</h1>
    <div className="row">
      <button onClick={()=>setTab('orders')} disabled={tab==='orders'}>Orders</button>
      <button onClick={()=>setTab('products')} disabled={tab==='products'}>Products</button>
      <span className="badge">Seller: {import.meta.env.VITE_SELLER_ID}</span>
    </div>
    {tab==='orders'?<Orders/>:<Products/>}
  </div>
}
