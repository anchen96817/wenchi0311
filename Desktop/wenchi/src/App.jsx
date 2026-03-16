import { useState } from "react";
const MENU = {
  沙拉堡: {
    emoji: "🥗", accent: "#4ecdc4",
    groups: [
      { label: "1個 $30 ／ 4個 $100", unitPrice: 30, bulkQty: 4, bulkPrice: 100,
        items: [
          { id:1, emoji:"🥬", name:"酸菜沙拉堡", desc:"清爽酸菜，開胃爽口" },
          { id:2, emoji:"🌽", name:"火腿玉米沙拉堡", desc:"火腿搭配香甜玉米" },
          { id:3, emoji:"🥔", name:"馬鈴薯沙拉堡", desc:"綿密馬鈴薯沙拉" },
          { id:4, emoji:"🍗", name:"燻雞沙拉堡", desc:"香燻雞肉，風味十足" },
          { id:5, emoji:"🐟", name:"鮪魚玉米沙拉堡", desc:"鮪魚與甜玉米的絕配" },
        ],
      },
      { label: "1個 $40 ／ 3個 $100", unitPrice: 40, bulkQty: 3, bulkPrice: 100,
        items: [
          { id:6, emoji:"🧀", name:"起司火腿沙拉堡", desc:"濃郁起司加火腿" },
          { id:7, emoji:"🍖", name:"無骨雞排沙拉堡", desc:"酥炸無骨雞排" },
          { id:8, emoji:"🌭", name:"大熱狗沙拉堡", desc:"Q彈大熱狗，飽足感滿分" },
          { id:9, emoji:"🥪", name:"營養三明治沙拉堡", desc:"多層夾餡，營養豐富" },
          { id:10, emoji:"🍓", name:"草莓卡士達沙拉堡", desc:"甜蜜草莓搭卡士達醬" },
        ],
      },
    ],
  },
  包餡: {
    emoji: "🍞", accent: "#ff6b9d",
    groups: [
      { label: "1個 $20 ／ 3個 $50", unitPrice: 20, bulkQty: 3, bulkPrice: 50,
        items: [
          { id:11, emoji:"🧈", name:"奶油", desc:"香濃奶油內餡" },
          { id:12, emoji:"🫘", name:"紅豆", desc:"綿密紅豆泥" },
          { id:13, emoji:"🍫", name:"巧克力", desc:"濃郁可可內餡" },
          { id:14, emoji:"🍛", name:"咖哩", desc:"微辣咖哩，香氣撲鼻" },
          { id:15, emoji:"🟣", name:"芋頭", desc:"香甜芋泥內餡" },
          { id:16, emoji:"🥜", name:"花生", desc:"香脆花生糖粉" },
          { id:17, emoji:"🍡", name:"麻糬", desc:"Q彈麻糬內餡" },
          { id:18, emoji:"🧀", name:"起司", desc:"牽絲起司，濃郁鹹香" },
          { id:19, emoji:"🌭", name:"小熱狗", desc:"小熱狗藏在麵包裡" },
        ],
      },
    ],
  },
  甜甜圈: {
    emoji: "🍩", accent: "#f7c948",
    groups: [
      { label: "1個 $15 ／ 4個 $50", unitPrice: 15, bulkQty: 4, bulkPrice: 50,
        items: [
          { id:20, emoji:"🍩", name:"甜甜圈", desc:"外酥內軟，現炸熱呼呼" },
        ],
      },
    ],
  },
};
const allItems = Object.entries(MENU).flatMap(([cat,{accent,groups}]) =>
  groups.flatMap(g => g.items.map(i =>
    ({...i, category:cat, accent, unitPrice:g.unitPrice, bulkQty:g.bulkQty, bulkPrice:g.bulkPrice})
  ))
);
const SCHEDULE = [
  { day:"一", location:null,   closed:true  },
  { day:"二", location:"南崁", closed:false },
  { day:"三", location:"林口", closed:false },
  { day:"四", location:"大溪", closed:false },
  { day:"五", location:"南崁", closed:false },
  { day:"六", location:"竹東", closed:false },
  { day:"日", location:"林口", closed:false },
];
function calcGroup(qty,unitPrice,bulkQty,bulkPrice){
  return Math.floor(qty/bulkQty)*bulkPrice+(qty%bulkQty)*unitPrice;
}
function computeTotal(cart){
  const groups={};
  cart.forEach(item=>{
    const key=`${item.category}-${item.unitPrice}`;
    if(!groups[key]) groups[key]={qty:0,unitPrice:item.unitPrice,bulkQty:item.bulkQty,bulkPrice:item.bulkPrice};
    groups[key].qty+=item.qty;
  });
  return Object.values(groups).reduce((sum,g)=>sum+calcGroup(g.qty,g.unitPrice,g.bulkQty,g.bulkPrice),0);
}
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwPn4iaTXl5JgPaMCcEWopEj_J7DjUQsD3SjuAgdGyzGa5V1lK9_wcJHv3B3QMYdBA/exec";
function OrderPage({onBack}){
  const [cart,setCart]=useState([]);
  const [showCart,setShowCart]=useState(false);
  const [activeTab,setTab]=useState("全部");
  const [ordering,setOrdering]=useState(false);
  const cartCount=cart.reduce((s,i)=>s+i.qty,0);
  const cartTotal=computeTotal(cart);
  const addToCart=(item)=>{
    setCart(prev=>{
      const ex=prev.find(c=>c.id===item.id);
      if(ex) return prev.map(c=>c.id===item.id?{...c,qty:c.qty+1}:c);
      return [...prev,{...item,qty:1}];
    });
  };
  const changeQty=(id,d)=>setCart(prev=>prev.map(c=>c.id===id?{...c,qty:c.qty+d}:c).filter(c=>c.qty>0));
  const handleOrder=async()=>{
    if(cart.length===0||ordering) return;
    const itemLines=cart.map(i=>`  ${i.name} x${i.qty}  ($${i.unitPrice*i.qty})`).join("\n");
    if(!window.confirm(`確認送出訂單？\n\n${itemLines}\n\n合計：$${cartTotal}`)) return;
    setOrdering(true);
    try{
      const res=await fetch(APPS_SCRIPT_URL,{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({items:cart.map(i=>`${i.name} x${i.qty}`).join("、"),total:cartTotal,pickup:"現場取餐"})
      });
      const result=await res.json();
      if(result.success){setCart([]);setShowCart(false);alert(`✅ 訂單 ${result.orderId} 已送出！\n合計 $${cartTotal}\n請現場告知攤位人員訂單號 😊`);}
      else alert("❌ 送出失敗，請重試");
    }catch(err){alert("❌ 網路錯誤，請確認連線後重試");}
    finally{setOrdering(false);}
  };
  const CATS=["全部","沙拉堡","包餡","甜甜圈"];
  const visCats=activeTab==="全部"?["沙拉堡","包餡","甜甜圈"]:[activeTab];
  return(
    <div style={{minHeight:"100vh",background:"#0c0c18",fontFamily:"'Noto Sans TC',sans-serif",color:"#fff"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;700;900&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        .card{background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.07);border-radius:14px;padding:13px 14px;display:flex;align-items:center;gap:12px;cursor:pointer;transition:transform 0.18s;}
        .card:hover{transform:translateY(-3px);}
        .tab{background:transparent;border:1.5px solid rgba(255,255,255,0.13);border-radius:999px;color:rgba(255,255,255,0.55);padding:8px 22px;cursor:pointer;font-size:14px;font-family:inherit;font-weight:700;transition:all 0.18s;}
        .float{position:fixed;bottom:24px;right:24px;border:none;border-radius:999px;background:linear-gradient(135deg,#f7c948,#ff6b35);color:#000;font-weight:900;font-size:15px;padding:13px 22px;cursor:pointer;font-family:inherit;box-shadow:0 4px 24px rgba(247,201,72,0.45);z-index:100;}
        .overlay{position:fixed;inset:0;background:rgba(0,0,0,0.75);z-index:200;display:flex;align-items:flex-end;justify-content:center;}
        .sheet{background:#15151f;border-radius:24px 24px 0 0;padding:28px;width:100%;max-width:500px;max-height:75vh;overflow-y:auto;border-top:2px solid rgba(255,255,255,0.08);}
      `}</style>
      <div style={{position:"sticky",top:0,zIndex:50,background:"rgba(12,12,24,0.95)",backdropFilter:"blur(12px)",borderBottom:"1px solid rgba(255,255,255,0.07)",padding:"14px 20px",display:"flex",alignItems:"center",gap:14}}>
        <button onClick={onBack} style={{background:"rgba(255,255,255,0.08)",border:"none",borderRadius:999,color:"#fff",padding:"7px 16px",cursor:"pointer",fontFamily:"inherit",fontSize:13,fontWeight:700}}>← 回首頁</button>
        <span style={{fontWeight:900,fontSize:17}}>🛒 選購商品</span>
      </div>
      <div style={{display:"flex",justifyContent:"center",gap:10,padding:"20px 20px 4px",flexWrap:"wrap"}}>
        {CATS.map(cat=>{
          const acc=cat==="沙拉堡"?"#4ecdc4":cat==="包餡"?"#ff6b9d":cat==="甜甜圈"?"#f7c948":"#fff";
          const on=activeTab===cat;
          return(<button key={cat} className="tab" onClick={()=>setTab(cat)} style={{background:on?acc:"transparent",borderColor:on?acc:"rgba(255,255,255,0.13)",color:on?"#000":"rgba(255,255,255,0.55)"}}>
            {cat==="沙拉堡"?"🥗 ":cat==="包餡"?"🍞 ":cat==="甜甜圈"?"🍩 ":"✦ "}{cat}
          </button>);
        })}
      </div>
      <main style={{maxWidth:960,margin:"0 auto",padding:"20px 18px 120px"}}>
        {visCats.map(catName=>{
          const catData=MENU[catName];
          return(<section key={catName} style={{marginBottom:40}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:18}}>
              <span style={{fontSize:11,fontWeight:900,letterSpacing:3,color:catData.accent,background:`${catData.accent}18`,border:`1px solid ${catData.accent}44`,borderRadius:999,padding:"4px 14px"}}>{catData.emoji} {catName}</span>
              <div style={{flex:1,height:1,background:`linear-gradient(90deg,${catData.accent}44,transparent)`}}/>
            </div>
            {catData.groups.map((group,gi)=>(
              <div key={gi} style={{marginBottom:24}}>
                <div style={{fontSize:12,color:catData.accent,fontWeight:700,marginBottom:10}}>
                  <span style={{background:`${catData.accent}22`,border:`1px solid ${catData.accent}44`,borderRadius:6,padding:"2px 10px"}}>{group.label}（同價位可混搭）</span>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:12}}>
                  {group.items.map(item=>{
                    const full=allItems.find(a=>a.id===item.id);
                    const inCart=cart.find(c=>c.id===item.id);
                    return(<div key={item.id} className="card" style={{boxShadow:inCart?`0 0 0 1.5px ${catData.accent}66`:"none"}} onClick={()=>addToCart(full)}>
                      <div style={{fontSize:36,width:52,height:52,display:"flex",alignItems:"center",justifyContent:"center",background:`${catData.accent}15`,borderRadius:11,flexShrink:0}}>{item.emoji}</div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontWeight:700,fontSize:15,marginBottom:3}}>{item.name}</div>
                        <div style={{fontSize:11,color:"rgba(255,255,255,0.38)",marginBottom:8}}>{item.desc}</div>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                          <span style={{fontWeight:900,fontSize:18,color:catData.accent}}>${group.unitPrice}</span>
                          {inCart?(
                            <div style={{display:"flex",alignItems:"center",gap:6}} onClick={e=>e.stopPropagation()}>
                              <button onClick={()=>changeQty(item.id,-1)} style={{background:"rgba(255,255,255,0.1)",border:"none",borderRadius:999,width:26,height:26,color:"#fff",fontSize:16,cursor:"pointer"}}>−</button>
                              <span style={{fontWeight:900,minWidth:18,textAlign:"center"}}>{inCart.qty}</span>
                              <button onClick={()=>changeQty(item.id,1)} style={{background:`${catData.accent}33`,border:"none",borderRadius:999,width:26,height:26,color:"#fff",fontSize:16,cursor:"pointer"}}>＋</button>
                            </div>
                          ):(
                            <button style={{background:catData.accent,border:"none",borderRadius:999,width:30,height:30,fontSize:18,cursor:"pointer",color:"#000",fontWeight:900}}>＋</button>
                          )}
                        </div>
                      </div>
                    </div>);
                  })}
                </div>
              </div>
            ))}
          </section>);
        })}
      </main>
      {cartCount>0&&(<button className="float" onClick={()=>setShowCart(true)}>🛒 購物車 ({cartCount}) · ${cartTotal}</button>)}
      {showCart&&(
        <div className="overlay" onClick={()=>setShowCart(false)}>
          <div className="sheet" onClick={e=>e.stopPropagation()}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
              <h2 style={{fontSize:18,fontWeight:900}}>🛒 點單明細</h2>
              <button onClick={()=>setShowCart(false)} style={{background:"none",border:"none",color:"#fff",fontSize:22,cursor:"pointer"}}>×</button>
            </div>
            {["沙拉堡-30","沙拉堡-40","包餡-20","甜甜圈-15"].map(key=>{
              const [cat,price]=key.split("-");
              const items=cart.filter(c=>c.category===cat&&c.unitPrice===Number(price));
              if(!items.length) return null;
              const totalQty=items.reduce((s,i)=>s+i.qty,0);
              const s=items[0];
              const saved=totalQty*s.unitPrice-calcGroup(totalQty,s.unitPrice,s.bulkQty,s.bulkPrice);
              const acc=MENU[cat].accent;
              return(<div key={key} style={{marginBottom:16}}>
                <div style={{fontSize:11,color:acc,fontWeight:700,marginBottom:8,opacity:0.7}}>{MENU[cat].emoji} {cat}（${s.unitPrice} 系列）</div>
                {items.map(item=>(<div key={item.id} style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                  <span style={{fontSize:20}}>{item.emoji}</span>
                  <span style={{flex:1,fontSize:14}}>{item.name}</span>
                  <div style={{display:"flex",alignItems:"center",gap:6}}>
                    <button onClick={()=>changeQty(item.id,-1)} style={{background:"rgba(255,255,255,0.1)",border:"none",borderRadius:999,width:24,height:24,color:"#fff",cursor:"pointer",fontSize:14}}>−</button>
                    <span style={{fontWeight:900,minWidth:16,textAlign:"center"}}>{item.qty}</span>
                    <button onClick={()=>changeQty(item.id,1)} style={{background:"rgba(255,255,255,0.15)",border:"none",borderRadius:999,width:24,height:24,color:"#fff",cursor:"pointer",fontSize:14}}>＋</button>
                  </div>
                  <span style={{color:acc,fontWeight:900,minWidth:48,textAlign:"right"}}>${item.unitPrice*item.qty}</span>
                </div>))}
                {saved>0&&<div style={{textAlign:"right",fontSize:12,color:"#00e676",fontWeight:700}}>🎉 省 ${saved}</div>}
                <div style={{height:1,background:"rgba(255,255,255,0.07)",margin:"12px 0"}}/>
              </div>);
            })}
            <div style={{display:"flex",justifyContent:"space-between",fontSize:20,fontWeight:900,marginBottom:20}}>
              <span>合計</span><span style={{color:"#f7c948"}}>${cartTotal}</span>
            </div>
            <button onClick={handleOrder} disabled={ordering} style={{width:"100%",background:ordering?"rgba(255,255,255,0.15)":"linear-gradient(135deg,#f7c948,#ff6b35)",border:"none",borderRadius:14,color:ordering?"#999":"#000",fontWeight:900,fontSize:16,padding:14,cursor:ordering?"not-allowed":"pointer",fontFamily:"inherit"}}>
              {ordering?"⏳ 送出中...":"✅ 確認點餐"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
export default function App(){
  const [page,setPage]=useState("home");
  if(page==="order") return <OrderPage onBack={()=>setPage("home")}/>;
  const todayIdx=new Date().getDay();
  const scheduleOrder=[1,2,3,4,5,6,0];
  return(
    <div style={{minHeight:"100vh",background:"#0c0c18",fontFamily:"'Noto Sans TC',sans-serif",color:"#fff",overflowX:"hidden"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;700;900&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        .day-card{border-radius:16px;padding:16px 12px;text-align:center;transition:transform 0.2s;border:1px solid rgba(255,255,255,0.07);}
        .menu-card{background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.07);border-radius:14px;padding:20px 22px;}
        .order-btn{background:linear-gradient(135deg,#f7c948,#ff6b35);border:none;border-radius:16px;color:#000;font-weight:900;font-size:18px;padding:18px 48px;cursor:pointer;font-family:inherit;box-shadow:0 4px 32px rgba(247,201,72,0.4);transition:transform 0.2s;letter-spacing:1px;}
        .order-btn:hover{transform:scale(1.05);}
        .notice-box{background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);border-radius:16px;padding:22px 24px;}
      `}</style>
      <div style={{position:"fixed",inset:0,pointerEvents:"none"}}>
        {[["10%","-80px","#4ecdc4"],["75%","20%","#ff6b9d"],["0%","55%","#f7c948"]].map(([l,t,c],i)=>(
          <div key={i} style={{position:"absolute",left:l,top:t,width:400,height:400,borderRadius:"50%",background:`radial-gradient(circle,${c}10 0%,transparent 70%)`}}/>
        ))}
      </div>
      <div style={{position:"relative",zIndex:1,maxWidth:800,margin:"0 auto",padding:"0 20px 80px"}}>
        <header style={{textAlign:"center",padding:"52px 0 40px"}}>
          <div style={{fontSize:18,letterSpacing:10,opacity:0.3,marginBottom:20}}>🍩 🥪 🥗 🍩 🥪 🥗 🍩</div>
          <div style={{display:"inline-block",border:"2px solid rgba(255,255,255,0.12)",borderRadius:22,padding:"22px 56px",boxShadow:"0 0 70px rgba(247,201,72,0.1)"}}>
            <div style={{fontSize:11,letterSpacing:5,color:"rgba(255,255,255,0.3)",marginBottom:8}}>手工現做 · 每日新鮮</div>
            <h1 style={{fontSize:"clamp(60px,12vw,100px)",fontWeight:900,letterSpacing:10,lineHeight:1,background:"linear-gradient(135deg,#f7c948 0%,#ff6b9d 55%,#4ecdc4 100%)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>溫記</h1>
            <div style={{display:"flex",justifyContent:"center",gap:10,flexWrap:"wrap",marginTop:12}}>
              {["🍩 甜甜圈","🥪 營養三明治","🥗 各式沙拉堡"].map(t=>(
                <span key={t} style={{fontSize:12,color:"rgba(255,255,255,0.45)",background:"rgba(255,255,255,0.06)",padding:"4px 13px",borderRadius:999}}>{t}</span>
              ))}
            </div>
          </div>
        </header>
        <section style={{marginBottom:44}}>
          <SectionTitle emoji="📍" title="每週出攤地點"/>
          <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:8}}>
            {scheduleOrder.map(dayIdx=>{
              const s=SCHEDULE[dayIdx===0?6:dayIdx-1];
              const isToday=dayIdx===todayIdx;
              return(<div key={dayIdx} className="day-card" style={{background:s.closed?"rgba(255,255,255,0.02)":isToday?"rgba(247,201,72,0.12)":"rgba(255,255,255,0.04)",border:isToday?"1.5px solid rgba(247,201,72,0.5)":"1px solid rgba(255,255,255,0.07)",opacity:s.closed?0.45:1}}>
                <div style={{fontSize:12,fontWeight:900,color:isToday?"#f7c948":"rgba(255,255,255,0.5)",marginBottom:8}}>週{s.day}</div>
                {s.closed?<><div style={{fontSize:20}}>😴</div><div style={{fontSize:11,color:"rgba(255,255,255,0.3)",marginTop:6}}>公休</div></>
                :<><div style={{fontSize:11,fontWeight:900,color:isToday?"#f7c948":"#fff",marginTop:4}}>{s.location}</div>{isToday&&<div style={{fontSize:10,color:"#f7c948",marginTop:4,fontWeight:700}}>今日</div>}</>}
              </div>);
            })}
          </div>
        </section>
        <section style={{marginBottom:44}}>
          <SectionTitle emoji="📢" title="營業說明"/>
          <div className="notice-box">
            <p style={{fontSize:14,color:"rgba(255,255,255,0.65)",lineHeight:2}}>
              🗓️ <span style={{color:"#f7c948",fontWeight:700}}>每週一公休</span>，其餘時間正常出攤<br/>
              🌧️ 遇<span style={{color:"#f7c948",fontWeight:700}}>下雨、颱風等不可控天氣因素</span>將視情況調整，敬請見諒<br/>
              📌 不定期有<span style={{color:"#f7c948",fontWeight:700}}>特殊定點檔期</span>，確認後將另行公告<br/>
              🛍️ <span style={{color:"#f7c948",fontWeight:700}}>歡迎來採買！</span>期待與大家相見 ☺️
            </p>
          </div>
        </section>
        <section style={{marginBottom:52}}>
          <SectionTitle emoji="🍽️" title="商品菜單"/>
          <div style={{display:"grid",gap:14}}>
            {[
              {cat:"🥗 沙拉堡",acc:"#4ecdc4",lines:["酸菜・火腿玉米・馬鈴薯・燻雞・鮪魚玉米","→ 1個 $30 ／ 4個 $100（同價位可混搭）","起司火腿・無骨雞排・大熱狗・營養三明治・草莓卡士達","→ 1個 $40 ／ 3個 $100（同價位可混搭）"]},
              {cat:"🍞 包餡",acc:"#ff6b9d",lines:["奶油・紅豆・巧克力・咖哩・芋頭・花生・麻糬・起司・小熱狗","→ 1個 $20 ／ 3個 $50（同口味或混搭皆可）"]},
              {cat:"🍩 甜甜圈",acc:"#f7c948",lines:["現炸甜甜圈","→ 1個 $15 ／ 4個 $50"]},
            ].map(({cat,acc,lines})=>(
              <div key={cat} className="menu-card">
                <div style={{fontWeight:900,fontSize:16,color:acc,marginBottom:10}}>{cat}</div>
                {lines.map((l,i)=>(<p key={i} style={{fontSize:13,color:l.startsWith("→")?acc:"rgba(255,255,255,0.6)",marginBottom:4,fontWeight:l.startsWith("→")?700:400}}>{l}</p>))}
              </div>
            ))}
          </div>
        </section>
        <section style={{textAlign:"center"}}>
          <p style={{fontSize:14,color:"rgba(255,255,255,0.4)",marginBottom:20}}>想提前預訂？點下方進入選購 👇</p>
          <button className="order-btn" onClick={()=>setPage("order")}>🛒 立即訂購</button>
        </section>
      </div>
    </div>
  );
}
function SectionTitle({emoji,title}){
  return(
    <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
      <span style={{fontSize:18}}>{emoji}</span>
      <h2 style={{fontSize:16,fontWeight:900,letterSpacing:2}}>{title}</h2>
      <div style={{flex:1,height:1,background:"linear-gradient(90deg,rgba(255,255,255,0.15),transparent)"}}/>
    </div>
  );
}