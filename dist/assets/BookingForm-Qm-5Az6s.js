import{r as f,j as e,a as U}from"./index-CgQQbYZb.js";import{a as R}from"./index-t--hEgTQ.js";import{F as ee,d as ue,e as de}from"./index-gqZQK566.js";import{S as te}from"./react-select.esm-EjturXHE.js";import{u as me}from"./auth-Dh_wwNr8.js";function he({availableDates:u,bookingDate:I,setBookingDate:n}){const[q,y]=f.useState(new Date),w=u.map(i=>new Date(i)).sort((i,c)=>i-c),v=i=>{const c=i.getFullYear(),C=String(i.getMonth()+1).padStart(2,"0"),N=String(i.getDate()).padStart(2,"0");return`${c}-${C}-${N}`},j=q.getFullYear(),d=q.getMonth(),T=[],A=new Date(j,d,1),$=Array.from({length:new Date(j,d+1,0).getDate()},(i,c)=>new Date(j,d,c+1)),O=$.filter(i=>!w.some(c=>v(c)===v(i))),k=(A.getDay()+6)%7;for(let i=0;i<k;i++)T.push(e.jsx("div",{"aria-hidden":"true",role:"presentation",tabIndex:"-1"},`empty-${i}`));$.forEach(i=>{const c=v(i),C=O.some(L=>v(L)===c);let N="calendar_day";C&&(N+=" no-interval"),I.includes(c)&&(N+=" selected"),T.push(e.jsx("div",{className:N,onClick:C?void 0:()=>n(L=>L===c?"":c),role:"gridcell","aria-label":`${i.toLocaleString("ru-RU",{weekday:"long"})}, ${i.getDate()} ${i.toLocaleString("ru-RU",{month:"long"})} ${i.getFullYear()}`,tabIndex:C?"-1":"0",children:i.getDate()},`day-${c}`))});const F=(7-new Date(j,d+1,0).getDay())%7;for(let i=0;i<F;i++)T.push(e.jsx("div",{"aria-hidden":"true",role:"presentation",tabIndex:"-1"},`empty-after-${i}`));const W=["Январь","Февраль","Март","Апрель","Май","Июнь","Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь"];return e.jsx("div",{role:"application",children:e.jsxs("div",{className:"calendar_container",children:[e.jsxs("div",{className:"calendar_header",children:[e.jsx("button",{onClick:()=>y(new Date(j,d-1,1)),type:"button",className:"arrow-button","aria-label":"Предыдущий месяц",children:e.jsx(ee,{icon:ue})}),e.jsx("span",{children:`${W[d]} ${j}`}),e.jsx("button",{onClick:()=>y(new Date(j,d+1,1)),type:"button",className:"arrow-button","aria-label":"Следующий месяц",children:e.jsx(ee,{icon:de})})]}),e.jsxs("div",{className:"calendar",role:"grid",children:[["Пн","Вт","Ср","Чт","Пт","Сб","Вс"].map((i,c)=>e.jsx("div",{style:{textAlign:"center",fontWeight:"bold"},role:"columnheader",children:i},c)),T]})]})})}function pe({additionalServices:u,setAdditionalServices:I,discounts:n,start:q,end:y,bookingDate:w,additionalServicesQuantity:v,setAdditionalServicesQuantity:j}){var z,F,W,i,c,C,N,L;const d={broom:150,towel:200,hat:50,sheets:200},T={broom:4,towel:8,hat:8,sheets:2},A=()=>{const l={...v};n.forEach(m=>{if(m.discount_type!=="free"||!O(m))return;(m.applicable_services.length>0?m.applicable_services:Object.keys(m.free_service_counts)).forEach(h=>{var Y,P;const g=((Y=u[h])==null?void 0:Y.quantity)||0,E=parseInt(((P=m.min_service_counts)==null?void 0:P[h])||"0",10);if(g>=E){const V=Math.floor(g/E)*m.free_service_counts[h];l[h]=(l[h]||0)+V}})}),console.log("Обновленные бесплатные услуги:",l),j(l)};f.useEffect(()=>{A()},[w,u]);const $=(l,m)=>{m=Math.max(0,Math.min(m,T[l])),I(h=>{const g={...h,[l]:{selected:m>0,quantity:m}};return console.log("Обновленные услуги:",g),g});const D=S();j(h=>{const g={...h,[l]:D};return console.log("Обновленные бесплатные услуги:",g),g})},O=l=>{if(!q||!y||!w)return!1;const m=new Date(`${w}T${q}`),D=new Date(`${w}T${y}`),h=new Date(`${w}T${l.valid_from}`),g=new Date(`${w}T${l.valid_till}`),E=l.time_discount_type==="time_limit"?m>=h&&D<=g&&l.applicable_days.includes(w):m>=h&&D<=g;return console.log("Проверяем скидку:",l,"Применима:",E),E},S=(l,m,D)=>0,k=l=>{var D;const m=n==null?void 0:n.find(h=>{var g;return((g=h.applicable_services)==null?void 0:g.includes(l))&&h.discount_type==="discount_service"&&O(h)});return((D=m==null?void 0:m.service_prices)==null?void 0:D[l])??d[l]},_=(l,m)=>{var h;const D=((h=u[l])==null?void 0:h.quantity)||0;$(l,D+m)};return e.jsxs("div",{className:"additional-services",children:[e.jsxs("label",{className:"service-item",children:[e.jsxs("span",{children:["Дубовые веники (+",k("broom")," ₽)"]}),"                  ",v.broom>0&&e.jsxs("span",{className:"free-gift",children:[" (+",v.broom," в подарок)"]}),e.jsxs("div",{className:"service-quantity",children:[e.jsx("button",{onClick:()=>_("broom",-1),type:"button",children:"-"}),e.jsx("input",{type:"number",min:"0",max:T.broom,value:((z=u.broom)==null?void 0:z.quantity)||0,onChange:l=>$("broom",parseInt(l.target.value)),className:"service-quantity-input"}),e.jsx("button",{onClick:()=>_("broom",1),type:"button",children:"+"})]})]}),e.jsx("br",{}),e.jsxs("label",{className:"service-item",children:[e.jsxs("span",{children:["Полотенце (+",k("towel")," ₽)"]}),e.jsxs("div",{className:"service-quantity",children:[e.jsx("button",{onClick:()=>_("towel",-1),type:"button",children:"-"}),e.jsx("input",{type:"number",min:"0",max:T.towel,value:((F=u.towel)==null?void 0:F.quantity)||0,onChange:l=>$("towel",parseInt(l.target.value)),className:"service-quantity-input"}),e.jsx("button",{onClick:()=>_("towel",1),type:"button",children:"+"})]})]}),e.jsx("br",{}),e.jsxs("label",{className:"service-item",children:[e.jsxs("span",{children:["Шапка (+",k("hat")," ₽)"]}),e.jsxs("div",{className:"service-quantity",children:[e.jsx("button",{onClick:()=>_("hat",-1),type:"button",children:"-"}),e.jsx("input",{type:"number",min:"0",max:T.hat,value:((W=u.hat)==null?void 0:W.quantity)||0,onChange:l=>$("hat",parseInt(l.target.value)),className:"service-quantity-input"}),e.jsx("button",{onClick:()=>_("hat",1),type:"button",children:"+"})]}),S("hat",((i=u.hat)==null?void 0:i.quantity)||0)>0&&e.jsxs("span",{className:"free-gift",children:[" (+",S("hat",((c=u.hat)==null?void 0:c.quantity)||0)," в подарок)"]})]}),e.jsx("br",{}),e.jsxs("label",{className:"service-item",children:[e.jsxs("span",{children:["Простынь (+",k("sheets")," ₽)"]}),e.jsxs("div",{className:"service-quantity",children:[e.jsx("button",{onClick:()=>_("sheets",-1),type:"button",children:"-"}),e.jsx("input",{type:"number",min:"0",max:T.sheets,value:((C=u.sheets)==null?void 0:C.quantity)||0,onChange:l=>$("sheets",parseInt(l.target.value)),className:"service-quantity-input"}),e.jsx("button",{onClick:()=>_("sheets",1),type:"button",children:"+"})]}),S("sheets",((N=u.sheets)==null?void 0:N.quantity)||0)>0&&e.jsxs("span",{className:"free-gift",children:[" (+",S("sheets",((L=u.sheets)==null?void 0:L.quantity)||0)," в подарок)"]})]})]})}function xe({userId:u,token:I}){const[n,q]=f.useState(""),[y,w]=f.useState(""),[v,j]=f.useState(""),[d,T]=f.useState({broom:{selected:!1,quantity:0},towel:{selected:!1,quantity:0},hat:{selected:!1,quantity:0},sheets:{selected:!1,quantity:0}}),[A,$]=f.useState({broom:0,towel:0,hat:0,sheets:0}),[O,S]=f.useState(0),[k,_]=f.useState([]),[z,F]=f.useState([]),[W,i]=f.useState([]),[c,C]=f.useState([]),[N,L]=f.useState(""),[l,m]=f.useState(""),{message:D,showMessage:h,error:g,showError:E,isVisible:Y}=me(),P=new Date;new Date(P).setDate(P.getDate()+21);const G=f.useCallback(async()=>{try{const t=U.get("token");let a=(await R.get(`/api/userAccount/${u}/availableIntervals/${n}`,{headers:{Authorization:`Bearer ${t}`}})).data.availableStartTimes;_(a),h("")}catch(t){console.error("Ошибка при получении интервалов:",t),E("Произошла ошибка при получении доступных интервалов.")}},[u,n]),se=f.useCallback(async(t,s)=>{try{const a=U.get("token"),o=await R.get(`/api/userAccount/${u}/availableEndTimes/${n}/${t}/${s}`,{headers:{Authorization:`Bearer ${a}`}});if(o.data.availableEndTimes.length===0)_(b=>b.filter(p=>p.startTime!==t)),h("Нет доступных конечных времен для выбранного времени начала."),F([]);else{const b=o.data.availableEndTimes.map(p=>p.endTime);b.includes("24:00")||b.push("24:00"),F(b),h("")}}catch(a){console.error("Ошибка при получении конечных времен:",a),E("Произошла ошибка при получении доступных конечных времен.")}},[u,n]);f.useEffect(()=>{n&&G()},[n,G]),f.useEffect(()=>{let t=c.filter(s=>s.time_discount_type==="time_limit"&&s.applicable_days.includes(n));L(t.length>0?t:[])},[n,c]),f.useEffect(()=>{let t=c.filter(s=>s.time_discount_type==="no_time_limit");m(t.length>0?t:[])},[n,c]);const ae=t=>{const s=t.value;w(s);const a=k.find(o=>o.startTime===s);a?(se(s,a.intervalId),v&&H(s,v)):F([])},H=async(t,s)=>{const a=t?new Date(`${n}T${t}`):null,o=s?new Date(`${n}T${s}`):null,b=a&&o?await ie(a,o):0,p=oe(a,o);S(b+p)};f.useEffect(()=>{H(y,v)},[d,n]);const ne=async()=>{try{const t=await R.get(`/api/userAccount/${u}/discounts`,{headers:{Authorization:`Bearer ${I}`}});C(t.data)}catch(t){return console.error("Ошибка при получении скидок:",t),[]}};f.useEffect(()=>{ne()},[u]),f.useEffect(()=>{w(""),j("")},[n]);const ie=async(t,s)=>{console.log("--- CALCULATION START ---"),console.log("Original start:",t),console.log("Original end:",s);const a=new Date(t),o=new Date(s);if(o.getHours()===0&&o.getMinutes()===0&&(o.setFullYear(a.getFullYear(),a.getMonth(),a.getDate()),o.setHours(24,0,0,0)),console.log("Adjusted start:",a),console.log("Adjusted end:",o),o<=a)return console.log("Invalid time interval"),0;const p=(o.getTime()-a.getTime())/(1e3*60*60);let r=0;const x=a.getHours(),M=a.getDay();return M===0||M===6?r=p<=2?3800:Math.round(1600*p):x>=8&&x<16?r=p<=2?3500:Math.round(1500*p):(x>=16||x<8)&&(r=p<=2?3800:Math.round(1600*p)),c.forEach(Z=>{if(Q(Z,a,o)){const ce=le(r,Z);r-=ce}}),Math.max(0,Math.round(r))},Q=(t,s,a)=>{const o=new Date(`${n}T${t.valid_from}`),b=new Date(`${n}T${t.valid_till}`),p=s||new Date(`${n}T08:00`),r=a||new Date(`${n}T23:59`);return t.time_discount_type==="time_limit"?p>=o&&r<=b&&t.applicable_days.includes(n):p>=o&&r<=b},le=(t,s)=>s.discount_type==="discount"?t*(s.discount_percentage/100):0,oe=(t,s)=>{var b,p;let a=0;const o={broom:150,towel:200,hat:50,sheets:200};for(let r in d)if(((b=d[r])==null?void 0:b.quantity)>0){const x=c.find(B=>Array.isArray(B.applicable_services)&&B.applicable_services.includes(r)&&B.discount_type==="discount_service"&&Q(B,t,s));console.log(`Проверяем скидку на ${r}:`,x);const M=((p=x==null?void 0:x.service_prices)==null?void 0:p[r])??o[r];a+=d[r].quantity*M}return a},J=t=>t?z.filter(s=>s>t).sort().map(s=>({value:s,label:s})):[],K=k.map(t=>({value:t.startTime,label:t.startTime})),re=async t=>{t.preventDefault();const s=U.get("token"),a=y?new Date(`${n}T${y}`):null,o=v?new Date(`${n}T${v}`):null,b=c.filter(r=>Q(r,a,o)?r.discount_type==="discount_service"?r.applicable_services.some(x=>{var M;return((M=d[x])==null?void 0:M.quantity)>0}):!0:!1);console.log("Примененные скидки:",b);const p=b.length>0?b[0].id:null;try{if(!n||!y||!v)throw new Error("Пожалуйста, выберите дату и время.");const r=await R.post(`/api/userAccount/${u}/book`,{booking_date:n,start_time:y,end_time:v,price:O,broom:d.broom.selected,broom_quantity:d.broom.quantity+(A.broom||0),towel:d.towel.selected,towel_quantity:d.towel.quantity+(A.towel||0),hat:d.hat.selected,hat_quantity:d.hat.quantity+(A.hat||0),sheets:d.sheets.selected,sheets_quantity:d.sheets.quantity+(A.sheets||0),discount_id:p},{headers:{Authorization:`Bearer ${s}`}});h("Бронь успешно оформлена!"),(await X(u,[n],s)).includes(n)&&i(M=>M.filter(B=>B!==n)),q(""),w(""),j(""),S(0),T({broom:{selected:!1,quantity:0},towel:{selected:!1,quantity:0},hat:{selected:!1,quantity:0},sheets:{selected:!1,quantity:0}}),$({broom:0,towel:0,hat:0,sheets:0})}catch(r){let x=r.message;r.response?x=r.response.data.error||r.response.data.message||"Произошла непредвиденная ошибка.":r.request&&(x="Ошибка сети. Пожалуйста, проверьте Ваше соединение."),E(x),console.error("Ошибка при бронировании:",r)}},X=async(t,s,a)=>{const o=[];for(const b of s)try{(await R.get(`/api/userAccount/${t}/availableIntervals/${b}`,{headers:{Authorization:`Bearer ${a}`}})).data.availableStartTimes.length===0&&o.push(b)}catch(p){console.error(`Ошибка при проверке доступности для даты ${b}:`,p)}return o};return f.useEffect(()=>{const t=[];for(let s=0;s<62;s++){const a=new Date(P);a.setDate(P.getDate()+s),t.push(a.toISOString().slice(0,10))}X(u,t,I).then(s=>{const a=t.filter(o=>!s.includes(o));i(a),a.length>0&&q(a[0])})},[u,I]),e.jsx("div",{className:"account-content",children:e.jsxs("div",{className:"account-form",children:[(D||g)&&e.jsx("p",{className:`auth-message ${g?"error":"success"} ${Y?"fade-in":"fade-out"}`,role:"alert",children:D||g}),e.jsxs("form",{onSubmit:re,className:"booking-wrapper",children:[e.jsx("div",{className:"calendar-container",children:e.jsx(he,{availableDates:W,setAvailableDates:i,setBookingDate:q,bookingDate:n})}),e.jsxs("div",{className:"time-controls",children:[l.length>0&&e.jsx("div",{className:"discounts",children:e.jsx("div",{className:"discount permanent-discount",children:l.map((t,s)=>e.jsxs("div",{children:["Постоянная акция: ",t.description]},s))})}),N.length>0&&e.jsx("div",{className:"discounts",children:e.jsx("div",{className:"discount temporary-discount",children:N.map((t,s)=>e.jsxs("div",{children:["Временная акция: ",t.description]},s))})}),e.jsxs("label",{className:"form-label",children:["Время начала:",e.jsx(te,{value:y?{value:y,label:y}:null,onChange:ae,options:K,classNamePrefix:"time-select",placeholder:"Выберите время",isDisabled:K.length===0})]}),e.jsx("br",{}),e.jsxs("label",{className:"form-label",children:["Время окончания:",e.jsx(te,{value:v?{value:v,label:v}:null,onChange:t=>{j(t.value),H(y,t.value)},options:J(y),classNamePrefix:"time-select",placeholder:"Выберите время",isDisabled:!y||J(y).length===0})]})]}),e.jsx("div",{className:"additional-services-container",children:e.jsx(pe,{additionalServices:d,setAdditionalServices:T,discounts:c,start:y,end:v,bookingDate:n,additionalServicesQuantity:A,setAdditionalServicesQuantity:$})}),e.jsx("div",{className:"price-container",children:e.jsxs("div",{className:"price-content",children:[e.jsxs("p",{className:"price",children:["Итоговая стоимость: ",O," ₽"]}),e.jsx("button",{type:"submit",className:"form-button",disabled:!n||!y||!v,children:"Забронировать"})]})})]})]})})}export{xe as default};
