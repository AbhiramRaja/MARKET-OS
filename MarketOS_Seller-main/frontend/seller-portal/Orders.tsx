import React,{useEffect,useState} from 'react'
import { gql, useSubscription } from '@apollo/client'
import { listOrders, updateOrderStatus } from './api'

const SUB=gql`subscription OnChange($sellerId:String!){
  onOrderStatusChange(sellerId:$sellerId){ orderId sellerId status updatedAt }
}`

export default function Orders(){
  const [orders,setOrders]=useState<any[]>([])
  const [feed,setFeed]=useState<any[]>([])
  const sellerId = import.meta.env.VITE_SELLER_ID as string

  useEffect(()=>{listOrders().then(setOrders)},[])
  useSubscription(SUB,{
    variables:{sellerId},
    onData:({data})=>{
      const ev=data.data?.onOrderStatusChange
      if(ev) setFeed(p=>[ev,...p].slice(0,50))
    }
  })

  const next=(s:string)=> s==='PLACED'?'CONFIRMED': s==='CONFIRMED'?'OUT_FOR_DELIVERY':'DELIVERED'

  async function bump(o:any){
    const u=await updateOrderStatus(o.orderId,next(o.status))
    setOrders(ps=>ps.map(x=>x.orderId===o.orderId?u:x))
  }

  return <div className="row">
    <div className="card" style={{flex:2}}>
      <h2>Orders</h2>
      <ul>{orders.map(o=>
        <li key={o.orderId} className="row" style={{justifyContent:'space-between'}}>
          <span>{o.orderId} — <b>{o.status}</b></span>
          <button onClick={()=>bump(o)}>Advance Status</button>
        </li>
      )}</ul>
    </div>
    <div className="card" style={{flex:1}}>
      <h2>Live Updates</h2>
      <ul>{feed.map((e,i)=>
        <li key={e.orderId+e.updatedAt+i}>{e.orderId} → <b>{e.status}</b></li>
      )}</ul>
    </div>
  </div>
}
